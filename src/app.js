const express = require("express");
const cors = require("cors")
const app = express();
const menuRoutes  = require("./routes/menuRoutes")
const cartRoutes = require("./routes/cartRoutes")

app.use(cors());
app.use(express.json());
app.use("/menu",menuRoutes)
app.use("/cart",cartRoutes)

module.exports = app;