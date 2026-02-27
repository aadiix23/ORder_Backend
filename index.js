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

    socket.on("join_admin", () => {
        socket.join("admin_room");
        console.log("Admin joined room");
    });

    socket.on("join_table", (tableNumber) => {
        socket.join(`table_${tableNumber}`);
        console.log(`Table ${tableNumber} joined`);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected:", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server is Running On Port ${PORT}`);
});
