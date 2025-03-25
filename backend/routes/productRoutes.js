const express = require("express");
const router = express.Router();
const Product = require("../models/Product"); // Import the Mongoose model

// Endpoint to save product profile
router.post("/save-product", async (req, res) => {
  console.log(req.body);
  try {
    const {
      productName,
      productCategory,
      productVolume,
      productShape,
      additionalInfo,
    } = req.body;

    // Create a new product document
    const newProduct = new Product({
      productName,
      productCategory,
      productVolume,
      productShape,
      additionalInfo,
    });

    // Save to MongoDB
    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product saved successfully", product: newProduct });
  } catch (error) {
    console.error("Error saving product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
