const express = require('express');
const router = express.Router();
const { analyzeResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const { uploadResume, handleUploadError } = require('../middleware/upload');

// Apply auth middleware to all routes
router.use(protect);

// Upload and analyze resume
router.post('/analyze', uploadResume, handleUploadError, analyzeResume);

module.exports = router;