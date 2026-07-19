// Dynamic Difficulty Adjustment
// Tracks user performance and recommends next problem difficulty

const UserPerformance = require('../models/UserPerformance');

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];
const DIFFICULTY_SCORES = { easy: 1, medium: 2, hard: 3 };

const getRecommendedDifficulty = async (userId) => {
  try {
    const performance = await UserPerformance.findOne({ userId });
    if (!performance) return 'easy';

    const { codingStats } = performance;
    const total = codingStats.totalProblemsSolved || 0;
    const successRate = codingStats.totalSubmissions > 0 
      ? codingStats.successfulSubmissions / codingStats.totalSubmissions 
      : 0;

    // New users start with easy
    if (total < 5) return 'easy';
    
    // Calculate weighted difficulty score
    const avgDifficulty = (
      codingStats.easySolved * 1 + 
      codingStats.mediumSolved * 2 + 
      codingStats.hardSolved * 3
    ) / Math.max(total, 1);

    // Adaptive logic
    if (successRate > 0.8 && avgDifficulty >= 2) {
      return 'hard'; // High performer, move to hard
    } else if (successRate > 0.7 && avgDifficulty >= 1.5) {
      return 'medium'; // Good performer, stay at medium
    } else if (successRate > 0.6) {
      return 'medium'; // Try medium
    } else if (successRate < 0.3 && total > 10) {
      return 'easy'; // Struggling, go back to easy
    }

    return 'medium'; // Default
  } catch (error) {
    console.error('Error getting recommended difficulty:', error);
    return 'easy';
  }
};

const adjustProblemSequence = (problems, userPerformance) => {
  // Sort problems based on user's weak areas
  const weakTopics = userPerformance?.weakTopics || [];
  
  return problems.sort((a, b) => {
    const aIsWeak = weakTopics.some(t => 
      (a.category || a.tags || []).some(tag => tag.toLowerCase().includes(t.toLowerCase()))
    );
    const bIsWeak = weakTopics.some(t => 
      (b.category || b.tags || []).some(tag => tag.toLowerCase().includes(t.toLowerCase()))
    );

    // Prioritize weak topics
    if (aIsWeak && !bIsWeak) return -1;
    if (!aIsWeak && bIsWeak) return 1;
    return 0;
  });
};

module.exports = { getRecommendedDifficulty, adjustProblemSequence };