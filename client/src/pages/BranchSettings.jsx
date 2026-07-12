import { useEffect, useState } from 'react';
import axios from 'axios';

function BranchSettings() {
  const [branch, setBranch] = useState(null);
  const [environmentType, setEnvironmentType] = useState('STANDARD');
  const [envSurchargeRate, setEnvSurchargeRate] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadBranch = () => {
    axios.get(import.meta.env.VITE_API_URL + '/api/branches/me', { withCredentials: true })
      .then(res => {
        setBranch(res.data);
        setEnvironmentType(res.data.environmentType);
        setEnvSurchargeRate(res.data.envSurchargeRate);
      })
      .catch(() => setError('Could not load branch settings'));
  };

  useEffect(() => { loadBranch(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        import.meta.env.VITE_API_URL + '/api/branches/me',
        { environmentType, envSurchargeRate: Number(envSurchargeRate) },
        { withCredentials: true }
      );
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
      loadBranch();
    } catch (err) {
      alert('Failed to save (Admin/SuperAdmin only)');
    }
  };

  if (error) return (
    <div className="page-container fade-in">
      <div className="glass-card" style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}>
        {error}
      </div>
    </div>
  );
  
  if (!branch) return (
    <div className="page-container fade-in flex justify-center items-center" style={{ minHeight: '60vh' }}>
      <div style={{ color: 'var(--text-muted)' }}>Loading settings...</div>
    </div>
  );

  return (
    <div className="page-container fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h2>Branch Settings</h2>
          <p style={{ color: 'var(--text-muted)' }}>Configure environment and operational parameters for <strong style={{ color: 'var(--text-main)' }}>{branch.name}</strong>.</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '32px', maxWidth: '600px' }}>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>
              Environment Type
            </label>
            <select
              className="input-field"
              value={environmentType}
              onChange={e => setEnvironmentType(e.target.value)}
              style={{ fontSize: '15px', padding: '12px' }}
            >
              <option value="STANDARD">Standard</option>
              <option value="METRO">Metro City</option>
              <option value="HILL_STATION">Hill Station</option>
              <option value="DESERT">Desert</option>
            </select>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>
              Environmental Surcharge Rate (%)
            </label>
            <input
              className="input-field"
              type="number"
              value={envSurchargeRate}
              onChange={e => setEnvSurchargeRate(e.target.value)}
              style={{ fontSize: '15px', padding: '12px' }}
              min="0"
              max="100"
            />
            <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              This surcharge is automatically applied to every cashier sale's subtotal, before tax — simulating alpine logistics costs (Hill Station), desert supply costs, or metro peak-hour pricing.
            </p>
          </div>

          {message && (
            <div className="fade-in" style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '20px', display: 'inline-block' }}>
              {message}
            </div>
          )}

          <div>
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '15px' }}>
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BranchSettings;