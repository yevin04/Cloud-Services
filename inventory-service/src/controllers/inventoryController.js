import Inventory from "../models/Inventory.js";

/**
 * @desc    Create inventory record (Admin)
 * @route   POST /api/inventory
 */
export const createInventory = async (req, res) => {
  try {
    const inventory = await Inventory.create(req.body);
    res.status(201).json(inventory);
  } catch (error) {
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
    const inventory = await Inventory.find({
      productId: req.params.productId
    });

    res.json(inventory);
  } catch (error) {
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
    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    res.json(inventory);
  } catch (error) {
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

    const inventory = await Inventory.findOne({ productId, variant });

    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    if (inventory.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    inventory.stock -= quantity;
    await inventory.save();

    res.json({
      message: "Stock reduced successfully",
      inventory
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reduce stock",
      error: error.message
    });
  }
};
