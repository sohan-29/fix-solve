const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const submissionRoutes = require("./routes/submissionRoutes");
const problemRoutes = require("./routes/problemRoutes");
const userRoutes = require("./routes/userRoutes");
const contestRoutes = require("./routes/contestRoutes");
const Problem = require("./models/problem");
require("dotenv").config();

const app = express();
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// MongoDB connection
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('MongoDB URI not set. Please define MONGO_URI in your environment or .env file.');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
connectDB();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Seed endpoint - POST to /api/seed to populate problems
app.post('/api/seed', async (req, res) => {
  try {
    const problems = [
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
        ]
      },
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
        ]
      }
    ];

    await Problem.deleteMany({});
    await Problem.insertMany(problems);
    res.json({ message: 'Database seeded successfully', count: problems.length });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Routes
app.use("/api/submissions", submissionRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contests", contestRoutes);

const PORT = process.env.PORT || 3000;

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
