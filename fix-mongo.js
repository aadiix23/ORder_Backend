const mongoose = require('mongoose');

async function run() {
    try {
        console.log("Connecting...");
        await mongoose.connect('mongodb+srv://QRder:QRder@qrder.npunrly.mongodb.net/qrderDB');
        console.log("Connected.");

        const db = mongoose.connection.db;
        const carts = db.collection('carts');

        try {
            await carts.dropIndex('tableNumber_1');
            console.log("Index dropped successfully.");
        } catch (e) {
            console.log("Error dropping index (may not exist):", e.message);
        }

        console.log("Done.");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

run();
