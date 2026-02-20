const mongoose =require("mongoose");

const cartItemSchema= new mongoose.Schema({
    menuItem:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Menu",
        required:true
    },
    quantity:{
        type:Number,
        required:true,
        min:1
    },
    notes:{
        type:String,
        trim:true
    }
});
const cartSchema = new mongoose.Schema({
    tableNumber:{
        type:Number,
        required:true,
        unique:true
    },
    items:[cartItemSchema],
    totalPrice:{
        type:Number,
        default:0
    }
},{timestamps:true})

module.exports = mongoose.model("Cart",cartSchema)