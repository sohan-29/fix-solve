const User = require("../models/User");

exports.registerUser = async (req, res) => {
  const { name, rollNumber } = req.body;
  try {
    let user = await User.findOne({ name });
    if (user) return res.json(user);

    user = new User({ name, rollNumber });
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
