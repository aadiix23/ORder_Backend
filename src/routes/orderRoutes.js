const express = require("express");
const router = express.Router();

const {
    placeOrder,
    getAllOrder,
    getOrderByTable,
    updateOrderStatus
} = require("../controller/orderController");

router.post("/place",placeOrder);
router.get("/", getAllOrder);
router.get("/table/:tableNumber", getOrderByTable);
router.put("/:id/status", updateOrderStatus);

module.exports = router;