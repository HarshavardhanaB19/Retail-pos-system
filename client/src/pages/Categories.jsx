import { useEffect, useState } from 'react';
import axios from 'axios';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = () => {
    setIsLoading(true);
    axios.get(import.meta.env.VITE_API_URL + '/api/categories', { withCredentials: true })
      .then(res => { setCategories(res.data); setIsLoading(false); })
      .catch(err => { setError('Failed to load categories'); setIsLoading(false); });
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await axios.post(
        import.meta.env.VITE_API_URL + '/api/categories',
        { name: newName },
        { withCredentials: true }
      );
      setNewName('');
      loadCategories();
    } catch (err) {
      alert('Failed to create category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/categories/${id}`,
        { withCredentials: true }
      );
      loadCategories();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-main)' }}>
      <h2 style={{ marginBottom: '20px' }}>Manage Categories</h2>
      
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px' }}>
          <input 
            className="input-field" 
            placeholder="New Category Name" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            required 
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary">Add Category</button>
        </form>
      </div>

      <div className="card" style={{ padding: '20px' }}>
        {isLoading ? <p>Loading...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px', width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>{cat.name}</td>
                  <td style={{ padding: '12px' }}>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDelete(cat._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="2" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No categories found. Create one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Categories;
