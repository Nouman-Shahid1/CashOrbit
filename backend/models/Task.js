const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Watch Video', 'Install App', 'Survey', 'Quiz', 'Daily Spin', 'Referrals', 'Manual Task']
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  coins: {
    type: Number,
    required: true
  },
  dailyLimit: {
    type: Number,
    required: true,
    default: 1
  },
  status: {
    type: String,
    enum: ['Active', 'Paused', 'Deleted'],
    default: 'Active'
  },
  // Video task specific
  watchTime: {
    type: Number, // in seconds
    required: function() { return this.type === 'Watch Video'; }
  },
  videoUrl: {
    type: String,
    required: function() { return this.type === 'Watch Video'; }
  },
  // App install specific
  appLink: {
    type: String,
    required: function() { return this.type === 'Install App'; }
  },
  appName: {
    type: String,
    required: function() { return this.type === 'Install App'; }
  },
  // Manual task specific
  instructions: {
    type: String,
    required: function() { return this.type === 'Manual Task'; }
  },
  requiresScreenshot: {
    type: Boolean,
    default: true
  },
  completions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);