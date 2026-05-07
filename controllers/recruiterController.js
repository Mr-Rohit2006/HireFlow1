const Job = require("../models/Job");
const User = require("../models/User");
const Application = require("../models/Application");
const path = require("path");
const sendMail = require("../utils/sendmail");

// ─────────────────────────────────────────
// Recruiter Dashboard
// ─────────────────────────────────────────
exports.recruiterDashboard = async (req, res) => {
  try {
    const recruiterId = req.user._id;

    const jobs = await Job.find({ recruiter: recruiterId });
    const totalJobs = jobs.length;

    const jobIds = jobs.map(job => job._id);

    const totalApplications = await Application.countDocuments({
      job: { $in: jobIds }
    });

    res.render("recruiter/dashboard", {
      user: req.user,
      jobs,
      totalJobs,
      totalApplications
    });

  } catch (err) {
    console.log(err);
    res.status(500).render("error", {
      title: "Dashboard Error",
      message: "An unexpected error occurred while loading your dashboard."
    });
  }
};


// ─────────────────────────────────────────
// View Applicants
// ─────────────────────────────────────────
exports.viewApplicants = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const jobId = req.params.jobId;

    const job = await Job.findOne({
      _id: jobId,
      recruiter: recruiterId
    });

    if (!job) {
      return res.status(403).render("error", {
        title: "Unauthorized Access",
        message: "You do not have permission to view this application."
      });
    }

    const applications = await Application.find({
      job: jobId
    })
      .populate("student")
      .populate("job");

    res.render("recruiter/applicants", {
      user: req.user,
      job,
      applications
    });

  } catch (err) {
    console.log(err);
    res.status(500).render("error", {
      title: "Error Fetching Applicants",
      message: "We encountered an issue while retrieving the applicant list."
    });
  }
};


// ─────────────────────────────────────────
// Update Status + Auto Mail
// ─────────────────────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { applicationId, status, jobId } = req.body;

    const application = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    )
      .populate("student")
      .populate("job");

    // ===============================
    // SHORTLIST MAIL
    // ===============================
    if (status === "Shortlisted" && application?.student?.email) {

      await sendMail(
        application.student.email,
        "Congratulations! You are shortlisted 🎉",
        `
          <h2>Hello ${application.student.name}</h2>

          <p>You have been <b>shortlisted</b> for:</p>

          <h3>${application.job.title}</h3>
          <p>${application.job.company}</p>

          <p><b>Next Process:</b></p>
          <p>
            Our hiring team will contact you soon for the next round
            (Interview / Technical Round / HR Round).
          </p>

          <br>
          <p>Best Wishes,</p>
          <p><b>HireFlow Recruitment Team</b></p>
        `
      );
    }

    // ===============================
    // REJECT MAIL
    // ===============================
    if (status === "Rejected" && application?.student?.email) {

      await sendMail(
        application.student.email,
        "Application Update from HireFlow",
        `
          <h2>Hello ${application.student.name}</h2>

          <p>Thank you for applying for:</p>

          <h3>${application.job.title}</h3>
          <p>${application.job.company}</p>

          <p>
            After careful review, we regret to inform you that
            you have not been selected for this opportunity.
          </p>

          <p>
            We appreciate your interest and encourage you to
            apply for future openings.
          </p>

          <br>
          <p>We wish you success in your career journey.</p>

          <p><b>HireFlow Recruitment Team</b></p>
        `
      );
    }

    res.redirect(`/recruiter/job/${jobId}/applicants`);

  } catch (err) {
    console.log(err);
    res.status(500).render("error", {
      title: "Status Update Failed",
      message: "There was an error updating the application status. Please try again."
    });
  }
};


// ─────────────────────────────────────────
// Download Resume
// ─────────────────────────────────────────
exports.downloadResume = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);

    if (!application || !application.resume || !application.resume.data) {
      return res.status(404).render("error", {
        title: "Resume Not Found",
        message: "The requested resume could not be found."
      });
    }

    // ✅ DB se base64 decode karke seedha browser ko bhejo
    const pdfBuffer = Buffer.from(application.resume.data, "base64");
    const fileName = application.resume.originalName || "resume.pdf";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    res.send(pdfBuffer);

  } catch (err) {
    console.log(err);
    res.status(500).render("error", {
      title: "Download Error",
      message: "An error occurred while trying to download the resume."
    });
  }
};


// ─────────────────────────────────────────
// Edit Job Form
// ─────────────────────────────────────────
exports.editJobForm = async (req, res) => {
  try {
    const recruiterId = req.user._id;

    const job = await Job.findOne({
      _id: req.params.jobId,
      recruiter: recruiterId
    });

    if (!job) {
      return res.status(403).render("error", {
        title: "Unauthorized Action",
        message: "You are not authorized to edit this job."
      });
    }

    res.render("recruiter/edit-job", {
      user: req.user,
      job,
      error: null
    });

  } catch (err) {
    console.log(err);
    res.status(500).render("error", {
      title: "Edit Form Error",
      message: "Could not load the edit job form."
    });
  }
};


// ─────────────────────────────────────────
// Edit Job Save
// ─────────────────────────────────────────
exports.editJob = async (req, res) => {
  try {
    const recruiterId = req.user._id;

    const {
      title,
      company,
      location,
      type,
      salary,
      skills,
      description
    } = req.body;

    const job = await Job.findOne({
      _id: req.params.jobId,
      recruiter: recruiterId
    });

    if (!job) {
      return res.status(403).render("error", {
        title: "Unauthorized Action",
        message: "You are not authorized to update this job."
      });
    }

    await Job.findByIdAndUpdate(req.params.jobId, {
      title,
      company,
      location,
      type,
      salary,
      skills,
      description
    });

    res.redirect("/recruiter/dashboard");

  } catch (err) {
    console.log(err);
    res.status(500).render("error", {
      title: "Update Failed",
      message: "Failed to update the job details."
    });
  }
};


// ─────────────────────────────────────────
// Delete Job
// ─────────────────────────────────────────
exports.deleteJob = async (req, res) => {
  try {
    const recruiterId = req.user._id;

    const job = await Job.findOne({
      _id: req.params.jobId,
      recruiter: recruiterId
    });

    if (!job) {
      return res.status(403).render("error", {
        title: "Unauthorized Action",
        message: "You are not authorized to delete this job."
      });
    }

    await Application.deleteMany({
      job: req.params.jobId
    });

    await Job.findByIdAndDelete(req.params.jobId);

    res.redirect("/recruiter/dashboard");

  } catch (err) {
    console.log(err);
    res.status(500).render("error", {
      title: "Delete Failed",
      message: "There was an error while deleting the job."
    });
  }
};


// ─────────────────────────────────────────
// Get Profile
// ─────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.render("recruiter/profile", {
      user,
      success: null,
      error: null
    });

  } catch (error) {
    console.log(error);
    res.status(500).render("error", {
      title: "Profile Error",
      message: "Could not load your profile."
    });
  }
};


// ─────────────────────────────────────────
// Update Profile
// ─────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, bio } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, bio },
      { new: true }
    );

    // Re-issue JWT with updated name
    const generateToken = require("../utils/generateToken");
    const token = generateToken(updatedUser);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax"
    });

    res.render("recruiter/profile", {
      user: updatedUser,
      success: "Profile updated successfully!",
      error: null
    });

  } catch (error) {
    console.log(error);

    const user = await User.findById(req.user._id);

    res.render("recruiter/profile", {
      user,
      success: null,
      error: "Update failed. Try again."
    });
  }
};