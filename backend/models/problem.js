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
  starterCode: { type: String, default: '' }, // Initial code shown to user
  bugCode: { type: String, default: '' }, // Code with bug for Round 1
  testCases: [
    {
      input: String,
      output: String
    }
  ],
  hiddenTestCases: [
    {
      input: String,
      output: String
    }
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);
