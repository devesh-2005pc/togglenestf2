const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const { deleteTask } = require("../controllers/taskController");
const { updateTaskStatus } = require("../controllers/taskController");
const { archiveDoneTasks } = require("../controllers/taskController");







const {
  createTask,
  getMyTasks,
  getTaskCount
} = require("../controllers/taskController");

// Create task
router.delete("/archive/done", auth, archiveDoneTasks);
router.post("/", auth, createTask);
router.delete("/:id", auth, deleteTask);
router.put("/:id/status", auth, updateTaskStatus);
// Get logged-in user's tasks
router.get("/my", auth, getMyTasks);

// Get logged-in user's task count (dashboard)
router.get("/count", auth, getTaskCount);

module.exports = router;
