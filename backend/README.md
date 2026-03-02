# Fix & Solve - Backend

This is the backend API server for the Fix & Solve coding contest platform.

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- Judge0 client (with local fallback)

## Getting Started

### Installation

```
bash
npm install
```

### Configuration

Create a `.env` file in the backend directory:

```
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/fix-solve-contest
JUDGE0_URL=http://localhost:2358
CLIENT_URL=http://localhost:5173
```

### Seed Sample Problems

```
bash
npm run seed
```

Or run the seed.js directly:

```
bash
node seed.js
```

### Start Server

```
bash
npm start
```

The server will start on http://localhost:3000

## API Endpoints

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/users/register | Register a new user |
| GET | /api/users | Get all users (leaderboard) |

### Problems
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/problems | Get all problems |
| GET | /api/problems/:id | Get problem by ID |
| GET | /api/problems/round/:round | Get problem by round type |
| POST | /api/problems | Create a new problem |

### Submissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/submissions | Submit code for evaluation |

### Contest
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/contests/start | Start a round |
| POST | /api/contests/end | End a round and record time |

## Code Execution

The backend supports two modes of code execution:

### 1. Local JavaScript Execution (Default - Works Now!)
The app uses built-in JavaScript execution to test submitted code. This works **without any external services**!

- Uses Node.js eval() in a sandboxed manner
- Automatically extracts function output
- Works for JavaScript code
- You don't need Judge0 - the app works fully without it!

### 2. Judge0 (Optional)
Judge0 is an external code execution service that can be run in Docker:

```
bash
# Start Judge0 in Docker
docker run -d --name judge0 -p 2358:2358 judge0/judge0:latest
```

**How it works:**
- When Judge0 is running, the app uses it for code execution
- When Judge0 is unavailable (not running), the app automatically falls back to local JavaScript execution

### Supported Languages
- **JavaScript** (Node.js) - Full support with local execution
- Python, Java, C, C++ - Supported via Judge0 (when available)

## Adding Problems to Database

There are **two ways** to add problems to the database:

### Method 1: Using seed.js (For initial setup)

Edit `seed.js` to add your problems, then run:

```
bash
npm run seed
# or
node seed.js
```

### Method 2: Using API (No authentication required!)

Send a POST request to create a problem:

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

### Problem Fields Explained

| Field | Description | Required |
|-------|-------------|----------|
| title | Problem title | Yes |
| description | Problem description | Yes |
| roundType | 1 = Debugging, 2 = Coding | Yes |
| bugCode | Code with bugs (for Round 1) | For Round 1 |
| starterCode | Starter template (for Round 2) | For Round 2 |
| testCases | Visible test cases | Yes |
| hiddenTestCases | Hidden test cases for evaluation | No |
| inputFormat | Input format description | No |
| outputFormat | Output format description | No |
| constraints | Problem constraints | No |
| sampleInput | Sample input shown to users | No |
| sampleOutput | Sample output shown to users | No |

### How Submissions Work

1. User submits code via frontend
2. Backend receives the code and problem ID
3. Backend fetches test cases from the problem in MongoDB
4. Backend runs the code against all test cases (using local JS or Judge0)
5. Results are compared and returned to the user
6. Submission is saved to MongoDB

## Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/           # Request handlers
│   ├── contestController.js
│   ├── problemController.js
│   ├── submissionController.js
│   └── userController.js
├── middleware/
│   └── authMiddleware.js  # Authentication middleware
├── models/                # MongoDB schemas
│   ├── Contest.js
│   ├── Problem.js
│   ├── Submission.js
│   └── User.js
├── routes/                # API routes
│   ├── contestRoutes.js
│   ├── problemRoutes.js
│   ├── submissionRoutes.js
│   └── userRoutes.js
├── utils/
│   └── judge0Client.js   # Judge0 client with local fallback
├── seed.js                # Sample problems seeder
├── server.js              # Express server entry point
├── package.json
└── README.md
```

## Models

### User
- name (String, required, unique)
- rollNumber (String)
- round1Time (Number) - Time taken for Round 1
- round2Time (Number) - Time taken for Round 2
- totalTime (Number) - Total time (round1 + round2)

### Problem
- title (String, required)
- description (String, required)
- inputFormat (String)
- outputFormat (String)
- constraints (String)
- sampleInput (String)
- sampleOutput (String)
- roundType (Number) - 1 for debugging, 2 for coding
- bugCode (String) - Code with bugs for Round 1
- starterCode (String) - Starter code for Round 2
- testCases (Array) - Visible test cases
- hiddenTestCases (Array) - Hidden test cases for evaluation

### Submission
- user (String) - User ID or name
- problem (ObjectId) - Reference to Problem
- code (String) - Submitted code
- language (String) - Programming language
- status (String) - Accepted/Wrong Answer/Error
- result (Object) - Detailed test results

## Dependencies

- express: ^5.x
- mongoose: ^9.x
- axios: ^1.x
- cors: ^2.x
- dotenv: ^17.x
- jsonwebtoken: ^9.x

## License

ISC
