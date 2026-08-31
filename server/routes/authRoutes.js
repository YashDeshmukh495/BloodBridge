const express = require("express");

const {
  registerUser,
  loginUser,
  updateLocation,
  getUserProfile,
  updateAvailability,
  getAvailableDonors
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ==================== REGISTER ====================

router.post("/register", registerUser);


// ==================== LOGIN ====================

router.post("/login", loginUser);


// ==================== UPDATE CURRENT LOCATION ====================

router.put(
  "/update-location",
  authMiddleware,
  updateLocation
);


// ==================== PROTECTED PROFILE ====================

router.get(
  "/profile",
  authMiddleware,
  getUserProfile
);


// ==================== UPDATE DONOR AVAILABILITY ====================

router.put(
  "/availability",
  authMiddleware,
  updateAvailability
);


// ==================== GET AVAILABLE DONORS ====================

router.get(
  "/donors",
  authMiddleware,
  getAvailableDonors
);


module.exports = router;