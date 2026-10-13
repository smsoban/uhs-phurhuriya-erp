import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [activeTab, setActiveTab] = useState('list');
  
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userRole = typeof user.role === 'object' ? user.role.code : user.role;
  
  // 💡 अगर यूज़र Teacher नहीं है, तो उसे Admin/Headmaster मानेंगे
  const isAdminOrHeadmaster = userRole !== 'Teacher'; 

  const [formData, setFormData] = useState({
    applicant: '',
    leaveType: 'CL',
    otherLeaveReason: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
    if (isAdminOrHeadmaster) {
      fetchTeachers();
    }
  }, [isAdminOrHeadmaster]);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/v1/leaves', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaves(res.data.data || []);
    } catch (err) {
      console.error('Error fetching leaves:', err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/v1/teachers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeachers(res.data.data || res.data || []);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };

  // 💡 Auto Calculate Total Days
  const calculateTotalDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end >= start) {
        const diffTime = end.getTime() - start.getTime();
        return Math.ceil(diffTime / (1000 * 3600 * 24)) + 1; // +1 to include the start day
      }
      return -1; // Invalid date range
    }
    return 0;
  };

  const totalDays = calculateTotalDays();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // एडमिन के लिए टीचर सेलेक्ट करना अनिवार्य है
    if (isAdminOrHeadmaster && !formData.applicant) {
      alert('⚠️ कृपया ड्रॉपडाउन से शिक्षक (Teacher/Staff) का चयन करें!');
      return;
    }

    if (totalDays === -1) {
      alert('⚠️ End Date, Start Date से पहले की नहीं हो सकती!');
      return;
    }

    // 💡 SL (Special Leave) Rules Validation
    if (formData.leaveType === 'SL') {
      const targetGender = isAdminOrHeadmaster 
        ? teachers.find(t => t._id === formData.applicant)?.gender 
        : user.gender;

      const isFemale = targetGender && targetGender.toLowerCase() === 'female';

      if (!isFemale) {
        alert('⚠️ Special Leave (SL) केवल महिला स्टाफ (Female) के लिए उपलब्ध है!');
        return;
      }

      if (totalDays > 2) {
        alert(`⚠️ Special Leave (SL) अधिकतम 2 लगातार दिनों के लिए ही ली जा सकती है! आपने ${totalDays} दिन सेलेक्ट किए हैं।`);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/v1/leaves', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Leave submitted successfully!');
      
      setFormData({ applicant: '', leaveType: 'CL', otherLeaveReason: '', startDate: '', endDate: '', reason: '' });
      setActiveTab('list');
      fetchLeaves();
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/v1/leaves/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLeaves();
    } catch (err) {
      alert('❌ Failed to update leave status');
    }
  };

  return (
    // 💡 अगर टीचर है, तो बैकग्राउंड ट्रांसपेरेंट और minHeight auto रहेगा
    <div style={{ display: 'flex', minHeight: isAdminOrHeadmaster ? '100vh' : 'auto', backgroundColor: isAdminOrHeadmaster ? '#f1f5f9' : 'transparent', fontFamily: 'Segoe UI, sans-serif' }}>
      
      {/* 💡 Sidebar केवल Admin या Headmaster को ही दिखेगा */}
      {isAdminOrHeadmaster}
      
      <main style={{ flex: 1, padding: isAdminOrHeadmaster ? '30px 40px' : '0px', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>🏖️ Leave Management</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setActiveTab('list')} style={{ padding: '8px 16px', backgroundColor: activeTab === 'list' ? '#3b82f6' : '#e2e8f0', color: activeTab === 'list' ? '#fff' : '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Leave History</button>
            <button onClick={() => setActiveTab('apply')} style={{ padding: '8px 16px', backgroundColor: activeTab === 'apply' ? '#3b82f6' : '#e2e8f0', color: activeTab === 'apply' ? '#fff' : '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>{isAdminOrHeadmaster ? '+ Direct Mark Leave' : '+ Apply Leave'}</button>
          </div>
        </div>

        {/* --- LEAVE APPLY FORM --- */}
        {activeTab === 'apply' && (
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)', maxWidth: '800px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>{isAdminOrHeadmaster ? '📝 Direct Mark Leave for Teacher / Staff' : '📝 Apply For Leave'}</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              
              {isAdminOrHeadmaster && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Select Teacher / Staff *</label>
                  <select value={formData.applicant} onChange={(e) => setFormData({ ...formData, applicant: e.target.value })} required style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
                    <option value="">-- Select Teacher --</option>
                    {teachers.map(t => (
                      <option key={t._id} value={t._id}>{t.name} ({t.appointedSubject || 'Staff'}) - {t.gender}</option>
                    ))}
                  </select>
                </div>
              )}

             <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Leave Type *</label>
                <select value={formData.leaveType} onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })} style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="CL">Casual Leave (CL)</option>
                  <option value="SL">Special Leave (SL) - Female Only</option>
                  <option value="Other">Other Leave</option>
                </select>
              </div>

              {formData.leaveType === 'Other' && (
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Specify Reason *</label>
                  <input type="text" placeholder="e.g., Medical Leave" value={formData.otherLeaveReason} onChange={(e) => setFormData({ ...formData, otherLeaveReason: e.target.value })} required style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              )}

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Start Date *</label>
                <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>End Date *</label>
                <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              {/* 💡 Total Days Display Box */}
              {formData.startDate && formData.endDate && (
                <div style={{ 
                  gridColumn: '1 / -1', 
                  backgroundColor: totalDays > 0 ? '#eff6ff' : '#fef2f2', 
                  padding: '12px 15px', 
                  borderRadius: '6px', 
                  border: `1px solid ${totalDays > 0 ? '#bfdbfe' : '#fecaca'}`,
                  color: totalDays > 0 ? '#1e40af' : '#991b1b',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {totalDays > 0 ? (
                    <>⏳ Total Leave Duration: <span>{totalDays} Day(s)</span></>
                  ) : (
                    <>⚠️ Invalid Date Range: End Date cannot be before Start Date</>
                  )}
                </div>
              )}

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Reason / Description *</label>
                <textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} required rows="3" style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <button type="submit" style={{ gridColumn: '1 / -1', padding: '12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                {isAdminOrHeadmaster ? 'Mark Leave Directly' : 'Submit Leave Application'}
              </button>
            </form>
          </div>
        )}

        {/* --- LEAVE HISTORY LIST --- */}
        {activeTab === 'list' && (
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '12px' }}>Teacher Name</th>
                    <th style={{ padding: '12px' }}>Leave Type</th>
                    <th style={{ padding: '12px' }}>Duration</th>
                    <th style={{ padding: '12px' }}>Reason</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    {isAdminOrHeadmaster && <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {leaves.length > 0 ? (
                    leaves.map((l) => (
                      <tr key={l._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{l.applicant?.name || l.applicant?.username || l.teacherId?.name || 'Staff'}</td>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: l.leaveType === 'SL' ? '#d946ef' : '#3b82f6' }}>{l.leaveType === 'Other' ? l.otherLeaveReason : l.leaveType}</td>
                        <td style={{ padding: '12px' }}>{l.startDate?.split('T')[0]} to {l.endDate?.split('T')[0]}</td>
                        <td style={{ padding: '12px' }}>{l.reason}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', backgroundColor: l.status === 'Approved' ? '#dcfce7' : l.status === 'Rejected' ? '#fee2e2' : '#fef3c7', color: l.status === 'Approved' ? '#166534' : l.status === 'Rejected' ? '#991b1b' : '#92400e' }}>
                            {l.status}
                          </span>
                        </td>
                        {isAdminOrHeadmaster && (
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {l.status === 'Pending' && (
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button onClick={() => handleStatusChange(l._id, 'Approved')} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Approve</button>
                                <button onClick={() => handleStatusChange(l._id, 'Rejected')} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Reject</button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={isAdminOrHeadmaster ? 6 : 5} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No leave records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}