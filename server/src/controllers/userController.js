const User = require('../models/User');
const Bookmark = require('../models/Bookmark');
const Note = require('../models/Note');

// Toggle Bookmark state for questions
exports.toggleBookmark = async (req, res) => {
  const { questionId, title, type, difficulty } = req.body;
  const userId = req.user.id;

  try {
    const existing = await Bookmark.findOne({ userId, questionId });

    if (existing) {
      await Bookmark.deleteOne({ userId, questionId });
      return res.status(200).json({ success: true, bookmarked: false, message: 'Bookmark removed.' });
    }

    const bookmark = new Bookmark({
      userId,
      questionId,
      title,
      type,
      difficulty
    });
    await bookmark.save();
    res.status(201).json({ success: true, bookmarked: true, bookmark });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch bookmarked questions
exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user.id });
    res.status(200).json({ success: true, bookmarks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Save or Update Notes
exports.saveNote = async (req, res) => {
  const { questionId, title, content, codeSnippet, language } = req.body;
  const userId = req.user.id;

  try {
    let note = await Note.findOne({ userId, questionId });

    if (note) {
      note.content = content;
      note.codeSnippet = codeSnippet;
      note.language = language;
      note.updatedAt = Date.now();
      await note.save();
    } else {
      note = new Note({
        userId,
        questionId,
        title,
        content,
        codeSnippet,
        language
      });
      await note.save();
    }

    res.status(200).json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch all notes for user
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update active streak on activity
exports.updateStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = user.streak.lastActive ? new Date(user.streak.lastActive) : null;
    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(today - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Active next day
        user.streak.count += 1;
        if (user.streak.count > user.streak.longest) {
          user.streak.longest = user.streak.count;
        }
      } else if (diffDays > 1) {
        // Streak broken
        user.streak.count = 1;
      }
    } else {
      // First active day
      user.streak.count = 1;
      user.streak.longest = 1;
    }

    user.streak.lastActive = today;
    await user.save();
  } catch (err) {
    console.error('Streak update failed', err);
  }
};

// Get stats dashboard overview
exports.getStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('streak solvedCount achievements');
    const bookmarksCount = await Bookmark.countDocuments({ userId: req.user.id });
    const notesCount = await Note.countDocuments({ userId: req.user.id });

    // Compute dynamic SDE Placement Readiness Score
    const solvedCount = (user.solvedCount?.easy || 0) + (user.solvedCount?.medium || 0) + (user.solvedCount?.hard || 0);
    const solvedWeight = Math.min(100, solvedCount * 15); // Max 100
    const streakWeight = Math.min(100, (user.streak?.count || 0) * 10);
    
    // Dynamic formula giving realistic SDE score
    let readinessScore = Math.round((solvedWeight * 0.5) + (streakWeight * 0.3) + 40);
    readinessScore = Math.min(100, Math.max(35, readinessScore));

    res.status(200).json({
      success: true,
      stats: {
        streak: user.streak,
        solvedCount: user.solvedCount,
        achievements: user.achievements,
        bookmarksCount,
        notesCount,
        placementReadiness: readinessScore
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
