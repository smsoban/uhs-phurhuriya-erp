import { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // 👈 सही इम्पोर्ट तरीका

export default function ExamResults() {
  const [examType, setExamType] = useState('First Quarterly');
  const [className, setClassName] = useState('9');
  const [stream, setStream] = useState('Science');
  const [section, setSection] = useState('A');
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [examType, className, stream, section]);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token'); // 👈 लोकल स्टोरेज से टोकन निकालें
      if (!token) {
        alert('❌ कृपया दोबारा लॉगिन करें, टोकन नहीं मिला!');
        return;
      }
  
      const config = {
        headers: {
          'Authorization': `Bearer ${token}` // 👈 यह हेडर जोड़ना अनिवार्य है
        }
      };
  
      const res = await axios.get(
        `/api/v1/exams/results?examType=${examType}&className=${className}&section=${section}&stream=${stream}`,
        config // 👈 यहाँ config पास करें
      );
  
      setResults(res.data.data || res.data);
    } catch (err) {
      console.error('Error fetching results:', err);
    }
  };

  // 💡 Function to Export All Students Results as Multi-page PDF (Each student on a new page)
  // 💡 Updated Function to Export Marksheet in BSEB Format with Custom School Details
  const handleExportPDF = () => {
    if (results.length === 0) {
      alert('एक्सपोर्ट करने के लिए कोई रिजल्ट डेटा उपलब्ध नहीं है!');
      return;
    }

    const doc = new jsPDF('portrait', 'mm', 'a4');

    results.forEach((resItem, index) => {
      if (index > 0) {
        doc.addPage(); // हर छात्र के लिए नया पेज
      }

      // --- 1. Header Section ---
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("UTKRAMIT HIGH SCHOOL PHURHURIYA, PARAIYA, GAYA JI", 105, 15, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`MARKS SHEET OF SECONDARY SCHOOL EXAMINATION (${examType.toUpperCase()})`, 105, 22, { align: 'center' });

      doc.setLineWidth(0.4);
      doc.line(15, 25, 195, 25);

      // --- 2. Student Info Box ---
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      
      let startY = 30;
      doc.text(`Roll Code: 08317`, 15, startY);
      doc.text(`Roll No: ${resItem.rollNo || 'N/A'}`, 60, startY);
      doc.text(`NAME OF THE EXAMINEE: ${resItem.name.toUpperCase()}`, 110, startY);

      doc.text(`School Name: Utkramit High School Phurhuriya, Gaya`, 15, startY + 6);
      doc.text(`Father's Name: ${resItem.fatherName || 'N/A'}`, 110, startY + 6);

      doc.text(`Class: ${resItem.className} ${resItem.stream !== 'N/A' ? `(${resItem.stream})` : ''}`, 15, startY + 12);
      doc.text(`Section: ${resItem.section}`, 60, startY + 12);
      doc.text(`Status: ${resItem.isPass ? 'PASS' : 'FAIL'}`, 110, startY + 12);

      // --- 3. Marks Table (Without Compulsory Optional) ---
      // Marks Table
      const tableColumn = ["Subject", "Max Marks", "Marks Obtained", "Result / Status"];
      const tableRows = [];

      if (resItem.marksDetails && resItem.marksDetails.length > 0) {
        resItem.marksDetails.forEach(m => {
          tableRows.push([
            m.subjectName || m.subject || 'N/A',
            m.maxMarks || 100,
            m.totalObtained ?? m.obtainedMarks ?? 0,
            (m.totalObtained ?? m.obtainedMarks ?? 0) >= 30 ? 'PASS' : 'FAIL'
          ]);
        });
      } else {
        tableRows.push(["No Subjects Found", "-", "-", "-"]);
      }

      autoTable(doc, {
        startY: startY + 18,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], halign: 'center' },
        styles: { fontSize: 10, cellPadding: 5, halign: 'center' }
      });
      const finalY = doc.lastAutoTable.finalY + 10;

      // Summary & Ranks
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Total Obtained Marks: ${resItem.totalObtained} / ${resItem.maxPossibleMarks}`, 15, finalY);
      doc.text(`Percentage: ${resItem.percentage}%`, 130, finalY);

      doc.text(`Division: ${resItem.division}`, 15, finalY + 6);
      doc.text(`Class Rank: #${resItem.classRank}  |  Section Rank: #${resItem.sectionRank}`, 130, finalY + 6);

      // --- 4. Summary & Ranks ---
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Total Obtained Marks: ${resItem.totalObtained} / ${resItem.maxPossibleMarks}`, 15, finalY);
      doc.text(`Percentage: ${resItem.percentage}%`, 130, finalY);

      doc.text(`Division: ${resItem.division}`, 15, finalY + 6);
      doc.text(`Class Rank: #${resItem.classRank}  |  Section Rank: #${resItem.sectionRank}`, 130, finalY + 6);

      // --- 5. Footer / Signatures ---
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`REG. NO. : 0831-026-${resItem.uniqueId || '05381-03'}`, 15, 275);
      
      // Signature changed to Headmaster
      doc.text("HEADMASTER", 160, 275, { align: 'center' });
      doc.setLineWidth(0.3);
      doc.line(140, 270, 185, 270);
    });

    doc.save(`Marksheet_${className}_${section}_${examType}.pdf`);
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>📊 Examination Results & PDF Export</h3>

      {/* Exam Type Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['First Quarterly', 'Half Yearly', 'Second Quarterly', 'Final Exam'].map(type => (
          <button 
            key={type}
            onClick={() => setExamType(type)}
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: examType === type ? '#3b82f6' : '#e2e8f0', color: examType === type ? '#fff' : '#334155', fontWeight: '600', cursor: 'pointer' }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Class</label>
          <select value={className} onChange={(e) => setClassName(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
            <option value="11">Class 11</option>
            <option value="12">Class 12</option>
          </select>
        </div>

        {(className === '11' || className === '12') && (
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Stream</label>
            <select value={stream} onChange={(e) => setStream(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <option value="Science">Science</option>
              <option value="Arts">Arts</option>
            </select>
          </div>
        )}

        <div>
          <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Section</label>
          <input type="text" value={section} onChange={(e) => setSection(e.target.value.toUpperCase())} maxLength="1" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '80px' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button onClick={handleExportPDF} style={{ padding: '9px 18px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            📥 Export All Results (PDF)
          </button>
        </div>
      </div>

      {/* Results Table */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Loading results...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                <th style={{ padding: '10px' }}>Roll No</th>
                <th style={{ padding: '10px' }}>Student Name</th>
                <th style={{ padding: '10px' }}>Father's Name</th>
                <th style={{ padding: '10px' }}>Total Marks</th>
                <th style={{ padding: '10px' }}>Percentage</th>
                <th style={{ padding: '10px' }}>Division</th>
                <th style={{ padding: '10px' }}>Class Rank</th>
                <th style={{ padding: '10px' }}>Sec Rank</th>
                <th style={{ padding: '10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.length > 0 ? (
                results.map((r, i) => (
                  <tr key={r.studentId || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{r.rollNo || '-'}</td>
                    <td style={{ padding: '10px', fontWeight: '600', color: '#2563eb' }}>{r.name}</td>
                    <td style={{ padding: '10px' }}>{r.fatherName || '-'}</td>
                    <td style={{ padding: '10px' }}>{r.totalObtained} / {r.maxPossibleMarks}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{r.percentage}%</td>
                    <td style={{ padding: '10px' }}>{r.division}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#0d9488' }}>#{r.classRank}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#7c3aed' }}>#{r.sectionRank}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', backgroundColor: r.isPass ? '#dcfce7' : '#fee2e2', color: r.isPass ? '#166534' : '#991b1b' }}>
                        {r.isPass ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="9" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>कोई रिजल्ट डेटा नहीं मिला।</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}