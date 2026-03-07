const Submission = require('../models/submission');
const Problem = require('../models/problem');
const User = require('../models/User');
const { runAllTestCases } = require('../utils/judge0Client');
const { getElapsedSeconds } = require('../utils/timerService');

// Marks calculation constants
const VISIBLE_TEST_WEIGHT = 0.4;  // 40% for visible test cases
const HIDDEN_TEST_WEIGHT = 0.6;    // 60% for hidden test cases
const WRONG_SUBMISSION_PENALTY_INTERVAL = 3; // Every 3 wrong = -1 mark
const OPTIMAL_BONUS = 1; // +1 mark for optimal code

/**
 * POST /api/submissions
 * Creates a submission, checks timer validity, evaluates code against test cases,
 * and applies the marks-based scoring system.
 * 
 * Body params:
 *   { problemId, code, language, userId, round, isRun }
 *   - isRun: if true, tests code without penalty (no negative marks, no wrong submission tracking)
 */
const createSubmission = async (req, res, next) => {
  try {
    const { problemId, code, language, userId, round = 1, isRun = false } = req.body;
    const userIdResolved = userId || req.headers['x-user-id'];

    // --- 1. Fetch User and enforce server-side timer ---
    // Skip timer check for Run (isRun=true) - allow testing even if time expired
    let user = null;
    if (userIdResolved && userIdResolved !== 'anonymous' && !isRun) {
      user = await User.findById(userIdResolved);
      if (user) {
        // --- Anti-cheat lockout check ---
        if (user.isLockedOut) {
          return res.status(403).json({
            error: 'Locked out',
            message: 'You have been locked out for switching tabs during the contest.',
          });
        }

        // --- IP Binding check ---
        if (user.ip && user.ip !== req.ip) {
          return res.status(403).json({
            error: 'IP mismatch',
            message: 'Submissions must come from the same machine you registered on.',
          });
        }

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
    } else if (userIdResolved && userIdResolved !== 'anonymous' && isRun) {
      // For Run, still fetch user to check lockout but skip timer
      user = await User.findById(userIdResolved);
      if (user && user.isLockedOut) {
        return res.status(403).json({
          error: 'Locked out',
          message: 'You have been locked out for switching tabs during the contest.',
        });
      }
    }

    // --- 2. Fetch problem & test cases ---
    let visibleTestCases = [];
    let hiddenTestCases = [];
    let problem = null;
    const problemMarks = 10; // Default marks

    if (problemId) {
      try {
        problem = await Problem.findById(problemId);
        if (problem) {
          visibleTestCases = problem.testCases || [];
          hiddenTestCases = problem.hiddenTestCases || [];
        }
      } catch (e) {
        console.log('Problem not found, using default test case');
      }
    }

    // Default test case if none exist
    if (visibleTestCases.length === 0 && hiddenTestCases.length === 0) {
      visibleTestCases = [{ input: '5\n3', output: '8' }];
    }

    // --- 3. Run visible test cases via Judge0 ---
    const visibleResult = visibleTestCases.length > 0 
      ? await runAllTestCases(code, language || 'c', visibleTestCases)
      : { summary: { allPassed: false }, results: [] };
    
    const visibleTestPassed = visibleResult.summary.allPassed;

    // --- 4. Run hidden test cases via Judge0 ---
    // Skip hidden tests for Run mode - only show visible test results
    let hiddenResult = { summary: { allPassed: false }, results: [] };
    let hiddenTestPassed = false;
    
    if (!isRun && hiddenTestCases.length > 0) {
      hiddenResult = await runAllTestCases(code, language || 'c', hiddenTestCases);
      hiddenTestPassed = hiddenResult.summary.allPassed;
    } else if (isRun) {
      // For Run, mark as not passed since we're not testing hidden cases
      hiddenTestPassed = false;
    }

    // Determine overall status
    const overallStatus = (visibleTestPassed && hiddenTestPassed) ? 'Accepted' 
      : visibleTestPassed ? 'Partial Correct'
      : 'Wrong Answer';

    // --- 5. Calculate Marks ---
    const totalMarks = problem ? (problem.marks || problemMarks) : problemMarks;
    
    // Visible tests = 40%, Hidden tests = 60%
    const visibleMarks = visibleTestPassed ? (totalMarks * VISIBLE_TEST_WEIGHT) : 0;
    const hiddenMarks = hiddenTestPassed ? (totalMarks * HIDDEN_TEST_WEIGHT) : 0;
    let earnedMarks = visibleMarks + hiddenMarks;

    // Round to 2 decimal places
    earnedMarks = Math.round(earnedMarks * 100) / 100;

    // --- 6. Handle Wrong Submissions & Negative Marks ---
    // ONLY apply negative marks for actual Submissions, not for Run
    let negativeMarks = 0;
    let wrongSubmissions = 0;

    if (user && !isRun) {
      wrongSubmissions = user[`round${round}WrongSubmissions`] || 0;
      
      if (!visibleTestPassed || !hiddenTestPassed) {
        // Track wrong submission
        wrongSubmissions += 1;
        user[`round${round}WrongSubmissions`] = wrongSubmissions;
        
        // Calculate negative marks (every 3 wrong = -1)
        negativeMarks = Math.floor(wrongSubmissions / WRONG_SUBMISSION_PENALTY_INTERVAL);
        user[`round${round}NegativeMarks`] = negativeMarks;
      }

      // --- 7. Check for Optimal Code Bonus ---
      let isOptimal = false;
      let optimalBonus = 0;
      
      if (problem && earnedMarks > 0) {
        // Check if this is the first correct submission for this problem
        const bestSubmission = user[`round${round}BestSubmission`] || {};
        const currentBest = bestSubmission[problemId] || 0;
        
        // If this is the first correct submission or better marks
        if (earnedMarks > currentBest) {
          // Mark as optimal (simplified - in real app would analyze code complexity)
          isOptimal = true;
          optimalBonus = OPTIMAL_BONUS;
          
          // Update best submission
          bestSubmission[problemId] = earnedMarks;
          user[`round${round}BestSubmission`] = bestSubmission;
          
          // Track optimal submissions
          const optimalSubmitted = user[`round${round}OptimalSubmitted`] || {};
          if (!optimalSubmitted[problemId]) {
            optimalSubmitted[problemId] = true;
            user[`round${round}OptimalSubmitted`] = optimalSubmitted;
            user[`round${round}OptimalPoints`] = (user[`round${round}OptimalPoints`] || 0) + optimalBonus;
          }
        }
      }

      // --- 8. Update User Score ---
      const previousRoundScore = user[`round${round}Score`] || 0;
      const newScore = Math.max(previousRoundScore, earnedMarks - negativeMarks + optimalBonus);
      user[`round${round}Score`] = newScore;

      // Update total score
      user.totalScore = (user.round1Score || 0) + (user.round2Score || 0);
      
      // Update total optimal points
      user.totalOptimalPoints = (user.round1OptimalPoints || 0) + (user.round2OptimalPoints || 0);

      // Update time (for tiebreaker)
      const timeTakenSecs = user[`round${round}TimerStart`] 
        ? getElapsedSeconds(user[`round${round}TimerStart`]) 
        : 0;
      user[`round${round}Time`] = timeTakenSecs;
      user.totalTime = (user.round1Time || 0) + (user.round2Time || 0);

      // --- 9. Save Submitted Code ---
      const submittedCodeMap = user[`round${round}SubmittedCode`] || {};
      submittedCodeMap[problemId] = code;
      user[`round${round}SubmittedCode`] = submittedCodeMap;

      await user.save();
    }

    // --- 10. Persist Submission ---
    // For Run submissions, don't save to database (or mark as isRun)
    const submissionData = {
      user: userIdResolved,
      problem: problemId,
      code,
      language: language || 'c',
      status: overallStatus,
      score: earnedMarks - negativeMarks + (user ? (user[`round${round}OptimalPoints`] || 0) : 0),
      marks: earnedMarks,
      visibleTestPassed,
      hiddenTestPassed,
      negativeMarks,
      isOptimal: false,
      optimalBonus: 0,
      timeTaken: user && user[`round${round}TimerStart`]
        ? getElapsedSeconds(user[`round${round}TimerStart`])
        : 0,
      isRun: isRun, // Flag to indicate this is a Run (not a Submit)
      result: {
        visible: visibleResult,
        hidden: hiddenResult,
        summary: {
          visiblePassed: visibleTestPassed,
          hiddenPassed: hiddenTestPassed,
          totalMarks,
          earnedMarks,
          negativeMarks,
          finalScore: earnedMarks - negativeMarks
        }
      },
    };

    const submission = await Submission.create(submissionData);

    // Return response with isRun flag so frontend knows not to show negative marks
    res.status(201).json({
      ...submission,
      isRun: isRun,
      message: isRun ? 'Run completed successfully' : 'Submission recorded'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/submissions/user/:userId
 * Get all submissions for a user
 */
const getUserSubmissions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const submissions = await Submission.find({ user: userId })
      .populate('problem', 'title marks')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/submissions/problem/:problemId
 * Get all submissions for a problem
 */
const getProblemSubmissions = async (req, res, next) => {
  try {
    const { problemId } = req.params;
    const submissions = await Submission.find({ problem: problemId })
      .populate('user', 'name')
      .sort({ score: -1, timeTaken: 1 });
    res.json(submissions);
  } catch (error) {
    next(error);
  }
};

module.exports = { createSubmission, getUserSubmissions, getProblemSubmissions };
