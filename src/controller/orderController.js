const Cart = require("../models/cart/cartSchema")
const Menu = require("../models/menu/menuSchema")
const Order = require("../models/order/orderSchema")

//place Order

exports.placeOrder = async(req,res)=>{
    try {
        const {tableNumber} = req.body;
        if(!tableNumber){
            return res.status(400).json({
                success:false,
                message:"Table Number Is Required"
            })
        }
        const cart = await Cart.findOne({tableNumber});
        if(!cart || !cart.items.length===0){
            return res.status(400).json({
                success:false,
                message:"Cart Is Empty"
            })
        };

        const orderItems = await Promise.all(
            cart.items.map(async(item)=>{
                const menuItem = await Menu.findById(item.menuItem);
                if(!menuItem){
                    throw new error("Menu Item Is Not Found");
                };
                return{
                    menuItem:item.menuItem,
                    quantity:item.quantity,
                    notes:item.notes,
                    priceAtOrderTime:menuItem.price
                }
            })
        )

        const order = await Order.create({
            tableNumber,
            items:orderItems,
            totalPrice:cart.totalPrice
        });

        //clear cart after order
        cart.items=[];
        cart.totalPrice=0;
        await cart.save();

        res.status(201).json({
            success:true,
            message:"Order Placed Sucessfully",
            data:order
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//All Orders For Me
exports.getAllOrder = async(req,res)=>{
    try {
        const orders = await Order.findOne()
        .populate("items.menuItem")
        .sort({createdAt:-1})

        return res.status(201).json({
            success:true,
            count:orders.length,
            data:orders
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

