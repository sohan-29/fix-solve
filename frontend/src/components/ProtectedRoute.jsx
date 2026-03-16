import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from '../api';

export default function ProtectedRoute({ children, allowedRound }) {
  const [authStatus, setAuthStatus] = useState(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const checkAuth = async () => {
      if (!userId) {
        setAuthStatus('unapproved');
        return;
      }
      try {
        const res = await axios.get(`/users/${userId}`);
        const user = res.data;
        
        if (!user.isApproved && !user.isLockedOut) {
          setAuthStatus('unapproved');
        } else if (allowedRound === 2 && !user.round1Completed && !user.isLockedOut) {
          setAuthStatus('incomplete_round1');
        } else {
          setAuthStatus('authorized');
        }
      } catch (err) {
        console.error('Error verifying route access:', err);
        setAuthStatus('unapproved');
      }
    };
    checkAuth();
  }, [userId, allowedRound]);

  if (authStatus === null) {
    return <div className="container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff'}}>Verifying access...</div>;
  }

  if (authStatus === 'unapproved') {
    return <Navigate to="/instructions" replace />;
  }

  if (authStatus === 'incomplete_round1') {
    return <Navigate to="/round1" replace />;
  }

  return children;
}
