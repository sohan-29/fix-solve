const Submission = require('../models/Submission');
const { submitCode } = require('../utils/judge0Client');

const createSubmission = async (req, res, next) => {
  try {
    const { problemId, code, language } = req.body;
    const result = await submitCode(code, language);

    const submission = await Submission.create({
      user: req.user.id,
      problem: problemId,
      code,
      language,
      status: result.status.description,
      result
    });

    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
};

module.exports = { createSubmission };
