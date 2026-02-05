import jwt from "jsonwebtoken";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "../models/User.js";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from DynamoDB
      const result = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { userId: decoded.id }
      }));

      if (!result.Item) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      // Remove password from user object
      const { password, ...userWithoutPassword } = result.Item;
      req.user = userWithoutPassword;

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

export default protect;
