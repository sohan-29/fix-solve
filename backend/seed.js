const mongoose = require('mongoose');
require('dotenv').config();

const Problem = require('./models/problem');

const problems = [
  // Round 1 - Debugging Problem
  {
    title: 'Fix the Sum Function',
    description: 'The following function should return the sum of two numbers, but it has a bug. Find and fix it! The bug is that it subtracts instead of adding.',
    roundType: 1,
    inputFormat: 'Two numbers a and b on separate lines',
    outputFormat: 'Sum of a and b',
    constraints: 'a, b can be any integers',
    sampleInput: '5\n3',
    sampleOutput: '8',
    bugCode: `// Fix the bug in this function
#include <stdio.h>

int add(int a, int b) {
  // should return sum
  return a - b;
}`,
    bugCodeByLanguage: {
      javascript: `// Fix the bug in this function
function add(a, b) {
  // should return sum
  return a - b;
}`,
      c: `// Fix the bug in this function
#include <stdio.h>

int add(int a, int b) {
  // should return sum
  return a - b;
}`,
      cpp: `// Fix the bug in this function
#include <iostream>
using namespace std;

int add(int a, int b) {
  // should return sum
  return a - b;
}`,
      java: `// Fix the bug in this function
public class Solution {
    public static int add(int a, int b) {
        // should return sum
        return a - b;
    }
}`,
      python: `# Fix the bug in this function
def add(a, b):
    # should return sum
    return a - b`
    },
    starterCode: `// Fix the bug in this function
#include <stdio.h>

int add(int a, int b) {
  // should return sum
  return a - b;
}`,
    starterCodeByLanguage: {
      javascript: `// Fix the bug in this function
function add(a, b) {
  // should return sum
  return a - b;
}`,
      c: `// Fix the bug in this function
#include <stdio.h>

int add(int a, int b) {
  // should return sum
  return a - b;
}`,
      cpp: `// Fix the bug in this function
#include <iostream>
using namespace std;

int add(int a, int b) {
  // should return sum
  return a - b;
}`,
      java: `// Fix the bug in this function
public class Solution {
    public static int add(int a, int b) {
        // should return sum
        return a - b;
    }
}`,
      python: `# Fix the bug in this function
def add(a, b):
    # should return sum
    return a - b`
    },
    supportedLanguages: ['c', 'javascript', 'cpp', 'java', 'python'],
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
    description: 'Write a function that returns the factorial of a given number n. factorial(n) = n * (n-1) * (n-2) * ... * 1. Note: factorial(0) = 1',
    roundType: 2,
    inputFormat: 'A single integer n (0 <= n <= 20)',
    outputFormat: 'The factorial of n',
    constraints: '0 <= n <= 20',
    sampleInput: '5',
    sampleOutput: '120',
    starterCode: `#include <stdio.h>

// Write a function that returns the factorial of a number
long long factorial(int n) {
  // your code here
}`,
    starterCodeByLanguage: {
      javascript: `// Write a function that returns the factorial of a number
function factorial(n) {
  // your code here
}`,
      c: `#include <stdio.h>

// Write a function that returns the factorial of a number
long long factorial(int n) {
  // your code here
}`,
      cpp: `#include <iostream>
using namespace std;

// Write a function that returns the factorial of a number
long long factorial(int n) {
  // your code here
}`,
      java: `public class Solution {
    // Write a function that returns the factorial of a number
    public static long factorial(int n) {
        // your code here
    }
}`,
      python: `# Write a function that returns the factorial of a number
def factorial(n):
    # your code here
    pass`
    },
    supportedLanguages: ['c', 'javascript', 'cpp', 'java', 'python'],
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
