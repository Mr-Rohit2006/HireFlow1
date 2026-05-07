const Job = require("../models/Job");
const Application = require("../models/Application");
const User = require("../models/User");

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    const user = await User.findById(req.user._id);

    const myApplications = await Application.find({
      student: req.user._id
    });

    const appliedJobIds = myApplications.map(a => a.job.toString());

    res.render("jobs/jobs", { jobs, user, appliedJobIds });
  } catch (error) {
    console.error("Get Jobs Error:", error);
    res.status(500).render("error", {
      title: "Fetch Error",
      message: "Could not retrieve the job listings."
    });
  }
};

exports.postJob = async (req, res) => {
  try {
    await Job.create({
      title:       req.body.title,
      company:     req.body.company,
      location:    req.body.location,
      salary:      req.body.salary,
      jobType:     req.body.jobType,
      description: req.body.description,
      recruiter:   req.user._id
    });

    res.redirect("/recruiter/dashboard");
  } catch (error) {
    console.error("Post Job Error:", error);
    res.status(500).render("error", {
      title: "Post Job Failed",
      message: "There was an error while posting the job. Please check your inputs."
    });
  }
};