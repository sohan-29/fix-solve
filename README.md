# Fix & Solve - Online Coding Contest Platform

A real-time online coding contest platform supporting multiple participants with independent timers, anti-cheat measures, and automated code execution.

## Features

- **Multi-User Support**: Supports 80+ concurrent users with independent timers
- **Real-Time Code Execution**: Automatic code compilation and execution for multiple languages
- **Anti-Cheat Protection**: Tab-switch detection, browser visibility monitoring
- **Two-Round Contest System**: Round 1 and Round 2 with separate timers per user
- **Leaderboard**: Real-time score tracking and ranking
- **Network Accessible**: Can be accessed from other devices on the local network

## Supported Languages

- **C**
- **C++**
- **Java**
- **Python**

All 4 languages are fully supported with localized code execution capabilities. JavaScript support has been disabled.

## Architecture

### Backend (Express.js + MongoDB)
- RESTful API for submissions, problems, users, and contests
- Independent timer management per user (server-side timing)
- Isolated code execution in separate processes for each submission
- Score calculation with time decay algorithm

### Frontend (React + Vite)
- Single-page application
- Real-time countdown timers
- Code editor with syntax highlighting
- Anti-cheat monitoring

## Running the Application

### Prerequisites
- Node.js 18+
- MongoDB (local or remote)
- Python (for local code execution)
- GCC/G++ (for C/C++ execution)
- Java (for Java execution)

### Development Mode

1. Start MongoDB:
```
bash
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

2. Start Backend:
```
bash
cd backend
npm install
npm start
```
Backend runs on http://localhost:3000

3. Start Frontend:
```
bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173

### Network Access

The application is configured to be accessible on the local network:
- Backend: http://<YOUR_IP>:3000
- Frontend: http://<YOUR_IP>:5173

Find your IP address:
```
bash
ipconfig  # Windows
ifconfig  # Linux/Mac
```

## API Endpoints

### Health Check
- GET /api/health - Check if server is running

### Users
- POST /api/users/register - Register a new user
- POST /api/users/login - User login
- GET /api/users - Get all users (admin)

### Problems
- GET /api/problems - Get all problems
- POST /api/problems - Create problem (admin)
- GET /api/problems/:id - Get single problem

### Submissions
- POST /api/submissions - Submit code for evaluation
- GET /api/submissions/:userId - Get user submissions

### Contests
- POST /api/contests/start-timer - Start user timer
- GET /api/contests/timer-status/:userId/:round - Get timer status
- POST /api/contests/admin/reset-session - Reset user session (admin)
- POST /api/contests/report-violation - Report tab switch

## Timer System

Each user has independent timers for each round:
- Timer starts when user enters a round
- Server-side timing prevents clock manipulation
- Admin can reset timers for users
- Time decay scoring: Score = max(P_min, P - (T_taken × D) - (W × P_penalty))

## Score Calculation

The system uses SRS (Score based on Time Decay):
- Maximum points per problem: P
- Time decay per second: D (default: 0.005)
- Penalty per wrong attempt: 10 points
- Minimum score: 30% of P

## Anti-Cheat Features (Strict / Zero-Tolerance)

1. **Zero-Tolerance Tab Switch Detection**: Monitors browser visibility API. A single tab switch results in immediate, permanent lockout from the contest.
2. **Clipboard Disabled**: Copy, cut, and paste operations are strictly disabled on the code editor and entire page.
3. **Timer Validation**: Server-side timers cannot be manipulated.
4. **IP Tracking**: Tracks submissions by IP.
5. **Session Lock**: Users locked out cannot bypass without Administrator approval.

## Project Structure

```
fix-solve/
├── backend/
│   ├── controllers/      # Route handlers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Judge0 client, timer service
│   ├── config/          # Database config
│   ├── server.js        # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/       # React pages
│   │   ├── hooks/       # Custom hooks
│   │   ├── api.js       # API client
│   │   └── App.jsx      # Main app
│   ├── vite.config.js
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Configuration

### Environment Variables (backend/.env)
```
MONGO_URI=mongodb://localhost:27017/fixsolve
PORT=3000
JUDGE0_URL=http://localhost:2358
```

### Frontend Environment Variables
```
VITE_API_URL=http://localhost:3000
```

## Production Deployment

For production with 80+ users, consider:
1. Using Judge0 API for better code execution isolation
2. MongoDB replica set for high availability
3. Load balancer for multiple backend instances
4. Redis for session management
5. Nginx for reverse proxy and SSL

## License

MIT
