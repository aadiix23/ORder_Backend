const mongoose = require("mongoose");
require("dotenv").config();

const RestaurantSchema = new mongoose.Schema({ name: String, slug: String });
const MenuSchema = new mongoose.Schema({ name: String, restaurant: mongoose.Schema.Types.ObjectId, isAvailable: Boolean });

const Restaurant = mongoose.model("Restaurant", RestaurantSchema);
const Menu = mongoose.model("Menu", MenuSchema);

async function check() {
    await mongoose.connect(process.env.MONGO_ID);
    const restaurants = await Restaurant.find();
    console.log("RESTAURANTS:");
    for (const r of restaurants) {
        const items = await Menu.find({ restaurant: r._id });
        console.log(`- ${r.name} (${r._id}) [Slug: ${r.slug}] - ${items.length} items`);
    }
    process.exit();
}

check();
