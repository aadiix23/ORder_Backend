const Admin = require("../models/admin/adminSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ message: "Admin already exists" });

    const hash = await bcrypt.hash(password, 10);

    await Admin.create({
      email,
      password: hash
    });

    res.json({ message: "Admin created" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id },
      "JWT_SECRET",
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};