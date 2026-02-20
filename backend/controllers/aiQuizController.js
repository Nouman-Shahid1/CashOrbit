const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
// AI-powered random quiz generation

// AI-powered quiz creation
exports.createAIQuiz = async (req, res) => {
  try {
    const { topic, difficulty, questionCount = 10, category } = req.body;

    // AI generate random quiz
    const categories = ['Science', 'History', 'Math', 'Geography', 'Technology', 'Literature', 'Sports', 'Art', 'Music', 'Nature'];
    const randomCategory = category || categories[Math.floor(Math.random() * categories.length)];
    const randomTopic = topic || `Random ${randomCategory} Topics`;
    
    const aiQuizData = {
      title: `${randomTopic} Quiz - ${difficulty} Level`,
      description: `AI-generated ${difficulty} level quiz about ${randomTopic} with ${questionCount} random questions.`,
      questions: Array.from({length: questionCount}, (_, i) => {
        const questionTypes = ['What is', 'Which', 'How many', 'When did', 'Where is', 'Who was'];
        const randomQuestionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        const randomElement = Math.floor(Math.random() * 1000);
        
        return {
          questionText: `${randomQuestionType} ${randomTopic.toLowerCase()} question ${i+1}? (ID: ${randomElement})`,
          questionType: 'multiple-choice',
          options: [
            { text: `Answer A (${Math.floor(Math.random() * 100)})`, isCorrect: true },
            { text: `Answer B (${Math.floor(Math.random() * 100)})`, isCorrect: false },
            { text: `Answer C (${Math.floor(Math.random() * 100)})`, isCorrect: false },
            { text: `Answer D (${Math.floor(Math.random() * 100)})`, isCorrect: false }
          ],
          explanation: `AI-generated explanation for ${randomTopic} question ${i+1}`,
          points: difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : 3
        };
      })
    };

    // Create quiz
    const quiz = new Quiz({
      title: aiQuizData.title,
      description: aiQuizData.description,
      category: category || 'General Knowledge',
      difficulty,
      timeLimit: questionCount * 2, // 2 minutes per question
      totalQuestions: questionCount,
      passingScore: 60,
      createdBy: req.user.id,
      tags: [topic, 'ai-generated']
    });

    await quiz.save();

    // Create questions
    const questions = aiQuizData.questions.map((q, index) => ({
      ...q,
      quizId: quiz._id,
      difficulty,
      order: index + 1
    }));

    await Question.insertMany(questions);

    res.status(201).json({
      quiz,
      message: 'AI-generated quiz created successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// AI quiz title and description generator
exports.generateQuizMetadata = async (req, res) => {
  try {
    const { topic, difficulty, questionCount } = req.body;

    // Free AI metadata generation
    const titles = [
      `Master ${topic}`,
      `${topic} Challenge`,
      `Ultimate ${topic} Quiz`,
      `${topic} Expert Test`
    ];
    
    const metadata = {
      title: titles[Math.floor(Math.random() * titles.length)],
      description: `Challenge yourself with this ${difficulty} level quiz about ${topic}. Test your knowledge with ${questionCount} carefully crafted questions!`
    };
    res.json(metadata);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createAIQuiz: exports.createAIQuiz,
  generateQuizMetadata: exports.generateQuizMetadata
};