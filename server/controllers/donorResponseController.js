const DonorResponse = require("../models/DonorResponse");
const BloodRequest = require("../models/BloodRequest");
const User = require("../models/User");

// ======================================================
// CHECK 60 DAYS DONATION ELIGIBILITY
// ======================================================

const isDonationEligible = (lastDonationDate) => {
  if (!lastDonationDate) {
    return true;
  }

  const today = new Date();
  const lastDonation = new Date(lastDonationDate);

  const differenceInMilliseconds =
    today.getTime() - lastDonation.getTime();

  const differenceInDays =
    differenceInMilliseconds /
    (1000 * 60 * 60 * 24);

  return differenceInDays >= 60;
};

// ======================================================
// RESPOND TO BLOOD REQUEST
// ======================================================

const respondToBloodRequest = async (req, res) => {
  try {
    const { message } = req.body;
    const { id } = req.params;

    const bloodRequest =
      await BloodRequest.findById(id);

    if (!bloodRequest) {
      return res.status(404).json({
        message: "Blood request not found"
      });
    }

    if (
      bloodRequest.status === "Completed" ||
      bloodRequest.status === "Cancelled"
    ) {
      return res.status(400).json({
        message:
          "This blood request is no longer active"
      });
    }

    const donor =
      await User.findById(req.user.userId);

    if (!donor) {
      return res.status(404).json({
        message: "Donor not found"
      });
    }

    if (!donor.availableToDonate) {
      return res.status(400).json({
        message: "You must be available to donate to respond to requests"
      });
    }

    if (
      bloodRequest.requestedBy.toString() ===
      donor._id.toString()
    ) {
      return res.status(400).json({
        message:
          "You cannot respond to your own blood request"
      });
    }

    const eligible =
      isDonationEligible(
        donor.lastDonationDate
      );

    if (!eligible) {
      return res.status(400).json({
        message:
          "You are not eligible to donate yet. Your last blood donation was less than 60 days ago."
      });
    }

    const existingResponse =
      await DonorResponse.findOne({
        bloodRequest: id,
        donor: donor._id
      });

    if (existingResponse) {
      return res.status(409).json({
        message:
          "You have already responded to this request"
      });
    }

    const response =
      await DonorResponse.create({
        bloodRequest: id,
        donor: donor._id,

        message: message
          ? message.trim()
          : "",

        status: "Pending",

        healthConfirmed: false,

        eligibilityConfirmed: false,

        isEligible: false,

        eligibilityDate: null,

        donationDate: null
      });

    return res.status(201).json({
      message:
        "Donor response submitted successfully",

      response
    });

  } catch (error) {
    console.error(
      "Donor response error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ======================================================
// GET DONOR RESPONSES
// REQUEST OWNER
// ======================================================

const getDonorResponses = async (req, res) => {
  try {
    const { id } = req.params;

    const bloodRequest =
      await BloodRequest.findById(id);

    if (!bloodRequest) {
      return res.status(404).json({
        message: "Blood request not found"
      });
    }

    if (
      bloodRequest.requestedBy.toString() !==
      req.user.userId.toString()
    ) {
      return res.status(403).json({
        message:
          "Only the request owner can view donor responses"
      });
    }

    const responses =
      await DonorResponse.find({
        bloodRequest: id
      })
        .populate(
          "donor",
          "name email bloodGroup city currentCity mobile lastDonationDate"
        )
        .sort({
          createdAt: -1
        });

    return res.status(200).json({
      message:
        "Donor responses fetched successfully",

      count: responses.length,

      responses
    });

  } catch (error) {
    console.error(
      "Get donor responses error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ======================================================
// GET MY DONOR RESPONSES
// DONOR
// ======================================================

const getMyDonorResponses = async (req, res) => {
  try {
    const responses =
      await DonorResponse.find({
        donor: req.user.userId
      })
        .populate(
          "bloodRequest",
          "patientName hospital bloodGroup city status urgency unitsRequired description"
        )
        .sort({
          createdAt: -1
        });

    return res.status(200).json({
      message:
        "My donor responses fetched successfully",

      count: responses.length,

      responses
    });

  } catch (error) {
    console.error(
      "Get my donor responses error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ======================================================
// ACCEPT DONOR RESPONSE
// REQUEST OWNER
// ======================================================

const acceptDonorResponse = async (req, res) => {
  try {
    const { responseId } = req.params;

    const response =
      await DonorResponse.findById(responseId)
        .populate(
          "donor",
          "name email mobile bloodGroup"
        );

    if (!response) {
      return res.status(404).json({
        message: "Donor response not found"
      });
    }

    const bloodRequest =
      await BloodRequest.findById(
        response.bloodRequest
      );

    if (!bloodRequest) {
      return res.status(404).json({
        message: "Blood request not found"
      });
    }

    if (
      bloodRequest.requestedBy.toString() !==
      req.user.userId.toString()
    ) {
      return res.status(403).json({
        message:
          "Only the request owner can accept a donor"
      });
    }

    if (
      bloodRequest.status === "Completed" ||
      bloodRequest.status === "Cancelled"
    ) {
      return res.status(400).json({
        message:
          "This blood request is no longer active"
      });
    }

    if (response.status !== "Pending") {
      return res.status(400).json({
        message:
          "This donor response is no longer pending"
      });
    }

    response.status = "Accepted";

    await response.save();

    return res.status(200).json({
      message:
        "Donor accepted successfully",

      response
    });

  } catch (error) {
    console.error(
      "Accept donor error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ======================================================
// REJECT DONOR RESPONSE
// REQUEST OWNER
// ======================================================

const rejectDonorResponse = async (req, res) => {
  try {
    const { responseId } = req.params;

    const response =
      await DonorResponse.findById(responseId);

    if (!response) {
      return res.status(404).json({
        message: "Donor response not found"
      });
    }

    const bloodRequest =
      await BloodRequest.findById(
        response.bloodRequest
      );

    if (!bloodRequest) {
      return res.status(404).json({
        message: "Blood request not found"
      });
    }

    if (
      bloodRequest.requestedBy.toString() !==
      req.user.userId.toString()
    ) {
      return res.status(403).json({
        message:
          "Only the request owner can reject a donor"
      });
    }

    if (response.status !== "Pending") {
      return res.status(400).json({
        message:
          "This donor response is no longer pending"
      });
    }

    response.status = "Rejected";

    await response.save();

    return res.status(200).json({
      message:
        "Donor rejected successfully",

      response
    });

  } catch (error) {
    console.error(
      "Reject donor error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ======================================================
// SUBMIT DONOR ELIGIBILITY
// DONOR
// ======================================================

const submitDonorEligibility = async (req, res) => {
  try {
    const { responseId } = req.params;

    const {
      healthConfirmed
    } = req.body;

    if (healthConfirmed !== true) {
      return res.status(400).json({
        message:
          "You must confirm that you are currently healthy and able to donate blood"
      });
    }

    const response =
      await DonorResponse.findById(responseId);

    if (!response) {
      return res.status(404).json({
        message: "Donor response not found"
      });
    }

    if (
      response.donor.toString() !==
      req.user.userId.toString()
    ) {
      return res.status(403).json({
        message:
          "You can only submit eligibility for your own response"
      });
    }

    if (response.status !== "Accepted") {
      return res.status(400).json({
        message:
          "Eligibility can only be submitted after your response is accepted"
      });
    }

    if (response.eligibilityConfirmed) {
      return res.status(400).json({
        message:
          "Eligibility has already been submitted"
      });
    }

    const donor =
      await User.findById(req.user.userId);

    if (!donor) {
      return res.status(404).json({
        message: "Donor not found"
      });
    }

    const eligible =
      isDonationEligible(
        donor.lastDonationDate
      );

    response.healthConfirmed = true;

    response.eligibilityConfirmed = true;

    response.isEligible = eligible;

    response.eligibilityDate = new Date();

    await response.save();

    if (!eligible) {
      return res.status(200).json({
        message:
          "You are not eligible to donate yet",

        isEligible: false,

        response
      });
    }

    return res.status(200).json({
      message:
        "You are eligible for blood donation",

      isEligible: true,

      response
    });

  } catch (error) {
    console.error(
      "Submit eligibility error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ======================================================
// COMPLETE BLOOD DONATION
// REQUEST OWNER
// ======================================================

const completeBloodDonation = async (req, res) => {
  try {
    const { responseId } = req.params;

    const response =
      await DonorResponse.findById(responseId);

    if (!response) {
      return res.status(404).json({
        message: "Donor response not found"
      });
    }

    const bloodRequest =
      await BloodRequest.findById(
        response.bloodRequest
      );

    if (!bloodRequest) {
      return res.status(404).json({
        message: "Blood request not found"
      });
    }

    if (
      bloodRequest.requestedBy.toString() !==
      req.user.userId.toString()
    ) {
      return res.status(403).json({
        message:
          "Only the request owner can confirm blood donation"
      });
    }

    if (response.status !== "Accepted") {
      return res.status(400).json({
        message:
          "Donor response must be accepted first"
      });
    }

    if (!response.eligibilityConfirmed) {
      return res.status(400).json({
        message:
          "Donor eligibility has not been submitted"
      });
    }

    if (!response.isEligible) {
      return res.status(400).json({
        message:
          "Donor is not eligible for donation"
      });
    }

    if (response.donationDate) {
      return res.status(400).json({
        message:
          "Blood donation has already been completed"
      });
    }

    const donationDate = new Date();

    // ==================================================
    // UPDATE DONOR LAST DONATION DATE & STATS
    // ==================================================

    await User.findByIdAndUpdate(
      response.donor,
      {
        $set: {
          lastDonationDate: donationDate
        },
        $inc: {
          donationsCount: 1
        }
      }
    );

    // ==================================================
    // UPDATE REQUEST OWNER RECEIVE STATS
    // ==================================================

    await User.findByIdAndUpdate(
      bloodRequest.requestedBy,
      {
        $inc: {
          bloodReceivedCount: 1
        }
      }
    );

    // ==================================================
    // UPDATE DONOR RESPONSE
    // ==================================================

    response.status = "Completed";

    response.donationDate =
      donationDate;

    await response.save();

    // ==================================================
    // COMPLETE BLOOD REQUEST
    // ==================================================

    bloodRequest.status = "Completed";

    await bloodRequest.save();

    return res.status(200).json({
      message:
        "Blood donation completed successfully",

      donationDate,

      response
    });

  } catch (error) {
    console.error(
      "Complete blood donation error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  respondToBloodRequest,
  getDonorResponses,
  getMyDonorResponses,
  acceptDonorResponse,
  rejectDonorResponse,
  submitDonorEligibility,
  completeBloodDonation
};