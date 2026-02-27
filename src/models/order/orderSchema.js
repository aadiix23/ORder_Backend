const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    notes: {
        type: String,
        trim: true
    },
    priceAtOrderTime: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    tableNumber: {
        type: String,
        required: true
    },
    items: [orderItemSchema],
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Preparing", "Ready", "Served", "Completed"]
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: [true, "Restaurant reference is required"],
        index: true
    }
}, { timestamps: true })

module.exports = mongoose.model("Order", orderSchema);
