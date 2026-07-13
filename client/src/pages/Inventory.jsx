import { useEffect, useState } from 'react';
import axios from 'axios';

function Inventory() {
  const [lowStock, setLowStock] = useState({ products: [], ingredients: [] });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    setIsLoading(true);
    axios.get(import.meta.env.VITE_API_URL + '/api/inventory/low-stock', { withCredentials: true })
      .then(res => { setLowStock(res.data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleReceiveStock = async (type, id, currentStock) => {
    const qty = window.prompt('Enter quantity to add:', '10');
    if (!qty || isNaN(qty)) return;
    try {
      const endpoint = type === 'product' ? '/api/products' : '/api/ingredients';
      await axios.put(
        `${import.meta.env.VITE_API_URL}${endpoint}/${id}`,
        { stock: currentStock + Number(qty) },
        { withCredentials: true }
      );
      loadData();
    } catch (err) { alert('Failed to update stock'); }
  };

  if (isLoading) return <div>Loading inventory...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', color: 'var(--text-main)' }}>
      <h2>Low Stock Dashboard</h2>
      <p style={{ color: 'var(--danger)', marginBottom: '20px' }}>Items below reorder level</p>

      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Products</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)' }}>
              <th>Name</th><th>Stock</th><th>Reorder Level</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lowStock.products.map(p => (
              <tr key={p._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px 0', fontWeight: 'bold' }}>{p.name}</td>
                <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{p.stock}</td>
                <td>{p.reorderLevel}</td>
                <td><button className="btn btn-primary" onClick={() => handleReceiveStock('product', p._id, p.stock)}>Receive Stock</button></td>
              </tr>
            ))}
            {lowStock.products.length === 0 && <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>No low stock products</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Ingredients</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)' }}>
              <th>Name</th><th>Stock</th><th>Reorder Level</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lowStock.ingredients.map(i => (
              <tr key={i._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px 0', fontWeight: 'bold' }}>{i.name}</td>
                <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{i.stock} {i.unit}</td>
                <td>{i.reorderLevel} {i.unit}</td>
                <td><button className="btn btn-primary" onClick={() => handleReceiveStock('ingredient', i._id, i.stock)}>Receive Stock</button></td>
              </tr>
            ))}
            {lowStock.ingredients.length === 0 && <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>No low stock ingredients</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Inventory;
