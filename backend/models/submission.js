const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
  code: { type: String, required: true },
  language: { type: String, required: true },
  status: { type: String, default: 'Pending' }, // 'Accepted' | 'Wrong Answer' | 'TLE' | etc.
  // Time elapsed (in seconds) from the user's individual timer when this submission was made.
  timeTaken: { type: Number, default: 0 },
  // Final score awarded by the SRS time-decay formula (only set on Accepted submissions).
  score: { type: Number, default: 0 },
  result: { type: Object }, // Full Judge0 response
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
