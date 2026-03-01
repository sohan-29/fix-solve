import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';

export default function Home() {
  const [name, setName] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleStart = async () => {
    try {
      // register user if not exists
      const res = await axios.post('/api/users/register', { name });
      const user = res.data;
      localStorage.setItem('userId', user._id);
      localStorage.setItem('userName', name);
      // Go to instructions page first
      navigate('/instructions');
    } catch (err) {
      console.error(err);
      alert('Failed to register. Please try again.');
    }
  };

  return (
    <div className="container">
      <h1>Fix & Solve</h1>
      <label>
        Enter your unique id:
        <input 
          value={name} 
          onChange={e => setName(e.target.value)} 
          placeholder="Your name or ID"
        />
      </label>
      <button disabled={!name} onClick={() => setShowPopup(true)}>
        Start Contest
      </button>

      {showPopup && (
        <div className="modal">
          <div className="modal-content">
            <p>Click OK to read the contest instructions</p>
            <button
              onClick={() => {
                setShowPopup(false);
                handleStart();
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
