const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const { protect } = require('../middleware/auth');

// GET /api/problems - Get all problems
router.get('/', problemController.getProblems);

// GET /api/problems/recommend - Get recommended problems
router.get('/recommend', protect, problemController.getRecommend);

// GET /api/problems/:id - Get single problem
router.get('/:id', problemController.getProblem);

// POST /api/problems - Create problem (admin only)
router.post('/', protect, problemController.createProblem);

module.exports = router;