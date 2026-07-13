import { useEffect, useState } from 'react';
import axios from 'axios';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const loadCustomers = () => {
    axios.get(import.meta.env.VITE_API_URL + '/api/customers', { withCredentials: true })
      .then(res => setCustomers(res.data))
      .catch(() => {});
  };

  useEffect(() => { loadCustomers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        import.meta.env.VITE_API_URL + '/api/customers',
        { name: newName, phone: newPhone, email: newEmail },
        { withCredentials: true }
      );
      setNewName(''); setNewPhone(''); setNewEmail('');
      loadCustomers();
    } catch (err) { alert('Failed to create'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete customer?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/customers/${id}`, { withCredentials: true });
      loadCustomers();
    } catch (err) { alert('Failed to delete'); }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', color: 'var(--text-main)' }}>
      <h2>Manage Customers</h2>
      
      <div className="card" style={{ padding: '20px', margin: '20px 0' }}>
        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <input className="input-field" placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} required />
          <input className="input-field" placeholder="Phone" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
          <input className="input-field" placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
          <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>Add Customer</button>
        </form>
      </div>

      <div className="card" style={{ padding: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
              <th>Name</th><th>Phone</th><th>Email</th><th>Total Spent</th><th>Loyalty Points</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px 0' }}>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.email}</td>
                <td>₹{c.totalSpent}</td>
                <td>{c.loyaltyPoints}</td>
                <td><button className="btn btn-danger" onClick={() => handleDelete(c._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Customers;
