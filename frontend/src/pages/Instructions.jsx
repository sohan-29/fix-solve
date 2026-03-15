import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';

export default function Instructions() {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState('pending');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    let interval;
    
    const checkApprovalStatus = async () => {
      if (!userId) return;
      
      try {
        const res = await axios.get(`/users/${userId}/approval-status`);
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
      interval = setInterval(checkApprovalStatus, 3000);
    }

    return () => clearInterval(interval);
  }, [userId]);

  const handleRequestApproval = async () => {
    setLoading(true);
    try {
      await axios.post(`/users/${userId}/request-approval`);
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
      navigate('/');
      return;
    }

    setLoading(true);
    try {
      const userName = localStorage.getItem('userName');
      await axios.post('/contests/start', { name: userName, round: 1 });
      navigate('/round1');
    } catch (err) {
      console.error('Error starting round:', err);
      navigate('/round1');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="instructions-page">
      <div className="instructions-container">
        <h1>Contest Instructions</h1>

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
                <h3>Anti-Cheat Measures</h3>
                <ul>
                  <li>Tab switching or minimizing the window will trigger a warning.</li>
                  <li>A strict zero-tolerance policy is in effect: multiple warnings will result in an automatic <strong>lockout</strong> from the contest.</li>
                  <li>Copying, pasting, and cutting text are strictly disabled in the code editor.</li>
                  <li>Submitting code from a different machine or IP address than the one you started on will be blocked.</li>
                </ul>
              </div>

              <div className="rule-item">
                <h3>Round 1 & 2 Format</h3>
                <ul>
                  <li><strong>Round 1 (Debugging):</strong> You will be given code with bugs. Find and fix them.</li>
                  <li><strong>Round 2 (Coding):</strong> Solve the programming problems from scratch using your preferred language.</li>
                  <li>You can navigate between multiple problems via the dropdown menu if available.</li>
                  <li>A timer at the top shows your elapsed time. The round automatically ends when time is up.</li>
                </ul>
              </div>

              <div className="rule-item">
                <h3>Scoring & Penalties</h3>
                <ul>
                  <li><strong>Per Question:</strong> Visible tests grant 40% of the question's marks, while hidden server-side tests grant 60%.</li>
                  <li><strong>Round Score:</strong> Sum of your highest marks for each problem - Penalty Marks + Optimal Bonus.</li>
                  <li><strong>Penalty:</strong> Every <strong>3 wrong submissions</strong> in a round results in a <strong>-1 mark</strong> penalty.</li>
                  <li><strong>Optimal Bonus:</strong> Getting a perfect score or a higher mark than your previous submission on a problem grants a <strong>+1 point</strong> Optimal Bonus.</li>
                  <li><strong>Leaderboard:</strong> Ranked primarily by Total Marks (highest), then by Total Time (lowest), and finally by Optimal Points (highest).</li>
                </ul>
              </div>

              <div className="rule-item">
                <h3>Important Notes</h3>
                <ul>
                  <li>Make sure to test your code before submitting!</li>
                  <li>Use the <strong>Run</strong> button to test your code locally (does not consume time penalty or increase wrong submissions).</li>
                  <li>Use the <strong>Submit</strong> button when you're fully ready (will verify hidden test cases and may accrue penalty marks if incorrect).</li>
                  <li>Contact an admin if you get falsely locked out or face technical issues.</li>
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
