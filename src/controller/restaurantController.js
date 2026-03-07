const Restaurant = require("../models/restaurant/restaurantSchema");

const normalizeTableNumber = (tableNumber) => String(tableNumber || "").trim();

exports.getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Restaurant not found" });
        }
        res.status(200).json({ success: true, data: restaurant });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRestaurantBySlug = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ slug: req.params.slug });
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Restaurant not found" });
        }
        res.status(200).json({ success: true, data: restaurant });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTableStatuses = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await Restaurant.findById(id).select("_id tableStatuses");
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Restaurant not found" });
        }
        if (String(req.user.restaurant) !== String(id)) {
            return res.status(403).json({ success: false, message: "Unauthorized for this restaurant" });
        }
        res.status(200).json({
            success: true,
            data: restaurant.tableStatuses || []
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTableStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { tableNumber, isActive } = req.body;
        const normalizedTable = normalizeTableNumber(tableNumber);

        if (!normalizedTable) {
            return res.status(400).json({ success: false, message: "Valid tableNumber is required" });
        }
        if (typeof isActive !== "boolean") {
            return res.status(400).json({ success: false, message: "isActive must be boolean" });
        }
        if (String(req.user.restaurant) !== String(id)) {
            return res.status(403).json({ success: false, message: "Unauthorized for this restaurant" });
        }

        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Restaurant not found" });
        }

        const existingIndex = (restaurant.tableStatuses || []).findIndex(
            t => normalizeTableNumber(t.tableNumber) === normalizedTable
        );

        if (existingIndex >= 0) {
            restaurant.tableStatuses[existingIndex].isActive = isActive;
            restaurant.tableStatuses[existingIndex].updatedAt = new Date();
        } else {
            restaurant.tableStatuses.push({
                tableNumber: normalizedTable,
                isActive,
                updatedAt: new Date()
            });
        }

        await restaurant.save();

        res.status(200).json({
            success: true,
            message: `Table ${normalizedTable} is now ${isActive ? "ON" : "OFF"}`,
            data: restaurant.tableStatuses || []
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
