import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import StudentSidebar from './StudentSidebar';

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Online Exam States
  const [examStarted, setExamStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const sampleExam = {
    title: 'सामान्य विज्ञान एवं बेसिक कंप्यूटर टेस्ट (General Science & Computer Quiz)',
    questions: [
      {
        id: 1,
        question: 'कंप्यूटर का जनक (Father of Computer) किसे कहा जाता है?',
        options: ['चार्ल्स बैबेज', 'अल्बर्ट आइंस्टीन', 'थॉमस एडिसन', 'आइज़क न्यूटन'],
        correct: 0
      },
      {
        id: 2,
        question: 'सूर्य का प्रकाश पृथ्वी तक पहुँचने में लगभग कितना समय लेता है?',
        options: ['1 मिनट', '8 मिनट 20 सेकंड', '15 मिनट', '24 घंटे'],
        correct: 1
      },
      {
        id: 3,
        question: 'भारत का राष्ट्रीय पक्षी कौन सा है?',
        options: ['तोता', 'कबूतर', 'मोर', 'हंस'],
        correct: 2
      }
    ]
  };

  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const storedStudent = localStorage.getItem('studentInfo') || localStorage.getItem('user');
    if (!storedStudent) {
      navigate('/login', { replace: true });
    } else {
      try {
        setStudent(JSON.parse(storedStudent));
      } catch (err) {
        console.error("Failed to parse student info", err);
        localStorage.clear();
        navigate('/login', { replace: true });
      }
    }
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('❌ नए पासवर्ड और कंफर्म पासवर्ड आपस में मैच नहीं हो रहे हैं!');
      return;
    }

    try {
      const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
  
      if (!token) {
        alert('❌ सेशन खत्म हो गया है, कृपया दोबारा लॉगिन करें!');
        navigate('/login', { replace: true });
        return;
      }
  
      const res = await axios.put(
        '/api/v1/students/change-password',
        { oldPassword, newPassword },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      alert('✅ ' + (res.data.message || 'पासवर्ड सफलतापूर्वक बदल गया!'));
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordModal(false);
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || 'Password update failed'));
    }
  };

  const handleOptionChange = (questionId, optionIndex) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex
    });
  };

  const handleExamSubmit = (e) => {
    e.preventDefault();
    let calculatedScore = 0;
    sampleExam.questions.forEach((q) => {
      if (answers[q.id] === q.correct) {
        calculatedScore += 1;
      }
    });
    setScore(calculatedScore);
    setSubmitted(true);
  };

  const handleLogout = () => {
    if (logout) logout();
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentInfo');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  if (!student) {
    return (
      <div style={{ textAlign: 'center', marginTop: '40vh', fontFamily: 'Segoe UI, sans-serif', fontSize: '18px', color: '#64748b' }}>
        Loading Student Data...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
      <StudentSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <main style={{ flex: 1, padding: '30px 40px', overflowY: 'auto' }}>
        
        {/* Top Header (अब यहाँ से Change Password बटन हटा दिया गया है) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: '#ffffff', padding: '20px 25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>स्वागत है, {student.name}! 👋</h1>
        </div>

        {/* 1. OVERVIEW / PROFILE TAB */}
        {activeTab === 'overview' && (
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', maxWidth: '750px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#334155', margin: 0 }}>📋 आपकी जानकारी (Student Profile)</h3>
              <button 
                onClick={() => setShowPasswordModal(true)} 
                style={{ backgroundColor: '#8b5cf6', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
              >
                🔒 Change Password
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <p style={{ fontSize: '14px', margin: 0 }}><b>Unique ID:</b> {student.studentId || 'N/A'}</p>
              <p style={{ fontSize: '14px', margin: 0 }}><b>PEN Number:</b> {student.pen || 'N/A'}</p>
              <p style={{ fontSize: '14px', margin: 0 }}><b>APAAR ID:</b> {student.apaar || 'N/A'}</p>
              <p style={{ fontSize: '14px', margin: 0 }}><b>E-Shikshakosh ID:</b> {student.eshikshakoshID || 'N/A'}</p>
              <p style={{ fontSize: '14px', margin: 0 }}><b>Registration No:</b> {student.registrationNo || 'N/A'}</p>
              <p style={{ fontSize: '14px', margin: 0 }}><b>Email (Login ID):</b> {student.email}</p>
              <p style={{ fontSize: '14px', margin: 0 }}><b>Class:</b> {student.class} | <b>Section:</b> {student.section}</p>
              <p style={{ fontSize: '14px', margin: 0 }}><b>Stream:</b> {student.stream || 'N/A'}</p>
              <p style={{ fontSize: '14px', margin: 0 }}><b>Roll No:</b> {student.rollNo || 'N/A'}</p>
              <p style={{ fontSize: '14px', margin: 0 }}><b>Class Teacher:</b> {student.classTeacher || 'N/A'}</p>
              <p style={{ fontSize: '14px', margin: 0 }}><b>Father's Name:</b> {student.fatherName || 'N/A'}</p>
              <p style={{ fontSize: '14px', margin: 0 }}><b>Mother's Name:</b> {student.motherName || 'N/A'}</p>
              <p style={{ fontSize: '14px', margin: 0 }}><b>Mobile No:</b> {student.mobileNumber || 'N/A'}</p>
              <p style={{ fontSize: '14px', margin: 0 }}><b>BSEB Registration:</b> <span style={{ color: student.bsebRegistered ? '#166534' : '#991b1b', fontWeight: 'bold' }}>{student.bsebRegistered ? 'Registered' : 'Pending'}</span></p>
            </div>
          </div>
        )}

        {/* 2. ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#334155' }}>📅 उपस्थिति विवरण (Attendance Record)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#166534' }}>Total Present</h4>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#15803d' }}>-- Days</p>
              </div>
              <div style={{ backgroundColor: '#fef2f2', padding: '20px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#991b1b' }}>Total Absent</h4>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#dc2626' }}>-- Days</p>
              </div>
            </div>
            <p style={{ color: '#64748b' }}>मासिक उपस्थिति रिपोर्ट शिक्षक द्वारा अपडेट होने पर यहाँ दिखाई जाएगी।</p>
          </div>
        )}

      {/* 3. RESULTS TAB */}
      {activeTab === 'results' && (
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#334155' }}>📈 परीक्षा परिणाम (Exam Results & MarkSheets)</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              अकादमिक वर्ष: <b>2026-2027</b> | कक्षा: <b>{student.class} ({student.stream || 'General'})</b>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {(() => {
                // कक्षा 9 और 11 के लिए सभी परीक्षाएं (फिलहाल सभी को false रखा गया है)
                const examsClass9_11 = [
                  { title: 'First Quarterly Exam Result (2026-27)', isPublished: false },
                  { title: 'Half Yearly Exam Result (2026-27)', isPublished: false },
                  { title: 'Second Quarterly Exam Result (2026-27)', isPublished: false },
                  { title: 'Final Exam Result (2026-27)', isPublished: false }
                ];

                // कक्षा 10 और 12 के लिए सभी परीक्षाएं (फिलहाल सभी को false रखा गया है)
                const examsClass10_12 = [
                  { title: 'Sentup Exam Result (2026-27)', isPublished: false },
                  { title: 'Final / Board Mock Exam Result (2026-27)', isPublished: false }
                ];

                const currentExams = (student.class === '9' || student.class === '11') ? examsClass9_11 : examsClass10_12;

                return currentExams.map((exam, idx) => (
                  <div key={idx} style={{ padding: '15px 20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: '15px' }}>{exam.title}</h4>
                      {exam.isPublished ? (
                        <p style={{ margin: 0, fontSize: '12px', color: '#166534', fontWeight: '600' }}>🟢 आधिकारिक रूप से जारी (Published)</p>
                      ) : (
                        <p style={{ margin: 0, fontSize: '12px', color: '#991b1b', fontWeight: '600' }}>🔴 अभी पब्लिश नहीं हुआ है (Pending)</p>
                      )}
                    </div>
                    {exam.isPublished ? (
                      <button onClick={() => alert(`${exam.title} की मार्कशीट डाउनलोड हो रही है...`)} style={{ padding: '8px 14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        डाउनलोड मार्कशीट
                      </button>
                    ) : (
                      <button disabled style={{ padding: '8px 14px', backgroundColor: '#cbd5e1', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'not-allowed' }}>
                        उपलब्ध नहीं
                      </button>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* 4. ONLINE EXAM TAB */}
        {activeTab === 'exam' && (
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', maxWidth: '800px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#334155' }}>📝 ऑनलाइन परीक्षा पोर्टल (Online Exam Portal)</h3>
            
            {!examStarted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ color: '#1e293b', marginBottom: '10px' }}>{sampleExam.title}</h4>
                <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>कुल प्रश्न: {sampleExam.questions.length} | समय सीमा: 10 मिनट</p>
                <button 
                  onClick={() => { setExamStarted(true); setSubmitted(false); setAnswers({}); }} 
                  style={{ padding: '12px 25px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}
                >
                  🚀 परीक्षा शुरू करें (Start Exam)
                </button>
              </div>
            ) : submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <h4 style={{ color: '#166534', fontSize: '20px', marginBottom: '10px' }}>🎉 परीक्षा सफलतापूर्वक संपन्न हुई!</h4>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#15803d', marginBottom: '20px' }}>आपका स्कोर: {score} / {sampleExam.questions.length}</p>
                <button 
                  onClick={() => setExamStarted(false)} 
                  style={{ padding: '10px 20px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  डैशबोर्ड पर वापस जाएं
                </button>
              </div>
            ) : (
              <form onSubmit={handleExamSubmit}>
                {sampleExam.questions.map((q, index) => (
                  <div key={q.id} style={{ marginBottom: '25px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '12px' }}>{index + 1}. {q.question}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {q.options.map((opt, optIdx) => (
                        <label key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer', color: '#334155' }}>
                          <input 
                            type="radio" 
                            name={`question_${q.id}`} 
                            checked={answers[q.id] === optIdx}
                            onChange={() => handleOptionChange(q.id, optIdx)}
                            required
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ padding: '12px 25px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    पेपर सबमिट करें (Submit Exam)
                  </button>
                  <button type="button" onClick={() => setExamStarted(false)} style={{ padding: '12px 20px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    रद्द करें (Cancel)
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 5. FEES & ACCOUNTS TAB */}
        {activeTab === 'fees' && (
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#334155' }}>💰 फीस और भुगतान विवरण (Fees & Accounts)</h3>
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 10px 0' }}><b>कुल देय फीस (Total Dues):</b> रु. 0.00</p>
              <p style={{ margin: '0 0 10px 0' }}><b>जमा राशि (Paid Amount):</b> रु. 0.00</p>
              <p style={{ margin: 0 }}><b>स्थिति (Status):</b> <span style={{ color: '#166534', fontWeight: 'bold' }}>No Dues / Clear</span></p>
            </div>
            <p style={{ color: '#64748b' }}>फीस रसीद डाउनलोड करने की सुविधा जल्द जोड़ी जाएगी।</p>
          </div>
        )}

        {/* 6. HOMEWORK TAB */}
        {activeTab === 'homework' && (
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#334155' }}>📚 होमवर्क एवं असाइनमेंट (Homework & Projects)</h3>
            <p style={{ color: '#64748b' }}>शिक्षकों द्वारा दिए गए दैनिक गृहकार्य यहाँ सूचीबद्ध होंगे। वर्तमान में कोई नया होमवर्क नहीं है।</p>
          </div>
        )}

        {/* 7. NOTICES TAB */}
        {activeTab === 'notices' && (
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#334155' }}>📢 स्कूल नोटिस बोर्ड और सर्कुलर (Notice Board)</h3>
            <div style={{ padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#1e40af' }}>🏫 विद्यालय की महत्वपूर्ण सूचना</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#334155' }}>सभी छात्र समय पर विद्यालय आएं और अपनी उपस्थिति सुनिश्चित करें। परीक्षा की सारणी जल्द जारी होगी।</p>
            </div>
          </div>
        )}

        {/* 8. ROUTINE TAB */}
        {activeTab === 'routine' && (
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#334155' }}>⏰ कक्षा समय-सारणी (Class Routine / Timetable)</h3>
            <p style={{ color: '#64748b' }}>कक्षा {student.class} ({student.stream || 'General'}) का साप्ताहिक रूटीन यहाँ प्रदर्शित किया जाएगा।</p>
          </div>
        )}

        {/* 9. LEAVE APPLICATION TAB */}
        {activeTab === 'leave' && (
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#334155' }}>✉️ अवकाश के लिए आवेदन (Leave Application)</h3>
            <form onSubmit={(e) => { e.preventDefault(); alert('✅ अवकाश आवेदन सफलतापूर्वक भेज दिया गया है!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>कारण (Reason)</label>
                <textarea required placeholder="बीमारी या आवश्यक कार्य हेतु..." style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '80px', boxSizing: 'border-box' }}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>कब से (From Date)</label>
                  <input type="date" required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>कब तक (To Date)</label>
                  <input type="date" required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
              </div>
              <button type="submit" style={{ padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                आवेदन जमा करें (Submit Application)
              </button>
            </form>
          </div>
        )}

        {/* 10. TEACHERS & SUBJECTS TAB */}
        {activeTab === 'teachers' && (
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#334155' }}>👨‍🏫 विषय और शिक्षक विवरण (Subjects & Teachers)</h3>
            <p style={{ color: '#64748b' }}>कक्षा {student.class} को पढ़ाने वाले शिक्षकों की सूची जल्द यहाँ दिखाई जाएगी।</p>
          </div>
        )}

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#1e293b' }}>🔒 पासवर्ड बदलें</h3>
              
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Old Password</label>
                  <input 
                    type="password" 
                    value={oldPassword} 
                    onChange={(e) => setOldPassword(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>New Password</label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button 
                    type="submit" 
                    style={{ flex: 1, padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Update Password
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowPasswordModal(false)} 
                    style={{ padding: '10px 15px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}