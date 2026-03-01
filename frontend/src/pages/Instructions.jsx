import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Instructions() {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const handleStartRound1 = () => {
    navigate('/round1');
  };

  return (
    <div className="instructions-page">
      <div className="instructions-container">
        <h1>Contest Instructions</h1>

        <div className="instructions-section">
          <div className="rule-item">
            <h3>Round 1 - Debugging</h3>
            <ul>
              <li>You will be given a code with bugs</li>
              <li>Find and fix the bugs to make it work correctly</li>
              <li>Each wrong submission adds 5 second penalty</li>
              <li>Time starts when you begin the round</li>
            </ul>
          </div>

          <div className="rule-item">
            <h3>Round 2 - Coding</h3>
            <ul>
              <li>Solve the problem from scratch</li>
              <li>Write efficient code considering time complexity</li>
              <li>Your code will be tested against hidden test cases</li>
              <li>Each wrong submission adds 5 second penalty</li>
            </ul>
          </div>

          <div className="rule-item">
            <h3>Scoring</h3>
            <ul>
              <li>Total score = Time taken + (Wrong submissions × 5 seconds)</li>
              <li>Lower total time means better ranking</li>
              <li>Leaderboard is sorted by total time</li>
            </ul>
          </div>
        </div>

        <div className="agreement-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
            />
            I have read and understood the instructions
          </label>
        </div>

        <button
          className="enter-contest-btn"
          disabled={!agreed}
          onClick={handleStartRound1}
        >
          Start Round 1
        </button>
      </div>
    </div>
  );
}
