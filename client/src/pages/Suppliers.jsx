import { useEffect, useState } from 'react';
import axios from 'axios';

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const loadSuppliers = () => {
    axios.get(import.meta.env.VITE_API_URL + '/api/suppliers', { withCredentials: true })
      .then(res => setSuppliers(res.data))
      .catch(() => {});
  };

  useEffect(() => { loadSuppliers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        import.meta.env.VITE_API_URL + '/api/suppliers',
        { name: newName, phone: newPhone, email: newEmail, address: newAddress },
        { withCredentials: true }
      );
      setNewName(''); setNewPhone(''); setNewEmail(''); setNewAddress('');
      loadSuppliers();
    } catch (err) { alert('Failed to create'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete supplier?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/suppliers/${id}`, { withCredentials: true });
      loadSuppliers();
    } catch (err) { alert('Failed to delete'); }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', color: 'var(--text-main)' }}>
      <h2>Manage Suppliers</h2>
      
      <div className="card" style={{ padding: '20px', margin: '20px 0' }}>
        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input className="input-field" placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} required />
          <input className="input-field" placeholder="Phone" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
          <input className="input-field" placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
          <input className="input-field" placeholder="Address" value={newAddress} onChange={e => setNewAddress(e.target.value)} />
          <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>Add Supplier</button>
        </form>
      </div>

      <div className="card" style={{ padding: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
              <th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(s => (
              <tr key={s._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px 0' }}>{s.name}</td>
                <td>{s.phone}</td>
                <td>{s.email}</td>
                <td>{s.address}</td>
                <td><button className="btn btn-danger" onClick={() => handleDelete(s._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Suppliers;
