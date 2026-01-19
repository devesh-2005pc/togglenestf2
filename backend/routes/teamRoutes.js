const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const team = require("../controllers/teamController");


// Protected routes
router.get("/members", auth, team.getMembers);
router.get("/invites", auth, team.getInvitations);
router.post("/invite", auth, team.sendInvite);
router.delete("/invite/:id", auth, team.cancelInvite);
router.delete("/member/:id", auth, team.deleteMember);
// Invite accept (ONE CLICK – no frontend)
router.get("/invite/accept/:token", team.acceptInviteDirect);


// // Invite routes (no auth)
// router.get("/invite/:token", team.getInviteByToken);
// router.post("/invite/accept/:token", team.acceptInvite);

module.exports = router;
