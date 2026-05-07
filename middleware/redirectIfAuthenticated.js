const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role === "recruiter") {
        return res.redirect("/recruiter/dashboard");
      }
      return res.redirect("/dashboard");
    } catch (err) {
      // If token is invalid, let them proceed to login/register
      res.clearCookie("token");
      return next();
    }
  }

  next();
};
