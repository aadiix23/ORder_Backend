const mongoose = require("mongoose");
const menuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: [2, "Minimum 2 Charachters Is Required"],
        maxLength: [200, "Characters Cant Be More Than 200"]
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minLength: [15, "Minimum 15 Characters are Required"],
        maxLength: [500, "Maximum Characters Are 500"]
    },
    category: {
        type: String,
        required: [true, "Category is required (e.g., Starter, Main Course, Drink)"],
        enum: ["Starter", "Main Course", "Dessert", "Drink", "Sides"],
        index: true
    },
    price: {
        type: Number,
        required: true,
        min: [0, "Price must be positive"]
    },
    image: {
        type: String,
        required: [true, "Image Upload Is Required"]
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    attributes: {
        isVeg: { type: Boolean, default: false },
        isSpicy: { type: Boolean, default: false }
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: [true, "Restaurant reference is required"],
        index: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Menu", menuSchema);