# Fix & Solve - Coding Contest Platform

A full-stack coding contest application with two rounds:
- **Round 1**: Debugging challenge - fix the buggy code
- **Round 2**: Coding challenge - solve the problem from scratch

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Code Execution**: Judge0 (running in Docker)

## Prerequisites

1. Node.js installed
2. MongoDB installed and running
3. Docker installed (for Judge0)

## Setup Instructions

### 1. Start MongoDB

```
bash
mongod
```

### 2. Start Judge0 (in Docker)

```
bash
docker run -d --name judge0 -p 2358:2358 judge0/judge0:latest
```

### 3. Backend Setup

```
bash
cd backend
npm install
cp .env.example .env
# The .env file is already configured for local development
node seed.js  # Seed sample problems
npm start     # Server runs on http://localhost:3000
```

### 4. Frontend Setup

```
bash
cd frontend
npm install
npm run dev   # Frontend runs on http://localhost:5173
```

## Features

- User registration with unique name
- Round 1: Debugging challenge with buggy starter code
- Round 2: Full coding challenge
- Automatic time tracking with penalty for wrong submissions
- Leaderboard sorted by total time
- Multi-test case validation using Judge0
- Hidden test cases for fair evaluation

## API Endpoints

- `POST /api/users/register` - Register user
- `GET /api/users` - Get all users (leaderboard)
- `GET /api/problems` - Get all problems
- `GET /api/problems/round/:round` - Get problem by round type
- `POST /api/submissions` - Submit code for evaluation
- `POST /api/contests/start` - Start a round
- `POST /api/contests/end` - End a round and record time

## Project Structure

```
├── backend/
│   ├── controllers/    # Request handlers
│   ├── models/         # MongoDB schemas
│   ├── routes/        # API routes
│   ├── utils/         # Judge0 client
│   ├── seed.js        # Sample problems
│   └── server.js      # Express server
├── frontend/
│   └── src/
│       ├── pages/     # React components
│       ├── api.js     # Axios instance
│       └── App.jsx    # Main app
└── README.md
```

## How It Works

1. User enters their unique name on the home page
2. Round 1 starts - user must fix the buggy code
3. On successful submission, user proceeds to Round 2
4. Round 2 - user writes code to solve the problem
5. After Round 2, results are displayed with rankings

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
