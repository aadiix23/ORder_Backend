const express = require("express");
const router = express.Router();

const {
    placeOrder,
    getAllOrder,
    getOrderByTable,
    updateOrderStatus
} = require("../controller/orderController");
const { auth, onlyStaff } = require("../middlewares/auth");

router.post("/place",placeOrder);
router.get("/", auth, onlyStaff, getAllOrder);
router.get("/table/:tableNumber", getOrderByTable);
router.put("/:id/status", auth, onlyStaff, updateOrderStatus);

module.exports = router;
