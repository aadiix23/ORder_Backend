const express = require("express");
const cors = require("cors")
const app = express();
const menuRoutes  = require("./routes/menuRoutes")
const cartRoutes = require("./routes/cartRoutes")
const orderRoutes =require("./routes/orderRoutes")
const adminRoutes = require("./routes/adminRoutes");
app.use(cors());
app.use(express.json());

app.use("/admin", adminRoutes);
app.use("/menu",menuRoutes)
app.use("/cart",cartRoutes)
app.use("/order",orderRoutes)

module.exports = app;