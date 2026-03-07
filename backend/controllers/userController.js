const User = require("../models/User");

exports.registerUser = async (req, res) => {
  const { name, rollNumber } = req.body;
  const clientIp = req.ip;
  try {
    let user = await User.findOne({ name });
    if (user) {
      // Enforce IP binding — reject if a different machine tries the same name
      if (user.ip && user.ip !== clientIp) {
        return res.status(403).json({
          error: 'Session locked to another machine',
          message: 'This ID is already registered from a different device. Contact a coordinator.',
        });
      }
      return res.json(user);
    }

    user = new User({ name, rollNumber, ip: clientIp, isApproved: false });
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "User registration failed" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ totalTime: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// Request approval to start contest
exports.requestApproval = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Set approval requested timestamp
    user.approvalRequestedAt = new Date();
    await user.save();
    
    res.json({ message: "Approval requested", approvalRequestedAt: user.approvalRequestedAt });
  } catch (err) {
    res.status(500).json({ error: "Failed to request approval" });
  }
};

// Check approval status
exports.checkApprovalStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({
      isApproved: user.isApproved,
      approvedAt: user.approvedAt,
      approvalRequestedAt: user.approvalRequestedAt,
      isLockedOut: user.isLockedOut
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to check approval status" });
  }
};

// Approve user to start contest (admin only)
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    user.isApproved = true;
    user.approvedAt = new Date();
    await user.save();
    
    res.json({ message: "User approved", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to approve user" });
  }
};

// Reject/unapprove user
exports.unapproveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    user.isApproved = false;
    user.approvedAt = null;
    await user.save();
    
    res.json({ message: "User unapproved", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to unapprove user" });
  }
};

// Get all pending approval requests
exports.getPendingApprovals = async (req, res) => {
  try {
    // Get users who have requested approval but not yet approved
    const users = await User.find({
      approvalRequestedAt: { $ne: null },
      isApproved: false,
      isLockedOut: false
    }).sort({ approvalRequestedAt: 1 });
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pending approvals" });
  }
};
