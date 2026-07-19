const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    enum: ['candidate', 'dsa_interviewer', 'hr_interviewer', 'system_design_interviewer', 'system'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const evaluationSchema = new mongoose.Schema({
  dsaScore: { type: Number, min: 0, max: 100, default: 0 },
  hrScore: { type: Number, min: 0, max: 100, default: 0 },
  systemDesignScore: { type: Number, min: 0, max: 100, default: 0 },
  placementReadinessScore: { type: Number, min: 0, max: 100, default: 0 },
  feedback: { type: String, default: '' },
  timeComplexityRating: { type: String, default: '' },
  spaceComplexityRating: { type: String, default: '' },
  timelineSuggestions: [
    {
      timestamp: { type: String },
      comment: { type: String }
    }
  ]
});

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: false
  },
  interviewerType: {
    type: String,
    enum: ['dsa', 'system-design', 'hr'],
    default: 'dsa'
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  chatHistory: [chatMessageSchema],
  currentCode: {
    type: String,
    default: ''
  },
  currentLanguage: {
    type: String,
    default: 'javascript'
  },
  evaluation: evaluationSchema,
  keystrokeSnapshots: [
    {
      code: { type: String },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

interviewSessionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
