import { useEffect, useState } from 'react';
import axios from 'axios';

function Reports() {
  const [summary, setSummary] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [error, setError] = useState('');
  const [recentOrders, setRecentOrders] = useState([]);
  const [wasteData, setWasteData] = useState(null);
  const [wasteName, setWasteName] = useState('');
  const [wasteQty, setWasteQty] = useState('');
  const [wasteReason, setWasteReason] = useState('expired');

  useEffect(() => {
    axios.get('http://localhost:5000/api/reports/summary', { withCredentials: true })
      .then(res => setSummary(res.data))
      .catch(() => setError('Could not load reports (Admin/SuperAdmin only)'));

    axios.get('http://localhost:5000/api/reports/audit-log', { withCredentials: true })
      .then(res => setAuditLog(res.data))
      .catch(() => {});

    axios.get('http://localhost:5000/api/orders', { withCredentials: true })
      .then(res => setRecentOrders(res.data.slice(0, 5)))
      .catch(() => {});

    axios.get('http://localhost:5000/api/waste', { withCredentials: true })
      .then(res => setWasteData(res.data))
      .catch(() => {});
  }, []);

  const splitBill = async (orderId, total) => {
    const numPeople = prompt('Split between how many people?', '2');
    if (!numPeople || numPeople < 1) return;
    const perPerson = Math.round(total / numPeople);
    const splits = Array.from({ length: numPeople }, (_, i) => ({
      payerName: `Person ${i + 1}`,
      amount: perPerson,
      method: 'cash'
    }));
    try {
      await axios.post(`http://localhost:5000/api/orders/${orderId}/split`, { splits }, { withCredentials: true });
      alert(`Split into ${numPeople} payments of ₹${perPerson} each`);
    } catch (err) {
      alert(err.response?.data?.message || 'Split failed');
    }
  };

  const logWaste = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/waste',
        { itemName: wasteName, quantity: Number(wasteQty), reason: wasteReason },
        { withCredentials: true }
      );
      setWasteName(''); setWasteQty('');
      const res = await axios.get('http://localhost:5000/api/waste', { withCredentials: true });
      setWasteData(res.data);
    } catch (err) {
      alert('Failed to log waste');
    }
  };

  if (error) return (
    <div className="page-container fade-in">
      <div className="glass-card" style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}>
        {error}
      </div>
    </div>
  );
  
  if (!summary) return (
    <div className="page-container fade-in flex justify-center items-center" style={{ minHeight: '60vh' }}>
      <div style={{ color: 'var(--text-muted)' }}>Loading reports...</div>
    </div>
  );

  return (
    <div className="page-container fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h2>Reports Dashboard</h2>
          <p style={{ color: 'var(--text-muted)' }}>Real-time analytics and management insights.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1, color: 'var(--primary)' }}>
            <svg width="100" height="100" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>Today's Sales</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--text-main)' }}>₹{summary.totalSales}</div>
        </div>
        
        <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1, color: 'var(--success)' }}>
            <svg width="100" height="100" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v2h2v5h2v-5h2v-2z"/></svg>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>Orders Today</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--text-main)' }}>{summary.orderCount}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-card flex-col" style={{ padding: '24px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px' }}>Channel Split</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div className="flex justify-between" style={{ marginBottom: '8px', fontSize: '14px' }}>
                <span>Cashier POS</span>
                <span style={{ fontWeight: 'bold' }}>{summary.channelSplit.CASHIER}</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--primary)', width: `${(summary.channelSplit.CASHIER / Math.max(summary.orderCount, 1)) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between" style={{ marginBottom: '8px', fontSize: '14px' }}>
                <span>Self-Service Mobile</span>
                <span style={{ fontWeight: 'bold' }}>{summary.channelSplit.SELF_SERVICE}</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--success)', width: `${(summary.channelSplit.SELF_SERVICE / Math.max(summary.orderCount, 1)) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between" style={{ marginBottom: '8px', fontSize: '14px' }}>
                <span>Aggregator (Swiggy/Zomato)</span>
                <span style={{ fontWeight: 'bold' }}>{summary.channelSplit.AGGREGATOR}</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--accent)', width: `${(summary.channelSplit.AGGREGATOR / Math.max(summary.orderCount, 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px' }}>Top Items Today</h3>
          {summary.topItems.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No sales yet today.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {summary.topItems.map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.2)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, fontWeight: 500 }}>{item.name}</div>
                  <div className="badge badge-success">{item.qty} sold</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px' }}>Low Stock Alerts</h3>
          {summary.lowStock.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>All items sufficiently stocked.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {summary.lowStock.map((item, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px' }}>
                  <div style={{ color: '#fbbf24', fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: '13px', color: '#fcd34d' }}>
                    <strong>{item.stock} left</strong> (Reorder at {item.reorderLevel})
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px' }}>Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No recent orders.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentOrders.map(o => (
                <div key={o._id} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>₹{o.total}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>Source: {o.source.replace('_', ' ').toLowerCase()}</div>
                  </div>
                  <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => splitBill(o._id, o.total)}>
                    Split Bill
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px' }}>Food Waste Tracking</h3>
        <form onSubmit={logWaste} className="flex" style={{ gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Item Name</label>
            <input className="input-field" placeholder="e.g. Bread" value={wasteName} onChange={e => setWasteName(e.target.value)} required />
          </div>
          <div style={{ flex: '1 1 120px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Quantity</label>
            <input className="input-field" placeholder="0" type="number" value={wasteQty} onChange={e => setWasteQty(e.target.value)} required />
          </div>
          <div style={{ flex: '1 1 140px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Reason</label>
            <select className="input-field" value={wasteReason} onChange={e => setWasteReason(e.target.value)}>
              <option value="expired">Expired</option>
              <option value="voided">Voided</option>
              <option value="plate-waste">Plate Waste</option>
            </select>
          </div>
          <div>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>Log Waste</button>
          </div>
        </form>
        {wasteData && (
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'inline-block' }}>
            <span style={{ color: 'var(--text-muted)' }}>Waste Index:</span> <strong style={{ color: 'var(--text-main)', fontSize: '18px', marginRight: '16px' }}>{wasteData.wasteIndex} entries</strong>
            <span style={{ color: 'var(--text-muted)' }}>Total Qty:</span> <strong style={{ color: 'var(--text-main)', fontSize: '18px' }}>{wasteData.totalQuantity}</strong>
          </div>
        )}
      </div>

      {auditLog.length > 0 && (
        <div className="table-container">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.4)' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Audit Log (Super Admin)</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Performed By</th>
                <th>Role</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.map(log => (
                <tr key={log._id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{log.action}</div>
                  </td>
                  <td>{log.performedByName}</td>
                  <td><span className="badge badge-primary" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#a78bfa' }}>{log.role}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Reports;