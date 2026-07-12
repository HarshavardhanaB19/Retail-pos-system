import { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/products', { withCredentials: true })
      .then(res => { setProducts(res.data); setIsLoading(false); })
      .catch(err => { setError('Could not load products. Are you logged in?'); setIsLoading(false); });
  }, []);

  useEffect(() => {
    axios.get('http://localhost:5000/api/auth/me', { withCredentials: true })
      .then(res => setRole(res.data.user.role))
      .catch(() => setRole(''));
  }, []);

  const sellOne = async (productId) => {
    try {
      await axios.post(
        'http://localhost:5000/api/orders',
        { items: [{ productId, quantity: 1 }] },
        { withCredentials: true }
      );
      // refresh product list to show updated stock
      const res = await axios.get('http://localhost:5000/api/products', { withCredentials: true });
      setProducts(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Sale failed');
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setEditName(product.name);
    setEditPrice(product.price);
    setEditStock(product.stock);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (productId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/products/${productId}`,
        { name: editName, price: Number(editPrice), stock: Number(editStock) },
        { withCredentials: true }
      );
      setEditingId(null);
      const res = await axios.get('http://localhost:5000/api/products', { withCredentials: true });
      setProducts(res.data);
    } catch (err) {
      alert('Failed to update (Admin/SuperAdmin only)');
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}`, { withCredentials: true });
      const res = await axios.get('http://localhost:5000/api/products', { withCredentials: true });
      setProducts(res.data);
    } catch (err) {
      alert('Failed to delete (Admin/SuperAdmin only)');
    }
  };

  return (
    <div className="page-container fade-in">
      {/* Dashboard Content */}
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px' }}>Menu & Products</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage inventory and sales.</p>
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {(role === 'SUPER_ADMIN' || role === 'ADMIN') && (
        <AddProductForm onAdded={() => {
          axios.get('http://localhost:5000/api/products', { withCredentials: true })
            .then(res => setProducts(res.data));
        }} />
      )}

      <div className="table-container">
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto 12px', opacity: 0.5 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p>No products available. Add one above to get started.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  {editingId === p._id ? (
                    <>
                      <td>
                        <input className="input-field" value={editName} onChange={e => setEditName(e.target.value)} />
                      </td>
                      <td>
                        <input className="input-field" type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} style={{ width: '80px' }} />
                      </td>
                      <td>
                        <input className="input-field" type="number" value={editStock} onChange={e => setEditStock(e.target.value)} style={{ width: '80px' }} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex gap-2 justify-center" style={{ justifyContent: 'flex-end' }}>
                          <button className="btn btn-success" onClick={() => saveEdit(p._id)}>Save</button>
                          <button className="btn" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={cancelEdit}>Cancel</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                      </td>
                      <td><span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>₹{p.price}</span></td>
                      <td>
                        {p.stock > 10 ? (
                          <span className="badge badge-success">{p.stock} units</span>
                        ) : p.stock > 0 ? (
                          <span className="badge badge-warning">{p.stock} left</span>
                        ) : (
                          <span className="badge badge-danger">Out of stock</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex gap-2 justify-center" style={{ justifyContent: 'flex-end' }}>
                          <button className="btn btn-primary" onClick={() => sellOne(p._id)} disabled={p.stock <= 0} title="Sell One">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                          </button>
                          {(role === 'SUPER_ADMIN' || role === 'ADMIN') && (
                            <>
                              <button className="btn btn-icon" onClick={() => startEdit(p)} title="Edit">
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button className="btn btn-icon" onClick={() => deleteProduct(p._id)} title="Delete" style={{ color: 'var(--danger)' }}>
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function AddProductForm({ onAdded }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/products',
        { name, price: Number(price), stock: Number(stock), reorderLevel: 5 },
        { withCredentials: true }
      );
      setName(''); setPrice(''); setStock('');
      setIsExpanded(false);
      onAdded();
    } catch (err) {
      alert('Failed to add product (Admin/SuperAdmin only)');
    }
  };

  if (!isExpanded) {
    return (
      <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', marginBottom: '24px' }} onClick={() => setIsExpanded(true)}>
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Add New Product
      </button>
    );
  }

  return (
    <div className="glass-card fade-in" style={{ padding: '24px', marginBottom: '24px' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>Add New Product</h3>
        <button className="btn-icon" onClick={() => setIsExpanded(false)}>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <form onSubmit={handleAdd} className="flex" style={{ gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Product Name</label>
          <input className="input-field" placeholder="e.g. Filter Coffee" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Price (₹)</label>
          <input className="input-field" placeholder="0" type="number" value={price} onChange={e => setPrice(e.target.value)} required />
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Initial Stock</label>
          <input className="input-field" placeholder="0" type="number" value={stock} onChange={e => setStock(e.target.value)} required />
        </div>
        <div>
          <button className="btn btn-primary" type="submit" style={{ padding: '10px 24px' }}>Save Product</button>
        </div>
      </form>
    </div>
  );
}

export default Dashboard;