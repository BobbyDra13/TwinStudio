const Product = require("../models/Product");

const saveProduct = async (req, res) => {
  console.log(req.body);
  try {
    const {
      productName,
      productCategory,
      productVolume,
      productShape,
      additionalInfo,
    } = req.body;

    const newProduct = new Product({
      productName,
      productCategory,
      productVolume,
      productShape,
      additionalInfo,
    });

    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product saved successfully", product: newProduct });
  } catch (error) {
    console.error("Error saving product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { saveProduct };
