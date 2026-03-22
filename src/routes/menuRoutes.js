const express = require("express");
const router = express.Router();
const { createMenuItem, getAllMenuItems, getMenuItemById, updateMenuById, deleteMenuById, getItemByCategory, searchMenuItems } = require("../controller/menuController");
const { auth, onlyAdmin, optionalAuth } = require("../middlewares/auth");

router.post("/", auth, onlyAdmin, createMenuItem);
router.get("/", optionalAuth, getAllMenuItems);
router.get("/search", optionalAuth, searchMenuItems);
router.get("/category/:category", optionalAuth, getItemByCategory);
router.get("/:id", optionalAuth, getMenuItemById);
router.put("/:id", auth, onlyAdmin, updateMenuById);
router.delete("/:id", auth, onlyAdmin, deleteMenuById);

module.exports = router;
