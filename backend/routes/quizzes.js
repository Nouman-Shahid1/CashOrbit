const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizStats
} = require('../controllers/quizController');

// @route   GET /api/quizzes
// @desc    Get all quizzes
// @access  Public
router.get('/', getAllQuizzes);

// @route   GET /api/quizzes/:id
// @desc    Get quiz by ID
// @access  Public
router.get('/:id', getQuizById);

// @route   POST /api/quizzes
// @desc    Create new quiz
// @access  Private
router.post('/', auth, createQuiz);

// @route   PUT /api/quizzes/:id
// @desc    Update quiz
// @access  Private
router.put('/:id', auth, updateQuiz);

// @route   DELETE /api/quizzes/:id
// @desc    Delete quiz
// @access  Private
router.delete('/:id', auth, deleteQuiz);

// @route   GET /api/quizzes/:id/stats
// @desc    Get quiz statistics
// @access  Public
router.get('/:id/stats', getQuizStats);

module.exports = router;