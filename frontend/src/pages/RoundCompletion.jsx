import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function RoundCompletion() {
  const navigate = useNavigate();
  const location = useLocation();
  const [timeLeft, setTimeLeft] = useState(10);
  
  const { 
    roundNumber = 1, 
    timeTaken = 0, 
    mistakes = 0, 
    penalty = 0 
  } = location.state || {};

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleProceed = () => {
    if (roundNumber === 1) {
      navigate('/round2');
    } else {
      navigate('/results');
    }
  };

  const nextRoundInstructions = roundNumber === 1 ? (
    <div className="next-round-instructions">
      <h3>About Round 2</h3>
      <ul>
        <li><strong>Coding Challenge:</strong> Write code from scratch to solve the problem</li>
        <li><strong>Time Limit:</strong> 2 minutes</li>
        <li><strong>Scoring:</strong> Based on time taken + penalties</li>
        <li><strong>Tip:</strong> Read the problem carefully before writing code</li>
        <li><strong>Penalty:</strong> Each wrong submission adds 5 seconds to your time</li>
      </ul>
    </div>
  ) : (
    <div className="next-round-instructions">
      <h3>Contest Complete!</h3>
      <ul>
        <li>Thank you for participating!</li>
        <li>View the leaderboard to see your ranking</li>
        <li>Results are sorted by total time (lower is better)</li>
      </ul>
    </div>
  );

  return (
    <div className="completion-page">
      <div className="completion-container">
        <div className="completion-icon">🎉</div>
        <h1>Round {roundNumber} Complete!</h1>
        
        <div className="completion-stats">
          <div className="stat-item">
            <span className="stat-label">Time Taken</span>
            <span className="stat-value">{formatTime(timeTaken)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Wrong Submissions</span>
            <span className="stat-value penalty">{mistakes}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Penalty</span>
            <span className="stat-value penalty">+{penalty}s</span>
          </div>
        </div>

        {nextRoundInstructions}

        <div className="completion-actions">
          <button className="next-round-btn" onClick={handleProceed}>
            {roundNumber === 1 ? 'Start Round 2 →' : 'View Results →'}
          </button>
          <p style={{ marginTop: '10px', color: '#666', fontSize: '0.9em' }}>
            Auto-redirect in {timeLeft} seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
