const mongoose = require('mongoose');

const userPerformanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Coding Performance
  codingStats: {
    totalProblemsSolved: { type: Number, default: 0 },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
    successfulSubmissions: { type: Number, default: 0 },
    averageTimePerProblem: { type: Number, default: 0 }, // in minutes
    totalTimeSpent: { type: Number, default: 0 }, // in minutes
    languagesUsed: [{ type: String }],
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 }
  },
  
  // Interview Performance
  interviewStats: {
    totalInterviews: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    dsaRoundScore: { type: Number, default: 0 },
    hrRoundScore: { type: Number, default: 0 },
    totalQuestionsAsked: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 } // in seconds
  },
  
  // Resume Scores History
  resumeScores: [{
    company: { type: String },
    atsScore: { type: Number },
    companyFit: { type: String },
    analyzedAt: { type: Date, default: Date.now }
  }],
  
  // SQL Performance
  sqlStats: {
    totalQueriesExecuted: { type: Number, default: 0 },
    successfulQueries: { type: Number, default: 0 },
    averageQueryTime: { type: Number, default: 0 }
  },
  
  // Overall Metrics
  overallPlacementReadinessScore: { type: Number, default: 0 },
  weakTopics: [{ type: String }],
  strongTopics: [{ type: String }],
  
  // Activity Tracking
  lastActiveDate: { type: Date, default: Date.now },
  totalDaysActive: { type: Number, default: 0 },
  weeklyGoalProgress: { type: Number, default: 0 },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before saving
userPerformanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('UserPerformance', userPerformanceSchema);