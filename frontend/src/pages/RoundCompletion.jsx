import { useNavigate, useLocation } from 'react-router-dom';

export default function RoundCompletion() {
  const navigate = useNavigate();
  const location = useLocation();
  const { timeTaken, mistakes, penalty, round } = location.state || {};

  // Format time as m:s
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextRound = () => {
    if (round === 1) {
      navigate('/round2');
    } else {
      // Don't redirect - just show message
      alert('The results will be announced s00n. Thank you for participating!');
    }
  };

  const isLastRound = round === 2;

  return (
    <div className="completion-page">
      <div className="completion-container">
        <div className="completion-icon">✅</div>
        <h1>Round {round} Complete!</h1>
        
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
            <span className="stat-value penalty">-{Math.floor((mistakes || 0) / 3)} marks</span>
          </div>
        </div>

        {!isLastRound && (
          <div className="next-round-instructions">
            <h3>🎯 Ready for Round 2?</h3>
            <ul>
              <li><strong>Round 2</strong> is a coding challenge where you solve the problem from scratch</li>
              <li>You will write code to implement a solution based on the problem statement</li>
              <li>The same penalty rules apply: <strong>-1 mark for every 3 wrong submissions</strong></li>
              <li>Test your code with the sample test cases before submitting</li>
              <li>Make sure to handle all edge cases mentioned in the problem</li>
            </ul>
          </div>
        )}

        {isLastRound && (
          <div className="next-round-instructions">
            <h3>🏆 Contest Complete!</h3>
            <ul>
              <li>You have completed both rounds of the contest</li>
              <li>Your final score is based on total time, penalties and optimal score</li>
              <li>Results will be announced by the administrator</li>
              <li>The results page route is: <strong>/results</strong></li>
            </ul>
          </div>
        )}

        <div className="completion-actions">
          <button className="next-round-btn" onClick={handleNextRound}>
            {isLastRound ? 'Finish' : 'Start Round 2 →'}
          </button>
        </div>
      </div>
    </div>
  );
}
