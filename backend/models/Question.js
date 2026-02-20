const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    required: true,
    enum: ['multiple-choice', 'true-false', 'fill-blank', 'essay']
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: {
    type: String // For fill-blank and essay questions
  },
  explanation: {
    type: String
  },
  points: {
    type: Number,
    default: 1
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  order: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);