import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './Layout';

function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('checking'); // checking | authed | unauthed

  useEffect(() => {
    axios.get(import.meta.env.VITE_API_URL + '/api/auth/me', { withCredentials: true })
      .then(() => setStatus('authed'))
      .catch(() => setStatus('unauthed'));
  }, []);

  if (status === 'checking') return <p style={{ textAlign: 'center', marginTop: '40px' }}>Checking session...</p>;
  if (status === 'unauthed') return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default ProtectedRoute;