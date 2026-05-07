const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const sendMail = require("../utils/sendmail");
const { analyzeResume } = require("../utils/atsAnalyzer");

// ===================================
// CHECK ATS SCORE (PRE-APPLY)
// ===================================
exports.checkScoreOnly = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No resume uploaded" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // ✅ Buffer directly use karo — disk par kuch nahi gaya
    console.log(`Checking ATS score for job: ${job.title}...`);
    const score = await analyzeResume(req.file.buffer, job.description);

    res.json({ success: true, score });

  } catch (error) {
    console.error("Score Check Error:", error);
    res.status(500).json({ success: false, message: "Internal server error during analysis" });
  }
};

// ===================================
// APPLY JOB
// ===================================
exports.applyJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const studentId = req.user._id;

    // Already Applied Check
    const alreadyApplied = await Application.findOne({
      job: jobId,
      student: studentId
    });

    if (alreadyApplied) {
      return res.render("error", {
        title: "Already Applied",
        message: "You have already submitted an application for this position."
      });
    }

    // ✅ Buffer ko base64 me convert karke DB me store karo
    const resumeBase64 = req.file.buffer.toString("base64");

    // Save Application
    const application = await Application.create({
      job: jobId,
      student: studentId,
      resume: {
        data: resumeBase64,
        originalName: req.file.originalname
      },
      status: "Pending"
    });

    console.log("Application Saved. Starting AI Analysis...");

    // Fetch Job for analysis
    const job = await Job.findById(jobId).populate("recruiter");

    // ✅ Buffer directly pass karo analyzer ko
    try {
      const score = await analyzeResume(req.file.buffer, job.description);
      application.atsScore = score;
      await application.save();
      console.log("AI Analysis Completed. Score:", score);
    } catch (aiError) {
      console.error("AI Analysis Failed:", aiError);
    }

    // Use already fetched job and fetch student
    const student = await User.findById(studentId);

    // ===============================
    // Mail to Student
    // ===============================
    console.log("Sending Student Mail...");

    await sendMail(
      student.email,
      "Application Submitted Successfully",
      `
      <h2>Hello ${student.name}</h2>
      <p>You successfully applied for:</p>
      <h3>${job.title}</h3>
      <p>${job.company}</p>
      <br>
      <p>Your application status is <b>Pending</b>.</p>
      <p>Recruiter will contact you soon.</p>
      <p><b>HireFlow Team</b></p>
      `
    );

    // ===============================
    // Mail to Recruiter
    // ===============================
    if (job.recruiter && job.recruiter.email) {
      console.log("Sending Recruiter Mail...");

      await sendMail(
        job.recruiter.email,
        "New Job Application Received",
        `
        <h2>Hello Recruiter</h2>
        <p><b>${student.name}</b> applied for:</p>
        <h3>${job.title}</h3>
        <p>${job.company}</p>
        <p>Please review candidate application.</p>
        `
      );
    }

    return res.redirect("/jobs");

  } catch (error) {
    console.log("Apply Job Error:", error);
    res.status(500).render("error", {
      title: "Application Error",
      message: "There was an error while submitting your application. Please try again."
    });
  }
};

// ===================================
// MY APPLICATIONS
// ===================================
exports.myApplications = async (req, res) => {
  try {
    const studentId = req.user._id;

    const applications = await Application.find({
      student: studentId
    }).populate("job");

    res.render("applications/applications", {
      applications
    });

  } catch (error) {
    console.log("My Applications Error:", error);
    res.status(500).render("error", {
      title: "Fetch Error",
      message: "We couldn't retrieve your applications at this time."
    });
  }
};