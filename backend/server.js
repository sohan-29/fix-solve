require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const submissionRoutes = require("./routes/submissionRoutes");
const problemRoutes = require("./routes/problemRoutes");
const userRoutes = require("./routes/userRoutes");
const contestRoutes = require("./routes/contestRoutes");
const Problem = require("./models/problem");

const app = express();
app.set('trust proxy', true);
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: true,
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// MongoDB connection with retry
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('MongoDB URI not set. Please define MONGO_URI in your environment or .env file.');
    return;
  }
  const connect = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('MongoDB connection error:', err.message);
      console.log('Retrying in 5 seconds...');
      setTimeout(connect, 5000);
    }
  };
  connect();
};
connectDB();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Seed endpoint
app.post('/api/seed', async (req, res) => {
  try {
    await Problem.deleteMany({});
    res.json({ message: 'Database cleared. Please use Admin panel to add problems.' });
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

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
