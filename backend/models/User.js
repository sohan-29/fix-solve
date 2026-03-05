const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    rollNumber: { type: String },
    password: { type: String },
    role: { type: String, enum: ["participant", "admin"], default: "participant" },
    ip: { type: String },

    // --- Individual Asynchronous Timer ---
    // Stores the server timestamp when the user's round timer was started.
    // The remaining time is always computed as: timerDuration - (now - timerStartTime)
    round1TimerStart: { type: Date, default: null },
    round2TimerStart: { type: Date, default: null },
    // Duration in seconds for each round (set by admin at round start)
    round1Duration: { type: Number, default: 1800 }, // default 30 min
    round2Duration: { type: Number, default: 2700 }, // default 45 min

    // --- Reset / Retry by Coordinator ---
    round1ResetCount: { type: Number, default: 0 },
    round2ResetCount: { type: Number, default: 0 },
    retryAllowed: { type: Boolean, default: false }, // admin flips this to allow a re-entry

    // --- Scoring (Marks-based System) ---
    round1Score: { type: Number, default: 0 },
    round2Score: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    round1WrongSubmissions: { type: Number, default: 0 },
    round2WrongSubmissions: { type: Number, default: 0 },
    // Negative marks tracking (every 3 wrong = -1)
    round1NegativeMarks: { type: Number, default: 0 },
    round2NegativeMarks: { type: Number, default: 0 },

    // Legacy time tracking (kept for leaderboard secondary sort)
    round1Time: { type: Number, default: 0 },
    round2Time: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 },

    // --- Optimal Points (Bonus for best time complexity) ---
    round1OptimalPoints: { type: Number, default: 0 },
    round2OptimalPoints: { type: Number, default: 0 },
    totalOptimalPoints: { type: Number, default: 0 },

    // --- Submitted Code Storage (per problem per round) ---
    // Maps problem ID to submitted code for Round 1
    round1SubmittedCode: { type: Map, of: String, default: {} },
    // Maps problem ID to submitted code for Round 2
    round2SubmittedCode: { type: Map, of: String, default: {} },
    // Maps problem ID to best submission marks for Round 1
    round1BestSubmission: { type: Map, of: Number, default: {} },
    // Maps problem ID to best submission marks for Round 2
    round2BestSubmission: { type: Map, of: Number, default: {} },
    // Maps problem ID to indicate if optimal solution was submitted
    round1OptimalSubmitted: { type: Map, of: Boolean, default: {} },
    round2OptimalSubmitted: { type: Map, of: Boolean, default: {} },

    // --- Anti-Cheat (Page Visibility API) ---
    tabSwitchCount: { type: Number, default: 0 },
    isLockedOut: { type: Boolean, default: false },

    isQualified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/**
 * Returns the remaining seconds for a given round's timer.
 * Returns 0 if the timer has not started or has expired.
 */
UserSchema.methods.getRemainingTime = function (round) {
  const startField = `round${round}TimerStart`;
  const durationField = `round${round}Duration`;

  const timerStart = this[startField];
  const duration = this[durationField];

  if (!timerStart) return duration; // not started yet — full time remaining
  const elapsed = Math.floor((Date.now() - timerStart.getTime()) / 1000);
  return Math.max(0, duration - elapsed);
};

/**
 * Returns true if the user's timer for a given round has expired.
 */
UserSchema.methods.isTimerExpired = function (round) {
  return this.getRemainingTime(round) === 0;
};

module.exports = mongoose.model("User", UserSchema);
