import { useEffect, useState } from 'react';
import axios from 'axios';

function AuditTrails() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get(import.meta.env.VITE_API_URL + '/api/audit', { withCredentials: true })
      .then(res => { setLogs(res.data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div>Loading audit trails...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', color: 'var(--text-main)' }}>
      <h2>Audit Trails</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>System security logs and critical actions (Admin only)</p>
      
      <div className="card" style={{ padding: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ paddingBottom: '10px' }}>Time</th>
              <th style={{ paddingBottom: '10px' }}>User</th>
              <th style={{ paddingBottom: '10px' }}>Role</th>
              <th style={{ paddingBottom: '10px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 0', fontSize: '12px' }}>{new Date(log.createdAt).toLocaleString()}</td>
                <td style={{ fontWeight: 'bold' }}>{log.userId?.name || 'Unknown'}</td>
                <td style={{ fontSize: '12px' }}>{log.userId?.role || '-'}</td>
                <td>{log.action}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>No audit logs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuditTrails;
