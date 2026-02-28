# Fix & Solve - Implementation TODO

## Phase 1: Backend Enhancements

- [x] 1.1 Update Problem Model (add roundType, starterCode, hiddenTestCases)
- [x] 1.2 Enhance Judge0 Client (multi-test case support)
- [x] 1.3 Update Submission Controller (run all test cases, validate output)
- [x] 1.4 Update Problem Controller (add getProblemByRound endpoint)
- [x] 1.5 Add route for getProblemByRound

## Phase 2: Frontend Updates

- [x] 2.1 Update Round1.jsx (fetch problem from backend)
- [x] 2.2 Update Round2.jsx (fetch problem from backend)

## Phase 3: Production Readiness

- [x] 3.1 Add proper CORS configuration
- [x] 3.2 Add .env.example
- [x] 3.3 Create seed data for sample problems

## What's Completed:

1. **Problem Model**: Added `roundType`, `starterCode`, and `hiddenTestCases` fields
2. **Judge0 Client**: Enhanced to run multiple test cases and validate outputs
3. **Submission Controller**: Updated to fetch problems and run all test cases
4. **Problem Controller**: Added `getProblemByRound` and `getProblemById` endpoints
5. **Round1.jsx**: Now fetches problem from backend with fallback
6. **Round2.jsx**: Now fetches problem from backend with fallback
7. **Server.js**: Added proper CORS config and health check endpoint
8. **.env.example**: Created with all required environment variables
9. **seed.js**: Created to populate sample problems

## To Run the Project:

1. **Setup MongoDB** (if not running):
   
```
   mongod
   
```

2. **Start Judge0** (in Docker):
   
```
   docker run -d --name judge0 -p 2358:2358 judge0/judge0:latest
   
```

3. **Backend Setup**:
   
```
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB URI
   npm install
   node seed.js  # Seed sample problems
   npm start
   
```

4. **Frontend Setup**:
   
```
   cd frontend
   npm install
   npm run dev
