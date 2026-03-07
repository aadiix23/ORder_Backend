const router = require("express").Router();
const { getRestaurantById, getRestaurantBySlug, getTableStatuses, updateTableStatus, updateRestaurantDetails, updateMenuUiConfig } = require("../controller/restaurantController");
const { auth, onlyAdmin } = require("../middlewares/auth");

router.get("/slug/:slug", getRestaurantBySlug);
router.get("/:id/table-status", auth, onlyAdmin, getTableStatuses);
router.put("/:id/table-status", auth, onlyAdmin, updateTableStatus);
router.put("/:id", auth, onlyAdmin, updateRestaurantDetails);
router.put("/:id/menu-ui", auth, onlyAdmin, updateMenuUiConfig);
router.get("/:id", getRestaurantById);

module.exports = router;
