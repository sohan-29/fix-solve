# Fix & Solve - Coding Contest App Completion Plan

## Current State Analysis

### Backend (Reviewed):
- **server.js**: Express server with routes for submissions, problems, users, contests
- **Models**: User, Problem (with testCases), Submission
- **Controllers**: userController, submissionController, contestController
- **Judge0 Client**: Basic single test case submission only

### Frontend (Reviewed):
- **Home.jsx**: User registration and round start
- **Round1.jsx**: Debugging round (hardcoded bug fix - add function)
- **Round2.jsx**: Coding round (hardcoded factorial problem)
- **Results.jsx**: Leaderboard sorted by totalTime

## Issues Identified:

1. **Judge0 Client** - Only runs single test case, doesn't validate against expected output
2. **Round1/Round2** - Hardcoded problems, not loading from database
3. **Submission Flow** - problemId is null, no proper test case validation
4. **Missing Features** - No problem management, improper validation logic

## Implementation Plan

### Phase 1: Backend Fixes

#### 1.1 Enhanced Judge0 Client (backend/utils/judge0Client.js)
- Add function to run code against multiple test cases
- Add function to validate output against expected results
- Support for different language IDs

#### 1.2 Updated Submission Controller (backend/controllers/submissionController.js)
- Fetch problem's test cases from database
- Run code against ALL test cases
- Validate output against expected results
- Return detailed results (passed/failed for each test)

#### 1.3 Problem Model Enhancement (backend/models/problem.js)
- Add roundType field (1 for debugging, 2 for coding)
- Add starterCode field for Round 1 (buggy code)
- Add hidden test cases (for evaluation)

#### 1.4 Problem Controller (backend/controllers/problemController.js)
- Add createProblem endpoint
- Add getProblems endpoint (by round)
- Add getProblemById endpoint

### Phase 2: Frontend Updates

#### 2.1 Round1.jsx Updates
- Fetch debugging problem from backend
- Load starter code (buggy code) from problem
- Display problem description

#### 2.2 Round2.jsx Updates
- Fetch coding problem from backend
- Display problem description
- Show sample test cases

#### 2.3 Problem Management (optional admin)
- Create problems with test cases

### Phase 3: Production Readiness

#### 3.1 Environment Configuration
- Add proper .env.example
- Add production configurations

#### 3.2 Error Handling
- Enhanced error handling in all controllers

#### 3.3 CORS Configuration
- Proper CORS setup for production

### Files to Modify:
1. backend/utils/judge0Client.js
2. backend/controllers/submissionController.js
3. backend/models/problem.js
4. backend/controllers/problemController.js
5. backend/routes/problemRoutes.js
6. frontend/src/pages/Round1.jsx
7. frontend/src/pages/Round2.jsx

### New Files to Create:
1. backend/utils/judge0Client.js (already exists - will enhance)
2. Seed data for sample problems
