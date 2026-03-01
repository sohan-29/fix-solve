const Problem = require('../models/problem');

const createProblem = async (req, res, next) => {
  try {
    const problem = await Problem.create(req.body);
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

// Get problem by round type (1 = debugging, 2 = coding)
const getProblemByRound = async (req, res, next) => {
  try {
    const { round } = req.params;
    const { language = 'javascript' } = req.query;
    const problem = await Problem.findOne({ roundType: parseInt(round) });
    
    if (!problem) {
      return res.status(404).json({ error: `No problem found for round ${round}` });
    }
    
    // Build response
    const response = problem.toObject();
    
    // Get the correct code based on language
    if (parseInt(round) === 1) {
      // Round 1 - Debugging: use bugCodeByLanguage or fallback to bugCode
      if (problem.bugCodeByLanguage && problem.bugCodeByLanguage[language]) {
        response.starterCode = problem.bugCodeByLanguage[language];
      } else {
        response.starterCode = problem.bugCode || '';
      }
    } else {
      // Round 2 - Coding: use starterCodeByLanguage or fallback to starterCode
      if (problem.starterCodeByLanguage && problem.starterCodeByLanguage[language]) {
        response.starterCode = problem.starterCodeByLanguage[language];
      } else {
        response.starterCode = problem.starterCode || '';
      }
    }
    
    // Don't include hidden test cases in response
    delete response.hiddenTestCases;
    delete response.bugCode;
    delete response.bugCodeByLanguage;
    delete response.starterCodeByLanguage;
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Get problem by ID
const getProblemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findById(id);
    
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    // Don't expose hidden test cases
    const response = problem.toObject();
    delete response.hiddenTestCases;
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Update problem
const updateProblem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    res.json(problem);
  } catch (error) {
    next(error);
  }
};

// Delete problem
const deleteProblem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findByIdAndDelete(id);
    
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  createProblem, 
  getProblems, 
  getProblemByRound,
  getProblemById,
  updateProblem,
  deleteProblem
};
