const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contestController');
const { protect } = require('../middleware/auth');

router.get('/', protect, contestController.getContests);
router.get('/:id', protect, contestController.getContestById);
router.post('/submit', protect, contestController.submitContestCode);
router.get('/:id/leaderboard', protect, contestController.getLeaderboard);

module.exports = router;
