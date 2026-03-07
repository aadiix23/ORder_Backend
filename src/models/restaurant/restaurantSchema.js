const mongoose = require("mongoose");

const tableStatusSchema = new mongoose.Schema({
    tableNumber: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Restaurant name is required"],
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    address: {
        type: String,
        required: [true, "Address is required"]
    },
    contactNumber: {
        type: String
    },
    logo: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    tableStatuses: {
        type: [tableStatusSchema],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model("Restaurant", restaurantSchema);
