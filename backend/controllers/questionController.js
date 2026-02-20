const Question = require('../models/Question');
const Quiz = require('../models/Quiz');

// Get questions for a quiz
exports.getQuestionsByQuiz = async (req, res) => {
  try {
    const questions = await Question.find({ quizId: req.params.quizId })
      .sort({ order: 1 })
      .select('-correctAnswer -explanation'); // Hide answers for quiz taking
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get questions with answers (for admin/creator)
exports.getQuestionsWithAnswers = async (req, res) => {
  try {
    const questions = await Question.find({ quizId: req.params.quizId })
      .sort({ order: 1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new question
exports.createQuestion = async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    
    // Update quiz total questions count
    await Quiz.findByIdAndUpdate(
      req.body.quizId,
      { $inc: { totalQuestions: 1 } }
    );
    
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    // Update quiz total questions count
    await Quiz.findByIdAndUpdate(
      question.quizId,
      { $inc: { totalQuestions: -1 } }
    );
    
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk create questions
exports.bulkCreateQuestions = async (req, res) => {
  try {
    const { quizId, questions } = req.body;
    
    const createdQuestions = await Question.insertMany(
      questions.map((q, index) => ({
        ...q,
        quizId,
        order: index + 1
      }))
    );
    
    // Update quiz total questions count
    await Quiz.findByIdAndUpdate(
      quizId,
      { totalQuestions: createdQuestions.length }
    );
    
    res.status(201).json(createdQuestions);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};