import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js";

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
  console.log(`AWS Region: ${process.env.AWS_REGION}`);
  console.log(`Using DynamoDB table: ${process.env.DDB_PRODUCTS_TABLE || "Products"}`);
});
