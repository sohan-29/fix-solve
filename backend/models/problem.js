const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  roundType: { type: Number, required: true }, // 1 = debugging, 2 = coding
  inputFormat: String,
  outputFormat: String,
  constraints: String,
  sampleInput: String,
  sampleOutput: String,
  starterCode: { type: String, default: '' },
  bugCode: { type: String, default: '' },
  // Maximum points for this problem — used in the SRS time-decay scoring formula.
  maxPoints: { type: Number, default: 100 },
  testCases: [{ input: String, output: String }],
  hiddenTestCases: [{ input: String, output: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);
