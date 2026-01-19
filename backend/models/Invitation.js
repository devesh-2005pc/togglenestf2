const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  role: { type: String, default: "member" },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  invitedOn: { type: Date, default: Date.now },
  expires: { type: Date },
  token: { type: String, required: true, unique: true },
  accepted: { type: Boolean, default: false },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Invitation", invitationSchema);
