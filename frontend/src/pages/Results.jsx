import { useEffect, useState } from 'react';
import axios from '../api';
import { Link } from 'react-router-dom';

export default function Results() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/users')
      .then(res => {
        // Sort by: Marks (higher is better) → Time (lower is better) → Optimal Points (higher is better)
        const sortedUsers = res.data.sort((a, b) => {
          // Primary: Total Score (marks) - higher is better
          const scoreA = a.totalScore || 0;
          const scoreB = b.totalScore || 0;
          if (scoreB !== scoreA) {
            return scoreB - scoreA;
          }
          
          // Secondary: Total Time - lower is better
          const timeA = a.totalTime || 0;
          const timeB = b.totalTime || 0;
          if (timeA !== timeB) {
            return timeA - timeB;
          }
          
          // Tertiary: Optimal Points - higher is better
          const optimalA = a.totalOptimalPoints || 0;
          const optimalB = b.totalOptimalPoints || 0;
          return optimalB - optimalA;
        });
        setUsers(sortedUsers);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const formatTime = (seconds) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="results-page">
      <div className="results-container">
        <h1>Contest Results</h1>
        
        {loading ? (
          <p>Loading results...</p>
        ) : (
          <>
            <p><strong>Ranking Criteria:</strong></p>
            <ul style={{textAlign: 'left', marginBottom: '20px'}}>
              <li>Primary: Total Marks (higher is better)</li>
              <li>Secondary: Total Time (lower is better)</li>
              <li>Tertiary: Optimal Points (higher is better)</li>
            </ul>
            <p style={{ color: '#ff6b6b', fontSize: '12px' }}>
              Marks: Visible tests (40%) + Hidden tests (60%) | Every 3 wrong submissions = -1 mark | Optimal code = +1 bonus
            </p>
            
            <table className="results-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Marks</th>
                  <th>Round 1</th>
                  <th>Round 2</th>
                  <th>Time</th>
                  <th>Optimal</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => (
                  <tr 
                    key={u._id} 
                    className={index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}
                  >
                    <td className="rank">
                      {index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}th`}
                    </td>
                    <td>{u.name}</td>
                    <td><strong>{u.totalScore?.toFixed(2) || '0.00'}</strong></td>
                    <td>{u.round1Score?.toFixed(2) || '0.00'}</td>
                    <td>{u.round2Score?.toFixed(2) || '0.00'}</td>
                    <td>{formatTime(u.totalTime)}</td>
                    <td>{u.totalOptimalPoints || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {users.length === 0 && (
              <p style={{ marginTop: '20px', color: '#666' }}>No participants yet.</p>
            )}
          </>
        )}
        
        <Link to="/" className="back-link">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
