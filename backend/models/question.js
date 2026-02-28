const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  round: { type: Number, required: true }, // 1 = debugging, 2 = solving
  title: String,
  description: String,
  defaultCode: String, // only for debugging round
  testCases: [
    {
      input: String,
      expectedOutput: String,
    },
  ],
});

module.exports = mongoose.model("Question", QuestionSchema);
