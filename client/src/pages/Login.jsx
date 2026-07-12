import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(import.meta.env.VITE_API_URL + '/api/auth/me', { withCredentials: true })
      .then(() => navigate('/dashboard'))
      .catch(() => {}); // not logged in, stay on login page
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + '/api/auth/login',
        { email, password },
        { withCredentials: true }
      );
      console.log('Login success:', res.data);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-card fade-in" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(124, 58, 237, 0.3)'
          }}>
            <svg width="32" height="32" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 style={{ margin: 0, fontSize: '24px', letterSpacing: '0.5px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 0', fontSize: '14px' }}>Sign in to OmniPOS Platform</p>
        </div>

        <form onSubmit={handleLogin} style={{ background: 'none', border: 'none', boxShadow: 'none', padding: 0 }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div className="fade-in" style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 600 }}>
            Sign In to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;