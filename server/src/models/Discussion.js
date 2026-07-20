const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  problemType: {
    type: String,
    enum: ['coding', 'sql'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required']
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion',
    default: null // null means top-level comment
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  isSolution: {
    type: Boolean,
    default: false // Marked as official solution
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
discussionSchema.index({ problemId: 1, problemType: 1, createdAt: -1 });
discussionSchema.index({ userId: 1 });
discussionSchema.index({ parentComment: 1 });

module.exports = mongoose.model('Discussion', discussionSchema);