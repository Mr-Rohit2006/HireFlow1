const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["student", "recruiter"],
    default: "student"
  },
  resetToken: String,
  resetTokenExpiry: Date,
  // Profile fields
  phone: String,
  bio: String,
  skills: String,
  resume: {
    data: String,        // base64 encoded PDF
    originalName: String
  },
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }]
});

module.exports = mongoose.model("User", userSchema);