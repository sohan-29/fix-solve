const express = require('express');
const { createProblem, getProblems } = require('../controllers/problemController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createProblem);
router.get('/', getProblems);

module.exports = router;
