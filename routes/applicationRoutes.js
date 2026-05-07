const express = require("express");
const router = express.Router();

const isAuth = require("../middleware/isAuth");
const isStudent = require("../middleware/isStudent");
const upload = require("../middleware/uploadResume");

const applicationController = require("../controllers/applicationController");

router.post(
  "/apply/:jobId",
  isAuth,
  isStudent,
  upload.single("resume"),
  applicationController.applyJob
);

router.post(
  "/api/check-ats/:jobId",
  isAuth,
  isStudent,
  upload.single("resume"),
  applicationController.checkScoreOnly
);

router.get(
  "/my-applications",
  isAuth,
  isStudent,
  applicationController.myApplications
);

module.exports = router;