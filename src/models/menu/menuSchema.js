const mongoose = require("mongoose");

const menuAddOnSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: [1, "Add-on name is required"],
        maxLength: [100, "Add-on name cannot exceed 100 characters"]
    },
    price: {
        type: Number,
        required: true,
        min: [0, "Add-on price must be positive"]
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, { _id: false });

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
        required: [true, "Category is required"],
        trim: true,
        minLength: [2, "Minimum 2 characters are required for category"],
        maxLength: [100, "Category can't be more than 100 characters"],
        index: true
    },
    size: {
        type: String,
        enum: ["Small", "Medium", "Large", "Regular"],
        default: "Regular"
    },
    price: {
        type: Number,
        required: true,
        min: [0, "Price must be positive"]
    },
    mrp: {
        type: Number,
        min: [0, "MRP must be positive"],
        default: null
    },
    image: {
        type: String,
        trim: true
    },
    images: {
        type: [String],
        default: [],
        validate: {
            validator: function (value) {
                return Array.isArray(value) && value.every(url => typeof url === "string" && url.trim().length > 0);
            },
            message: "Images must be a list of valid image URLs"
        }
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    attributes: {
        isVeg: { type: Boolean, default: false },
        isNonVeg: { type: Boolean, default: false },
        isSpicy: { type: Boolean, default: false }
    },
    addOns: {
        type: [menuAddOnSchema],
        default: []
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

menuSchema.pre("validate", function () {
    if (Array.isArray(this.images)) {
        this.images = this.images
            .map(url => (typeof url === "string" ? url.trim() : ""))
            .filter(Boolean);
    } else {
        this.images = [];
    }

    if (this.images.length === 0 && this.image) {
        this.images = [this.image.trim()];
    }

    if (this.images.length > 0) {
        this.image = this.images[0];
    }

    if ((!this.images || this.images.length === 0) && !this.image) {
        this.invalidate("images", "At least one image is required");
    }

    if (this.mrp !== null && this.mrp !== undefined) {
        const mrp = Number(this.mrp);
        const sellingPrice = Number(this.price);
        if (Number.isFinite(mrp) && Number.isFinite(sellingPrice) && mrp < sellingPrice) {
            this.invalidate("mrp", "MRP cannot be less than selling price");
        }
    }

    if (this.attributes?.isVeg && this.attributes?.isNonVeg) {
        this.invalidate("attributes.isNonVeg", "Item cannot be both Veg and Non-Veg");
    }

});

module.exports = mongoose.model("Menu", menuSchema);
