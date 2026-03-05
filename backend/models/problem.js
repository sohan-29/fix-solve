const mongoose = require('mongoose');

// Language code mappings for different languages
const languageCodes = {
  javascript: 'javascript',
  c: 'c',
  cpp: 'cpp',
  java: 'java',
  python: 'python'
};

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  roundType: { type: Number, required: true }, // 1 = debugging, 2 = coding
  inputFormat: String,
  outputFormat: String,
  constraints: String,
  sampleInput: String,
  sampleOutput: String,
  // Marks for this question (visible + hidden = total marks)
  marks: { type: Number, default: 10 },
  // Expected time complexity for optimal solution (for bonus points)
  complexityExpected: { type: String, default: 'O(n)' },
  // Single code fields (for backward compatibility)
  starterCode: { type: String, default: '' }, // Initial code shown to user
  bugCode: { type: String, default: '' }, // Code with bug for Round 1
  // Multi-language support
  starterCodeByLanguage: {
    javascript: { type: String, default: '' },
    c: { type: String, default: '' },
    cpp: { type: String, default: '' },
    java: { type: String, default: '' },
    python: { type: String, default: '' }
  },
  bugCodeByLanguage: {
    javascript: { type: String, default: '' },
    c: { type: String, default: '' },
    cpp: { type: String, default: '' },
    java: { type: String, default: '' },
    python: { type: String, default: '' }
  },
  // Supported languages for this problem
  supportedLanguages: {
    type: [String],
    default: ['c']
  },
  testCases: [
    {
      input: String,
      output: String
    }
  ],
  // Test cases by language (optional - same test cases can work for all)
  hiddenTestCases: [
    {
      input: String,
      output: String
    }
  ],
  timeLimit: { type: Number, default: 60 }, // Time limit in seconds
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  complexity: { type: String, default: 'O(1)' }, // Expected time complexity
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);
module.exports.languageCodes = languageCodes;
