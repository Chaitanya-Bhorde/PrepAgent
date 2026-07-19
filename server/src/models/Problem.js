const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
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
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  constraints: [String],
  starterTemplates: [{
    language: {
      type: String,
      enum: ['javascript', 'python', 'java', 'cpp']
    },
    code: String
  }],
  solution: {
    code: String,
    explanation: String
  },
  hints: [String],
  tags: [String],
  acceptance: {
    type: Number,
    default: 0
  },
  frequency: {
    type: Number,
    default: 0
  },
  companies: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
problemSchema.index({ difficulty: 1, category: 1 });
problemSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Problem', problemSchema);