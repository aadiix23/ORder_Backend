/**
 * Seed script: creates the superadmin user.
 * Run once with:  node seed-superadmin.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/user/userSchema");

async function seed() {
    const mongoUri = process.env.MONGO_ID;
    const superadminEmail = process.env.SUPERADMIN_EMAIL;
    const superadminPassword = process.env.SUPERADMIN_PASSWORD;

    if (!mongoUri) throw new Error("MONGO_ID is required in environment");
    if (!superadminEmail) throw new Error("SUPERADMIN_EMAIL is required in environment");
    if (!superadminPassword) throw new Error("SUPERADMIN_PASSWORD is required in environment");

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    const existing = await User.findOne({ email: superadminEmail.toLowerCase() });
    if (existing) {
        console.log("Superadmin already exists:", existing.email);
        process.exit(0);    
    }

    const hash = await bcrypt.hash(superadminPassword, 12);
    const superadmin = await User.create({
        email: superadminEmail.toLowerCase(),
        password: hash,
        role: "superadmin",
    });

    console.log("✅ Superadmin created successfully!");
    console.log("   Email:", superadmin.email);
    console.log("   Role:", superadmin.role);
    process.exit(0);
}

seed().catch((err) => {
    console.error("Seed failed:", err.message);
    process.exit(1);
});
