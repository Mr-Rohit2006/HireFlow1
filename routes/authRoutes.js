const express = require("express");
const router = express.Router();
const {
  register, login, logout,
  getForgotPassword, postForgotPassword,
  getResetPassword, postResetPassword
} = require("../controllers/authController");

const redirectIfAuthenticated = require("../middleware/redirectIfAuthenticated");

router.get("/login",    redirectIfAuthenticated, (req, res) => res.render("auth/login",    { error: null, formData: {} }));
router.get("/register", redirectIfAuthenticated, (req, res) => res.render("auth/register", { error: null, formData: {} }));

router.post("/register", redirectIfAuthenticated, register);
router.post("/login",    redirectIfAuthenticated, login);
router.get("/logout",    logout);

router.get("/forgot-password",  getForgotPassword);
router.post("/forgot-password", postForgotPassword);

router.get("/reset-password/:token",  getResetPassword);
router.post("/reset-password",        postResetPassword);

module.exports = router;