const { analyzeWeakTopics, getPersonalizedRecommendations } = require('../services/analyticsEngine');
const UserPerformance = require('../models/UserPerformance');
const Submission = require('../models/Submission');

// @desc    Get user analytics stats
// @route   GET /api/analytics/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const [performance, submissions] = await Promise.all([
      UserPerformance.findOne({ userId }),
      Submission.find({ userId })
    ]);
    
    if (!performance) {
      return res.status(200).json({
        success: true,
        data: {
          totalSubmissions: 0,
          passedSubmissions: 0,
          accuracy: 0,
          totalPoints: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalProblemsSolved: 0,
          codingStats: {},
          sqlStats: {}
        }
      });
    }
    
    const totalSubmissions = submissions.length;
    const passedSubmissions = submissions.filter(s => s.status === 'ACCEPTED' || s.status === 'SUCCESS').length;
    const accuracy = totalSubmissions > 0 ? Math.round((passedSubmissions / totalSubmissions) * 100) : 0;
    
    res.status(200).json({
      success: true,
      data: {
        totalSubmissions,
        passedSubmissions,
        accuracy,
        totalPoints: performance.totalPoints || 0,
        currentStreak: performance.currentStreak || 0,
        longestStreak: performance.longestStreak || 0,
        totalProblemsSolved: performance.codingStats?.totalProblemsSolved || 0,
        codingStats: performance.codingStats || {},
        sqlStats: performance.sqlStats || {}
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user weak areas
// @route   GET /api/analytics/weak-areas
// @access  Private
const getWeakAreas = async (req, res) => {
  try {
    const userId = req.user._id;
    const weakTopics = await analyzeWeakTopics(userId);
    
    // Get failure counts for each weak topic
    const submissions = await Submission.find({ userId, status: { $ne: 'ACCEPTED' } }).limit(100);
    const topicFailureCount = {};
    
    for (const sub of submissions) {
      const topic = mapToTopic(sub.title || sub.questionId || '');
      topicFailureCount[topic] = (topicFailureCount[topic] || 0) + 1;
    }
    
    const weakAreas = weakTopics.map(topic => ({
      topic,
      failedCount: topicFailureCount[topic] || 0,
      count: topicFailureCount[topic] || 0
    }));
    
    res.status(200).json({
      success: true,
      data: weakAreas
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get personalized recommendations
// @route   GET /api/analytics/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { weakTopics, recommendations } = await getPersonalizedRecommendations(userId);
    
    res.status(200).json({
      success: true,
      data: {
        weakTopics,
        recommendations
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const mapToTopic = (text) => {
  const lower = text.toLowerCase();
  const TOPIC_MAP = {
    'array': 'Arrays & Hashing',
    'hash': 'Arrays & Hashing',
    'string': 'Strings',
    'two pointer': 'Two Pointers',
    'sliding window': 'Sliding Window',
    'binary search': 'Binary Search',
    'tree': 'Trees',
    'graph': 'Graphs',
    'dp': 'Dynamic Programming',
    'dynamic programming': 'Dynamic Programming',
    'linked list': 'Linked Lists',
    'stack': 'Stacks & Queues',
    'queue': 'Stacks & Queues',
    'heap': 'Heaps',
    'greedy': 'Greedy',
    'backtracking': 'Backtracking',
    'sort': 'Sorting',
    'recursion': 'Recursion',
    'sql': 'SQL',
    'database': 'Database Design',
    'system design': 'System Design',
    'design': 'System Design',
  };
  
  for (const [keyword, topic] of Object.entries(TOPIC_MAP)) {
    if (lower.includes(keyword)) return topic;
  }
  return 'General';
};

module.exports = {
  getStats,
  getWeakAreas,
  getRecommendations
};