const express = require("express");
const router = express.Router();

const recruiterController = require("../controllers/recruiterController");

const isAuth = require("../middleware/isAuth");
const isRecruiter = require("../middleware/isRecruiter");

// Dashboard
router.get(
  "/recruiter/dashboard",
  isAuth,
  isRecruiter,
  recruiterController.recruiterDashboard
);

// View applicants for a job
router.get(
  "/recruiter/job/:jobId/applicants",
  isAuth,
  isRecruiter,
  recruiterController.viewApplicants
);

// Update applicant status
router.post(
  "/recruiter/update-status",
  isAuth,
  isRecruiter,
  recruiterController.updateStatus
);

// Download resume
router.get(
  "/recruiter/resume/:applicationId",
  isAuth,
  isRecruiter,
  recruiterController.downloadResume
);

// Edit job form
router.get(
  "/recruiter/job/:jobId/edit",
  isAuth,
  isRecruiter,
  recruiterController.editJobForm
);

// Save edited job
router.post(
  "/recruiter/job/:jobId/edit",
  isAuth,
  isRecruiter,
  recruiterController.editJob
);

// Delete job
router.post(
  "/recruiter/job/:jobId/delete",
  isAuth,
  isRecruiter,
  recruiterController.deleteJob
);

// Profile
router.get(
  "/recruiter/profile",
  isAuth,
  isRecruiter,
  recruiterController.getProfile
);

router.post(
  "/recruiter/profile",
  isAuth,
  isRecruiter,
  recruiterController.updateProfile
);

module.exports = router;