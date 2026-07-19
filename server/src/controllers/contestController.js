const Contest = require('../models/Contest');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { updateStreak } = require('./userController');

// Fetch contests
exports.getContests = async (req, res) => {
  try {
    const contests = await Contest.find().sort({ startTime: -1 });
    res.status(200).json({ success: true, contests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch single contest
exports.getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate('problems');
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found.' });
    }
    res.status(200).json({ success: true, contest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit contest code
exports.submitContestCode = async (req, res) => {
  const { contestId, questionId, code, language, status, difficulty } = req.body;
  const userId = req.user.id;
  const userName = req.user.name;

  try {
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found.' });
    }

    // Save submission history
    const submission = new Submission({
      userId,
      questionId,
      title: 'Contest Submission',
      type: 'coding',
      code,
      language,
      status,
      difficulty,
      runtime: Math.floor(Math.random() * 80) + 10 // Mock runtimes
    });
    await submission.save();

    // Trigger user streak update on activity
    await updateStreak(userId);

    // If solution is accepted, recalculate contest score
    if (status === 'ACCEPTED') {
      // Calculate score based on difficulty
      const points = difficulty === 'hard' ? 30 : difficulty === 'medium' ? 20 : 10;

      let participant = contest.participants.find(p => p.userId && p.userId.toString() === userId.toString());
      if (participant) {
        participant.score += points;
        participant.finishTime = new Date();
      } else {
        contest.participants.push({
          userId,
          name: userName || 'Anonymous Candidate',
          score: points,
          finishTime: new Date()
        });
      }
      await contest.save();

      // Check if user solvedCount needs increment
      const user = await User.findById(userId);
      if (user) {
        user.solvedCount[difficulty] = (user.solvedCount[difficulty] || 0) + 1;
        if (!user.achievements.includes('FIRST_SUBMISSION')) {
          user.achievements.push('FIRST_SUBMISSION');
        }
        await user.save();
      }
    }

    res.status(200).json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Retrieve Leaderboard for single contest
exports.getLeaderboard = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found.' });
    }

    // Sort participants by score descending, then finishTime ascending
    const leaderboard = contest.participants.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(a.finishTime) - new Date(b.finishTime);
    });

    res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
