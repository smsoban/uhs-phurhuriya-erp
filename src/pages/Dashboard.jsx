import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [totalStudents, setTotalStudents] = useState(1245);
  const [totalTeachers, setTotalTeachers] = useState(48);
  const [pendingFees, setPendingFees] = useState(45200);
  const [boysCount, setBoysCount] = useState(650);
  const [girlsCount, setGirlsCount] = useState(595);
  const [pendingRegistrations, setPendingRegistrations] = useState(5);
  const [leaveRequests, setLeaveRequests] = useState(3);
  const [newQueries, setNewQueries] = useState(2);

  const userRole = user?.role?.code || user?.role;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const studentsRes = await axios.get('/api/v1/students', config);
      const studentsList = studentsRes.data.data || studentsRes.data || [];
      if (Array.isArray(studentsList)) {
        setTotalStudents(studentsList.length);
        const boys = studentsList.filter(s => s.gender === 'Male' || s.gender === 'Boy').length;
        const girls = studentsList.filter(s => s.gender === 'Female' || s.gender === 'Girl').length;
        if (boys > 0 || girls > 0) {
          setBoysCount(boys);
          setGirlsCount(girls);
        }
      }

      const feesRes = await axios.get('/api/v1/fees', config);
      const allFees = feesRes.data.data || [];
      const calculatedPending = allFees.reduce((acc, item) => {
        const due = (item.totalAmount || 0) - (item.paidAmount || 0);
        return acc + due;
      }, 0);
      setPendingFees(calculatedPending);

    } catch (err) {
      console.error('Error fetching dashboard statistics', err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', margin: 0, padding: 0 }}>
      
    

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        {/* Top Header */}
        <header style={{ backgroundColor: '#ffffff', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>+2 उच्चतर माध्यमिक विद्यालय फुरहरिया</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>स्वागत है, {user?.username || user?.name || 'Admin'}! ({userRole})</p>
          </div>
          <div style={{ backgroundColor: '#e2e8f0', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
            Session: 2026-27
          </div>
        </header>

        {/* Dashboard Body */}
        <div style={{ padding: '30px 40px' }}>
          
          {/* Quick Overview Cards */}
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' }}>📊 Quick Overview & Analytics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '25px' }}>
            
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #3b82f6', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>TOTAL STUDENTS</span>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: '8px 0 0 0' }}>{totalStudents.toLocaleString('en-IN')}</h3>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>👦 Boys: {boysCount} | 👧 Girls: {girlsCount}</div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>TOTAL TEACHERS / STAFF</span>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: '8px 0 0 0' }}>{totalTeachers}</h3>
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px' }}>✔ All active on duty</div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #f59e0b', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>TODAY'S ATTENDANCE</span>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: '8px 0 0 0' }}>92%</h3>
              <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '6px' }}>📅 Updated today</div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #6366f1', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>PENDING FEES</span>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: '8px 0 0 0' }}>₹{pendingFees.toLocaleString('en-IN')}</h3>
              <div style={{ fontSize: '12px', color: '#6366f1', marginTop: '6px' }}>💰 Fee status tracked</div>
            </div>

          </div>

          {/* Action Required / Pending Requests Section */}
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' }}>🔔 Action Required & Notifications</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            
            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '18px', borderRadius: '12px' }}>
              <h4 style={{ margin: '0 0 6px 0', color: '#92400e', fontSize: '15px' }}>📝 Pending Registrations ({pendingRegistrations})</h4>
              <p style={{ margin: '0', fontSize: '13px', color: '#b45309' }}>नए छात्रों के रजिस्ट्रेशन अप्रूवल के लिए प्रतीक्षित हैं।</p>
            </div>

            <div onClick={() => navigate('/leaves')} style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '18px', borderRadius: '12px', cursor: 'pointer' }}>
              <h4 style={{ margin: '0 0 6px 0', color: '#1e40af', fontSize: '15px' }}>📨 Leave Requests ({leaveRequests})</h4>
              <p style={{ margin: '0', fontSize: '13px', color: '#1d4ed8' }}>शिक्षकों या स्टाफ द्वारा भेजी गई छुट्टी की अर्जियां (अप्रूव/रिजेक्ट करें)।</p>
            </div>

            <div style={{ backgroundColor: '#fdf2f8', border: '1px solid #fbcfe8', padding: '18px', borderRadius: '12px' }}>
              <h4 style={{ margin: '0 0 6px 0', color: '#9d174d', fontSize: '15px' }}>❓ New Queries ({newQueries})</h4>
              <p style={{ margin: '0', fontSize: '13px', color: '#be185d' }}>पोर्टल पर अभिभावकों या छात्रों के नए सवाल।</p>
            </div>

          </div>

          {/* School Modules Navigation */}
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' }}>⚙️ School Management Modules</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            
            <div onClick={() => navigate('/students')} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px 0' }}>👨‍🎓 Students Management</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>नया छात्र जोड़ें और कक्षावार विद्यार्थियों की सूची प्रबंधित करें।</p>
            </div>

            <div onClick={() => navigate('/teachers')} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px 0' }}>👩‍🏫 Teachers & Staff</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>शिक्षकों की जानकारी, क्लास असाइनमेंट और विषय प्रबंधित करें।</p>
            </div>

            <div onClick={() => navigate('/routine')} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px 0' }}>📅 Weekly Routine</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>क्लास और टीचर्स के लिए वीकली टाइमटेबल और रूटीन सेट करें।</p>
            </div>

            <div onClick={() => navigate('/leaves')} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px 0' }}>🏖️ Leave Management</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>टीचर्स की छुट्टी स्वीकार करें या सीधे डायरेक्ट लीव मार्क करें।</p>
            </div>

            <div onClick={() => navigate('/exams')} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px 0' }}>📊 Examination & Results</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>मार्क्स एंट्री, डिवीज़न, रैंक कैलकुलेशन और PDF मार्क्सशीट एक्सपोर्ट।</p>
            </div>

            <div onClick={() => navigate('/attendance')} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px 0' }}>📅 Daily Attendance</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>विद्यार्थियों की दैनिक उपस्थिति और रिपोर्ट देखें।</p>
            </div>
            
            <div onClick={() => navigate('/fees')} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px 0' }}>💰 Fees & Accounts</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>फ़ीस रसीद, इनवॉइस और बकाया राशि का ट्रैक रखें।</p>
            </div>

            {userRole !== 'Headmaster' && (
              <div onClick={() => navigate('/audit-logs')} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px 0' }}>🛡️ Student Activity Audit Logs</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>देखें किस स्टाफ ने छात्र के डेटा में कब और क्या बदलाव किया है।</p>
              </div>
            )}

          </div>

        </div>
      </main>

    </div>
  );
}