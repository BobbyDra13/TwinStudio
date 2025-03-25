const express = require("express");
const { saveProduct } = require("../controllers/productController");

const router = express.Router();

router.post("/save-product", saveProduct);

module.exports = router;
