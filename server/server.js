const authRoutes = require("./routes/authRoutes");
const bloodRequestRoutes = require("./routes/bloodRequestRoutes");
const donorResponseRoutes = require("./routes/donorResponseRoutes");

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const PORT = 5000;

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000
  })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);
app.use("/api/blood-requests", donorResponseRoutes);

// Test GET API
app.get("/", (req, res) => {
  res.send("BloodBridge API is running");
});

// Test POST API
app.post("/api/test", (req, res) => {
  console.log(req.body);

  res.json({
    message: "Data received successfully",
    data: req.body
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});