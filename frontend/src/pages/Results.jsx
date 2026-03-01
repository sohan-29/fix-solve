import { useEffect, useState } from 'react';
import axios from '../api';
import { Link } from 'react-router-dom';

export default function Results() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/users')
      .then(res => {
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
    <div className="results-page">
      <div className="results-container">
        <h1>Contest Results</h1>
        
        {loading ? (
          <p>Loading results...</p>
        ) : (
          <>
            <p>Rankings based on total time (lower is better)</p>
            <p style={{ color: '#ff6b6b', fontSize: '12px' }}>
              Penalty: +5 seconds per wrong submission
            </p>
            
            <table className="results-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Round 1</th>
                  <th>Round 2</th>
                  <th>Total</th>
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
                    <td>{formatTime(u.round1Time)}</td>
                    <td>{formatTime(u.round2Time)}</td>
                    <td>{formatTime(u.totalTime)}</td>
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
