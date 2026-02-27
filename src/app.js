const express = require("express");
const cors = require("cors")
const app = express();
const menuRoutes = require("./routes/menuRoutes")
const cartRoutes = require("./routes/cartRoutes")
const orderRoutes = require("./routes/orderRoutes")
const userRoutes = require("./routes/userRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
app.use(cors());
app.use(express.json());

app.use("/user", userRoutes);
app.use("/menu", menuRoutes)
app.use("/cart", cartRoutes)
app.use("/order", orderRoutes)
app.use("/upload", uploadRoutes)
app.use("/restaurant", restaurantRoutes)

module.exports = app;