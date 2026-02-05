import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1"
});

// Create document client for easier JSON operations
const docClient = DynamoDBDocumentClient.from(client);

// Table name from environment
const TABLE_NAME = process.env.DDB_ORDERS_TABLE || "Orders";

// Valid order statuses
const VALID_ORDER_STATUSES = ["CREATED", "PAID", "CANCELLED"];

export { docClient, TABLE_NAME, VALID_ORDER_STATUSES };
