const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  atsScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  companyFit: {
    type: String,
    required: true
  },
  analysis: {
    summary: String,
    strengths: [String],
    weaknesses: [String],
    missingKeywords: [String],
    formattingIssues: [String],
    suggestions: [String]
  },
  targetCompany: {
    type: String,
    default: 'General'
  },
  analyzedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
resumeAnalysisSchema.index({ userId: 1, analyzedAt: -1 });

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);