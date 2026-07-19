const UserPerformance = require('../models/UserPerformance');

/**
 * Calculate Combined Placement Readiness Score
 * Combines resume ATS score, coding performance, and interview performance
 * 
 * @param {string} userId - User ID
 * @param {string} targetCompany - Target company for company-specific scoring
 * @returns {Promise<Object>} - Placement readiness score and breakdown
 */
const calculatePlacementReadinessScore = async (userId, targetCompany = 'general') => {
  try {
    const performance = await UserPerformance.findOne({ userId });
    
    if (!performance) {
      return {
        overallScore: 0,
        breakdown: {
          resumeScore: 0,
          codingScore: 0,
          interviewScore: 0,
          sqlScore: 0
        },
        recommendations: ['Start practicing to build your profile!']
      };
    }

    // Calculate individual component scores (0-100 each)
    
    // 1. Resume Score (based on latest ATS score)
    const latestResumeScore = performance.resumeScores.length > 0 
      ? performance.resumeScores[performance.resumeScores.length - 1].atsScore 
      : 0;
    
    // 2. Coding Score (based on problem solving success rate and difficulty)
    const codingSuccessRate = performance.codingStats.totalSubmissions > 0
      ? (performance.codingStats.successfulSubmissions / performance.codingStats.totalSubmissions) * 100
      : 0;
    
    const difficultyWeight = 
      (performance.codingStats.easySolved * 1 + 
       performance.codingStats.mediumSolved * 2 + 
       performance.codingStats.hardSolved * 3) / 
      Math.max(performance.codingStats.totalProblemsSolved, 1);
    
    const codingScore = Math.min(100, (codingSuccessRate * 0.7 + difficultyWeight * 10));
    
    // 3. Interview Score
    const interviewScore = performance.interviewStats.averageScore || 0;
    
    // 4. SQL Score
    const sqlSuccessRate = performance.sqlStats.totalQueriesExecuted > 0
      ? (performance.sqlStats.successfulQueries / performance.sqlStats.totalQueriesExecuted) * 100
      : 0;
    const sqlScore = sqlSuccessRate;

    // Company-specific weight adjustments
    const companyWeights = getCompanyWeights(targetCompany);
    
    // Calculate weighted overall score
    const overallScore = Math.round(
      (latestResumeScore * companyWeights.resume * 0.25) +
      (codingScore * companyWeights.coding * 0.35) +
      (interviewScore * companyWeights.interview * 0.30) +
      (sqlScore * companyWeights.sql * 0.10)
    );

    // Update Redis leaderboard cache
    const { updateLeaderboardScore } = require('./leaderboardService');
    updateLeaderboardScore(userId, overallScore).catch(err => console.error('Redis leaderboard update failed:', err.message));

    // Generate recommendations
    const recommendations = generateRecommendations(performance, {
      resume: latestResumeScore,
      coding: codingScore,
      interview: interviewScore,
      sql: sqlScore
    });

    return {
      overallScore: Math.min(100, overallScore),
      breakdown: {
        resumeScore: Math.round(latestResumeScore),
        codingScore: Math.round(codingScore),
        interviewScore: Math.round(interviewScore),
        sqlScore: Math.round(sqlScore)
      },
      companyFit: getCompanyFitLevel(overallScore),
      recommendations,
      targetCompany
    };
  } catch (error) {
    console.error('Error calculating placement score:', error);
    throw error;
  }
};

/**
 * Get company-specific weight adjustments
 */
function getCompanyWeights(company) {
  const weights = {
    'amazon': {
      resume: 1.0,
      coding: 1.3,  // Amazon emphasizes coding heavily
      interview: 1.2,
      sql: 0.8
    },
    'cognizant': {
      resume: 1.2,
      coding: 1.0,
      interview: 1.0,
      sql: 1.2  // Cognizant emphasizes SQL
    },
    'tcs': {
      resume: 1.1,
      coding: 1.0,
      interview: 1.1,
      sql: 1.1
    },
    'general': {
      resume: 1.0,
      coding: 1.0,
      interview: 1.0,
      sql: 1.0
    }
  };

  return weights[company.toLowerCase()] || weights['general'];
}

/**
 * Get company fit level based on score
 */
function getCompanyFitLevel(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Fair';
  return 'Needs Improvement';
}

/**
 * Generate personalized recommendations
 */
function generateRecommendations(performance, scores) {
  const recommendations = [];

  // Resume recommendations
  if (scores.resume < 70) {
    recommendations.push('Improve your resume with more relevant keywords and quantifiable achievements');
  }

  // Coding recommendations
  if (scores.coding < 60) {
    recommendations.push('Practice more coding problems, focus on medium and hard difficulty');
  }
  if (performance.codingStats.easySolved > performance.codingStats.mediumSolved * 2) {
    recommendations.push('Challenge yourself with medium and hard difficulty problems');
  }

  // Interview recommendations
  if (scores.interview < 70) {
    recommendations.push('Practice explaining your thought process clearly during interviews');
  }

  // SQL recommendations
  if (scores.sql < 70) {
    recommendations.push('Practice SQL queries with JOINs, subqueries, and aggregations');
  }

  // Streak recommendations
  if (performance.codingStats.currentStreak < 3) {
    recommendations.push('Build a consistent practice streak - aim for at least 7 days');
  }

  // Default recommendation if all good
  if (recommendations.length === 0) {
    recommendations.push('Great job! Keep maintaining your practice schedule');
  }

  return recommendations.slice(0, 5); // Return top 5 recommendations
}

/**
 * Update user performance stats after coding submission
 */
const updateCodingStats = async (userId, problemData) => {
  try {
    const performance = await UserPerformance.findOne({ userId });
    
    if (!performance) {
      const newPerformance = new UserPerformance({
        userId,
        codingStats: {
          totalSubmissions: 1,
          successfulSubmissions: problemData.success ? 1 : 0,
          totalProblemsSolved: problemData.success ? 1 : 0,
          easySolved: problemData.difficulty === 'easy' && problemData.success ? 1 : 0,
          mediumSolved: problemData.difficulty === 'medium' && problemData.success ? 1 : 0,
          hardSolved: problemData.difficulty === 'hard' && problemData.success ? 1 : 0,
          totalTimeSpent: problemData.timeSpent || 0,
          languagesUsed: [problemData.language],
          currentStreak: 1,
          longestStreak: 1
        }
      });
      
      await newPerformance.save();
      return newPerformance;
    }

    // Update stats
    performance.codingStats.totalSubmissions += 1;
    if (problemData.success) {
      performance.codingStats.successfulSubmissions += 1;
      performance.codingStats.totalProblemsSolved += 1;
      
      if (problemData.difficulty === 'easy') performance.codingStats.easySolved += 1;
      if (problemData.difficulty === 'medium') performance.codingStats.mediumSolved += 1;
      if (problemData.difficulty === 'hard') performance.codingStats.hardSolved += 1;
    }
    
    performance.codingStats.totalTimeSpent += problemData.timeSpent || 0;
    performance.codingStats.averageTimePerProblem = 
      performance.codingStats.totalTimeSpent / performance.codingStats.totalProblemsSolved;
    
    // Add language if not already present
    if (!performance.codingStats.languagesUsed.includes(problemData.language)) {
      performance.codingStats.languagesUsed.push(problemData.language);
    }

    // Update streak
    const today = new Date().toDateString();
    const lastActive = new Date(performance.lastActiveDate).toDateString();
    
    if (today !== lastActive) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (yesterday.toDateString() === lastActive) {
        performance.codingStats.currentStreak += 1;
        performance.codingStats.longestStreak = Math.max(
          performance.codingStats.longestStreak,
          performance.codingStats.currentStreak
        );
      } else {
        performance.codingStats.currentStreak = 1;
      }
      
      performance.totalDaysActive += 1;
    }
    
    performance.lastActiveDate = new Date();

    await performance.save();
    return performance;
  } catch (error) {
    console.error('Error updating coding stats:', error);
    throw error;
  }
};

/**
 * Update interview stats
 */
const updateInterviewStats = async (userId, interviewData) => {
  try {
    const performance = await UserPerformance.findOne({ userId });
    
    if (!performance) {
      return null;
    }

    performance.interviewStats.totalInterviews += 1;
    performance.interviewStats.averageScore = 
      (performance.interviewStats.averageScore * (performance.interviewStats.totalInterviews - 1) + interviewData.score) /
      performance.interviewStats.totalInterviews;
    
    if (interviewData.round === 'dsa') {
      performance.interviewStats.dsaRoundScore = 
        (performance.interviewStats.dsaRoundScore + interviewData.score) / 2;
    } else if (interviewData.round === 'hr') {
      performance.interviewStats.hrRoundScore = 
        (performance.interviewStats.hrRoundScore + interviewData.score) / 2;
    }
    
    performance.interviewStats.totalQuestionsAsked += interviewData.questionsAsked || 0;
    performance.interviewStats.averageResponseTime = 
      (performance.interviewStats.averageResponseTime + (interviewData.responseTime || 0)) / 2;

    await performance.save();
    return performance;
  } catch (error) {
    console.error('Error updating interview stats:', error);
    throw error;
  }
};

/**
 * Update SQL stats
 */
const updateSQLStats = async (userId, sqlData) => {
  try {
    const performance = await UserPerformance.findOne({ userId });
    
    if (!performance) {
      return null;
    }

    performance.sqlStats.totalQueriesExecuted += 1;
    if (sqlData.success) {
      performance.sqlStats.successfulQueries += 1;
    }
    performance.sqlStats.averageQueryTime = 
      (performance.sqlStats.averageQueryTime + (sqlData.executionTime || 0)) / 2;

    await performance.save();
    return performance;
  } catch (error) {
    console.error('Error updating SQL stats:', error);
    throw error;
  }
};

module.exports = {
  calculatePlacementReadinessScore,
  updateCodingStats,
  updateInterviewStats,
  updateSQLStats
};