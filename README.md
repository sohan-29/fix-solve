# Fix & Solve - Coding Contest Platform

A full-stack coding contest application with two rounds:
- **Round 1**: Debugging challenge - fix the buggy code
- **Round 2**: Coding challenge - solve the problem from scratch

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Code Execution**: Judge0 (REQUIRED for all languages)

## Features

- User registration with unique name
- Round 1: Debugging challenge with buggy starter code
- Round 2: Full coding challenge
- Automatic time tracking with penalty (+5 seconds) for wrong submissions
- Leaderboard sorted by total time
- Multi-test case validation
- Hidden test cases for fair evaluation
- **Multi-language support**: C, C++, Java, Python, JavaScript
- Different code templates for each language (like HackerRank)
- Admin panel for creating problems with custom test cases

## Prerequisites

1. Node.js installed (v14 or higher)
2. MongoDB installed and running
3. **Docker installed (REQUIRED for Judge0)**

## Quick Start

### 1. Start MongoDB

```
bash
# Using mongod directly
mongod

# Or using Docker
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

### 2. Start Judge0 (REQUIRED)

```
bash
# Start Judge0 in Docker - REQUIRED for code execution
docker run -d --name judge0 -p 2358:2358 judge0/judge0:latest
```

### 3. Backend Setup

```
bash
cd backend
npm install
npm run seed    # Seed sample problems
npm start       # Server runs on http://localhost:3000
```

### 4. Frontend Setup

```
bash
cd frontend
npm install
npm run dev     # Frontend runs on http://localhost:5173
```

### 5. Open Browser

Navigate to http://localhost:5173 to access the application.

### 6. Admin Panel

Access the admin panel at http://localhost:5173/admin
- Default password: `admin123`

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
- `GET /api/problems/round/:round?language=java` - Get problem by round type with language-specific code
- `POST /api/problems` - Create a new problem (no auth required)

### Submissions
- `POST /api/submissions` - Submit code for evaluation

### Contest
- `POST /api/contests/start` - Start a round
- `POST /api/contests/end` - End a round and record time

## How It Works

1. User enters their unique name on the home page
2. Round 1 starts - user must fix the buggy code in their chosen language
3. On successful submission, user sees round completion page with stats
4. User can proceed to Round 2 with instructions
5. Round 2 - user writes code to solve the problem from scratch
6. After Round 2, results are displayed with rankings

## Features in Detail

### Round Completion Page
- Shows time taken for the round
- Shows number of mistakes (wrong submissions)
- Shows penalty added (+5 seconds per mistake)
- Provides instructions for the next round
- Button to proceed to next round

### Multi-Language Support
- Each problem can have different code templates for each language
- Languages supported: C, C++, Java, Python, JavaScript
- Code templates are stored in the database per language
- Users can select their preferred language in each round

### Admin Panel
- Create/edit/delete problems
- Add test cases (visible) and hidden test cases
- Set time limits and difficulty
- View submissions and leaderboard
- Manage users

### Penalty System
- Each wrong submission adds 5 seconds to total time
- Final score = time taken + (mistakes × 5)
- Lower score = better rank

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
│   │   └── judge0Client.js # Judge0 client
│   ├── seed.js             # Sample problems
│   ├── server.js           # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/          # React components
│   │   │   ├── Home.jsx
│   │   │   ├── Instructions.jsx
│   │   │   ├── Round1.jsx
│   │   │   ├── Round2.jsx
│   │   │   ├── RoundCompletion.jsx
│   │   │   ├── Results.jsx
│   │   │   └── Admin.jsx
│   │   ├── api.js          # Axios instance
│   │   ├── App.jsx         # Main app
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── README.md               # This file
└── SRS.md                  # Software Requirements Specification
```

## Creating Problems via Admin Panel

1. Go to http://localhost:5173/admin
2. Login with password: `admin123`
3. Go to "Problems" tab
4. Fill in problem details:
   - Title and description
   - Round type (1 = Debugging, 2 = Coding)
   - Select supported languages
   - Input/Output format and constraints
   - Sample input/output
5. Click "Generate Bug/Starter Code Templates" to auto-fill code templates
6. Or manually enter code for each language
7. Add test cases and hidden test cases
8. Save the problem

## Creating Problems via API

```
bash
curl -X POST http://localhost:3000/api/problems \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Add Two Numbers",
    "description": "Write a function to add two numbers",
    "roundType": 1,
    "supportedLanguages": ["c", "java", "python"],
    "bugCodeByLanguage": {
      "c": "int add(int a, int b) { return a - b; }",
      "java": "public static int add(int a, int b) { return a - b; }",
      "python": "def add(a, b): return a - b"
    },
    "starterCodeByLanguage": {
      "c": "int add(int a, int b) { // your code }",
      "java": "public static int add(int a, int b) { // your code }",
      "python": "def add(a, b): # your code"
    },
    "testCases": [
      {"input": "1\n2", "output": "3"},
      {"input": "5\n3", "output": "8"}
    ],
    "hiddenTestCases": [
      {"input": "10\n20", "output": "30"}
    ]
  }'
```

## Troubleshooting

### Judge0 not running
If you see "Judge0 is not running" error:
```
bash
# Check if Judge0 is running
docker ps

# Start Judge0 if not running
docker run -d --name judge0 -p 2358:2358 judge0/judge0:latest

# Restart backend server
```

### MongoDB connection issues
```
bash
# Check MongoDB status
docker ps

# Start MongoDB if needed
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

## License

ISC
