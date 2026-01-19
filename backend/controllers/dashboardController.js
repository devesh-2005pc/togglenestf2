const Workspace = require("../models/Workspace");
const Invitation = require("../models/Invitation");
const Sprint = require("../models/Sprint");
const Task = require("../models/Task");
const Project = require("../models/Project");

const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Workspaces count
    const workspaceCount = await Workspace.countDocuments({ owner: userId });

    // 2️⃣ Teams count (accepted invitations sent by user)
    const teamCount = await Invitation.countDocuments({ invitedBy: userId, accepted: true });

    // 3️⃣ Members count (unique accepted users + owner)
    const acceptedInvites = await Invitation.find({ invitedBy: userId, accepted: true }).select("acceptedBy");
    const memberSet = new Set();
    acceptedInvites.forEach((invite) => {
      if (invite.acceptedBy) memberSet.add(invite.acceptedBy.toString());
    });
    memberSet.add(userId); // include owner
    const membersCount = memberSet.size;

    // 4️⃣ Project count
    const projectCount = await Project.countDocuments({ owner: userId });

    // 5️⃣ Sprint count
    const sprintCount = await Sprint.countDocuments({ createdBy: userId });

    // 6️⃣ Sprint completed vs remaining
    const completedSprints = await Sprint.countDocuments({ createdBy: userId, status: "completed" });
    const remainingSprints = sprintCount - completedSprints;

    // 7️⃣ Board count (Tasks per project)
    const boardCount = await Task.distinct("projectId").then((ids) => ids.length);

    // 8️⃣ Recent activity (latest 5 tasks/projects/sprints)
    const tasks = await Task.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const projects = await Project.find({ owner: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const sprints = await Sprint.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Merge and sort by time descending
    const recentActivity = [
      ...tasks.map((t) => ({
        itemId: t._id,
        type: "task",
        user: t.createdByName || "You",
        action: `Created task: ${t.title}`,
        time: t.createdAt,
      })),
      ...projects.map((p) => ({
        itemId: p._id,
        type: "project",
        user: p.ownerName || "You",
        action: `Created project: ${p.name}`,
        time: p.createdAt,
      })),
      ...sprints.map((s) => ({
        itemId: s._id,
        type: "sprint",
        user: s.createdByName || "You",
        action: `Created sprint: ${s.name}`,
        time: s.createdAt,
      })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)); // newest first

    // 9️⃣ Response
    res.status(200).json({
      stats: {
        workspaces: workspaceCount,
        teams: teamCount,
        members: membersCount,
        projects: projectCount,
        sprints: sprintCount,
        boards: boardCount,
      },
      recentActivity,
      sprintChart: {
        completed: completedSprints,
        remaining: remainingSprints,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Dashboard load failed" });
  }
};

module.exports = { getDashboardOverview };
