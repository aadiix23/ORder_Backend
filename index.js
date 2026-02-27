require("dotenv").config();
const mongoose = require("mongoose");
const http = require("http");
const {Server} = require("socket.io");
const app = require("./src/app");
const { Socket } = require("dgram");

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_ID)
        console.log("MongoDB Connected")
    } catch (error) {
        console.error("MongoDB Connection Failed")
        process.exit(1);
    }
};

connectDB();

const PORT  =process.env.PORT||5001;
const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin:"*"
    }
})
app.set("io",io);
io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("join_admin", (restaurantId) => {
        // Keep backward compatibility while supporting restaurant-scoped rooms.
        socket.join("admin_room");
        if (restaurantId) {
            socket.join(`admin_room_${restaurantId}`);
            console.log(`Admin joined room for restaurant ${restaurantId}`);
            return;
        }
        console.log("Admin joined global room");
    });

    socket.on("join_table", (payload) => {
        // Supports both legacy signature (tableNumber) and object payload.
        const tableNumber = typeof payload === "object" ? payload?.tableNumber : payload;
        const restaurantId = typeof payload === "object" ? payload?.restaurantId : null;
        if (!tableNumber) return;

        socket.join(`table_${tableNumber}`);
        if (restaurantId) {
            socket.join(`table_${tableNumber}_${restaurantId}`);
        }
        console.log(`Table ${tableNumber} joined${restaurantId ? ` for restaurant ${restaurantId}` : ""}`);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected:", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server is Running On Port ${PORT}`);
});
