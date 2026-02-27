const router = require("express").Router();
const { getRestaurantById, getRestaurantBySlug } = require("../controller/restaurantController");

router.get("/:id", getRestaurantById);
router.get("/slug/:slug", getRestaurantBySlug);

module.exports = router;
