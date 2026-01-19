const express = require("express");

const {
  createWorkspace,
  getWorkspaces,
  switchWorkspace,
  deleteWorkspace,
  addMember,
  removeMember,
} = require("../controllers/workspaceController");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// protect all workspace routes
router.use(authMiddleware);

router.post("/", createWorkspace);
router.get("/", getWorkspaces);
router.patch("/:id/switch", switchWorkspace);
router.delete("/:id", deleteWorkspace);

router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);

module.exports = router;
