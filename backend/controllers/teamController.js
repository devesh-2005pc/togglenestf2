const User = require("../models/User");
const Invitation = require("../models/Invitation");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// =========================
// GET TEAM MEMBERS
// =========================
exports.getMembers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    const formatted = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: "Engineering",
      lastActive: "Today",
      status: "active"
    }));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch members" });
  }
};

// =========================
// GET INVITATIONS
// =========================
exports.getInvitations = async (req, res) => {
  try {
    const invites = await Invitation.find({ accepted: { $ne: true } });
    res.json(invites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch invites" });
  }
};

// =========================
// SEND INVITE
// =========================
exports.sendInvite = async (req, res) => {
  const { email, role } = req.body;

  try {
    // Generate a unique token
    const token = crypto.randomBytes(20).toString("hex");

    // Create the invitation in DB
    const invite = await Invitation.create({
      email,
      role,
      invitedBy: req.user.id,
      expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      token
    });

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Invite link points to HTML page route
    const acceptLink = `${process.env.BACKEND_URL}/api/team/invite/accept/${token}`;

    // Mail content
    const mailOptions = {
      from: `"ToggleNest Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "You are invited to join a team!",
      html: `
        <p>Hello,</p>
        <p>${req.user.email} has invited you to join their team on ToggleNest.</p>
        <p>Role: <b>${role}</b></p>
        <p>Click the button below to accept the invite:</p>
        <a href="${acceptLink}" 
           style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
           Accept Invite
        </a>
        <p>This invite will expire in 14 days.</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Invite sent", invite });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to send invite" });
  }
};

// =========================
// DELETE MEMBER
// =========================
exports.deleteMember = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Member deleted" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Delete failed" });
  }
};

// =========================
// ACCEPT INVITE (HTML page)
// =========================
exports.acceptInviteDirect = async (req, res) => {
  const { token } = req.params;

  try {
    const invite = await Invitation.findOne({ token });

    if (!invite) {
      return res.send("<h2>❌ Invalid invite</h2>");
    }

    if (invite.expires < new Date()) {
      return res.send("<h2>⏰ Invite expired</h2>");
    }

    if (invite.accepted) {
      return res.send("<h2>✅ Invite already accepted</h2>");
    }

    // 🔑 CHECK IF USER ALREADY EXISTS
    let user = await User.findOne({ email: invite.email });

    if (!user) {
      user = await User.create({
        name: invite.email.split("@")[0],
        email: invite.email,
        password: "changeme123",
        role: invite.role
      });
    }

    invite.accepted = true;
    invite.acceptedBy = user._id;
    await invite.save();

    return res.send(`
      <h2>🎉 Invite Accepted!</h2>
      <p>You are now part of the team.</p>
      <p>Email: ${user.email}</p>
      <p>You can close this page.</p>
    `);

  } catch (err) {
    console.error("Invite accept error:", err);
    return res.send("<h2>⚠️ Something went wrong</h2>");
  }
};
// CANCEL INVITE
exports.cancelInvite = async (req, res) => {
  try {
    const invite = await Invitation.findById(req.params.id);

    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }

    // Optional: ensure only inviter can cancel
    if (invite.invitedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await invite.deleteOne();

    res.json({ message: "Invite cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to cancel invite" });
  }
};
