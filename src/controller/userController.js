const User = require("../models/user/userSchema");
const Restaurant = require("../models/restaurant/restaurantSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { email, password, role, restaurantId, restaurantName, restaurantDescription } = req.body;

    if (role !== "admin" && role != "chef")
      return res.status(400).json({ message: "Invalid role" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hash = await bcrypt.hash(password, 10);

    // 1. Create User
    const user = await User.create({
      email,
      password: hash,
      role,
      restaurant: restaurantId // Link to existing restaurant if id provided
    });

    // 2. If Admin and Restaurant info provided, create Restaurant
    if (role === 'admin' && restaurantName && !restaurantId) {
      const slug = restaurantName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

      const restaurant = await Restaurant.create({
        name: restaurantName,
        slug: slug + '-' + Math.random().toString(36).substring(7), // Ensure unique slug
        owner: user._id,
        address: restaurantDescription || 'Not provided', // Using description as temporary address
      });

      // 3. Link Restaurant back to User
      user.restaurant = restaurant._id;
      await user.save();
    }

    res.json({ message: "User created successfully", user: { id: user._id, email: user.email, role: user.role, restaurant: user.restaurant } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, restaurant: user.restaurant },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      role: user.role,
      restaurantId: user.restaurant,
      message: "success"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
