const express = require("express");
const { registerUser, getUsers } = require("../controllers/userController");
const User = require("../models/User");
const router = express.Router();

router.post("/register", registerUser);
router.get("/", getUsers);

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
