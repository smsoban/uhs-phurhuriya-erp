import { useEffect, useState } from 'react';
import ClerkSidebar from './ClerkSidebar'; // 👈 क्लर्क का अलग साइडबार इम्पोर्ट किया

export default function ClerkDashboard() {
  const [clerkUser, setClerkUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setClerkUser(user);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      {/* 👈 क्लर्क का अपना अलग साइडबार */}
      <ClerkSidebar />

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '30px', fontFamily: 'Segoe UI', overflowY: 'auto' }}>
        <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h1 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '24px' }}>👨‍💼 Clerk Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
            स्वागत है, <strong style={{ color: '#0f172a' }}>{clerkUser?.name || clerkUser?.username || 'Clerk'}</strong> जी! यह कार्यालय और फीस प्रबंधन के लिए समर्पित पैनल है।
          </p>
        </div>

        {/* Quick Stats / Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '25px' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '13px' }}>TODAY'S FEE COLLECTION</h4>
            <h2 style={{ margin: 0, color: '#0284c7', fontSize: '22px' }}>₹ 0.00</h2>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '13px' }}>PENDING DUES</h4>
            <h2 style={{ margin: 0, color: '#dc2626', fontSize: '22px' }}>0 Students</h2>
          </div>
        </div>
      </div>
    </div>
  );
}