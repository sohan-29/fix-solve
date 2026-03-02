const express = require("express");
const {
    startRound,
    endRound,
    startTimer,
    getTimerStatus,
    resetUserSession,
    reportViolation,
} = require("../controllers/contestController");
const router = express.Router();

// --- Individual Async Timer ---
// Participant calls this when entering a round; starts their personal server-side timer.
router.post("/start-timer", startTimer);

// Client polls this to get authoritative remaining time.
router.get("/timer-status/:userId/:round", getTimerStatus);

// --- Coordinator Reset ---
// Admin/Coordinator resets a user's timer to grant them a retry.
router.post("/admin/reset-session", resetUserSession);

// --- Anti-Cheat (Page Visibility) ---
router.post("/report-violation", reportViolation);

// --- Legacy Round Control ---
router.post("/start", startRound);
router.post("/end", endRound);

module.exports = router;
