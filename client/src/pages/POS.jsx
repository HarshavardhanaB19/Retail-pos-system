import { useEffect, useState } from 'react';
import axios from 'axios';

function POS() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(import.meta.env.VITE_API_URL + '/api/products', { withCredentials: true }),
      axios.get(import.meta.env.VITE_API_URL + '/api/categories', { withCredentials: true })
    ])
    .then(([productsRes, catsRes]) => {
      setProducts(productsRes.data);
      setCategories(catsRes.data);
      setIsLoading(false);
    })
    .catch(() => {
      setIsLoading(false);
      alert('Failed to load data');
    });
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product._id);
      if (existing) {
        return prev.map(item => item.productId === product._id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
        );
      }
      return [...prev, { productId: product._id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, change) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQ = item.quantity + change;
        return newQ > 0 ? { ...item, quantity: newQ } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      await axios.post(
        import.meta.env.VITE_API_URL + '/api/orders',
        { items: cart },
        { withCredentials: true }
      );
      alert('Order Placed Successfully!');
      setCart([]);
      
      // refresh stock
      const res = await axios.get(import.meta.env.VITE_API_URL + '/api/products', { withCredentials: true });
      setProducts(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed');
    }
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 64px)' }}>
      {/* Products Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
          <button 
            className={`btn ${selectedCategory === 'all' ? 'btn-primary' : ''}`}
            style={{ background: selectedCategory === 'all' ? '' : 'var(--bg-card)' }}
            onClick={() => setSelectedCategory('all')}
          >
            All Items
          </button>
          {categories.map(cat => (
            <button 
              key={cat._id}
              className={`btn ${selectedCategory === cat._id ? 'btn-primary' : ''}`}
              style={{ background: selectedCategory === cat._id ? '' : 'var(--bg-card)' }}
              onClick={() => setSelectedCategory(cat._id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
          gap: '16px',
          overflowY: 'auto'
        }}>
          {filteredProducts.map(product => (
            <div 
              key={product._id} 
              className="card" 
              style={{ padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
              onClick={() => addToCart(product)}
            >
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{product.name}</div>
              <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>₹{product.price}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Stock: {product.stock}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="card" style={{ width: '350px', display: 'flex', flexDirection: 'column', padding: '20px' }}>
        <h2 style={{ marginBottom: '20px' }}>Current Order</h2>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {cart.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>Cart is empty</p>
          ) : (
            cart.map(item => (
              <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                  <div style={{ color: 'var(--text-muted)' }}>₹{item.price}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button className="btn-icon" onClick={() => updateQuantity(item.productId, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button className="btn-icon" onClick={() => updateQuantity(item.productId, 1)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
            <span>Total:</span>
            <span>₹{cartTotal}</span>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '18px' }}
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default POS;
