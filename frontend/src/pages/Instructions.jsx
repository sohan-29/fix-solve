import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';

export default function Instructions() {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState('pending'); // 'pending', 'approved', 'waiting', 'rejected'
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  // Poll for approval status
  useEffect(() => {
    let interval;
    
    const checkApprovalStatus = async () => {
      if (!userId) return;
      
      try {
        const res = await axios.get(`/api/users/${userId}/approval-status`);
        if (res.data.isApproved) {
          setApprovalStatus('approved');
          clearInterval(interval);
        } else if (res.data.approvalRequestedAt) {
          setApprovalStatus('waiting');
        }
      } catch (err) {
        console.error('Error checking approval:', err);
      }
    };

    if (userId) {
      checkApprovalStatus();
      // Poll every 3 seconds
      interval = setInterval(checkApprovalStatus, 3000);
    }

    return () => clearInterval(interval);
  }, [userId]);

  const handleRequestApproval = async () => {
    setLoading(true);
    try {
      await axios.post(`/api/users/${userId}/request-approval`);
      setApprovalStatus('waiting');
    } catch (err) {
      console.error('Error requesting approval:', err);
      setError('Failed to request approval. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRound1 = async () => {
    if (!userId) {
      // User not registered, go to home first
      navigate('/');
      return;
    }

    setLoading(true);
    try {
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

        {/* Show approval status if user is not approved */}
        {approvalStatus === 'waiting' && (
          <div className="approval-waiting-box">
            <div className="waiting-icon">⏳</div>
            <h2>Waiting for Approval</h2>
            <p>Your request to start the contest has been sent to the admin.</p>
            <p>Please wait while your request is being reviewed.</p>
            <button 
              className="refresh-status-btn" 
              onClick={() => setApprovalStatus('pending')}
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Check Status'}
            </button>
          </div>
        )}

        {approvalStatus === 'approved' && (
          <>
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
                  <li>Use the <strong>Run</strong> button to test your code (no penalty)</li>
                  <li>Use the <strong>Submit</strong> button when you're ready (may have penalty)</li>
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
          </>
        )}

        {approvalStatus === 'pending' && userId && (
          <div className="approval-request-box">
            <div className="info-icon">ℹ️</div>
            <h2>Approval Required</h2>
            <p>You need approval from the admin to start the contest.</p>
            {error && <p className="error-text">{error}</p>}
            <button
              className="request-approval-btn"
              onClick={handleRequestApproval}
              disabled={loading}
            >
              {loading ? 'Sending Request...' : 'Request Approval'}
            </button>
          </div>
        )}

        {!userId && (
          <div className="not-registered-box">
            <p>Please register first to access the contest.</p>
            <button
              className="go-home-btn"
              onClick={() => navigate('/')}
            >
              Go to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
