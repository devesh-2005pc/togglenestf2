const Sprint = require("../models/Sprint");

/**
 * GET ALL SPRINTS (for logged-in user)
 * GET /api/sprints
 */
exports.getSprints = async (req, res) => {
  try {
    const sprints = await Sprint.find({
      createdBy: req.user.id
    }).sort({ createdAt: -1 });

    res.json(sprints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to fetch sprints" });
  }
};

/**
 * CREATE SPRINT
 * POST /api/sprints
 */
exports.createSprint = async (req, res) => {
  try {
    const { name, startDate, endDate, goal } = req.body;

    const sprint = await Sprint.create({
      name,
      startDate,
      endDate,
      goal,
      createdBy: req.user.id
    });

    res.status(201).json(sprint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to create sprint" });
  }
};

/**
 * DELETE SPRINT
 * DELETE /api/sprints/:id
 */
exports.deleteSprint = async (req, res) => {
  try {
    await Sprint.findByIdAndDelete(req.params.id);
    res.json({ msg: "Sprint deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to delete sprint" });
  }
};
