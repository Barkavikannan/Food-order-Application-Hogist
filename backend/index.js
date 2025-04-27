const express = require("express");
const config = require("./config.json");
const bcrypt = require("bcrypt");
const User = require("./models/user.models.js");
const Admin = require("./models/admin.model.js");
const verifyAdmin = require("./Middleware/authMiddleware.js");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");



// Connect to MongoDB
mongoose
  .connect(config.connectionString)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("Connection failed:", err));

const app = express();

app.use(express.json());
app.use(cors({ 
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.post("/register-user", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: true, message: "All fields required" });
  }

  try {
    const isUser = await User.findOne({ email });
    if (isUser) {
      return res.status(400).json({ error: true, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ fullName, email, password: hashedPassword });
    await user.save();

    const accessToken = jwt.sign(
      { userId: user._id, role: "user" },
      process.env.ACCESS_TOKEN,
      { expiresIn: "72h" }
    );

    return res.status(201).json({
      error: false,
      user: { fullName: user.fullName, email: user.email },
      message: "User Registered Successfully",
      accessToken,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: true, message: "Server error. Please try again." });
  }
});


app.post("/login-user", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: true, message: "All fields required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: true, message: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ error: true, message: "Invalid Password" });
  }

  const accessToken = jwt.sign(
    { userId: user._id, role: "user" },
    process.env.ACCESS_TOKEN,
    { expiresIn: "72h" }
  );

  return res.status(200).json({
    error: false,
    message: "User Login Successfully",
    user: { fullName: user.fullName, email: user.email },
    accessToken,
  });
});


app.post("/register-admin", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: true, message: " fieAlllds required" });
  }

  try {
    const isAdmin = await Admin.findOne({ email });
    if (isAdmin) {
      return res.status(400).json({ error: true, message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({ fullName, email, password: hashedPassword });
    await admin.save();

    const accessToken = jwt.sign(
      { adminId: admin._id, role: "admin" },
      process.env.ACCESS_TOKEN,
      { expiresIn: "72h" }
    );

    return res.status(201).json({
      error: false,
      admin: { fullName: admin.fullName, email: admin.email },
      message: "Admin Registered Successfully",
      accessToken,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: true, message: "Server error. Please try again." });
  }
});


app.post("/login-admin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: true, message: "All fields required" });
  }

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(400).json({ error: true, message: "Admin not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    return res.status(400).json({ error: true, message: "Invalid Password" });
  }

  const accessToken = jwt.sign(
    { adminId: admin._id, role: "admin" },
    process.env.ACCESS_TOKEN,
    { expiresIn: "72h" }
  );

  return res.status(200).json({
    error: false,
    message: "Admin Login Successfully",
    admin: { fullName: admin.fullName, email: admin.email },
    accessToken,
  });
});

// get all users only admin
app.get("/all-users", verifyAdmin, async (req, res) => {
  try {
    // Find all users and exclude the password field
    const users = await User.find({}, { password: 0 });
    
    return res.status(200).json({
      error: false,
      users,
      message: "Users fetched successfully",
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ 
      error: true, 
      message: "Server error. Please try again." 
    });
  }
});


const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});













app.listen(8000, "0.0.0.0", () => console.log("Server running on port 8000"));

module.exports = app;
