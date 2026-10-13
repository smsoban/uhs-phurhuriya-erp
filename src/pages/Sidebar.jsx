import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import schoolLogo from '../assets/SCHOOL_LOGO.png';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useContext(AuthContext);

  // 💡 डिबगिंग के लिए कंसोल में चेक करें कि यूजर का डेटा क्या मिल रहा है
  console.log("Sidebar Authenticated User Object:", user);

  // 1. Context या LocalStorage दोनों से रोल और नाम निकालने की कोशिश करें
  let storedUser = {};
  try {
    storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    storedUser = {};
  }

  const activeUser = user || storedUser;
  const rawRole = activeUser?.role?.name || activeUser?.role?.code || activeUser?.role;
  const userRoleString = typeof rawRole === 'string' ? rawRole : (rawRole?.name || '');

  // 2. फ्लेक्सिबल एडमिन चेक (यह 'Admin', 'admin', या केस-इंसेंसिटिव मिलान कर लेगा)
  const isAdmin = 
    activeUser?.username === 'admin' || 
    userRoleString === 'Admin' || 
    userRoleString === 'admin' ||
    rawRole === '6a8f0d6e40e479a144f327a4'; // आपके डेटाबेस की एडमिन रोल आईडी

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getStyle = (path) => ({
    background: location.pathname === path ? '#3b82f6' : 'transparent',
    border: 'none',
    color: location.pathname === path ? '#ffffff' : '#94a3b8',
    textAlign: 'left',
    padding: '12px 15px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: location.pathname === path ? '500' : 'normal'
  });

  return (
    <aside style={{ width: '260px', backgroundColor: '#1e293b', color: '#ffffff', display: 'flex', flexDirection: 'column', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px', paddingBottom: '15px', borderBottom: '1px solid #334155' }}>
        <img src={schoolLogo} alt="Logo" style={{ width: '140px', height: '140px', objectFit: 'contain', borderRadius: '50%' }} />
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0 }}>UHS Phurhuriya ERP</h3>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            {userRoleString.toLowerCase() === 'headmaster' ? 'Headmaster Portal' : 'Admin Panel'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
        <button onClick={() => navigate('/dashboard')} style={getStyle('/dashboard')}>📊 Dashboard</button>
        <button onClick={() => navigate('/students')} style={getStyle('/students')}>👨‍🎓 Students</button>
        <button onClick={() => navigate('/teachers')} style={getStyle('/teachers')}>👩‍🏫 Teacher / Staff</button>
        <button onClick={() => navigate('/marks-entry')} style={getStyle('/marks-entry')}>
  ✍️ Marks Entry Portal
</button>
        <button onClick={() => navigate('/routine')} style={getStyle('/routine')}>📅 Weekly Routine</button>
        <button onClick={() => navigate('/leaves')} style={getStyle('/leaves')}>🏖️ Leave Management</button>
        <button onClick={() => navigate('/exams')} style={getStyle('/exams')}>📊 Examination & Results</button>
        
        {/* 💡 नया Exam Result Publishing बटन यहाँ जोड़ दिया गया है */}
        <button onClick={() => navigate('/exam-publish')} style={getStyle('/exam-publish')}>📢 Exam Result Publishing</button>

        <button onClick={() => navigate('/attendance')} style={getStyle('/attendance')}>📅 Attendance</button>
        <button onClick={() => navigate('/fees')} style={getStyle('/fees')}>💰 Fees & Accounts</button>
        
        {userRoleString.toLowerCase() !== 'headmaster' && (
          <button onClick={() => navigate('/audit-logs')} style={getStyle('/audit-logs')}>🛡️ Audit Logs</button>
        )}

        {/* 🔒 Access Control बटन */}
        {isAdmin && (
          <button onClick={() => navigate('/access-control')} style={getStyle('/access-control')}>
            🔐 Access Control
          </button>
        )}
      </div>

      <button 
        onClick={handleLogout} 
        style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: 'auto' }}
      >
        Logout
      </button>
    </aside>
  );
}