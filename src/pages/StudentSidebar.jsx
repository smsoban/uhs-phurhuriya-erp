import React from 'react';
import schoolLogo from '../assets/SCHOOL_LOGO.PNG';

export default function StudentSidebar({ activeTab, setActiveTab, onLogout }) {
  const menuItems = [
    { id: 'overview', label: '📊 मेरी प्रोफाइल (Overview)' },
    { id: 'attendance', label: '📅 उपस्थिति (Attendance)' },
    { id: 'results', label: '📈 परीक्षा परिणाम (Results)' },
    { id: 'exam', label: '📝 ऑनलाइन परीक्षा (Online Exam)' }, // 👈 नया ऑनलाइन एग्जाम टैब
    { id: 'fees', label: '💰 फीस और खाते (Fees)' },
    { id: 'homework', label: '📚 होमवर्क / असाइनमेंट' },
    { id: 'notices', label: '📢 नोटिस बोर्ड (Notices)' },
    { id: 'routine', label: '⏰ क्लास रूटीन (Routine)' },
    { id: 'leave', label: '✉️ अवकाश आवेदन (Leave)' },
    { id: 'teachers', label: '👨‍🏫 विषय और शिक्षक' }
  ];

  return (
    <aside style={{ 
      width: '280px', 
      backgroundColor: '#1e293b', 
      color: '#fff', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      padding: '25px 20px',
      boxShadow: '4px 0 10px rgba(0,0,0,0.05)'
    }}>
      {/* School Logo & Branding */}
      <div style={{ textAlign: 'center', marginBottom: '25px', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
        <div style={{ 
          width: '100px', 
          height: '100px', 
          borderRadius: '50%', 
          backgroundColor: '#fff', 
          margin: '0 auto 10px auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
        }}>
          <img src={schoolLogo} alt="School Logo" style={{ width: '120%', height: '120%', objectFit: 'cover' }} />
        </div>
        <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#f8fafc', margin: 0 }}>Student Portal</h2>
        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '3px 0 0 0' }}>+2 U.H.S. Phurhuriya</p>
      </div>

      {/* Navigation Links / Tabs */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        {menuItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)} 
            style={{
              background: activeTab === item.id ? '#3b82f6' : 'transparent',
              color: '#fff', 
              border: 'none', 
              padding: '10px 14px', 
              borderRadius: '8px', 
              textAlign: 'left', 
              cursor: 'pointer', 
              fontWeight: '600', 
              fontSize: '13px',
              transition: '0.2s'
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <button 
        onClick={onLogout} 
        style={{
          backgroundColor: '#ef4444', 
          color: '#fff', 
          border: 'none', 
          padding: '11px 15px', 
          borderRadius: '8px', 
          cursor: 'pointer', 
          fontWeight: '600', 
          fontSize: '14px', 
          marginTop: '15px',
          textAlign: 'center'
        }}
      >
        🚪 Logout
      </button>
    </aside>
  );
}