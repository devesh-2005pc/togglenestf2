const mongoose = require("mongoose");

const backlogItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    epic: {
      type: String,
      enum: ["Auth", "UI", "Backend", "Payments"],
      default: "Auth",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "High",
    },
    assignee: {
      type: String,
      default: "Unassigned",
    },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Done"],
      default: "To Do",
    },
    sprint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sprint",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BacklogItem", backlogItemSchema);
