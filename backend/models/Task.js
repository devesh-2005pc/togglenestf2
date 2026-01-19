const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: {
    type: String,
    enum: ["backlog", "inProgress", "review", "done"],
    default: "backlog"
  },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dueDate: Date
},
{  
  timestamps: true,
}
);

module.exports = mongoose.model("Task", taskSchema);
