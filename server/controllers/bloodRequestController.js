const BloodRequest = require("../models/BloodRequest");
const User = require("../models/User");
const DonorResponse = require("../models/DonorResponse");

const {
  canDonate
} = require("../utils/bloodCompatibility");


// ======================================================
// CREATE BLOOD REQUEST
// ======================================================

const createBloodRequest = async (req, res) => {
  try {

    const {
      patientName,
      bloodGroup,
      hospital,
      unitsRequired,
      urgency,
      contactNumber,
      description
    } = req.body;


    // ==================================================
    // GET CURRENT USER
    // ==================================================

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }


    // ==================================================
    // CURRENT LOCATION
    // ==================================================

    const city =
      user.currentCity?.trim() ||
      user.city?.trim();

    const pinCode =
      user.currentPinCode?.trim() ||
      user.pinCode?.trim();


    // ==================================================
    // REQUIRED FIELDS
    // ==================================================

    if (
      !patientName ||
      !bloodGroup ||
      !city ||
      !pinCode ||
      !hospital ||
      !unitsRequired ||
      !contactNumber
    ) {
      return res.status(400).json({
        message: "Required fields are missing"
      });
    }


    // ==================================================
    // VALIDATE INPUTS (contactNumber & unitsRequired)
    // ==================================================

    if (!/^\d{10}$/.test(contactNumber)) {
      return res.status(400).json({
        message: "Contact number must contain exactly 10 digits"
      });
    }

    const units = Number(unitsRequired);
    if (!Number.isInteger(units) || units < 1 || units > 6) {
      return res.status(400).json({
        message: "Units required must be a valid integer between 1 and 6"
      });
    }


    // ==================================================
    // CREATE BLOOD REQUEST
    // ==================================================

    const bloodRequest = await BloodRequest.create({

      patientName:
        patientName.trim(),

      bloodGroup:
        bloodGroup.trim(),

      city,

      pinCode,

      hospital:
        hospital.trim(),

      unitsRequired:
        Number(unitsRequired),

      urgency:
        urgency || "Medium",

      contactNumber:
        contactNumber.trim(),

      description:
        description
          ? description.trim()
          : "",

      requestedBy:
        req.user.userId

    });


    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(201).json({

      message:
        "Blood request created successfully",

      bloodRequest

    });

  } catch (error) {

    console.error(
      "Create blood request error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error"
    });
  }
};


// ======================================================
// GET BLOOD REQUESTS
// ======================================================

const getBloodRequests = async (req, res) => {
  try {

    const currentUserId =
      req.user.userId;


    // ==================================================
    // GET CURRENT USER
    // ==================================================

    const currentUser =
      await User.findById(currentUserId);


    if (!currentUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }


    // ==================================================
    // CURRENT LOCATION
    // ==================================================

    const currentUserCity =
      currentUser.currentCity?.trim() ||
      currentUser.city?.trim();


    const currentUserBloodGroup =
      currentUser.bloodGroup;


    // ==================================================
    // 60 DAYS DONATION ELIGIBILITY
    // ==================================================

    let donationEligible = true;


    if (currentUser.lastDonationDate) {

      const today = new Date();

      const lastDonation =
        new Date(
          currentUser.lastDonationDate
        );


      const differenceInMilliseconds =
        today.getTime() -
        lastDonation.getTime();


      const differenceInDays =
        differenceInMilliseconds /
        (1000 * 60 * 60 * 24);


      donationEligible =
        differenceInDays >= 60;
    }


    // ==================================================
    // GET ALL BLOOD REQUESTS
    // ==================================================

    const bloodRequests =
      await BloodRequest.find()
        .sort({
          createdAt: -1
        });


    // ==================================================
    // MY REQUESTS
    // ==================================================

    const myRequests =
      bloodRequests.filter(
        (request) =>
          request.requestedBy
            .toString() ===
          currentUserId.toString()
      );


    const availableRequests = !currentUser.availableToDonate
      ? []
      : bloodRequests.filter(
          (request) => {

          // --------------------------------------------
          // DON'T SHOW USER'S OWN REQUEST
          // --------------------------------------------

          if (
            request.requestedBy
              .toString() ===
            currentUserId.toString()
          ) {
            return false;
          }


          // --------------------------------------------
          // ONLY PENDING REQUESTS
          // --------------------------------------------

          if (
            request.status !==
            "Pending"
          ) {
            return false;
          }


          // --------------------------------------------
          // 60 DAYS ELIGIBILITY
          // --------------------------------------------

          if (!donationEligible) {
            return false;
          }


          // --------------------------------------------
          // CITY CHECK
          // --------------------------------------------

          if (
            !request.city ||
            !currentUserCity
          ) {
            return false;
          }


          const sameCity =
            request.city
              .toLowerCase()
              .trim() ===
            currentUserCity
              .toLowerCase()
              .trim();


          if (!sameCity) {
            return false;
          }


          // --------------------------------------------
          // BLOOD COMPATIBILITY
          // --------------------------------------------

          if (
            !currentUserBloodGroup ||
            !request.bloodGroup
          ) {
            return false;
          }


          return canDonate(
            currentUserBloodGroup,
            request.bloodGroup
          );

        }
      );


    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({

      message:
        "Blood requests fetched successfully",

      donationEligible,

      myRequests,

      availableRequests

    });

  } catch (error) {

    console.error(
      "Get blood requests error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error"
    });
  }
};


// ======================================================
// GET MY DONOR RESPONSES
// ======================================================

const getMyDonorResponses = async (req, res) => {
  try {

    const currentUserId =
      req.user.userId;


    // ==================================================
    // CHECK USER
    // ==================================================

    const user =
      await User.findById(currentUserId);


    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }


    // ==================================================
    // FIND DONOR RESPONSES
    // ==================================================

    const responses =
      await DonorResponse.find({
        donor: currentUserId
      })
        .populate(
          "bloodRequest",
          "patientName bloodGroup hospital unitsRequired urgency city pinCode contactNumber description status requestedBy createdAt"
        )
        .sort({
          createdAt: -1
        });


    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({

      message:
        "Your donor responses fetched successfully",

      count:
        responses.length,

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
// DELETE BLOOD REQUEST
// ======================================================

const deleteBloodRequest = async (req, res) => {
  try {

    const requestId =
      req.params.id;


    // ==================================================
    // FIND REQUEST
    // ==================================================

    const bloodRequest =
      await BloodRequest.findById(requestId);


    if (!bloodRequest) {
      return res.status(404).json({
        message: "Blood request not found"
      });
    }


    // ==================================================
    // OWNERSHIP CHECK
    // ==================================================

    if (
      bloodRequest.requestedBy.toString() !==
      req.user.userId.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to delete this request"
      });
    }


    // ==================================================
    // DELETE REQUEST
    // ==================================================

    await BloodRequest.findByIdAndDelete(
      requestId
    );


    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({

      message:
        "Blood request deleted successfully"

    });

  } catch (error) {

    console.error(
      "Delete blood request error:",
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
  createBloodRequest,
  getBloodRequests,
  getMyDonorResponses,
  deleteBloodRequest
};