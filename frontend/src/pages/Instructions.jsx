import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';

export default function Instructions() {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const handleStart = async () => {
    const name = localStorage.getItem('userName');
    if (!name) {
      alert('Please go back and enter your name');
      navigate('/');
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      // Start round 1
      await axios.post('/api/contests/start', { name, round: 1 });
      navigate('/round1');
    } catch (err) {
      console.error(err);
      alert('Failed to start round');
    }
  };

  return (
    <div className="instructions-page">
      <div className="instructions-container">
        <h1>Welcome to Fix & Solve!</h1>
        
        <div className="instructions-section">
          <div className="rule-item">
            <h3>Round 1: Debugging Challenge</h3>
            <ul>
              <li>You will be given a code with bugs</li>
              <li>Find and fix the bugs to make it work correctly</li>
              <li>Each wrong submission adds 5 seconds penalty to your time</li>
              <li>Time starts when you enter this round</li>
            </ul>
          </div>

          <div className="rule-item">
            <h3>Round 2: Coding Challenge</h3>
            <ul>
              <li>Solve the given problem from scratch</li>
              <li>Write efficient code considering time complexity</li>
              <li>Each wrong submission adds 5 seconds penalty</li>
              <li>Your total time = Round1 Time + Round2 Time + Penalties</li>
            </ul>
          </div>

          <div className="rule-item">
            <h3>General Rules</h3>
            <ul>
              <li>Do not switch tabs or minimize the window during the contest</li>
              <li>Any form of malpractice will result in disqualification</li>
              <li>The timer runs continuously - be quick but accurate!</li>
              <li>Leaderboard is sorted by total time (lower is better)</li>
            </ul>
          </div>
        </div>

        <div className="agreement-section">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={agreed} 
              onChange={(e) => setAgreed(e.target.checked)} 
            />
            I agree to follow the contest rules and understand the penalty system
          </label>
        </div>

        <button 
          className="enter-contest-btn" 
          disabled={!agreed}
          onClick={handleStart}
        >
          Start Contest
        </button>
      </div>
    </div>
  );
}
