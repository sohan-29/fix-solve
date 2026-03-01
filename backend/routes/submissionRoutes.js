const express = require('express');
const { createSubmission } = require('../controllers/submissionController');
const Submission = require('../models/Submission');

const router = express.Router();

router.post('/', createSubmission);
router.get('/', async (req, res) => {
  try {
    const submissions = await Submission.find().populate('user', 'name').populate('problem', 'title');
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
