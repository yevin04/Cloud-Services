import express from "express";
import {
  createOrder,
  getOrdersByUser,
  getAllOrders,
  updateOrderStatus
} from "../controllers/orderController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// User routes
router.post("/", protect, createOrder);
router.get("/user/:userId", getOrdersByUser);

// Admin routes
router.get("/", getAllOrders);
router.put("/:id/status", updateOrderStatus);

export default router;
