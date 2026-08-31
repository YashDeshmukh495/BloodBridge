const mongoose = require("mongoose");

const donorResponseSchema = new mongoose.Schema(
  {
    // ==================================================
    // BLOOD REQUEST
    // ==================================================

    bloodRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      required: true
    },

    // ==================================================
    // DONOR
    // ==================================================

    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // ==================================================
    // RESPONSE STATUS
    // ==================================================

    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Rejected",
        "Completed"
      ],
      default: "Pending"
    },

    // ==================================================
    // DONOR MESSAGE
    // ==================================================

    message: {
      type: String,
      trim: true,
      default: ""
    },

    // ==================================================
    // HEALTH CONFIRMATION
    // ==================================================

    healthConfirmed: {
      type: Boolean,
      default: false
    },

    // ==================================================
    // ELIGIBILITY CONFIRMATION
    // ==================================================

    eligibilityConfirmed: {
      type: Boolean,
      default: false
    },

    // ==================================================
    // FINAL ELIGIBILITY STATUS
    // Backend will decide this
    // ==================================================

    isEligible: {
      type: Boolean,
      default: false
    },

    // ==================================================
    // ELIGIBILITY FORM SUBMISSION DATE
    // ==================================================

    eligibilityDate: {
      type: Date,
      default: null
    },

    // ==================================================
    // ACTUAL DONATION
    // ==================================================

    donationDate: {
      type: Date,
      default: null
    }
  },

  {
    timestamps: true
  }
);

const DonorResponse = mongoose.model(
  "DonorResponse",
  donorResponseSchema
);

module.exports = DonorResponse;