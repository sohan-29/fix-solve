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

    user = new User({ name, rollNumber, ip: clientIp });
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
