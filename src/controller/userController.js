const User = require("../models/user/userSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (role !== "admin" && role != "chef")
      return res.status(400).json({ message: "Invalid role" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hash,
      role,
    });

    res.json({ message: "User created", user: user });
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
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({ token, role: user.role,message:"success" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
