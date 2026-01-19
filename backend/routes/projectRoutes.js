const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
  createProject,
  getMyProjects,
  deleteProject
} = require("../controllers/projectController");

// create project
router.post("/", auth, createProject);

// get all projects of logged-in user
router.get("/", auth, getMyProjects);

// delete project
router.delete("/:id", auth, deleteProject);

module.exports = router;
