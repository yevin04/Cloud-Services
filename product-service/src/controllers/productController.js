import { randomUUID } from "crypto";
import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME, VALID_CATEGORIES } from "../models/Product.js";

// @desc    Create new product (Admin)
// @route   POST /api/products
export const createProduct = async (req, res) => {
  try {
    const { name, category, description, price, images, spotlight, variants } = req.body;

    // Validation
    if (!name || !category || price === undefined) {
      return res.status(400).json({ message: "Name, category, and price are required" });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `Category must be one of: ${VALID_CATEGORIES.join(", ")}` });
    }

    const product = {
      productId: randomUUID(),
      name: name.trim(),
      category,
      description: description || "",
      price,
      images: images || [],
      spotlight: spotlight || false,
      variants: variants || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: product
    }));

    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(400).json({ message: "Failed to create product" });
  }
};

// @desc    Get all products
// @route   GET /api/products
export const getAllProducts = async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME
    }));

    res.json(result.Items || []);
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

// @desc    Get spotlight products
// @route   GET /api/products/spotlight
export const getSpotlightProducts = async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "spotlight = :spotlight",
      ExpressionAttributeValues: {
        ":spotlight": true
      }
    }));

    res.json(result.Items || []);
  } catch (error) {
    console.error("Get spotlight products error:", error);
    res.status(500).json({ message: "Failed to fetch spotlight products" });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { productId: req.params.id }
    }));

    if (!result.Item) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(result.Item);
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    // First check if product exists
    const existing = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { productId: req.params.id }
    }));

    if (!existing.Item) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { name, category, description, price, images, spotlight, variants } = req.body;

    // Validate category if provided
    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `Category must be one of: ${VALID_CATEGORIES.join(", ")}` });
    }

    // Build update expression dynamically
    const updateFields = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {
      ":updatedAt": new Date().toISOString()
    };

    if (name !== undefined) {
      updateFields.push("#name = :name");
      expressionAttributeNames["#name"] = "name";
      expressionAttributeValues[":name"] = name.trim();
    }
    if (category !== undefined) {
      updateFields.push("category = :category");
      expressionAttributeValues[":category"] = category;
    }
    if (description !== undefined) {
      updateFields.push("description = :description");
      expressionAttributeValues[":description"] = description;
    }
    if (price !== undefined) {
      updateFields.push("price = :price");
      expressionAttributeValues[":price"] = price;
    }
    if (images !== undefined) {
      updateFields.push("images = :images");
      expressionAttributeValues[":images"] = images;
    }
    if (spotlight !== undefined) {
      updateFields.push("spotlight = :spotlight");
      expressionAttributeValues[":spotlight"] = spotlight;
    }
    if (variants !== undefined) {
      updateFields.push("variants = :variants");
      expressionAttributeValues[":variants"] = variants;
    }

    updateFields.push("updatedAt = :updatedAt");

    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { productId: req.params.id },
      UpdateExpression: `SET ${updateFields.join(", ")}`,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW"
    }));

    res.json(result.Attributes);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(400).json({ message: "Failed to update product" });
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    // First check if product exists
    const existing = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { productId: req.params.id }
    }));

    if (!existing.Item) {
      return res.status(404).json({ message: "Product not found" });
    }

    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { productId: req.params.id }
    }));

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};
