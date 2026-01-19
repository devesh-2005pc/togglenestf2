const mongoose = require("mongoose");

const sprintSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    goal: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["upcoming", "active", "completed"],
      default: "upcoming"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sprint", sprintSchema);
