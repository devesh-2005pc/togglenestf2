const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,

    role: {
      type: String,
      enum: ["admin", "member", "viewer"],
      default: "member",
    },

    department: {
      type: String,
      default: "General",
    },

    status: {
      type: String,
      enum: ["online", "offline", "away"],
      default: "offline",
    },

    avatar: {
      type: String,
      default: "https://i.pravatar.cc/150",
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
