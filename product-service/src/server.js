import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use("/api/products", productRoutes);


// Health check
app.get("/health", (req, res) => {
  res.json({ service: "product-service", status: "ok" });
});

// Start server
const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`Product service running on port ${PORT}`);
  console.log(`Using DynamoDB table: ${process.env.DDB_PRODCUTS_TABLE || "Products"}`);
});
