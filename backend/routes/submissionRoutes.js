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

// Delete submission by ID
router.delete('/:id', async (req, res) => {
  try {
    const submission = await Submission.findByIdAndDelete(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    res.json({ message: 'Submission deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
