import { v4 as uuidv4 } from "uuid";
import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";
import dynamoDB from "../config/dynamodb.js";

const TABLE_NAME = process.env.DYNAMODB_TABLE || "Products";

// Create a new product
export const createProduct = async (productData) => {
  const productId = uuidv4();
  const timestamp = new Date().toISOString();

  const product = {
    productId,
    ...productData,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await dynamoDB.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: product
    })
  );

  return product;
};

// Get all products
export const getAllProducts = async () => {
  const result = await dynamoDB.send(
    new ScanCommand({
      TableName: TABLE_NAME
    })
  );

  return result.Items || [];
};

// Get spotlight products
export const getSpotlightProducts = async () => {
  const result = await dynamoDB.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "spotlight = :spotlight",
      ExpressionAttributeValues: {
        ":spotlight": true
      }
    })
  );

  return result.Items || [];
};

// Get product by ID
export const getProductById = async (productId) => {
  const result = await dynamoDB.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { productId }
    })
  );

  return result.Item || null;
};

// Update product
export const updateProduct = async (productId, updateData) => {
  // Build update expression dynamically
  const updateExpressionParts = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  Object.keys(updateData).forEach((key, index) => {
    const attrName = `#attr${index}`;
    const attrValue = `:val${index}`;
    updateExpressionParts.push(`${attrName} = ${attrValue}`);
    expressionAttributeNames[attrName] = key;
    expressionAttributeValues[attrValue] = updateData[key];
  });

  // Add updatedAt timestamp
  updateExpressionParts.push("#updatedAt = :updatedAt");
  expressionAttributeNames["#updatedAt"] = "updatedAt";
  expressionAttributeValues[":updatedAt"] = new Date().toISOString();

  const result = await dynamoDB.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { productId },
      UpdateExpression: `SET ${updateExpressionParts.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW"
    })
  );

  return result.Attributes || null;
};

// Delete product
export const deleteProduct = async (productId) => {
  const result = await dynamoDB.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { productId },
      ReturnValues: "ALL_OLD"
    })
  );

  return result.Attributes || null;
};
