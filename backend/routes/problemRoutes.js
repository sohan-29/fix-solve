const express = require('express');
const { createProblem, getProblems, getProblemByRound, getProblemById } = require('../controllers/problemController');

const router = express.Router();

// Public routes
router.get('/', getProblems);
router.get('/round/:round', getProblemByRound);
router.get('/:id', getProblemById);

// Allow creating problems without auth for demo purposes
router.post('/', createProblem);

module.exports = router;
