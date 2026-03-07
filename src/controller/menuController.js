const Menu = require("../models/menu/menuSchema");

const normalizeImagePayload = (body = {}) => {
    const normalized = { ...body };

    let images = [];
    if (Array.isArray(normalized.images)) {
        images = normalized.images;
    } else if (typeof normalized.images === "string") {
        images = [normalized.images];
    }

    images = images
        .map(url => (typeof url === "string" ? url.trim() : ""))
        .filter(Boolean);

    if (images.length === 0 && typeof normalized.image === "string" && normalized.image.trim()) {
        images = [normalized.image.trim()];
    }

    normalized.images = images;
    normalized.image = images[0] || normalized.image;

    if (normalized.price !== undefined && normalized.price !== null && normalized.price !== "") {
        normalized.price = Number(normalized.price);
    }

    if (normalized.mrp === "" || normalized.mrp === undefined) {
        normalized.mrp = null;
    } else if (normalized.mrp !== null) {
        normalized.mrp = Number(normalized.mrp);
    }

    if (Array.isArray(normalized.addOns)) {
        normalized.addOns = normalized.addOns
            .map((addOn) => {
                const name = typeof addOn?.name === "string" ? addOn.name.trim() : "";
                const price = Number(addOn?.price);
                if (!name || !Number.isFinite(price) || price < 0) return null;
                return {
                    name,
                    price,
                    isAvailable: addOn?.isAvailable !== false
                };
            })
            .filter(Boolean);
    } else {
        normalized.addOns = [];
    }

    return normalized;
};

exports.createMenuItem = async (req, res) => {
    try {
        const restaurantId = req.user.restaurant || req.body.restaurant;
        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant reference is required" });
        }
        const normalizedBody = normalizeImagePayload(req.body);
        const { sizes, sizePrices, ...rest } = normalizedBody;
        const payload = { ...rest, restaurant: restaurantId };

        if (sizePrices && typeof sizePrices === "object" && !Array.isArray(sizePrices)) {
            const allowedSizes = ["Small", "Medium", "Large", "Regular"];
            const entries = Object.entries(sizePrices).filter(([size]) => allowedSizes.includes(size));

            if (entries.length === 0) {
                return res.status(400).json({ success: false, message: "No valid size-price pairs were provided" });
            }

            const docs = [];
            for (const [size, rawPrice] of entries) {
                const parsedPrice = Number(rawPrice);
                if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
                    return res.status(400).json({ success: false, message: `Invalid price for size ${size}` });
                }
                docs.push({ ...payload, size, price: parsedPrice });
            }

            const createdItems = await Menu.insertMany(docs);
            return res.status(201).json({
                success: true,
                message: `${createdItems.length} menu item(s) created successfully`,
                count: createdItems.length,
                data: createdItems
            });
        }

        if (Array.isArray(sizes) && sizes.length > 0) {
            const allowedSizes = ["Small", "Medium", "Large", "Regular"];
            const normalizedSizes = [...new Set(sizes)].filter(size => allowedSizes.includes(size));

            if (normalizedSizes.length === 0) {
                return res.status(400).json({ success: false, message: "No valid sizes were provided" });
            }

            const docs = normalizedSizes.map(size => ({ ...payload, size }));
            const createdItems = await Menu.insertMany(docs);
            return res.status(201).json({
                success: true,
                message: `${createdItems.length} menu item(s) created successfully`,
                count: createdItems.length,
                data: createdItems
            });
        }

        const menuItem = await Menu.create(payload);
        res.status(201).json({ success: true, message: "Item Created successfully", data: menuItem })
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
}

exports.getAllMenuItems = async (req, res) => {
    try {
        // Filter by restaurant from query (customer) or user context (admin)
        const restaurantId = req.query.restaurantId || req.user?.restaurant;
        const filter = restaurantId ? { restaurant: restaurantId } : {};

        const items = await Menu.find(filter).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

exports.getMenuItemById = async (req, res) => {
    try {
        const item = await Menu.findById(req.params.id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item Not Found"
            })
        }
        res.status(200).json({
            success: true,
            data: item
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateMenuById = async (req, res) => {
    try {
        const restaurantId = req.user.restaurant || req.body.restaurant;
        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant reference is required" });
        }
        const payload = normalizeImagePayload(req.body);
        // Ensure user belongs to this restaurant
        const updatedItem = await Menu.findOneAndUpdate(
            { _id: req.params.id, restaurant: restaurantId },
            payload,
            { new: true, runValidators: true }
        );
        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                message: "Update Failed or Unauthorized"
            })
        }
        res.status(200).json({
            success: true,
            message: "Updated Item successfully",
            data: updatedItem
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteMenuById = async (req, res) => {
    try {
        const restaurantId = req.user.restaurant || req.query.restaurantId;
        if (!restaurantId) {
            return res.status(400).json({ success: false, message: "Restaurant reference is required" });
        }
        const deletedItem = await Menu.findOneAndDelete({
            _id: req.params.id,
            restaurant: restaurantId
        });
        if (!deletedItem) {
            return res.status(404).json({
                success: false,
                message: "Item Not Found or Unauthorized"
            })
        }
        res.status(200).json({
            success: true,
            data: deletedItem
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

exports.getItemByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const restaurantId = req.query.restaurantId || req.user?.restaurant;
        const filter = { category };
        if (restaurantId) filter.restaurant = restaurantId;

        const items = await Menu.find(filter);
        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

exports.searchMenuItems = async (req, res) => {
    try {
        const { keyword, restaurantId: queryRid } = req.query;
        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: "Search Keyword Is Required"
            })
        }

        const restaurantId = queryRid || req.user?.restaurant;
        const filter = {
            $or: [
                { name: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { category: { $regex: keyword, $options: "i" } }
            ]
        };
        if (restaurantId) filter.restaurant = restaurantId;

        const items = await Menu.find(filter);
        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
