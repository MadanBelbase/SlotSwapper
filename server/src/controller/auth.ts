import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();
// ✅ Always use the same JWT secret everywhere
const JWT_SECRET = process.env.JWT_SECRET || "G7f9Xk!3qLp$2VzR8yH@tWm#Ue6BdN1j";

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log("📩 Login attempt:", email);

    // 🔍 Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Authentication failed: User not found" });
    }

    // 🔑 Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Authentication failed: Incorrect password" });
    }

    // 🎟️ Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ Login successful for:", email);
    res.status(200).json({
      message: "Login successful",
      email: user.email,
      token,
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const signupUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    console.log("📝 Signup attempt:", username, email);

    // 🚫 Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 💾 Create new user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // 🎟️ Generate token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ Signup successful for:", email);
    res.status(201).json({
      message: "Signup successful",
      email: newUser.email,
      token,
    });

  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
