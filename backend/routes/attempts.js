const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  startQuizAttempt,
  submitAnswer,
  completeQuizAttempt,
  getUserAttempts,
  getAttemptDetails,
  getQuizLeaderboard
} = require('../controllers/quizAttemptController');

// @route   POST /api/attempts/start
// @desc    Start a new quiz attempt
// @access  Private
router.post('/start', auth, startQuizAttempt);

// @route   POST /api/attempts/answer
// @desc    Submit answer for a question
// @access  Private
router.post('/answer', auth, submitAnswer);

// @route   POST /api/attempts/complete
// @desc    Complete quiz attempt
// @access  Private
router.post('/complete', auth, completeQuizAttempt);

// @route   GET /api/attempts/user
// @desc    Get user's quiz attempts
// @access  Private
router.get('/user', auth, getUserAttempts);

// @route   GET /api/attempts/:id
// @desc    Get attempt details
// @access  Private
router.get('/:id', auth, getAttemptDetails);

// @route   GET /api/attempts/leaderboard/:quizId
// @desc    Get leaderboard for a quiz
// @access  Public
router.get('/leaderboard/:quizId', getQuizLeaderboard);

module.exports = router;