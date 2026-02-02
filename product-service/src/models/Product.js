import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ["Shoes", "Tees", "Bags", "Pants", "Other"]
    },
    description: {
      type: String
    },
    price: {
      type: Number,
      required: true
    },
    images: [
      {
        type: String
      }
    ],
    spotlight: {
      type: Boolean,
      default: false
    },
    variants: [variantSchema]
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
