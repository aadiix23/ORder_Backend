const mongoose = require("mongoose");
const menuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: [2, "Minimum 5 Charachters Is Required"],
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
        required: [true, "Category is required (e.g., Starter, Main, Drink)"],
        enum: ["Starter", "Main", "Dessert", "Drink", "Sides"], 
        index: true 
    },
    price: {
        type: Number,
        required: true,
        min: [0, "Price must be positive"]
    },
    image: {
        type: String,
        required: [true,"Image Upload Is Required"]
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    attributes:{
        isVeg:{type:Boolean,default:false},
        isSpicy:{type:Boolean,default:false}
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Menu", menuSchema);