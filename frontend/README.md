# Fix & Solve - Frontend

This is the frontend application for the Fix & Solve coding contest platform.

## Tech Stack

- React 18
- Vite (build tool)
- React Router DOM (routing)
- Axios (HTTP client)

## Getting Started

### Installation

```
bash
npm install
```

### Development

```
bash
npm run dev
```

The frontend will start on http://localhost:5173

### Build for Production

```
bash
npm run build
```

### Preview Production Build

```
bash
npm run preview
```

## Project Structure

```
src/
├── pages/
│   ├── Home.jsx       # User registration and contest start
│   ├── Round1.jsx     # Debugging challenge (fix the bug)
│   ├── Round2.jsx     # Coding challenge (write from scratch)
│   └── Results.jsx    # Contest results and leaderboard
├── App.jsx            # Main application component
├── App.css            # Global styles
├── api.js             # Axios API configuration
├── main.jsx           # Entry point
└── index.css          # Base styles
```

## Pages

### Home Page
- User enters unique name/ID
- Click "Start Round 1" to begin the contest
- Automatically registers user and starts Round 1

### Round 1 - Debug the Code
- Displays a problem with buggy code
- User must fix the bug(s) to pass test cases
- Shows problem description, input/output format
- Submit button evaluates the code
- Tracks mistakes and applies time penalty
- On success, proceeds to Round 2

### Round 2 - Solve the Problem
- Displays a coding problem
- User writes solution from scratch
- Shows problem description and sample test cases
- Option to view/hide test cases
- Submit button evaluates the code
- On success, shows results

### Results Page
- Shows final leaderboard
- Displays total time taken for each user
- Sorted by total time (lower is better)

## API Configuration

The API base URL is configured in `src/api.js`:

```
javascript
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});
```

To change the backend URL, set the `VITE_API_URL` environment variable or modify the default.

## Environment Variables

```
VITE_API_URL=http://localhost:3000
```

## Dependencies

- react: ^18.x
- react-dom: ^18.x
- react-router-dom: ^7.x
- axios: ^1.x

## License

ISC
