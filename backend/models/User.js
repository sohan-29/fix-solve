const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  rollNumber: { type: String },
  round1Time: { type: Number, default: 0 },
  round2Time: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 },
});

module.exports = mongoose.model("User", UserSchema);
