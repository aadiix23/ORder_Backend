const router = require("express").Router();
const { getRestaurantById, getRestaurantBySlug, getTableStatuses, updateTableStatus } = require("../controller/restaurantController");
const { auth, onlyAdmin } = require("../middlewares/auth");

router.get("/slug/:slug", getRestaurantBySlug);
router.get("/:id/table-status", auth, onlyAdmin, getTableStatuses);
router.put("/:id/table-status", auth, onlyAdmin, updateTableStatus);
router.get("/:id", getRestaurantById);

module.exports = router;
