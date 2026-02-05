import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

const app = express();

// CORS Middleware - Allow all origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

app.use("/api/orders", orderRoutes);


// Health check
app.get("/health", (req, res) => {
  res.json({ service: "order-service", status: "ok" });
});

// Start server
const PORT = process.env.PORT || 4004;
app.listen(PORT, () => {
  console.log(`Order service running on port ${PORT}`);
  console.log(`Using DynamoDB table: ${process.env.DDB_ORDERS_TABLE || "Orders"}`);
});
