const BacklogItem = require("../models/backlogitem");

// ✅ Create Backlog Item
exports.createBacklogItem = async (req, res) => {
  try {
    const { name, epic, priority, assignee, status } = req.body;

    if (!name) {
      return res.status(400).json({ msg: "Task name is required" });
    }

    const item = await BacklogItem.create({
      name,
      epic,
      priority,
      assignee,
      status,
      createdBy: req.user.id, // from JWT
    });

    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to create backlog item" });
  }
};

// ✅ Get My Backlog Items
exports.getMyBacklogItems = async (req, res) => {
  try {
    const items = await BacklogItem.find({
      createdBy: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to load backlog items" });
  }
};

// ✅ Delete Backlog Item
exports.deleteBacklogItem = async (req, res) => {
  try {
    const item = await BacklogItem.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!item) {
      return res.status(404).json({ msg: "Backlog item not found" });
    }

    res.json({ msg: "Backlog item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Delete failed" });
  }
};
