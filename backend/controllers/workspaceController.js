import Workspace from "../models/Workspace.js";
import User from "../models/User.js";

/**
 * CREATE WORKSPACE
 */
export const createWorkspace = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    // deactivate existing active workspace
    await Workspace.updateMany(
      { owner: userId },
      { active: false }
    );

    const workspace = await Workspace.create({
      name: name || "New Workspace",
      owner: userId,
      members: [userId],
      active: true,
    });

    res.status(201).json(workspace);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET ALL WORKSPACES
 */
export const getWorkspaces = async (req, res) => {
  try {
    const userId = req.user.id;

    const workspaces = await Workspace.find({
      members: userId,
    }).sort({ createdAt: -1 });

    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * SWITCH ACTIVE WORKSPACE
 */
export const switchWorkspace = async (req, res) => {
  try {
    const userId = req.user.id;
    const workspaceId = req.params.id;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      members: userId,
    });

    if (!workspace)
      return res.status(404).json({ message: "Workspace not found" });

    await Workspace.updateMany(
      { owner: userId },
      { active: false }
    );

    workspace.active = true;
    await workspace.save();

    res.json(workspace);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE WORKSPACE
 */
export const deleteWorkspace = async (req, res) => {
  try {
    const userId = req.user.id;
    const workspaceId = req.params.id;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace)
      return res.status(404).json({ message: "Workspace not found" });

    if (workspace.owner.toString() !== userId)
      return res.status(403).json({ message: "Only owner can delete workspace" });

    const count = await Workspace.countDocuments({ owner: userId });
    if (count <= 1)
      return res.status(400).json({ message: "Cannot delete last workspace" });

    await workspace.deleteOne();

    res.json({ message: "Workspace deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ADD MEMBER
 */
export const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const workspaceId = req.params.id;
    const userId = req.user.id;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace)
      return res.status(404).json({ message: "Workspace not found" });

    if (workspace.owner.toString() !== userId)
      return res.status(403).json({ message: "Only owner can add members" });

    if (workspace.members.includes(user._id))
      return res.status(400).json({ message: "User already a member" });

    workspace.members.push(user._id);
    await workspace.save();

    res.json(workspace);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * REMOVE MEMBER
 */
export const removeMember = async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const memberId = req.params.userId;
    const userId = req.user.id;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace)
      return res.status(404).json({ message: "Workspace not found" });

    if (workspace.owner.toString() !== userId)
      return res.status(403).json({ message: "Only owner can remove members" });

    if (memberId === userId)
      return res.status(400).json({ message: "Owner cannot remove self" });

    workspace.members = workspace.members.filter(
      (m) => m.toString() !== memberId
    );

    await workspace.save();

    res.json(workspace);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
