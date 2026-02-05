import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import inventoryRoutes from "./routes/inventoryRoutes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://nikes-frontend-yevinr.s3-website.ap-south-1.amazonaws.com",
  "https://your-cloudfront-domain.com"
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
// Important for ALB preflight
app.options("*", cors());

app.use(express.json());

app.use("/api/inventory", inventoryRoutes);


// Health check
app.get("/health", (req, res) => {
  res.json({ service: "inventory-service", status: "ok" });
});

// Start server
const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
  console.log(`Inventory service running on port ${PORT}`);
  console.log(`Using DynamoDB table: ${process.env.DDB_INVENTORY_TABLE || "Inventory"}`);
});
