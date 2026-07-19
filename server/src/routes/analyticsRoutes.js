const express = require('express');
const router = express.Router();
const { getStats, getWeakAreas, getRecommendations } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

// @route   GET /api/analytics/stats
// @desc    Get user analytics stats
// @access  Private
router.get('/stats', getStats);

// @route   GET /api/analytics/weak-areas
// @desc    Get user weak areas
// @access  Private
router.get('/weak-areas', getWeakAreas);

// @route   GET /api/analytics/recommendations
// @desc    Get personalized recommendations
// @access  Private
router.get('/recommendations', getRecommendations);

module.exports = router;