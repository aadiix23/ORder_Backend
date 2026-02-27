const Cart = require("../models/cart/cartSchema")
const Menu = require("../models/menu/menuSchema")

//CALCULATE TOTAL PRICE
const calculateTotal = async (items) => {
    if (!items.length) return 0;

    const menuIds = items.map(item => item.menuItem);
    const menuItems = await Menu.find({ _id: { $in: menuIds } }).select("_id price");
    const priceById = new Map(menuItems.map(m => [m._id.toString(), m.price]));

    let total = 0;
    for (const item of items) {
        const price = priceById.get(item.menuItem.toString());
        if (price !== undefined) {
            total += price * item.quantity;
        }
    }
    return total;
};

exports.addToCart = async (req, res) => {
    try {
        const { tableNumber, menuItemId, quantity, notes, restaurantId } = req.body;
        const normalizedTableNumber = String(tableNumber || "").trim();
        const parsedQuantity = Number(quantity);

        console.log(`Add to Cart: Table ${normalizedTableNumber}, Item ${menuItemId}, Restaurant ${restaurantId}`);

        if (!normalizedTableNumber || !menuItemId || !restaurantId || !Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Valid tableNumber, menuItemId, quantity (>=1), and restaurantId are required"
            });
        }

        const menuItem = await Menu.findOne({ _id: menuItemId, restaurant: restaurantId, isAvailable: true }).select("_id");
        if (!menuItem) {
            return res.status(400).json({
                success: false,
                message: "Menu item is invalid, unavailable, or does not belong to this restaurant"
            });
        }

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
        const existingItem = cart.items.find(item => item.menuItem.toString() === menuItemId);
        if (existingItem) {
            existingItem.quantity += parsedQuantity;
        } else {
            cart.items.push({ menuItem: menuItemId, quantity: parsedQuantity, notes });
        }

        cart.totalPrice = await calculateTotal(cart.items);
        await cart.save();
        res.status(200).json({
            success: true,
            message: "Item Added To Cart"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })

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
        const { tableNumber, menuItemId, quantity, restaurantId } = req.body;
        const normalizedTableNumber = String(tableNumber || "").trim();
        const parsedQuantity = Number(quantity);

        console.log(`Update Cart: Table ${normalizedTableNumber}, Item ${menuItemId}, Qty ${parsedQuantity}`);

        if (!restaurantId || !normalizedTableNumber || !menuItemId || !Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
            return res.status(400).json({ success: false, message: "Valid table number, restaurant ID, menu item ID, and quantity (>=1) are required" });
        }

        const cart = await Cart.findOne({ tableNumber: normalizedTableNumber, restaurant: restaurantId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart Not Found"
            })
        }
        const item = cart.items.find(
            item => item.menuItem.toString() === menuItemId
        );
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
        const { tableNumber, menuItemId, restaurantId } = req.body;
        const normalizedTableNumber = String(tableNumber || "").trim();

        console.log(`Remove from Cart: Table ${normalizedTableNumber}, Item ${menuItemId}`);

        if (!restaurantId || !normalizedTableNumber || !menuItemId) {
            return res.status(400).json({ success: false, message: "Restaurant ID, table number, and menu item ID are required" });
        }

        const cart = await Cart.findOne({ tableNumber: normalizedTableNumber, restaurant: restaurantId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart Not Found"
            })
        }
        cart.items = cart.items.filter(
            item => item.menuItem.toString() !== menuItemId
        );
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
