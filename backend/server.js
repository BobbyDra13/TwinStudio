
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./configs/db-config");
const productRoutes = require("./routes/productRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Allow frontend origin
    methods: "GET,POST,PUT,DELETE", // Allow required methods
    allowedHeaders: "Content-Type,Authorization",
  })
);

// Connect to Database
connectDB();

// Routes
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
