require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./src/app")

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
app.listen(PORT,()=>{
    console.log(`Server is Running On Port ${PORT}`)
});
