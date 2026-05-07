// app.js

const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./config/db");
connectDB();

const app = express();

// ======================
// View Engine
// ======================
app.set("view engine", "ejs");

// ======================
// Middleware
// ======================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// ======================
// Global Middleware (Auth Context)
// ======================
app.use((req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const jwt = require("jsonwebtoken");
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.user = req.user;
    } catch (err) {
      res.clearCookie("token");
    }
  } else {
    res.locals.user = null;
  }
  next();
});

// ======================
// Route Imports
// ======================
const authRoutes        = require("./routes/authRoutes");
const recruiterRoutes   = require("./routes/recruiterRoutes");
const jobRoutes         = require("./routes/jobRoutes");
const studentRoutes     = require("./routes/studentRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

// ======================
// Routes Use
// ======================
app.use("/", authRoutes);
app.use("/", recruiterRoutes);
app.use("/", jobRoutes);
app.use("/", studentRoutes);
app.use("/", applicationRoutes);

// ======================
// Home Route
// ======================
app.get("/", (req, res) => {
  if (!req.user) return res.redirect("/login");
  
  if (req.user.role === "recruiter") {
    return res.redirect("/recruiter/dashboard");
  }
  return res.redirect("/dashboard");
});

// ======================
// 404
// ======================
app.use((req, res) => {
  res.status(404).render("error", {
    title: "404 - Page Not Found",
    message: "The page you are looking for doesn't exist or has been moved."
  });
});

// ======================
// Start Server
// ======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});