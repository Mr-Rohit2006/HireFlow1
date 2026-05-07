module.exports = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  if (req.user.role !== "student") {
    return res.status(403).render("error", {
      title: "Access Denied",
      message: "This area is reserved for students only."
    });
  }

  next();
};
