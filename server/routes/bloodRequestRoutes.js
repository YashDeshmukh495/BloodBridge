const express = require("express");

const {
  createBloodRequest,
  getBloodRequests,
  getMyDonorResponses,
  deleteBloodRequest
} = require("../controllers/bloodRequestController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ======================================================
// CREATE BLOOD REQUEST
// ======================================================

router.post(
  "/",
  authMiddleware,
  createBloodRequest
);


// ======================================================
// GET MY DONOR RESPONSES
// IMPORTANT: Keep this BEFORE /:id
// ======================================================

router.get(
  "/my-responses",
  authMiddleware,
  getMyDonorResponses
);


// ======================================================
// GET BLOOD REQUESTS
// ======================================================

router.get(
  "/",
  authMiddleware,
  getBloodRequests
);


// ======================================================
// DELETE BLOOD REQUEST
// ======================================================

router.delete(
  "/:id",
  authMiddleware,
  deleteBloodRequest
);


module.exports = router;