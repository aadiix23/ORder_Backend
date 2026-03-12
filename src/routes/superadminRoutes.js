const router = require("express").Router();
const { auth, onlySuperAdmin } = require("../middlewares/auth");
const {
    getAllRestaurants,
    getRestaurantDetail,
    getAllUsers,
    getAllOrders,
    getStats,
    deleteRestaurant,
    toggleUserStatus,
} = require('../controller/superadminController');

// All routes protected — must be logged in as superadmin
router.use(auth, onlySuperAdmin);

router.get('/stats', getStats);
router.get('/restaurants', getAllRestaurants);
router.get('/restaurant/:id/detail', getRestaurantDetail);
router.get('/users', getAllUsers);
router.get('/orders', getAllOrders);
router.delete('/restaurant/:id', deleteRestaurant);
router.patch('/user/:id/toggle', toggleUserStatus);

module.exports = router;
