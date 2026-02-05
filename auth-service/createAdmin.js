import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { docClient, TABLE_NAME } from "./src/models/User.js";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";

dotenv.config();

async function createAdmin() {
  const email = "admin@cloudyevin.com"; // CHANGE if needed
  const password = "admin123"; // CHANGE if needed

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = {
    userId: randomUUID(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role: "ADMIN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: user
    }));
    console.log("✅ Admin user created:", { email: user.email, password });
  } catch (err) {
    console.error("❌ Failed to create admin user:", err);
  }
}

createAdmin();
