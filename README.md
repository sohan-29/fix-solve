# Fix & Solve - Coding Contest Platform

A full-stack coding contest application with two rounds:
- **Round 1**: Debugging challenge - fix the buggy code
- **Round 2**: Coding challenge - solve the problem from scratch

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Code Execution**: Judge0 (optional - falls back to local simulation)

## Features

- User registration with unique name
- Round 1: Debugging challenge with buggy starter code
- Round 2: Full coding challenge
- Automatic time tracking with penalty for wrong submissions
- Leaderboard sorted by total time
- Multi-test case validation
- Hidden test cases for fair evaluation
- **Local JavaScript Execution**: Works without Judge0 container (automatic fallback)

## Prerequisites

1. Node.js installed (v14 or higher)
2. MongoDB installed and running
3. Docker installed (optional - for Judge0, not required)

## Quick Start

### 1. Start MongoDB

```
bash
# Using mongod directly
mongod

# Or using Docker
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

### 2. Backend Setup

```
bash
cd backend
npm install
npm run seed    # Seed sample problems
npm start       # Server runs on http://localhost:3000
```

### 3. Frontend Setup

```
bash
cd frontend
npm install
npm run dev     # Frontend runs on http://localhost:5173
```

### 4. Open Browser

Navigate to http://localhost:5173 to access the application.

## Environment Variables

### Backend (.env)
```
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/fix-solve-contest
JUDGE0_URL=http://localhost:2358
CLIENT_URL=http://localhost:5173
```

### Frontend
```
VITE_API_URL=http://localhost:3000
```

## API Endpoints

### Users
- `POST /api/users/register` - Register a new user
- `GET /api/users` - Get all users (leaderboard)

### Problems
- `GET /api/problems` - Get all problems
- `GET /api/problems/:id` - Get problem by ID
- `GET /api/problems/round/:round` - Get problem by round type (1 or 2)
- `POST /api/problems` - Create a new problem (no auth required)

### Submissions
- `POST /api/submissions` - Submit code for evaluation

### Contest
- `POST /api/contests/start` - Start a round
- `POST /api/contests/end` - End a round and record time

## How It Works

1. User enters their unique name on the home page
2. Round 1 starts - user must fix the buggy code
3. On successful submission, user proceeds to Round 2
4. Round 2 - user writes code to solve the problem
5. After Round 2, results are displayed with rankings

## Using Judge0 (Optional)

To use the actual Judge0 for code execution instead of local simulation:

```
bash
# Start Judge0 in Docker
docker run -d --name judge0 -p 2358:2358 judge0/judge0:latest

# The app will automatically use Judge0 when available
# Falls back to local simulation when Judge0 is unavailable
```

## Project Structure

```
├── backend/
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── controllers/        # Request handlers
│   │   ├── contestController.js
│   │   ├── problemController.js
│   │   ├── submissionController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/             # MongoDB schemas
│   │   ├── Contest.js
│   │   ├── Problem.js
│   │   ├── Submission.js
│   │   └── User.js
│   ├── routes/             # API routes
│   │   ├── contestRoutes.js
│   │   ├── problemRoutes.js
│   │   ├── submissionRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   └── judge0Client.js # Judge0 client with local fallback
│   ├── seed.js             # Sample problems
│   ├── server.js           # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/          # React components
│   │   │   ├── Home.jsx
│   │   │   ├── Round1.jsx
│   │   │   ├── Round2.jsx
│   │   │   └── Results.jsx
│   │   ├── api.js          # Axios instance
│   │   ├── App.jsx         # Main app
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── README.md               # This file
└── SRS.md                  # Software Requirements Specification
```

## Creating Problems

You can create problems via the API:

```
bash
curl -X POST http://localhost:3000/api/problems \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Add Two Numbers",
    "description": "Write a function to add two numbers",
    "roundType": 1,
    "bugCode": "function add(a, b) {\n  return a - b;\n}",
    "starterCode": "function add(a, b) {\n  // your code here\n}",
    "testCases": [
      {"input": "1\n2", "output": "3"},
      {"input": "5\n3", "output": "8"}
    ],
    "hiddenTestCases": [
      {"input": "10\n20", "output": "30"}
    ]
  }'
```

## License

ISC
