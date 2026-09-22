import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required", message: "All fields are required" });
    }

    const cleanUsername = String(username).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    const escapedEmail = cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existingUser = await User.findOne({
      $or: [
        { email: cleanEmail },
        { email: { $regex: new RegExp(`^${escapedEmail}$`, "i") } }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email", message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message, message: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const rawIdentifier = req.body.email || req.body.username || "";
    const password = req.body.password;

    if (!rawIdentifier || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const identifier = String(rawIdentifier).trim();
    const escapedIdentifier = identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Match either email (case-insensitive) or username (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { email: identifier.toLowerCase() },
        { email: { $regex: new RegExp(`^${escapedIdentifier}$`, "i") } },
        { username: { $regex: new RegExp(`^${escapedIdentifier}$`, "i") } }
      ]
    });

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message, message: err.message });
  }
});

export default router;