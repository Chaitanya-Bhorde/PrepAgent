const Submission = require('../models/Submission');
const User = require('../models/User');
const { updateStreak } = require('./userController');
const { sendSubmissionToQueue } = require('../services/kafkaService');

// Asynchronous submission via Kafka queue
exports.submitAsync = async (req, res) => {
  const { problemId, title, code, language, difficulty } = req.body;
  const userId = req.user.id;

  try {
    const submission = new Submission({
      userId,
      questionId: problemId,
      title: title || 'Submission',
      type: 'CODING',
      code,
      language,
      status: 'PENDING',
      difficulty: difficulty || 'medium',
      runtime: 0
    });

    await submission.save();

    // Push to Kafka (or local fallback) queue
    await sendSubmissionToQueue(submission._id, userId, problemId, code, language);

    // Trigger streak checks
    await updateStreak(userId);

    res.status(202).json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Save generic coding / SQL run submissions
exports.saveSubmission = async (req, res) => {
  const { questionId, title, type, code, language, status, difficulty, runtime } = req.body;
  const userId = req.user.id;

  try {
    const submission = new Submission({
      userId,
      questionId,
      title,
      type,
      code,
      language,
      status,
      difficulty,
      runtime: runtime || Math.floor(Math.random() * 50) + 5
    });

    await submission.save();

    // Trigger user streak check
    await updateStreak(userId);

    // If successfully accepted, increment user stats
    if (status === 'ACCEPTED' || status === 'SUCCESS') {
      const user = await User.findById(userId);
      if (user) {
        user.solvedCount[difficulty] = (user.solvedCount[difficulty] || 0) + 1;
        
        // Dynamic achievements trigger
        if (!user.achievements.includes('FIRST_SUBMISSION')) {
          user.achievements.push('FIRST_SUBMISSION');
        }
        const totalSolvedCount = user.solvedCount.easy + user.solvedCount.medium + user.solvedCount.hard;
        if (totalSolvedCount >= 5 && !user.achievements.includes('CODING_STAR_5')) {
          user.achievements.push('CODING_STAR_5');
        }
        await user.save();
      }
    }

    res.status(201).json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Retrieve recent submissions history
exports.getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
