import { useEffect, useState } from 'react';
import axios from 'axios';

function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('CASHIER');

  const loadUsers = () => {
    axios.get(import.meta.env.VITE_API_URL + '/api/auth/users', { withCredentials: true })
      .then(res => setUsers(res.data))
      .catch(() => setError('Admin/SuperAdmin only'));
  };

  useEffect(() => { loadUsers(); }, []);

  const toggleAccess = async (userId, current) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/users/${userId}/ingredients-access`,
        { hasIngredientsAccess: !current },
        { withCredentials: true }
      );
      loadUsers();
    } catch (err) {
      alert('Failed to update access');
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        import.meta.env.VITE_API_URL + '/api/auth/users',
        { name: newName, email: newEmail, password: newPassword, role: newRole },
        { withCredentials: true }
      );
      setNewName(''); setNewEmail(''); setNewPassword(''); setNewRole('CASHIER');
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    }
  };

  const resetPassword = async (userId, userName) => {
    const newPass = prompt(`New password for ${userName}:`);
    if (!newPass) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/users/${userId}/reset-password`,
        { newPassword: newPass },
        { withCredentials: true }
      );
      alert('Password reset successfully');
    } catch (err) {
      alert('Failed to reset password');
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h2>User Management</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage staff accounts and permissions.</p>
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <div className="glass-card fade-in" style={{ padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px' }}>Create New Staff User</h3>
        <form onSubmit={createUser} className="flex" style={{ gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Full Name</label>
            <input className="input-field" placeholder="e.g. Jane Doe" value={newName} onChange={e => setNewName(e.target.value)} required />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Email Address</label>
            <input className="input-field" placeholder="jane@company.com" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
          </div>
          <div style={{ flex: '1 1 160px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Password</label>
            <input className="input-field" placeholder="••••••••" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          </div>
          <div style={{ flex: '1 1 140px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Role</label>
            <select className="input-field" value={newRole} onChange={e => setNewRole(e.target.value)}>
              <option value="CASHIER">Cashier</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
          <div>
            <button className="btn btn-primary" type="submit" style={{ padding: '10px 24px' }}>Create User</button>
          </div>
        </form>
      </div>

      <div className="table-container fade-in delay-1">
        {users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Ingredients Access</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{u.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{u.email}</div>
                  </td>
                  <td>
                    {u.role === 'SUPER_ADMIN' && <span className="badge badge-success">Super Admin</span>}
                    {u.role === 'ADMIN' && <span className="badge badge-primary" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#a78bfa', border: '1px solid rgba(124, 58, 237, 0.2)' }}>Admin</span>}
                    {u.role === 'CASHIER' && <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>Cashier</span>}
                  </td>
                  <td>
                    {u.hasIngredientsAccess ? (
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Granted
                      </span>
                    ) : (
                      <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        Revoked
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="flex gap-2 justify-center" style={{ justifyContent: 'flex-end' }}>
                      {u.role === 'CASHIER' && (
                        <button className="btn" style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', color: 'var(--primary-light)', border: '1px solid rgba(124, 58, 237, 0.3)' }} onClick={() => toggleAccess(u._id, u.hasIngredientsAccess)}>
                          {u.hasIngredientsAccess ? 'Revoke Access' : 'Grant Access'}
                        </button>
                      )}
                      <button className="btn" style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }} onClick={() => resetPassword(u._id, u.name)}>
                        Reset Password
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Users;