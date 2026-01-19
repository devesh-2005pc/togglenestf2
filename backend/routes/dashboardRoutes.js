const express = require("express");
const router = express.Router();

const { getDashboardOverview } = require("../controllers/dashboardController");
const auth = require("../middleware/authMiddleware");

console.log("📊 Dashboard route loaded");

router.get("/", (req, res, next) => {
  console.log("📊 Dashboard endpoint called");
  auth(req, res, next);
}, getDashboardOverview);

module.exports = router;
