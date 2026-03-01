import { useEffect, useState } from 'react';
import axios from '../api';
import { Link } from 'react-router-dom';

export default function Results() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/users')
      .then(res => {
        // Sort users by total time (lower is better)
        const sortedUsers = res.data.sort((a, b) => (a.totalTime || 0) - (b.totalTime || 0));
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
    <div className="completion-page">
      <div className="completion-container" style={{ maxWidth: '800px' }}>
        <div className="completion-icon">🏆</div>
        <h1>Contest Results</h1>
        
        {loading ? (
          <p>Loading results...</p>
        ) : (
          <>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Rankings are based on total time (lower is better)
            </p>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #6C5CE7' }}>Rank</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #6C5CE7' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #6C5CE7' }}>Round 1</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #6C5CE7' }}>Round 2</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #6C5CE7' }}>Total Time</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => (
                  <tr 
                    key={u._id} 
                    style={{ 
                      background: index === 0 ? '#fff3cd' : index === 1 ? '#f8f9fa' : index === 2 ? '#ffeaa7' : 'white'
                    }}
                  >
                    <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>{u.name}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{formatTime(u.round1Time)}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{formatTime(u.round2Time)}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #ddd', fontWeight: 'bold', color: '#6C5CE7' }}>
                      {formatTime(u.totalTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {users.length === 0 && (
              <p style={{ marginTop: '20px', color: '#666' }}>No participants yet.</p>
            )}
          </>
        )}
        
        <div style={{ marginTop: '30px' }}>
          <Link to="/" style={{ color: '#6C5CE7', textDecoration: 'none' }}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
