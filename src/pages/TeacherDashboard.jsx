import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import LeaveManagement from './LeaveManagement';
import TeacherSidebar from './TeacherSidebar';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    mobileNumber: '',
    role: '',
    gender: 'N/A',
    photo: '',
    permissions: []
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [assignedMappings, setAssignedMappings] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [loadingMappings, setLoadingMappings] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Profile Edit & Password Change States
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', mobileNumber: '', photo: '' });
  
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passLoading, setPassLoading] = useState(false);

  // Filter & Pagination States for Students
  const [filterClass, setFilterClass] = useState('All');
  const [filterSection, setFilterSection] = useState('All');
  const [filterStream, setFilterStream] = useState('All');
  const [filterGender, setFilterGender] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchTeacherProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'marks') {
      fetchTeacherMappings();
    } else if (activeTab === 'students') {
      fetchStudentsList();
    }
  }, [activeTab, user.id]);

  const fetchTeacherProfile = async () => {
    try {
      setLoadingProfile(true);
      const localUser = JSON.parse(localStorage.getItem('user')) || {};

      const userData = {
        id: localUser._id || localUser.id || '',
        name: localUser.name || localUser.username || 'Staff Member',
        email: localUser.email || '',
        mobileNumber: localUser.mobileNumber || localUser.phone || '',
        role: typeof localUser.role === 'object' ? localUser.role.code || localUser.role.name : localUser.role || 'Teacher',
        gender: localUser.gender || 'N/A',
        photo: localUser.photo || '',
        permissions: localUser.permissions || ['student-add', 'student-update', 'student-delete']
      };

      setUser(userData);
      setProfileForm({
        name: userData.name,
        email: userData.email,
        mobileNumber: userData.mobileNumber,
        photo: userData.photo
      });
    } catch (err) {
      console.error('Profile Load Error:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchTeacherMappings = async () => {
    try {
      setLoadingMappings(true);
      const token = localStorage.getItem('token');
      const teacherId = user.id;

      if (!teacherId || teacherId === 'undefined') {
        setLoadingMappings(false);
        return;
      }

      const res = await axios.get(`/api/v1/exam-mappings?teacherId=${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.data && res.data.data.length > 0) {
        setAssignedMappings(res.data.data[0].classMappings || []);
      } else {
        setAssignedMappings([]);
      }
    } catch (err) {
      console.error('Error fetching assigned classes:', err);
    } finally {
      setLoadingMappings(false);
    }
  };

  const fetchStudentsList = async () => {
    try {
      setLoadingStudents(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/v1/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudentsList(res.data.data || res.data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  // 💡 फोटो अपलोड और 100KB साइज चेक
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 100 * 1024) {
      alert('❌ फाइल का साइज़ 100KB से कम होना चाहिए!');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileForm(prev => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // 💡 प्रोफाइल अपडेट सबमिट (सही /teachers/ राउट के साथ)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // ✅ यहाँ /users की जगह /teachers करें ताकि 404 Not Found एरर न आए
      const res = await axios.put(`/api/v1/teachers/${user.id}`, profileForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user') || '{}'), ...profileForm }));
      
      setUser(prev => ({ ...prev, ...profileForm }));
      setEditMode(false);
      alert('✅ प्रोफाइल सफलतापूर्वक अपडेट हो गई!');
    } catch (err) {
      alert('❌ अपडेट करने में समस्या आई: ' + (err.response?.data?.message || err.message));
    }
  };

  // 💡 पासवर्ड चेंज सबमिट (सही टीचर्स राउट के साथ)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
  
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('नए पासवर्ड और पुष्टि पासवर्ड मेल नहीं खा रहे हैं!');
      return;
    }
  
    try {
      setPassLoading(true);
      const token = localStorage.getItem('token');
      
      // 💡 सही टीचर्स चेंज पासवर्ड राउट
      await axios.put(`/api/v1/teachers/change-password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      setPasswordSuccess(true);
    } catch (err) {
      setPasswordError(err.response?.data?.message || err.message || 'पासवर्ड बदलने में त्रुटि हुई।');
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteStudent = async (e, studentId) => {
    if (e) e.stopPropagation();
    if (!window.confirm('क्या आप वाकई इस छात्र का रिकॉर्ड हमेशा के लिए डिलीट करना चाहते हैं?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/v1/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ छात्र का रिकॉर्ड सफलतापूर्वक डिलीट हो गया!');
      fetchStudentsList();
    } catch (err) {
      alert('❌ डिलीट करने में समस्या आई: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const isAdminOrHeadmaster = user.role === 'Admin' || user.role === 'Headmaster';
  const canAddStudent = isAdminOrHeadmaster || user.permissions?.includes('student-add');
  const canUpdateStudent = isAdminOrHeadmaster || user.permissions?.includes('student-update');
  const canDeleteStudent = isAdminOrHeadmaster || user.permissions?.includes('student-delete');

  const validStudents = studentsList.filter(s => s && s.name && s.name.trim() !== '');
  const filteredStudents = validStudents.filter(s => {
    const matchesClass = filterClass === 'All' || s.class === filterClass;
    const matchesSection = filterSection === 'All' || s.section === filterSection;
    const matchesStream = filterStream === 'All' || s.stream === filterStream;
    const matchesGender = filterGender === 'All' || s.gender === filterGender;
    const matchesCategory = filterCategory === 'All' || s.category === filterCategory;
    
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = query === '' || 
      (s.name && s.name.toLowerCase().includes(query)) ||
      (s.admissionNo && s.admissionNo.toLowerCase().includes(query)) ||
      (s.mobileNumber && s.mobileNumber.toLowerCase().includes(query));

    return matchesClass && matchesSection && matchesStream && matchesGender && matchesCategory && matchesSearch;
  });

  const effectiveItemsPerPage = itemsPerPage === 'all' ? filteredStudents.length || 1 : Number(itemsPerPage);
  const indexOfLastStudent = currentPage * effectiveItemsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - effectiveItemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / effectiveItemsPerPage) || 1;

  if (loadingProfile) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>लोड हो रहा है...</div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Segoe UI, sans-serif' }}>
      
      <TeacherSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <main style={{ flex: 1, padding: '30px 40px', overflowY: 'auto' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', backgroundColor: '#ffffff', padding: '20px 25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div>
            <h1 style={{ margin: 0, color: '#1e293b', fontSize: '22px' }}>👋 Welcome, {user.name}!</h1>
            <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>
              Role: <b>{user.role}</b> | Gender: <b>{user.gender}</b>
            </p>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
            <h3 style={{ color: '#334155', marginTop: 0 }}>Teacher Portal Overview</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6' }}>इस पोर्टल के माध्यम से शिक्षक अपनी कक्षाओं की उपस्थिति देख सकते हैं, छुट्टी के लिए आवेदन कर सकते हैं, अपना साप्ताहिक रूटीन देख सकते हैं, और आवंटित विषयों के परीक्षा अंक दर्ज कर सकते हैं.</p>
          </div>
        )}

        {/* 💡 My Profile & Settings Tab */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', position: 'relative' }}>
            
            {/* Profile Info & Edit Card */}
            <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#1e293b', margin: 0 }}>👤 Teacher Profile & Information</h3>
                <button 
                  onClick={() => setEditMode(!editMode)} 
                  style={{ backgroundColor: editMode ? '#64748b' : '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {!editMode ? (
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #cbd5e1' }}>
                    {user.photo ? (
                      <img src={user.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '35px' }}>🧑‍🏫</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#334155' }}>
                    <div><b>Name:</b> {user.name}</div>
                    <div><b>Email:</b> {user.email || 'Not Provided'}</div>
                    <div><b>Mobile Number:</b> {user.mobileNumber || 'Not Provided'}</div>
                    <div><b>Role:</b> {user.role}</div>
                    <div><b>Gender:</b> {user.gender}</div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Profile Photo (Max 100KB)</label>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    {profileForm.photo && <span style={{ fontSize: '12px', color: '#16a34a', display: 'block', marginTop: '4px' }}>✅ फोटो सफलतापूर्वक चुनी गई है</span>}
                  </div>

                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Name</label>
                    <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Email</label>
                    <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Mobile Number</label>
                    <input type="text" maxLength={10} value={profileForm.mobileNumber} onChange={(e) => setProfileForm({ ...profileForm, mobileNumber: e.target.value })} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>

                  <button type="submit" style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                    Save Changes
                  </button>
                </form>
              )}
            </div>

            {/* 💡 Change Password Trigger Button */}
            <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>🔒 Security Settings</h4>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>अपना पासवर्ड सुरक्षित रखने के लिए समय-समय पर बदलते रहें।</p>
              </div>
              <button 
                onClick={() => { setShowPasswordModal(true); setPasswordError(''); setPasswordSuccess(false); }}
                style={{ backgroundColor: '#ca8a04', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
              >
                Change Password ➔
              </button>
            </div>

            {/* 💡 Floating Bubble / Modal for Password Change */}
            {showPasswordModal && (
              <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}>
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '30px',
                  borderRadius: '12px',
                  width: '400px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  fontFamily: 'Segoe UI, sans-serif'
                }}>
                  <h3 style={{ color: '#1e293b', marginTop: 0, marginBottom: '15px' }}>🔒 Change Password</h3>
                  
                  {passwordSuccess ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>✅</div>
                      <p style={{ fontSize: '15px', fontWeight: '600', color: '#166534', marginBottom: '20px' }}>
                        Your password has been changed successfully.
                      </p>
                      <button 
                        onClick={() => {
                          setShowPasswordModal(false);
                          setPasswordSuccess(false);
                          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                        style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 25px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      
                      {passwordError && (
                        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}>
                          ❌ {passwordError}
                        </div>
                      )}

                      <div>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Current Password *</label>
                        <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>New Password *</label>
                        <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Confirm New Password *</label>
                        <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="submit" disabled={passLoading} style={{ backgroundColor: '#ca8a04', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', flex: 1 }}>
                          {passLoading ? 'बदल रहा है...' : 'Change Password'}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => { setShowPasswordModal(false); setPasswordError(''); }}
                          style={{ backgroundColor: '#64748b', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                        >
                          Cancel
                        </button>
                      </div>

                    </form>
                  )}

                </div>
              </div>
            )}

          </div>
        )}

        {activeTab === 'leave' && <LeaveManagement />}

        {activeTab === 'routine' && (
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
            <h3 style={{ color: '#334155', marginTop: 0 }}>📅 My Weekly Routine</h3>
            <p style={{ color: '#64748b' }}>एडमिन/हेडमास्टर द्वारा निर्धारित आपका साप्ताहिक शिक्षण समय-सारणी यहाँ प्रदर्शित होगी.</p>
          </div>
        )}

        {activeTab === 'marks' && (
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
            <h3 style={{ color: '#334155', marginTop: 0, marginBottom: '20px' }}>✍️ Student Exam Marks Entry Panel</h3>
            {loadingMappings ? <p style={{ color: '#64748b' }}>अलॉटेड क्लासेज लोड हो रही हैं...</p> : assignedMappings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {assignedMappings.map((mapItem, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Class {mapItem.className} {mapItem.stream !== 'N/A' ? `(${mapItem.stream})` : ''} - Section {mapItem.section}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}><b>Subjects:</b> {mapItem.subjects.join(', ')}</div>
                    </div>
                    <button onClick={() => navigate(`/marks-entry?class=${mapItem.className}&section=${mapItem.section}&stream=${mapItem.stream}`)} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Marks Entry ➔</button>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>आपको अभी तक कॉपी चेकिंग या मार्क्स एंट्री के लिए कोई क्लास या विषय अलॉट नहीं किया गया है.</p>}
          </div>
        )}

        {activeTab === 'students' && (
          <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '18px', color: '#1e293b', margin: 0 }}>Students Control & List Panel</h3>
              {canAddStudent && (
                <button onClick={() => navigate('/students/add')} style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                  + Add New Student
                </button>
              )}
            </div>

            {/* Filters */}
            <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '10px' }}>🔍 Search & Filter Students</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Search (Name / Mobile / Adm No)</label>
                  <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} style={{ width: '100%', padding: '6px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Filter by Class</label>
                  <select value={filterClass} onChange={(e) => { setFilterClass(e.target.value); setFilterSection('All'); setFilterStream('All'); setCurrentPage(1); }} style={{ width: '100%', padding: '6px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}>
                    <option value="All">All Classes</option>
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Filter by Stream</label>
                  <select value={filterStream} onChange={(e) => { setFilterStream(e.target.value); setCurrentPage(1); }} style={{ width: '100%', padding: '6px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}>
                    <option value="All">All Streams</option>
                    <option value="Science">Science</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Filter by Section</label>
                  <select value={filterSection} onChange={(e) => { setFilterSection(e.target.value); setCurrentPage(1); }} style={{ width: '100%', padding: '6px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}>
                    <option value="All">All Sections</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Filter by Gender</label>
                  <select value={filterGender} onChange={(e) => { setFilterGender(e.target.value); setCurrentPage(1); }} style={{ width: '100%', padding: '6px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}>
                    <option value="All">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Filter by Category</label>
                  <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }} style={{ width: '100%', padding: '6px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}>
                    <option value="All">All Categories</option>
                    <option value="General">General</option>
                    <option value="BC">BC</option>
                    <option value="EBC">EBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '14px', color: '#475569', fontWeight: '600' }}>
                Total Filtered Students: {filteredStudents.length}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                <span>Show per page:</span>
                <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value)); setCurrentPage(1); }} style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value="all">All</option>
                </select>
              </div>
            </div>

            {loadingStudents ? <p style={{ color: '#64748b' }}>छात्रों का डेटा लोड हो रहा है...</p> : currentStudents.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1500px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '13px' }}>
                      <th style={{ padding: '10px' }}>Admission No</th>
                      <th style={{ padding: '10px' }}>Student Name</th>
                      <th style={{ padding: '10px' }}>Email</th>
                      <th style={{ padding: '10px' }}>Father's Name</th>
                      <th style={{ padding: '10px' }}>Mother's Name</th>
                      <th style={{ padding: '10px' }}>Roll No</th>
                      <th style={{ padding: '10px' }}>Mobile No</th>
                      <th style={{ padding: '10px' }}>Class</th>
                      <th style={{ padding: '10px' }}>Stream</th>
                      <th style={{ padding: '10px' }}>Section</th>
                      <th style={{ padding: '10px' }}>Gender</th>
                      <th style={{ padding: '10px' }}>Category</th>
                      <th style={{ padding: '10px' }}>PEN</th>
                      <th style={{ padding: '10px' }}>APAAR</th>
                      <th style={{ padding: '10px' }}>eShikshakosh ID</th>
                      <th style={{ padding: '10px' }}>BSEB Registered</th>
                      <th style={{ padding: '10px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents.map((student) => (
                      <tr key={student._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#0f766e' }}>{student.admissionNo || '-'}</td>
                        <td style={{ padding: '10px', fontWeight: '600' }}>{student.name || student.studentName || 'N/A'}</td>
                        <td style={{ padding: '10px', color: '#0284c7' }}>{student.email || '-'}</td>
                        <td style={{ padding: '10px' }}>{student.fatherName || '-'}</td>
                        <td style={{ padding: '10px' }}>{student.motherName || '-'}</td>
                        <td style={{ padding: '10px' }}>{student.rollNo || student.roll || student.rollNumber || '-'}</td>
                        <td style={{ padding: '10px', color: '#047857', fontWeight: '600' }}>{student.mobileNumber || '-'}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{student.class || student.className || '-'}</td>
                        <td style={{ padding: '10px', fontWeight: '600' }}>{student.stream || '-'}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#8b5cf6' }}>{student.section || 'A'}</td>
                        <td style={{ padding: '10px' }}>{student.gender || '-'}</td>
                        <td style={{ padding: '10px' }}>{student.category || '-'}</td>
                        <td style={{ padding: '10px' }}>{student.pen || '-'}</td>
                        <td style={{ padding: '10px' }}>{student.apaar || '-'}</td>
                        <td style={{ padding: '10px' }}>{student.eshikshakoshID || '-'}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: student.bsebRegistered ? '#166534' : '#991b1b' }}>
                          {student.bsebRegistered ? 'Registered' : 'Pending'}
                        </td>
                        <td style={{ padding: '10px', display: 'flex', gap: '8px' }}>
                          {canUpdateStudent && (
                            <button onClick={(e) => { e.stopPropagation(); navigate(`/students/edit/${student._id}`); }} style={{ backgroundColor: '#ca8a04', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                              Edit
                            </button>
                          )}
                          {canDeleteStudent && (
                            <button onClick={(e) => handleDeleteStudent(e, student._id)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                              Delete
                            </button>
                          )}
                          {!canUpdateStudent && !canDeleteStudent && (
                            <span style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>केवल देखने की अनुमति</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p style={{ color: '#94a3b8', fontStyle: 'italic', marginTop: '15px' }}>कोई छात्र रिकॉर्ड नहीं मिला.</p>}

            {/* Bottom Pagination */}
            {filteredStudents.length > 0 && itemsPerPage !== 'all' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Showing {indexOfFirstStudent + 1} to {Math.min(indexOfLastStudent, filteredStudents.length)} of {filteredStudents.length} students
                </span>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: currentPage === 1 ? '#f1f5f9' : '#ffffff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '12px' }}>Previous</button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i + 1} onClick={() => setCurrentPage(i + 1)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: currentPage === i + 1 ? '#3b82f6' : '#ffffff', color: currentPage === i + 1 ? '#ffffff' : '#000000', cursor: 'pointer', fontSize: '12px' }}>{i + 1}</button>
                  ))}
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: (currentPage === totalPages || totalPages === 0) ? '#f1f5f9' : '#ffffff', cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer', fontSize: '12px' }}>Next</button>
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}