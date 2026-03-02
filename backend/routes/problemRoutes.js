const express = require('express');
const { createProblem, getProblems, getProblemByRound, getProblemById, updateProblem, deleteProblem } = require('../controllers/problemController');

const router = express.Router();

// Public routes
router.get('/', getProblems);
router.get('/round/:round', getProblemByRound);
router.get('/:id', getProblemById);

// Admin routes - Allow creating, updating, and deleting problems without auth for demo purposes
router.post('/', createProblem);
router.put('/:id', updateProblem);
router.delete('/:id', deleteProblem);

module.exports = router;
