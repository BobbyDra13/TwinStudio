require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");

const app = express();
// app.use(cors());
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", // Allow frontend origin
    methods: "GET,POST,PUT,DELETE", // Allow required methods
    allowedHeaders: "Content-Type,Authorization", // Allow headers
  })
);

const mongoURI = process.env.MONGO_URI; // Retrieve MongoDB URI

if (!mongoURI) {
  console.error("Error: MONGO_URI is not defined in environment variables.");
  process.exit(1);
}

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use("/api/products", productRoutes);
