const Cart = require("../models/cart/cartSchema")
const Menu = require("../models/menu/menuSchema")

//CALCULATE TOTAL PRICE
const calculateTotal = async(items)=>{
    let total =0;
    for(let items of items){
        const menuItem = await Menu.findById(items.menuItem);
        if(menuItem){
            total += menuItem.price*item.quantity;
        }
    }
    return total;
};

exports.addToCart =async(req,res)=>{
    try {
        const {tableNumber,menuItemId,quantity,notes}=req.body;
        if(!tableNumber||!menuItemId||quantity){
            res.status(400).json({
                success:false,
                message:"Table Number,Menu Item ,Quantity Are Required"
            });
        }

        //cart
        let cart = await Cart.findOne({tableNumber});
        if(!cart){
            cart=new Cart({
                tableNumber,
                items:[]
            });
        }
        cart.totalPrice=await calculateTotal(cart.items);
        await cart.save();
        res.status(200).json({
            success:true,
            message:"Item Added To Cart"
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
        
    }
};
exports.getCartByTable = async(req,res)=>{
    try {
        const tableNumber = req.params;
        const cart = await Cart.findOne({tableNumber})
        .populate("items.menuItem");
        if(!cart){
            return res.status(401).json({
                success:false,
                message:"Cart Not Found"
            })
        }
        else{
            res.status(200).json({
                success:true,
                data:cart
            })
        }
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
        
    }
}

//upadte quantity
exports.updateItemByCart = async(req,res)=>{
    try {
        const {tableNumber,menuItemId,quantity}=req.body;
        const cart=await Cart.findOne({tableNumber});

        if(!cart){
            return res.status(404).json({
                success:false,
                message:"Cart Not Found"
            })
        }
        const item = cart.items.find(
            item=>item.menuItem.toString()===menuItemId
        );
        if(!item){
            return res.status(404).json({
                success:false,
                message:"Item Is Not In Cart"
            })
        }
        item.quantity=quantity;
        cart.totalPrice = await calculateTotal(cart.items);
        await cart.save();
        res.status(201).json({
            success:true,
            message:"Cart Updated Sucesssfully",
            data:cart
        })
    } catch (error) {

        res.status(500).josn({
            success:false,
            message:error.message
        })
    }
};