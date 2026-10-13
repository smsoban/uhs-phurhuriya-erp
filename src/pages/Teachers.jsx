import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Teachers() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('view'); // 'view', 'add', 'classTeacher', 'subjectMapping', 'examCopyMapping'
  const [teachersList, setTeachersList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  
  // Separate Selected Teacher IDs for tabs
  const [selectedClassTeacherId, setSelectedClassTeacherId] = useState('');
  const [selectedSubjectTeacherId, setSelectedSubjectTeacherId] = useState('');
  const [selectedExamTeacherId, setSelectedExamTeacherId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    role: 'Teacher',
    gender: 'Male',
    eshikshakoshId: '',
    appointedSubject: '',
    classGroup: '9-10',
    dateOfJoining: '',
    dateOfRetirement: '',
    phone: '',
    email: '',
    userId: '',
    password: ''
  });

  // Class Teacher Mapping State
  const [classTeacherData, setClassTeacherData] = useState({
    classTeacherOf: []
  });

  // Subjects Taught Mapping State
  const [subjectMappingData, setSubjectMappingData] = useState({
    subjectsTaught: [{ class: '9', stream: 'N/A', subjects: [''] }]
  });

  // 💡 Exam Copy Checking & Marks Entry Mapping State
  const [examMappingData, setExamMappingData] = useState({
    classMappings: [{ className: '9', stream: 'N/A', section: 'A', subjects: [''] }]
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/v1/teachers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data.data || res.data.teachers || res.data || [];
      setTeachersList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching staff data:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dateOfJoining' || name === 'dateOfRetirement') {
      let numbers = value.replace(/\D/g, '');
      if (numbers.length > 8) numbers = numbers.slice(0, 8);
      let formattedDate = numbers;
      if (numbers.length > 4) {
        formattedDate = `${numbers.slice(0, 2)}-${numbers.slice(2, 4)}-${numbers.slice(4)}`;
      } else if (numbers.length > 2) {
        formattedDate = `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
      }
      setFormData({ ...formData, [name]: formattedDate });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Class Teacher Handlers
  const handleAddClassTeacherRow = () => {
    setClassTeacherData({ ...classTeacherData, classTeacherOf: [...classTeacherData.classTeacherOf, { class: '9', section: 'A' }] });
  };
  const handleRemoveClassTeacherRow = (index) => {
    setClassTeacherData({ ...classTeacherData, classTeacherOf: classTeacherData.classTeacherOf.filter((_, i) => i !== index) });
  };
  const handleClassTeacherChange = (index, field, value) => {
    const updated = [...classTeacherData.classTeacherOf];
    updated[index][field] = value;
    setClassTeacherData({ ...classTeacherData, classTeacherOf: updated });
  };

  // Subjects Taught Handlers
  const handleAddSubjectRow = () => {
    setSubjectMappingData({ ...subjectMappingData, subjectsTaught: [...subjectMappingData.subjectsTaught, { class: '9', stream: 'N/A', subjects: [''] }] });
  };
  const handleRemoveSubjectRow = (index) => {
    setSubjectMappingData({ ...subjectMappingData, subjectsTaught: subjectMappingData.subjectsTaught.filter((_, i) => i !== index) });
  };
  const handleSubjectRowChange = (index, field, value) => {
    const updated = [...subjectMappingData.subjectsTaught];
    if (field === 'subjects') {
      updated[index].subjects = value.split(',').map(s => s.trim());
    } else {
      updated[index][field] = value;
    }
    setSubjectMappingData({ ...subjectMappingData, subjectsTaught: updated });
  };

  // 💡 Exam Copy Checking Mapping Handlers
  const handleAddExamMappingRow = () => {
    setExamMappingData({
      ...examMappingData,
      classMappings: [...examMappingData.classMappings, { className: '9', stream: 'N/A', section: 'A', subjects: [''] }]
    });
  };

  const handleRemoveExamMappingRow = (index) => {
    setExamMappingData({
      ...examMappingData,
      classMappings: examMappingData.classMappings.filter((_, i) => i !== index)
    });
  };

  // 💡 Exam Copy Checking Mapping Handler (Updated to allow spaces while typing)
  const handleExamMappingRowChange = (index, field, value) => {
    const updated = [...examMappingData.classMappings];
    if (field === 'subjects') {
      // टाइप करते समय सीधे स्ट्रिंग स्टोर करें ताकि स्पेस देने में कोई दिक्कत न आए
      updated[index].subjects = value; 
    } else {
      updated[index][field] = value;
    }
    setExamMappingData({ ...examMappingData, classMappings: updated });
  };

  // Select Teacher for Class Teacher Tab
  const handleSelectClassTeacher = (e) => {
    const tId = e.target.value;
    setSelectedClassTeacherId(tId);
    const teacher = teachersList.find(t => t._id === tId);
    if (teacher) {
      setClassTeacherData({ classTeacherOf: teacher.classTeacherOf || [] });
    } else {
      setClassTeacherData({ classTeacherOf: [] });
    }
  };

  // Select Teacher for Subject Mapping Tab
  const handleSelectSubjectTeacher = (e) => {
    const tId = e.target.value;
    setSelectedSubjectTeacherId(tId);
    const teacher = teachersList.find(t => t._id === tId);
    if (teacher) {
      setSubjectMappingData({
        subjectsTaught: teacher.subjectsTaught?.length ? teacher.subjectsTaught : [{ class: '9', stream: 'N/A', subjects: [''] }]
      });
    } else {
      setSubjectMappingData({ subjectsTaught: [{ class: '9', stream: 'N/A', subjects: [''] }] });
    }
  };

  // 💡 Select Teacher for Exam Mapping Tab & Fetch Existing Data
  const handleSelectExamTeacher = async (e) => {
    const tId = e.target.value;
    setSelectedExamTeacherId(tId);
    if (!tId) {
      setExamMappingData({ classMappings: [{ className: '9', stream: 'N/A', section: 'A', subjects: [''] }] });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/v1/exam-mappings?teacherId=${tId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.data && res.data.data.length > 0) {
        // डेटा फेच करते वक्त subjects को यदि एरे है तो join(', ') बना लें या as it is रखें
        const formattedMappings = res.data.data[0].classMappings.map(cm => ({
          ...cm,
          subjects: Array.isArray(cm.subjects) ? cm.subjects.join(', ') : cm.subjects
        }));
        setExamMappingData({ classMappings: formattedMappings });
      } else {
        setExamMappingData({ classMappings: [{ className: '9', stream: 'N/A', section: 'A', subjects: [''] }] });
      }
    } catch (err) {
      console.error('Error fetching exam mapping:', err);
    }
  };

  const handleEditClick = (teacher) => {
    setEditingId(teacher._id);
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) return dateString;
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    setFormData({
      name: teacher.name || '',
      role: teacher.role || 'Teacher',
      gender: teacher.gender || 'Male',
      eshikshakoshId: teacher.eshikshakoshId || '',
      appointedSubject: teacher.appointedSubject || '',
      classGroup: teacher.classGroup || '9-10',
      dateOfJoining: formatDateForInput(teacher.dateOfJoining),
      dateOfRetirement: formatDateForInput(teacher.dateOfRetirement),
      phone: teacher.phone || '',
      email: teacher.email || '',
      userId: teacher.userId || '',
      password: ''
    });
    setActiveTab('add');
  };

  const handleSaveClassTeacher = async (e) => {
    e.preventDefault();
    if (!selectedClassTeacherId) {
      alert('कृपया पहले शिक्षक चुनें!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/v1/teachers/${selectedClassTeacherId}`, classTeacherData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Class Teacher assignment successfully updated!');
      fetchTeachers();
      setActiveTab('view');
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSaveSubjectMapping = async (e) => {
    e.preventDefault();
    if (!selectedSubjectTeacherId) {
      alert('कृपया पहले शिक्षक चुनें!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const payload = {
        subjectsTaught: subjectMappingData.subjectsTaught.map(st => ({
          ...st,
          subjects: Array.isArray(st.subjects) ? st.subjects.filter(s => s !== '') : []
        }))
      };
      await axios.put(`/api/v1/teachers/${selectedSubjectTeacherId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Subject mapping successfully updated!');
      fetchTeachers();
      setActiveTab('view');
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    }
  };

  // 💡 Save Exam Copy Checking Mapping API Call (Updated to split subjects correctly on save)
  const handleSaveExamMapping = async (e) => {
    e.preventDefault();
    if (!selectedExamTeacherId) {
      alert('कृपया पहले शिक्षक चुनें!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const payload = {
        teacherId: selectedExamTeacherId,
        classMappings: examMappingData.classMappings.map(cm => ({
          ...cm,
          subjects: typeof cm.subjects === 'string'
            ? cm.subjects.split(',').map(s => s.trim()).filter(s => s !== '')
            : (Array.isArray(cm.subjects) ? cm.subjects : [cm.subjects])
        }))
      };
      await axios.post('/api/v1/exam-mappings', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Exam copy checking mapping successfully saved!');
      setActiveTab('view');
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddOrUpdateStaff = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.userId) {
      alert('कृपया नाम, फ़ोन नंबर और User ID भरें।');
      return;
    }
    
    if ((formData.role === 'Teacher' || formData.role === 'Headmaster') && !formData.eshikshakoshId) {
      alert(`${formData.role} के लिए eShikshakosh ID अनिवार्य है!`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = { ...formData };
      
      if (payload.role === 'Clerk' || !payload.eshikshakoshId) {
        delete payload.eshikshakoshId;
      }

      if (editingId) {
        delete payload.password;
        await axios.put(`/api/v1/teachers/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('✅ स्टाफ डिटेल्स सफलतापूर्वक अपडेट कर दी गई हैं!');
      } else {
        if (!formData.password) {
          alert('नया स्टाफ जोड़ते समय Password अनिवार्य है!');
          return;
        }
        await axios.post('/api/v1/teachers', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('✅ स्टाफ सफलतापूर्वक जोड़ा गया!');
      }

      setEditingId(null);
      setFormData({
        name: '', role: 'Teacher', gender: 'Male', eshikshakoshId: '', appointedSubject: '', classGroup: '9-10',
        dateOfJoining: '', dateOfRetirement: '', phone: '', email: '', userId: '', password: ''
      });
      fetchTeachers();
      setActiveTab('view');
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`क्या आप वाकई ${name} को हटाना चाहते हैं?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/v1/teachers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ स्टाफ सफलतापूर्वक हटा दिया गया है!');
      fetchTeachers();
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const teachersOnlyList = teachersList.filter(t => t.role === 'Teacher');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Segoe UI, sans-serif' }}>
    
      <main style={{ flex: 1, padding: '30px 40px', overflowY: 'auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>👩‍🏫 Teachers & Staff Management</h1>

        {/* Top Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
          <button onClick={() => { setActiveTab('view'); setEditingId(null); }} style={{ padding: '10px 16px', backgroundColor: activeTab === 'view' ? '#3b82f6' : '#fff', color: activeTab === 'view' ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
            📋 View Staff List ({teachersList.length})
          </button>
          <button 
            onClick={() => { 
              setActiveTab('add'); 
              setEditingId(null);
              setFormData({
                name: '',
                role: 'Teacher',
                gender: 'Male',
                eshikshakoshId: '',
                appointedSubject: '',
                classGroup: '9-10',
                dateOfJoining: '',
                dateOfRetirement: '',
                phone: '',
                email: '',
                userId: '',
                password: ''
              });
            }} 
            style={{ padding: '10px 16px', backgroundColor: activeTab === 'add' ? '#3b82f6' : '#fff', color: activeTab === 'add' ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
          >
            + Add Teacher / Staff
          </button>
          <button onClick={() => { setActiveTab('classTeacher'); setSelectedClassTeacherId(''); setClassTeacherData({ classTeacherOf: [] }); }} style={{ padding: '10px 16px', backgroundColor: activeTab === 'classTeacher' ? '#8b5cf6' : '#fff', color: activeTab === 'classTeacher' ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
            👨‍🏫 Class Teacher Assignment
          </button>
          <button onClick={() => { setActiveTab('subjectMapping'); setSelectedSubjectTeacherId(''); setSubjectMappingData({ subjectsTaught: [{ class: '9', stream: 'N/A', subjects: [''] }] }); }} style={{ padding: '10px 16px', backgroundColor: activeTab === 'subjectMapping' ? '#0ea5e9' : '#fff', color: activeTab === 'subjectMapping' ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
            📚 Subject Mapping
          </button>
          {/* 💡 Exam Copy Checking Mapping Tab Button */}
          <button onClick={() => { setActiveTab('examCopyMapping'); setSelectedExamTeacherId(''); setExamMappingData({ classMappings: [{ className: '9', stream: 'N/A', section: 'A', subjects: [''] }] }); }} style={{ padding: '10px 16px', backgroundColor: activeTab === 'examCopyMapping' ? '#10b981' : '#fff', color: activeTab === 'examCopyMapping' ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
            📝 Exam Copy Checking Mapping
          </button>
        </div>

        {/* TAB 1: VIEW STAFF LIST */}
        {activeTab === 'view' && (
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '14px' }}>
                  <th style={{ padding: '12px' }}>Name & Gender</th>
                  <th style={{ padding: '12px' }}>Role</th>
                  <th style={{ padding: '12px' }}>Appointed Subject</th>
                  <th style={{ padding: '12px' }}>Class Teacher Of</th>
                  <th style={{ padding: '12px' }}>Subjects Taught</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachersList.length > 0 ? (
                  teachersList.map((item, index) => (
                    <tr key={item._id || index} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#334155' }}>
                      <td style={{ padding: '12px', fontWeight: '600' }}>
                        {item.name} 
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>
                          {item.gender ? `Gender: ${item.gender}` : ''} {item.eshikshakoshId ? `| ID: ${item.eshikshakoshId}` : ''}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}><span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', backgroundColor: '#dcfce7', color: '#166534' }}>{item.role}</span></td>
                      <td style={{ padding: '12px' }}>{item.appointedSubject ? `${item.appointedSubject} (${item.classGroup})` : 'N/A'}</td>
                      <td style={{ padding: '12px' }}>{item.classTeacherOf?.length > 0 ? item.classTeacherOf.map((ct, i) => <div key={i}>Class {ct.class} - Sec {ct.section}</div>) : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not Assigned</span>}</td>
                      <td style={{ padding: '12px' }}>{item.subjectsTaught?.length > 0 ? item.subjectsTaught.map((st, i) => <div key={i} style={{ fontSize: '12px' }}><b>Cl {st.class}:</b> {st.subjects.join(', ')}</div>) : 'N/A'}</td>
                      <td style={{ padding: '12px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <button onClick={() => handleEditClick(item)} style={{ backgroundColor: '#f59e0b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✏️ Edit</button>
                        <button onClick={() => handleDelete(item._id, item.name)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>कोई रिकॉर्ड नहीं मिला।</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: ADD / EDIT BASIC DETAILS */}
        {activeTab === 'add' && (
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)', maxWidth: '800px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>{editingId ? '✏️ Edit Staff Basic Details' : 'नया स्टाफ जोड़ें'}</h3>
            <form onSubmit={handleAddOrUpdateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '5px' }}>Role *</label>
                  <select name="role" value={formData.role} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="Teacher">Teacher</option>
                    <option value="Headmaster">Headmaster</option>
                    <option value="Clerk">Clerk</option>
                  </select>
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '5px' }}>Gender (लिंग) *</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '5px' }}>Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
              </div>

              {(formData.role === 'Teacher' || formData.role === 'Headmaster') && (
                <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '5px' }}>eShikshakosh ID *</label>
                    <input type="text" name="eshikshakoshId" value={formData.eshikshakoshId} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }} required />
                  </div>

                  {formData.role === 'Teacher' && (
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '5px' }}>Appointed Subject (बहाली का विषय)</label>
                        <input type="text" name="appointedSubject" value={formData.appointedSubject} onChange={handleInputChange} placeholder="e.g. Mathematics" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '5px' }}>Class Group</label>
                        <select name="classGroup" value={formData.classGroup} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <option value="9-10">9-10</option>
                          <option value="11-12">11-12</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}><label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Date of Joining *</label><input type="text" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleInputChange} placeholder="DD-MM-YYYY" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required /></div>
                <div style={{ flex: 1 }}><label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Date of Retirement *</label><input type="text" name="dateOfRetirement" value={formData.dateOfRetirement} onChange={handleInputChange} placeholder="DD-MM-YYYY" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required /></div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}><label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Phone *</label><input type="text" name="phone" value={formData.phone} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required /></div>
                <div style={{ flex: 1 }}><label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Email *</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required /></div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}><label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>User ID *</label><input type="text" name="userId" value={formData.userId} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required /></div>
                {!editingId && <div style={{ flex: 1 }}><label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Password *</label><input type="password" name="password" value={formData.password} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required /></div>}
              </div>

              <button type="submit" style={{ marginTop: '15px', padding: '12px', backgroundColor: editingId ? '#f59e0b' : '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                {editingId ? '💾 Update Staff Details' : '+ Save & Register Member'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: CLASS TEACHER ASSIGNMENT TAB */}
        {activeTab === 'classTeacher' && (
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)', maxWidth: '800px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>👨‍🏫 Class Teacher Assignment</h3>
            
            <div style={{ marginBottom: '20px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Select Teacher (शिक्षक चुनें) *</label>
              <select 
                value={selectedClassTeacherId} 
                onChange={handleSelectClassTeacher}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff', fontWeight: 'bold' }}
              >
                <option value="">-- शिक्षक चुनें --</option>
                {teachersOnlyList.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.name} {t.appointedSubject ? `(Subject: ${t.appointedSubject})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedClassTeacherId && (
              <form onSubmit={handleSaveClassTeacher} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#334155' }}>Assign Classes & Sections</h4>
                  {classTeacherData.classTeacherOf.map((ct, index) => (
                    <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                      <select value={ct.class} onChange={(e) => handleClassTeacherChange(index, 'class', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: 1 }}>
                        <option value="9">Class 9</option><option value="10">Class 10</option><option value="11">Class 11</option><option value="12">Class 12</option>
                      </select>
                      <input type="text" placeholder="Section (A, B)" value={ct.section} onChange={(e) => handleClassTeacherChange(index, 'section', e.target.value.toUpperCase())} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '120px' }} />
                      <button type="button" onClick={() => handleRemoveClassTeacherRow(index)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddClassTeacherRow} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>+ Add Class Teacher Role</button>
                </div>

                <button type="submit" style={{ padding: '12px', backgroundColor: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                  💾 Save Class Teacher Assignment
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 4: SUBJECT MAPPING TAB */}
        {activeTab === 'subjectMapping' && (
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)', maxWidth: '800px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>📚 Subject Mapping</h3>
            
            <div style={{ marginBottom: '20px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Select Teacher (शिक्षक चुनें) *</label>
              <select 
                value={selectedSubjectTeacherId} 
                onChange={handleSelectSubjectTeacher}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff', fontWeight: 'bold' }}
              >
                <option value="">-- शिक्षक चुनें --</option>
                {teachersOnlyList.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.name} {t.appointedSubject ? `(Subject: ${t.appointedSubject})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedSubjectTeacherId && (
              <form onSubmit={handleSaveSubjectMapping} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#334155' }}>Subjects Taught Mapping (वर्तमान में पढ़ाये जाने वाले विषय)</h4>
                  {subjectMappingData.subjectsTaught.map((st, index) => (
                    <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <select value={st.class} onChange={(e) => handleSubjectRowChange(index, 'class', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        <option value="9">Class 9</option><option value="10">Class 10</option><option value="11">Class 11</option><option value="12">Class 12</option>
                      </select>
                      {(st.class === '11' || st.class === '12') && (
                        <select value={st.stream} onChange={(e) => handleSubjectRowChange(index, 'stream', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <option value="Science">Science</option><option value="Arts">Arts</option>
                        </select>
                      )}
                      <input type="text" placeholder="Subjects (Comma separated e.g. Math, Physics)" value={st.subjects.join(', ')} onChange={(e) => handleSubjectRowChange(index, 'subjects', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: 1, minWidth: '200px' }} />
                      <button type="button" onClick={() => handleRemoveSubjectRow(index)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddSubjectRow} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>+ Add Subject Mapping</button>
                </div>

                <button type="submit" style={{ padding: '12px', backgroundColor: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                  💾 Save Subject Mapping
                </button>
              </form>
            )}
          </div>
        )}

        {/* 💡 TAB 5: EXAM COPY CHECKING MAPPING TAB */}
        {activeTab === 'examCopyMapping' && (
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)', maxWidth: '900px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>📝 Exam Copy Checking & Marks Entry Mapping</h3>
            
            <div style={{ marginBottom: '20px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Select Teacher (शिक्षक चुनें) *</label>
              <select 
                value={selectedExamTeacherId} 
                onChange={handleSelectExamTeacher}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff', fontWeight: 'bold' }}
              >
                <option value="">-- शिक्षक चुनें --</option>
                {teachersOnlyList.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.name} {t.eshikshakoshId ? `(ID: ${t.eshikshakoshId})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedExamTeacherId && (
              <form onSubmit={handleSaveExamMapping} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', color: '#334155' }}>Classes, Sections & Subjects for Copy Checking</h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>आप किसी भी क्लास या सेक्शन की रो को हटा सकते हैं या बदल सकते हैं</span>
                  </div>

                  {examMappingData.classMappings.map((cm, index) => (
                    <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Class</label>
                        <select value={cm.className} onChange={(e) => handleExamMappingRowChange(index, 'className', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <option value="9">Class 9</option><option value="10">Class 10</option><option value="11">Class 11</option><option value="12">Class 12</option>
                        </select>
                      </div>

                      {(cm.className === '11' || cm.className === '12') && (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <label style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Stream</label>
                          <select value={cm.stream} onChange={(e) => handleExamMappingRowChange(index, 'stream', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                            <option value="Science">Science</option><option value="Arts">Arts</option><option value="N/A">N/A</option>
                          </select>
                        </div>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Section</label>
                        <input type="text" placeholder="A, B" value={cm.section} onChange={(e) => handleExamMappingRowChange(index, 'section', e.target.value.toUpperCase())} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '80px' }} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '180px' }}>
                        <label style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Subjects (Comma separated)</label>
                        <input 
                          type="text" 
                          placeholder="Math, Social Science" 
                          value={typeof cm.subjects === 'string' ? cm.subjects : (Array.isArray(cm.subjects) ? cm.subjects.join(', ') : '')} 
                          onChange={(e) => handleExamMappingRowChange(index, 'subjects', e.target.value)} 
                          style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                        />
                      </div>

                      {/* 💡 विशिष्ट क्लास/सेक्शन या रो को हटाने के लिए */}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveExamMappingRow(index)} 
                        title="इस रो को हटाएं"
                        style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '16px' }}
                      >
                        🗑️ Remove Row
                      </button>
                    </div>
                  ))}

                  <button type="button" onClick={handleAddExamMappingRow} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginTop: '5px' }}>
                    + Add Another Class/Section Row
                  </button>
                </div>

                <button type="submit" style={{ padding: '12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                  💾 Save Changes (Update Mapping)
                </button>
              </form>
            )}
          </div>
        )}

      </main>
    </div>
  );
}