import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';

export default function Home() {
  const [name, setName] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const registerAndStart = async () => {
    try {
      // register user if not exists
      const res = await axios.post('/api/users/register', { name });
      const user = res.data;
      localStorage.setItem('userId', user._id);
      // start round1
      await axios.post('/api/contests/start', { name, round: 1 });
      localStorage.setItem('userName', name);
      navigate('/round1');
    } catch (err) {
      console.error(err);
      alert('Failed to start round');
    }
  };

  return (
    <div className="container">
      <h1>Fix & Solve Competition</h1>
      <label>
        Enter your unique id (name):
        <input value={name} onChange={e => setName(e.target.value)} />
      </label>
      <button disabled={!name} onClick={() => setShowPopup(true)}>
        Start Round 1
      </button>

      {showPopup && (
        <div className="modal">
          <div className="modal-content">
            <p>Click OK to begin Round 1</p>
            <button
              onClick={() => {
                setShowPopup(false);
                registerAndStart();
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
