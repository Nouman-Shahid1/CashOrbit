const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getQuizSuggestions,
  getPerformanceAnalytics,
  generateQuestions
} = require('../controllers/aiController');

// @route   GET /api/ai/suggestions
// @desc    Get AI-powered quiz suggestions
// @access  Private
router.get('/suggestions', auth, getQuizSuggestions);

// @route   GET /api/ai/analytics
// @desc    Get performance analytics
// @access  Private
router.get('/analytics', auth, getPerformanceAnalytics);

// @route   POST /api/ai/generate-questions
// @desc    Generate questions using AI
// @access  Private
router.post('/generate-questions', auth, generateQuestions);

// @route   POST /api/ai/generate-metadata
// @desc    Generate quiz metadata
// @access  Private
router.post('/generate-metadata', auth, require('../controllers/aiQuizController').generateQuizMetadata);

// @route   POST /api/ai/create-quiz
// @desc    Create complete AI quiz
// @access  Private
router.post('/create-quiz', auth, require('../controllers/aiQuizController').createAIQuiz);

module.exports = router;