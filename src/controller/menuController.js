const Menu = require("../models/menu/menuSchema");

exports.createMenuItem = async(req,res)=>{
    try {
        const menuItem =await Menu.create(req.body);
        res.status(201).json({success:true, message:"Item Created Sucessfully"})
    } catch (error) {
        res.status(400).json({success:false,message:error.message})
    }
}

exports.getAllMenuItems = async(req,res)=>{
    try {
        const items = await Menu.find().sort({createdAt:-1});
        res.status(201).json({
            success:true,
            count:items.length,
            data:items
        });
    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}

exports.getMenuItemById = async(req,res)=>{
    try {
        const item = await Menu.findById(req.params.id);
        if(!item){
            res.status(404).json({
                success:false,
                message:"Item Not Found"
            })
        }
        else{
            res.status(200).json({
                success:true,
                data:item
            })
        }
    } catch (error) {
        res.status(401).json({
            success:false,
            message:error.message
        })
    }
}

exports.updateMenuById = async(req,res)=>{
    try {
       const updatedItem = await Menu.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
    );
        if(!updatedItem ){
            res.status(404).json({
            success:false,
            message:"Updated Item Failed"
            })

        }
        else{
            res.status(200).json({
                success:true,
                message:"Updated Item Sucessfully",
                data:updatedItem
            })
        }
    } catch (error) {
        res.status(400).json({
            success:false,
            message:"Update Failed",

        })
    }
}

exports.deleteMenuById =async(req,res)=>{
try {
    const deletedItem = await Menu.findByIdAndDelete(req.params.id);
    if(!deletedItem){
        res.status(401).json({
            success:false,
            message:"Item Not Found"
        })
    }
    else{
        res.status(201).json({
            success:true,
            data:deletedItem
        })
    }
} catch (error) {
    res.status(401).json({
        success:true,
        message:error.message
    })
}
}

exports.getItemByCategory = async(req,res)=>{
    try {
        const category = req.params.category;
        const items = await Menu.find({category});
        if(items.length===0){
            res.status(404).json({
                success:false,
                message:"No Items Not Found In This Category"
            })   
        }
        else{
            res.status(201).json({
                success:true,
                cont:items.length,
                data:items
            })
        }
    } catch (error) {
        res.status(401).json({
            success:false,
            message:error.message
        })
    }
}
exports.searchMenuItems = async(req,res)=>{
    try {
        const keyword = req.query.keyword;
        if(!keyword){
            res.status(400).json({
                success:false,
                message:"Search Keyword Is Required"
            })
        }

        const items = await Menu.find({
            $or:[
              { name: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { category: { $regex: keyword, $options: "i" } }
            ]
        });
        res.status(200).json({
            success:true,
            count:items.length,
            data:items
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
        
    }
}