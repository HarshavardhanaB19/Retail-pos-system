import { useEffect, useState } from 'react';
import axios from 'axios';

function Ingredients() {
  const [ingredients, setIngredients] = useState([]);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [branch, setBranch] = useState(null);
  const [isUtility, setIsUtility] = useState(false);
  const [criticalAlerts, setCriticalAlerts] = useState([]);

  const loadIngredients = () => {
    axios.get('http://localhost:5000/api/ingredients', { withCredentials: true })
      .then(res => setIngredients(res.data))
      .catch(() => setError('No access to ingredients management'));
  };

  useEffect(() => {
    loadIngredients();
    axios.get('http://localhost:5000/api/branches/me', { withCredentials: true })
      .then(res => setBranch(res.data))
      .catch(() => {});

    axios.get('http://localhost:5000/api/ingredients/critical-alerts', { withCredentials: true })
      .then(res => setCriticalAlerts(res.data))
      .catch(() => {});
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/ingredients',
        { name, quantity: Number(quantity), unit, isUtilityType: isUtility },
        { withCredentials: true }
      );
      setName(''); setQuantity(''); setUnit(''); setIsUtility(false);
      loadIngredients();
    } catch (err) {
      alert('Failed to add ingredient');
    }
  };

  const restock = async (id, currentQty) => {
    const addAmount = prompt('How much to add?', '5');
    if (!addAmount) return;
    try {
      await axios.put(
        `http://localhost:5000/api/ingredients/${id}`,
        { quantity: currentQty + Number(addAmount) },
        { withCredentials: true }
      );
      loadIngredients();
    } catch (err) {
      alert('Failed to restock');
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h2>Kitchen Ingredients</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage your back-of-house inventory.</p>
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {branch?.environmentType === 'DESERT' && criticalAlerts.length > 0 && (
        <div className="glass-card fade-in" style={{ padding: '16px', background: 'rgba(220, 38, 38, 0.15)', borderColor: 'rgba(239, 68, 68, 0.5)', color: '#fca5a5', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ marginTop: '2px', color: '#ef4444' }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div>
            <strong style={{ display: 'block', marginBottom: '8px', color: '#f87171', fontSize: '16px' }}>Critical Utility Alert</strong>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {criticalAlerts.map(a => (
                <li key={a._id} style={{ marginBottom: '4px' }}>{a.name} — only <strong>{a.quantity} {a.unit}</strong> left!</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px' }}>Add Ingredient</h3>
        <form onSubmit={handleAdd} className="flex" style={{ gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Name</label>
            <input className="input-field" placeholder="e.g. Flour" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div style={{ flex: '1 1 120px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Quantity</label>
            <input className="input-field" placeholder="0" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required />
          </div>
          <div style={{ flex: '1 1 120px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Unit</label>
            <input className="input-field" placeholder="kg, L, etc." value={unit} onChange={e => setUnit(e.target.value)} required />
          </div>
          {branch?.environmentType === 'DESERT' && (
            <div style={{ flex: '1 1 140px', paddingBottom: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-main)', fontSize: '14px' }}>
                <input type="checkbox" checked={isUtility} onChange={e => setIsUtility(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                Utility (water/fuel)
              </label>
            </div>
          )}
          <div>
            <button className="btn btn-primary" type="submit" style={{ padding: '10px 24px' }}>Add</button>
          </div>
        </form>
      </div>

      <div className="table-container">
        {ingredients.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No ingredients found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ingredient Name</th>
                <th>Current Stock</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map(ing => (
                <tr key={ing._id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{ing.name}</div>
                  </td>
                  <td>
                    <span className="badge badge-warning">{ing.quantity} {ing.unit}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--primary-light)', border: '1px solid rgba(124, 58, 237, 0.3)' }} onClick={() => restock(ing._id, ing.quantity)}>
                      Restock
                    </button>
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

export default Ingredients;