import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import inventoryRoutes from "./routes/inventoryRoutes.js";


dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use("/api/inventory", inventoryRoutes);


// Health check
app.get("/health", (req, res) => {
  res.json({ service: "inventory-service", status: "ok" });
});

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected (inventory-service)");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

connectDB();

// Start server
const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
  console.log(`Inventory service running on port ${PORT}`);
});
