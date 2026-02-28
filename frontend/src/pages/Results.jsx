import { useEffect, useState } from 'react';
import axios from '../api';

export default function Results() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('/api/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container">
      <h2>Results</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Round1 Time</th>
            <th>Round2 Time</th>
            <th>Total Time</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.round1Time}</td>
              <td>{u.round2Time}</td>
              <td>{u.totalTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
