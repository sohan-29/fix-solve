/**
 * Timer Service
 * ---
 * All timer state lives on the SERVER, not the client.
 * The client merely displays a countdown derived from the server-issued start time.
 * This prevents local machine clock tampering.
 */

/**
 * Computes the SRS time-decay score.
 *
 * Formula (from SRS §8):
 *   Score = max(P_min, P - (T_taken × D) - (W × P_penalty))
 *
 * @param {object} params
 * @param {number} params.maxPoints      - P: max points for the problem
 * @param {number} params.timeTakenSecs  - T_taken: seconds elapsed when correct submission was made
 * @param {number} params.wrongCount     - W: number of wrong submissions before the correct one
 * @param {number} [params.decayPerSec]  - D: points lost per second (default: 0.005)
 * @param {number} [params.penalty]      - P_penalty: points lost per wrong submission (default: 10)
 * @param {number} [params.minPoints]    - P_min: floor score for a correct answer (default: 30% of P)
 * @returns {number} Final score (rounded to 2 decimal places)
 */
const computeScore = ({
    maxPoints,
    timeTakenSecs,
    wrongCount,
    decayPerSec = 0.005,
    penalty = 10,
    minPoints = null,
}) => {
    const pMin = minPoints !== null ? minPoints : Math.floor(maxPoints * 0.3);
    const raw = maxPoints - timeTakenSecs * decayPerSec - wrongCount * penalty;
    return Math.max(pMin, Math.round(raw * 100) / 100);
};

/**
 * Returns the elapsed seconds since a timer started.
 * @param {Date} timerStart - The server-side Date when timer began.
 * @returns {number} Elapsed seconds.
 */
const getElapsedSeconds = (timerStart) => {
    return Math.floor((Date.now() - new Date(timerStart).getTime()) / 1000);
};

/**
 * Returns the remaining seconds for a timer.
 * @param {Date} timerStart     - When the timer started (server Date).
 * @param {number} durationSecs - Total allowed duration in seconds.
 * @returns {number} Remaining seconds (minimum 0).
 */
const getRemainingSeconds = (timerStart, durationSecs) => {
    if (!timerStart) return durationSecs;
    const elapsed = getElapsedSeconds(timerStart);
    return Math.max(0, durationSecs - elapsed);
};

/**
 * Returns true if the timer has expired.
 */
const isExpired = (timerStart, durationSecs) => {
    return getRemainingSeconds(timerStart, durationSecs) === 0;
};

module.exports = { computeScore, getElapsedSeconds, getRemainingSeconds, isExpired };
