const express = require("express");
const router = express.Router();
const { getJobs, postJob } = require("../controllers/jobController");

const isAuth = require("../middleware/isAuth");
const isRecruiter = require("../middleware/isRecruiter");

// All users must be logged in to see jobs
router.get("/jobs", isAuth, getJobs);

// Only recruiter can access post-job form
router.get("/post-job", isAuth, isRecruiter, (req, res) => {
  res.render("jobs/postJob");
});

router.post("/post-job", isAuth, isRecruiter, postJob);

module.exports = router;
