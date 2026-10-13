import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [csvFile, setCsvFile] = useState(null);

  // Database-backed Class/Stream-wise Section State
  const [classSections, setClassSections] = useState({
    '9-N/A': ['A'],
    '10-N/A': ['A'],
    '11-Science': ['A'],
    '11-Arts': ['A'],
    '12-Science': ['A'],
    '12-Arts': ['A']
  });

  // Section Management Tab States
  const [sectionMgmtClass, setSectionMgmtClass] = useState('9');
  const [sectionMgmtStream, setSectionMgmtStream] = useState('Science');
  const [newSectionInput, setNewSectionInput] = useState('');

  // activeTab State ('view', 'add', 'sections')
  const [activeTab, setActiveTab] = useState('view');

  // Filter & Search States
  const [filterClass, setFilterClass] = useState('All');
  const [filterSection, setFilterSection] = useState('All');
  const [filterStream, setFilterStream] = useState('All');
  const [filterGender, setFilterGender] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    fatherName: '',
    motherName: '',
    rollNo: '',
    mobileNumber: '', 
    gender: 'Male',
    class: '9',
    section: 'A',
    stream: 'Science',
    category: 'General',
    pen: '',
    apaar: '',
    eshikshakoshID: '',
    registrationNo: '',
    admissionNo: '',
    admissionDate: '',
    bsebRegistered: false
  });

  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/v1/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const studentData = res.data.data || res.data.students || res.data || [];
      setStudents(Array.isArray(studentData) ? studentData : []);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/v1/students/sections', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success && res.data.data) {
        const secMap = {
          '9-N/A': [], '10-N/A': [],
          '11-Science': [], '11-Arts': [],
          '12-Science': [], '12-Arts': []
        };

        res.data.data.forEach(item => {
          const cls = item.className || item.class;
          const streamVal = item.stream && item.stream !== 'N/A' ? item.stream : 'N/A';
          const key = (cls === '11' || cls === '12') ? `${cls}-${streamVal}` : `${cls}-N/A`;

          if (secMap[key]) {
            secMap[key].push(item.name || item.section);
          }
        });

        Object.keys(secMap).forEach(k => {
          secMap[k] = [...new Set(secMap[k])].sort();
          if (secMap[k].length === 0) secMap[k] = ['A'];
        });

        setClassSections(secMap);
      }
    } catch (err) {
      console.error('Error fetching sections:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchSections();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'pen' && value.length > 11) return;
    if (name === 'apaar' && value.length > 12) return;
    if (name === 'eshikshakoshID' && value.length > 15) return;
    if (name === 'mobileNumber' && value.length > 10) return;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'class') {
      const isSenior = value === '11' || value === '12';
      const currentStream = isSenior ? formData.stream : 'N/A';
      const key = isSenior ? `${value}-${currentStream}` : `${value}-N/A`;
      const availableSecs = classSections[key] || ['A'];

      setFormData(prev => ({
        ...prev,
        class: value,
        section: availableSecs.includes(prev.section) ? prev.section : availableSecs[0],
        stream: isSenior ? (prev.stream === 'N/A' ? 'Science' : prev.stream) : 'N/A'
      }));
    } else if (name === 'stream') {
      const key = `${formData.class}-${value}`;
      const availableSecs = classSections[key] || ['A'];
      setFormData(prev => ({
        ...prev,
        stream: value,
        section: availableSecs.includes(prev.section) ? prev.section : availableSecs[0]
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    const cleanSection = newSectionInput.trim().toUpperCase();

    if (!cleanSection) return;
    if (!/^[A-Z]$/.test(cleanSection)) {
      alert('⚠️ Section केवल Alphabetical Character (जैसे A, B, C, D) ही होना चाहिए!');
      return;
    }

    const isSenior = sectionMgmtClass === '11' || sectionMgmtClass === '12';
    const targetStream = isSenior ? sectionMgmtStream : 'N/A';

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/v1/students/sections', {
        className: sectionMgmtClass,
        stream: targetStream,
        name: cleanSection
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`✅ Class ${sectionMgmtClass} ${isSenior ? `(${targetStream})` : ''} में Section '${cleanSection}' स्थायी रूप से जोड़ दिया गया है!`);
      setNewSectionInput('');
      fetchSections();
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteSection = async (secToDelete) => {
    if (secToDelete === 'A') {
      alert("⚠️ Default Section 'A' को डिलीट नहीं किया जा सकता!");
      return;
    }

    const isSenior = sectionMgmtClass === '11' || sectionMgmtClass === '12';
    const targetStream = isSenior ? sectionMgmtStream : 'N/A';

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/v1/students/sections/${sectionMgmtClass}/${secToDelete}?stream=${targetStream}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`🗑️ Section '${secToDelete}' स्थायी रूप से हटा दिया गया है!`);
      fetchSections();
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const submitData = {
        ...formData,
        stream: (formData.class === '11' || formData.class === '12') ? formData.stream : 'N/A'
      };

      if (editingId) {
        await axios.put(`/api/v1/students/${editingId}`, submitData, config);
        alert('✅ Student Updated Successfully!');
        setEditingId(null);
      } else {
        await axios.post('/api/v1/students', submitData, config);
        alert('✅ Student Added Successfully! (Default Password: 123456)');
      }

      setFormData({
        name: '', email: '', fatherName: '', motherName: '', rollNo: '', mobileNumber: '',
        gender: 'Male', class: '9', section: 'A', stream: 'Science', category: 'General',
        pen: '', apaar: '', eshikshakoshID: '',
        registrationNo: '', admissionNo: '', admissionDate: '', bsebRegistered: false
      });
      fetchStudents();
      setActiveTab('view');
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCSVUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      alert('Please select a CSV file first!');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('file', csvFile);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/v1/students/import-csv', uploadData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert(`✅ ${res.data.message}`);
      setCsvFile(null);
      fetchStudents();
      setActiveTab('view');
    } catch (err) {
      alert('❌ CSV Import Failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        class: filterClass,
        section: filterSection,
        stream: filterStream,
        gender: filterGender,
        category: filterCategory,
        search: searchQuery
      });

      const response = await axios.get(`/api/v1/students/export-csv?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'filtered_students_list.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('❌ CSV export karne mein samasya aayi!');
    }
  };

  const handleResetPassword = async (studentId, studentName) => {
    if (!window.confirm(`क्या आप वाकई छात्र '${studentName}' का पासवर्ड रीसेट करके 123456 करना चाहते हैं?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/v1/students/${studentId}/reset-password`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`✅ ${res.data.message}`);
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (student) => {
    setEditingId(student._id);
    const stuClass = student.class || '9';
    const stuStream = (stuClass === '11' || stuClass === '12') ? (student.stream || 'Science') : 'N/A';
    const key = (stuClass === '11' || stuClass === '12') ? `${stuClass}-${stuStream}` : `${stuClass}-N/A`;
    const availableSecs = classSections[key] || ['A'];

    setFormData({
      name: student.name || '',
      email: student.email || '',
      fatherName: student.fatherName || '',
      motherName: student.motherName || '',
      rollNo: student.rollNo || '',
      mobileNumber: student.mobileNumber || '',
      gender: student.gender || 'Male',
      class: stuClass,
      section: student.section || availableSecs[0],
      stream: stuStream,
      category: student.category || 'General',
      pen: student.pen || '',
      apaar: student.apaar || '',
      eshikshakoshID: student.eshikshakoshID || '',
      registrationNo: student.registrationNo || '',
      admissionNo: student.admissionNo || '',
      admissionDate: student.admissionDate || '',
      bsebRegistered: student.bsebRegistered || false
    });
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/v1/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('🗑️ Student Deleted Successfully!');
      fetchStudents();
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.message || 'Permission denied'));
    }
  };

  const validStudents = students.filter(s => s && s.name && s.name.trim() !== '');

  const filteredStudents = validStudents.filter(s => {
    const matchesClass = filterClass === 'All' || s.class === filterClass;
    const matchesSection = filterSection === 'All' || s.section === filterSection;
    const matchesStream = filterStream === 'All' || s.stream === filterStream;
    const matchesGender = filterGender === 'All' || s.gender === filterGender;
    const matchesCategory = filterCategory === 'All' || s.category === filterCategory;
    
    const matchesSearch = searchQuery.trim() === '' || 
      (s.admissionNo && s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.eshikshakoshID && s.eshikshakoshID.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesClass && matchesSection && matchesStream && matchesGender && matchesCategory && matchesSearch;
  });

  const effectiveItemsPerPage = itemsPerPage === 'all' ? filteredStudents.length || 1 : Number(itemsPerPage);
  const indexOfLastStudent = currentPage * effectiveItemsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - effectiveItemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / effectiveItemsPerPage) || 1;

  const formKey = (formData.class === '11' || formData.class === '12') ? `${formData.class}-${formData.stream}` : `${formData.class}-N/A`;
  const currentAvailableSections = classSections[formKey] || ['A'];

  const mgmtKey = (sectionMgmtClass === '11' || sectionMgmtClass === '12') ? `${sectionMgmtClass}-${sectionMgmtStream}` : `${sectionMgmtClass}-N/A`;
  const currentMgmtSections = classSections[mgmtKey] || ['A'];

  const filterAvailableSections = filterClass !== 'All' 
    ? Array.from(new Set(Object.keys(classSections).filter(k => k.startsWith(filterClass)).map(k => classSections[k]).flat())).sort()
    : Array.from(new Set(Object.values(classSections).flat())).sort();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
      {/*<Sidebar />*/}

      <main style={{ flex: 1, padding: '30px', overflowX: 'auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>👨‍🎓 Students Management</h1>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #cbd5e1', paddingBottom: '10px', flexWrap: 'wrap' }}>
        <button 
  onClick={() => {
    setActiveTab('view');
    setEditingId(null); // 👈 यह सुनिश्चित करेगा कि एडिट मोड बंद हो जाए
    setFormData({
      name: '', email: '', fatherName: '', motherName: '', rollNo: '', mobileNumber: '',
      gender: 'Male', class: '9', section: 'A', stream: 'Science', category: 'General',
      pen: '', apaar: '', eshikshakoshID: '',
      registrationNo: '', admissionNo: '', admissionDate: '', bsebRegistered: false
    });
  }} 
  style={{ 
    padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
    backgroundColor: activeTab === 'view' ? '#3b82f6' : '#ffffff',
    color: activeTab === 'view' ? '#ffffff' : '#64748b'
  }}
>
  👁️ View Students List ({validStudents.length})
</button>
          
          <button 
            onClick={() => {
              if (activeTab === 'add' && editingId) {
                setEditingId(null);
                setFormData({
                  name: '', email: '', fatherName: '', motherName: '', rollNo: '', mobileNumber: '',
                  gender: 'Male', class: '9', section: 'A', stream: 'Science', category: 'General',
                  pen: '', apaar: '', eshikshakoshID: '',
                  registrationNo: '', admissionNo: '', admissionDate: '', bsebRegistered: false
                });
              }
              setActiveTab('add');
            }} 
            style={{ 
              padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
              backgroundColor: activeTab === 'add' ? '#3b82f6' : '#ffffff',
              color: activeTab === 'add' ? '#ffffff' : '#64748b'
            }}
          >
            {editingId ? '✏️ Edit Student' : '➕ Add Student / Bulk Import'}
          </button>

          <button 
            onClick={() => setActiveTab('sections')} 
            style={{ 
              padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
              backgroundColor: activeTab === 'sections' ? '#8b5cf6' : '#ffffff',
              color: activeTab === 'sections' ? '#ffffff' : '#64748b'
            }}
          >
            ⚙️ Section Management
          </button>
        </div>

        {/* TAB 1: ADD STUDENT & BULK IMPORT */}
        {activeTab === 'add' && (
          <>
            <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' }}>
                {editingId ? '✏️ छात्र की जानकारी एडिट करें' : '➕ नया छात्र जोड़ें'}
              </h3>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', alignItems: 'end' }}>
                
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Student Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Email (Login ID) *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="student@gmail.com" style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  <small style={{ color: '#64748b' }}>Default Password: <b>123456</b></small>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Father's Name *</label>
                  <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Mother's Name *</label>
                  <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Roll No *</label>
                  <input type="text" name="rollNo" value={formData.rollNo} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Mobile Number (10 Digit) *</label>
                  <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="10-digit mobile" maxLength={10} required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Gender *</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Class *</label>
                  <select name="class" value={formData.class} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>

                {(formData.class === '11' || formData.class === '12') && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#2563eb' }}>Stream (Sci/Arts) *</label>
                    <select name="stream" value={formData.stream} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '2px solid #3b82f6', backgroundColor: '#eff6ff', fontWeight: 'bold' }}>
                      <option value="Science">Science</option>
                      <option value="Arts">Arts</option>
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Section *</label>
                  <select name="section" value={formData.section} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    {currentAvailableSections.map((sec, idx) => (
                      <option key={idx} value={sec}>Section {sec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="General">General</option>
                    <option value="BC">BC</option>
                    <option value="EBC">EBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>PEN (Optional - Max 11 Digit)</label>
                  <input type="text" name="pen" value={formData.pen} onChange={handleChange} maxLength={11} placeholder="11 digit PEN" style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>APAAR (Optional - Max 12 Digit)</label>
                  <input type="text" name="apaar" value={formData.apaar} onChange={handleChange} maxLength={12} placeholder="12 digit APAAR" style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>eShikshakosh ID (Opt. - Max 15)</label>
                  <input type="text" name="eshikshakoshID" value={formData.eshikshakoshID} onChange={handleChange} maxLength={15} placeholder="15 digit ID" style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Registration No (Opt.)</label>
                  <input type="text" name="registrationNo" value={formData.registrationNo} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Admission No *</label>
                  <input type="text" name="admissionNo" value={formData.admissionNo} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Admission Date (DD-MM-YYYY) *</label>
                  <input type="text" name="admissionDate" value={formData.admissionDate} onChange={handleChange} placeholder="DD-MM-YYYY" required maxLength={10} style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
                  <input 
                    type="checkbox" 
                    name="bsebRegistered" 
                    id="bsebRegistered"
                    checked={formData.bsebRegistered} 
                    onChange={handleChange} 
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }} 
                  />
                  <label htmlFor="bsebRegistered" style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b', cursor: 'pointer' }}>
                    BSEB Registered
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px', gridColumn: '1 / -1' }}>
                  <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                    {editingId ? 'Update Student' : '+ Add Student'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={() => { setEditingId(null); setActiveTab('view'); setFormData({ name: '', email: '', fatherName: '', motherName: '', rollNo: '', mobileNumber: '', gender: 'Male', class: '9', section: 'A', stream: 'Science', category: 'General', pen: '', apaar: '', eshikshakoshID: '', registrationNo: '', admissionNo: '', admissionDate: '', bsebRegistered: false }); }} style={{ padding: '10px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' }}>📁 CSV फाइल से एक साथ छात्र जोड़ें (Bulk Import)</h3>
              <form onSubmit={handleCSVUpload} style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                  Upload & Import CSV
                </button>
              </form>
            </div>
          </>
        )}

        {/* TAB 2: VIEW STUDENTS WITH FILTERS */}
        {activeTab === 'view' && (
          <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            
            <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '10px' }}>🔍 Filter & Search Students</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Search (Name / Adm No / eShikshakosh)</label>
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchQuery} 
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
                    style={{ width: '100%', padding: '6px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Filter by Class</label>
                  <select value={filterClass} onChange={(e) => { setFilterClass(e.target.value); setFilterSection('All'); setFilterStream('All'); setCurrentPage(1); }} style={{ width: '100%', padding: '6px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option value="All">All Classes</option>
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Filter by Stream</label>
                  <select value={filterStream} onChange={(e) => { setFilterStream(e.target.value); setCurrentPage(1); }} style={{ width: '100%', padding: '6px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option value="All">All Streams</option>
                    <option value="Science">Science</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Filter by Section</label>
                  <select value={filterSection} onChange={(e) => { setFilterSection(e.target.value); setCurrentPage(1); }} style={{ width: '100%', padding: '6px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option value="All">All Sections</option>
                    {filterAvailableSections.map((sec, idx) => (
                      <option key={idx} value={sec}>Section {sec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Filter by Gender</label>
                  <select value={filterGender} onChange={(e) => { setFilterGender(e.target.value); setCurrentPage(1); }} style={{ width: '100%', padding: '6px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option value="All">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Filter by Category</label>
                  <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }} style={{ width: '100%', padding: '6px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option value="All">All Categories</option>
                    <option value="General">General</option>
                    <option value="BC">BC</option>
                    <option value="EBC">EBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>

              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                Registered Students List (Found: {filteredStudents.length})
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <button 
                  onClick={handleExportCSV} 
                  style={{ backgroundColor: '#10b981', color: '#fff', padding: '8px 14px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  📥 Export Filtered CSV
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                  <span>Show per page:</span>
                  <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value)); setCurrentPage(1); }} style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={100}>100</option>
                    <option value="all">All</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1600px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '13px' }}>
                    <th style={{ padding: '10px' }}>Unique ID</th>
                    <th style={{ padding: '10px' }}>Admission No</th>
                    <th style={{ padding: '10px' }}>Name</th>
                    <th style={{ padding: '10px' }}>Email (Login ID)</th>
                    <th style={{ padding: '10px' }}>Father's Name</th>
                    <th style={{ padding: '10px' }}>Mother's Name</th>
                    <th style={{ padding: '10px' }}>Roll</th>
                    <th style={{ padding: '10px' }}>Mobile No</th>
                    <th style={{ padding: '10px' }}>Class</th>
                    <th style={{ padding: '10px' }}>Stream</th>
                    <th style={{ padding: '10px' }}>Section</th>
                    <th style={{ padding: '10px' }}>Gender</th>
                    <th style={{ padding: '10px' }}>Category</th>
                    <th style={{ padding: '10px' }}>PEN</th>
                    <th style={{ padding: '10px' }}>APAAR</th>
                    <th style={{ padding: '10px' }}>eShikshakosh ID</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>BSEB Registration</th>
                    <th style={{ padding: '10px', minWidth: '270px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.length > 0 ? (
                    currentStudents.map((s) => (
                      <tr key={s._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#2563eb' }}>{s.studentId}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#0f766e' }}>{s.admissionNo || '-'}</td>
                        <td style={{ padding: '10px', fontWeight: '600' }}>{s.name}</td>
                        <td style={{ padding: '10px', color: '#0284c7' }}>{s.email || '-'}</td>
                        <td style={{ padding: '10px' }}>{s.fatherName || '-'}</td>
                        <td style={{ padding: '10px' }}>{s.motherName || '-'}</td>
                        <td style={{ padding: '10px' }}>{s.rollNo || '-'}</td>
                        <td style={{ padding: '10px', fontWeight: '600', color: '#047857' }}>{s.mobileNumber || '-'}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>Class {s.class}</td>
                        <td style={{ padding: '10px', fontWeight: '600', color: s.stream === 'Science' ? '#2563eb' : s.stream === 'Arts' ? '#d97706' : '#64748b' }}>
                          {(s.class === '11' || s.class === '12') ? (s.stream || 'Science') : '-'}
                        </td>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#8b5cf6' }}>{s.section || 'A'}</td>
                        <td style={{ padding: '10px' }}>{s.gender || '-'}</td>
                        <td style={{ padding: '10px' }}>{s.category || '-'}</td>
                        <td style={{ padding: '10px' }}>{s.pen || '-'}</td>
                        <td style={{ padding: '10px' }}>{s.apaar || '-'}</td>
                        <td style={{ padding: '10px' }}>{s.eshikshakoshID || '-'}</td>
                        
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <input 
                              type="checkbox" 
                              checked={s.bsebRegistered || false} 
                              onChange={async (e) => {
                                const newValue = e.target.checked;
                                try {
                                  const token = localStorage.getItem('token');
                                  await axios.patch(
                                    `/api/v1/students/${s._id}/bseb-status`, 
                                    { bsebRegistered: newValue },
                                    { headers: { Authorization: `Bearer ${token}` } }
                                  );
                                  setStudents(students.map(item => item._id === s._id ? { ...item, bsebRegistered: newValue } : item));
                                } catch (err) {
                                  console.error("Error updating BSEB status:", err);
                                  alert("❌ Status update failed!");
                                }
                              }}
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: s.bsebRegistered ? '#166534' : '#991b1b' }}>
                              {s.bsebRegistered ? 'Registered' : 'Pending'}
                            </span>
                          </div>
                        </td>

                        {/* 💡 सभी एक्शन बटन्स एक ही लाइन में दाईं ओर अलाइन किए गए */}
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', flexWrap: 'nowrap' }}>
                            <button onClick={() => handleEdit(s)} style={{ padding: '5px 10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Edit</button>
                            <button onClick={() => handleDelete(s._id)} style={{ padding: '5px 10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Delete</button>
                            <button onClick={() => handleResetPassword(s._id, s.name)} style={{ padding: '5px 10px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>🔑 Reset Password</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="18" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>कोई छात्र रिकॉर्ड नहीं मिला।</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

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

        {/* TAB 3: CLASS & STREAM-WISE PERMANENT SECTION MANAGEMENT */}
        {activeTab === 'sections' && (
          <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', maxWidth: '700px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' }}>⚙️ Permanent Section Management</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              यहाँ जोड़े गए Sections सीधे Database में सेव होंगे। Class 11 और 12 के लिए Science और Arts के सेक्शंस अलग-अलग मैनेज किए जा सकते हैं।
            </p>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>Select Class:</label>
                <select 
                  value={sectionMgmtClass} 
                  onChange={(e) => setSectionMgmtClass(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 'bold', fontSize: '14px', width: '180px' }}
                >
                  <option value="9">Class 9</option>
                  <option value="10">Class 10</option>
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                </select>
              </div>

              {(sectionMgmtClass === '11' || sectionMgmtClass === '12') && (
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#2563eb', display: 'block', marginBottom: '6px' }}>Select Stream:</label>
                  <select 
                    value={sectionMgmtStream} 
                    onChange={(e) => setSectionMgmtStream(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '2px solid #3b82f6', backgroundColor: '#eff6ff', fontWeight: 'bold', fontSize: '14px', width: '180px' }}
                  >
                    <option value="Science">Science</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>
              )}
            </div>

            <form onSubmit={handleAddSection} style={{ display: 'flex', gap: '10px', marginBottom: '25px', alignItems: 'center' }}>
              <input 
                type="text" 
                maxLength="1"
                placeholder="उदा. D" 
                value={newSectionInput} 
                onChange={(e) => setNewSectionInput(e.target.value)} 
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '120px', textTransform: 'uppercase', textAlign: 'center', fontWeight: 'bold' }}
              />
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                + Add Permanent Section
              </button>
            </form>

            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '10px' }}>
              Class {sectionMgmtClass} {(sectionMgmtClass === '11' || sectionMgmtClass === '12') ? `(${sectionMgmtStream})` : ''} में सेव्ड Sections:
            </h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {currentMgmtSections.map((sec, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', backgroundColor: '#f3e8ff', border: '1px solid #c084fc', borderRadius: '8px', fontWeight: 'bold', color: '#6b21a8' }}>
                  <span>Section {sec}</span>
                  {sec !== 'A' && (
                    <button 
                      type="button"
                      onClick={() => handleDeleteSection(sec)}
                      title="Delete Section Permanently"
                      style={{ background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '4px' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}