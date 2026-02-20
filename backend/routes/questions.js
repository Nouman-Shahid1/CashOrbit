const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getQuestionsByQuiz,
  getQuestionsWithAnswers,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkCreateQuestions
} = require('../controllers/questionController');

// @route   GET /api/questions/quiz/:quizId
// @desc    Get questions for a quiz (without answers)
// @access  Public
router.get('/quiz/:quizId', getQuestionsByQuiz);

// @route   GET /api/questions/quiz/:quizId/admin
// @desc    Get questions with answers (for admin)
// @access  Private
router.get('/quiz/:quizId/admin', auth, getQuestionsWithAnswers);

// @route   POST /api/questions
// @desc    Create new question
// @access  Private
router.post('/', auth, createQuestion);

// @route   POST /api/questions/bulk
// @desc    Bulk create questions
// @access  Private
router.post('/bulk', auth, bulkCreateQuestions);

// @route   PUT /api/questions/:id
// @desc    Update question
// @access  Private
router.put('/:id', auth, updateQuestion);

// @route   DELETE /api/questions/:id
// @desc    Delete question
// @access  Private
router.delete('/:id', auth, deleteQuestion);

module.exports = router;