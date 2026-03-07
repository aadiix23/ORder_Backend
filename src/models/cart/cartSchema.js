const mongoose = require("mongoose");

const cartItemAddOnSchema = new mongoose.Schema({
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

const cartItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
        required: true
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
    addOns: {
        type: [cartItemAddOnSchema],
        default: []
    }
});
const cartSchema = new mongoose.Schema({
    tableNumber: {
        type: String,
    },
    items: [cartItemSchema],
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
        index: true
    },
    totalPrice: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

cartSchema.index({ tableNumber: 1, restaurant: 1 }, { unique: true });

module.exports = mongoose.model("Cart", cartSchema)
