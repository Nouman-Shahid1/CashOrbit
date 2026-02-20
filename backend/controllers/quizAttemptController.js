const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const User = require('../models/User');

// Start quiz attempt
exports.startQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.body;
    const userId = req.user.id;

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Create new attempt
    const attempt = new QuizAttempt({
      userId,
      quizId,
      totalQuestions: quiz.totalQuestions,
      score: 0,
      percentage: 0,
      correctAnswers: 0,
      timeSpent: 0,
      answers: []
    });

    await attempt.save();
    res.status(201).json({ attemptId: attempt._id, timeLimit: quiz.timeLimit });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Submit answer for a question
exports.submitAnswer = async (req, res) => {
  try {
    const { attemptId, questionId, selectedAnswer, timeSpent } = req.body;

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Quiz attempt not found' });
    }

    // Get correct answer
    const question = await Question.findById(questionId);
    let isCorrect = false;

    if (question.questionType === 'multiple-choice') {
      const correctOption = question.options.find(opt => opt.isCorrect);
      isCorrect = correctOption && correctOption.text === selectedAnswer;
    } else {
      isCorrect = question.correctAnswer === selectedAnswer;
    }

    // Calculate coins for correct answer
    const coinsEarned = isCorrect ? 10 : 0;

    // Update or add answer
    const existingAnswerIndex = attempt.answers.findIndex(
      ans => ans.questionId.toString() === questionId
    );

    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex] = {
        questionId,
        selectedAnswer,
        isCorrect,
        timeSpent,
        coinsEarned
      };
    } else {
      attempt.answers.push({
        questionId,
        selectedAnswer,
        isCorrect,
        timeSpent,
        coinsEarned
      });
    }

    await attempt.save();
    res.json({ message: 'Answer submitted successfully', isCorrect });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Complete quiz attempt
exports.completeQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.body;

    const attempt = await QuizAttempt.findById(attemptId).populate('quizId');
    if (!attempt) {
      return res.status(404).json({ message: 'Quiz attempt not found' });
    }

    // Calculate final score
    const correctAnswers = attempt.answers.filter(ans => ans.isCorrect).length;
    const totalTime = attempt.answers.reduce((sum, ans) => sum + ans.timeSpent, 0);
    const percentage = (correctAnswers / attempt.totalQuestions) * 100;

    // Calculate coins
    const baseCoins = correctAnswers * 10;
    let bonusCoins = { fastCompletion: 0, perfectScore: 0 };
    
    // Perfect score bonus
    if (percentage === 100) {
      bonusCoins.perfectScore = 50;
    }
    
    // Fast completion bonus (completed in less than 60% of time limit)
    const timeLimit = attempt.quizId.timeLimit * 60; // convert to seconds
    if (totalTime < timeLimit * 0.6) {
      bonusCoins.fastCompletion = 25;
    }

    const totalCoinsEarned = baseCoins + bonusCoins.fastCompletion + bonusCoins.perfectScore;

    // Update attempt
    attempt.correctAnswers = correctAnswers;
    attempt.score = correctAnswers;
    attempt.percentage = percentage;
    attempt.timeSpent = totalTime;
    attempt.status = 'completed';
    attempt.completedAt = new Date();
    attempt.coinsEarned = baseCoins;
    attempt.bonusCoins = bonusCoins;
    attempt.totalCoinsEarned = totalCoinsEarned;

    await attempt.save();

    // Update user coins and quiz history
    const user = await User.findById(attempt.userId);
    await user.addCoins(totalCoinsEarned);
    
    user.quizHistory.push({
      quizId: attempt.quizId._id,
      attemptId: attempt._id,
      score: percentage,
      coinsEarned: totalCoinsEarned,
      completedAt: attempt.completedAt
    });
    
    await user.save();

    res.json({
      score: correctAnswers,
      totalQuestions: attempt.totalQuestions,
      percentage,
      timeSpent: totalTime,
      coinsEarned: {
        base: baseCoins,
        bonus: bonusCoins,
        total: totalCoinsEarned
      },
      status: 'completed'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get user's quiz attempts
exports.getUserAttempts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const attempts = await QuizAttempt.find({ userId })
      .populate('quizId', 'title subject gradeLevel')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await QuizAttempt.countDocuments({ userId });

    res.json({
      attempts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attempt details
exports.getAttemptDetails = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.id)
      .populate('quizId', 'title subject gradeLevel')
      .populate('answers.questionId');

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get leaderboard for a quiz
exports.getQuizLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { limit = 10 } = req.query;

    const leaderboard = await QuizAttempt.find({ 
      quizId, 
      status: 'completed' 
    })
      .populate('userId', 'name')
      .sort({ totalCoinsEarned: -1, percentage: -1, timeSpent: 1 })
      .limit(limit * 1);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};