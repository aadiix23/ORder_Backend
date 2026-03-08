const mongoose = require("mongoose");

const orderItemAddOnSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

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
    },
    addOns: {
        type: [orderItemAddOnSchema],
        default: []
    }
});

const orderSchema = new mongoose.Schema({
    tableNumber: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String,
        trim: true
    },
    customerName: {
        type: String,
        trim: true
    },
    items: [orderItemSchema],
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Preparing", "Ready", "Served", "Completed"],
        default: "Pending"
    },
    paymentMethod: {
        type: String,
        enum: ["counter", "online"],
        default: "counter"
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: [true, "Restaurant reference is required"],
        index: true
    }
}, { timestamps: true })

module.exports = mongoose.model("Order", orderSchema);
