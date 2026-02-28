const User = require("../models/User");

exports.startRound = async (req, res) => {
  const { name, round } = req.body;
  try {
    const user = await User.findOne({ name });
    if (!user) return res.status(404).json({ error: "User not found" });

    user[`round${round}Time`] = 0; // reset timer
    await user.save();

    res.json({ message: `Round ${round} started`, user });
  } catch (err) {
    res.status(500).json({ error: "Failed to start round" });
  }
};

exports.endRound = async (req, res) => {
  const { name, round, timeTaken } = req.body;
  try {
    const user = await User.findOne({ name });
    if (!user) return res.status(404).json({ error: "User not found" });

    user[`round${round}Time`] = timeTaken;
    user.totalTime = user.round1Time + user.round2Time;
    await user.save();

    res.json({ message: `Round ${round} ended`, user });
  } catch (err) {
    res.status(500).json({ error: "Failed to end round" });
  }
};
