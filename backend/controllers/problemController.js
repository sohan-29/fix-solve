const Problem = require('../models/problem');

const createProblem = async (req, res, next) => {
  try {
    const problem = await Problem.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(problem);
  } catch (error) {
    next(error);
  }
};

const getProblems = async (req, res, next) => {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (error) {
    next(error);
  }
};

module.exports = { createProblem, getProblems };
