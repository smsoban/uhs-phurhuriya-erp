import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';

export default function AuditLogs() {
  const [logsList, setLogsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/v1/students/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data.data || res.data || [];
      setLogsList(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setLoading(false);
    }
  };

  // Date ko readable format me badalne ke liye
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
     

      {/* Main Content */}
      <main style={{ flex: 1, padding: '30px 40px', overflowY: 'auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🛡️ Student Activity Audit Logs
        </h1>
        <p style={{ color: '#64748b', marginBottom: '25px', fontSize: '14px' }}>
          यहाँ आप देख सकते हैं कि किस शिक्षक या स्टाफ द्वारा किस छात्र के डेटा में कब और क्या बदलाव किया गया है।
        </p>

        <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' }}>
            System History & Tracking ({logsList.length} logs)
          </h3>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>लोड हो रहा है...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '14px' }}>
                    <th style={{ padding: '12px' }}>Action</th>
                    <th style={{ padding: '12px' }}>Student Name</th>
                    <th style={{ padding: '12px' }}>Performed By (Staff)</th>
                    <th style={{ padding: '12px' }}>Role</th>
                    <th style={{ padding: '12px' }}>Details / Description</th>
                    <th style={{ padding: '12px' }}>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logsList.length > 0 ? (
                    logsList.map((log, index) => (
                      <tr key={log._id || index} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#334155' }}>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '6px', 
                            fontSize: '12px', 
                            fontWeight: '600',
                            backgroundColor: log.action === 'ADD' || log.action === 'CSV_ADD' ? '#dcfce7' : log.action === 'UPDATE' ? '#e0e7ff' : '#fee2e2',
                            color: log.action === 'ADD' || log.action === 'CSV_ADD' ? '#166534' : log.action === 'UPDATE' ? '#3730a3' : '#991b1b'
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{log.studentName || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>{log.staffName || 'Unknown'}</td>
                        <td style={{ padding: '12px', color: '#64748b' }}>{log.staffRole || 'Staff'}</td>
                        <td style={{ padding: '12px', color: '#475569' }}>{log.details || 'N/A'}</td>
                        <td style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>{formatDate(log.timestamp)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>कोई गतिविधि (Log) रिकॉर्ड नहीं मिला है।</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}