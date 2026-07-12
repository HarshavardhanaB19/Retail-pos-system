import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function SelfOrder() {
  const { branchId, tableId } = useParams();
  const [token, setToken] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [orderId, setOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [error, setError] = useState('');
  const [branchStatus, setBranchStatus] = useState(null);
  const [locale, setLocale] = useState(navigator.language.split('-')[0]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/self-order/session/${branchId}/${tableId}`)
      .then(res => setToken(res.data.token))
      .catch(() => setError('Could not start session'));
  }, [branchId, tableId]);

  useEffect(() => {
    if (!token) return;
    axios.get('http://localhost:5000/api/self-order/menu', {
      headers: { 'x-session-token': token }
    })
      .then(res => setProducts(res.data))
      .catch(() => setError('Could not load menu'));
  }, [token]);

  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(() => {
      axios.get(`http://localhost:5000/api/self-order/order/${orderId}`, {
        headers: { 'x-session-token': token }
      }).then(res => setOrderStatus(res.data.status));
    }, 2000);
    return () => clearInterval(interval);
  }, [orderId, token]);

  useEffect(() => {
    const fetchStatus = () => {
      axios.get(`http://localhost:5000/api/self-order/branch-status/${branchId}`)
        .then(res => setBranchStatus(res.data))
        .catch(() => {});
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [branchId]);

  const addToCart = (productId) => {
    setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId] -= 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const submitOrder = async () => {
    const items = Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity }));
    if (items.length === 0) return;

    try {
      const res = await axios.post(
        'http://localhost:5000/api/self-order/order',
        { items },
        { headers: { 'x-session-token': token } }
      );
      setOrderId(res.data._id);
      setOrderStatus(res.data.status);
      setCart({});
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed');
    }
  };

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = products.reduce((total, p) => {
    return total + (cart[p._id] ? cart[p._id] * p.price : 0);
  }, 0);

  if (orderId) {
    return (
      <div style={{ maxWidth: '400px', margin: '40px auto', padding: '24px', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <div className="glass-card fade-in" style={{ padding: '40px 24px' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 style={{ marginBottom: '8px' }}>Order Placed!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Table {tableId}</p>
          
          {branchStatus?.environmentType === 'METRO' && (
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Estimated prep time: <strong>~{branchStatus.estimatedWaitMinutes} min</strong></span>
              </div>
              <div style={{ marginTop: '4px', fontSize: '12px', opacity: 0.8 }}>({branchStatus.queueDepth} orders ahead)</div>
            </div>
          )}
          
          <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Current Status</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: orderStatus === 'PAID' ? 'var(--success)' : 'var(--primary-light)' }}>
              {orderStatus === 'PENDING_CONFIRMATION' ? 'Waiting for kitchen...' : orderStatus}
            </div>
            {orderStatus === 'PAID' && <p style={{ color: 'var(--success)', marginTop: '12px', fontSize: '14px' }}>Your order has been confirmed and paid!</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', paddingBottom: '100px', fontFamily: 'sans-serif', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-card)', backdropFilter: 'blur(10px)', padding: '20px', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Table {tableId}</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>Order directly from your phone</p>
        </div>
        <select className="input-field" value={locale} onChange={e => setLocale(e.target.value)} style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}>
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="kn">ಕನ್ನಡ</option>
        </select>
      </div>

      {error && (
        <div style={{ margin: '20px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          {error}
        </div>
      )}

      {/* Menu List */}
      <div style={{ padding: '20px' }} className="fade-in">
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Recommended</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {products.map(p => {
            const quantity = cart[p._id] || 0;
            return (
              <div key={p._id} className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {p.translations?.[locale] || p.name}
                  </div>
                  <div style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 500 }}>₹{p.price}</div>
                </div>
                
                <div>
                  {quantity > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(124, 58, 237, 0.1)', border: '1px solid var(--primary)', borderRadius: '8px', overflow: 'hidden' }}>
                      <button onClick={() => removeFromCart(p._id)} style={{ width: '32px', height: '32px', background: 'transparent', border: 'none', color: 'var(--primary-light)', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>−</button>
                      <span style={{ width: '24px', textAlign: 'center', fontWeight: 600, fontSize: '14px', color: 'var(--primary-light)' }}>{quantity}</span>
                      <button onClick={() => addToCart(p._id)} style={{ width: '32px', height: '32px', background: 'transparent', border: 'none', color: 'var(--primary-light)', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
                    </div>
                  ) : (
                    <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--primary-light)', border: '1px solid rgba(124, 58, 237, 0.3)', padding: '6px 20px', borderRadius: '8px' }} onClick={() => addToCart(p._id)}>
                      ADD
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Cart Bar */}
      {cartCount > 0 && (
        <div className="fade-in" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 20px',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--border-color)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
          zIndex: 50,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{cartCount} {cartCount === 1 ? 'item' : 'items'}</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)' }}>₹{cartTotal}</div>
            </div>
            <button
              onClick={submitOrder}
              className="btn btn-primary"
              style={{ padding: '12px 24px', borderRadius: '12px', fontSize: '16px', boxShadow: '0 8px 16px rgba(124, 58, 237, 0.4)' }}
            >
              Submit Order
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginLeft: '4px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SelfOrder;