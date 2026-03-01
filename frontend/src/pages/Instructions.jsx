import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';

export default function Instructions() {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStartRound1 = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      
      // Start round 1
      await axios.post('/api/contests/start', { name: userName, round: 1 });
      
      navigate('/round1');
    } catch (err) {
      console.error('Error starting round:', err);
      // Still navigate to round1 even if there's an error
      navigate('/round1');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="instructions-page">
      <div className="instructions-container">
        <h1>Contest Instructions</h1>

        <div className="instructions-section">
          <div className="rule-item">
            <h3>Round 1 - Debugging Challenge</h3>
            <ul>
              <li>You will be given a code with bugs</li>
              <li>Find and fix the bugs to make it work correctly</li>
              <li>Each wrong submission adds <strong>5 second penalty</strong></li>
              <li>Time starts when you begin the round</li>
              <li>A timer at the top shows your elapsed time</li>
            </ul>
          </div>

          <div className="rule-item">
            <h3>Round 2 - Coding Challenge</h3>
            <ul>
              <li>Solve the problem from scratch</li>
              <li>Write efficient code considering time complexity</li>
              <li>Your code will be tested against hidden test cases</li>
              <li>Each wrong submission adds <strong>5 second penalty</strong></li>
              <li>You will see your completion time on the results page</li>
            </ul>
          </div>

          <div className="rule-item">
            <h3>Scoring & Penalties</h3>
            <ul>
              <li><strong>Total Score</strong> = Time taken + (Wrong submissions × 5 seconds)</li>
              <li>More wrong submissions = higher penalty = lower chance of winning</li>
              <li>Lower total time means better ranking</li>
              <li>Leaderboard is sorted by total time (ascending)</li>
            </ul>
          </div>

          <div className="rule-item">
            <h3>Important Notes</h3>
            <ul>
              <li>You can select your preferred programming language</li>
              <li>After completing Round 1, you'll see your time and can proceed to Round 2</li>
              <li>Make sure to test your code before submitting</li>
              <li>Contact the admin if you face any technical issues</li>
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
          disabled={!agreed || loading}
          onClick={handleStartRound1}
        >
          {loading ? 'Starting...' : 'Start Round 1'}
        </button>
      </div>
    </div>
  );
}
