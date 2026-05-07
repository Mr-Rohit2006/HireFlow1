const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendMail = require("../utils/sendmail");
const generateToken = require("../utils/generateToken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.render("auth/register", {
        error: "Email already registered. Please login.",
        formData: { name, email, role }
      });
    }
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashed, role });
    res.redirect("/login");
  } catch (err) {
    console.error("Register error:", err);
    res.render("auth/register", {
      error: "Something went wrong. Please try again.",
      formData: {}
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.render("auth/login", {
        error: "Email and password are required.",
        formData: { email }
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.render("auth/login", {
        error: "No account found with this email. Please register first.",
        formData: { email }
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render("auth/login", {
        error: "Wrong password. Please try again.",
        formData: { email }
      });
    }

    const token = generateToken(user);

    // Remember Me — 7 days or 1 day
    const maxAge = rememberMe
      ? 7 * 24 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;

    res.cookie("token", token, {
      httpOnly: true,
      maxAge,
      sameSite: "lax"
    });

    if (user.role === "recruiter") {
      return res.redirect("/recruiter/dashboard");
    }
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Login error:", err);
    res.render("auth/login", {
      error: "Something went wrong. Please try again.",
      formData: {}
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
};

// ── Forgot Password ──
exports.getForgotPassword = (req, res) => {
  res.render("auth/forgot-password", { error: null, success: null });
};

exports.postForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("auth/forgot-password", {
        error: "No account found with this email.",
        success: null
      });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    await sendMail(
      user.email,
      "HireFlow – Password Reset Request",
      `
        <h2>Password Reset</h2>
        <p>Hi ${user.name},</p>
        <p>Click the link below to reset your password. This link expires in <b>1 hour</b>.</p>
        <a href="${resetLink}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:10px;">Reset Password</a>
        <p style="margin-top:16px;color:#999;font-size:12px;">If you didn't request this, ignore this email.</p>
      `
    );

    res.render("auth/forgot-password", {
      error: null,
      success: "Password reset link sent to your email!"
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.render("auth/forgot-password", {
      error: "Something went wrong. Please try again.",
      success: null
    });
  }
};

// ── Reset Password ──
exports.getResetPassword = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() }
  });

  if (!user) {
    return res.render("auth/reset-password", {
      error: "Link is invalid or expired. Please request again.",
      token: null
    });
  }

  res.render("auth/reset-password", { error: null, token });
};

exports.postResetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.render("auth/reset-password", {
        error: "Link is invalid or expired. Please request again.",
        token: null
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.redirect("/login");
  } catch (err) {
    console.error("Reset password error:", err);
    res.render("auth/reset-password", {
      error: "Something went wrong. Please try again.",
      token: req.body.token
    });
  }
};