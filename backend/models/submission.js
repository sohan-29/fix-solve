const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
  code: { type: String, required: true },
  language: { type: String, required: true },
  status: { type: String, default: 'Pending' }, // 'Accepted' | 'Wrong Answer' | 'TLE' | etc.
  // Time elapsed (in seconds) from the user's individual timer when this submission was made.
  timeTaken: { type: Number, default: 0 },
  // Final score/marks awarded for this submission
  score: { type: Number, default: 0 },
  // Marks breakdown
  marks: { type: Number, default: 0 },
  visibleTestPassed: { type: Boolean, default: false },
  hiddenTestPassed: { type: Boolean, default: false },
  // Negative marks applied (every 3 wrong = -1)
  negativeMarks: { type: Number, default: 0 },
  // Optimal code bonus (+1 for best time complexity)
  isOptimal: { type: Boolean, default: false },
  optimalBonus: { type: Number, default: 0 },
  // Result details from Judge0
  result: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
