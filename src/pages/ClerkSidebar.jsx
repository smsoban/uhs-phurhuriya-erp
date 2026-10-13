import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import schoolLogo from '../assets/SCHOOL_LOGO.png';

export default function ClerkSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  const menuItems = [
    { title: 'Dashboard', path: '/clerk-dashboard', icon: '📊' },
    { title: 'Fee Management', path: '/fees', icon: '💰' },
    { title: 'Student Records', path: '/students', icon: '🎓' },
    { title: 'Marks Entry', path: '/marks-entry', icon: '✍️' }, // 👈 यहाँ मार्क्स एंट्री का विकल्प जोड़ दिया गया है
    { title: 'Office Notices', path: '/clerk-notices', icon: '📢' },
  ];

  const handleLogout = () => {
    logout();
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{
      width: '260px',
      backgroundColor: '#1e293b',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      fontFamily: 'Segoe UI',
      boxShadow: '4px 0 10px rgba(0,0,0,0.1)'
    }}>
      {/* School Info Header */}
      <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <img src={schoolLogo} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', backgroundColor: '#fff' }} />
        <div>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>UHS Phurhuriya</h4>
          <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '600' }}>Clerk Panel</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <div style={{ flex: 1, padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 15px',
                backgroundColor: isActive ? '#0284c7' : 'transparent',
                color: isActive ? '#fff' : '#cbd5e1',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                textAlign: 'left',
                transition: '0.2s'
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.title}
            </button>
          );
        })}
      </div>

      {/* Logout Button */}
      <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#dc2626',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  );
}