require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/user/userSchema");
const Restaurant = require("./src/models/restaurant/restaurantSchema");

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_ID);
        const users = await User.find().populate('restaurant');
        console.log("Users in DB:", users.map(u => ({ email: u.email, restaurant: u.restaurant?.name })));

        const restaurants = await Restaurant.find();
        console.log("Restaurants in DB:", restaurants.map(r => ({ name: r.name, id: r._id })));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
