import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: { type: String, default: "USER" }
});

const User = mongoose.model("User", userSchema);

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Update existing user to ADMIN or create new one
  const result = await User.findOneAndUpdate(
    { email: "admin@cloudyevin.com" },
    { role: "ADMIN" },
    { new: true }
  );

  if (result) {
    console.log("✅ Admin user updated:", result.email, "-> role:", result.role);
  } else {
    // Create new admin
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("admin123", salt);
    
    const admin = await User.create({
      email: "admin@cloudyevin.com",
      password: hash,
      role: "ADMIN"
    });
    console.log("✅ Admin user created:", admin.email);
  }

  await mongoose.disconnect();
  process.exit(0);
}

createAdmin();
