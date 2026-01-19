const Task = require("../models/Task");

/**
  CREATE TASK
  POST /api/tasks
 */
exports.createTask = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const { title, description, projectId, dueDate, status } = req.body;

    // ❗ Assign task to the logged-in user from JWT
    const assignedTo = req.user.id;

    const task = await Task.create({
      title,
      description,
      projectId: projectId || null,
      assignedTo,       // <-- FIXED
      status: status || "backlog",  // Store the column/status
      dueDate
    });

    console.log("Created Task:", task);

    res.status(201).json(task);

  } catch (error) {
    console.error("Create Task Error:", error);
    res.status(500).json({ msg: error.message });
  }
};


/**
 * GET MY TASKS
 * GET /api/tasks/my
 */
exports.getMyTasks = async (req, res) => {
  try {
    console.log("Fetching tasks for user ID:", req.user.id);
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate("projectId", "name")
      .sort({ createdAt: -1 });
    console.log("Retrieved Tasks:", tasks);

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

/**
 * GET TASK COUNT (FOR DASHBOARD)
 * GET /api/tasks/count
 */
exports.getTaskCount = async (req, res) => {
  try {
    const count = await Task.countDocuments({
      assignedTo: req.user.id
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

/**
 * DELETE TASK
 * DELETE /api/tasks/:id
 */
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      assignedTo: req.user.id
    });

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    await task.deleteOne();
    res.json({ msg: "Task deleted" });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

/**
 * UPDATE TASK STATUS
 * PUT /api/tasks/:id/status
 */
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, assignedTo: req.user.id },
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

/**
 * ARCHIVE DONE TASKS
 * DELETE /api/tasks/archive/done
 */
exports.archiveDoneTasks = async (req, res) => {
  try {
    const result = await Task.deleteMany({
      assignedTo: req.user.id,
      status: "done"
    });

    res.json({
      msg: "Archived done tasks",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
