const User = require("../models/user/userSchema");
const Restaurant = require("../models/restaurant/restaurantSchema");
const Order = require("../models/order/orderSchema");

// GET /superadmin/orders - all orders across platform (paginated)
exports.getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 50, status, restaurantId } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (restaurantId) filter.restaurant = restaurantId;

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate("restaurant", "name slug")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(Number(limit))
                .select("tableNumber customerName customerPhone totalPrice status paymentMethod restaurant items createdAt"),
            Order.countDocuments(filter)
        ]);

        res.json({ success: true, data: orders, total, page: Number(page), limit: Number(limit) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /superadmin/restaurants - list all restaurants
exports.getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find({}).populate("owner", "email role createdAt").sort({ createdAt: -1 });
        res.json({ success: true, data: restaurants });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /superadmin/restaurant/:id/detail - full restaurant detail
exports.getRestaurantDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const Menu = require("../models/menu/menuSchema");

        const [restaurant, users, menuCount, orderCount, orderStats, recentOrders] = await Promise.all([
            Restaurant.findById(id).populate("owner", "email role createdAt"),
            User.find({ restaurant: id }).select("-password").sort({ createdAt: -1 }),
            Menu.countDocuments({ restaurant: id }),
            Order.countDocuments({ restaurant: id }),
            Order.aggregate([
                { $match: { restaurant: require("mongoose").Types.ObjectId.createFromHexString(id) } },
                { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
            ]),
            Order.find({ restaurant: id })
                .sort({ createdAt: -1 })
                .limit(10)
                .select("tableNumber totalPrice status paymentMethod createdAt items")
        ]);

        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

        res.json({
            success: true,
            data: {
                restaurant,
                users,
                stats: {
                    menuCount,
                    orderCount,
                    totalRevenue: orderStats[0]?.totalRevenue || 0,
                    userCount: users.length
                },
                recentOrders
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// GET /superadmin/users - list all users (admins, chefs)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: "superadmin" } })
            .select("-password")
            .populate("restaurant", "name slug")
            .sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /superadmin/stats - platform-level stats
exports.getStats = async (req, res) => {
    try {
        const [totalRestaurants, totalUsers, totalOrders, revenueAgg] = await Promise.all([
            Restaurant.countDocuments(),
            User.countDocuments({ role: { $ne: "superadmin" } }),
            Order.countDocuments(),
            Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalPrice" } } }])
        ]);

        const totalRevenue = revenueAgg[0]?.total || 0;

        res.json({
            success: true,
            data: { totalRestaurants, totalUsers, totalOrders, totalRevenue }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /superadmin/restaurant/:id - delete a restaurant and its data
exports.deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await Restaurant.findById(id);
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

        // Clean up related users
        await User.deleteMany({ restaurant: id });
        await Restaurant.findByIdAndDelete(id);

        res.json({ success: true, message: "Restaurant and its users deleted." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /superadmin/user/:id/disable - disable a user
exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { disabled } = req.body;
        const user = await User.findByIdAndUpdate(id, { disabled: !!disabled }, { new: true }).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ success: true, data: user, message: `User ${disabled ? "disabled" : "enabled"}.` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
