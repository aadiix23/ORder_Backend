require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Restaurant = require("./src/models/restaurant/restaurantSchema");
const User = require("./src/models/user/userSchema");
const Menu = require("./src/models/menu/menuSchema");

console.log("Script loaded and starting...");

const seedData = async () => {
    console.log("Starting seed process...");
    try {
        await mongoose.connect(process.env.MONGO_ID);
        console.log("Connected to MongoDB successfully.");

        // Clear existing data for a clean start
        console.log("Cleaning up existing data...");
        await Restaurant.deleteMany({});
        await User.deleteMany({});
        await Menu.deleteMany({});
        console.log("Cleanup complete.");

        console.log("Seeding Restaurants...");

        // 1. Create Restaurants
        const pizzaPalace = await Restaurant.create({
            name: "Pizza Palace",
            slug: "pizza-palace",
            address: "123 Italian Street, Food Valley",
            contactNumber: "1234567890"
        });

        const burgerBoss = await Restaurant.create({
            name: "Burger Boss",
            slug: "burger-boss",
            address: "456 Grill Avenue, Meat Town",
            contactNumber: "0987654321"
        });

        console.log("Seeding Users...");

        // 2. Create Admin Users
        const passwordHash = await bcrypt.hash("admin123", 10);

        const admin1 = await User.create({
            email: "admin@pizzapalace.com",
            password: passwordHash,
            role: "admin",
            restaurant: pizzaPalace._id
        });

        const admin2 = await User.create({
            email: "admin@burgerboss.com",
            password: passwordHash,
            role: "admin",
            restaurant: burgerBoss._id
        });

        console.log("Seeding Menu Items...");

        // 3. Create Menu Items for Pizza Palace
        await Menu.create([
            {
                name: "Margherita Pizza",
                description: "Classic tomato, mozzarella, and fresh basil on our signature crust.",
                category: "Main Course",
                price: 12.99,
                image: "https://res.cloudinary.com/ducecqsco/image/upload/v1/samples/food/pizza",
                restaurant: pizzaPalace._id,
                attributes: { isVeg: true, isSpicy: false }
            },
            {
                name: "Garlic Bread",
                description: "Buttery toasted sourdough with garlic and herbs.",
                category: "Starter",
                price: 5.49,
                image: "https://res.cloudinary.com/ducecqsco/image/upload/v1/samples/food/bread",
                restaurant: pizzaPalace._id,
                attributes: { isVeg: true, isSpicy: false }
            }
        ]);

        // 4. Create Menu Items for Burger Boss
        await Menu.create([
            {
                name: "The Big Boss Burger",
                description: "Double beef patty, cheddar cheese, jalapeños, and secret sauce.",
                category: "Main Course",
                price: 14.99,
                image: "https://res.cloudinary.com/ducecqsco/image/upload/v1/samples/food/burger",
                restaurant: burgerBoss._id,
                attributes: { isVeg: false, isSpicy: true }
            },
            {
                name: "Crispy Fries",
                description: "Golden brown sea salt seasoned fries.",
                category: "Sides",
                price: 3.99,
                image: "https://res.cloudinary.com/ducecqsco/image/upload/v1/samples/food/fries",
                restaurant: burgerBoss._id,
                attributes: { isVeg: true, isSpicy: false }
            }
        ]);

        console.log("\n=================================");
        console.log("SEEDING COMPLETED SUCCESSFULLY!");
        console.log("=================================");
        console.log("\nTest Credentials:");
        console.log("1. Pizza Palace Admin:");
        console.log(`   Email: ${admin1.email}`);
        console.log(`   Restaurant ID: ${pizzaPalace._id}`);
        console.log("2. Burger Boss Admin:");
        console.log(`   Email: ${admin2.email}`);
        console.log(`   Restaurant ID: ${burgerBoss._id}`);
        console.log("\nPassword for all: admin123");
        console.log("=================================\n");

        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedData();
