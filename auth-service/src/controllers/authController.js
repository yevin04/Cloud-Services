import { randomUUID } from "crypto";
import {
  PutCommand,
  GetCommand,
  ScanCommand,
  QueryCommand
} from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME, VALID_ROLES } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.userId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// Helper function to find user by email
const findUserByEmail = async (email) => {
  const result = await docClient.send(new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email.toLowerCase().trim()
    }
  }));
  return result.Items && result.Items.length > 0 ? result.Items[0] : null;
};

// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = {
      userId: randomUUID(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "USER",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: user
    }));

    res.status(201).json({
      id: user.userId,
      email: user.email,
      role: user.role,
      token: generateToken(user)
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      id: user.userId,
      email: user.email,
      role: user.role,
      token: generateToken(user)
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

// @route   GET /api/auth/user/:id
export const getUserById = async (req, res) => {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId: req.params.id }
    }));

    if (!result.Item) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't return password
    const { password, ...userWithoutPassword } = result.Item;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};
