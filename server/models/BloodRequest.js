const mongoose = require("mongoose");

const bloodRequestSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true,
      trim: true
    },

    bloodGroup: {
      type: String,
      required: true,
      trim: true
    },

    // ================= REQUEST LOCATION =================

    city: {
      type: String,
      required: true,
      trim: true
    },

    pinCode: {
      type: String,
      required: true,
      trim: true
    },

    // ===================================================

    hospital: {
      type: String,
      required: true,
      trim: true
    },

    unitsRequired: {
      type: Number,
      required: true,
      min: 1
    },

    urgency: {
      type: String,
      enum: ["Low", "Medium", "High", "Emergency"],
      default: "Medium"
    },

    contactNumber: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Completed",
        "Cancelled"
      ],
      default: "Pending"
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

const BloodRequest = mongoose.model(
  "BloodRequest",
  bloodRequestSchema
);

module.exports = BloodRequest;