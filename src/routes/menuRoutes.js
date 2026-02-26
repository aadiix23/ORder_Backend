const express = require("express");
const router = express.Router();
const { createMenuItem, getAllMenuItems, getMenuItemById, updateMenuById, deleteMenuById,getItemByCategory, searchMenuItems } = require("../controller/menuController");
const { auth , onlyAdmin} = require("../middlewares/auth");

router.post("/",auth,onlyAdmin,createMenuItem);
router.get("/:id",getMenuItemById);
router.get("/",getAllMenuItems);
router.get("/search",searchMenuItems);
router.get("/category/:category",getItemByCategory);
router.put("/:id",auth,onlyAdmin,updateMenuById);
router.delete("/:id",auth,onlyAdmin,deleteMenuById);

module.exports = router;