const express = require("express");

const {
  respondToBloodRequest,
  getDonorResponses,
  getMyDonorResponses,
  acceptDonorResponse,
  rejectDonorResponse,
  submitDonorEligibility,
  completeBloodDonation
} = require("../controllers/donorResponseController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================
// DONOR RESPONDS TO BLOOD REQUEST
// ======================================================

router.post(
  "/:id/respond",
  authMiddleware,
  respondToBloodRequest
);

// ======================================================
// DONOR GETS HIS OWN RESPONSES
// IMPORTANT: keep this BEFORE /:id/responses
// ======================================================

router.get(
  "/my-responses",
  authMiddleware,
  getMyDonorResponses
);

// ======================================================
// REQUEST OWNER GETS DONOR RESPONSES
// ======================================================

router.get(
  "/:id/responses",
  authMiddleware,
  getDonorResponses
);

// ======================================================
// REQUEST OWNER ACCEPTS DONOR
// ======================================================

router.put(
  "/response/:responseId/accept",
  authMiddleware,
  acceptDonorResponse
);

// ======================================================
// REQUEST OWNER REJECTS DONOR
// ======================================================

router.put(
  "/response/:responseId/reject",
  authMiddleware,
  rejectDonorResponse
);

// ======================================================
// DONOR SUBMITS ELIGIBILITY
// ======================================================

router.put(
  "/response/:responseId/eligibility",
  authMiddleware,
  submitDonorEligibility
);

// ======================================================
// REQUEST OWNER CONFIRMS BLOOD DONATED
// ======================================================

router.put(
  "/response/:responseId/complete",
  authMiddleware,
  completeBloodDonation
);

module.exports = router;              