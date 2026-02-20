const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    selectedAnswer: String,
    isCorrect: Boolean,
    timeSpent: Number, // in seconds
    coinsEarned: {
      type: Number,
      default: 0
    }
  }],
  score: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number, // total time in seconds
    required: true
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  coinsEarned: {
    type: Number,
    default: 0
  },
  bonusCoins: {
    fastCompletion: {
      type: Number,
      default: 0
    },
    perfectScore: {
      type: Number,
      default: 0
    }
  },
  totalCoinsEarned: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);