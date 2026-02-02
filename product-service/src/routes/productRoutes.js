import express from "express";
import {
  createProduct,
  getAllProducts,
  getSpotlightProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";

const router = express.Router();

// Public routes (frontend)
router.get("/", getAllProducts);
router.get("/spotlight", getSpotlightProducts);
router.get("/:id", getProductById);

// Admin routes (dashboard)
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
