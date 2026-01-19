const Project = require("../models/Project");

/**
 * CREATE PROJECT
 * POST /api/projects
 */
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      owner: req.user.id,
      members: [req.user.id]
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to create project" });
  }
};

/**
 * GET MY PROJECTS
 * GET /api/projects
 */
exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      owner: req.user.id
    }).sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to fetch projects" });
  }
};

/**
 * DELETE PROJECT
 * DELETE /api/projects/:id
 */
exports.deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ msg: "Project deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to delete project" });
  }
};
