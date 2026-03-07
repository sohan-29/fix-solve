const cluster = require('cluster');
const os = require('os');
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const submissionRoutes = require("./routes/submissionRoutes");
const problemRoutes = require("./routes/problemRoutes");
const userRoutes = require("./routes/userRoutes");
const contestRoutes = require("./routes/contestRoutes");
const Problem = require("./models/problem");
require("dotenv").config();

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Forking a new one...`);
    cluster.fork();
  });
} else {
  const app = express();
  app.set('trust proxy', true);
  app.use(express.json());

  // CORS configuration - allow all origins for LAN access
  const corsOptions = {
    origin: true,  // Allow all origins for LAN access
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
      console.log(`Worker ${process.pid} connected to MongoDB`);
    } catch (err) {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    }
  };
  connectDB();

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', workerPid: process.pid, timestamp: new Date().toISOString() });
  });

  // Seed endpoint - POST to /api/seed to clear database
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

  app.listen(PORT, '0.0.0.0', () => console.log(`Worker ${process.pid} started on port ${PORT}`));
}
