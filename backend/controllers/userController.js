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
