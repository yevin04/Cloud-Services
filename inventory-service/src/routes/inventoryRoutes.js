import express from "express";
import {
  createInventory,
  getInventoryByProduct,
  updateInventory,
  reduceStock
} from "../controllers/inventoryController.js";

const router = express.Router();

// Admin routes
router.post("/", createInventory);
router.put("/:id", updateInventory);

// Public / service routes
router.get("/:productId", getInventoryByProduct);

// Order simulation (later used by order-service)
router.post("/reduce", reduceStock);

export default router;
