import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar'; // 👈 Sidebar को इम्פור्ट किया गया है

export default function Attendance() {
  const [activeTab, setActiveTab] = useState('student'); // 'student' या 'teacher'
  const [list, setList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const navigate = useNavigate();

  // डेटा फेच करने का फंक्शन (स्टूडेंट्स या टीचर्स के लिए)
  const fetchData = async (dateStr, tab) => {
    try {
      const token = localStorage.getItem('token');
      
      if (tab === 'student') {
        // 1. स्टूडेंट्स की लिस्ट लाएं
        const studentRes = await axios.get('/api/v1/students', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const studentData = studentRes.data.data || studentRes.data.students || studentRes.data || [];
        setList(Array.isArray(studentData) ? studentData : []);

        // 2. स्टूडेंट्स की अटेंडेंस लाएं
        const attRes = await axios.get(`/api/v1/attendance?date=${dateStr}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const attRecords = attRes.data.data || [];
        
        const map = {};
        attRecords.forEach(record => {
          if (record.student && record.student._id) {
            map[record.student._id] = record.status;
          }
        });
        setAttendanceMap(map);

      } else {
        // 1. टीचर्स की लिस्ट लाएं
        const teacherRes = await axios.get('/api/v1/teachers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const teacherData = teacherRes.data.data || teacherRes.data.teachers || teacherRes.data || [];
        setList(Array.isArray(teacherData) ? teacherData : []);

        // 2. टीचर्स की अटेंडेंस लाएं
        const attRes = await axios.get(`/api/v1/teacher-attendance?date=${dateStr}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const attRecords = attRes.data.data || [];
        
        const map = {};
        attRecords.forEach(record => {
          if (record.teacher && record.teacher._id) {
            map[record.teacher._id] = record.status;
          }
        });
        setAttendanceMap(map);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData(selectedDate, activeTab);
  }, [selectedDate, activeTab]);

  // अटेंडेंस स्टेटस बदलने के लिए
  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      
      if (activeTab === 'student') {
        await axios.post('/api/v1/attendance', {
          studentId: id,
          date: selectedDate,
          status
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/v1/teacher-attendance', {
          teacherId: id,
          date: selectedDate,
          status
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setAttendanceMap(prev => ({ ...prev, [id]: status }));
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    }
  };

  // 💡 यहाँ हमने खाली, undefined या बिना नाम वाले कचरा रिकॉर्ड्स को फ़िल्टर कर दिया है
  const filteredList = list.filter(item => {
    const itemName = activeTab === 'student' ? item.name : item.name;
    return itemName && itemName.trim() !== '' && itemName !== 'undefined' && itemName !== null;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
      

      {/* Main Content */}
      <main style={{ flex: 1, padding: '30px 40px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>📅 Attendance Management</h1>

        {/* Tabs & Date Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', flexWrap: 'wrap', gap: '15px' }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setActiveTab('student')} 
              style={{ 
                padding: '10px 20px', 
                backgroundColor: activeTab === 'student' ? '#3b82f6' : '#e2e8f0', 
                color: activeTab === 'student' ? '#ffffff' : '#475569', 
                border: 'none', 
                borderRadius: '8px', 
                fontWeight: '600', 
                cursor: 'pointer' 
              }}
            >
              👨‍🎓 Student Attendance
            </button>
            <button 
              onClick={() => setActiveTab('teacher')} 
              style={{ 
                padding: '10px 20px', 
                backgroundColor: activeTab === 'teacher' ? '#3b82f6' : '#e2e8f0', 
                color: activeTab === 'teacher' ? '#ffffff' : '#475569', 
                border: 'none', 
                borderRadius: '8px', 
                fontWeight: '600', 
                cursor: 'pointer' 
              }}
            >
              👩‍🏫 Teacher Attendance
            </button>
          </div>

          {/* Date Picker */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Select Date:</label><br />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              style={{ padding: '8px 12px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} 
            />
          </div>
        </div>

        {/* Table Section */}
        <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' }}>
            {activeTab === 'student' ? 'Student Attendance List' : 'Teacher Attendance List'} ({selectedDate})
          </h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '14px' }}>
                <th style={{ padding: '10px' }}>{activeTab === 'student' ? 'Student Name' : 'Teacher Name'}</th>
                <th style={{ padding: '10px' }}>{activeTab === 'student' ? 'Roll No / Class' : 'Subject / Phone'}</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length > 0 ? (
                filteredList.map((item, index) => {
                  const currentStatus = attendanceMap[item._id] || 'Present';
                  return (
                    <tr key={item._id || index} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#334155' }}>
                      <td style={{ padding: '12px', fontWeight: '600' }}>
                        {activeTab === 'student' ? (item.name || `${item.firstName || ''}`) : item.name}
                      </td>
                      <td style={{ padding: '12px', color: '#64748b' }}>
                        {activeTab === 'student' 
                          ? `Roll: ${item.rollNo || item.rollNumber || 'N/A'} | Class: ${item.class || 'N/A'}` 
                          : `${item.subject || 'N/A'} | ${item.phone || 'N/A'}`
                        }
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleStatusChange(item._id, 'Present')} 
                          style={{ padding: '6px 12px', marginRight: '6px', backgroundColor: currentStatus === 'Present' ? '#10b981' : '#e2e8f0', color: currentStatus === 'Present' ? '#ffffff' : '#64748b', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Present
                        </button>
                        <button 
                          onClick={() => handleStatusChange(item._id, 'Absent')} 
                          style={{ padding: '6px 12px', marginRight: '6px', backgroundColor: currentStatus === 'Absent' ? '#ef4444' : '#e2e8f0', color: currentStatus === 'Absent' ? '#ffffff' : '#64748b', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Absent
                        </button>
                        <button 
                          onClick={() => handleStatusChange(item._id, 'Leave')} 
                          style={{ padding: '6px 12px', backgroundColor: currentStatus === 'Leave' ? '#f59e0b' : '#e2e8f0', color: currentStatus === 'Leave' ? '#ffffff' : '#64748b', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Leave
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>कोई रिकॉर्ड नहीं मिला।</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}