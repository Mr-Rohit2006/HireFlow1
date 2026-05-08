const Job = require("../models/Job");
const User = require("../models/User");
const Application = require("../models/Application");

// =====================================
// STUDENT DASHBOARD
// =====================================
exports.studentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;

    const totalJobs = await Job.countDocuments();

    const applications = await Application.find({
      student: studentId
    }).populate("job");

    const totalApplied = applications.length;
    const shortlisted = applications.filter(
      a => a.status === "Shortlisted"
    ).length;

    const rejected = applications.filter(
      a => a.status === "Rejected"
    ).length;

    const pending = applications.filter(
      a => a.status === "Pending"
    ).length;

    // Recommended Jobs
    let preferredLocation = "";
    let preferredType = "";

    if (applications.length > 0 && applications[0].job) {
      preferredLocation = applications[0].job.location;
      preferredType = applications[0].job.jobType;
    }

    let recommendedJobs = await Job.find({
      $or: [
        { location: preferredLocation },
        { jobType: preferredType }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(5);

    if (recommendedJobs.length === 0) {
      recommendedJobs = await Job.find()
        .sort({ createdAt: -1 })
        .limit(5);
    }

    res.render("student/dashboard", {
      user: req.user,
      totalJobs,
      totalApplied,
      shortlisted,
      rejected,
      pending,
      applications,
      recommendedJobs
    });

  } catch (error) {
    console.log(error);
    res.status(500).render("error", {
      title: "Dashboard Error",
      message: "An unexpected error occurred while loading your dashboard."
    });
  }
};

// =====================================
// GET PROFILE
// =====================================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.render("student/profile", {
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

// =====================================
// UPDATE PROFILE
// =====================================
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, skills } = req.body;

    const updateData = { name, phone, bio, skills };

    if (req.file) {
      // ✅ Buffer ko base64 me convert karke DB me store karo
      updateData.resume = {
        data: req.file.buffer.toString("base64"),
        originalName: req.file.originalname
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    );

    // Re-issue JWT with updated name (in case name changed)
    const generateToken = require("../utils/generateToken");
    const token = generateToken(updatedUser);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax"
    });

    res.render("student/profile", {
      user: updatedUser,
      success: "Profile updated successfully!",
      error: null
    });

  } catch (error) {
    console.log(error);

    const user = await User.findById(req.user._id);

    res.render("student/profile", {
      user,
      success: null,
      error: "Update failed. Try again."
    });
  }
};

// =====================================
// SAVE / UNSAVE JOB (toggle)
// =====================================
exports.saveJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    const user = await User.findById(req.user._id);

    if (!user.savedJobs) {
      user.savedJobs = [];
    }

    const index = user.savedJobs.findIndex(
      id => id.toString() === jobId
    );

    if (index > -1) {
      user.savedJobs.splice(index, 1);
    } else {
      user.savedJobs.push(jobId);
    }

    await user.save();

    res.redirect("/saved-jobs");

  } catch (error) {
    console.log(error);
    res.status(500).render("error", {
      title: "Action Failed",
      message: "We couldn't save/unsave the job. Please try again."
    });
  }
};

// =====================================
// SAVED JOBS PAGE
// =====================================
exports.viewResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.resume || !user.resume.data) {
      return res.status(404).send("Resume not found.");
    }

    const pdfBuffer = Buffer.from(user.resume.data, "base64");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${user.resume.originalName || 'resume.pdf'}"`
    );
    res.send(pdfBuffer);

  } catch (error) {
    console.log(error);
    res.status(500).send("Could not load resume.");
  }
};

// =====================================
// VIEW SAVED JOBS
// =====================================
exports.savedJobs = async (req, res) => {


  try {
    const user = await User.findById(req.user._id);

    const jobs = await Job.find({
      _id: { $in: user.savedJobs || [] }
    });

    const applications = await Application.find({
      student: req.user._id
    });

    const appliedJobIds = applications.map(app =>
      app.job.toString()
    );

    res.render("student/saved-jobs", {
      user,
      jobs,
      appliedJobIds
    });

  } catch (error) {
    console.log(error);
    res.status(500).render("error", {
      title: "Fetch Error",
      message: "Could not retrieve your saved jobs."
    });
  }
};
