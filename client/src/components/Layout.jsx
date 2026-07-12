import { useState, useEffect } from 'react';
import axios from 'axios';

function Layout({ children }) {
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const path = window.location.pathname;

  useEffect(() => {
    axios.get('http://localhost:5000/api/auth/me', { withCredentials: true })
      .then(res => {
        setRole(res.data.user.role);
        setName(res.data.user.name || 'Staff Member');
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
      window.location.href = '/login';
    } catch (err) {
      window.location.href = '/login';
    }
  };

  const navItems = [
    { name: 'Staff / Users', path: '/users', icon: <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /> },
    { name: 'Categories', path: '#', icon: <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /> },
    { name: 'Menu & Products', path: '/dashboard', icon: <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /> },
    { name: 'Inventory Stock', path: '#', icon: <path fillRule="evenodd" d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4zM3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" /> },
    { name: 'Ingredients', path: '/ingredients', icon: <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /> },
    { name: 'Customers Profile', path: '#', icon: <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /> },
    { name: 'Suppliers', path: '#', icon: <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm9 0a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1h-6a1 1 0 01-1-1v-2zm0 4a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1h-6a1 1 0 01-1-1v-2z" clipRule="evenodd" /> },
    { name: 'Reports & Sales', path: '/reports', icon: <path d="M2 10a1 1 0 011-1h3a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1v-8zM8 4a1 1 0 011-1h3a1 1 0 011 1v14a1 1 0 01-1 1H9a1 1 0 01-1-1V4zM14 7a1 1 0 011-1h3a1 1 0 011 1v11a1 1 0 01-1 1h-3a1 1 0 01-1-1V7z" /> },
    { name: 'Audit Trails', path: '#', icon: <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /> },
    { name: 'Change Password', path: '#', icon: <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-gradient)' }}>
      {/* Mobile Header */}
      <div className="mobile-header" style={{
        display: 'none', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '16px 20px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/></svg>
          </div>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>SOP POS</span>
        </div>
        <button className="btn-icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`} style={{
        width: '260px',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 40,
        transition: 'transform 0.3s ease',
      }}>
        <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 2.7l6 5.3v7h-2v-6H8v6H6v-7l6-5.3z"/></svg>
          </div>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-main)', letterSpacing: '0.5px' }}>OmniPOS</span>
        </div>

        <div style={{ padding: '0 20px', marginBottom: '16px' }}>
          <div style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-light), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>
              {name.charAt(0)}
            </div>
            <div>
              <div style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: 600 }}>{name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{role.replace('_', ' ')}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 20px', marginBottom: '24px' }}>
          <button className="btn btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center', fontWeight: 'bold', fontSize: '15px' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            New Order
          </button>
        </div>

        <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const isActive = path === item.path || (item.path === '#' && false);
            return (
              <a key={item.name} href={item.path} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s',
                fontSize: '14px'
              }} onMouseOver={e => { if(!isActive) e.currentTarget.style.color = 'var(--text-main)'; }} onMouseOut={e => { if(!isActive) e.currentTarget.style.color = 'var(--text-muted)'; }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                {item.name}
              </a>
            )
          })}
        </nav>

        <div style={{ padding: '20px 24px', marginTop: 'auto' }}>
          <button onClick={handleLogout} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--danger)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 600,
            padding: 0
          }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content" style={{ flex: 1, marginLeft: '260px', padding: '32px 40px', minHeight: '100vh', transition: 'margin 0.3s ease' }}>
        <style>{`
          @media (max-width: 768px) {
            .sidebar { transform: translateX(-100%); }
            .sidebar.open { transform: translateX(0); box-shadow: 0 0 50px rgba(0,0,0,0.5); }
            .main-content { marginLeft: 0 !important; padding: 80px 20px 32px !important; }
            .mobile-header { display: flex !important; }
          }
        `}</style>
        
        {/* Desktop Top Header matching screenshot */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>SOP POS & Inventory Platform</h1>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', color: 'var(--text-main)', textTransform: 'uppercase' }}>
            Branch: All Branches
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

export default Layout;
