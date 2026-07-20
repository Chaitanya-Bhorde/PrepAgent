const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: String, // Can be mongo ObjectId for coding, or string id for SQL (e.g., 'lc-181')
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['coding', 'sql'],
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['ACCEPTED', 'SUCCESS', 'FAILED', 'COMPILE_ERROR', 'RUNTIME_ERROR', 'LIMIT_REACHED'],
    required: true
  },
  runtime: {
    type: Number, // milliseconds
    default: 0
  },
  memory: {
    type: Number, // in MB
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  testCases: [{
    input: String,
    expectedOutput: String,
    actualOutput: String,
    passed: Boolean,
    executionTime: Number // milliseconds
  }],
  errorMessage: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
submissionSchema.index({ userId: 1, createdAt: -1 });
submissionSchema.index({ questionId: 1, status: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
