import { useEffect, useState } from 'react';
import axios from 'axios';

function Queue() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const loadQueue = () => {
    axios.get(import.meta.env.VITE_API_URL + '/api/self-order/queue', { withCredentials: true })
      .then(res => setOrders(res.data))
      .catch(() => setError('Could not load queue'));
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 3000); // auto-refresh every 3s
    return () => clearInterval(interval);
  }, []);

  const confirmOrder = async (orderId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/self-order/queue/${orderId}/confirm`, {}, { withCredentials: true });
      loadQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm');
    }
  };

  const rejectOrder = async (orderId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/self-order/queue/${orderId}/reject`, {}, { withCredentials: true });
      loadQueue();
    } catch (err) {
      alert('Failed to reject');
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h2>Order Confirmation Queue</h2>
          <p style={{ color: 'var(--text-muted)' }}>Review and confirm incoming self-service orders.</p>
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {orders.length === 0 && (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto 16px', opacity: 0.5 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <p>No pending orders at the moment.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {orders.map(order => (
          <div key={order._id} className="glass-card flex-col" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 600 }}>Self-Service Order</div>
              <span className="badge badge-warning">Pending</span>
            </div>
            <div style={{ padding: '16px', flex: 1 }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0' }}>
                {order.items.map((item, i) => (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed rgba(255,255,255,0.05)' }}>
                    <span>{item.name} <span style={{ color: 'var(--text-muted)' }}>x{item.quantity}</span></span>
                    <span style={{ fontWeight: 500 }}>₹{item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary-light)' }}>₹{order.total}</span>
              </div>
            </div>
            <div style={{ display: 'flex', borderTop: '1px solid var(--border-color)' }}>
              <button onClick={() => confirmOrder(order._id)} className="btn btn-success" style={{ flex: 1, borderRadius: 0, padding: '16px' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Confirm
              </button>
              <button onClick={() => rejectOrder(order._id)} className="btn btn-danger" style={{ flex: 1, borderRadius: 0, padding: '16px' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Queue;