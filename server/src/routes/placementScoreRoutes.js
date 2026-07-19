const express = require('express');
const router = express.Router();
const { calculatePlacementReadinessScore } = require('../services/placementScoreService');
const { getLeaderboard } = require('../services/leaderboardService');
const { protect } = require('../middleware/auth');

// GET /api/user/placement-score/leaderboard
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const category = req.query.category || 'overall';
    const college = req.query.college || null;
    
    const leaderboard = await getLeaderboard(limit, category, college);
    return res.status(200).json(leaderboard);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// GET /api/user/placement-score
router.get('/', protect, async (req, res) => {
  try {
    const company = req.query.company || 'general';
    const score = await calculatePlacementReadinessScore(req.user._id, company);
    return res.status(200).json(score);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;