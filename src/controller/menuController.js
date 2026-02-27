const Menu = require("../models/menu/menuSchema");

exports.createMenuItem = async (req, res) => {
    try {
        const restaurantId = req.user.restaurant || req.body.restaurant;
        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant reference is required" });
        }
        const payload = { ...req.body, restaurant: restaurantId };
        const menuItem = await Menu.create(payload);
        res.status(201).json({ success: true, message: "Item Created successfully" })
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
}

exports.getAllMenuItems = async (req, res) => {
    try {
        // Filter by restaurant from query (customer) or user context (admin)
        const restaurantId = req.query.restaurantId || req.user?.restaurant;
        const filter = restaurantId ? { restaurant: restaurantId } : {};

        const items = await Menu.find(filter).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

exports.getMenuItemById = async (req, res) => {
    try {
        const item = await Menu.findById(req.params.id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item Not Found"
            })
        }
        res.status(200).json({
            success: true,
            data: item
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateMenuById = async (req, res) => {
    try {
        const restaurantId = req.user.restaurant || req.body.restaurant;
        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant reference is required" });
        }
        // Ensure user belongs to this restaurant
        const updatedItem = await Menu.findOneAndUpdate(
            { _id: req.params.id, restaurant: restaurantId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                message: "Update Failed or Unauthorized"
            })
        }
        res.status(200).json({
            success: true,
            message: "Updated Item successfully",
            data: updatedItem
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteMenuById = async (req, res) => {
    try {
        const restaurantId = req.user.restaurant || req.query.restaurantId;
        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant reference is required" });
        }
        const deletedItem = await Menu.findOneAndDelete({
            _id: req.params.id,
            restaurant: restaurantId
        });
        if (!deletedItem) {
            return res.status(404).json({
                success: false,
                message: "Item Not Found or Unauthorized"
            })
        }
        res.status(200).json({
            success: true,
            data: deletedItem
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

exports.getItemByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const restaurantId = req.query.restaurantId || req.user?.restaurant;
        const filter = { category };
        if (restaurantId) filter.restaurant = restaurantId;

        const items = await Menu.find(filter);
        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

exports.searchMenuItems = async (req, res) => {
    try {
        const { keyword, restaurantId: queryRid } = req.query;
        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: "Search Keyword Is Required"
            })
        }

        const restaurantId = queryRid || req.user?.restaurant;
        const filter = {
            $or: [
                { name: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { category: { $regex: keyword, $options: "i" } }
            ]
        };
        if (restaurantId) filter.restaurant = restaurantId;

        const items = await Menu.find(filter);
        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}