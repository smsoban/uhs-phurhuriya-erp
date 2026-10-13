import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function TeacherEditStudent() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    fatherName: '',
    motherName: '',
    rollNo: '',
    gender: 'Male',
    class: '9',
    section: 'A',
    stream: 'Science',
    category: 'General',
    pen: '',
    apaar: '',
    eshikshakoshID: '',
    admissionNo: '',
    admissionDate: '',
    mobileNumber: '',
    bsebRegistered: false
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/v1/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data.data || res.data;
      
      setFormData({
        name: data.name || data.studentName || '',
        email: data.email || '',
        fatherName: data.fatherName || '',
        motherName: data.motherName || '',
        rollNo: data.rollNo || data.roll || '',
        gender: data.gender || 'Male',
        class: data.class || data.className || '9',
        section: data.section || 'A',
        stream: data.stream || 'Science',
        category: data.category || 'General',
        pen: data.pen || '',
        apaar: data.apaar || '',
        eshikshakoshID: data.eshikshakoshID || '',
        admissionNo: data.admissionNo || '',
        admissionDate: data.admissionDate || '',
        mobileNumber: data.mobileNumber || '',
        bsebRegistered: data.bsebRegistered || false
      });
    } catch (err) {
      console.error('Error fetching student details:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // 💡 Strict Digit Length Validation Caps
    if (name === 'pen' && value.length > 11) return;
    if (name === 'apaar' && value.length > 12) return;
    if (name === 'eshikshakoshID' && value.length > 15) return;
    if (name === 'mobileNumber' && value.length > 10) return;

    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`/api/v1/students/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ छात्र का विवरण सफलतापूर्वक अपडेट हो गया!');
      navigate('/teacher-dashboard');
    } catch (err) {
      alert('❌ अपडेट करने में एरर: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '30px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontFamily: 'Segoe UI, sans-serif' }}>
      <h2 style={{ color: '#1e293b', marginTop: 0, marginBottom: '20px' }}>✏️ छात्र विवरण एडिट करें (Detailed Edit Student)</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Row 1: Name & Email */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Student Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Email (Optional)</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="student@gmail.com" style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* Row 2: Father Name & Mother Name */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Father's Name *</label>
            <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Mother's Name *</label>
            <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* Row 3: Roll No, Mobile Number & Gender */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Roll No *</label>
            <input type="text" name="rollNo" value={formData.rollNo} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Mobile Number (10 Digit) *</label>
            <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="10-digit mobile no" maxLength={10} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Gender *</label>
            <select name="gender" value={formData.gender} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#fff' }}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Row 4: Class, Section, Stream, Category */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Class *</label>
            <select name="class" value={formData.class} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#fff' }}>
              <option value="9">Class 9</option>
              <option value="10">Class 10</option>
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Section *</label>
            <select name="section" value={formData.section} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#fff' }}>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>
          {(formData.class === '11' || formData.class === '12') && (
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Stream *</label>
              <select name="stream" value={formData.stream} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#fff' }}>
                <option value="Science">Science</option>
                <option value="Arts">Arts</option>
                <option value="Commerce">Commerce</option>
              </select>
            </div>
          )}
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#fff' }}>
              <option value="General">General</option>
              <option value="BC">BC</option>
              <option value="EBC">EBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
          </div>
        </div>

        {/* Row 5: PEN, APAAR, eShikshakosh ID */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>PEN (Optional - Max 11)</label>
            <input type="text" name="pen" value={formData.pen} onChange={handleChange} maxLength={11} placeholder="11 digit PEN" style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>APAAR (Optional - Max 12)</label>
            <input type="text" name="apaar" value={formData.apaar} onChange={handleChange} maxLength={12} placeholder="12 digit APAAR" style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>eShikshakosh ID (Opt. - Max 15)</label>
            <input type="text" name="eshikshakoshID" value={formData.eshikshakoshID} onChange={handleChange} maxLength={15} placeholder="15 digit ID" style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* Row 6: Admission No & Date */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Admission No *</label>
            <input type="text" name="admissionNo" value={formData.admissionNo} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Admission Date (DD-MM-YYYY) *</label>
            <input type="text" name="admissionDate" value={formData.admissionDate} onChange={handleChange} placeholder="DD-MM-YYYY" maxLength={10} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* BSEB Checkbox */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
          <input type="checkbox" name="bsebRegistered" id="bsebRegistered" checked={formData.bsebRegistered} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
          <label htmlFor="bsebRegistered" style={{ fontSize: '14px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>BSEB Registered</label>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button type="submit" disabled={loading} style={{ backgroundColor: '#ca8a04', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', flex: 1 }}>
            {loading ? 'अपडेट हो रहा है...' : 'Update Student'}
          </button>
          <button type="button" onClick={() => navigate('/teacher-dashboard')} style={{ backgroundColor: '#64748b', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}