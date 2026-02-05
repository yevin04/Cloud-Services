import { randomUUID } from "crypto";
import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "../models/Inventory.js";

/**
 * @desc    Create inventory record (Admin)
 * @route   POST /api/inventory
 */
export const createInventory = async (req, res) => {
  try {
    const { productId, variant, stock } = req.body;

    if (!productId || !variant || stock === undefined) {
      return res.status(400).json({
        message: "productId, variant, and stock are required"
      });
    }

    // Check if inventory already exists for this product + variant
    const existingResult = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "productId = :productId AND variant = :variant",
      ExpressionAttributeValues: {
        ":productId": productId,
        ":variant": variant.trim()
      }
    }));

    if (existingResult.Items && existingResult.Items.length > 0) {
      return res.status(400).json({
        message: "Inventory record already exists for this product and variant"
      });
    }

    const inventory = {
      inventoryId: randomUUID(),
      productId,
      variant: variant.trim(),
      stock: Math.max(0, stock),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: inventory
    }));

    res.status(201).json(inventory);
  } catch (error) {
    console.error("Create inventory error:", error);
    res.status(400).json({
      message: "Failed to create inventory record",
      error: error.message
    });
  }
};

/**
 * @desc    Get inventory by product ID
 * @route   GET /api/inventory/:productId
 */
export const getInventoryByProduct = async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "productId = :productId",
      ExpressionAttributeValues: {
        ":productId": req.params.productId
      }
    }));

    res.json(result.Items || []);
  } catch (error) {
    console.error("Get inventory by product error:", error);
    res.status(500).json({
      message: "Failed to fetch inventory",
      error: error.message
    });
  }
};

/**
 * @desc    Get all inventory records
 * @route   GET /api/inventory
 */
export const getAllInventory = async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME
    }));

    res.json(result.Items || []);
  } catch (error) {
    console.error("Get all inventory error:", error);
    res.status(500).json({
      message: "Failed to fetch inventory",
      error: error.message
    });
  }
};

/**
 * @desc    Update inventory stock (Admin manual update)
 * @route   PUT /api/inventory/:id
 */
export const updateInventory = async (req, res) => {
  try {
    // Check if inventory exists
    const existing = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { inventoryId: req.params.id }
    }));

    if (!existing.Item) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    const { productId, variant, stock } = req.body;

    // Build update expression dynamically
    const updateFields = [];
    const expressionAttributeValues = {
      ":updatedAt": new Date().toISOString()
    };

    if (productId !== undefined) {
      updateFields.push("productId = :productId");
      expressionAttributeValues[":productId"] = productId;
    }
    if (variant !== undefined) {
      updateFields.push("variant = :variant");
      expressionAttributeValues[":variant"] = variant.trim();
    }
    if (stock !== undefined) {
      updateFields.push("stock = :stock");
      expressionAttributeValues[":stock"] = Math.max(0, stock);
    }

    updateFields.push("updatedAt = :updatedAt");

    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { inventoryId: req.params.id },
      UpdateExpression: `SET ${updateFields.join(", ")}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW"
    }));

    res.json(result.Attributes);
  } catch (error) {
    console.error("Update inventory error:", error);
    res.status(400).json({
      message: "Failed to update inventory",
      error: error.message
    });
  }
};

/**
 * @desc    Reduce stock when order is placed
 * @route   POST /api/inventory/reduce
 * @note    Called by Order Service
 */
export const reduceStock = async (req, res) => {
  try {
    const { productId, variant, quantity } = req.body;

    if (!productId || !variant || !quantity) {
      return res.status(400).json({
        message: "productId, variant and quantity are required"
      });
    }

    // Find inventory by productId and variant
    const findResult = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "productId = :productId AND variant = :variant",
      ExpressionAttributeValues: {
        ":productId": productId,
        ":variant": variant
      }
    }));

    if (!findResult.Items || findResult.Items.length === 0) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    const inventory = findResult.Items[0];

    if (inventory.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    const newStock = inventory.stock - quantity;

    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { inventoryId: inventory.inventoryId },
      UpdateExpression: "SET stock = :stock, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":stock": newStock,
        ":updatedAt": new Date().toISOString()
      },
      ReturnValues: "ALL_NEW"
    }));

    res.json({
      message: "Stock reduced successfully",
      inventory: result.Attributes
    });
  } catch (error) {
    console.error("Reduce stock error:", error);
    res.status(500).json({
      message: "Failed to reduce stock",
      error: error.message
    });
  }
};

/**
 * @desc    Delete inventory record (Admin)
 * @route   DELETE /api/inventory/:id
 */
export const deleteInventory = async (req, res) => {
  try {
    // Check if inventory exists
    const existing = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { inventoryId: req.params.id }
    }));

    if (!existing.Item) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { inventoryId: req.params.id }
    }));

    res.json({ message: "Inventory deleted successfully" });
  } catch (error) {
    console.error("Delete inventory error:", error);
    res.status(500).json({
      message: "Failed to delete inventory",
      error: error.message
    });
  }
};
