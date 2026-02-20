const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true,
    enum: ['Math', 'Science', 'English', 'History', 'Geography', 'Literature', 'Technology', 'Sports', 'General Knowledge']
  },
  gradeLevel: {
    type: String,
    required: true,
    enum: ['Grade 1-5', 'Grade 6-8', 'Grade 9-10', 'Grade 11-12']
  },
  timeLimit: {
    type: Number, // in minutes
    required: true,
    default: 5
  },
  questionTimeLimit: {
    type: Number, // in seconds per question
    required: true,
    default: 30
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  passingScore: {
    type: Number,
    required: true,
    default: 60 // percentage
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String
  }],
  thumbnail: {
    type: String // URL to image
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);