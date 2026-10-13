import React from 'react';
import { useNavigate } from 'react-router-dom';
import schoolLogo from '../assets/SCHOOL_LOGO.PNG';

export default function TeacherSidebar({ activeTab, setActiveTab, onLogout }) {
  const menuItems = [
    { id: 'overview', title: 'Overview', icon: '📊' },
    { id: 'profile', title: 'My Profile & Settings', icon: '👤' }, // 👈 नया टैब जोड़ा गया
    { id: 'students', title: 'Student Management', icon: '🎓' },
    { id: 'leave', title: 'Leave Application', icon: '📅' },
    { id: 'routine', title: 'Routine / TimeTable', icon: '⏰' },
    { id: 'marks', title: 'Exam Marks Entry', icon: '✍️' },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#1e293b',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '4px 0 10px rgba(0,0,0,0.05)',
      minHeight: '100vh',
      position: 'sticky',
      top: 0,
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img 
          src={schoolLogo} 
          alt="School Logo" 
          style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', backgroundColor: '#fff', padding: '2px', border: '2px solid #3b82f6' }} 
        />
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, color: '#f8fafc' }}>
            School Portal
          </h2>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Teacher Dashboard</span>
        </div>
      </div>

      <nav style={{ padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                backgroundColor: isActive ? '#3b82f6' : 'transparent',
                color: isActive ? '#ffffff' : '#cbd5e1',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span>{item.title}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '20px', borderTop: '1px solid #334155' }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}