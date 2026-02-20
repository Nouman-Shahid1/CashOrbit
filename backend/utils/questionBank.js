const questionBank = {
  Math: {
    Easy: [
      { q: "What is 5 + 3?", options: ["8", "7", "9", "6"], correct: 0 },
      { q: "What is 10 - 4?", options: ["6", "5", "7", "8"], correct: 0 },
      { q: "What is 3 × 4?", options: ["12", "10", "14", "16"], correct: 0 },
      { q: "What is 15 ÷ 3?", options: ["5", "4", "6", "3"], correct: 0 }
    ],
    Medium: [
      { q: "What is 25% of 80?", options: ["20", "15", "25", "30"], correct: 0 },
      { q: "What is √49?", options: ["7", "6", "8", "9"], correct: 0 }
    ],
    Hard: [
      { q: "What is the derivative of x²?", options: ["2x", "x", "x²", "2"], correct: 0 }
    ]
  },
  Science: {
    Easy: [
      { q: "What gas do plants absorb?", options: ["CO2", "O2", "N2", "H2"], correct: 0 },
      { q: "How many bones in human body?", options: ["206", "205", "207", "208"], correct: 0 }
    ],
    Medium: [
      { q: "What is the speed of light?", options: ["3×10⁸ m/s", "2×10⁸ m/s", "4×10⁸ m/s", "5×10⁸ m/s"], correct: 0 }
    ],
    Hard: [
      { q: "What is Avogadro's number?", options: ["6.022×10²³", "6.022×10²²", "6.022×10²⁴", "6.022×10²¹"], correct: 0 }
    ]
  },
  Technology: {
    Easy: [
      { q: "What does HTML stand for?", options: ["HyperText Markup Language", "Home Tool Markup Language", "Hyperlinks Text Mark Language", "None"], correct: 0 }
    ],
    Medium: [
      { q: "What is JavaScript?", options: ["Programming language", "Markup language", "Database", "OS"], correct: 0 }
    ],
    Hard: [
      { q: "What is Big O notation?", options: ["Algorithm complexity", "Data structure", "Programming language", "Database"], correct: 0 }
    ]
  }
};

function getRandomQuestions(category, difficulty, count) {
  const questions = questionBank[category]?.[difficulty] || [];
  const result = [];
  
  for (let i = 0; i < count; i++) {
    if (questions.length > 0) {
      const randomQ = questions[Math.floor(Math.random() * questions.length)];
      result.push({
        questionText: randomQ.q,
        questionType: 'multiple-choice',
        options: randomQ.options.map((opt, idx) => ({
          text: opt,
          isCorrect: idx === randomQ.correct
        })),
        explanation: `The correct answer is ${randomQ.options[randomQ.correct]}`,
        difficulty,
        points: difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : 3
      });
    } else {
      result.push({
        questionText: `Random ${difficulty} question ${i+1} about ${category}?`,
        questionType: 'multiple-choice',
        options: [
          { text: 'Option A', isCorrect: true },
          { text: 'Option B', isCorrect: false },
          { text: 'Option C', isCorrect: false },
          { text: 'Option D', isCorrect: false }
        ],
        explanation: `Random explanation for ${category}`,
        difficulty,
        points: 1
      });
    }
  }
  
  return result;
}

module.exports = { getRandomQuestions };