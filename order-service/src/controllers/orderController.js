import { randomUUID } from "crypto";
import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME, VALID_ORDER_STATUSES } from "../models/Order.js";

// @desc    Create new order
// @route   POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id; // Get userId from JWT token

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = {
      orderId: randomUUID(),
      userId,
      items,
      totalAmount,
      status: "CREATED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: order
    }));

    res.status(201).json(order);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
};

// @desc    Get orders by user
// @route   GET /api/orders/user/:userId
export const getOrdersByUser = async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": req.params.userId
      }
    }));

    res.json(result.Items || []);
  } catch (error) {
    console.error("Get orders by user error:", error);
    res.status(500).json({ message: "Failed to fetch user orders" });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
export const getAllOrders = async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME
    }));

    res.json(result.Items || []);
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { orderId: req.params.id }
    }));

    if (!result.Item) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(result.Item);
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !VALID_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Valid statuses are: ${VALID_ORDER_STATUSES.join(", ")}`
      });
    }

    // Check if order exists
    const existing = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { orderId: req.params.id }
    }));

    if (!existing.Item) {
      return res.status(404).json({ message: "Order not found" });
    }

    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { orderId: req.params.id },
      UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":status": status,
        ":updatedAt": new Date().toISOString()
      },
      ReturnValues: "ALL_NEW"
    }));

    res.json(result.Attributes);
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(400).json({ message: "Failed to update order status" });
  }
};

// @desc    Delete order (Admin)
// @route   DELETE /api/orders/:id
export const deleteOrder = async (req, res) => {
  try {
    // Check if order exists
    const existing = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { orderId: req.params.id }
    }));

    if (!existing.Item) {
      return res.status(404).json({ message: "Order not found" });
    }

    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { orderId: req.params.id }
    }));

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ message: "Failed to delete order" });
  }
};
