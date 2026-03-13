const express = require("express");
const { 
  registerUser, 
  getUsers, 
  getUserById,
  requestApproval,
  checkApprovalStatus,
  approveUser,
  unapproveUser,
  getPendingApprovals
} = require("../controllers/userController");
const User = require("../models/User");
const { getRemainingSeconds } = require("../utils/timerService");
const router = express.Router();

router.post("/register", registerUser);
router.get("/", getUsers);

// Static routes MUST come before parameterized routes
router.get("/pending-approvals", getPendingApprovals);

router.get("/:id", getUserById);

// Approval routes
router.post("/:id/request-approval", requestApproval);
router.get("/:id/approval-status", checkApprovalStatus);
router.post("/:id/approve", approveUser);
router.post("/:id/unapprove", unapproveUser);

// Get timer status for a user (for backend-controlled timer)
router.get("/:userId/timer", async (req, res) => {
  try {
    const { round } = req.query;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const timerStart = user[`round${round}TimerStart`];
    const duration = user[`round${round}Duration`];
    const remaining = getRemainingSeconds(timerStart, duration);
    
    res.json({
      timerStart: timerStart,
      duration: duration,
      remaining: remaining,
      isExpired: remaining <= 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start/Reset timer for a user (admin only)
router.post("/:userId/timer/start", async (req, res) => {
  try {
    const { round, duration } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    user[`round${round}TimerStart`] = new Date();
    if (duration) {
      user[`round${round}Duration`] = duration;
    }
    await user.save();
    
    res.json({
      message: `Round ${round} timer started`,
      timerStart: user[`round${round}TimerStart`],
      duration: user[`round${round}Duration`]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user by ID
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
