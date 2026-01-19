const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
  getSprints,
  createSprint,
  deleteSprint
} = require("../controllers/SprintController");

// GET all sprints
router.get("/", auth, getSprints);

// CREATE sprint
router.post("/", auth, createSprint);

// DELETE sprint
router.delete("/:id", auth, deleteSprint);

module.exports = router;
