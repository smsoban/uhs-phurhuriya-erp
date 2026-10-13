import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import schoolLogo from './assets/SCHOOL_LOGO.png';

export const UDISE_CODE = '10351006802';
export const SESSION = '2026-27';

export const FEE_HEADS = [
  { id: 1, name: 'Admission fee', ix: 50, x: 0, xiArts: 50, xiScience: 50, xiiArts: 0, xiiScience: 0 },
  { id: 2, name: 'Tuition fee', ix: 0, x: 0, xiArts: 180, xiScience: 240, xiiArts: 180, xiiScience: 240 },
  { id: 3, name: 'Development fee', ix: 80, x: 80, xiArts: 200, xiScience: 200, xiiArts: 200, xiiScience: 200 },
  { id: 4, name: 'Transfer fee', ix: 10, x: 0, xiArts: 20, xiScience: 20, xiiArts: 0, xiiScience: 0 },
  { id: 5, name: 'Science fee', ix: 10, x: 10, xiArts: 0, xiScience: 200, xiiArts: 0, xiiScience: 200 },
  { id: 6, name: 'Absence fine', ix: 0, x: 0, xiArts: 0, xiScience: 0, xiiArts: 0, xiiScience: 0 },
  { id: 7, name: 'Late fee fine', ix: 0, x: 0, xiArts: 0, xiScience: 0, xiiArts: 0, xiiScience: 0 },
  { id: 8, name: 'Truancy fee', ix: 0, x: 0, xiArts: 0, xiScience: 0, xiiArts: 0, xiiScience: 0 },
  { id: 9, name: 'Re-admission fee', ix: 0, x: 0, xiArts: 0, xiScience: 0, xiiArts: 0, xiiScience: 0 },
  { id: 10, name: 'Sports fee', ix: 20, x: 20, xiArts: 30, xiScience: 30, xiiArts: 30, xiiScience: 30 },
  { id: 11, name: 'Recreation fee', ix: 20, x: 20, xiArts: 60, xiScience: 60, xiiArts: 60, xiiScience: 60 },
  { id: 12, name: 'Poor students fund', ix: 10, x: 10, xiArts: 10, xiScience: 10, xiiArts: 10, xiiScience: 10 },
  { id: 13, name: 'Electricity fee', ix: 20, x: 20, xiArts: 80, xiScience: 80, xiiArts: 80, xiiScience: 80 },
  { id: 14, name: 'Library fee', ix: 0, x: 0, xiArts: 20, xiScience: 20, xiiArts: 20, xiiScience: 20 },
  { id: 15, name: 'School maintenance', ix: 50, x: 50, xiArts: 150, xiScience: 150, xiiArts: 150, xiiScience: 150 },
  { id: 16, name: 'Identity card', ix: 20, x: 0, xiArts: 20, xiScience: 20, xiiArts: 0, xiiScience: 0 },
  { id: 17, name: 'Scouting fee', ix: 10, x: 10, xiArts: 0, xiScience: 0, xiiArts: 0, xiiScience: 0 },
  { id: 18, name: 'Miscellaneous', ix: 0, x: 0, xiArts: 0, xiScience: 0, xiiArts: 0, xiiScience: 0 },
  { id: 19, name: 'Form / prospectus', ix: 0, x: 0, xiArts: 0, xiScience: 0, xiiArts: 0, xiiScience: 0 },
  { id: 20, name: 'Examination fee', ix: 120, x: 120, xiArts: 120, xiScience: 120, xiiArts: 120, xiiScience: 120 },
];

export const FEE_TOTALS = [
  { key: 'ix', label: 'Class IX - Admission', General: 420, BC: 420, EBC: 420, EWS: 420, SC: 340, ST: 340 },
  { key: 'x', label: 'Class X - Session', General: 340, BC: 340, EBC: 340, EWS: 340, SC: 260, ST: 260 },
  { key: 'xiArts', label: 'Class XI - Arts / Commerce', General: 940, BC: 940, EBC: 940, EWS: 940, SC: 560, ST: 560 },
  { key: 'xiScience', label: 'Class XI - Science', General: 1200, BC: 1200, EBC: 1200, EWS: 1200, SC: 760, ST: 760 },
  { key: 'xiiArts', label: 'Class XII - Arts / Commerce', General: 850, BC: 850, EBC: 850, EWS: 850, SC: 470, ST: 470 },
  { key: 'xiiScience', label: 'Class XII - Science', General: 1110, BC: 1110, EBC: 1110, EWS: 1110, SC: 670, ST: 670 },
];

const FEE_CLASS_OPTIONS = [
  { key: 'ix', label: 'Class IX - Admission' },
  { key: 'x', label: 'Class X - Session' },
  { key: 'xiArts', label: 'Class XI - Arts / Commerce' },
  { key: 'xiScience', label: 'Class XI - Science' },
  { key: 'xiiArts', label: 'Class XII - Arts / Commerce' },
  { key: 'xiiScience', label: 'Class XII - Science' },
];

const FEE_CATEGORIES = ['General', 'BC', 'EBC', 'EWS', 'SC', 'ST'];

function defaultFeeItems(classKey, category) {
  const exempt = category === 'SC' || category === 'ST';
  return FEE_HEADS.map((head) => ({
    id: head.id,
    name: head.name,
    amount: exempt && (head.id === 2 || head.id === 3) ? 0 : Number(head[classKey] || 0),
  }));
}

export const INITIAL_FEE_STRUCTURES = FEE_CLASS_OPTIONS.flatMap((classOption) => FEE_CATEGORIES.map((category) => ({
  id: `${SESSION}|${classOption.key}|${category}`,
  session: SESSION,
  classKey: classOption.key,
  classLabel: classOption.label,
  category,
  items: defaultFeeItems(classOption.key, category),
  updatedBy: 'School Administrator',
  updatedAt: '14-09-2026 07:45 PM',
})));

export const INITIAL_ERP = {
  academicYear: {
    current: '2026-27',
    next: '2027-28',
    status: 'Open',
    closedAt: '',
    startedAt: '',
    progressionOpen: false,
    transitionFrom: '',
    reversalRequest: null,
  },
  progressionHistory: [],
  sections: [
    { id: 'IX', className: 'IX', stream: 'Not applicable', sections: ['A', 'B'] },
    { id: 'X', className: 'X', stream: 'Not applicable', sections: ['A', 'B'] },
    { id: 'XI-SCI', className: 'XI', stream: 'Science', sections: ['A'] },
    { id: 'XI-ART', className: 'XI', stream: 'Arts', sections: ['A'] },
    { id: 'XI-COM', className: 'XI', stream: 'Commerce', sections: ['A'] },
    { id: 'XII-SCI', className: 'XII', stream: 'Science', sections: ['A'] },
    { id: 'XII-ART', className: 'XII', stream: 'Arts', sections: ['A'] },
    { id: 'XII-COM', className: 'XII', stream: 'Commerce', sections: ['A'] },
  ],
  classTeacherAssignments: [
    { id: 1, teacherId: 'EMP-014', teacher: 'Neha Kumari', className: 'IX', stream: 'Not applicable', sections: ['A'] },
    { id: 2, teacherId: 'EMP-018', teacher: 'Vikash Kumar', className: 'X', stream: 'Not applicable', sections: ['A'] },
    { id: 3, teacherId: 'EMP-022', teacher: 'Md. Arif', className: 'XI', stream: 'Arts', sections: ['A'] },
    { id: 4, teacherId: 'EMP-026', teacher: 'Poonam Kumari', className: 'X', stream: 'Not applicable', sections: ['B'] },
    { id: 5, teacherId: 'EMP-031', teacher: 'Amit Kumar', className: 'XII', stream: 'Arts', sections: ['A'] },
    { id: 6, teacherId: 'EMP-034', teacher: 'Priyanka Kumari', className: 'IX', stream: 'Not applicable', sections: ['B'] },
    { id: 7, teacherId: 'EMP-039', teacher: 'Rakesh Ranjan', className: 'XI', stream: 'Science', sections: ['A'] },
    { id: 8, teacherId: 'EMP-041', teacher: 'Shabnam Parveen', className: 'XII', stream: 'Science', sections: ['A'] },
  ],
  dailyRoutineAdjustments: [],
  routine: [
    { id: 1, day: 'Monday', period: 'Prayer', time: '09:30-09:45', className: 'All classes', subject: 'Prayer / Assembly', teacherId: 'ALL', teacher: 'All teachers' },
    { id: 2, day: 'Monday', period: '1', time: '09:45-10:25', className: 'IX-A', subject: 'Science', teacherId: 'EMP-014', teacher: 'Neha Kumari' },
    { id: 3, day: 'Monday', period: '2', time: '10:25-11:05', className: 'X-A', subject: 'Mathematics', teacherId: 'EMP-018', teacher: 'Vikash Kumar' },
    { id: 4, day: 'Monday', period: '3', time: '11:05-11:45', className: 'IX-A', subject: 'Computer', teacherId: 'EMP-047', teacher: 'Nidhi Kumari' },
    { id: 5, day: 'Monday', period: '4', time: '11:45-12:25', className: 'XI-Science-A', subject: 'Physics', teacherId: 'EMP-039', teacher: 'Rakesh Ranjan' },
    { id: 6, day: 'Monday', period: '5', time: '13:05-13:45', className: 'IX-A', subject: 'Science', teacherId: 'EMP-014', teacher: 'Neha Kumari' },
    { id: 7, day: 'Tuesday', period: '1', time: '09:45-10:25', className: 'IX-A', subject: 'Science', teacherId: 'EMP-014', teacher: 'Neha Kumari' },
    { id: 8, day: 'Thursday', period: 'Prayer', time: '09:30-09:45', className: 'All classes', subject: 'Prayer / Assembly', teacherId: 'ALL', teacher: 'All teachers' },
    { id: 9, day: 'Thursday', period: '1', time: '09:45-10:25', className: 'IX-A', subject: 'Science', teacherId: 'EMP-014', teacher: 'Neha Kumari' },
    { id: 10, day: 'Thursday', period: '2', time: '10:25-11:05', className: 'X-A', subject: 'Mathematics', teacherId: 'EMP-018', teacher: 'Vikash Kumar' },
    { id: 11, day: 'Thursday', period: '3', time: '11:05-11:45', className: 'IX-A', subject: 'Computer', teacherId: 'EMP-047', teacher: 'Nidhi Kumari' },
  ],
  examAssignments: [
    { id: 1, teacherId: 'EMP-014', teacher: 'Neha Kumari', className: 'IX', stream: 'Not applicable', section: 'A', subject: 'Science' },
    { id: 2, teacherId: 'EMP-014', teacher: 'Neha Kumari', className: 'X', stream: 'Not applicable', section: 'A', subject: 'Science' },
    { id: 3, teacherId: 'EMP-018', teacher: 'Vikash Kumar', className: 'IX', stream: 'Not applicable', section: 'A', subject: 'Mathematics' },
    { id: 4, teacherId: 'EMP-039', teacher: 'Rakesh Ranjan', className: 'XI', stream: 'Science', section: 'A', subject: 'Physics' },
  ],
  subjectSettings: [],
  feeHeads: FEE_HEADS,
  feeTotals: FEE_TOTALS,
  feeStructures: INITIAL_FEE_STRUCTURES,
  receipts: [
    { id: 'UHS/FEE/2026-27/001', studentId: 'UHS-260207', student: 'Sana Parveen', father: 'Md. Salman', roll: '07', className: 'IX-A', category: 'General', amount: 420, purpose: 'Annual school fee', paymentMode: 'Cash', paidOn: '12-08-2026 11:24 AM', collectedBy: 'Ravi Kumar', collectorPost: 'Clerk', session: SESSION, items: defaultFeeItems('ix', 'General').filter((item) => item.amount > 0).map((item) => ({ ...item, assessed: item.amount, paid: item.amount })) },
  ],
  auditLogs: [
    { id: 1, dateTime: '14-09-2026 06:48 PM', user: 'School Administrator', role: 'Admin', action: 'UPDATE', module: 'Examinations', record: 'Quarterly Examination', detail: 'Result workflow updated' },
    { id: 2, dateTime: '14-09-2026 05:32 PM', user: 'Sunita Kumari', role: 'Headmaster', action: 'INSERT', module: 'Students', record: 'UHS-261211', detail: 'Student record created' },
    { id: 3, dateTime: '14-09-2026 03:06 PM', user: 'Ravi Kumar', role: 'Clerk', action: 'UPDATE', module: 'Fees', record: 'UHS/FEE/2026-27/001', detail: 'Offline fee payment recorded' },
  ],
};

export function formatDateDMY(value) {
  if (!value) return '';
  const raw = String(value).trim();
  if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) return raw;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split('-');
    return `${day}-${month}-${year}`;
  }
  const monthNames = { jan:'01',january:'01',feb:'02',february:'02',mar:'03',march:'03',apr:'04',april:'04',may:'05',jun:'06',june:'06',jul:'07',july:'07',aug:'08',august:'08',sep:'09',september:'09',oct:'10',october:'10',nov:'11',november:'11',dec:'12',december:'12' };
  const named = raw.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (named && monthNames[named[2].toLowerCase()]) return `${String(named[1]).padStart(2,'0')}-${monthNames[named[2].toLowerCase()]}-${named[3]}`;
  return raw;
}

export function calculateRetirementDate(dob) {
  const formatted = formatDateDMY(dob);
  const match = formatted.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return '';
  const day = Number(match[1]);
  const birthMonth = Number(match[2]);
  const retirementYear = Number(match[3]) + 60;
  let retirementMonth = birthMonth;
  let year = retirementYear;
  if (day === 1) {
    retirementMonth -= 1;
    if (retirementMonth === 0) { retirementMonth = 12; year -= 1; }
  }
  const lastDay = new Date(year, retirementMonth, 0).getDate();
  return `${String(lastDay).padStart(2, '0')}-${String(retirementMonth).padStart(2, '0')}-${year}`;
}

function Title({ eyebrow = 'School ERP', title, body, actions }) {
  return <div className="page-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{body && <p>{body}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</div>;
}

function Badge({ children }) {
  const slug = String(children).toLowerCase().replaceAll(' ', '-').replaceAll('/', '-');
  return <span className={`status status-${slug}`}>{children}</span>;
}

const roleNames = { admin: 'School Administrator', headmaster: 'Sunita Kumari', teacher: 'Neha Kumari', clerk: 'Ravi Kumar', student: 'Sana Parveen' };

export function OfficeOverview({ role, data, navigate }) {
  const isClerk = role === 'clerk';
  if (!isClerk) return null;
  const sessionStudents = data.students.filter((student) => student.visibleInSession !== false && student.status !== 'Passed out');
  return <>
    <Title eyebrow="Clerk workspace" title="School office dashboard" body="Student entry, BSEB registration, fee receipts, routine and examination records." actions={<button className="btn btn-primary" onClick={() => navigate('new-student')}>+ Add student</button>} />
    <div className="metrics"><div className="metric metric-blue"><div><span>Student records</span><strong>{sessionStudents.length}</strong><small>Current session only</small></div></div><div className="metric metric-amber"><div><span>BSEB pending</span><strong>{sessionStudents.filter((s) => !s.bsebRegistered).length}</strong><small>Registration updates</small></div></div><div className="metric metric-green"><div><span>Receipts issued</span><strong>{data.receipts?.length || 0}</strong><small>Session {data.academicYear?.current || SESSION}</small></div></div><div className="metric metric-violet"><div><span>Active exams</span><strong>{data.exams.filter((e) => e.status === 'Active' || e.status === 'Published').length}</strong><small>Marks access available</small></div></div></div>
    <div className="dashboard-grid"><section className="content-card"><div className="card-head"><div><span className="eyebrow">Office work</span><h3>Quick actions</h3></div></div><div className="quick-actions office-quick-actions">{[['new-student', 'New student', 'Single record entry'], ['bseb', 'BSEB status', 'Update registration'], ['fees', 'Fee receipt', 'Record offline payment'], ['routine', 'Weekly routine', 'Assign a period'], ['exams', 'Marks entry', 'Single or CSV upload']].map(([key, title, sub]) => <button key={key} onClick={() => navigate(key)}><span><strong>{title}</strong><small>{sub}</small></span></button>)}</div></section><section className="content-card"><div className="card-head"><div><span className="eyebrow">Today</span><h3>Office checklist</h3></div></div>{[['Verify new student documents', 'Open'], ['Update BSEB registration numbers', 'In progress'], ['Print fee receipts', 'Ready'], ['Review marks CSV format', 'Ready']].map(([task, status]) => <div className="schedule-row" key={task}><span><strong>{task}</strong><small>School office</small></span><Badge>{status}</Badge></div>)}</section></div>
    <div className="security-banner"><div><strong>Clerk permissions</strong><span>Bulk marks upload is allowed. Bulk student import, staff role changes, password reset and Audit Log are not available.</span></div></div>
  </>;
}

export function ClassSectionManager({ data, update, notify }) {
  const [form, setForm] = useState({ className: 'IX', stream: 'Not applicable', section: '' });
  const add = (event) => {
    event.preventDefault();
    const section = form.section.trim().toUpperCase();
    if (!section) return;
    const id = form.stream === 'Not applicable' ? form.className : `${form.className}-${form.stream.slice(0, 3).toUpperCase()}`;
    update('sections', (rows) => {
      const found = rows.find((row) => row.id === id);
      if (found) return rows.map((row) => row.id === id ? { ...row, sections: [...new Set([...row.sections, section])] } : row);
      return [...rows, { id, className: form.className, stream: form.stream, sections: [section] }];
    }, { action: 'UPDATE', record: id, detail: `Section ${section} added` });
    setForm({ ...form, section: '' });
    notify(`Section ${section} saved for Class ${form.className}`);
  };
  const remove = (rowId, section) => {
    update('sections', (rows) => rows.map((row) => row.id === rowId ? { ...row, sections: row.sections.filter((item) => item !== section) } : row), { action: 'DELETE', record: `${rowId}-${section}`, detail: 'Section removed' });
    notify(`Section ${section} removed`);
  };
  return <>
    <Title title="Classes, streams & sections" body="Manage IX-X sections and Science, Arts or Commerce sections for XI-XII." />
    <form className="content-card setup-form" onSubmit={add}><label>Class<select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value, stream: ['XI', 'XII'].includes(e.target.value) ? 'Science' : 'Not applicable' })}><option>IX</option><option>X</option><option>XI</option><option>XII</option></select></label><label>Stream<select value={form.stream} disabled={!['XI', 'XII'].includes(form.className)} onChange={(e) => setForm({ ...form, stream: e.target.value })}><option>Not applicable</option><option>Science</option><option>Arts</option><option>Commerce</option></select></label><label>New section<input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} maxLength="4" placeholder="A" required /></label><button className="btn btn-primary" type="submit">Add section</button></form>
    <div className="class-setup-grid">{data.sections.map((row) => <article className="content-card" key={row.id}><div><span className="eyebrow">{row.stream}</span><h3>Class {row.className}</h3></div><div className="section-chips">{row.sections.length ? row.sections.map((section) => <span key={section}><b>Section {section}</b><button onClick={() => remove(row.id, section)} aria-label={`Remove section ${section}`}>×</button></span>) : <em>No section configured</em>}</div></article>)}</div>
  </>;
}

export function AssignmentManager({ data, update, notify }) {
  const teachers = data.teachers.filter((teacher) => teacher.role === 'Teacher' && teacher.status !== 'Inactive');
  const classRows = data.classTeacherAssignments || [];
  const initialTeacherId = teachers[0]?.id || '';
  const initialClassAssignment = classRows.find((item) => item.teacherId === initialTeacherId);
  const [tab, setTab] = useState('class-teacher');
  const [classForm, setClassForm] = useState(initialClassAssignment ? { teacherId: initialTeacherId, className: initialClassAssignment.className, stream: initialClassAssignment.stream, sections: [...initialClassAssignment.sections] } : { teacherId: initialTeacherId, className: 'IX', stream: 'Not applicable', sections: [] });
  const [marksForm, setMarksForm] = useState({ teacherId: initialTeacherId, className: 'IX', stream: 'Not applicable', sections: ['A'], subjects: 'Science' });
  const streamForClass = (className) => ['XI', 'XII'].includes(className) ? 'Science' : 'Not applicable';
  const sectionOptions = (className, stream) => data.sections.find((item) => item.className === className && item.stream === stream)?.sections || [];
  const formatClassLabel = (assignment) => {
    const group = `${assignment.className}${assignment.stream !== 'Not applicable' ? ` ${assignment.stream}` : ''}`;
    return assignment.sections.map((section) => `${group}-${section}`).join(', ');
  };
  const toggleSection = (form, setForm, section) => setForm({ ...form, sections: form.sections.includes(section) ? form.sections.filter((item) => item !== section) : [...form.sections, section] });
  const selectClassTeacher = (teacherId) => {
    const existing = classRows.find((item) => item.teacherId === teacherId);
    setClassForm(existing ? { teacherId, className: existing.className, stream: existing.stream, sections: [...existing.sections] } : { teacherId, className: 'IX', stream: 'Not applicable', sections: [] });
  };
  const syncClassTeacherLabels = (assignments) => update('teachers', (rows) => rows.map((teacher) => {
    const assignment = assignments.find((item) => item.teacherId === teacher.id);
    return { ...teacher, classTeacher: assignment ? formatClassLabel(assignment) : '—' };
  }), { action: 'UPDATE', record: 'Class Teacher labels', detail: 'Teacher profiles synchronized with separate Class Teacher assignments' });
  const saveClassTeacher = (event) => {
    event.preventDefault();
    const teacher = teachers.find((item) => item.id === classForm.teacherId);
    if (!teacher || !classForm.sections.length) { notify('Select at least one section for the Class Teacher'); return; }
    const conflict = classRows.find((item) => item.teacherId !== classForm.teacherId && item.className === classForm.className && item.stream === classForm.stream && item.sections.some((section) => classForm.sections.includes(section)));
    if (conflict) { notify(`Section ${conflict.sections.find((section) => classForm.sections.includes(section))} already has ${conflict.teacher} as Class Teacher`); return; }
    const existing = classRows.find((item) => item.teacherId === classForm.teacherId);
    const nextId = Math.max(0, ...classRows.map((item) => Number(item.id) || 0)) + 1;
    const item = { ...classForm, id: existing?.id || nextId, teacher: teacher.name };
    const nextRows = existing ? classRows.map((row) => row.teacherId === classForm.teacherId ? item : row) : [...classRows, item];
    update('classTeacherAssignments', () => nextRows, { action: existing ? 'UPDATE' : 'INSERT', record: teacher.id, detail: `${teacher.name} assigned as Class Teacher for ${formatClassLabel(item)}` });
    syncClassTeacherLabels(nextRows);
    notify(`${teacher.name} is now Class Teacher for ${formatClassLabel(item)}`);
  };
  const removeClassTeacher = (assignment) => {
    if (!window.confirm(`Remove ${assignment.teacher} as Class Teacher of ${formatClassLabel(assignment)}?`)) return;
    const nextRows = classRows.filter((item) => item.id !== assignment.id);
    update('classTeacherAssignments', () => nextRows, { action: 'DELETE', record: assignment.teacherId, detail: `Class Teacher assignment removed for ${formatClassLabel(assignment)}` });
    syncClassTeacherLabels(nextRows);
    if (classForm.teacherId === assignment.teacherId) setClassForm({ teacherId: assignment.teacherId, className: 'IX', stream: 'Not applicable', sections: [] });
    notify(`${assignment.teacher} Class Teacher assignment removed`);
  };
  const addMarksAssignments = (event) => {
    event.preventDefault();
    const teacher = teachers.find((item) => item.id === marksForm.teacherId);
    const subjects = [...new Set(marksForm.subjects.split(/[,\n]/).map((item) => item.trim()).filter(Boolean))];
    if (!teacher || !marksForm.sections.length || !subjects.length) { notify('Select section(s) and enter at least one subject'); return; }
    const combinations = marksForm.sections.flatMap((section) => subjects.map((subject) => ({ teacherId: teacher.id, teacher: teacher.name, className: marksForm.className, stream: marksForm.stream, section, subject })));
    const assignedElsewhere = combinations.map((item) => ({ item, existing: data.examAssignments.find((row) => row.teacherId !== item.teacherId && row.className === item.className && row.stream === item.stream && row.section === item.section && row.subject.toLowerCase() === item.subject.toLowerCase()) })).find((entry) => entry.existing);
    if (assignedElsewhere) { notify(`${assignedElsewhere.item.subject}, Class ${assignedElsewhere.item.className}-${assignedElsewhere.item.section} is already allotted to ${assignedElsewhere.existing.teacher}`); return; }
    const fresh = combinations.filter((item) => !data.examAssignments.some((row) => row.teacherId === item.teacherId && row.className === item.className && row.stream === item.stream && row.section === item.section && row.subject.toLowerCase() === item.subject.toLowerCase()));
    if (!fresh.length) { notify('These marks-entry assignments already exist'); return; }
    const startId = Math.max(0, ...data.examAssignments.map((item) => Number(item.id) || 0)) + 1;
    const items = fresh.map((item, index) => ({ ...item, id: startId + index }));
    update('examAssignments', (rows) => [...rows, ...items], { action: 'INSERT', record: teacher.id, detail: `${items.length} class-section-subject marks-entry assignment(s) added for ${teacher.name}` });
    notify(`${items.length} marks-entry assignment(s) added for ${teacher.name}`);
  };
  const removeMarksAssignment = (assignment) => {
    if (!window.confirm(`Remove ${assignment.subject}, Class ${assignment.className}-${assignment.section} from ${assignment.teacher}?`)) return;
    update('examAssignments', (rows) => rows.filter((item) => item.id !== assignment.id), { action: 'DELETE', record: `${assignment.className}-${assignment.section}-${assignment.subject}`, detail: `${assignment.teacher} marks-entry assignment removed` });
    notify('Marks-entry assignment removed');
  };
  const classSections = sectionOptions(classForm.className, classForm.stream);
  const marksSections = sectionOptions(marksForm.className, marksForm.stream);
  return <>
    <Title title="Teacher assignments" body="Class Teacher responsibility and examination marks-entry permissions are managed separately." />
    <div className="filter-tabs module-tabs assignment-mode-tabs"><button className={tab === 'class-teacher' ? 'active' : ''} onClick={() => setTab('class-teacher')}>Class Teacher Assignment</button><button className={tab === 'marks-entry' ? 'active' : ''} onClick={() => setTab('marks-entry')}>Marks Entry Subject Allotment</button></div>
    {tab === 'class-teacher' ? <>
      <div className="security-banner assignment-rule-banner"><span className="assignment-rule-number">1</span><div><strong>One class group per Teacher</strong><p>A Teacher may be Class Teacher for multiple sections of the same class/stream group, but cannot be Class Teacher for another class at the same time. Every section can have only one Class Teacher.</p></div></div>
      <form className="content-card assignment-form separated-assignment-form" onSubmit={saveClassTeacher}><label>Teacher<select value={classForm.teacherId} onChange={(event) => selectClassTeacher(event.target.value)}>{teachers.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>Class<select value={classForm.className} onChange={(event) => { const className = event.target.value; setClassForm({ ...classForm, className, stream: streamForClass(className), sections: [] }); }}><option>IX</option><option>X</option><option>XI</option><option>XII</option></select></label><label>Stream<select disabled={!['XI', 'XII'].includes(classForm.className)} value={classForm.stream} onChange={(event) => setClassForm({ ...classForm, stream: event.target.value, sections: [] })}><option>Not applicable</option><option>Science</option><option>Arts</option><option>Commerce</option></select></label><fieldset className="assignment-section-picker"><legend>Sections of this class</legend><div>{classSections.map((section) => <label key={section}><input type="checkbox" checked={classForm.sections.includes(section)} onChange={() => toggleSection(classForm, setClassForm, section)} /><span>Section {section}</span></label>)}{!classSections.length && <em>No sections configured for this class/stream.</em>}</div></fieldset><button className="btn btn-primary" type="submit">Save Class Teacher</button></form>
      <div className="table-card assignment-table"><table><thead><tr><th>Teacher</th><th>Class / Stream</th><th>Assigned Sections</th><th>Rule</th><th>Action</th></tr></thead><tbody>{classRows.map((row) => <tr key={row.id}><td><strong>{row.teacher}</strong><small className="block">{row.teacherId}</small></td><td><strong>{row.className}</strong><small className="block">{row.stream}</small></td><td><div className="section-badge-list">{row.sections.map((section) => <span key={section}>{section}</span>)}</div></td><td><small>One class group only</small></td><td><div className="inline-actions"><button className="table-action" onClick={() => { setClassForm({ teacherId: row.teacherId, className: row.className, stream: row.stream, sections: [...row.sections] }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button><button className="table-action danger-action" onClick={() => removeClassTeacher(row)}>Remove</button></div></td></tr>)}</tbody></table></div>
    </> : <>
      <div className="security-banner assignment-rule-banner marks-rule"><span className="assignment-rule-number">∞</span><div><strong>Independent marks-entry permissions</strong><p>A Teacher may receive one or more subjects across any classes and sections. Each class-section-subject is allotted to one Teacher, and this permission does not make that Teacher a Class Teacher.</p></div></div>
      <form className="content-card assignment-form separated-assignment-form marks-assignment-form" onSubmit={addMarksAssignments}><label>Teacher<select value={marksForm.teacherId} onChange={(event) => setMarksForm({ ...marksForm, teacherId: event.target.value })}>{teachers.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>Class<select value={marksForm.className} onChange={(event) => { const className = event.target.value; const stream = streamForClass(className); setMarksForm({ ...marksForm, className, stream, sections: sectionOptions(className, stream).slice(0, 1) }); }}><option>IX</option><option>X</option><option>XI</option><option>XII</option></select></label><label>Stream<select disabled={!['XI', 'XII'].includes(marksForm.className)} value={marksForm.stream} onChange={(event) => { const stream = event.target.value; setMarksForm({ ...marksForm, stream, sections: sectionOptions(marksForm.className, stream).slice(0, 1) }); }}><option>Not applicable</option><option>Science</option><option>Arts</option><option>Commerce</option></select></label><fieldset className="assignment-section-picker"><legend>Sections for marks entry</legend><div>{marksSections.map((section) => <label key={section}><input type="checkbox" checked={marksForm.sections.includes(section)} onChange={() => toggleSection(marksForm, setMarksForm, section)} /><span>Section {section}</span></label>)}{!marksSections.length && <em>No sections configured for this class/stream.</em>}</div></fieldset><label className="assignment-subjects-field">Subject(s)<textarea value={marksForm.subjects} onChange={(event) => setMarksForm({ ...marksForm, subjects: event.target.value })} placeholder="Science, Mathematics" required /><small>Enter one or more subjects separated by commas.</small></label><button className="btn btn-primary" type="submit">Allot Marks Entry</button></form>
      <div className="table-card assignment-table"><table><thead><tr><th>Teacher</th><th>Class</th><th>Stream</th><th>Section</th><th>Subject</th><th>Permission</th><th>Action</th></tr></thead><tbody>{data.examAssignments.map((row) => <tr key={row.id}><td><strong>{row.teacher}</strong><small className="block">{row.teacherId}</small></td><td>{row.className}</td><td>{row.stream}</td><td>{row.section}</td><td><strong>{row.subject}</strong></td><td><span className="marks-permission-label">Marks entry</span></td><td><button className="table-action danger-action" onClick={() => removeMarksAssignment(row)}>Remove</button></td></tr>)}</tbody></table></div>
    </>}
  </>;
}

export function WeeklyRoutine({ role, data, update, notify }) {
  const editable = ['admin', 'headmaster', 'clerk'].includes(role);
  const canManageTemplate = role === 'admin' || role === 'headmaster';
  const canReschedule = role === 'admin' || role === 'headmaster';
  const [mode, setMode] = useState(canReschedule ? 'daily' : 'weekly');
  const [day, setDay] = useState('Monday');
  const [dailyDate, setDailyDate] = useState('17-09-2026');
  const [substituteDrafts, setSubstituteDrafts] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ period: '1', time: '09:45-10:25', className: 'IX-A', subject: 'Science', teacherId: 'EMP-014' });
  const teacherRows = data.teachers.filter((item) => item.role === 'Teacher' && item.status !== 'Inactive');
  const teacherId = role === 'teacher' ? 'EMP-014' : null;
  const specialPeriods = ['Prayer', 'Lunch', 'PT'];
  const isSpecial = specialPeriods.includes(form.period);
  const rows = data.routine.filter((row) => row.day === day && (!teacherId || row.teacherId === teacherId || row.teacherId === 'ALL'));
  const dmyTime = (value) => { const match = String(value || '').match(/^(\d{2})-(\d{2})-(\d{4})$/); return match ? new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1])).getTime() : Number.NaN; };
  const dayForDate = (value) => { const match = String(value || '').match(/^(\d{2})-(\d{2})-(\d{4})$/); return match ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1])).getDay()] : ''; };
  const leaveDates = (leave) => {
    const legacyDates = String(leave.dates || '').match(/(\d{2}-\d{2}-\d{4})(?:\s+to\s+(\d{2}-\d{2}-\d{4}))?/);
    return { from: leave.from || legacyDates?.[1] || '', to: leave.to || legacyDates?.[2] || leave.from || legacyDates?.[1] || '' };
  };
  const selectedDay = dayForDate(dailyDate);
  const approvedLeaves = (data.leaves || []).filter((leave) => { const range = leaveDates(leave); return leave.status === 'Approved' && dmyTime(dailyDate) >= dmyTime(range.from) && dmyTime(dailyDate) <= dmyTime(range.to); });
  const staffAttendance = (data.attendanceRecords || []).find((record) => record.type === 'staff' && record.date === dailyDate);
  const attendanceUnavailableIds = (staffAttendance?.entries || []).filter((entry) => entry.status === 'Absent' || entry.status === 'Leave').map((entry) => entry.id);
  const unavailableIds = [...new Set([...approvedLeaves.map((leave) => leave.staffId), ...attendanceUnavailableIds])];
  const adjustments = data.dailyRoutineAdjustments || [];
  const dailyRows = data.routine.filter((row) => row.day === selectedDay).map((row) => {
    const leave = row.teacherId !== 'ALL' ? approvedLeaves.find((item) => item.staffId === row.teacherId) : null;
    const adjustment = adjustments.find((item) => item.date === dailyDate && item.routineId === row.id);
    return { ...row, leave, adjustment };
  });
  const timeRange = (value) => {
    const match = String(value || '').match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
    return match ? [Number(match[1]) * 60 + Number(match[2]), Number(match[3]) * 60 + Number(match[4])] : null;
  };
  const sameSlot = (left, right) => {
    if (String(left.period) === String(right.period)) return true;
    const first = timeRange(left.time);
    const second = timeRange(right.time);
    return Boolean(first && second && first[0] < second[1] && second[0] < first[1]);
  };
  const availableSubstitutes = (row) => teacherRows.filter((teacher) => {
    if (teacher.id === row.teacherId || unavailableIds.includes(teacher.id)) return false;
    const hasWeeklyDuty = data.routine.some((entry) => entry.id !== row.id && entry.day === selectedDay && entry.teacherId === teacher.id && sameSlot(entry, row));
    const hasDailyDuty = adjustments.some((entry) => entry.date === dailyDate && entry.routineId !== row.id && entry.substituteId === teacher.id && sameSlot(entry, row));
    return !hasWeeklyDuty && !hasDailyDuty;
  }).sort((left, right) => left.name.localeCompare(right.name));
  const resetForm = () => {
    setEditingId(null);
    setForm({ period: '1', time: '09:45-10:25', className: 'IX-A', subject: 'Science', teacherId: 'EMP-014' });
  };
  const changePeriod = (period) => {
    if (specialPeriods.includes(period)) setForm({ ...form, period, className: 'All classes', subject: period === 'Prayer' ? 'Prayer / Assembly' : period, teacherId: 'ALL' });
    else setForm({ ...form, period, className: isSpecial ? 'IX-A' : form.className, subject: isSpecial ? 'Science' : form.subject, teacherId: form.teacherId === 'ALL' ? 'EMP-014' : form.teacherId });
  };
  const savePeriod = (event) => {
    event.preventDefault();
    const teacher = teacherRows.find((item) => item.id === form.teacherId);
    const normalized = { ...form, className: isSpecial ? 'All classes' : form.className, subject: isSpecial ? (form.period === 'Prayer' ? 'Prayer / Assembly' : form.period) : form.subject, teacherId: isSpecial ? 'ALL' : form.teacherId, teacher: isSpecial ? 'All teachers' : teacher?.name || 'Not assigned' };
    if (!isSpecial && !teacher) { notify('Select an active teacher'); return; }
    const teacherConflict = !isSpecial && data.routine.find((entry) => entry.id !== editingId && entry.day === day && entry.teacherId === normalized.teacherId && sameSlot(entry, normalized));
    if (teacherConflict) { notify(`${teacher.name} is already teaching ${teacherConflict.className} in this period`); return; }
    const classConflict = data.routine.find((entry) => entry.id !== editingId && entry.day === day && entry.className === normalized.className && sameSlot(entry, normalized));
    if (classConflict) { notify(`${normalized.className} already has ${classConflict.subject} in this period`); return; }
    if (editingId !== null) {
      update('routine', (list) => list.map((item) => item.id === editingId ? { ...item, ...normalized, day } : item), { action: 'UPDATE', record: `${day}-${form.period}-${normalized.className}`, detail: 'Weekly routine period updated' });
      update('dailyRoutineAdjustments', (list = []) => list.filter((item) => item.routineId !== editingId), { action: 'DELETE', record: `Routine ${editingId} overrides`, detail: 'Old date-specific substitutions cleared after weekly routine update' });
      notify(`${day} period ${form.period} updated`);
      resetForm();
      return;
    }
    const nextId = Math.max(0, ...data.routine.map((item) => Number(item.id) || 0)) + 1;
    const item = { id: nextId, day, ...normalized };
    update('routine', (list) => [...list, item], { action: 'INSERT', record: `${day}-${form.period}-${item.className}`, detail: isSpecial ? `${form.period} added for all classes and all teachers` : 'Routine period added' });
    notify(`${day} period ${form.period} added`);
  };
  const editPeriod = (row) => {
    setEditingId(row.id);
    setForm({ period: String(row.period), time: row.time, className: row.className, subject: row.subject, teacherId: row.teacherId || 'ALL' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const deletePeriod = (row) => {
    if (!window.confirm(`Delete ${row.day} ${specialPeriods.includes(row.period) ? row.period : `Period ${row.period}`} for ${row.className}?`)) return;
    update('routine', (list) => list.filter((item) => item.id !== row.id), { action: 'DELETE', record: `${row.day}-${row.period}-${row.className}`, detail: 'Weekly routine period deleted' });
    update('dailyRoutineAdjustments', (list = []) => list.filter((item) => item.routineId !== row.id), { action: 'DELETE', record: `Routine ${row.id} overrides`, detail: 'Date-specific substitutions removed with deleted routine period' });
    if (editingId === row.id) resetForm();
    notify(`${row.day} ${specialPeriods.includes(row.period) ? row.period : `period ${row.period}`} deleted`);
  };
  const reschedule = (row) => {
    const substituteId = substituteDrafts[row.id] || row.adjustment?.substituteId || '';
    const substitute = availableSubstitutes(row).find((item) => item.id === substituteId);
    if (!substitute) { notify('This teacher is not free in the selected period. Choose an available teacher.'); return; }
    const record = { id: `${dailyDate}-${row.id}`, date: dailyDate, routineId: row.id, day: selectedDay, period: row.period, time: row.time, className: row.className, subject: row.subject, originalTeacherId: row.teacherId, originalTeacher: row.teacher, substituteId: substitute.id, substituteName: substitute.name, leaveId: row.leave?.id, rescheduledBy: role === 'headmaster' ? 'Sunita Kumari' : 'School Administrator' };
    update('dailyRoutineAdjustments', (items = []) => items.some((item) => item.id === record.id) ? items.map((item) => item.id === record.id ? record : item) : [record, ...items], { action: 'UPDATE', record: record.id, detail: `${row.className} period ${row.period} rescheduled to ${substitute.name}` });
    notify(`${row.className} period ${row.period} assigned to ${substitute.name} for ${dailyDate}`);
  };
  return <>
    <Title title={role === 'teacher' ? 'My weekly routine' : 'Routine management'} body={role === 'teacher' ? 'Your assigned periods and school-wide Prayer, Lunch and PT periods.' : 'Keep the weekly template unchanged and make date-specific substitutions only in Daily rescheduling.'} />
    {canReschedule && <div className="filter-tabs module-tabs routine-mode-tabs"><button className={mode === 'daily' ? 'active' : ''} onClick={() => setMode('daily')}>Daily rescheduling</button><button className={mode === 'weekly' ? 'active' : ''} onClick={() => setMode('weekly')}>Weekly template</button></div>}
    {mode === 'daily' && canReschedule ? <><section className="content-card daily-routine-controls"><label>Date (DD-MM-YYYY)<input value={dailyDate} onChange={(event) => setDailyDate(event.target.value)} placeholder="DD-MM-YYYY" /></label><div><span>Routine day</span><strong>{selectedDay || 'Invalid date'}</strong></div><div><span>Staff on approved leave</span><strong>{approvedLeaves.length}</strong></div><div><span>Uncovered periods</span><strong>{dailyRows.filter((row) => row.leave && !row.adjustment).length}</strong></div></section><div className="daily-routine-board">{dailyRows.sort((a, b) => String(a.period).localeCompare(String(b.period), undefined, { numeric: true })).map((row) => {
      const available = availableSubstitutes(row);
      return <article key={row.id} className={row.leave && !row.adjustment ? 'routine-on-leave' : row.adjustment ? 'routine-rescheduled' : 'routine-normal'}><time>{row.time}</time><span className="daily-routine-main"><b>{specialPeriods.includes(row.period) ? row.period : `Period ${row.period}`}</b><strong>{row.className} · {row.subject}</strong><small>{row.adjustment ? `${row.adjustment.substituteName} · substitute for ${row.teacher}` : row.teacher}</small></span>{row.leave && !row.adjustment ? <div className="routine-reschedule-control"><Badge>Teacher on leave</Badge>{available.length ? <><select value={substituteDrafts[row.id] || ''} onChange={(event) => setSubstituteDrafts({ ...substituteDrafts, [row.id]: event.target.value })}><option value="">Choose free teacher</option>{available.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name} · {teacher.subject}</option>)}</select><button className="btn btn-primary" onClick={() => reschedule(row)}>Reschedule</button></> : <span className="no-free-teacher">No teacher is free in this period</span>}</div> : row.adjustment ? <div className="routine-reschedule-control"><Badge>Rescheduled</Badge>{available.length ? <><select value={substituteDrafts[row.id] || row.adjustment.substituteId} onChange={(event) => setSubstituteDrafts({ ...substituteDrafts, [row.id]: event.target.value })}>{available.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name} · {teacher.subject}</option>)}</select><button className="btn btn-secondary" onClick={() => reschedule(row)}>Change</button></> : <span className="no-free-teacher">No other teacher is free</span>}</div> : <Badge>{row.teacherId === 'ALL' ? 'All school' : 'Scheduled'}</Badge>}</article>;
    })}{!dailyRows.length && <div className="content-card empty-state">No weekly routine is configured for {selectedDay || 'this date'}.</div>}</div></> : <><div className="filter-tabs routine-days">{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((item) => <button className={day === item ? 'active' : ''} onClick={() => { setDay(item); resetForm(); }} key={item}>{item.slice(0, 3)}</button>)}</div>
    {editable && <form className={`content-card routine-form ${editingId !== null ? 'routine-form-editing' : ''}`} onSubmit={savePeriod}><label>Period / activity<select value={form.period} onChange={(event) => changePeriod(event.target.value)}><option>Prayer</option>{['1', '2', '3', '4', '5', '6', '7'].map((item) => <option key={item}>{item}</option>)}<option>Lunch</option><option>PT</option></select></label><label>Time<input value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} required /></label><label>Class / section<input disabled={isSpecial} value={form.className} onChange={(event) => setForm({ ...form, className: event.target.value })} required /></label><label>Subject / activity<input disabled={isSpecial} value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} required /></label><label>Teacher<select disabled={isSpecial} value={form.teacherId} onChange={(event) => setForm({ ...form, teacherId: event.target.value })}>{isSpecial && <option value="ALL">All teachers</option>}{teacherRows.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><div className="routine-form-actions"><button className="btn btn-primary" type="submit">{editingId !== null ? 'Update period' : 'Add period'}</button>{editingId !== null && <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel edit</button>}</div></form>}
    <div className="routine-board">{rows.sort((a, b) => String(a.period).localeCompare(String(b.period), undefined, { numeric: true })).map((row) => <article key={row.id} className={row.teacherId === 'ALL' ? 'routine-schoolwide' : ''}><time>{row.time}</time><span><b>{specialPeriods.includes(row.period) ? row.period : `Period ${row.period}`}</b><strong>{row.className} · {row.subject}</strong><small>{row.teacher}</small></span><div className="routine-row-actions"><Badge>{row.teacherId === 'ALL' ? 'All school' : 'Assigned'}</Badge>{canManageTemplate && <><button type="button" onClick={() => editPeriod(row)}>Edit</button><button className="delete" type="button" onClick={() => deletePeriod(row)}>Delete</button></>}</div></article>)}{!rows.length && <div className="content-card empty-state">No periods configured for {day}.</div>}</div></>}
  </>;
}

const emptyStudent = { name: '', guardian: '', mother: '', className: 'IX', stream: 'Not applicable', section: 'A', roll: '', aadhaar: '', pen: '', eshiksha: '', registration: '', dob: '', gender: 'Female', category: 'General', apaar: '', mobile: '', bsebRegistered: false };

export function NewStudent({ role, data, update, notify }) {
  const allowBulk = role === 'admin' || role === 'headmaster';
  const [form, setForm] = useState(emptyStudent);
  const [error, setError] = useState('');
  const validate = (student) => {
    if (!/^\d{10}$/.test(student.mobile)) return 'Mobile number must contain exactly 10 digits.';
    if (student.aadhaar && !/^\d{12}$/.test(student.aadhaar)) return 'Aadhaar number must contain exactly 12 digits.';
    if (student.pen && !/^\d{11}$/.test(student.pen)) return 'PEN must contain exactly 11 digits.';
    if (student.eshiksha && !/^\d{12}$/.test(student.eshiksha)) return 'e-ShikshaKosh ID must contain exactly 12 digits.';
    if (student.apaar && !/^\d{12}$/.test(student.apaar)) return 'APAAR ID must contain exactly 12 digits.';
    if (!/^\d{2}-\d{2}-\d{4}$/.test(student.dob)) return 'Date of birth must be in DD-MM-YYYY format.';
    if (student.bsebRegistered && !student.registration.trim()) return 'BSEB Registration Number is mandatory when registration status is Yes.';
    return '';
  };
  const save = (event) => {
    event.preventDefault();
    const message = validate(form);
    if (message) { setError(message); return; }
    const nextId = `UHS-${Date.now().toString().slice(-6)}`;
    const classLabel = `${form.className === 'IX' ? '9' : form.className === 'X' ? '10' : form.className === 'XI' ? '11' : '12'}${form.stream !== 'Not applicable' ? ` ${form.stream}` : ''}-${form.section}`;
    const record = { ...form, id: nextId, className: classLabel, admission: '14-09-2026', status: 'Active', attendance: 0, fee: 'Pending' };
    update('students', (rows) => [record, ...rows], { action: 'INSERT', record: nextId, detail: 'Student record created' });
    setForm(emptyStudent); setError(''); notify(`${nextId} student record created`);
  };
  const bulkImport = async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) { setError('CSV must contain a header and at least one student row.'); return; }
    const headers = lines[0].split(',').map((item) => item.trim().toLowerCase());
    const required = ['name', 'father', 'mother', 'class', 'section', 'roll', 'dob', 'gender', 'category', 'mobile'];
    if (!required.every((item) => headers.includes(item))) { setError(`CSV headers required: ${required.join(', ')}`); return; }
    const imported = lines.slice(1).map((line, index) => {
      const values = line.split(',').map((item) => item.trim());
      const row = Object.fromEntries(headers.map((header, column) => [header, values[column] || '']));
      return { id: `UHS-B${Date.now().toString().slice(-4)}${index + 1}`, name: row.name, guardian: row.father, mother: row.mother, className: `${row.class}-${row.section}`, roll: row.roll, dob: row.dob, gender: row.gender, category: row.category, mobile: row.mobile, aadhaar: row.aadhaar || '', pen: row.pen || '', eshiksha: row.eshiksha || '', apaar: row.apaar || '', registration: row.registration || '', bsebRegistered: Boolean(row.registration), admission: '14-09-2026', status: 'Active', attendance: 0, fee: 'Pending' };
    });
    update('students', (rows) => [...imported, ...rows], { action: 'INSERT', record: `${imported.length} students`, detail: 'Bulk student CSV imported' });
    setError(''); notify(`${imported.length} students imported from CSV`); event.target.value = '';
  };
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  return <>
    <Title title="New student entry" body="Create one verified student record. Government IDs are optional; mobile number is mandatory." actions={allowBulk && <label className="btn btn-secondary file-button">Import student CSV<input type="file" accept=".csv,text/csv" onChange={bulkImport} /></label>} />
    {role === 'clerk' && <div className="security-banner"><div><strong>Single entry only</strong><span>Clerk cannot bulk-import students. Admin and Headmaster can use student CSV import.</span></div></div>}
    <form className="content-card student-entry-form" onSubmit={save}><div className="form-row"><label>Student name<input required value={form.name} onChange={(e) => set('name', e.target.value)} /></label><label>Father's name<input required value={form.guardian} onChange={(e) => set('guardian', e.target.value)} /></label></div><div className="form-row"><label>Mother's name<input required value={form.mother} onChange={(e) => set('mother', e.target.value)} /></label><label>Date of birth (DD-MM-YYYY)<input required placeholder="14-02-2012" value={form.dob} onChange={(e) => set('dob', e.target.value)} /></label></div><div className="form-row"><label>Class<select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value, stream: ['XI', 'XII'].includes(e.target.value) ? 'Science' : 'Not applicable' })}><option>IX</option><option>X</option><option>XI</option><option>XII</option></select></label><label>Stream<select disabled={!['XI', 'XII'].includes(form.className)} value={form.stream} onChange={(e) => set('stream', e.target.value)}><option>Not applicable</option><option>Science</option><option>Arts</option><option>Commerce</option></select></label></div><div className="form-row"><label>Section<input required value={form.section} onChange={(e) => set('section', e.target.value.toUpperCase())} /></label><label>Roll number<input required value={form.roll} onChange={(e) => set('roll', e.target.value)} /></label></div><div className="form-row"><label>Gender<select value={form.gender} onChange={(e) => set('gender', e.target.value)}><option>Female</option><option>Male</option><option>Other</option></select></label><label>Category<select value={form.category} onChange={(e) => set('category', e.target.value)}>{['General', 'BC', 'EBC', 'EWS', 'SC', 'ST'].map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="form-row"><label>Mobile number<input required inputMode="numeric" maxLength="10" value={form.mobile} onChange={(e) => set('mobile', e.target.value.replace(/\D/g, ''))} /></label><label>Aadhaar number<input inputMode="numeric" maxLength="12" value={form.aadhaar} onChange={(e) => set('aadhaar', e.target.value.replace(/\D/g, ''))} /></label></div><fieldset className="protected-edit-fields"><legend>Government IDs (optional)</legend><div className="form-row"><label>PEN - 11 digits<input inputMode="numeric" maxLength="11" value={form.pen} onChange={(e) => set('pen', e.target.value.replace(/\D/g, ''))} /></label><label>e-ShikshaKosh ID - 12 digits<input inputMode="numeric" maxLength="12" value={form.eshiksha} onChange={(e) => set('eshiksha', e.target.value.replace(/\D/g, ''))} /></label></div><label>APAAR ID - 12 digits<input inputMode="numeric" maxLength="12" value={form.apaar} onChange={(e) => set('apaar', e.target.value.replace(/\D/g, ''))} /></label></fieldset><label className="checkbox-line"><input type="checkbox" checked={form.bsebRegistered} onChange={(e) => set('bsebRegistered', e.target.checked)} /><span><strong>BSEB registration completed</strong><small>Registration number becomes mandatory when selected.</small></span></label>{form.bsebRegistered && <label>BSEB Registration Number<input required value={form.registration} onChange={(e) => set('registration', e.target.value)} /></label>}{error && <div className="form-error">{error}</div>}<button className="btn btn-primary" type="submit">Create student record</button></form>
  </>;
}

export function BsebRegistration({ data, update, notify }) {
  const [drafts, setDrafts] = useState({});
  const sessionStudents = data.students.filter((student) => student.visibleInSession !== false && student.status !== 'Passed out');
  const save = (student) => {
    const draft = drafts[student.id] || { registered: student.bsebRegistered, registration: student.registration || '' };
    if (draft.registered && !draft.registration.trim()) { notify('Registration number is mandatory when BSEB status is completed'); return; }
    update('students', (rows) => rows.map((row) => row.id === student.id ? { ...row, bsebRegistered: draft.registered, registration: draft.registered ? draft.registration : '' } : row), { action: 'UPDATE', record: student.id, detail: `BSEB registration ${draft.registered ? 'completed' : 'pending'}` });
    notify(`${student.name} BSEB status updated`);
  };
  return <>
    <Title title="BSEB Registration Status & Update" body="Update registration completion and enter the BSEB Registration Number without opening the full student profile." />
    <div className="record-summary"><div><span>Total students</span><strong>{sessionStudents.length}</strong></div><div><span>Registered</span><strong>{sessionStudents.filter((item) => item.bsebRegistered).length}</strong></div><div><span>Pending</span><strong>{sessionStudents.filter((item) => !item.bsebRegistered).length}</strong></div><div><span>Session</span><strong>{data.academicYear?.current || SESSION}</strong></div></div>
    <div className="table-card"><table><thead><tr><th>Student</th><th>Class / Roll</th><th>Status</th><th>Registration number</th><th>Action</th></tr></thead><tbody>{sessionStudents.map((student) => { const draft = drafts[student.id] || { registered: Boolean(student.bsebRegistered), registration: student.registration || '' }; return <tr key={student.id}><td><strong>{student.name}</strong><small className="block">{student.id}</small></td><td>{student.className} · {student.roll}</td><td><label className="inline-check"><input type="checkbox" checked={draft.registered} onChange={(e) => setDrafts({ ...drafts, [student.id]: { ...draft, registered: e.target.checked } })} /> Completed</label></td><td><input className="table-input" disabled={!draft.registered} required={draft.registered} value={draft.registration} onChange={(e) => setDrafts({ ...drafts, [student.id]: { ...draft, registration: e.target.value } })} placeholder={draft.registered ? 'Enter registration number' : 'Not registered'} /></td><td><button className="table-action" onClick={() => save(student)}>Save update</button></td></tr>; })}</tbody></table></div>
  </>;
}

export function AccessControl({ data, update, notify }) {
  const changeRole = (id, nextRole) => {
    update('teachers', (rows) => rows.map((row) => row.id === id ? { ...row, role: nextRole } : row), { action: 'UPDATE', record: id, detail: `ERP role changed to ${nextRole}` });
    notify(`${id} role changed to ${nextRole}`);
  };
  const resetPassword = (name, id) => notify(`${name} (${id}) password reset to 123456`);
  return <>
    <Title eyebrow="Admin only" title="Roles & password reset" body="Change any staff role and reset Staff or Student passwords to the default password 123456." />
    <div className="warning-banner"><span>!</span><div><strong>Security rule</strong><p>Production users must change the default password after first login. Password reset and role change are written to the Audit Log.</p></div></div>
    <div className="table-card"><table><thead><tr><th>User</th><th>User ID</th><th>Current role</th><th>Change role</th><th>Password</th></tr></thead><tbody>{data.teachers.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><small className="block">{item.designation}</small></td><td>{item.userId || item.email}</td><td><Badge>{item.role}</Badge></td><td><select className="table-input" value={item.role} onChange={(e) => changeRole(item.id, e.target.value)}><option>Admin</option><option>Headmaster</option><option>Teacher</option><option>Clerk</option></select></td><td><button className="table-action" onClick={() => resetPassword(item.name, item.id)}>Reset to 123456</button></td></tr>)}{data.students.slice(0, 4).map((item) => <tr key={item.id}><td><strong>{item.name}</strong><small className="block">Student</small></td><td>{item.id}</td><td><Badge>Student</Badge></td><td><span className="muted">Fixed role</span></td><td><button className="table-action" onClick={() => resetPassword(item.name, item.id)}>Reset to 123456</button></td></tr>)}</tbody></table></div>
  </>;
}

export function AuditLog({ data }) {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('All');
  const term = search.toLowerCase();
  const rows = (data.auditLogs || []).filter((row) => (action === 'All' || row.action === action) && (!term || `${row.user} ${row.role} ${row.module} ${row.record} ${row.detail}`.toLowerCase().includes(term)));
  return <>
    <Title eyebrow="Admin only" title="Audit Log" body="Trace who inserted, updated or deleted a school record, with date and time." />
    <div className="filter-bar"><label className="table-search wide"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search user, module or record" /></label><select className="small-select" value={action} onChange={(e) => setAction(e.target.value)}><option>All</option><option>INSERT</option><option>UPDATE</option><option>DELETE</option><option>REQUEST</option><option>APPROVE</option><option>REJECT</option><option>REVERSE</option><option>RESET</option></select></div>
    <div className="table-card"><table><thead><tr><th>Date & time</th><th>User</th><th>Action</th><th>Module</th><th>Record</th><th>Details</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.dateTime}</td><td><strong>{row.user}</strong><small className="block">{row.role}</small></td><td><Badge>{row.action}</Badge></td><td>{row.module}</td><td className="protected-id">{row.record}</td><td>{row.detail}</td></tr>)}</tbody></table></div>
  </>;
}

function feeKeyFor(student) {
  const className = String(student?.className || '9').toLowerCase();
  if (className.startsWith('9') || className.startsWith('ix')) return 'ix';
  if (className.startsWith('10') || className.startsWith('x-') || className === 'x') return 'x';
  if (className.startsWith('11') || className.startsWith('xi')) return className.includes('science') ? 'xiScience' : 'xiArts';
  return className.includes('science') ? 'xiiScience' : 'xiiArts';
}

function receiptClassDetails(record = {}) {
  const raw = String(record.className || record.classLevel || '').trim();
  const rawLower = raw.toLowerCase();
  const classToken = raw.match(/^(12|11|10|9|XII|XI|X|IX)\b/i)?.[1]?.toUpperCase() || '';
  const classLevel = ({ 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII' })[classToken] || classToken || 'Not recorded';
  const inferredStream = ['Science', 'Arts', 'Commerce'].find((name) => rawLower.includes(name.toLowerCase()));
  const explicitStream = String(record.stream || '').trim();
  const stream = explicitStream && explicitStream.toLowerCase() !== 'not applicable' ? explicitStream : inferredStream || 'Not applicable';
  const inferredSection = raw.match(/[-/]\s*([A-Z])\s*$/i)?.[1]?.toUpperCase();
  const explicitSection = String(record.section || inferredSection || '').trim();
  const section = explicitSection ? explicitSection.toUpperCase() : 'Not recorded';
  return { classLevel, stream, section };
}

function currentDateTime() {
  const now = new Date();
  const date = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(now).replaceAll('/', '-');
  const time = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(now);
  return `${date} ${time}`;
}

function amountInWords(value) {
  const number = Math.round(Number(value) || 0);
  if (number === 0) return 'Zero Rupees Only';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const underHundred = (n) => n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ''}`;
  const underThousand = (n) => `${n >= 100 ? `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? ' ' : ''}` : ''}${n % 100 ? underHundred(n % 100) : ''}`;
  let remaining = number;
  const parts = [];
  if (remaining >= 10000000) { parts.push(`${underThousand(Math.floor(remaining / 10000000))} Crore`); remaining %= 10000000; }
  if (remaining >= 100000) { parts.push(`${underThousand(Math.floor(remaining / 100000))} Lakh`); remaining %= 100000; }
  if (remaining >= 1000) { parts.push(`${underThousand(Math.floor(remaining / 1000))} Thousand`); remaining %= 1000; }
  if (remaining) parts.push(underThousand(remaining));
  return `${parts.join(' ')} Rupees Only`;
}

async function loadSchoolLogo() {
  const response = await fetch(schoolLogo);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function downloadFeeReceipt(receipt) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const classDetails = receiptClassDetails(receipt);
  doc.setProperties({ title: `${receipt.id} - Fee Receipt`, subject: 'Item-wise school fee receipt', author: 'UHS Phurhuriya Paraiya' });
  try { doc.addImage(await loadSchoolLogo(), 'PNG', 18, 16, 25, 25, undefined, 'FAST'); } catch { /* keep receipt printable if the asset cannot be read */ }
  doc.setTextColor(26, 45, 75); doc.setFont('times', 'bold'); doc.setFontSize(17); doc.text('UHS PHURHURIYA PARAIYA', 112, 22, { align: 'center' });
  doc.setFont('times', 'normal'); doc.setFontSize(9); doc.text('Phurhuriya, Block Paraiya, District Gaya, Bihar', 112, 29, { align: 'center' });
  doc.setFont('times', 'bold'); doc.text(`UDISE+ ${UDISE_CODE}  |  Academic Session ${receipt.session || SESSION}`, 112, 35, { align: 'center' });
  doc.setFillColor(32, 52, 89); doc.roundedRect(64, 42, 82, 11, 2, 2, 'F');
  doc.setTextColor(255, 255, 255); doc.setFontSize(12); doc.text('SCHOOL FEE RECEIPT', 105, 49.2, { align: 'center' });

  autoTable(doc, {
    startY: 58,
    margin: { left: 18, right: 18 },
    tableWidth: 174,
    theme: 'grid',
    styles: { font: 'times', fontSize: 7.8, cellPadding: 1.35, textColor: [42, 52, 69], lineColor: [195, 202, 214], lineWidth: .2, minCellHeight: 5 },
    columnStyles: { 0: { fontStyle: 'bold', fillColor: [244, 247, 251] }, 2: { fontStyle: 'bold', fillColor: [244, 247, 251] } },
    body: [
      ['Receipt No.', receipt.id, 'Date & Time', receipt.paidOn],
      ['Student Name', receipt.student, 'Student ID', receipt.studentId],
      ["Father's Name", receipt.father || 'Not recorded', 'Roll Number', receipt.roll || 'Not recorded'],
      ['Class', classDetails.classLevel, 'Stream', classDetails.stream],
      ['Section', classDetails.section, 'Category', receipt.category],
      ['Payment Mode', receipt.paymentMode || 'Cash', 'Academic Session', receipt.session || SESSION],
    ],
  });

  const items = (receipt.items || []).filter((item) => Number(item.assessed ?? item.amount ?? 0) > 0 || Number(item.paid ?? 0) > 0);
  const total = items.reduce((sum, item) => sum + Number(item.paid ?? item.amount ?? 0), 0);
  const compactItems = items.length > 12;
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 4,
    margin: { left: 18, right: 18, bottom: 42 },
    tableWidth: 174,
    theme: 'grid',
    head: [['S. No.', 'Fee Particulars', 'Prescribed Amount', 'Amount Paid']],
    body: items.map((item, index) => [index + 1, item.name, `INR ${Number(item.assessed ?? item.amount ?? 0).toLocaleString('en-IN')}`, `INR ${Number(item.paid ?? item.amount ?? 0).toLocaleString('en-IN')}`]),
    foot: [['', 'Grand Total', '', `INR ${total.toLocaleString('en-IN')}`]],
    headStyles: { fillColor: [32, 52, 89], textColor: 255, fontStyle: 'bold', halign: 'center' },
    footStyles: { fillColor: [238, 244, 249], textColor: [26, 45, 75], fontStyle: 'bold' },
    styles: { font: 'times', fontSize: compactItems ? 7 : 8, cellPadding: compactItems ? 1 : 1.5, lineColor: [185, 195, 208], lineWidth: .2, minCellHeight: compactItems ? 4.2 : 5.2 },
    columnStyles: { 0: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
    rowPageBreak: 'avoid',
  });

  const detailsY = doc.lastAutoTable.finalY + 5;
  doc.setTextColor(42, 52, 69); doc.setFont('times', 'bold'); doc.setFontSize(9); doc.text('Amount in words:', 18, detailsY);
  doc.setFont('times', 'normal'); doc.text(amountInWords(total), 49, detailsY);
  doc.setFontSize(7.8); doc.text(`Received and printed by: ${receipt.collectedBy}, ${receipt.collectorPost}`, 18, detailsY + 7);
  doc.text(`Printed on: ${receipt.paidOn}`, 18, detailsY + 12);
  const signatureY = Math.min(Math.max(detailsY + 24, 242), 258);
  doc.setDrawColor(110, 120, 136); doc.line(20, signatureY, 63, signatureY); doc.line(82, signatureY, 128, signatureY); doc.line(148, signatureY, 190, signatureY);
  doc.setFont('times', 'normal'); doc.setFontSize(8); doc.text('Student / Guardian', 41.5, signatureY + 5, { align: 'center' }); doc.text('Receiving Official', 105, signatureY + 5, { align: 'center' }); doc.text('Headmaster', 169, signatureY + 5, { align: 'center' });
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(32, 52, 89); doc.setLineWidth(1); doc.rect(10, 10, 190, 277);
    doc.setDrawColor(211, 169, 66); doc.setLineWidth(.35); doc.rect(13, 13, 184, 271);
    doc.setTextColor(92, 102, 116); doc.setFontSize(7.5);
    doc.text('Computer-generated receipt. Valid after authorized school signature.', 105, 278, { align: 'center' });
  }
  doc.save(`${receipt.id.replaceAll('/', '-')}.pdf`);
}

export function FeeManagement({ role, data, update, notify }) {
  const sessionStudents = data.students.filter((student) => student.visibleInSession !== false && student.status !== 'Passed out');
  const [tab, setTab] = useState(role === 'student' ? 'receipts' : 'payments');
  const [studentId, setStudentId] = useState(sessionStudents[0]?.id || '');
  const [purpose, setPurpose] = useState('Annual school fee');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const student = sessionStudents.find((item) => item.id === studentId) || sessionStudents[0];
  const actor = roleNames[role] || 'School user';
  const post = role === 'admin' ? 'Administrator' : role === 'headmaster' ? 'Headmaster' : role === 'clerk' ? 'Clerk' : 'Student';
  const structures = data.feeStructures?.length ? data.feeStructures : INITIAL_FEE_STRUCTURES;
  const resolveStructure = (classKey, category, session = SESSION) => structures.find((item) => item.classKey === classKey && item.category === category && item.session === session) || { id: `${session}|${classKey}|${category}`, session, classKey, classLabel: FEE_CLASS_OPTIONS.find((item) => item.key === classKey)?.label || classKey, category, items: defaultFeeItems(classKey, category) };
  const initialPaymentStructure = resolveStructure(feeKeyFor(student || {}), student?.category || 'General');
  const [paymentItems, setPaymentItems] = useState(() => initialPaymentStructure.items.map((item) => ({ ...item, assessed: Number(item.amount || 0), paid: Number(item.amount || 0) })));
  const [structureSelection, setStructureSelection] = useState({ session: SESSION, classKey: 'ix', category: 'General' });
  const [structureDraft, setStructureDraft] = useState(() => resolveStructure('ix', 'General').items.map((item) => ({ ...item })));
  const receipts = role === 'student' ? (data.receipts || []).filter((item) => item.studentId === 'UHS-260207') : (data.receipts || []);
  const receiptTotal = paymentItems.reduce((sum, item) => sum + Number(item.paid || 0), 0);
  const structureTotal = structureDraft.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const selectStudent = (id) => {
    const next = sessionStudents.find((item) => item.id === id) || sessionStudents[0];
    const profile = resolveStructure(feeKeyFor(next || {}), next?.category || 'General');
    setStudentId(id);
    setPaymentItems(profile.items.map((item) => ({ ...item, assessed: Number(item.amount || 0), paid: Number(item.amount || 0) })));
  };
  const selectStructure = (patch) => {
    const next = { ...structureSelection, ...patch };
    const profile = resolveStructure(next.classKey, next.category, next.session);
    setStructureSelection(next);
    setStructureDraft(profile.items.map((item) => ({ ...item })));
  };
  const saveStructure = () => {
    const classLabel = FEE_CLASS_OPTIONS.find((item) => item.key === structureSelection.classKey)?.label || structureSelection.classKey;
    const id = `${structureSelection.session}|${structureSelection.classKey}|${structureSelection.category}`;
    const record = { id, ...structureSelection, classLabel, items: structureDraft.map((item) => ({ ...item, amount: Number(item.amount || 0) })), updatedBy: actor, updatedAt: currentDateTime() };
    update('feeStructures', (rows = []) => rows.some((item) => item.id === id) ? rows.map((item) => item.id === id ? record : item) : [...rows, record], { action: 'UPDATE', record: id, detail: `Item-wise fee structure saved; total INR ${structureTotal}` });
    update('feeTotals', (rows) => rows.map((item) => item.key === structureSelection.classKey ? { ...item, [structureSelection.category]: structureTotal } : item), { action: 'UPDATE', record: `${structureSelection.classKey}-${structureSelection.category}`, detail: 'Automatic fee total recalculated' });
    if (feeKeyFor(student || {}) === structureSelection.classKey && (student?.category || 'General') === structureSelection.category) setPaymentItems(record.items.map((item) => ({ ...item, assessed: item.amount, paid: item.amount })));
    notify(`${classLabel} · ${structureSelection.category} fee structure saved`);
  };
  const normalizeReceipt = (receipt) => {
    const linkedStudent = data.students.find((item) => item.id === receipt.studentId) || {};
    const classDetails = receiptClassDetails({ ...linkedStudent, ...receipt });
    const normalized = { ...receipt, ...classDetails };
    if (receipt.items?.length) return normalized;
    const profile = resolveStructure(feeKeyFor({ className: receipt.className }), receipt.category || 'General', receipt.session || SESSION);
    return { ...normalized, father: linkedStudent.guardian, roll: linkedStudent.roll, paymentMode: receipt.paymentMode || 'Cash', items: profile.items.filter((item) => Number(item.amount) > 0).map((item) => ({ ...item, assessed: Number(item.amount), paid: Number(item.amount) })) };
  };
  const recordPayment = async (event) => {
    event.preventDefault();
    if (!receiptTotal) { notify('Enter at least one fee amount before generating the receipt'); return; }
    const lastSequence = Math.max(0, ...(data.receipts || []).map((item) => Number(String(item.id).split('/').pop()) || 0));
    const sequence = String(lastSequence + 1).padStart(3, '0');
    const items = paymentItems.filter((item) => Number(item.assessed || 0) > 0 || Number(item.paid || 0) > 0).map((item) => ({ id: item.id, name: item.name, assessed: Number(item.assessed || 0), paid: Number(item.paid || 0) }));
    const classDetails = receiptClassDetails(student);
    const receipt = { id: `UHS/FEE/${SESSION}/${sequence}`, studentId: student.id, student: student.name, father: student.guardian, roll: student.roll, className: student.className, ...classDetails, category: student.category || 'General', amount: receiptTotal, purpose, paymentMode, paidOn: currentDateTime(), collectedBy: actor, collectorPost: post, session: SESSION, items };
    update('receipts', (rows) => [receipt, ...rows], { action: 'INSERT', record: receipt.id, detail: `INR ${receipt.amount} fee recorded for ${student.id}` });
    update('fees', (rows) => rows.map((row) => row.id === student.id ? { ...row, due: Math.max(0, Number(row.due || 0) - receipt.amount), status: Number(row.due || 0) - receipt.amount <= 0 ? 'Paid' : 'Due' } : row), { action: 'UPDATE', record: student.id, detail: 'Fee balance updated' });
    notify(`${receipt.id} generated with ${items.length} fee items`);
    await downloadFeeReceipt(receipt);
  };
  if (role === 'student') return <>
    <Title title="Fee status & receipts" body={`Academic session ${SESSION}. Download school-issued offline fee receipts.`} />
    <div className="fee-status-card"><span>✓</span><div><small>CURRENT STATUS</small><h2>{receipts.length ? 'Receipt available' : 'No receipt recorded'}</h2><p>Online payment is not enabled. The school office records every payment.</p></div></div>
    <div className="table-card"><table><thead><tr><th>Receipt</th><th>Date</th><th>Fee items</th><th>Amount</th><th></th></tr></thead><tbody>{receipts.map((item) => <tr key={item.id}><td><strong>{item.id}</strong></td><td>{item.paidOn}</td><td>{normalizeReceipt(item).items.length} items</td><td><strong>₹{Number(item.amount).toLocaleString('en-IN')}</strong></td><td><button className="table-action" onClick={() => downloadFeeReceipt(normalizeReceipt(item))}>Download PDF</button></td></tr>)}</tbody></table></div>
  </>;
  return <>
    <Title title="Fee Management" body="Save a separate item-wise fee structure for every class, category and session, then issue a numbered PDF receipt." />
    <div className="filter-tabs module-tabs">{[['payments', 'Record payment'], ['structure', 'Fee structure'], ['receipts', 'Receipts']].map(([key, label]) => <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>)}</div>
    {tab === 'payments' && <div className="fee-workspace"><form className="content-card fee-payment-form" onSubmit={recordPayment}><span className="eyebrow">Offline collection</span><h3>Record item-wise payment</h3><div className="form-row"><label>Student<select value={studentId} onChange={(e) => selectStudent(e.target.value)}>{sessionStudents.map((item) => <option value={item.id} key={item.id}>{item.name} - {item.className}</option>)}</select></label><label>Payment mode<select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}><option>Cash</option><option>Cheque</option><option>Bank deposit</option><option>UPI</option></select></label></div><label>Fee purpose<input value={purpose} onChange={(e) => setPurpose(e.target.value)} required /></label><div className="fee-payment-table"><div className="fee-payment-head"><span>Fee particular</span><span>Prescribed</span><span>Receiving now</span></div>{paymentItems.filter((item) => Number(item.assessed || 0) > 0).map((item) => <label key={item.id}><span><b>{item.id}</b>{item.name}</span><strong>₹{Number(item.assessed).toLocaleString('en-IN')}</strong><input aria-label={`Amount for ${item.name}`} type="number" min="0" max={item.assessed} value={item.paid} onChange={(e) => setPaymentItems((rows) => rows.map((row) => row.id === item.id ? { ...row, paid: Number(e.target.value) } : row))} /></label>)}</div><div className="receipt-preview"><span>Automatic grand total</span><strong>₹{receiptTotal.toLocaleString('en-IN')}</strong><small>{student?.category || 'General'} · {student?.className} · {paymentItems.filter((item) => Number(item.paid) > 0).length} fee items</small></div><button className="btn btn-primary" type="submit">Save payment & download receipt</button></form><section className="content-card receipt-rules"><span className="eyebrow">Receipt format</span><h3>Reference performa controls</h3>{['School logo and UDISE+', 'Unique sequential receipt number', 'Student, class, roll and category', 'Item-wise prescribed and paid amounts', 'Automatic total and amount in words', 'User name, post, date-time and signatures'].map((item) => <div key={item}>✓ <span>{item}</span></div>)}</section></div>}
    {tab === 'structure' && <><div className="security-banner"><div><strong>Class + Category + Session profile</strong><span>Each selection is saved as a separate fee record. SC/ST tuition and development exemptions are already applied from the supplied Bihar fee order.</span></div></div><section className="content-card fee-structure-controls"><label>Academic session<input value={structureSelection.session} onChange={(e) => selectStructure({ session: e.target.value })} /></label><label>Class / stream<select value={structureSelection.classKey} onChange={(e) => selectStructure({ classKey: e.target.value })}>{FEE_CLASS_OPTIONS.map((item) => <option value={item.key} key={item.key}>{item.label}</option>)}</select></label><label>Category<select value={structureSelection.category} onChange={(e) => selectStructure({ category: e.target.value })}>{FEE_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label><div><span>Automatic total</span><strong>₹{structureTotal.toLocaleString('en-IN')}</strong></div><button className="btn btn-primary" type="button" onClick={saveStructure}>Save fee structure</button></section><div className="table-card fee-profile-table"><table><thead><tr><th>S. No.</th><th>Fee Particular</th><th>Amount (₹)</th></tr></thead><tbody>{structureDraft.map((item, index) => <tr key={item.id}><td>{index + 1}</td><td><strong>{item.name}</strong></td><td><input type="number" min="0" value={item.amount} onChange={(e) => setStructureDraft((rows) => rows.map((row) => row.id === item.id ? { ...row, amount: Number(e.target.value) } : row))} /></td></tr>)}</tbody><tfoot><tr><td></td><td><strong>Grand Total</strong></td><td><strong>₹{structureTotal.toLocaleString('en-IN')}</strong></td></tr></tfoot></table></div></>}
    {tab === 'receipts' && <div className="table-card"><table><thead><tr><th>Receipt</th><th>Student</th><th>Fee items</th><th>Amount</th><th>Recorded by</th><th>Date & time</th><th></th></tr></thead><tbody>{receipts.map((item) => <tr key={item.id}><td><strong>{item.id}</strong><small className="block">Session {item.session}</small></td><td>{item.student}<small className="block">{item.studentId}</small></td><td>{normalizeReceipt(item).items.length}</td><td><strong>₹{Number(item.amount).toLocaleString('en-IN')}</strong></td><td>{item.collectedBy}<small className="block">{item.collectorPost}</small></td><td>{item.paidOn}</td><td><button className="table-action" onClick={() => downloadFeeReceipt(normalizeReceipt(item))}>Print item-wise PDF</button></td></tr>)}</tbody></table></div>}
  </>;
}

export function downloadMarksheet(student, result) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const subjectRows = result.subjects.map((row) => Array.isArray(row) ? { subject: row[0], marks: row[1], fullMarks: row[2] || 100, counted: row[3] !== false } : row);
  const totalMaximum = result.totalMaximum || subjectRows.filter((row) => row.counted !== false).reduce((sum, row) => sum + Number(row.fullMarks || 100), 0);
  doc.setDrawColor(42, 36, 102); doc.setLineWidth(1.2); doc.rect(10, 10, 190, 270);
  doc.setDrawColor(213, 165, 59); doc.setLineWidth(.5); doc.rect(14, 14, 182, 262);
  doc.setTextColor(42, 36, 102); doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.text('UHS PHURHURIYA PARAIYA', 105, 27, { align: 'center' });
  doc.setFontSize(9); doc.text(`Gaya, Bihar | UDISE+ ${UDISE_CODE} | Academic Session ${SESSION}`, 105, 35, { align: 'center' });
  doc.setFillColor(42, 36, 102); doc.roundedRect(55, 42, 100, 12, 2, 2, 'F'); doc.setTextColor(255, 255, 255); doc.setFontSize(13); doc.text('STATEMENT OF MARKS', 105, 50, { align: 'center' });
  const stream = student.stream || (student.className.includes('Science') ? 'Science' : student.className.includes('Arts') ? 'Arts' : student.className.includes('Commerce') ? 'Commerce' : 'Not applicable');
  autoTable(doc, { startY: 62, margin: { left: 20, right: 20 }, theme: 'plain', styles: { fontSize: 9, cellPadding: 2 }, body: [['Student name', student.name, 'Roll number', student.roll], ["Father's name", student.guardian, "Mother's name", student.mother], ['Class / Stream', `${student.className} / ${stream}`, 'Section', student.section || student.className.split('-').pop()], ['e-ShikshaKosh ID', student.eshiksha || 'Not recorded', 'Examination', result.exam]] });
  autoTable(doc, { startY: doc.lastAutoTable.finalY + 7, margin: { left: 20, right: 20 }, head: [['Subject', 'Full marks', 'Marks obtained', 'Result rule']], body: subjectRows.map((row) => [row.subject, row.fullMarks || 100, row.marks, row.counted === false ? 'Not counted' : row.status || (Number(row.marks) >= Math.ceil(Number(row.fullMarks || 100) * .3) ? 'Pass' : 'Fail')]), headStyles: { fillColor: [42, 36, 102], textColor: 255 }, alternateRowStyles: { fillColor: [246, 245, 251] }, styles: { fontSize: 9, cellPadding: 3 } });
  const y = doc.lastAutoTable.finalY + 10; doc.setTextColor(42, 36, 102); doc.setFontSize(10); doc.text(`Counted total: ${result.total}/${totalMaximum}`, 22, y); doc.text(`Percentage: ${result.percentage}`, 82, y); doc.text(`Result: ${result.status}`, 142, y); doc.text(`Section Rank: ${result.sectionRank}`, 22, y + 9); doc.text(`${['XI', 'XII', '11', '12'].some((item) => student.className.startsWith(item)) ? 'Stream Rank' : 'Class Rank'}: ${result.rank}`, 82, y + 9);
  doc.setDrawColor(120, 126, 140); doc.line(25, 252, 72, 252); doc.line(132, 252, 180, 252); doc.setFontSize(8); doc.setTextColor(90, 96, 110); doc.text('Class Teacher', 48, 258, { align: 'center' }); doc.text('Headmaster', 156, 258, { align: 'center' });
  doc.save(`${student.name.replaceAll(' ', '-')}-${result.exam.replaceAll(' ', '-')}.pdf`);
}
