const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String // URL or icon name
  },
  color: {
    type: String,
    default: '#007bff'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  quizCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);