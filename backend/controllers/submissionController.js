const Submission = require('../models/Submission');
const Problem = require('../models/problem');
const { runAllTestCases, submitCode } = require('../utils/judge0Client');

const createSubmission = async (req, res, next) => {
  try {
    const { problemId, code, language, userId } = req.body;
    
    // Get userId from header or body (for unauthenticated requests)
    const user = userId || req.headers['x-user-id'] || req.body.userId || 'anonymous';
    
    let testCases = [];
    let problem = null;
    
    // If problemId is provided, fetch test cases from database
    if (problemId) {
      try {
        problem = await Problem.findById(problemId);
        if (problem) {
          // Combine visible test cases with hidden test cases
          testCases = [...(problem.testCases || []), ...(problem.hiddenTestCases || [])];
        }
      } catch (e) {
        console.log('Problem not found, using default test case');
      }
    }
    
    // If no test cases from problem, use default
    if (testCases.length === 0) {
      // Fallback: Use a simple test case evaluation
      testCases = [{ input: '5\n3', output: '8' }]; // For add function
    }

    let result;
    
    // Run all test cases
    result = await runAllTestCases(code, language || 'javascript', testCases);

    // Determine overall status
    const overallStatus = result.summary.allPassed ? 'Accepted' : 'Wrong Answer';

    const submission = await Submission.create({
      user: user,
      problem: problemId,
      code,
      language: language || 'javascript',
      status: overallStatus,
      result
    });

    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
};

module.exports = { createSubmission };
