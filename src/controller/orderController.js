const Cart = require("../models/cart/cartSchema")
const Menu = require("../models/menu/menuSchema")
const Order = require("../models/order/orderSchema")
const Restaurant = require("../models/restaurant/restaurantSchema")
const User = require("../models/user/userSchema")
const { sendOrderPushNotification } = require("../lib/firebaseAdmin")
const jwt = require("jsonwebtoken");

const STAFF_ROLES = new Set(["admin", "chef", "superadmin"]);

const extractBearerToken = (authorizationHeader = "") => {
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) return null;
    return authorizationHeader.split(" ")[1];
};

const verifyStaffAccess = (req, restaurantId) => {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) return { ok: false };

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!STAFF_ROLES.has(decoded.role)) return { ok: false };

        if (decoded.role !== "superadmin" && String(decoded.restaurant) !== String(restaurantId)) {
            return { ok: false };
        }

        return { ok: true, user: decoded };
    } catch (_error) {
        return { ok: false };
    }
};

const buildLookupToken = ({ restaurantId, phone }) => (
    jwt.sign(
        {
            scope: "order_history_lookup",
            restaurant: String(restaurantId),
            phone: String(phone)
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    )
);

const verifyLookupToken = (req, { restaurantId, phone }) => {
    const token = req.headers["x-order-lookup-token"] || req.query.lookupToken;
    if (!token) return { ok: false, message: "Lookup token is required" };

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const validScope = decoded.scope === "order_history_lookup";
        const sameRestaurant = String(decoded.restaurant) === String(restaurantId);
        const samePhone = String(decoded.phone) === String(phone);
        if (!validScope || !sameRestaurant || !samePhone) {
            return { ok: false, message: "Invalid lookup token" };
        }
        return { ok: true };
    } catch (_error) {
        return { ok: false, message: "Invalid or expired lookup token" };
    }
};

const ensureTableIsActive = async (restaurantId, tableNumber) => {
    const restaurant = await Restaurant.findById(restaurantId).select("tableStatuses");
    if (!restaurant) {
        return { ok: false, message: "Restaurant not found" };
    }
    const normalizedTable = String(tableNumber || "").trim();
    const status = (restaurant.tableStatuses || []).find(
        t => String(t.tableNumber || "").trim() === normalizedTable
    );
    if (status && status.isActive === false) {
        return { ok: false, message: `Table ${normalizedTable} is currently OFF. Please contact staff.` };
    }
    return { ok: true };
};

//place Order

exports.placeOrder = async (req, res) => {
    try {
        const { tableNumber, restaurantId, customerPhone, customerName, paymentMethod } = req.body;
        const normalizedTableNumber = String(tableNumber || "").trim();
        const normalizedPaymentMethod = String(paymentMethod || "counter").trim().toLowerCase();
        const normalizedCustomerPhone = String(customerPhone || "").trim();
        const normalizedCustomerName = String(customerName || "").trim();

        console.log(`Place Order: Table ${normalizedTableNumber}, Restaurant ${restaurantId}`);

        if (!normalizedTableNumber || !restaurantId) {
            return res.status(400).json({
                success: false,
                message: "Valid Table Number and Restaurant ID are Required"
            })
        }
        if (!["counter", "online"].includes(normalizedPaymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Payment method must be either counter or online"
            });
        }

        const tableCheck = await ensureTableIsActive(restaurantId, normalizedTableNumber);
        if (!tableCheck.ok) {
            return res.status(403).json({ success: false, message: tableCheck.message });
        }

        const cart = await Cart.findOne({ tableNumber: normalizedTableNumber, restaurant: restaurantId });
        const restaurant = await Restaurant.findById(restaurantId).select("billingSettings");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart Is Empty"
            })
        };

        const orderItems = await Promise.all(
            cart.items.map(async (item) => {
                const menuItem = await Menu.findById(item.menuItem);

                if (!menuItem) {
                    throw new Error("Menu Item Is Not Found");
                };

                const addOns = Array.isArray(item.addOns) ? item.addOns : [];
                const addOnsTotal = addOns.reduce((sum, addOn) => sum + (Number(addOn.price) || 0), 0);

                return {
                    menuItem: item.menuItem,
                    quantity: item.quantity,
                    notes: item.notes,
                    addOns,
                    priceAtOrderTime: (Number(menuItem.price) || 0) + addOnsTotal
                }
            })
        )

        const itemsSubtotal = orderItems.reduce(
            (sum, item) => sum + ((Number(item.priceAtOrderTime) || 0) * (Number(item.quantity) || 0)),
            0
        );
        const taxPercent = Number(restaurant?.billingSettings?.taxPercent) || 0;
        const otherCharges = Number(restaurant?.billingSettings?.otherCharges) || 0;
        const taxAmount = (itemsSubtotal * taxPercent) / 100;
        const totalPrice = Number((itemsSubtotal + taxAmount + otherCharges).toFixed(2));

        const order = await Order.create({
            tableNumber: normalizedTableNumber,
            customerPhone: normalizedCustomerPhone || null,
            customerName: normalizedCustomerName || null,
            paymentMethod: normalizedPaymentMethod,
            restaurant: restaurantId,
            items: orderItems,
            totalPrice
        });

        const lookupToken = normalizedCustomerPhone
            ? buildLookupToken({ restaurantId, phone: normalizedCustomerPhone })
            : null;

        // 🔥 SOCKET CHANGE 1: Emit new order to Specific Restaurant Admin
        const io = req.app.get("io");
        io.to("admin_room").emit("new_order", order);
        io.to(`admin_room_${restaurantId}`).emit("new_order", order);

        const staffUsers = await User.find({
            restaurant: restaurantId,
            role: { $in: ["admin", "chef"] },
            disabled: { $ne: true }
        }).select("fcmTokens");
        const staffTokens = [...new Set(
            staffUsers
                .flatMap(user => Array.isArray(user.fcmTokens) ? user.fcmTokens : [])
                .filter(Boolean)
        )];

        await sendOrderPushNotification({
            tokens: staffTokens,
            title: "New order received",
            body: `Table #${normalizedTableNumber} just placed a new order.`,
            data: {
                type: "new_order",
                orderId: String(order._id),
                restaurantId: String(restaurantId),
                tableNumber: String(normalizedTableNumber)
            }
        });

        //clear cart after order
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();

        res.status(201).json({
            success: true,
            message: "Order Placed Sucessfully",
            data: order,
            lookupToken
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//All Orders For Admin
exports.getAllOrder = async (req, res) => {
    try {
        const restaurantId = req.user.restaurant;
        const orders = await Order.find({ restaurant: restaurantId })
            .populate("items.menuItem")
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//get order by table
exports.getOrderByTable = async (req, res) => {
    try {
        const { tableNumber } = req.params;
        const normalizedTableNumber = String(tableNumber || "").trim();
        const requestedRestaurantId = String(req.query.restaurantId || "").trim();
        const userRole = req.user?.role;

        let restaurantId = req.user?.restaurant;
        if (userRole === "superadmin") {
            restaurantId = requestedRestaurantId;
        }

        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID is required" });
        }

        const orders = await Order.find({ tableNumber: normalizedTableNumber, restaurant: restaurantId })
            .populate("items.menuItem")
            .sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//Update Order Status

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const allowedStatus = ["Pending", "Preparing", "Ready", "Served", "Completed"];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status Is Not Valid"
            })
        }

        const order = await Order.findOne({
            _id: req.params.id,
            restaurant: req.user.restaurant
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order Not Found or Unauthorized"
            })
        }

        order.status = status;
        await order.save();

        const io = req.app.get("io");

        // Emit to both legacy and restaurant-scoped rooms.
        io.to(`table_${order.tableNumber}`)
            .emit("order_status_updated", order);
        io.to(`table_${order.tableNumber}_${order.restaurant}`)
            .emit("order_status_updated", order);

        res.status(200).json({
            success: true,
            message: "Order Status Updated Sucessfully",
            data: order
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

//Get Order History By Phone
exports.getOrderHistoryByPhone = async (req, res) => {
    try {
        const { phone } = req.params;
        const restaurantId = String(req.query.restaurantId || "").trim();
        const normalizedPhone = String(phone || "").trim();

        if (!restaurantId || !normalizedPhone) {
            return res.status(400).json({ success: false, message: "Valid Phone and Restaurant ID are required" });
        }

        const staffAccess = verifyStaffAccess(req, restaurantId);
        if (!staffAccess.ok) {
            const lookupCheck = verifyLookupToken(req, { restaurantId, phone: normalizedPhone });
            if (!lookupCheck.ok) {
                return res.status(401).json({ success: false, message: lookupCheck.message });
            }
        }

        const orders = await Order.find({ customerPhone: normalizedPhone, restaurant: restaurantId })
            .populate("items.menuItem")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: orders
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
