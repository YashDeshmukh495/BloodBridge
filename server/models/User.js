const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ================= NAME =================
    name: {
      type: String,
      required: true,
      trim: true
    },

    // ================= EMAIL =================
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    // ================= PASSWORD =================
    password: {
      type: String,
      required: true
    },

    // ================= MOBILE =================
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    // ================= BLOOD GROUP =================
    bloodGroup: {
      type: String,
      required: true,
      enum: [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-"
      ]
    },

    // ==================================================
    // DATE OF BIRTH
    // ==================================================

    dateOfBirth: {
      type: Date,
      required: true
    },

    // ==================================================
    // WEIGHT
    // ==================================================

    weight: {
      type: Number,
      required: true,
      min: 1
    },

    // ==================================================
    // PREVIOUS BLOOD DONATION
    // ==================================================

    hasDonatedBefore: {
      type: Boolean,
      required: true,
      default: false
    },

    // ==================================================
    // LAST BLOOD DONATION DATE
    // User cannot manually change this after registration
    // ==================================================

    lastDonationDate: {
      type: Date,
      default: null
    },

    // ==================================================
    // REGISTRATION / PERMANENT LOCATION
    // ==================================================

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

    // ==================================================
    // CURRENT LOCATION
    // ==================================================

    currentCity: {
      type: String,
      default: "",
      trim: true
    },

    currentPinCode: {
      type: String,
      default: "",
      trim: true
    },

    // ==================================================
    // DONOR AVAILABILITY
    // ==================================================

    availableToDonate: {
      type: Boolean,
      default: false
    },

    donationsCount: {
      type: Number,
      default: 0
    },

    bloodReceivedCount: {
      type: Number,
      default: 0
    }
  },

  {
    timestamps: true
  }
);

const User = mongoose.model(
  "User",
  userSchema
);

module.exports = User;