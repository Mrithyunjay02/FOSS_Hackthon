// Import required modules
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json()); // Enable JSON parsing
app.use(cors()); // Enable CORS for frontend communication

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI) // Removed deprecated options
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ Database Connection Error:", err);
    process.exit(1); // Stop server if DB connection fails
  });

// Default API Route (For Testing)
app.get("/", (req, res) => {
  res.send("🚀 OpenPark Backend is Running!");
});

// Import & Use API Routes
const bookingRoutes = require("./bookingroutes"); // Import booking routes
app.use("/api/bookings", bookingRoutes); // Enable booking API

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
