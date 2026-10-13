import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Routine() {
  const [routines, setRoutines] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [sectionsMap, setSectionsMap] = useState({}); // Stream/Class wise sections map
  
  const [formData, setFormData] = useState({
    day: 'Monday',
    timeSlot: '09:00 AM - 09:45 AM',
    selectedEntries: [], // Will store keys like '9-N/A', '10-N/A', '11-Science', '12-Arts' etc.
    classSections: {},   // { '9-N/A': ['A', 'B'], '11-Science': ['A'] }
    subject: '',
    teacher: ''
  });

  useEffect(() => {
    fetchRoutines();
    fetchTeachers();
    fetchSections();
  }, []);

  const fetchRoutines = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/v1/routines', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoutines(res.data.data || []);
    } catch (err) {
      console.error('Error fetching routines:', err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/v1/teachers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = res.data.data || res.data || [];
      setTeachers(list.filter(t => t.role === 'Teacher'));
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };

  // 💡 Updated Section Management API fetch with Stream Support
  const fetchSections = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/v1/students/sections', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = res.data.data || res.data || [];
      
      const map = {};
      data.forEach(item => {
        const cls = item.className || item.class;
        const streamVal = item.stream && item.stream !== 'N/A' ? item.stream : 'N/A';
        const sec = item.name || item.section;

        const key = (cls === '11' || cls === '12') ? `${cls}-${streamVal}` : `${cls}-N/A`;
        
        if (!map[key]) map[key] = [];
        if (sec && !map[key].includes(sec)) {
          map[key].push(sec);
        }
      });
      
      setSectionsMap(map);
    } catch (err) {
      console.error('Error fetching sections:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Class & Stream Checkbox Change
  const handleEntryCheckboxChange = (cls, stream = 'N/A') => {
    const entryKey = `${cls}-${stream}`;
    let updatedEntries = [...formData.selectedEntries];
    let updatedSections = { ...formData.classSections };

    if (updatedEntries.includes(entryKey)) {
      updatedEntries = updatedEntries.filter(e => e !== entryKey);
      delete updatedSections[entryKey];
    } else {
      updatedEntries.push(entryKey);
      const availableSecs = sectionsMap[entryKey] || ['A'];
      updatedSections[entryKey] = [availableSecs[0]]; // Default first section
    }
    setFormData({ ...formData, selectedEntries: updatedEntries, classSections: updatedSections });
  };

  // Handle Section Checkbox Change for specific class-stream
  const handleSectionCheckboxChange = (entryKey, sec) => {
    let currentSecs = formData.classSections[entryKey] || [];
    if (currentSecs.includes(sec)) {
      currentSecs = currentSecs.filter(s => s !== sec);
    } else {
      currentSecs.push(sec);
    }
    setFormData({
      ...formData,
      classSections: { ...formData.classSections, [entryKey]: currentSecs }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.selectedEntries.length === 0) {
      alert('कृपया कम से कम एक क्लास या स्ट्रीम चुनें!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // Format payload for backend (Allow empty subject to default to Prayer/Activity)
      const payload = {
        day: formData.day,
        timeSlot: formData.timeSlot,
        entries: formData.selectedEntries.map(entry => {
          const [cls, stream] = entry.split('-');
          return {
            class: cls,
            stream: stream,
            sections: formData.classSections[entry] || ['A']
          };
        }),
        subject: formData.subject.trim() !== '' ? formData.subject.trim() : 'Prayer / Activity',
        teacher: formData.teacher || undefined
      };

      await axios.post('/api/v1/routines', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Routine added successfully!');
      fetchRoutines();
      setFormData({ day: 'Monday', timeSlot: '09:00 AM - 09:45 AM', selectedEntries: [], classSections: {}, subject: '', teacher: '' });
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('क्या आप वाकई इस रूटीन को हटाना चाहते हैं?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/v1/routines/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Routine deleted successfully!');
      fetchRoutines();
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    }
  };

  // Available options list
  const optionsList = [
    { label: 'Class 9', cls: '9', stream: 'N/A' },
    { label: 'Class 10', cls: '10', stream: 'N/A' },
    { label: 'Class 11 (Science)', cls: '11', stream: 'Science' },
    { label: 'Class 11 (Arts)', cls: '11', stream: 'Arts' },
    { label: 'Class 12 (Science)', cls: '12', stream: 'Science' },
    { label: 'Class 12 (Arts)', cls: '12', stream: 'Arts' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Segoe UI, sans-serif', width: '100%' }}>
     
      <main style={{ flex: 1, padding: '30px 40px', overflowY: 'auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>📅 Weekly Routine & TimeTable Management</h1>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)', marginBottom: '30px', maxWidth: '850px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#334155' }}>+ Add New Period Routine</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: '600' }}>Day (दिन)</label>
                <select name="day" value={formData.day} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: '600' }}>Time Interval / Period</label>
                <input type="text" name="timeSlot" placeholder="e.g. 09:00 AM - 09:45 AM" value={formData.timeSlot} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
              </div>
            </div>

            {/* Class & Stream Selection Checkboxes */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Select Classes & Streams (क्लास और स्ट्रीम चुनें) *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                {optionsList.map(opt => {
                  const entryKey = `${opt.cls}-${opt.stream}`;
                  return (
                    <label key={entryKey} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.selectedEntries.includes(entryKey)} 
                        onChange={() => handleEntryCheckboxChange(opt.cls, opt.stream)}
                        style={{ width: '16px', height: '16px' }}
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Sections Based on Selected Class/Stream */}
            {formData.selectedEntries.length > 0 && (
              <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#1e40af' }}>Select Sections for Chosen Items (सेक्शन चुनें):</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {formData.selectedEntries.map(entryKey => {
                    const [cls, stream] = entryKey.split('-');
                    const availableSections = sectionsMap[entryKey] || ['A'];
                    const displayName = stream !== 'N/A' ? `Class ${cls} (${stream})` : `Class ${cls}`;

                    return (
                      <div key={entryKey} style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #dbeafe' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '13px', minWidth: '140px', color: '#1e3a8a' }}>{displayName}:</span>
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                          {availableSections.map(sec => (
                            <label key={sec} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '13px' }}>
                              <input 
                                type="checkbox" 
                                checked={formData.classSections[entryKey]?.includes(sec) || false}
                                onChange={() => handleSectionCheckboxChange(entryKey, sec)}
                              />
                              Sec {sec}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: '600' }}>Subject / Activity Name (Optional for Prayer/PT)</label>
                <input type="text" name="subject" placeholder="e.g. Prayer / PT / Math (Leave blank for Prayer/PT)" value={formData.subject} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: '600' }}>Assign Teacher (Optional / वैकल्पिक)</label>
                <select name="teacher" value={formData.teacher} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="">-- कोई शिक्षक नहीं (Optional) --</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name} ({t.appointedSubject || 'General'})</option>)}
                </select>
              </div>
            </div>

            <button type="submit" style={{ marginTop: '10px', padding: '10px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              + Save Routine
            </button>
          </form>
        </div>

        {/* Master Routine List Table */}
        <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#334155' }}>📋 Master Routine List</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '14px' }}>
                <th style={{ padding: '10px' }}>Day</th>
                <th style={{ padding: '10px' }}>Time Slot</th>
                <th style={{ padding: '10px' }}>Classes, Streams & Sections</th>
                <th style={{ padding: '10px' }}>Subject / Activity</th>
                <th style={{ padding: '10px' }}>Assigned Teacher</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {routines.length > 0 ? (
                routines.map((r, i) => (
                  <tr key={r._id || i} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#334155' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#2563eb' }}>{r.day}</td>
                    <td style={{ padding: '10px' }}>{r.timeSlot}</td>
                    <td style={{ padding: '10px' }}>
                      {r.entries ? r.entries.map((ent, idx) => (
                        <div key={idx}>
                          <b>Cl {ent.class} {ent.stream !== 'N/A' ? `(${ent.stream})` : ''}:</b> Sec {ent.sections?.join(', ')}
                        </div>
                      )) : 'N/A'}
                    </td>
                    <td style={{ padding: '10px', fontWeight: '600' }}>{r.subject}</td>
                    <td style={{ padding: '10px' }}>{r.teacher?.name || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not Required</span>}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <button onClick={() => handleDelete(r._id)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>कोई रूटीन उपलब्ध नहीं है।</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}