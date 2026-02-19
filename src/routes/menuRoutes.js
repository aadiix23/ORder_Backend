const express = require("express");
const router = express.Router();
const { createMenuItem, getAllMenuItems, getMenuItemById, updateMenuById, deleteMenuById,getItemByCategory, searchMenuItems } = require("../controller/menuController");

router.post("/",createMenuItem);
router.get("/",getAllMenuItems);
router.get("/search",searchMenuItems);
router.get("/:id",getMenuItemById);
router.get("/category/:category",getItemByCategory);
router.put("/:id",updateMenuById);
router.delete("/:id",deleteMenuById);

module.exports = router;