import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import schoolLogo from '../assets/SCHOOL_LOGO.png';

const Fees = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manage'); // 'manage' or 'report'
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [feesList, setFeesList] = useState([]);
  const [allFeesRecords, setAllFeesRecords] = useState([]);
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [discount, setDiscount] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Report Filters
  const [reportClassFilter, setReportClassFilter] = useState('All');
  const [reportUserFilter, setReportUserFilter] = useState('All');
  const [reportDateFrom, setReportDateFrom] = useState('');
  const [reportDateTo, setReportDateTo] = useState('');

  const [feesBreakdown, setFeesBreakdown] = useState({
    admissionFee: 0,
    tuitionFee: 0,
    developmentFund: 0,
    studentFund: 0,
    scienceLab: 0,
    commonRoom: 0,
    sportsFee: 0,
    examinationFee: 0,
    electricCharge: 0,
    poorBoysFund: 0,
    libraryFee: 0,
    schoolMaintenance: 0,
    management: 0,
    identityCard: 0,
    formProspectus: 0,
    omrRegistration: 0,
    boardExamination: 0,
    miscellaneous: 0,
    other: 0
  });

  useEffect(() => {
    fetchStudents();
    fetchAllFeesRecords();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/v1/students', config);
      setStudents(res.data.data || []);
    } catch (err) {
      console.error('Error fetching students', err);
    }
  };

  const fetchAllFeesRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/v1/fees', config);
      setAllFeesRecords(res.data.data || []);
    } catch (err) {
      console.error('Error fetching all fees records', err);
    }
  };

  const fetchStudentFees = async (studentId) => {
    if (!studentId) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`/api/v1/fees/student/${studentId}`, config);
      setFeesList(res.data.data || []);
    } catch (err) {
      console.error('Error fetching fees', err);
    }
  };

  const handleBreakdownChange = (e) => {
    setFeesBreakdown({
      ...feesBreakdown,
      [e.target.name]: Number(e.target.value) || 0
    });
  };

  const calculatedTotal = Object.values(feesBreakdown).reduce((acc, val) => acc + val, 0);

  const handleAssignFee = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert('Please select a student');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.post('/api/v1/fees/assign', {
        student: selectedStudent,
        academicYear,
        feesBreakdown,
        totalAmount: calculatedTotal,
        discount: Number(discount) || 0
      }, config);

      alert('Fee structure assigned successfully!');
      fetchStudentFees(selectedStudent);
      fetchAllFeesRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign fee');
    }
  };

  const handlePayFee = async (feeId) => {
    const amount = prompt('Enter payment amount (₹):');
    if (!amount) return;

    const remarks = prompt('Enter Admin Remarks (Optional):') || '';

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axios.post('/api/v1/fees/pay', {
        feeId,
        amount: Number(amount),
        paymentMethod: 'Cash',
        remarks
      }, config);

      alert(`Fee Paid Successfully! Unique Payment ID: ${res.data.paymentId}`);
      fetchStudentFees(selectedStudent);
      fetchAllFeesRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed.');
    }
  };

  const handleDeleteFeeRecord = async (feeId) => {
    if (!window.confirm('Are you sure you want to delete this fee record? (Only Admin has permission)')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.delete(`/api/v1/fees/${feeId}`, config);
      alert('Fee record deleted successfully!');
      fetchStudentFees(selectedStudent);
      fetchAllFeesRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Only Admin can delete fee records!');
    }
  };

  const handlePrintReceipt = (feeRecord, payment) => {
    setSelectedReceipt({ feeRecord, payment });
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return new Date().toLocaleString('en-IN');
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // ---------------- Extract Unique Collectors ----------------
  const collectorsList = Array.from(new Set(
    allFeesRecords.flatMap(f => (f.paymentHistory || []).map(p => p.collectedBy?.name || p.collectedBy?.email)).filter(Boolean)
  ));

  // ---------------- Robust Report Filtering Logic ----------------
  const filteredReportRecords = allFeesRecords.filter((record) => {
    const stu = record.student || {};
    const matchesClass = reportClassFilter === 'All' || String(stu.class) === String(reportClassFilter);

    // Filter by User / Collector
    let matchesUser = true;
    if (reportUserFilter !== 'All') {
      matchesUser = (record.paymentHistory || []).some(
        p => (p.collectedBy?.name === reportUserFilter || p.collectedBy?.email === reportUserFilter)
      );
    }

    let matchesDate = true;
    if (reportDateFrom || reportDateTo) {
      const recordDate = new Date(record.createdAt || record.updatedAt || Date.now());
      if (reportDateFrom) {
        const from = new Date(reportDateFrom);
        from.setHours(0, 0, 0, 0);
        if (recordDate < from) matchesDate = false;
      }
      if (reportDateTo) {
        const to = new Date(reportDateTo);
        to.setHours(23, 59, 59, 999);
        if (recordDate > to) matchesDate = false;
      }
    }

    return matchesClass && matchesUser && matchesDate;
  });

  const totalReportAssigned = filteredReportRecords.reduce((acc, item) => acc + (item.totalAmount || 0), 0);
  const totalReportPaid = filteredReportRecords.reduce((acc, item) => {
    if (reportUserFilter === 'All') {
      return acc + (item.paidAmount || 0);
    } else {
      const userCollected = (item.paymentHistory || [])
        .filter(p => p.collectedBy?.name === reportUserFilter || p.collectedBy?.email === reportUserFilter)
        .reduce((pAcc, pVal) => pAcc + (pVal.amount || 0), 0);
      return acc + userCollected;
    }
  }, 0);
  const totalReportPending = totalReportAssigned - totalReportPaid;

  return (
    <>
      <style>{`
        @media print {
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 15px;
            box-sizing: border-box;
          }
          #printable-receipt {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 88%;
            max-width: 620px;
            padding: 12px;
            box-sizing: border-box;
            page-break-inside: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
        

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '24px', overflowX: 'auto' }}>
          
          <div className="max-w-7xl mx-auto">
            
            {/* Page Title & Navigation Tabs */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h1 className="text-2xl font-bold text-slate-800">+2 Utkramit Madhyamik Vidyalaya - Fee Portal</h1>
              
              <div className="flex gap-2 bg-slate-200 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('manage')}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                    activeTab === 'manage' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  💳 Assign & Pay Fees
                </button>
                <button
                  onClick={() => {
                    setActiveTab('report');
                    fetchAllFeesRecords();
                  }}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                    activeTab === 'report' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  📊 User & Fees Reports
                </button>
              </div>
            </div>

            {/* TAB 1: MANAGE FEES */}
            {activeTab === 'manage' && (
              <>
                <div className="bg-white p-4 rounded shadow mb-6">
                  <label className="block font-semibold mb-2 text-slate-700">Select Student:</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedStudent(val);
                      setSelectedReceipt(null);
                      if (val) {
                        fetchStudentFees(val);
                      } else {
                        setFeesList([]);
                      }
                    }}
                    className="border px-4 py-2 rounded w-full md:w-96 text-slate-800"
                  >
                    <option value="">-- Choose Student --</option>
                    {students
                      .filter((stu) => stu && stu.name && stu.name.trim() !== '')
                      .map((stu) => (
                        <option key={stu._id} value={stu._id}>
                          {stu.name} (Class: {stu.class || 'N/A'}, Roll: {stu.rollNo || stu.rollNumber || 'N/A'})
                        </option>
                      ))}
                  </select>
                </div>

                {selectedStudent && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded shadow lg:col-span-1">
                      <h2 className="text-lg font-bold mb-4 text-slate-800">Assign Fee Heads</h2>
                      <form onSubmit={handleAssignFee} className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600">Academic Year</label>
                          <input
                            type="text"
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            className="border px-2 py-1 rounded w-full text-sm text-slate-800"
                          />
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-2 border p-2 rounded">
                          {Object.keys(feesBreakdown).map((key) => (
                            <div key={key} className="flex justify-between items-center text-xs">
                              <span className="capitalize text-slate-700">{key.replace(/([A-Z])/g, ' $1')}</span>
                              <input
                                type="number"
                                name={key}
                                value={feesBreakdown[key]}
                                onChange={handleBreakdownChange}
                                className="border px-2 py-1 rounded w-20 text-right text-slate-800"
                              />
                            </div>
                          ))}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-600">Discount (₹)</label>
                          <input
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            className="border px-2 py-1 rounded w-full text-sm text-slate-800"
                          />
                        </div>

                        <div className="font-bold text-sm text-slate-800">
                          Total Calculated: ₹{calculatedTotal}
                        </div>

                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 text-sm font-semibold">
                          Save & Assign Fee
                        </button>
                      </form>
                    </div>

                    <div className="bg-white p-4 rounded shadow lg:col-span-2">
                      <h2 className="text-lg font-bold mb-4 text-slate-800">Fee Records & Transactions</h2>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="bg-gray-100 border-b text-slate-700">
                              <th className="p-2">Year</th>
                              <th className="p-2">Total</th>
                              <th className="p-2">Paid</th>
                              <th className="p-2">Status</th>
                              <th className="p-2">Actions & Payments</th>
                            </tr>
                          </thead>
                          <tbody>
                            {feesList.length > 0 ? (
                              feesList.map((fee) => (
                                <tr key={fee._id} className="border-b text-slate-800">
                                  <td className="p-2">{fee.academicYear}</td>
                                  <td className="p-2">₹{fee.totalAmount}</td>
                                  <td className="p-2 text-green-600 font-semibold">₹{fee.paidAmount}</td>
                                  <td className="p-2 font-bold">{fee.status}</td>
                                  <td className="p-2 space-y-2">
                                    {fee.status !== 'Paid' && (
                                      <button
                                        onClick={() => handlePayFee(fee._id)}
                                        className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 block w-full text-center font-medium mb-1"
                                      >
                                        + Receive Payment
                                      </button>
                                    )}
                                    {fee.paymentHistory && fee.paymentHistory.map((pay, idx) => (
                                      <div key={idx} className="bg-slate-50 p-2 rounded text-xs flex flex-col gap-1 border border-slate-200">
                                        <div className="flex justify-between font-semibold text-slate-700">
                                          <span>ID: {pay.paymentId}</span>
                                          <span className="text-green-700">₹{pay.amount}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-600">
                                          👤 <strong>Received By:</strong> {pay.collectedBy?.name || pay.collectedBy?.email || 'Admin'}
                                        </div>
                                        {pay.remarks && (
                                          <div className="text-[10px] text-amber-800 italic">💬 Remarks: {pay.remarks}</div>
                                        )}
                                        <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                                          <span>🕒 {formatDateTime(pay.date)}</span>
                                          <button
                                            onClick={() => handlePrintReceipt(fee, pay)}
                                            className="bg-indigo-600 text-white px-2 py-0.5 rounded hover:bg-indigo-700 font-bold"
                                          >
                                            Print Receipt
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                    <button
                                      onClick={() => handleDeleteFeeRecord(fee._id)}
                                      className="bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded text-xs hover:bg-red-600 hover:text-white block w-full text-center mt-2 transition-all"
                                    >
                                      Delete Record (Admin)
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5" className="p-4 text-center text-gray-500">No fee records found for this student.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB 2: FEES REPORTS */}
            {activeTab === 'report' && (
              <div className="bg-white p-6 rounded-xl shadow printable-area">
                
                {/* Print Button & Filters */}
                <div className="flex justify-between items-center mb-6 print:hidden flex-wrap gap-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    
                    {/* User / Collector Filter */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">User ID / Collector:</label>
                      <select 
                        value={reportUserFilter} 
                        onChange={(e) => setReportUserFilter(e.target.value)}
                        className="border px-3 py-1.5 rounded text-sm text-slate-800 font-medium"
                      >
                        <option value="All">All Users / Collectors</option>
                        {collectorsList.map((user, i) => (
                          <option key={i} value={user}>{user}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Class Filter:</label>
                      <select 
                        value={reportClassFilter} 
                        onChange={(e) => setReportClassFilter(e.target.value)}
                        className="border px-3 py-1.5 rounded text-sm text-slate-800"
                      >
                        <option value="All">All Classes</option>
                        <option value="9">Class 9</option>
                        <option value="10">Class 10</option>
                        <option value="11">Class 11</option>
                        <option value="12">Class 12</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">From Date:</label>
                      <input 
                        type="date" 
                        value={reportDateFrom} 
                        onChange={(e) => setReportDateFrom(e.target.value)}
                        className="border px-3 py-1.5 rounded text-sm text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">To Date:</label>
                      <input 
                        type="date" 
                        value={reportDateTo} 
                        onChange={(e) => setReportDateTo(e.target.value)}
                        className="border px-3 py-1.5 rounded text-sm text-slate-800"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => window.print()} 
                    className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 shadow flex items-center gap-2"
                  >
                    🖨️ Export PDF / Print Report
                  </button>
                </div>

                {/* Report Header for Print */}
                <div className="text-center border-b pb-4 mb-6">
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <img src={schoolLogo} alt="Logo" className="w-12 h-12 object-contain rounded-full" />
                    <h2 className="text-2xl font-black text-slate-900">+2 उत्क्रमित माध्यमिक विद्यालय फुरहुरिया</h2>
                  </div>
                  <p className="text-xs text-slate-600 font-semibold">परैया (गया जी, बिहार) | User-Wise Fee Collection Report</p>
                  {reportUserFilter !== 'All' && (
                    <p className="text-xs font-bold text-blue-700 mt-1">Filtered Collector: {reportUserFilter}</p>
                  )}
                </div>

                {/* Metrics Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
                    <span className="text-xs font-bold text-blue-700 uppercase">Total Assigned Fee</span>
                    <h3 className="text-2xl font-black text-blue-900 mt-1">₹{totalReportAssigned.toLocaleString('en-IN')}</h3>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg text-center">
                    <span className="text-xs font-bold text-emerald-700 uppercase">
                      {reportUserFilter === 'All' ? 'Total Collected Fee' : `Collected by ${reportUserFilter}`}
                    </span>
                    <h3 className="text-2xl font-black text-emerald-900 mt-1">₹{totalReportPaid.toLocaleString('en-IN')}</h3>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-center">
                    <span className="text-xs font-bold text-amber-700 uppercase">Total Pending Fee</span>
                    <h3 className="text-2xl font-black text-amber-900 mt-1">₹{totalReportPending.toLocaleString('en-IN')}</h3>
                  </div>
                </div>

                {/* Transaction-Wise Report Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-300 text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                        <th className="border p-2">Student Name</th>
                        <th className="border p-2">Class & Sec</th>
                        <th className="border p-2">Txn ID</th>
                        <th className="border p-2 text-blue-700 font-bold">Received By (User)</th>
                        <th className="border p-2 text-right">Amount (₹)</th>
                        <th className="border p-2">Date & Time</th>
                        <th className="border p-2">Admin Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReportRecords
                        .flatMap(item => (item.paymentHistory || []).map(p => ({ ...p, student: item.student, academicYear: item.academicYear })))
                        .filter(p => reportUserFilter === 'All' || p.collectedBy?.name === reportUserFilter || p.collectedBy?.email === reportUserFilter)
                        .length > 0 ? (
                          filteredReportRecords
                            .flatMap(item => (item.paymentHistory || []).map(p => ({ ...p, student: item.student, academicYear: item.academicYear })))
                            .filter(p => reportUserFilter === 'All' || p.collectedBy?.name === reportUserFilter || p.collectedBy?.email === reportUserFilter)
                            .map((p, idx) => {
                              const collectorName = p.collectedBy?.name || p.collectedBy?.email || 'Admin';
                              return (
                                <tr key={idx} className="border-b border-slate-200 text-slate-800 hover:bg-slate-50">
                                  <td className="border p-2 font-semibold">{p.student?.name || 'N/A'}</td>
                                  <td className="border p-2">Class {p.student?.class || 'N/A'} - {p.student?.section || 'A'}</td>
                                  <td className="border p-2 font-mono text-[11px]">{p.paymentId}</td>
                                  <td className="border p-2 font-bold text-blue-800 bg-blue-50/50">👤 {collectorName}</td>
                                  <td className="border p-2 text-right font-bold text-emerald-700">₹{p.amount}</td>
                                  <td className="border p-2">{formatDateTime(p.date)}</td>
                                  <td className="border p-2 italic text-slate-600">{p.remarks || '-'}</td>
                                </tr>
                              );
                            })
                        ) : (
                          <tr>
                            <td colSpan="7" className="p-4 text-center text-slate-500">कोई भुगतान रिकॉर्ड उपलब्ध नहीं है।</td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>

                {/* Report Signatures Footer */}
                <div className="hidden print:flex justify-between items-end mt-12 pt-4 border-t border-slate-800 text-xs">
                  <div>
                    <p className="border-t border-slate-800 pt-1 px-4 text-center">Collector Signature</p>
                  </div>
                  <div className="text-center">
                    <p className="border-t border-slate-800 px-6 pt-1 font-bold">Authorized Signatory</p>
                    <p className="text-[10px] text-slate-600">(Headmaster / Principal)</p>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Single Page Receipt Modal Container */}
          {selectedStudent && selectedReceipt && (() => {
            const studentObj = students.find(s => s._id === selectedStudent) || selectedReceipt.feeRecord.student || {};
            const studentClass = String(studentObj.class || selectedReceipt.feeRecord.student?.class || '');
            const studentStream = studentObj.stream || selectedReceipt.feeRecord.student?.stream;
            const showStream = (studentClass === '11' || studentClass === '12') && studentStream && studentStream !== 'N/A';

            return (
              <div id="printable-receipt" className="bg-white text-black border-2 border-black text-[10px] printable-area">
                
                {/* Header */}
                <div className="text-center border-b-2 border-black pb-1.5 mb-2">
                  <div className="flex items-center justify-center gap-2 mb-0.5">
                    <img src={schoolLogo} alt="School Logo" className="w-8 h-8 object-contain rounded-full" />
                    <h2 className="text-lg font-black tracking-wide">+2 उत्क्रमित माध्यमिक विद्यालय फुरहुरिया</h2>
                  </div>
                  <p className="text-[9px] font-semibold">परहुरिया (गया जी, बिहार) | Official Fee Receipt</p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-2 mb-2 border p-1.5 rounded bg-gray-50 leading-snug text-[9.5px]">
                  <div>
                    <p><strong>Student Name:</strong> {studentObj.name || selectedReceipt.feeRecord.student?.name || 'N/A'}</p>
                    <p><strong>Father's Name:</strong> {studentObj.fatherName || selectedReceipt.feeRecord.student?.fatherName || 'N/A'}</p>
                    <p><strong>Roll No:</strong> {studentObj.rollNo || studentObj.rollNumber || selectedReceipt.feeRecord.student?.rollNo || 'N/A'}</p>
                    <p>
                      <strong>Class & Sec:</strong> Class {studentClass || 'N/A'} - {studentObj.section || selectedReceipt.feeRecord.student?.section || 'A'}
                    </p>
                    {showStream && (
                      <p><strong>Stream:</strong> {studentStream}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p><strong>Txn ID:</strong> {selectedReceipt.payment.paymentId}</p>
                    <p><strong>Date & Time:</strong> {formatDateTime(selectedReceipt.payment.date)}</p>
                    <p><strong>Received By:</strong> {selectedReceipt.payment.collectedBy?.name || selectedReceipt.payment.collectedBy?.email || 'Admin'}</p>
                    {selectedReceipt.payment.remarks && (
                      <p><strong>Remarks:</strong> {selectedReceipt.payment.remarks}</p>
                    )}
                  </div>
                </div>

                {/* Breakdown Table */}
                <table className="w-full border-collapse border border-black mb-2 text-[9px]">
                  <thead>
                    <tr className="bg-gray-200 border-b border-black">
                      <th className="border border-black px-1.5 py-0.5 text-left">Fee Head Particulars</th>
                      <th className="border border-black px-1.5 py-0.5 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(selectedReceipt.feeRecord.feesBreakdown || {})
                      .filter(([_, val]) => Number(val) > 0)
                      .map(([key, val]) => (
                        <tr key={key} className="border-b border-gray-300">
                          <td className="border border-black px-1.5 py-0.5 capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
                          <td className="border border-black px-1.5 py-0.5 text-right">₹{val}</td>
                        </tr>
                      ))}
                    <tr className="font-bold bg-gray-100 border-t border-black">
                      <td className="border border-black px-1.5 py-0.5 text-right">Total Fee:</td>
                      <td className="border border-black px-1.5 py-0.5 text-right">₹{selectedReceipt.feeRecord.totalAmount}</td>
                    </tr>
                    <tr className="font-bold bg-gray-200">
                      <td className="border border-black px-1.5 py-0.5 text-right text-green-900">Paid Amount (This Txn):</td>
                      <td className="border border-black px-1.5 py-0.5 text-right text-green-900">₹{selectedReceipt.payment.amount}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Signatures */}
                <div className="flex justify-between items-end mt-4 pt-1 text-[9px]">
                  <div>
                    <p className="border-t border-black pt-0.5 px-2 text-center">Student / Guardian Signature</p>
                  </div>
                  <div className="text-center">
                    <p className="border-t border-black px-3 pt-0.5 font-bold">Authorized Signatory</p>
                    <p className="text-[8px] text-gray-600">({selectedReceipt.payment.collectedBy?.name || 'Admin'})</p>
                  </div>
                </div>

              </div>
            );
          })()}

        </main>

      </div>
    </>
  );
};

export default Fees;