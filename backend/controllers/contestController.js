const User = require("../models/User");
const { getRemainingSeconds, isExpired } = require("../utils/timerService");

/**
 * POST /api/contests/start-timer
 * Admin triggers an individual timer for a participant (or participant triggers their own on round entry).
 * Body: { userId, round, durationSecs? }
 */
exports.startTimer = async (req, res) => {
  const { userId, round, durationSecs } = req.body;
  if (!userId || !round) {
    return res.status(400).json({ error: "userId and round are required" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const timerStartField = `round${round}TimerStart`;
    const durationField = `round${round}Duration`;

    // Do not restart a timer that is already running (unless a reset was done)
    if (user[timerStartField] && !isExpired(user[timerStartField], user[durationField]) && !user.retryAllowed) {
      const remaining = getRemainingSeconds(user[timerStartField], user[durationField]);
      return res.json({
        message: "Timer already running",
        timerStartTime: user[timerStartField],
        remainingSeconds: remaining,
        durationSeconds: user[durationField],
      });
    }

    // Start (or restart after admin reset) the timer
    user[timerStartField] = new Date();
    if (durationSecs) user[durationField] = durationSecs;
    user.retryAllowed = false; // consume the retry token

    await user.save();

    res.json({
      message: `Round ${round} timer started`,
      timerStartTime: user[timerStartField],
      remainingSeconds: user[durationField],
      durationSeconds: user[durationField],
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to start timer", details: err.message });
  }
};

/**
 * GET /api/contests/timer-status/:userId/:round
 * Returns the current server-side timer state for a participant.
 * The client uses timerStartTime + durationSeconds to render its own countdown,
 * keeping the reference time on the server.
 */
exports.getTimerStatus = async (req, res) => {
  const { userId, round } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const timerStart = user[`round${round}TimerStart`];
    const duration = user[`round${round}Duration`];
    const remaining = getRemainingSeconds(timerStart, duration);

    res.json({
      timerStartTime: timerStart,
      durationSeconds: duration,
      remainingSeconds: remaining,
      expired: remaining === 0,
      retryAllowed: user.retryAllowed,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get timer status", details: err.message });
  }
};

/**
 * POST /api/contests/admin/reset-session
 * Coordinator resets a participant's timer to give them another chance.
 * Body: { userId, round, durationSecs? }
 */
exports.resetUserSession = async (req, res) => {
  const { userId, round, durationSecs } = req.body;
  if (!userId || !round) {
    return res.status(400).json({ error: "userId and round are required" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const timerStartField = `round${round}TimerStart`;
    const resetCountField = `round${round}ResetCount`;
    const durationField = `round${round}Duration`;

    // Clear the old timer and grant retry token
    user[timerStartField] = null;
    if (durationSecs) user[durationField] = durationSecs;
    user[resetCountField] += 1;
    user.retryAllowed = true;

    await user.save();

    res.json({
      message: `Session reset for user ${user.name} on Round ${round}`,
      resetCount: user[resetCountField],
      retryAllowed: user.retryAllowed,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset session", details: err.message });
  }
};

/**
 * POST /api/contests/start  (legacy – kept for compatibility)
 */
exports.startRound = async (req, res) => {
  const { name, round } = req.body;
  try {
    const user = await User.findOne({ name });
    if (!user) return res.status(404).json({ error: "User not found" });

    user[`round${round}Time`] = 0;
    await user.save();

    res.json({ message: `Round ${round} started`, user });
  } catch (err) {
    res.status(500).json({ error: "Failed to start round" });
  }
};

/**
 * POST /api/contests/end  (legacy – kept for compatibility)
 */
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

/**
 * POST /api/contests/report-violation
 * Called by the frontend when a tab-switch is detected via the Page Visibility API.
 * Strict zero-tolerance: 1st offence → auto-lockout (isLockedOut = true).
 * Body: { userId }
 */
exports.reportViolation = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Already locked out — nothing more to do
    if (user.isLockedOut) {
      return res.json({
        tabSwitchCount: user.tabSwitchCount,
        isLockedOut: true,
        message: "User is already locked out.",
      });
    }

    user.tabSwitchCount += 1;

    // 1 warning allowed: lock out on 2nd offence
    if (user.tabSwitchCount >= 2) {
      user.isLockedOut = true;
    }

    await user.save();

    res.json({
      tabSwitchCount: user.tabSwitchCount,
      isLockedOut: user.isLockedOut,
      message: "You have been locked out for switching tabs.",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to report violation", details: err.message });
  }
};

/**
 * POST /api/contests/unlock-user
 * Admin can manually unlock a locked out user
 * Body: { userId }
 */
exports.unlockUser = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isLockedOut = false;
    user.tabSwitchCount = 0;
    await user.save();

    res.json({
      message: `User ${user.name} has been unlocked`,
      isLockedOut: false
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to unlock user", details: err.message });
  }
};
