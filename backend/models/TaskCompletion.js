const mongoose = require('mongoose');

const taskCompletionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
    default: 'Pending'
  },
  coinsEarned: {
    type: Number,
    required: true
  },
  submissionData: {
    screenshot: String,
    notes: String,
    transactionId: String
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String
}, {
  timestamps: true
});

// Index for daily task limits
taskCompletionSchema.index({ user: 1, task: 1, completedAt: 1 });

module.exports = mongoose.model('TaskCompletion', taskCompletionSchema);