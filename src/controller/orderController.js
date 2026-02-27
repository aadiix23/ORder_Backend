const Cart = require("../models/cart/cartSchema")
const Menu = require("../models/menu/menuSchema")
const Order = require("../models/order/orderSchema")

//place Order

exports.placeOrder = async (req, res) => {
    try {
        const { tableNumber: tableStr, restaurantId } = req.body;
        const tableNumber = parseInt(tableStr);

        console.log(`Place Order: Table ${tableNumber}, Restaurant ${restaurantId}`);

        if (isNaN(tableNumber) || !restaurantId) {
            return res.status(400).json({
                success: false,
                message: "Valid Table Number and Restaurant ID are Required"
            })
        }

        const cart = await Cart.findOne({ tableNumber, restaurant: restaurantId });

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

                return {
                    menuItem: item.menuItem,
                    quantity: item.quantity,
                    notes: item.notes,
                    priceAtOrderTime: menuItem.price
                }
            })
        )

        const order = await Order.create({
            tableNumber,
            restaurant: restaurantId,
            items: orderItems,
            totalPrice: cart.totalPrice
        });

        // 🔥 SOCKET CHANGE 1: Emit new order to Specific Restaurant Admin
        const io = req.app.get("io");
        io.to(`admin_room_${restaurantId}`).emit("new_order", order);

        //clear cart after order
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();

        res.status(201).json({
            success: true,
            message: "Order Placed Sucessfully",
            data: order
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
        const { restaurantId } = req.query;

        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant ID is required" });
        }

        const orders = await Order.find({ tableNumber, restaurant: restaurantId })
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

        // Room should be restaurant-scoped
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