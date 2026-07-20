const mongoose = require('mongoose');

const sqlProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Problem description is required']
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty is required'],
    enum: {
      values: ['easy', 'medium', 'hard'],
      message: 'Difficulty must be easy, medium, or hard'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  schema: {
    type: String,
    required: [true, 'Database schema is required']
  },
  sampleData: [{
    tableName: String,
    data: [String] // Array of INSERT statements
  }],
  expectedResult: {
    type: String,
    required: [true, 'Expected result is required']
  },
  hints: [String],
  tags: [String],
  companies: [String], // Company-specific tags
  acceptance: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
sqlProblemSchema.index({ difficulty: 1, category: 1 });
sqlProblemSchema.index({ title: 'text', description: 'text', tags: 'text' });
sqlProblemSchema.index({ companies: 1 });

module.exports = mongoose.model('SQLProblem', sqlProblemSchema);