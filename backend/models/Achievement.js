const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['savings', 'spending', 'learning', 'streak'],
    required: true
  },
  requirement: {
    type: Number,
    required: true
  },
  reward: {
    experience: {
      type: Number,
      default: 0
    },
    coins: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Achievement', achievementSchema);