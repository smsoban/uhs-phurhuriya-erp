import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';

function ExamPublish() {
  const [examResultsList, setExamResultsList] = useState(() => {
    const saved = localStorage.getItem('examPublishStatus');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved exam status", e);
      }
    }
    return [
      { id: '1', title: 'First Quarterly Exam Result', className: 'All Classes (9, 10, 11, 12)', academicYear: '2026-27', isPublished: false },
      { id: '2', title: 'Half Yearly Exam Result', className: 'All Classes (9, 10, 11, 12)', academicYear: '2026-27', isPublished: false },
      { id: '3', title: 'Second Quarterly Exam Result', className: 'All Classes (9, 10, 11, 12)', academicYear: '2026-27', isPublished: false },
      { id: '4', title: 'Sentup Exam Result', className: 'Class 10 & 12', academicYear: '2026-27', isPublished: false },
      { id: '5', title: 'Final Exam Result', className: 'All Classes (9, 10, 11, 12)', academicYear: '2026-27', isPublished: false }
    ];
  });

  useEffect(() => {
    localStorage.setItem('examPublishStatus', JSON.stringify(examResultsList));
  }, [examResultsList]);

  const handleToggleExamPublish = async (id, currentStatus, examTitle) => {
    try {
      if (!currentStatus) {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const res = await axios.get(`/api/v1/exams/check-completion/${encodeURIComponent(examTitle)}`, config);
        
        if (!res.data.isComplete) {
          alert(`❌ Marks entry not completed for all students for "${examTitle}". Status: (${res.data.enteredMarksCount}/${res.data.totalStudents} completed).`);
          return;
        }
      }

      setExamResultsList(prevList => 
        prevList.map(exam => 
          exam.id === id ? { ...exam, isPublished: !currentStatus } : exam
        )
      );

      alert(`✅ परीक्षा परिणाम सफलतापूर्वक ${!currentStatus ? 'पब्लिश' : 'अनपब्लिश'} कर दिया गया है!`);
    } catch (err) {
      alert('❌ अपडेट करने में विफल: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      

      <main style={{ flex: 1, padding: '30px 40px', overflowX: 'auto' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '25px 30px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>🛡️ परीक्षा परिणाम पब्लिशिंग पैनल (Exam Result Publishing - Session 2026-27)</h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
            जब सभी छात्रों के सभी विषयों के मार्क्स दर्ज हो जाएंगे, तभी एडमिन यहाँ से रिजल्ट पब्लिश कर सकेंगे।
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px' }}>परीक्षा का नाम (Exam Name)</th>
                  <th style={{ padding: '12px' }}>लागू कक्षाएं (Applicable Classes)</th>
                  <th style={{ padding: '12px' }}>अकादमिक वर्ष</th>
                  <th style={{ padding: '12px' }}>वर्तमान स्थिति</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>एक्शन (Action)</th>
                </tr>
              </thead>
              <tbody>
                {examResultsList.map((exam) => (
                  <tr key={exam.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px', fontWeight: '600', color: '#1e293b' }}>{exam.title}</td>
                    <td style={{ padding: '12px', color: '#334155' }}>{exam.className}</td>
                    <td style={{ padding: '12px', color: '#334155' }}>{exam.academicYear}</td>
                    <td style={{ padding: '12px' }}>
                      {exam.isPublished ? (
                        <span style={{ color: '#166534', backgroundColor: '#f0fdf4', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Published</span>
                      ) : (
                        <span style={{ color: '#991b1b', backgroundColor: '#fef2f2', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Pending</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleToggleExamPublish(exam.id, exam.isPublished, exam.title)}
                        style={{ 
                          padding: '6px 14px', 
                          backgroundColor: exam.isPublished ? '#dc2626' : '#16a34a', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '6px', 
                          fontSize: '12px', 
                          fontWeight: 'bold', 
                          cursor: 'pointer' 
                        }}
                      >
                        {exam.isPublished ? 'Unpublish' : 'Publish Result'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ExamPublish;