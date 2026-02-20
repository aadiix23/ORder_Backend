const Cart = require("../models/cart/cartSchema")
const Menu = require("../models/menu/menuSchema")

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