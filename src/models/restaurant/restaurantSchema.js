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

const menuUiSchema = new mongoose.Schema({
    primaryColor: { type: String, default: "#e63946" },
    accentColor: { type: String, default: "#f59e0b" },
    backgroundColor: { type: String, default: "#fafafa" },
    heroTagline: { type: String, default: "" },
    showRatings: { type: Boolean, default: true },
    showFavorites: { type: Boolean, default: true },
    cardRadius: { type: Number, default: 16, min: 8, max: 28 }
}, { _id: false });

const billingSettingsSchema = new mongoose.Schema({
    taxPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    otherCharges: {
        type: Number,
        default: 0,
        min: 0
    },
    otherChargesLabel: {
        type: String,
        default: "Other Charges",
        trim: true,
        maxLength: 80
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
    },
    menuUi: {
        type: menuUiSchema,
        default: () => ({})
    },
    billingSettings: {
        type: billingSettingsSchema,
        default: () => ({})
    }
}, { timestamps: true });

module.exports = mongoose.model("Restaurant", restaurantSchema);
