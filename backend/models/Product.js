const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productCategory: { type: String, required: true },
  productVolume: { type: String, required: true },
  productShape: { type: String, required: true },
  additionalInfo: { type: String },
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
