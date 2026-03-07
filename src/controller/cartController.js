const Cart = require("../models/cart/cartSchema")
const Menu = require("../models/menu/menuSchema")
const Restaurant = require("../models/restaurant/restaurantSchema")

const normalizeRequestedAddOns = (rawAddOns) => {
    if (!Array.isArray(rawAddOns)) return [];

    const normalized = rawAddOns
        .map((addOn) => {
            if (!addOn || typeof addOn !== "object") return null;
            const name = typeof addOn.name === "string" ? addOn.name.trim() : "";
            return name ? { name } : null;
        })
        .filter(Boolean);

    const uniqueByName = new Map();
    normalized.forEach((addOn) => {
        uniqueByName.set(addOn.name.toLowerCase(), addOn);
    });

    return Array.from(uniqueByName.values());
};

const resolveValidatedAddOns = (menuItem, requestedAddOns) => {
    const availableAddOns = Array.isArray(menuItem.addOns) ? menuItem.addOns : [];
    const availableByName = new Map(
        availableAddOns
            .filter(addOn => addOn?.isAvailable !== false && typeof addOn.name === "string")
            .map(addOn => [addOn.name.trim().toLowerCase(), addOn])
    );

    return requestedAddOns.map((requested) => {
        const matched = availableByName.get(requested.name.toLowerCase());
        if (!matched) {
            throw new Error(`Add-on "${requested.name}" is invalid or unavailable for this item`);
        }
        return {
            name: matched.name,
            price: Number(matched.price) || 0
        };
    });
};

const getCartLineSignature = (menuItemId, addOns = []) => {
    const normalizedAddOns = (Array.isArray(addOns) ? addOns : [])
        .map(addOn => `${addOn.name}:${Number(addOn.price) || 0}`)
        .sort()
        .join("|");
    return `${menuItemId}::${normalizedAddOns}`;
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

//CALCULATE TOTAL PRICE
const calculateTotal = async (items) => {
    if (!items.length) return 0;

    const menuIds = items.map(item => item.menuItem);
    const menuItems = await Menu.find({ _id: { $in: menuIds } }).select("_id price");
    const priceById = new Map(menuItems.map(m => [m._id.toString(), m.price]));

    let total = 0;
    for (const item of items) {
        const basePrice = priceById.get(item.menuItem.toString());
        if (basePrice !== undefined) {
            const addOnsTotal = (item.addOns || []).reduce((sum, addOn) => sum + (Number(addOn.price) || 0), 0);
            total += (basePrice + addOnsTotal) * item.quantity;
        }
    }
    return total;
};

exports.addToCart = async (req, res) => {
    try {
        const { tableNumber, menuItemId, quantity, notes, restaurantId, addOns } = req.body;
        const normalizedTableNumber = String(tableNumber || "").trim();
        const parsedQuantity = Number(quantity);
        const requestedAddOns = normalizeRequestedAddOns(addOns);

        console.log(`Add to Cart: Table ${normalizedTableNumber}, Item ${menuItemId}, Restaurant ${restaurantId}`);

        if (!normalizedTableNumber || !menuItemId || !restaurantId || !Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Valid tableNumber, menuItemId, quantity (>=1), and restaurantId are required"
            });
        }

        const tableCheck = await ensureTableIsActive(restaurantId, normalizedTableNumber);
        if (!tableCheck.ok) {
            return res.status(403).json({ success: false, message: tableCheck.message });
        }

        const menuItem = await Menu.findOne({ _id: menuItemId, restaurant: restaurantId, isAvailable: true }).select("_id addOns");
        if (!menuItem) {
            return res.status(400).json({
                success: false,
                message: "Menu item is invalid, unavailable, or does not belong to this restaurant"
            });
        }
        let validatedAddOns = [];
        try {
            validatedAddOns = resolveValidatedAddOns(menuItem, requestedAddOns);
        } catch (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError.message
            });
        }
        const requestedSignature = getCartLineSignature(menuItemId, validatedAddOns);

        // Find or create cart for this table at this restaurant
        let cart = await Cart.findOne({ tableNumber: normalizedTableNumber, restaurant: restaurantId });
        if (!cart) {
            cart = new Cart({
                tableNumber: normalizedTableNumber,
                restaurant: restaurantId,
                items: []
            });
        }

        // Add item to cart
        const existingItem = cart.items.find(item => (
            getCartLineSignature(item.menuItem.toString(), item.addOns || []) === requestedSignature
        ));
        if (existingItem) {
            existingItem.quantity += parsedQuantity;
        } else {
            cart.items.push({ menuItem: menuItemId, quantity: parsedQuantity, notes, addOns: validatedAddOns });
        }

        cart.totalPrice = await calculateTotal(cart.items);
        await cart.save();
        res.status(200).json({
            success: true,
            message: "Item Added To Cart"
        })
    } catch (error) {
        // Auto-heal legacy database index error
        if (error.code === 11000 && error.message.includes('tableNumber_1')) {
            console.log("Auto-healing: Dropping legacy tableNumber_1 index...");
            const mongoose = require("mongoose");
            try {
                await mongoose.connection.collection('carts').dropIndex('tableNumber_1');
                console.log("Legacy index dropped, retrying add to cart...");
                return exports.addToCart(req, res);
            } catch (dropError) {
                console.error("Failed to auto-heal index", dropError);
            }
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getCartByTable = async (req, res) => {
    try {
        const { tableNumber } = req.params;
        const { restaurantId } = req.query;
        const normalizedTableNumber = String(tableNumber || "").trim();

        console.log(`Get Cart: Table ${normalizedTableNumber}, Restaurant ${restaurantId}`);

        if (!restaurantId || !normalizedTableNumber) {
            return res.status(400).json({ success: false, message: "Restaurant ID and valid table number are required" });
        }

        const cart = await Cart.findOne({ tableNumber: normalizedTableNumber, restaurant: restaurantId })
            .populate("items.menuItem");

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: { tableNumber: normalizedTableNumber, restaurant: restaurantId, items: [], totalPrice: 0 }
            })
        }

        res.status(200).json({
            success: true,
            data: cart
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// update quantity
exports.updateItemByCart = async (req, res) => {
    try {
        const { tableNumber, menuItemId, cartItemId, quantity, restaurantId } = req.body;
        const normalizedTableNumber = String(tableNumber || "").trim();
        const parsedQuantity = Number(quantity);

        console.log(`Update Cart: Table ${normalizedTableNumber}, Item ${menuItemId}, Qty ${parsedQuantity}`);

        if (!restaurantId || !normalizedTableNumber || (!menuItemId && !cartItemId) || !Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
            return res.status(400).json({ success: false, message: "Valid table number, restaurant ID, cart item ID/menu item ID, and quantity (>=1) are required" });
        }

        const cart = await Cart.findOne({ tableNumber: normalizedTableNumber, restaurant: restaurantId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart Not Found"
            })
        }
        const item = cart.items.find(item => (
            cartItemId ? item._id.toString() === String(cartItemId) : item.menuItem.toString() === menuItemId
        ));
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item Is Not In Cart"
            })
        }
        item.quantity = parsedQuantity;
        cart.totalPrice = await calculateTotal(cart.items);
        await cart.save();
        res.status(201).json({
            success: true,
            message: "Cart Updated Sucesssfully",
            data: cart
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

exports.removeItemFromCart = async (req, res) => {
    try {
        const { tableNumber, menuItemId, cartItemId, restaurantId } = req.body;
        const normalizedTableNumber = String(tableNumber || "").trim();

        console.log(`Remove from Cart: Table ${normalizedTableNumber}, Item ${menuItemId}`);

        if (!restaurantId || !normalizedTableNumber || (!menuItemId && !cartItemId)) {
            return res.status(400).json({ success: false, message: "Restaurant ID, table number, and cart item ID/menu item ID are required" });
        }

        const cart = await Cart.findOne({ tableNumber: normalizedTableNumber, restaurant: restaurantId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart Not Found"
            })
        }
        cart.items = cart.items.filter(item => (
            cartItemId ? item._id.toString() !== String(cartItemId) : item.menuItem.toString() !== menuItemId
        ));
        cart.totalPrice = await calculateTotal(cart.items);
        await cart.save();
        res.status(200).json({
            success: true,
            message: "Item Removed From The Cart",
            data: cart
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

exports.clearCart = async (req, res) => {
    try {
        const { tableNumber } = req.params;
        const { restaurantId } = req.query;
        const normalizedTableNumber = String(tableNumber || "").trim();

        if (!restaurantId || !normalizedTableNumber) {
            return res.status(400).json({ success: false, message: "Restaurant ID and table number are required" });
        }

        const cart = await Cart.findOne({ tableNumber: normalizedTableNumber, restaurant: restaurantId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart Not Found"
            });
        }
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart Cleared"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
