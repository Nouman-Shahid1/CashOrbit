const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Free', 'Basic', 'Standard', 'Premier']
  },
  depositAmount: {
    type: Number,
    required: true,
    default: 0
  },
  dailyTasks: {
    type: String,
    required: true
  },
  coinMultiplier: {
    type: String,
    required: true
  },
  withdrawLimit: {
    type: Number,
    required: true
  },
  coinRate: {
    type: Number,
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Plan', planSchema);