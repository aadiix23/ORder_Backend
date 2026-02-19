const express = require("express");
const cors = require("cors")
const app = express();
const menuRoutes  = require("./routes/menuRoutes")

app.use(cors());
app.use(express.json());
app.use("/menu",menuRoutes)

module.exports = app;