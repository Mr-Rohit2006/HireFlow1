const express = require("express");
const router = express.Router();
const isAuth    = require("../middleware/isAuth");
const isStudent = require("../middleware/isStudent");
const upload    = require("../middleware/uploadResume");

const {
  studentDashboard,
  getProfile,
  updateProfile,
  saveJob,
  savedJobs,
  viewResume
} = require("../controllers/studentController");

router.get("/dashboard", isAuth, isStudent, studentDashboard);

// Profile
router.get("/profile",  isAuth, isStudent, getProfile);
router.post("/profile", isAuth, isStudent, upload.single("resume"), updateProfile);

// Resume view
router.get("/resume/view", isAuth, isStudent, viewResume);

// Saved Jobs
router.get("/saved-jobs",       isAuth, isStudent, savedJobs);
router.post("/save-job/:jobId", isAuth, isStudent, saveJob);

module.exports = router;