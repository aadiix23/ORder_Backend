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

exports.updateRestaurantDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, contactNumber, logo } = req.body;

        if (String(req.user.restaurant) !== String(id)) {
            return res.status(403).json({ success: false, message: "Unauthorized for this restaurant" });
        }

        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Restaurant not found" });
        }

        if (typeof name === "string") {
            const normalizedName = name.trim();
            if (normalizedName.length < 2) {
                return res.status(400).json({ success: false, message: "Restaurant name must be at least 2 characters" });
            }
            restaurant.name = normalizedName;
        }

        if (typeof address === "string") {
            const normalizedAddress = address.trim();
            if (!normalizedAddress) {
                return res.status(400).json({ success: false, message: "Address is required" });
            }
            restaurant.address = normalizedAddress;
        }

        if (typeof contactNumber === "string") {
            restaurant.contactNumber = contactNumber.trim();
        }

        if (typeof logo === "string") {
            restaurant.logo = logo.trim();
        }

        await restaurant.save();

        res.status(200).json({
            success: true,
            message: "Restaurant details updated successfully",
            data: restaurant
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
