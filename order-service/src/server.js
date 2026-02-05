import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
