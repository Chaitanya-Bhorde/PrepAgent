const express = require('express');
const router = express.Router();
const { runCode } = require('../controllers/executionController');
const { protect } = require('../middleware/auth');

// Apply rate limiter and auth middleware
router.use(protect);

router.post('/execute', runCode);

module.exports = router;