const mongoose = require('mongoose');
require('dotenv').config();

const Problem = require('./models/problem');

const problems = [
  // Round 1 - Debugging Problem
  {
    title: 'Fix the Sum Function',
    description: 'The following function should return the sum of two numbers, but it has a bug. Find and fix it!',
    roundType: 1,
    inputFormat: 'Two numbers a and b',
    outputFormat: 'Sum of a and b',
    constraints: 'a, b can be any integers',
    sampleInput: '5, 3',
    sampleOutput: '8',
    bugCode: `// Fix the bug in this function
function add(a, b) {
  // should return sum
  return a - b;
}`,
    testCases: [
      { input: '5\n3', output: '8' },
      { input: '10\n20', output: '30' },
      { input: '-5\n5', output: '0' }
    ],
    hiddenTestCases: [
      { input: '100\n200', output: '300' },
      { input: '0\n0', output: '0' }
    ],
    timeLimit: 60,
    difficulty: 'Easy',
    complexity: 'O(1)'
  },
  // Round 2 - Coding Problem
  {
    title: 'Factorial',
    description: 'Write a function that returns the factorial of a given number n. factorial(n) = n * (n-1) * (n-2) * ... * 1',
    roundType: 2,
    inputFormat: 'A single integer n (0 <= n <= 20)',
    outputFormat: 'The factorial of n',
    constraints: '0 <= n <= 20',
    sampleInput: '5',
    sampleOutput: '120',
    starterCode: `// Write a function that returns the factorial of a number
function factorial(n) {
  // your code here
}`,
    testCases: [
      { input: '5', output: '120' },
      { input: '0', output: '1' },
      { input: '10', output: '3628800' }
    ],
    hiddenTestCases: [
      { input: '20', output: '2432902008176640000' },
      { input: '1', output: '1' }
    ],
    timeLimit: 120,
    difficulty: 'Easy',
    complexity: 'O(n)'
  }
];

const seedDB = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fix-solve';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing problems
    await Problem.deleteMany({});
    console.log('Cleared existing problems');

    // Insert new problems
    await Problem.insertMany(problems);
    console.log('Seeded problems successfully');

    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
