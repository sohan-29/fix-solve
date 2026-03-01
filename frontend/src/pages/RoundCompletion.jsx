import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

export default function RoundCompletion() {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  
  const { timeTaken, mistakes, penalty, round } = location.state || {};
  const isRound1 = round === 1 || round === undefined;

  useEffect(() => {
    if (isRound1) {
      const timer = setTimeout(() => {
        navigate('/round2');
      }, 10000);
      
      const countdownInterval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        clearInterval(countdownInterval);
      };
    }
  }, [navigate, isRound1]);

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="completion-page">
      <div className="completion-container">
        <div className="completion-icon">
          {isRound1 ? '✓' : '🏆'}
        </div>
        
        <h1>
          {isRound1 ? 'Round 1 Complete!' : 'Contest Complete!'}
        </h1>
        
        <div className="completion-stats">
          <div className="stat-item">
            <span className="stat-label">Time Taken</span>
            <span className="stat-value">{formatTime(timeTaken)}</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Mistakes</span>
            <span className="stat-value">{mistakes || 0}</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Penalty</span>
            <span className="stat-value penalty">+{penalty || 0}s</span>
          </div>
        </div>
        
        {isRound1 && (
          <div className="next-round-instructions">
            <h3>Round 2 Instructions:</h3>
            <ul>
              <li>Solve the problem from scratch</li>
              <li>Write efficient code considering time complexity</li>
              <li>Your code will be tested against hidden test cases</li>
              <li>Each wrong submission adds 5 second penalty</li>
            </ul>
          </div>
        )}
        
        <div className="completion-actions">
          {isRound1 ? (
            <>
              <p style={{ marginBottom: '15px', color: '#666', fontSize: '12px' }}>
                Starting Round 2 in {countdown} seconds...
              </p>
              <button className="next-round-btn" onClick={() => navigate('/round2')}>
                Start Round 2 Now
              </button>
            </>
          ) : (
            <>
              <p style={{ marginBottom: '15px', color: '#666', fontSize: '12px' }}>
                View final rankings
              </p>
              <Link to="/results" className="next-round-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                View Results
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
