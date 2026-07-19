const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { protect } = require('../middleware/auth');

router.post('/', protect, submissionController.saveSubmission);
router.post('/submit', protect, submissionController.submitAsync);
router.get('/', protect, submissionController.getSubmissions);

module.exports = router;

