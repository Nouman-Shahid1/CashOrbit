const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');

// Get all quizzes
exports.getAllQuizzes = async (req, res) => {
  try {
    const { subject, gradeLevel, page = 1, limit = 10 } = req.query;
    const filter = { isActive: true };
    
    if (subject) filter.subject = subject;
    if (gradeLevel) filter.gradeLevel = gradeLevel;

    const quizzes = await Quiz.find(filter)
      .populate('createdBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Quiz.countDocuments(filter);

    res.json({
      quizzes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new quiz
exports.createQuiz = async (req, res) => {
  try {
    const quiz = new Quiz({
      ...req.body,
      createdBy: req.user.id
    });
    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update quiz
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    // Also delete associated questions
    await Question.deleteMany({ quizId: req.params.id });
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get quiz statistics
exports.getQuizStats = async (req, res) => {
  try {
    const quizId = req.params.id;
    const attempts = await QuizAttempt.find({ quizId, status: 'completed' });
    
    const stats = {
      totalAttempts: attempts.length,
      averageScore: attempts.length > 0 ? attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / attempts.length : 0,
      highestScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage)) : 0,
      averageTime: attempts.length > 0 ? attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0) / attempts.length : 0
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};