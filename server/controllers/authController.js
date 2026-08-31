const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");


// ======================================================
// HELPER - CALCULATE AGE
// ======================================================

const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const monthDifference =
    today.getMonth() -
    birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      today.getDate() < birthDate.getDate()
    )
  ) {
    age--;
  }

  return age;
};


// ======================================================
// HELPER - CHECK 60 DAYS
// ======================================================

const isDonationEligibleByDate = (lastDonationDate) => {
  if (!lastDonationDate) {
    return true;
  }

  const today = new Date();
  const lastDonation = new Date(lastDonationDate);

  const differenceInMilliseconds =
    today.getTime() -
    lastDonation.getTime();

  const differenceInDays =
    differenceInMilliseconds /
    (1000 * 60 * 60 * 24);

  return differenceInDays >= 60;
};


// ======================================================
// REGISTER
// ======================================================

const registerUser = async (req, res) => {
  try {

    const {
      name,
      email,
      password,
      confirmPassword,
      mobile,
      bloodGroup,
      dateOfBirth,
      weight,
      hasDonatedBefore,
      lastDonationDate,
      city,
      pinCode
    } = req.body;


    // ==================================================
    // REQUIRED FIELDS
    // ==================================================

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !mobile ||
      !bloodGroup ||
      !dateOfBirth ||
      weight === undefined ||
      weight === null ||
      !city ||
      !pinCode ||
      hasDonatedBefore === undefined ||
      hasDonatedBefore === null
    ) {
      return res.status(400).json({
        message: "All required fields are required"
      });
    }


    // ==================================================
    // PASSWORD CHECK
    // ==================================================

    if (password !== confirmPassword) {
      return res.status(400).json({
        message:
          "Password and Confirm Password do not match"
      });
    }


    // ==================================================
    // MOBILE VALIDATION
    // ==================================================

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({
        message:
          "Please enter a valid 10-digit mobile number"
      });
    }


    // ==================================================
    // PIN CODE VALIDATION
    // ==================================================

    if (!/^\d{6}$/.test(pinCode)) {
      return res.status(400).json({
        message:
          "Please enter a valid 6-digit PIN code"
      });
    }


    // ==================================================
    // DATE OF BIRTH VALIDATION
    // ==================================================

    const parsedDateOfBirth =
      new Date(dateOfBirth);

    if (
      Number.isNaN(
        parsedDateOfBirth.getTime()
      )
    ) {
      return res.status(400).json({
        message: "Please enter a valid date of birth"
      });
    }


    // ==================================================
    // AGE CHECK
    // ==================================================

    const age =
      calculateAge(parsedDateOfBirth);

    if (age < 18) {
      return res.status(400).json({
        message:
          "You must be at least 18 years old to register as a donor"
      });
    }


    // ==================================================
    // WEIGHT VALIDATION
    // ==================================================

    const numericWeight =
      Number(weight);

    if (
      Number.isNaN(numericWeight) ||
      numericWeight < 60
    ) {
      return res.status(400).json({
        message:
          "Minimum weight required for blood donation is 60 kg"
      });
    }


    // ==================================================
    // PREVIOUS DONATION VALIDATION
    // ==================================================

    const donatedBefore =
      hasDonatedBefore === true ||
      hasDonatedBefore === "true";


    let finalLastDonationDate = null;


    // ==================================================
    // IF USER DONATED BEFORE
    // ==================================================

    if (donatedBefore) {

      if (!lastDonationDate) {
        return res.status(400).json({
          message:
            "Please provide your last blood donation date"
        });
      }


      finalLastDonationDate =
        new Date(lastDonationDate);


      if (
        Number.isNaN(
          finalLastDonationDate.getTime()
        )
      ) {
        return res.status(400).json({
          message:
            "Please enter a valid last donation date"
        });
      }


      // Future date not allowed

      if (
        finalLastDonationDate > new Date()
      ) {
        return res.status(400).json({
          message:
            "Last donation date cannot be in the future"
        });
      }


      // ==================================================
      // 60 DAYS CHECK
      // ==================================================

      if (
        !isDonationEligibleByDate(
          finalLastDonationDate
        )
      ) {
        return res.status(400).json({
          message:
            "You must wait 60 days after your last blood donation before donating again"
        });
      }

    }


    // ==================================================
    // EMAIL VALIDATION
    // ==================================================

    const normalizedEmail =
      email.toLowerCase().trim();


    const existingEmail =
      await User.findOne({
        email: normalizedEmail
      });


    if (existingEmail) {
      return res.status(409).json({
        message:
          "Email is already registered"
      });
    }


    // ==================================================
    // MOBILE CHECK
    // ==================================================

    const existingMobile =
      await User.findOne({
        mobile
      });


    if (existingMobile) {
      return res.status(409).json({
        message:
          "Mobile number is already registered"
      });
    }


    // ==================================================
    // PASSWORD HASH
    // ==================================================

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );


    // ==================================================
    // CREATE USER
    // ==================================================

    const user =
      await User.create({

        name:
          name.trim(),

        email:
          normalizedEmail,

        password:
          hashedPassword,

        mobile,

        bloodGroup,

        dateOfBirth:
          parsedDateOfBirth,

        weight:
          numericWeight,

        hasDonatedBefore:
          donatedBefore,

        lastDonationDate:
          finalLastDonationDate,

        city:
          city.trim(),

        pinCode,

        // Current location initially
        // same as registration location

        currentCity:
          city.trim(),

        currentPinCode:
          pinCode
      });


    // ==================================================
    // RESPONSE
    // ==================================================

    res.status(201).json({

      message:
        "User registered successfully",

      user: {

        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        mobile:
          user.mobile,

        bloodGroup:
          user.bloodGroup,

        dateOfBirth:
          user.dateOfBirth,

        weight:
          user.weight,

        hasDonatedBefore:
          user.hasDonatedBefore,

        lastDonationDate:
          user.lastDonationDate,

        city:
          user.city,

        pinCode:
          user.pinCode,

        currentCity:
          user.currentCity,

        currentPinCode:
          user.currentPinCode,

        availableToDonate:
          user.availableToDonate,

        donationsCount:
          user.donationsCount || 0,

        bloodReceivedCount:
          user.bloodReceivedCount || 0
      }

    });

  } catch (error) {

    console.error(
      "Registration error:",
      error.message
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};


// ======================================================
// LOGIN
// ======================================================

const loginUser = async (req, res) => {
  try {

    const {
      email,
      password
    } = req.body;


    // ==================================================
    // VALIDATION
    // ==================================================

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required"
      });
    }


    // ==================================================
    // FIND USER
    // ==================================================

    const user =
      await User.findOne({
        email:
          email.toLowerCase().trim()
      });


    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password"
      });
    }


    // ==================================================
    // CHECK PASSWORD
    // ==================================================

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!isPasswordCorrect) {
      return res.status(401).json({
        message:
          "Invalid email or password"
      });
    }


    // ==================================================
    // JWT TOKEN
    // ==================================================

    const token =
      jwt.sign(
        {
          userId: user._id
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "7d"
        }
      );


    // ==================================================
    // LOGIN RESPONSE
    // ==================================================

    res.status(200).json({

      message:
        "Login successful",

      token,

      user: {

        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        mobile:
          user.mobile,

        bloodGroup:
          user.bloodGroup,

        dateOfBirth:
          user.dateOfBirth,

        weight:
          user.weight,

        hasDonatedBefore:
          user.hasDonatedBefore,

        lastDonationDate:
          user.lastDonationDate,

        city:
          user.city,

        pinCode:
          user.pinCode,

        currentCity:
          user.currentCity,

        currentPinCode:
          user.currentPinCode,

        availableToDonate:
          user.availableToDonate,

        donationsCount:
          user.donationsCount || 0,

        bloodReceivedCount:
          user.bloodReceivedCount || 0
      }

    });

  } catch (error) {

    console.error(
      "Login error:",
      error.message
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};


// ======================================================
// UPDATE CURRENT LOCATION
// ======================================================

const updateLocation = async (req, res) => {
  try {

    const {
      city,
      pinCode
    } = req.body;


    // ==================================================
    // VALIDATION
    // ==================================================

    if (!city || !pinCode) {
      return res.status(400).json({
        message:
          "City and PIN code are required"
      });
    }


    // ==================================================
    // PIN VALIDATION
    // ==================================================

    if (!/^\d{6}$/.test(pinCode)) {
      return res.status(400).json({
        message:
          "Please enter a valid 6-digit PIN code"
      });
    }


    // ==================================================
    // UPDATE USER
    // ==================================================

    const user =
      await User.findByIdAndUpdate(

        req.user.userId,

        {
          $set: {

            currentCity:
              city.trim(),

            currentPinCode:
              pinCode
          }
        },

        {
          new: true,
          runValidators: false
        }
      );


    // ==================================================
    // USER NOT FOUND
    // ==================================================

    if (!user) {
      return res.status(404).json({
        message:
          "User not found"
      });
    }


    // ==================================================
    // RESPONSE
    // ==================================================

    res.status(200).json({

      message:
        "Current location updated successfully",

      user: {

        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        mobile:
          user.mobile,

        bloodGroup:
          user.bloodGroup,

        dateOfBirth:
          user.dateOfBirth,

        weight:
          user.weight,

        hasDonatedBefore:
          user.hasDonatedBefore,

        lastDonationDate:
          user.lastDonationDate,

        city:
          user.city,

        pinCode:
          user.pinCode,

        currentCity:
          user.currentCity,

        currentPinCode:
          user.currentPinCode,

        availableToDonate:
          user.availableToDonate,

        donationsCount:
          user.donationsCount || 0,

        bloodReceivedCount:
          user.bloodReceivedCount || 0
      }

    });

  } catch (error) {

    console.error(
      "Update current location error:",
      error.message
    );

    res.status(500).json({
      message:
        "Server error"
    });
  }
};


// ======================================================
// GET USER PROFILE
// ======================================================

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const BloodRequest = require("../models/BloodRequest");
    const requestsCreatedCount = await BloodRequest.countDocuments({ requestedBy: req.user.userId });
    
    user.requestsCreatedCount = requestsCreatedCount;

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get profile error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// ======================================================
// UPDATE DONOR AVAILABILITY
// ======================================================

const updateAvailability = async (req, res) => {
  try {
    const { availableToDonate } = req.body;
    if (availableToDonate === undefined) {
      return res.status(400).json({ message: "availableToDonate is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { availableToDonate } },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Availability status updated successfully",
      user
    });
  } catch (error) {
    console.error("Update availability error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// ======================================================
// GET AVAILABLE COMPATIBLE DONORS
// ======================================================

const getAvailableDonors = async (req, res) => {
  try {
    const { bloodGroup, city } = req.query;

    const query = {
      availableToDonate: true,
      _id: { $ne: req.user.userId }
    };

    if (city) {
      query.$or = [
        { city: { $regex: new RegExp(city.trim(), "i") } },
        { currentCity: { $regex: new RegExp(city.trim(), "i") } }
      ];
    }

    let donors = await User.find(query).select("-password");

    // Filter by compatibility if bloodGroup (required recipient group) is specified
    if (bloodGroup) {
      const { canDonate } = require("../utils/bloodCompatibility");
      donors = donors.filter(donor => canDonate(donor.bloodGroup, bloodGroup));
    }

    return res.status(200).json({
      message: "Available donors fetched successfully",
      count: donors.length,
      donors
    });
  } catch (error) {
    console.error("Get available donors error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  registerUser,
  loginUser,
  updateLocation,
  getUserProfile,
  updateAvailability,
  getAvailableDonors
};