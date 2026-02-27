const mongoose = require("mongoose");

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
    }
});
const cartSchema = new mongoose.Schema({
    tableNumber: {
        type: String,
        required: true
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