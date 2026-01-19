const express = require("express");
const router = express.Router();

// controllers
const { register, login, getMe } = require("../controllers/authController");

// middleware
const auth = require("../middleware/auth.middleware");

// public routes
router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getMe);

// 🔐 protected route
router.get("/profile", auth, (req, res) => {
  res.json({
    msg: "Protected route accessed",
    user: req.user
  });
});

module.exports = router;
