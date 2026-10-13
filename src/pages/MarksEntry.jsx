import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MarksEntry() {
  const [activeMainTab, setActiveMainTab] = useState('marks');

  const [examType, setExamType] = useState('First Quarterly');
  const [className, setClassName] = useState('9');
  const [stream, setStream] = useState('Science');
  const [section, setSection] = useState('A');

  const [students, setStudents] = useState([]);
  const [configStudents, setConfigStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Subject Tagging Modal State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);

  // 2. Individual Marks Entry Modal State
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [studentForMarks, setStudentForMarks] = useState(null);
  const [tempMarks, setTempMarks] = useState({});

  useEffect(() => {
    if (examType === 'Sentup Exam') {
      if (className !== '10' && className !== '12') {
        setClassName('10');
      }
    } else if (examType === 'Final Exam') {
      if (className !== '9' && className !== '11') {
        setClassName('9');
      }
    }
  }, [examType]);

  useEffect(() => {
    if (activeMainTab === 'marks') {
      fetchStudentsForMarks();
    } else if (activeMainTab === 'config') {
      fetchStudentsForConfig();
    }
  }, [examType, className, stream, section, activeMainTab]);

  // 💡 Fully Supported Mapping for Class 9-12 (Science & Arts Included)
  const fetchStudentsForMarks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const isHigherClass = className === '11' || className === '12';
      const streamParam = isHigherClass ? `&stream=${stream}` : '';

      const studentRes = await axios.get(
        `/api/v1/exams/class-marks?examType=${encodeURIComponent(examType)}&className=${className}&section=${section || 'A'}${streamParam}`,
        config
      );
      const studentList = studentRes.data.data || studentRes.data || [];

      const marksRes = await axios.get(
        `/api/v1/exams/marks?examType=${encodeURIComponent(examType)}&className=${className}&section=${section || 'A'}${streamParam}`,
        config
      );
      const marksList = marksRes.data.data || [];

      const populatedStudents = studentList.map(student => {
        const sId = String(student._id || student.id || '');
        
        const studentSavedMarks = marksList.filter(m => {
          const mStudentId = String(m.studentId?._id || m.studentId || '');
          return mStudentId === sId;
        });

        const marksObj = {};
        studentSavedMarks.forEach(m => {
          const subName = m.subjectName || '';
          const theory = m.theoryObtained;
          const practical = m.practicalObtained;

          if (className === '9' || className === '10') {
            const lang1 = student.assignedSubjects?.language1 || 'Hindi';
            const lang2 = student.assignedSubjects?.language2 || 'Sanskrit';

            if (subName === lang1 || subName === 'Hindi' || subName === 'Urdu') {
              marksObj.lang1 = theory;
            } else if (subName === lang2 || subName === 'Sanskrit' || subName === 'NLH') {
              marksObj.lang2 = theory;
            } else if (subName === 'Mathematics') {
              marksObj.Math = theory;
            } else if (subName === 'Science') {
              marksObj.scienceTheory = theory;
              marksObj.sciencePractical = practical;
            } else if (subName === 'Social Science') {
              marksObj.socialTheory = theory;
              marksObj.socialPractical = practical;
            } else if (subName === 'English') {
              marksObj.English = theory;
            }
          } else {
            const comp1Name = student.assignedSubjects?.comp1Lang || 'Hindi';
            const comp2Name = student.assignedSubjects?.comp2Lang || 'English';

            if (subName === comp1Name) marksObj.comp1 = theory;
            else if (subName === comp2Name) marksObj.comp2 = theory;
            else if (subName === 'Physics Theory') marksObj.physicsTheory = theory;
            else if (subName === 'Physics Practical') marksObj.physicsPractical = practical;
            else if (subName === 'Chemistry Theory') marksObj.chemTheory = theory;
            else if (subName === 'Chemistry Practical') marksObj.chemPractical = practical;
            else if (subName === 'Biology Theory') marksObj.elec3Theory = theory;
            else if (subName === 'Biology Practical') marksObj.elec3Practical = practical;
            else if (subName === 'Mathematics') marksObj.elec3 = theory;
            else if (subName === `${student.assignedSubjects?.elec1?.name} Theory`) marksObj.elec1Theory = theory;
            else if (subName === `${student.assignedSubjects?.elec1?.name} Practical`) marksObj.elec1Practical = practical;
            else if (subName === `${student.assignedSubjects?.elec2?.name} Theory`) marksObj.elec2Theory = theory;
            else if (subName === `${student.assignedSubjects?.elec2?.name} Practical`) marksObj.elec2Practical = practical;
            else if (subName === `${student.assignedSubjects?.elec3?.name} Theory`) marksObj.elec3Theory = theory;
            else if (subName === `${student.assignedSubjects?.elec3?.name} Practical`) marksObj.elec3Practical = practical;
            else if (subName === `${student.assignedSubjects?.additional?.name} Theory`) marksObj.additionalTheory = theory;
            else if (subName === `${student.assignedSubjects?.additional?.name} Practical`) marksObj.additionalPractical = practical;
            else marksObj[subName] = theory;
          }
        });

        return {
          ...student,
          marks: marksObj,
          hasEnteredMarks: studentSavedMarks.length > 0
        };
      });

      populatedStudents.sort((a, b) => Number(a.rollNo || 0) - Number(b.rollNo || 0));
      setStudents(populatedStudents);
    } catch (err) {
      console.error('Error fetching students for marks entry:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axios.get(`/api/v1/students`, config);
      const allStudents = res.data.data || res.data || [];
      
      const filtered = allStudents.filter(s => {
        const matchClass = String(s.class) === String(className);
        if (!matchClass) return false;

        if (className === '11' || className === '12') {
          if (stream && stream !== '') {
            const matchStream = String(s.stream || '').toLowerCase() === String(stream).toLowerCase();
            if (!matchStream) return false;
          }
        }

        if (section && section.trim() !== '') {
          const matchSec = String(s.section || 'A').toUpperCase() === String(section).toUpperCase();
          if (!matchSec) return false;
        }

        return true;
      });

      filtered.sort((a, b) => Number(a.rollNo || 0) - Number(b.rollNo || 0));

      const initialized = filtered.map(s => ({
        ...s,
        assignedSubjects: s.assignedSubjects || {
          language1: 'Hindi',
          language2: 'Sanskrit',
          sciencePractical: true,
          socialSciencePractical: true,
          comp1Lang: 'Hindi',
          comp2Lang: 'English',
          elec3Choice: 'Mathematics',
          elec1: { name: '', hasPractical: false },
          elec2: { name: '', hasPractical: false },
          elec3: { name: '', hasPractical: false },
          additional: { enabled: false, name: '', hasPractical: false }
        }
      }));

      setConfigStudents(initialized);
    } catch (err) {
      console.error('Error fetching students for config:', err);
    } finally {
      setLoading(false);
    }
  };

  const openConfigModal = (student) => {
    const existing = student.assignedSubjects || {};
    const mergedStudent = {
      ...student,
      assignedSubjects: {
        language1: existing.language1 || 'Hindi',
        language2: existing.language2 || 'Sanskrit',
        sciencePractical: existing.sciencePractical ?? true,
        socialSciencePractical: existing.socialSciencePractical ?? true,
        comp1Lang: existing.comp1Lang || 'Hindi',
        comp2Lang: existing.comp2Lang || 'English',
        elec3Choice: existing.elec3Choice || 'Mathematics',
        elec1: existing.elec1 || { name: '', hasPractical: false },
        elec2: existing.elec2 || { name: '', hasPractical: false },
        elec3: existing.elec3 || { name: '', hasPractical: false },
        additional: existing.additional || { enabled: false, name: '', hasPractical: false }
      }
    };
    setCurrentStudent(mergedStudent);
    setIsConfigModalOpen(true);
  };

  const handleSaveModalSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const studentId = currentStudent._id || currentStudent.id;

      const cleanAssignedSubjects = {
        ...currentStudent.assignedSubjects,
        elec1: currentStudent.stream === 'Arts' ? (currentStudent.assignedSubjects?.elec1 || { name: '', hasPractical: false }) : undefined,
        elec2: currentStudent.stream === 'Arts' ? (currentStudent.assignedSubjects?.elec2 || { name: '', hasPractical: false }) : undefined,
        elec3: currentStudent.stream === 'Arts' ? (currentStudent.assignedSubjects?.elec3 || { name: '', hasPractical: false }) : undefined,
        additional: currentStudent.assignedSubjects?.additional || { enabled: false, name: '', hasPractical: false }
      };

      await axios.put(
        `/api/v1/students/${studentId}/subjects`,
        { assignedSubjects: cleanAssignedSubjects },
        config
      );

      const updatedStudent = { ...currentStudent, assignedSubjects: cleanAssignedSubjects };

      setConfigStudents(prev => prev.map(s => (s._id === studentId || s.id === studentId) ? updatedStudent : s));
      alert(`✅ ${currentStudent.name} के विषय सफलतापूर्वक टैग कर दिए गए हैं!`);
      setIsConfigModalOpen(false);
    } catch (err) {
      alert('❌ विषय सेव करने में विफल: ' + (err.response?.data?.message || err.message));
    }
  };

  const openMarksModal = (student) => {
    setStudentForMarks(student);
    setTempMarks(student.marks ? { ...student.marks } : {});
    setIsMarksModalOpen(true);
  };

  const handleTempMarkChange = (subKey, val) => {
    setTempMarks(prev => ({
      ...prev,
      [subKey]: val === '' ? '' : Number(val)
    }));
  };

  const handleSaveIndividualMarks = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const studentId = studentForMarks._id || studentForMarks.id;

      const payloads = [];

      if (studentForMarks.class === '9' || studentForMarks.class === '10') {
        if (tempMarks.lang1 !== undefined && tempMarks.lang1 !== '') {
          payloads.push({ subjectName: studentForMarks.assignedSubjects?.language1 || 'Hindi', theoryObtained: Number(tempMarks.lang1), practicalObtained: 0 });
        }
        if (tempMarks.lang2 !== undefined && tempMarks.lang2 !== '') {
          payloads.push({ subjectName: studentForMarks.assignedSubjects?.language2 || 'Sanskrit', theoryObtained: Number(tempMarks.lang2), practicalObtained: 0 });
        }
        if (tempMarks.Math !== undefined && tempMarks.Math !== '') {
          payloads.push({ subjectName: 'Mathematics', theoryObtained: Number(tempMarks.Math), practicalObtained: 0 });
        }
        if ((tempMarks.scienceTheory !== undefined && tempMarks.scienceTheory !== '') || (tempMarks.sciencePractical !== undefined && tempMarks.sciencePractical !== '')) {
          payloads.push({ 
            subjectName: 'Science', 
            theoryObtained: Number(tempMarks.scienceTheory || 0), 
            practicalObtained: Number(tempMarks.sciencePractical || 0) 
          });
        }
        if ((tempMarks.socialTheory !== undefined && tempMarks.socialTheory !== '') || (tempMarks.socialPractical !== undefined && tempMarks.socialPractical !== '')) {
          payloads.push({ 
            subjectName: 'Social Science', 
            theoryObtained: Number(tempMarks.socialTheory || 0), 
            practicalObtained: Number(tempMarks.socialPractical || 0) 
          });
        }
        if (tempMarks.English !== undefined && tempMarks.English !== '') {
          payloads.push({ subjectName: 'English', theoryObtained: Number(tempMarks.English), practicalObtained: 0 });
        }
      } else {
        const sub = studentForMarks.assignedSubjects || {};

        if (tempMarks.comp1 !== undefined && tempMarks.comp1 !== '') {
          payloads.push({ subjectName: sub.comp1Lang || 'Hindi', theoryObtained: Number(tempMarks.comp1), practicalObtained: 0 });
        }
        if (tempMarks.comp2 !== undefined && tempMarks.comp2 !== '') {
          payloads.push({ subjectName: sub.comp2Lang || 'English', theoryObtained: Number(tempMarks.comp2), practicalObtained: 0 });
        }

        if ((tempMarks.physicsTheory !== undefined && tempMarks.physicsTheory !== '') || (tempMarks.physicsPractical !== undefined && tempMarks.physicsPractical !== '')) {
          payloads.push({ subjectName: 'Physics Theory', theoryObtained: Number(tempMarks.physicsTheory || 0), practicalObtained: Number(tempMarks.physicsPractical || 0) });
        }
        if ((tempMarks.chemTheory !== undefined && tempMarks.chemTheory !== '') || (tempMarks.chemPractical !== undefined && tempMarks.chemPractical !== '')) {
          payloads.push({ subjectName: 'Chemistry Theory', theoryObtained: Number(tempMarks.chemTheory || 0), practicalObtained: Number(tempMarks.chemPractical || 0) });
        }

        if (sub.elec3Choice === 'Biology') {
          if ((tempMarks.elec3Theory !== undefined && tempMarks.elec3Theory !== '') || (tempMarks.elec3Practical !== undefined && tempMarks.elec3Practical !== '')) {
            payloads.push({ subjectName: 'Biology Theory', theoryObtained: Number(tempMarks.elec3Theory || 0), practicalObtained: Number(tempMarks.elec3Practical || 0) });
          }
        } else if (tempMarks.elec3 !== undefined && tempMarks.elec3 !== '') {
          payloads.push({ subjectName: 'Mathematics', theoryObtained: Number(tempMarks.elec3), practicalObtained: 0 });
        }

        if (sub.elec1?.name) {
          payloads.push({ 
            subjectName: `${sub.elec1.name} Theory`, 
            theoryObtained: Number(tempMarks.elec1Theory || 0), 
            practicalObtained: Number(tempMarks.elec1Practical || 0) 
          });
        }
        if (sub.elec2?.name) {
          payloads.push({ 
            subjectName: `${sub.elec2.name} Theory`, 
            theoryObtained: Number(tempMarks.elec2Theory || 0), 
            practicalObtained: Number(tempMarks.elec2Practical || 0) 
          });
        }
        if (sub.elec3?.name && sub.elec3Choice !== 'Biology' && sub.elec3Choice !== 'Mathematics') {
          payloads.push({ 
            subjectName: `${sub.elec3.name} Theory`, 
            theoryObtained: Number(tempMarks.elec3Theory || 0), 
            practicalObtained: Number(tempMarks.elec3Practical || 0) 
          });
        }

        if (sub.additional?.name) {
          payloads.push({ 
            subjectName: `${sub.additional.name} Theory`, 
            theoryObtained: Number(tempMarks.additionalTheory || 0), 
            practicalObtained: Number(tempMarks.additionalPractical || 0) 
          });
        }
      }

      if (payloads.length === 0) {
        alert('⚠️ कृपया कम से कम एक विषय के मार्क्स भरें!');
        return;
      }

      const savePromises = payloads.map(p => {
        const payload = {
          examType,
          className: studentForMarks.class,
          stream: (studentForMarks.class === '11' || studentForMarks.class === '12') ? stream : 'N/A',
          section: section || 'A',
          studentId,
          ...p
        };
        return axios.post('/api/v1/exams/marks', payload, config);
      });

      await Promise.all(savePromises);
      fetchStudentsForMarks();

      alert(`✅ ${studentForMarks.name} के मार्क्स सफलतापूर्वक सुरक्षित कर दिए गए!`);
      setIsMarksModalOpen(false);
    } catch (err) {
      alert('❌ मार्क्स सेव करने में विफल: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: '30px 40px', backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '25px 30px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
          
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>📝 परीक्षा एवं विषय प्रबंधन पैनल (Admin & Clerk Portal)</h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
            यहाँ से आप मार्क्स एंट्री करने के साथ-साथ छात्र-वार विषय टैगिंग (Student-Wise Subject Tagging) भी प्रबंधित कर सकते हैं।
          </p>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
            <button
              onClick={() => setActiveMainTab('marks')}
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: activeMainTab === 'marks' ? '#2563eb' : '#f1f5f9', color: activeMainTab === 'marks' ? '#fff' : '#475569', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
            >
              📝 Marks Entry
            </button>
            <button
              onClick={() => setActiveMainTab('config')}
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: activeMainTab === 'config' ? '#2563eb' : '#f1f5f9', color: activeMainTab === 'config' ? '#fff' : '#475569', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
            >
              🏷️ Student-Wise Subject Tagging
            </button>
          </div>

          {activeMainTab === 'marks' && (
            <>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {['First Quarterly', 'Half Yearly', 'Second Quarterly', 'Sentup Exam', 'Final Exam'].map(type => (
                  <button 
                    key={type}
                    onClick={() => setExamType(type)}
                    style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: examType === type ? '#2563eb' : '#e2e8f0', color: examType === type ? '#fff' : '#334155', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#475569' }}>Class</label>
                  <select value={className} onChange={(e) => setClassName(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                    {examType === 'Sentup Exam' ? (
                      <>
                        <option value="10">Class 10</option>
                        <option value="12">Class 12</option>
                      </>
                    ) : examType === 'Final Exam' ? (
                      <>
                        <option value="9">Class 9</option>
                        <option value="11">Class 11</option>
                      </>
                    ) : (
                      <>
                        <option value="9">Class 9</option>
                        <option value="10">Class 10</option>
                        <option value="11">Class 11</option>
                        <option value="12">Class 12</option>
                      </>
                    )}
                  </select>
                </div>

                {(className === '11' || className === '12') && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#475569' }}>Stream</label>
                    <select value={stream} onChange={(e) => setStream(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                      <option value="Science">Science</option>
                      <option value="Arts">Arts</option>
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: '#475569' }}>Section</label>
                  <input 
                    type="text" 
                    value={section} 
                    onChange={(e) => setSection(e.target.value.toUpperCase())} 
                    maxLength="1" 
                    placeholder="A"
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '70px', fontSize: '14px' }} 
                  />
                </div>
              </div>

              {loading ? (
                <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>छात्रों का डेटा लोड हो रहा है...</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                        <th style={{ padding: '12px' }}>Roll No</th>
                        <th style={{ padding: '12px' }}>Student Name</th>
                        <th style={{ padding: '12px' }}>Father's Name</th>
                        <th style={{ padding: '12px' }}>Status / Class</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.length > 0 ? (
                        students.map((student, idx) => {
                          const hasMarks = student.hasEnteredMarks || (student.marks && Object.keys(student.marks).length > 0 && Object.values(student.marks).some(v => v !== '' && v !== null));
                          const textColor = hasMarks ? '#16a34a' : '#1e293b';

                          return (
                            <tr key={student.id || student._id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '12px', fontWeight: 'bold', color: textColor }}>{student.rollNo || '-'}</td>
                              <td style={{ padding: '12px', fontWeight: '600', color: textColor }}>{student.name}</td>
                              <td style={{ padding: '12px', color: textColor }}>{student.fatherName || '-'}</td>
                              <td style={{ padding: '12px', fontWeight: 'bold', color: textColor }}>
                                {hasMarks ? '✅ Marks Entered' : '⏳ Pending'}
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <button
                                  onClick={() => openMarksModal(student)}
                                  style={{ padding: '7px 16px', backgroundColor: hasMarks ? '#16a34a' : '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                                >
                                  {hasMarks ? '✏️ Edit Marks' : '➕ Enter Marks'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                            इस कक्षा या सेक्शन में कोई छात्र नहीं मिला।
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeMainTab === 'config' && (
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' }}>🎓 छात्र-वार विषय टैगिंग (Student-Wise Subject Tagging)</h3>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Class</label>
                  <select value={className} onChange={(e) => setClassName(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>

                {(className === '11' || className === '12') && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Stream</label>
                    <select value={stream} onChange={(e) => setStream(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option value="Science">Science</option>
                      <option value="Arts">Arts</option>
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Section</label>
                  <input 
                    type="text" value={section} onChange={(e) => setSection(e.target.value.toUpperCase())} maxLength="1" 
                    placeholder="A"
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '70px' }} 
                  />
                </div>
              </div>

              {loading ? (
                <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>छात्रों की सूची लोड हो रही है...</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', backgroundColor: '#fff' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#e2e8f0', color: '#334155' }}>
                        <th style={{ padding: '12px' }}>Roll No</th>
                        <th style={{ padding: '12px' }}>Student Name</th>
                        <th style={{ padding: '12px' }}>Father's Name</th>
                        <th style={{ padding: '12px' }}>Class / Stream</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Subject Tagging Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {configStudents.length > 0 ? (
                        configStudents.map((st) => (
                          <tr key={st._id || st.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{st.rollNo || '-'}</td>
                            <td style={{ padding: '12px', fontWeight: '600', color: '#1e293b' }}>{st.name}</td>
                            <td style={{ padding: '12px', color: '#64748b' }}>{st.fatherName || '-'}</td>
                            <td style={{ padding: '12px' }}>Class {st.class} {st.stream && st.stream !== 'N/A' ? `(${st.stream})` : ''}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <button 
                                onClick={() => openConfigModal(st)}
                                style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                              >
                                🏷️ Tag Subjects
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                            इस कक्षा या सेक्शन में कोई छात्र नहीं मिला।
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* ==========================================
          💡 1. SUBJECT TAGGING POPUP MODAL
         ========================================== */}
      {isConfigModalOpen && currentStudent && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '500px', maxWidth: '90%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px', color: '#1e293b' }}>🏷️ Assign Subjects for {currentStudent.name}</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Roll No: {currentStudent.rollNo || 'N/A'} | Class: {currentStudent.class} {currentStudent.stream !== 'N/A' ? `(${currentStudent.stream})` : ''}</p>

            {(currentStudent.class === '9' || currentStudent.class === '10') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '5px' }}>1. Language 1:</label>
                  <select 
                    value={currentStudent.assignedSubjects?.language1 || 'Hindi'}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, assignedSubjects: { ...currentStudent.assignedSubjects, language1: e.target.value } })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Hindi">Hindi</option>
                    <option value="Urdu">Urdu</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '5px' }}>2. Language 2:</label>
                  <select 
                    value={currentStudent.assignedSubjects?.language2 || 'Sanskrit'}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, assignedSubjects: { ...currentStudent.assignedSubjects, language2: e.target.value } })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Sanskrit">Sanskrit</option>
                    <option value="NLH">NLH</option>
                  </select>
                </div>

                <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '6px', fontSize: '13px' }}>
                  <p style={{ margin: '0 0 5px 0', fontWeight: '600' }}>Fixed Subjects:</p>
                  <div>3. Mathematics (Fixed)</div>
                  <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>4. Science (Theory 80 + Practical 20)</span>
                  </div>
                  <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>5. Social Science (Theory 80 + Project 20)</span>
                  </div>
                  <div style={{ marginTop: '5px', color: '#64748b' }}>6. English (Qualifying / Non-adding)</div>
                </div>
              </div>
            )}

            {(currentStudent.class === '11' || currentStudent.class === '12') && currentStudent.stream === 'Science' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Compulsory Lang 1</label>
                    <select 
                      value={currentStudent.assignedSubjects?.comp1Lang || 'Hindi'}
                      onChange={(e) => setCurrentStudent({ ...currentStudent, assignedSubjects: { ...currentStudent.assignedSubjects, comp1Lang: e.target.value } })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="Hindi">Hindi</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Compulsory Lang 2</label>
                    <select 
                      value={currentStudent.assignedSubjects?.comp2Lang || 'English'}
                      onChange={(e) => setCurrentStudent({ ...currentStudent, assignedSubjects: { ...currentStudent.assignedSubjects, comp2Lang: e.target.value } })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="Hindi">Hindi</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                </div>

                <div style={{ fontSize: '13px', background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                  <b>Elected 1 & 2:</b> Physics & Chemistry (Theory & Practical separate entry)
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Elective Paper 3:</label>
                  <select 
                    value={currentStudent.assignedSubjects?.elec3Choice || 'Mathematics'}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, assignedSubjects: { ...currentStudent.assignedSubjects, elec3Choice: e.target.value } })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Additional Paper (Optional):</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="text" placeholder="Subject Name"
                      value={currentStudent.assignedSubjects?.additional?.name || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCurrentStudent(prev => ({
                          ...prev,
                          assignedSubjects: {
                            ...prev.assignedSubjects,
                            additional: {
                              ...(prev.assignedSubjects?.additional || {}),
                              name: val,
                              enabled: val.trim() !== ''
                            }
                          }
                        }));
                      }}
                      style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                    <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={currentStudent.assignedSubjects?.additional?.hasPractical || false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setCurrentStudent(prev => ({
                            ...prev,
                            assignedSubjects: {
                              ...prev.assignedSubjects,
                              additional: {
                                ...(prev.assignedSubjects?.additional || {}),
                                hasPractical: checked
                              }
                            }
                          }));
                        }}
                      /> Practical
                    </label>
                  </div>
                </div>
              </div>
            )}

            {(currentStudent.class === '11' || currentStudent.class === '12') && currentStudent.stream === 'Arts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Compulsory Lang 1</label>
                    <select 
                      value={currentStudent.assignedSubjects?.comp1Lang || 'Hindi'}
                      onChange={(e) => setCurrentStudent({ ...currentStudent, assignedSubjects: { ...currentStudent.assignedSubjects, comp1Lang: e.target.value } })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="Hindi">Hindi</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Compulsory Lang 2</label>
                    <select 
                      value={currentStudent.assignedSubjects?.comp2Lang || 'English'}
                      onChange={(e) => setCurrentStudent({ ...currentStudent, assignedSubjects: { ...currentStudent.assignedSubjects, comp2Lang: e.target.value } })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="Hindi">Hindi</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                </div>

                {['elec1', 'elec2', 'elec3'].map((elecKey, idx) => {
                  const currentElec = currentStudent.assignedSubjects?.[elecKey] || { name: '', hasPractical: false };
                  return (
                    <div key={elecKey}>
                      <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Elected Paper {idx + 1}</label>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input 
                          type="text" 
                          placeholder="Subject Name (e.g. History)"
                          value={currentElec.name || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCurrentStudent(prev => ({
                              ...prev,
                              assignedSubjects: {
                                ...prev.assignedSubjects,
                                [elecKey]: {
                                  name: val,
                                  hasPractical: currentElec.hasPractical
                                }
                              }
                            }));
                          }}
                          style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                        <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={currentElec.hasPractical || false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setCurrentStudent(prev => ({
                                ...prev,
                                assignedSubjects: {
                                  ...prev.assignedSubjects,
                                  [elecKey]: {
                                    name: currentElec.name,
                                    hasPractical: checked
                                  }
                                }
                              }));
                            }}
                          /> Practical
                        </label>
                      </div>
                    </div>
                  );
                })}

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Additional Paper (Optional):</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="text" placeholder="Subject Name"
                      value={currentStudent.assignedSubjects?.additional?.name || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCurrentStudent(prev => ({
                          ...prev,
                          assignedSubjects: {
                            ...prev.assignedSubjects,
                            additional: {
                              ...(prev.assignedSubjects?.additional || {}),
                              name: val,
                              enabled: val.trim() !== ''
                            }
                          }
                        }));
                      }}
                      style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                    <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={currentStudent.assignedSubjects?.additional?.hasPractical || false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setCurrentStudent(prev => ({
                            ...prev,
                            assignedSubjects: {
                              ...prev.assignedSubjects,
                              additional: {
                                ...(prev.assignedSubjects?.additional || {}),
                                hasPractical: checked
                              }
                            }
                          }));
                        }}
                      /> Practical
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
              <button 
                onClick={() => setIsConfigModalOpen(false)}
                style={{ padding: '8px 16px', backgroundColor: '#64748b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveModalSubjects}
                style={{ padding: '8px 20px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                💾 Save & Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          💡 2. INDIVIDUAL MARKS ENTRY POPUP MODAL
         ========================================== */}
      {isMarksModalOpen && studentForMarks && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '450px', maxWidth: '90%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px', color: '#1e293b' }}>📝 Enter Marks for {studentForMarks.name}</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Roll No: {studentForMarks.rollNo || 'N/A'} | Class: {studentForMarks.class} {studentForMarks.stream !== 'N/A' ? `(${studentForMarks.stream})` : ''}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Class 9 & 10 */}
              {(studentForMarks.class === '9' || studentForMarks.class === '10') && (
                <>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Hindi/Urdu (Lang 1) - Max 100</label>
                    <input type="number" min="0" max="100" value={tempMarks.lang1 ?? ''} onChange={(e) => handleTempMarkChange('lang1', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Sanskrit/NLH (Lang 2) - Max 100</label>
                    <input type="number" min="0" max="100" value={tempMarks.lang2 ?? ''} onChange={(e) => handleTempMarkChange('lang2', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Mathematics - Max 100</label>
                    <input type="number" min="0" max="100" value={tempMarks.Math ?? ''} onChange={(e) => handleTempMarkChange('Math', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                  </div>

                  <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>🔬 Science (Total Max 100)</span>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: '#64748b' }}>Theory (Max 80)</label>
                        <input type="number" min="0" max="80" placeholder="0-80" value={tempMarks.scienceTheory ?? ''} onChange={(e) => handleTempMarkChange('scienceTheory', e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: '#64748b' }}>Practical (Max 20)</label>
                        <input type="number" min="0" max="20" placeholder="0-20" value={tempMarks.sciencePractical ?? ''} onChange={(e) => handleTempMarkChange('sciencePractical', e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>🌍 Social Science (Total Max 100)</span>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: '#64748b' }}>Theory (Max 80)</label>
                        <input type="number" min="0" max="80" placeholder="0-80" value={tempMarks.socialTheory ?? ''} onChange={(e) => handleTempMarkChange('socialTheory', e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: '#64748b' }}>Project Work (Max 20)</label>
                        <input type="number" min="0" max="20" placeholder="0-20" value={tempMarks.socialPractical ?? ''} onChange={(e) => handleTempMarkChange('socialPractical', e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>English (Qualifying) - Max 100</label>
                    <input type="number" min="0" max="100" value={tempMarks.English ?? ''} onChange={(e) => handleTempMarkChange('English', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                  </div>
                </>
              )}

              {/* Class 11 & 12 Science */}
              {(studentForMarks.class === '11' || studentForMarks.class === '12') && studentForMarks.stream === 'Science' && (() => {
                const sub = studentForMarks.assignedSubjects || {};
                return (
                  <>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Compulsory-1 ({sub.comp1Lang || 'Hindi'})</label>
                      <input type="number" min="0" max="100" value={tempMarks.comp1 ?? ''} onChange={(e) => handleTempMarkChange('comp1', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Compulsory-2 ({sub.comp2Lang || 'English'})</label>
                      <input type="number" min="0" max="100" value={tempMarks.comp2 ?? ''} onChange={(e) => handleTempMarkChange('comp2', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Physics (Theory)</label>
                      <input type="number" min="0" max="100" value={tempMarks.physicsTheory ?? ''} onChange={(e) => handleTempMarkChange('physicsTheory', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Physics (Practical)</label>
                      <input type="number" min="0" max="100" value={tempMarks.physicsPractical ?? ''} onChange={(e) => handleTempMarkChange('physicsPractical', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Chemistry (Theory)</label>
                      <input type="number" min="0" max="100" value={tempMarks.chemTheory ?? ''} onChange={(e) => handleTempMarkChange('chemTheory', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Chemistry (Practical)</label>
                      <input type="number" min="0" max="100" value={tempMarks.chemPractical ?? ''} onChange={(e) => handleTempMarkChange('chemPractical', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                    </div>

                    {sub.elec3Choice === 'Biology' ? (
                      <>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Elective-3: Biology (Theory)</label>
                          <input type="number" min="0" max="100" value={tempMarks.elec3Theory ?? ''} onChange={(e) => handleTempMarkChange('elec3Theory', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Elective-3: Biology (Practical)</label>
                          <input type="number" min="0" max="100" value={tempMarks.elec3Practical ?? ''} onChange={(e) => handleTempMarkChange('elec3Practical', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                        </div>
                      </>
                    ) : (
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Elective-3: Mathematics</label>
                        <input type="number" min="0" max="100" value={tempMarks.elec3 ?? ''} onChange={(e) => handleTempMarkChange('elec3', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                      </div>
                    )}

                    {sub.additional?.name && sub.additional.name.trim() !== '' && (
                      <>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Additional: {sub.additional.name} (Theory)</label>
                          <input type="number" min="0" max="100" value={tempMarks.additionalTheory ?? ''} onChange={(e) => handleTempMarkChange('additionalTheory', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                        </div>
                        {sub.additional.hasPractical && (
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Additional: {sub.additional.name} (Practical)</label>
                            <input type="number" min="0" max="100" value={tempMarks.additionalPractical ?? ''} onChange={(e) => handleTempMarkChange('additionalPractical', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                          </div>
                        )}
                      </>
                    )}
                  </>
                );
              })()}

              {/* Class 11 & 12 Arts */}
              {(studentForMarks.class === '11' || studentForMarks.class === '12') && studentForMarks.stream === 'Arts' && (() => {
                const sub = studentForMarks.assignedSubjects || {};
                return (
                  <>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Compulsory-1 ({sub.comp1Lang || 'Hindi'})</label>
                      <input type="number" min="0" max="100" value={tempMarks.comp1 ?? ''} onChange={(e) => handleTempMarkChange('comp1', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Compulsory-2 ({sub.comp2Lang || 'English'})</label>
                      <input type="number" min="0" max="100" value={tempMarks.comp2 ?? ''} onChange={(e) => handleTempMarkChange('comp2', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                    </div>

                    {sub.elec1?.name && (
                      <>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Elective-1: {sub.elec1.name} (Theory)</label>
                          <input type="number" min="0" max="100" value={tempMarks.elec1Theory ?? ''} onChange={(e) => handleTempMarkChange('elec1Theory', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                        </div>
                        {sub.elec1.hasPractical && (
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Elective-1: {sub.elec1.name} (Practical)</label>
                            <input type="number" min="0" max="100" value={tempMarks.elec1Practical ?? ''} onChange={(e) => handleTempMarkChange('elec1Practical', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                          </div>
                        )}
                      </>
                    )}

                    {sub.elec2?.name && (
                      <>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Elective-2: {sub.elec2.name} (Theory)</label>
                          <input type="number" min="0" max="100" value={tempMarks.elec2Theory ?? ''} onChange={(e) => handleTempMarkChange('elec2Theory', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                        </div>
                        {sub.elec2.hasPractical && (
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Elective-2: {sub.elec2.name} (Practical)</label>
                            <input type="number" min="0" max="100" value={tempMarks.elec2Practical ?? ''} onChange={(e) => handleTempMarkChange('elec2Practical', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                          </div>
                        )}
                      </>
                    )}

                    {sub.elec3?.name && (
                      <>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Elective-3: {sub.elec3.name} (Theory)</label>
                          <input type="number" min="0" max="100" value={tempMarks.elec3Theory ?? ''} onChange={(e) => handleTempMarkChange('elec3Theory', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                        </div>
                        {sub.elec3.hasPractical && (
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Elective-3: {sub.elec3.name} (Practical)</label>
                            <input type="number" min="0" max="100" value={tempMarks.elec3Practical ?? ''} onChange={(e) => handleTempMarkChange('elec3Practical', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                          </div>
                        )}
                      </>
                    )}

                    {sub.additional?.name && sub.additional.name.trim() !== '' && (
                      <>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Additional: {sub.additional.name} (Theory)</label>
                          <input type="number" min="0" max="100" value={tempMarks.additionalTheory ?? ''} onChange={(e) => handleTempMarkChange('additionalTheory', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                        </div>
                        {sub.additional.hasPractical && (
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Additional: {sub.additional.name} (Practical)</label>
                            <input type="number" min="0" max="100" value={tempMarks.additionalPractical ?? ''} onChange={(e) => handleTempMarkChange('additionalPractical', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                          </div>
                        )}
                      </>
                    )}
                  </>
                );
              })()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
              <button 
                onClick={() => setIsMarksModalOpen(false)}
                style={{ padding: '8px 16px', backgroundColor: '#64748b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveIndividualMarks}
                style={{ padding: '8px 20px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                💾 Save Marks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}