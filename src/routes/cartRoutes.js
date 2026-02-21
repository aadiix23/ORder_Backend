const express = require("express");
const router = express.Router();

const {
    addToCart,
    getCartByTable,
    updateItemByCart,
    removeItemFromCart,
    clearCart
} = require("../controller/cartController");

router.post("/add", addToCart);
router.get("/:tableNumber", getCartByTable);
router.put("/update", updateItemByCart);
router.delete("/remove", removeItemFromCart);
router.delete("/clear/:tableNumber", clearCart);

module.exports = router;