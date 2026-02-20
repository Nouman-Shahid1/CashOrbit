require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await Quiz.deleteMany({});
    await Question.deleteMany({});
    await User.deleteMany({});
    
    console.log('Cleared existing data');

    // Create categories
    const categories = [
      {
        name: 'Math',
        description: 'Mathematical concepts and problem solving',
        icon: '🔢',
        color: '#FF6B6B'
      },
      {
        name: 'Science',
        description: 'Physics, Chemistry, Biology and more',
        icon: '🔬',
        color: '#4ECDC4'
      },
      {
        name: 'History',
        description: 'World history and historical events',
        icon: '📚',
        color: '#45B7D1'
      },
      {
        name: 'Geography',
        description: 'Countries, capitals, and world geography',
        icon: '🌍',
        color: '#96CEB4'
      },
      {
        name: 'Technology',
        description: 'Programming, computers, and modern tech',
        icon: '💻',
        color: '#FFEAA7'
      },
      {
        name: 'General Knowledge',
        description: 'Mixed topics and trivia',
        icon: '🧠',
        color: '#DDA0DD'
      }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log('Created categories');

    // Create a sample user
    const sampleUser = new User({
      name: 'Quiz Creator',
      email: 'creator@quizgenius.com',
      password: 'password123'
    });
    await sampleUser.save();

    // Create sample quizzes
    const sampleQuizzes = [
      {
        title: 'Basic Mathematics',
        description: 'Test your fundamental math skills',
        category: 'Math',
        difficulty: 'Easy',
        timeLimit: 15,
        totalQuestions: 5,
        passingScore: 60,
        createdBy: sampleUser._id,
        tags: ['arithmetic', 'basic', 'numbers']
      },
      {
        title: 'World Capitals',
        description: 'How well do you know world capitals?',
        category: 'Geography',
        difficulty: 'Medium',
        timeLimit: 20,
        totalQuestions: 10,
        passingScore: 70,
        createdBy: sampleUser._id,
        tags: ['capitals', 'countries', 'world']
      },
      {
        title: 'JavaScript Fundamentals',
        description: 'Test your JavaScript programming knowledge',
        category: 'Technology',
        difficulty: 'Medium',
        timeLimit: 30,
        totalQuestions: 8,
        passingScore: 75,
        createdBy: sampleUser._id,
        tags: ['javascript', 'programming', 'web']
      }
    ];

    const createdQuizzes = await Quiz.insertMany(sampleQuizzes);
    console.log('Created sample quizzes');

    // Create sample questions for the first quiz (Basic Mathematics)
    const mathQuestions = [
      {
        quizId: createdQuizzes[0]._id,
        questionText: 'What is 15 + 27?',
        questionType: 'multiple-choice',
        options: [
          { text: '42', isCorrect: true },
          { text: '41', isCorrect: false },
          { text: '43', isCorrect: false },
          { text: '40', isCorrect: false }
        ],
        explanation: '15 + 27 = 42',
        points: 1,
        difficulty: 'Easy',
        order: 1
      },
      {
        quizId: createdQuizzes[0]._id,
        questionText: 'What is 8 × 7?',
        questionType: 'multiple-choice',
        options: [
          { text: '54', isCorrect: false },
          { text: '56', isCorrect: true },
          { text: '58', isCorrect: false },
          { text: '52', isCorrect: false }
        ],
        explanation: '8 × 7 = 56',
        points: 1,
        difficulty: 'Easy',
        order: 2
      },
      {
        quizId: createdQuizzes[0]._id,
        questionText: 'What is 100 ÷ 4?',
        questionType: 'multiple-choice',
        options: [
          { text: '20', isCorrect: false },
          { text: '30', isCorrect: false },
          { text: '25', isCorrect: true },
          { text: '35', isCorrect: false }
        ],
        explanation: '100 ÷ 4 = 25',
        points: 1,
        difficulty: 'Easy',
        order: 3
      },
      {
        quizId: createdQuizzes[0]._id,
        questionText: 'What is the square root of 64?',
        questionType: 'multiple-choice',
        options: [
          { text: '6', isCorrect: false },
          { text: '7', isCorrect: false },
          { text: '8', isCorrect: true },
          { text: '9', isCorrect: false }
        ],
        explanation: 'The square root of 64 is 8 because 8² = 64',
        points: 1,
        difficulty: 'Easy',
        order: 4
      },
      {
        quizId: createdQuizzes[0]._id,
        questionText: 'What is 12% of 200?',
        questionType: 'multiple-choice',
        options: [
          { text: '20', isCorrect: false },
          { text: '22', isCorrect: false },
          { text: '24', isCorrect: true },
          { text: '26', isCorrect: false }
        ],
        explanation: '12% of 200 = 0.12 × 200 = 24',
        points: 1,
        difficulty: 'Easy',
        order: 5
      }
    ];

    await Question.insertMany(mathQuestions);
    console.log('Created sample questions');

    // Update category quiz counts
    for (const category of createdCategories) {
      const count = await Quiz.countDocuments({ category: category.name, isActive: true });
      await Category.findByIdAndUpdate(category._id, { quizCount: count });
    }

    console.log('Seed data created successfully!');
    console.log('Sample user credentials:');
    console.log('Email: creator@quizgenius.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();