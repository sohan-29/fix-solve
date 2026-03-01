const Submission = require('../models/Submission');
const Problem = require('../models/problem');
const User = require('../models/User');
const { runAllTestCases } = require('../utils/judge0Client');
const { computeScore, getElapsedSeconds } = require('../utils/timerService');

/**
 * POST /api/submissions
 * Creates a submission, checks timer validity, evaluates code against test cases,
 * and applies the SRS time-decay scoring formula.
 *
 * Expected body:
 *   { problemId, code, language, userId, round }
 */
const createSubmission = async (req, res, next) => {
  try {
    const { problemId, code, language, userId, round = 1 } = req.body;
    const userIdResolved = userId || req.headers['x-user-id'];

    // --- 1. Fetch User and enforce server-side timer ---
    let user = null;
    if (userIdResolved && userIdResolved !== 'anonymous') {
      user = await User.findById(userIdResolved);
      if (user) {
        const timerStart = user[`round${round}TimerStart`];
        const duration = user[`round${round}Duration`];

        if (timerStart) {
          const elapsed = getElapsedSeconds(timerStart);
          if (elapsed >= duration) {
            return res.status(403).json({
              error: 'Time is up',
              message: 'Your round timer has expired. Contact a coordinator if you believe this is an error.',
            });
          }
        }
      }
    }

    // --- 2. Fetch problem & test cases ---
    let testCases = [];
    let problem = null;

    if (problemId) {
      try {
        problem = await Problem.findById(problemId);
        if (problem) {
          testCases = [...(problem.testCases || []), ...(problem.hiddenTestCases || [])];
        }
      } catch (e) {
        console.log('Problem not found, using default test case');
      }
    }

    if (testCases.length === 0) {
      testCases = [{ input: '5\n3', output: '8' }];
    }

    // --- 3. Run test cases via Judge0 ---
    const result = await runAllTestCases(code, language || 'javascript', testCases);
    const overallStatus = result.summary.allPassed ? 'Accepted' : 'Wrong Answer';

    // --- 4. Apply SRS Time-Decay Scoring ---
    let score = 0;
    if (user && result.summary.allPassed) {
      const timerStart = user[`round${round}TimerStart`];
      const timeTakenSecs = timerStart ? getElapsedSeconds(timerStart) : 0;
      const wrongCount = user[`round${round}WrongSubmissions`] || 0;
      const maxPoints = problem ? (problem.maxPoints || 100) : 100;

      score = computeScore({ maxPoints, timeTakenSecs, wrongCount });

      // Update user's score for the round
      user[`round${round}Score`] = Math.max(user[`round${round}Score`] || 0, score);
      user[`round${round}Time`] = timeTakenSecs;
      user.totalScore = (user.round1Score || 0) + (user.round2Score || 0);
      user.totalTime = (user.round1Time || 0) + (user.round2Time || 0);
      await user.save();
    } else if (user && !result.summary.allPassed) {
      // Track wrong submissions for penalty
      user[`round${round}WrongSubmissions`] = (user[`round${round}WrongSubmissions`] || 0) + 1;
      await user.save();
    }

    // --- 5. Persist Submission ---
    const submission = await Submission.create({
      user: userIdResolved,
      problem: problemId,
      code,
      language: language || 'python',
      status: overallStatus,
      score,
      timeTaken: user && user[`round${round}TimerStart`]
        ? getElapsedSeconds(user[`round${round}TimerStart`])
        : 0,
      result,
    });

    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
};

module.exports = { createSubmission };
