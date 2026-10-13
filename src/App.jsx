import { useEffect, useRef, useState } from 'react';
import { NoticeWorkspace, QueryWorkspace } from './Communications';
import { noticesForAudience, resultStudentsForRole, schoolDate } from './communicationRules';
import { filterNavigation, navigationGroups, publicNavigation } from './navigation';
import {
  assignmentMatchesClass, classNameForAssignment, examMatchesClass,
  preferredMarksExam, sameSubject, studentsForExam, validateMarks,
} from './marksEntryRules';
import { canDecideApproval, approvalTimestamp } from './approvalRules';
import schoolLogo from './assets/SCHOOL_LOGO.png';
import schoolPhoto from './assets/SCHOOL_PHOTO.jpg';
import schoolPhotoAlt from './assets/SCHOOL_PHOTO1.jpg';
import demoActivities from './assets/demo-school-activities.jpg';
import demoTeacherPortraits from './assets/demo-teacher-portraits.jpg';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  UDISE_CODE, SESSION, INITIAL_ERP, calculateRetirementDate, formatDateDMY,
  OfficeOverview, ClassSectionManager, AssignmentManager, WeeklyRoutine,
  NewStudent, BsebRegistration, AccessControl, AuditLog, FeeManagement,
  downloadMarksheet,
} from './erpModules';
import {
  SECONDARY_SUBJECTS, INTERMEDIATE_SUBJECT_CATALOG, defaultIntermediatePaperFormat,
  defaultStudentSubjects, examClassNumber, examStream, evaluateMark, getExamSubjectRule,
  normalizeMark, subjectOptionKey, subjectOptionsForClass,
} from './examRules';

const ATTENDANCE_TODAY = '17-09-2026';
const dmyTime = (value) => { const match=String(value||'').match(/^(\d{2})-(\d{2})-(\d{4})$/); return match?new Date(Number(match[3]),Number(match[2])-1,Number(match[1])).getTime():Number.NaN; };
const routineDayForDate = (value) => { const match=String(value||'').match(/^(\d{2})-(\d{2})-(\d{4})$/); return match?['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date(Number(match[3]),Number(match[2])-1,Number(match[1])).getDay()]:''; };

const INITIAL = {
  registrations: [
    { id: 'REG-2026-041', name: 'Ananya Kumari', father: 'Rakesh Kumar', className: '9', mobile: '98XXXXXX42', applied: '12-09-2026', status: 'Pending' },
    { id: 'REG-2026-042', name: 'Ayaan Raza', father: 'Md. Imran', className: '11 Science', mobile: '70XXXXXX18', applied: '13-09-2026', status: 'Pending' },
    { id: 'REG-2026-039', name: 'Nisha Kumari', father: 'Dinesh Prasad', className: '9', mobile: '88XXXXXX60', applied: '10-09-2026', status: 'Approved' },
  ],
  students: [
    { id: 'UHS-260118', name: 'Rahul Kumar', className: '10-A', stream: 'Not applicable', section: 'A', roll: '18', gender: 'Male', category: 'BC', dob: '18-04-2011', guardian: 'Rakesh Kumar', mother: 'Sunita Devi', mobile: '9876543242', address: 'Phurhuriya, Paraiya, Gaya', admission: '03-04-2025', status: 'Active', attendance: 92, fee: 'Paid', aadhaar: 'XXXX-XXXX-4821', pen: '21470000821', apaar: '551122330841', eshiksha: '812500000118', bsebRegistered: true, registration: 'R-260118' },
    { id: 'UHS-260207', name: 'Sana Parveen', className: '9-A', stream: 'Not applicable', section: 'A', roll: '07', gender: 'Female', category: 'General', dob: '14-02-2012', guardian: 'Md. Salman', mother: 'Shabana Parveen', mobile: '9876543224', address: 'Paraiya, Gaya', admission: '08-04-2026', status: 'Active', attendance: 96, fee: 'Paid', aadhaar: 'XXXX-XXXX-1162', pen: '21470000904', apaar: '551122331162', eshiksha: '812600000207', bsebRegistered: true, registration: 'R-260207' },
    { id: 'UHS-260322', name: 'Kajal Kumari', className: '9-A', stream: 'Not applicable', section: 'A', roll: '12', gender: 'Female', category: 'SC', dob: '08-01-2012', guardian: 'Suresh Prasad', mother: 'Mina Devi', mobile: '8876543240', address: 'Dihura, Paraiya, Gaya', admission: '09-04-2026', status: 'Active', attendance: 91, fee: '₹150 due', aadhaar: 'XXXX-XXXX-1530', pen: '21470000733', apaar: '551122331530', eshiksha: '812900000322', bsebRegistered: false, registration: '' },
    { id: 'UHS-260341', name: 'Arman Ali', className: '9-A', stream: 'Not applicable', section: 'A', roll: '16', gender: 'Male', category: 'EBC', dob: '27-03-2012', guardian: 'Nadeem Ali', mother: 'Razia Khatoon', mobile: '7976543251', address: 'Khaira, Paraiya, Gaya', admission: '10-04-2026', status: 'Active', attendance: 89, fee: 'Paid', aadhaar: 'XXXX-XXXX-1674', pen: '21470000748', apaar: '551122331674', eshiksha: '813000000341', bsebRegistered: false, registration: '' },
    { id: 'UHS-261105', name: 'Aditya Raj', className: '11 Science-A', stream: 'Science', section: 'A', roll: '05', gender: 'Male', category: 'General', dob: '06-06-2010', guardian: 'Manoj Kumar', mother: 'Rekha Devi', mobile: '7076543235', address: 'Maranchi, Paraiya, Gaya', admission: '11-04-2026', status: 'Active', attendance: 86, fee: '₹1,200 due', aadhaar: 'XXXX-XXXX-2408', pen: '21480000135', apaar: '551122332408', eshiksha: '812700001105', bsebRegistered: true, registration: 'R-261105' },
    { id: 'UHS-261211', name: 'Mehak Fatima', className: '12 Arts-A', stream: 'Arts', section: 'A', roll: '11', gender: 'Female', category: 'ST', dob: '22-11-2009', guardian: 'Asif Alam', mother: 'Nusrat Jahan', mobile: '8876543226', address: 'Khaira, Paraiya, Gaya', admission: '05-04-2024', status: 'Active', attendance: 94, fee: 'Paid', aadhaar: 'XXXX-XXXX-3314', pen: '21480000226', apaar: '551122333314', eshiksha: '812800001211', bsebRegistered: true, registration: 'R-261211' },
  ],
  teachers: [
    { id: 'EMP-001', userId: 'headmaster', name: 'Sunita Kumari', gender: 'Female', designation: 'Head of School', subject: 'School Leadership', appointedSubject: 'School Leadership', appointmentGroup: '9-12', category: 'General', eshiksha: '812500000001', dob: '02-01-1980', retirement: '31-01-2040', classes: 'All classes', classTeacher: '—', qualification: 'M.A., B.Ed.', joining: '12-07-2012', mobile: '9876543210', email: 'sunita.kumari@uhs.edu', employmentType: 'Permanent', role: 'Headmaster', status: 'Active', attendance: 97, photoIndex: 0 },
    { id: 'EMP-014', userId: 'teacher', name: 'Neha Kumari', gender: 'Female', designation: 'TGT Science', subject: 'Science', appointedSubject: 'Science', appointmentGroup: '9-10', category: 'EBC', eshiksha: '812500000014', dob: '18-11-1992', retirement: '30-11-2052', classes: 'IX-A, IX-B, X-A', classTeacher: 'IX-A', qualification: 'B.Sc., B.Ed.', joining: '18-11-2023', mobile: '9876543252', email: 'neha.kumari@uhs.edu', employmentType: 'Permanent', role: 'Teacher', status: 'Active', attendance: 94, photoIndex: 1 },
    { id: 'EMP-018', name: 'Vikash Kumar', gender: 'Male', designation: 'TGT Mathematics', subject: 'Mathematics', classes: 'IX-A, X-A, X-B', classTeacher: 'X-A', qualification: 'B.Sc., B.Ed.', joining: '03 Feb 2022', mobile: '70XXXXXX64', email: 'vikash.kumar@uhs.edu', employmentType: 'Permanent', role: 'Teacher', status: 'Active', attendance: 96, photoIndex: 2 },
    { id: 'EMP-022', name: 'Md. Arif', gender: 'Male', designation: 'TGT Urdu', subject: 'Urdu', classes: 'IX–XII', classTeacher: 'XI Arts-A', qualification: 'M.A., B.Ed.', joining: '21 Aug 2019', mobile: '88XXXXXX37', email: 'arif@uhs.edu', employmentType: 'Permanent', role: 'Teacher', status: 'On leave', attendance: 91, photoIndex: 3 },
    { id: 'EMP-026', name: 'Poonam Kumari', gender: 'Female', designation: 'TGT Hindi', subject: 'Hindi', classes: 'IX–XII', classTeacher: 'X-B', qualification: 'M.A., B.Ed.', joining: '08 Sep 2020', mobile: '98XXXXXX28', email: 'poonam.kumari@uhs.edu', employmentType: 'Permanent', role: 'Teacher', status: 'Active', attendance: 95, photoIndex: 4 },
    { id: 'EMP-031', name: 'Amit Kumar', gender: 'Male', designation: 'TGT English', subject: 'English', classes: 'IX–XII', classTeacher: 'XII Arts-A', qualification: 'M.A., B.Ed.', joining: '14 Jun 2021', mobile: '79XXXXXX43', email: 'amit.kumar@uhs.edu', employmentType: 'Permanent', role: 'Teacher', status: 'Active', attendance: 93, photoIndex: 5 },
    { id: 'EMP-034', name: 'Priyanka Kumari', gender: 'Female', designation: 'TGT Social Science', subject: 'Social Science', classes: 'IX–X', classTeacher: 'IX-B', qualification: 'M.A., B.Ed.', joining: '05 Jan 2022', mobile: '88XXXXXX76', email: 'priyanka.kumari@uhs.edu', employmentType: 'Permanent', role: 'Teacher', status: 'Active', attendance: 98, photoIndex: 6 },
    { id: 'EMP-039', name: 'Rakesh Ranjan', gender: 'Male', designation: 'PGT Physics', subject: 'Physics', classes: 'XI–XII Science', classTeacher: 'XI Science-A', qualification: 'M.Sc., B.Ed.', joining: '17 Jul 2018', mobile: '98XXXXXX81', email: 'rakesh.ranjan@uhs.edu', employmentType: 'Permanent', role: 'Teacher', status: 'Active', attendance: 96, photoIndex: 7 },
    { id: 'EMP-041', name: 'Shabnam Parveen', gender: 'Female', designation: 'PGT Chemistry', subject: 'Chemistry', classes: 'XI–XII Science', classTeacher: 'XII Science-A', qualification: 'M.Sc., B.Ed.', joining: '22 Oct 2019', mobile: '70XXXXXX49', email: 'shabnam.parveen@uhs.edu', employmentType: 'Permanent', role: 'Teacher', status: 'Active', attendance: 95, photoIndex: 8 },
    { id: 'EMP-043', name: 'Anil Kumar', gender: 'Male', designation: 'PGT Biology', subject: 'Biology', classes: 'XI–XII Science', classTeacher: '—', qualification: 'M.Sc., B.Ed.', joining: '11 Dec 2020', mobile: '88XXXXXX15', email: 'anil.kumar@uhs.edu', employmentType: 'Permanent', role: 'Teacher', status: 'Active', attendance: 92, photoIndex: 9 },
    { id: 'EMP-047', name: 'Nidhi Kumari', gender: 'Female', designation: 'Computer Teacher', subject: 'ICT & Digital Skills', classes: 'IX–XII', classTeacher: '—', qualification: 'B.C.A., D.El.Ed.', joining: '01 Apr 2024', mobile: '98XXXXXX33', email: 'nidhi.kumari@uhs.edu', employmentType: 'Contract', role: 'Teacher', status: 'Active', attendance: 97, photoIndex: 10 },
    { id: 'EMP-052', name: 'Deepak Kumar', gender: 'Male', designation: 'Physical Education Teacher', subject: 'Sports & Wellness', classes: 'IX–XII', classTeacher: '—', qualification: 'B.P.Ed.', joining: '19 May 2023', mobile: '79XXXXXX62', email: 'deepak.kumar@uhs.edu', employmentType: 'Contract', role: 'Teacher', status: 'Active', attendance: 94, photoIndex: 11 },
  ],
  leaves: [
    { id: 1, staffId: 'EMP-014', name: 'Neha Kumari', role: 'Teacher · Science', from: '16-09-2026', to: '17-09-2026', dates: '16-09-2026 to 17-09-2026', leaveType: 'Medical leave', reason: 'Medical treatment and rest', status: 'Pending' },
    { id: 2, staffId: 'EMP-018', name: 'Vikash Kumar', role: 'Teacher · Mathematics', from: '20-09-2026', to: '20-09-2026', dates: '20-09-2026', leaveType: 'Casual leave', reason: 'Essential personal work', status: 'Pending' },
    { id: 3, staffId: 'EMP-022', name: 'Md. Arif', role: 'Teacher · Urdu', from: '08-09-2026', to: '08-09-2026', dates: '08-09-2026', leaveType: 'Casual leave', reason: 'Personal work', status: 'Approved', approvedBy: 'Sunita Kumari', approvedAt: '07-09-2026 02:10 PM' },
  ],
  inchargeDelegations: [],
  notices: [
    { id: 1, tag: 'Examination', title: 'Half-yearly examination schedule', body: 'Classes 9–12 examinations begin from 05-10-2026. Detailed routine is available in the portal.', date: '12-09-2026' },
    { id: 2, tag: 'Registration', title: 'BSEB registration deadline', body: 'The last date for BSEB registration has been fixed as 22-09-2026.', date: '11-09-2026' },
    { id: 3, tag: 'Activity', title: 'Swachhata Pakhwada activities', body: 'Poster, essay and campus cleanliness activities will be conducted this week.', date: '09-09-2026' },
  ],
  queries: [
    { id: 'Q-1084', from: 'Guardian of Class 9 student', subject: 'Document verification date', date: '13-09-2026', status: 'New' },
    { id: 'Q-1081', from: 'Sana Parveen · IX-A', subject: 'Correction in mother name', date: '11-09-2026', status: 'In review' },
  ],
  exams: [
    { id: 1, name: 'Half Yearly Examination', examType: 'Half Yearly', mode: 'Offline', classes: '9-A', start: '05-10-2026', duration: '3 hours', subject: 'Science', subjectGroup: 'Core', paperFormat: 'Theory 80', status: 'Scheduled', resultStatus: 'Not started', marks: {}, correctionApprovals: { admin: false, headmaster: false } },
    { id: 2, name: 'Monthly Computer Quiz', mode: 'Online', classes: '9–10', start: '18 Sep 2026', duration: '10 minutes', subject: 'Computer', status: 'Published', resultStatus: 'Live', quizAttempt: null },
    { id: 3, name: 'First Quarterly Examination', examType: 'First Quarterly', mode: 'Offline', classes: '9-A', start: '15-07-2026', duration: '3 hours', subject: 'Science', subjectGroup: 'Core', paperFormat: 'Theory 80', status: 'Completed', resultStatus: 'Published', publishedAt: '20-07-2026', publishedBy: 'School Administrator', marks: { 'UHS-260207': 72, 'UHS-260322': 59, 'UHS-260341': 76 }, correctionApprovals: { admin: false, headmaster: false } },
  ],
  fees: [
    { id: 'UHS-261105', name: 'Aditya Raj', className: '11 Science', category: 'Development & exam', due: 850, status: 'Due' },
    { id: 'UHS-260322', name: 'Kajal Kumari', className: '9-A', category: 'Identity card', due: 150, status: 'Due' },
    { id: 'UHS-261209', name: 'Faizan Alam', className: '12 Arts', category: 'Exam', due: 400, status: 'Due' },
  ],
  attendanceRecords: [
    { id: 'STU-16-09-2026-9-A', type: 'student', date: '16-09-2026', group: '9-A', recordedBy: 'Neha Kumari', recordedRole: 'Teacher', entries: [{ id: 'UHS-260207', status: 'Present' }, { id: 'UHS-260322', status: 'Absent' }, { id: 'UHS-260341', status: 'Present' }] },
    { id: 'STU-15-09-2026-9-A', type: 'student', date: '15-09-2026', group: '9-A', recordedBy: 'Neha Kumari', recordedRole: 'Teacher', entries: [{ id: 'UHS-260207', status: 'Present' }, { id: 'UHS-260322', status: 'Present' }, { id: 'UHS-260341', status: 'Present' }] },
    { id: 'STU-14-09-2026-9-A', type: 'student', date: '14-09-2026', group: '9-A', recordedBy: 'Neha Kumari', recordedRole: 'Teacher', entries: [{ id: 'UHS-260207', status: 'Present' }, { id: 'UHS-260322', status: 'Present' }, { id: 'UHS-260341', status: 'Present' }] },
    { id: 'STAFF-16-09-2026', type: 'staff', date: '16-09-2026', group: 'All staff', recordedBy: 'Sunita Kumari', recordedRole: 'Headmaster', entries: [{ id: 'EMP-001', status: 'Present' }, { id: 'EMP-014', status: 'Present' }, { id: 'EMP-018', status: 'Present' }, { id: 'EMP-022', status: 'Leave' }, { id: 'EMP-026', status: 'Present' }, { id: 'EMP-031', status: 'Present' }, { id: 'EMP-034', status: 'Present' }, { id: 'EMP-039', status: 'Present' }, { id: 'EMP-041', status: 'Present' }, { id: 'EMP-043', status: 'Present' }, { id: 'EMP-047', status: 'Present' }, { id: 'EMP-052', status: 'Present' }] },
  ],
  permissions: { teacherCanCreateTests: true, teacherCanEnterMarks: true },
  ...INITIAL_ERP,
};

const EXAM_WORKFLOW_VERSION = 3;
const DEMO_STUDENT_NAMES = [
  'Aarav Kumar', 'Aditi Kumari', 'Adnan Ali', 'Anjali Kumari', 'Arjun Raj',
  'Ayesha Parveen', 'Deepak Kumar', 'Divya Kumari', 'Faizan Alam', 'Gudiya Kumari',
  'Harsh Raj', 'Iram Fatima', 'Karan Kumar', 'Khushi Kumari', 'Manish Kumar',
  'Muskan Parveen', 'Nitesh Kumar', 'Priya Kumari', 'Rohit Raj', 'Saba Parveen',
  'Sahil Kumar', 'Saloni Kumari', 'Shahid Alam', 'Shivani Kumari', 'Sonu Kumar',
  'Suhana Parveen', 'Vikas Kumar', 'Zoya Fatima',
];
const DEMO_FATHERS = ['Rajesh Kumar', 'Manoj Prasad', 'Md. Imran', 'Sanjay Kumar', 'Ashok Paswan', 'Nadeem Alam'];
const DEMO_MOTHERS = ['Sunita Devi', 'Rekha Devi', 'Shabana Parveen', 'Mina Devi', 'Kiran Kumari', 'Nusrat Jahan'];

const configuredClassName = (record, section) => {
  const grade = examClassNumber(record.className);
  return `${grade}${grade >= 11 ? ` ${record.stream}` : ''}-${section}`;
};

function ensureTwentyDemoStudents(baseStudents, sectionRecords) {
  const students = [...baseStudents];
  let groupIndex = 0;
  sectionRecords.forEach((record) => record.sections.forEach((section) => {
    const className = configuredClassName(record, section);
    const existing = students.filter((student) => student.className === className && student.status !== 'Passed out');
    const usedRolls = new Set(existing.map((student) => Number(student.roll)).filter(Number.isFinite));
    let roll = 1;
    while (students.filter((student) => student.className === className && student.status !== 'Passed out').length < 20) {
      while (usedRolls.has(roll)) roll += 1;
      const nameIndex = (groupIndex * 7 + roll - 1) % DEMO_STUDENT_NAMES.length;
      const name = DEMO_STUDENT_NAMES[nameIndex];
      const gender = ['Aditi', 'Anjali', 'Ayesha', 'Divya', 'Gudiya', 'Iram', 'Khushi', 'Muskan', 'Priya', 'Saba', 'Saloni', 'Shivani', 'Suhana', 'Zoya'].some((part) => name.includes(part)) ? 'Female' : 'Male';
      const grade = examClassNumber(className);
      const code = `${String(grade).padStart(2, '0')}${record.stream === 'Not applicable' ? 'NA' : record.stream.slice(0, 3).toUpperCase()}${section}${String(roll).padStart(2, '0')}`;
      const student = {
        id: `DEMO-${code}`,
        name,
        className,
        stream: record.stream,
        section,
        roll: String(roll).padStart(2, '0'),
        gender,
        category: ['General', 'BC', 'EBC', 'SC', 'ST', 'EWS'][(roll + groupIndex) % 6],
        dob: `${String((roll % 27) + 1).padStart(2, '0')}-${String((groupIndex % 12) + 1).padStart(2, '0')}-${grade === 9 ? 2012 : grade === 10 ? 2011 : grade === 11 ? 2010 : 2009}`,
        guardian: DEMO_FATHERS[(roll + groupIndex) % DEMO_FATHERS.length],
        mother: DEMO_MOTHERS[(roll * 2 + groupIndex) % DEMO_MOTHERS.length],
        mobile: String(9000000000 + groupIndex * 100 + roll),
        address: 'Paraiya, Gaya, Bihar',
        admission: '05-04-2026',
        status: 'Active',
        attendance: 82 + ((roll + groupIndex) % 17),
        fee: roll % 5 === 0 ? 'Due' : 'Paid',
        aadhaar: '', pen: '', apaar: '', eshiksha: '',
        bsebRegistered: roll % 3 !== 0,
        registration: roll % 3 !== 0 ? `DEMO-R-${code}` : '',
        academicYear: SESSION,
        visibleInSession: true,
        isDemo: true,
      };
      student.subjectSelections = defaultStudentSubjects(student);
      students.push(student);
      usedRolls.add(roll);
      roll += 1;
    }
    groupIndex += 1;
  }));
  return students;
}

function createDemoBatchExam({ id, examType, classNumber, stream = 'Not applicable', state, start }, students, sectionRecords) {
  const grade = Number(classNumber);
  const sectionRecord = sectionRecords.find((item) => examClassNumber(item.className) === grade && (grade < 11 || item.stream === stream));
  const sections = sectionRecord?.sections?.length ? sectionRecord.sections : ['A'];
  const papers = sections.flatMap((section) => {
    const className = `${grade}${grade >= 11 ? ` ${stream}` : ''}-${section}`;
    const classStudents = students.filter((student) => student.className === className && student.status !== 'Passed out');
    const subjects = [...new Map((classStudents.length ? classStudents.flatMap((student) => student.subjectSelections?.length ? student.subjectSelections : defaultStudentSubjects(student)) : defaultStudentSubjects({ className })).map((paper) => [subjectOptionKey(paper), paper])).values()];
    return subjects.map((paper) => ({ ...paper, className, section, key: `${className}::${subjectOptionKey(paper)}` }));
  });
  const allPaperMarks = {};
  const paperStatuses = {};
  const studentEntryStatuses = {};
  papers.forEach((paper, paperIndex) => {
    if (state === 'scheduled') return;
    const eligible = students.filter((student) => student.className === paper.className && (student.subjectSelections?.length ? student.subjectSelections : defaultStudentSubjects(student)).some((subject) => subjectOptionKey(subject) === subjectOptionKey(paper)));
    const paperFormat = grade >= 11 ? defaultIntermediatePaperFormat(paper.name) : 'Auto';
    const rule = getExamSubjectRule({ classes: paper.className, examType, subject: paper.name, subjectGroup: paper.group, paperFormat });
    const completePaper = ['ready', 'published'].includes(state) || (state === 'active' && paperIndex < Math.max(1, Math.floor(papers.length / 3)));
    const enteredStudents = completePaper ? eligible : eligible.slice(0, 8);
    allPaperMarks[paper.key] = Object.fromEntries(enteredStudents.map((student, studentIndex) => {
      const theory = Math.min(rule.theoryMax, Math.max(rule.theoryPassThreshold || rule.passThreshold || 30, 45 + ((studentIndex * 3 + paperIndex * 5) % Math.max(1, rule.theoryMax - 44))));
      const component = rule.componentMax ? Math.min(rule.componentMax, 18 + ((studentIndex + paperIndex) % Math.max(1, rule.componentMax - 17))) : null;
      return [student.id, rule.componentMax ? { theory, component, total: theory + component } : theory];
    }));
    paperStatuses[paper.key] = completePaper ? 'Submitted' : 'Draft';
  });
  if (['ready', 'published'].includes(state)) {
    students.filter((student) => examClassNumber(student.className) === grade && (grade < 11 || examStream(student.className) === stream)).forEach((student) => {
      studentEntryStatuses[`${student.className}::${student.id}`] = 'Submitted';
    });
  }
  const published = state === 'published';
  const ready = state === 'ready';
  return {
    id,
    isBatch: true,
    isDemo: true,
    name: `${examType} Examination`,
    examType,
    mode: 'Offline',
    classNumber: String(grade),
    stream,
    sections,
    classes: `${grade}${grade >= 11 ? ` ${stream}` : ''} · All sections (${sections.join(', ')})`,
    start,
    duration: '3 hours',
    subject: 'All subjects',
    subjectGroup: 'All',
    paperFormat: 'Per subject settings',
    papers,
    allPaperMarks,
    paperStatuses,
    studentEntryStatuses,
    status: state === 'scheduled' ? 'Scheduled' : published ? 'Completed' : 'Active',
    resultStatus: state === 'scheduled' ? 'Not started' : ready ? 'Submitted' : published ? 'Published' : 'Draft',
    marks: {},
    correctionApprovals: { admin: false, headmaster: false },
    createdBy: 'School Administrator',
    academicYear: SESSION,
    ...(published ? { publishedAt: '20-09-2026', publishedBy: 'Sunita Kumari' } : {}),
  };
}

INITIAL.students = ensureTwentyDemoStudents(INITIAL.students, INITIAL.sections);
const demoWorkflowExams = [
  createDemoBatchExam({ id: 'DEMO-EXAM-SCHEDULED', examType: 'Second Quarterly', classNumber: 9, state: 'scheduled', start: '20-10-2026' }, INITIAL.students, INITIAL.sections),
  createDemoBatchExam({ id: 'DEMO-EXAM-ACTIVE', examType: 'Half Yearly', classNumber: 10, state: 'active', start: '05-10-2026' }, INITIAL.students, INITIAL.sections),
  createDemoBatchExam({ id: 'DEMO-EXAM-READY', examType: 'First Quarterly', classNumber: 11, stream: 'Science', state: 'ready', start: '15-07-2026' }, INITIAL.students, INITIAL.sections),
  createDemoBatchExam({ id: 'DEMO-EXAM-PUBLISHED', examType: 'First Quarterly', classNumber: 9, state: 'published', start: '15-07-2026' }, INITIAL.students, INITIAL.sections),
];
INITIAL.exams = [...demoWorkflowExams, ...INITIAL.exams.filter((exam) => exam.mode === 'Online')];

const roleConfig = {
  admin: { name: 'School Administrator', subtitle: 'Full ERP access', initials: 'SA' },
  headmaster: { name: 'Sunita Kumari', subtitle: 'Headmaster · Operational access', initials: 'SK' },
  teacher: { name: 'Neha Kumari', subtitle: 'Science Teacher · IX-A', initials: 'NK' },
  clerk: { name: 'Ravi Kumar', subtitle: 'School Clerk · Office workspace', initials: 'RK' },
  student: { name: 'Sana Parveen', subtitle: 'Class IX-A · Roll 07', initials: 'SP' },
};

const activityPositions = ['0% 0%', '50% 0%', '100% 0%', '0% 100%', '50% 100%', '100% 100%'];
const teacherPortraitPositions = [
  '0% 0%', '33.333% 0%', '66.667% 0%', '100% 0%',
  '0% 50%', '33.333% 50%', '66.667% 50%', '100% 50%',
  '0% 100%', '33.333% 100%', '66.667% 100%', '100% 100%',
];

const navByRole = {
  admin: [
    ['overview', 'Overview', 'grid'], ['registrations', 'Registrations', 'file'], ['students', 'Student records', 'users'],
    ['new-student', 'New student entry', 'user'], ['bseb', 'BSEB registration', 'file'], ['bonafide', 'Bonafide certificates', 'file'], ['class-setup', 'Classes & sections', 'grid'],
    ['assignments', 'Teacher assignments', 'teacher'], ['subject-settings', 'Subject settings', 'exam'], ['routine', 'Routine management', 'calendar'], ['attendance', 'Attendance & reports', 'check'], ['exams', 'Examinations', 'exam'],
    ['teachers', 'Teachers & staff', 'teacher'], ['leaves', 'Leave management', 'calendar'], ['fees', 'Fee management', 'wallet'],
    ['notices', 'Notices', 'bell'], ['queries', 'Queries', 'message'], ['gallery', 'Gallery', 'image'],
    ['academic-year', 'Academic year', 'calendar'], ['progression', 'Student progression', 'up'], ['access', 'Roles & passwords', 'user'], ['audit', 'Audit Log', 'file'],
  ],
  headmaster: [
    ['overview', 'Overview', 'grid'], ['registrations', 'Registrations', 'file'], ['students', 'Student records', 'users'],
    ['new-student', 'New student entry', 'user'], ['bseb', 'BSEB registration', 'file'], ['bonafide', 'Bonafide certificates', 'file'], ['class-setup', 'Classes & sections', 'grid'],
    ['assignments', 'Teacher assignments', 'teacher'], ['subject-settings', 'Subject settings', 'exam'], ['routine', 'Routine management', 'calendar'], ['attendance', 'Attendance & reports', 'check'], ['exams', 'Examinations', 'exam'],
    ['teachers', 'Teachers & staff', 'teacher'], ['leaves', 'Leave management', 'calendar'], ['fees', 'Fee management', 'wallet'],
    ['notices', 'Notices', 'bell'], ['queries', 'Queries', 'message'], ['gallery', 'Gallery', 'image'], ['academic-year', 'Academic year approval', 'calendar'],
  ],
  teacher: [
    ['overview', 'Overview', 'grid'], ['teachers', 'My profile', 'teacher'], ['students', 'My class students', 'users'],
    ['routine', 'My weekly routine', 'calendar'], ['attendance', 'Attendance', 'check'], ['exams', 'Assigned marks & exams', 'exam'],
    ['leaves', 'My leave', 'calendar'], ['notices', 'Notices', 'bell'],
  ],
  clerk: [
    ['overview', 'Overview', 'grid'], ['students', 'Student records', 'users'], ['new-student', 'New student entry', 'user'],
    ['bseb', 'BSEB registration', 'file'], ['bonafide', 'Bonafide certificates', 'file'], ['subject-settings', 'Subject settings', 'exam'], ['routine', 'Weekly routine', 'calendar'], ['exams', 'Marks & exams', 'exam'],
    ['fees', 'Fee management', 'wallet'], ['notices', 'Notices', 'bell'],
  ],
  student: [
    ['overview', 'Overview', 'grid'], ['profile', 'My profile', 'user'], ['attendance', 'Attendance', 'check'],
    ['exams', 'Exams & results', 'exam'], ['fees', 'Fee status', 'wallet'], ['notices', 'Notices', 'bell'], ['queries', 'Ask a query', 'message'],
  ],
};

const iconPaths = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  exam: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  teacher: '<path d="M3 20h18M5 20V9l7-5 7 5v11M9 20v-6h6v6"/>',
  calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  wallet: '<path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h16v10a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6"/><path d="M16 14h2"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
  up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  logout: '<path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6"/>',
  home: '<path d="M3 11l9-8 9 8v10h-6v-7H9v7H3z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
};

function Icon({ name, size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconPaths[name] || iconPaths.grid }} />;
}

function usePersistentState() {
  const [data, setData] = useState(() => {
    try {
      const stored=JSON.parse(localStorage.getItem('uhs-demo-data'));
      if(!stored)return INITIAL;
      const storedStudents=stored.students||INITIAL.students;
      const students=[...storedStudents.map((student)=>{const merged={...INITIAL.students.find((sample)=>sample.id===student.id),...student};const legacyScience=examStream(merged.className)==='Science'&&merged.subjectSelections?.some((subject)=>subject.group==='Elective');return legacyScience?{...merged,subjectSelections:defaultStudentSubjects(merged)}:merged;}),...INITIAL.students.filter((sample)=>!storedStudents.some((student)=>student.id===sample.id))];
      const storedExams=stored.exams||[];
      const migratedExams=stored.examWorkflowVersion===EXAM_WORKFLOW_VERSION?storedExams:storedExams.filter((exam)=>![1,3].includes(exam.id));
      const exams=[...migratedExams.map((exam)=>({...INITIAL.exams.find((sample)=>sample.id===exam.id),...exam})),...INITIAL.exams.filter((sample)=>!migratedExams.some((exam)=>exam.id===sample.id))];
      const classTeacherAssignments=stored.classTeacherAssignments||INITIAL.classTeacherAssignments;
      const teachers=(stored.teachers||INITIAL.teachers).map((teacher)=>{const merged={...INITIAL.teachers.find((sample)=>sample.id===teacher.id),...teacher};const assignment=classTeacherAssignments.find((item)=>item.teacherId===merged.id);const group=assignment?`${assignment.className}${assignment.stream!=='Not applicable'?` ${assignment.stream}`:''}`:'';return {...merged,classTeacher:assignment?assignment.sections.map((section)=>`${group}-${section}`).join(', '):'—'};});
      const storedRoutine=stored.routine||INITIAL.routine;
      const routine=[...storedRoutine,...INITIAL.routine.filter((sample)=>!storedRoutine.some((row)=>row.id===sample.id))].map((row)=>row.leaveId&&row.originalTeacherId?{...row,teacherId:row.originalTeacherId,teacher:row.originalTeacher,temporary:false,leaveId:null,temporaryFrom:null,temporaryTo:null,originalTeacherId:null,originalTeacher:null}:['Prayer','Lunch','PT'].includes(row.period)?{...row,className:'All classes',subject:row.period==='Prayer'?'Prayer / Assembly':row.period,teacherId:'ALL',teacher:'All teachers'}:row);
      return {...INITIAL,...stored,students,exams,teachers,routine,classTeacherAssignments,examWorkflowVersion:EXAM_WORKFLOW_VERSION,dailyRoutineAdjustments:stored.dailyRoutineAdjustments||INITIAL.dailyRoutineAdjustments};
    } catch { return INITIAL; }
  });
  useEffect(() => { localStorage.setItem('uhs-demo-data', JSON.stringify(data)); }, [data]);
  const update = (key, fn) => setData((current) => ({ ...current, [key]: fn(current[key]) }));
  const reset = () => { setData(INITIAL); localStorage.removeItem('uhs-demo-data'); };
  return { data, update, reset };
}

function Logo({ compact = false }) {
  return <div className={`brand ${compact ? 'brand-compact' : ''}`}>
    <img src={schoolLogo} alt="UHS Phurhuriya emblem" />
    <div><strong>UHS Phurhuriya</strong><span>Paraiya, Gaya · Bihar</span></div>
  </div>;
}

function Toast({ message }) {
  if (!message) return null;
  return <div className="toast"><span className="toast-check"><Icon name="check" size={14} /></span>{message}</div>;
}

function Modal({ title, children, onClose, footer }) {
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-head"><div><p className="eyebrow">UHS ERP</p><h3>{title}</h3></div><button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" /></button></div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </div>
  </div>;
}

function RejectApproval({disabled=false,onReject,label='Reject request'}) {
  const [open,setOpen]=useState(false);
  const [reason,setReason]=useState('');
  return <><button className="btn btn-secondary danger-action" disabled={disabled} onClick={()=>{setReason('');setOpen(true);}}>{label}</button>{open&&<Modal title={label} onClose={()=>setOpen(false)} footer={<><button className="btn btn-secondary" onClick={()=>setOpen(false)}>Cancel</button><button className="btn btn-primary" disabled={!reason.trim()} onClick={()=>{onReject(reason.trim());setOpen(false);}}>Confirm rejection</button></>}><label>Reason for rejection<textarea autoFocus value={reason} onChange={(event)=>setReason(event.target.value)} required placeholder="Explain why this request is rejected"/></label><p>The requested change will not be applied. The reason and your decision will be saved in Audit Log.</p></Modal>}</>;
}

function PublicSite({ onPortal, data, update, notify }) {
  const [page, setPage] = useState('home');
  const [mobile, setMobile] = useState(false);
  const publicNavRef = useRef(null);
  const closePublicGroups = () => publicNavRef.current?.querySelectorAll('details[open]').forEach(group => { group.open = false; });
  useEffect(() => {
    const closeOutside = event => { if (!publicNavRef.current?.contains(event.target)) closePublicGroups(); };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);
  const go = (next) => { setPage(next); setMobile(false); closePublicGroups(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return <div className={`public-shell modern-public ${page === 'home' ? 'purple-home' : ''}`}>
    <div className="public-topbar"><span>UDISE+ Code: {UDISE_CODE}</span><span>Academic Session {data.academicYear?.current || SESSION}</span><span>उत्कृष्ट शिक्षा · उज्ज्वल भविष्य</span></div>
    <header className="public-header">
      <Logo />
      <nav id="school-navigation" aria-label="School website" ref={publicNavRef} className={mobile ? 'public-nav organized-public-nav open' : 'public-nav organized-public-nav'} onKeyDown={event => { if (event.key === 'Escape') { const group = event.target.closest('details'); closePublicGroups(); if (group) group.querySelector('summary')?.focus(); else setMobile(false); } }}>
        <button className={page === 'home' ? 'active' : ''} aria-current={page === 'home' ? 'page' : undefined} onClick={() => go('home')}>Home</button>
        {publicNavigation.map(group => <details className="public-nav-group" name="school-menu" key={group.id} onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false; }}>
          <summary className={group.items.some(([key]) => key === page) ? 'active' : ''}>{group.label}<Icon name="chevron" size={14}/></summary>
          <div className="public-submenu">{group.items.map(([key, label]) => <button key={key} className={page === key ? 'active' : ''} aria-current={page === key ? 'page' : undefined} onClick={() => go(key)}>{label}</button>)}</div>
        </details>)}
        <button className={page === 'contact' ? 'active' : ''} aria-current={page === 'contact' ? 'page' : undefined} onClick={() => go('contact')}>Contact</button>
      </nav>
      <div className="header-actions"><button className="btn btn-ghost desktop-only" onClick={() => go('admission')}>Registration</button><button className="btn btn-primary" onClick={onPortal}>ERP Login <Icon name="arrow" size={16} /></button><button className="mobile-menu" aria-label={mobile ? 'Close school menu' : 'Open school menu'} aria-expanded={mobile} aria-controls="school-navigation" onClick={() => setMobile(!mobile)}><Icon name={mobile ? 'x' : 'menu'} /></button></div>
    </header>
    <main>
      {page === 'home' && <HomePage go={go} notices={data.notices} onPortal={onPortal} />}
      {page === 'about' && <AboutPage />}
      {page === 'academics' && <AcademicsPage />}
      {page === 'facilities' && <FacilitiesPage />}
      {page === 'teachers' && <PublicTeachersPage />}
      {page === 'notices' && <NoticesPage notices={data.notices} />}
      {page === 'events' && <EventsPage />}
      {page === 'results' && <ResultsDownloadsPage onPortal={onPortal} data={data} />}
      {page === 'gallery' && <GalleryPage />}
      {page === 'contact' && <ContactPage update={update} notify={notify} />}
      {page === 'admission' && <RegistrationPage data={data} update={update} notify={notify} onDone={() => go('home')} />}
    </main>
    <footer className="public-footer"><div><Logo compact /><p>A government co-educational school committed to accessible, disciplined and technology-enabled learning.</p></div><div><strong>Quick links</strong><button onClick={() => go('teachers')}>Our teachers</button><button onClick={() => go('events')}>News & events</button><button onClick={() => go('results')}>Results & downloads</button><button onClick={() => go('notices')}>Latest notices</button><button onClick={() => go('admission')}>Student registration</button><button onClick={onPortal}>ERP portal</button></div><div><strong>School hours</strong><p>Monday–Saturday</p><p>09:30 AM–04:00 PM</p><p>Phurhuriya, Paraiya, Gaya</p></div><div className="footer-bottom">© 2026 UHS Phurhuriya Paraiya · Prototype for review</div></footer>
  </div>;
}

function HomePage({ go, notices, onPortal }) {
  const highlights = [
    { id:`notice-${notices[0].id}`, date:notices[0].date, tag:'Notice', title:notices[0].title, body:notices[0].body, target:'notices', image:0 },
    { id:'event-science', date:'28 Sep 2026', tag:'Upcoming event', title:'Science & ICT exhibition', body:'Students will present classroom models, digital projects and practical learning activities.', target:'events', image:1 },
    { id:'event-sports', date:'10 Oct 2026', tag:'Upcoming event', title:'Inter-house sports day', body:'A planned day of team games, athletics and student participation across secondary classes.', target:'events', image:2 },
  ];
  return <>
    <section className="nova-hero">
      <div className="nova-hero-copy">
        <span className="nova-kicker">Shaping minds. Building futures.</span>
        <h1>Learn Today.<br/><em>Lead Tomorrow.</em></h1>
        <p>ज्ञान, अनुशासन और डिजिटल कौशल के साथ विद्यार्थियों को जिम्मेदार तथा आत्मविश्वासी नागरिक बनने के लिए तैयार करना।</p>
        <div className="nova-hero-actions"><button className="btn nova-primary" onClick={() => go('about')}>Explore our school <Icon name="arrow" size={16}/></button><button className="btn nova-outline" onClick={onPortal}>Student portal <Icon name="user" size={16}/></button></div>
      </div>
      <div className="nova-hero-visual"><img src={schoolPhoto} alt="UHS Phurhuriya school campus"/><div className="nova-ribbon one"/><div className="nova-ribbon two"/><span className="campus-label"><img src={schoolLogo} alt=""/><b>Government School</b><small>Phurhuriya · Paraiya · Gaya</small></span></div>
      <div className="nova-dots" aria-hidden="true"/>
    </section>

    <section className="nova-stats section-wrap">
      <div><i><Icon name="users"/></i><span><strong>412</strong><small>Students enrolled</small></span></div>
      <div><i><Icon name="teacher"/></i><span><strong>12</strong><small>Teachers & staff</small></span></div>
      <div><i><Icon name="exam"/></i><span><strong>IX–XII</strong><small>Secondary classes</small></span></div>
      <div><i><Icon name="grid"/></i><span><strong>8</strong><small>ICT lab systems</small></span></div>
      <div><i><Icon name="calendar"/></i><span><strong>2026–27</strong><small>Academic session</small></span></div>
    </section>

    <section className="nova-main section-wrap">
      <div className="nova-purpose">
        <div className="nova-purpose-photo"><img src={schoolPhotoAlt} alt="UHS Phurhuriya school building"/><span><img src={schoolLogo} alt=""/><b>Learning with purpose</b><small>Government of Bihar</small></span></div>
        <article><i><Icon name="up"/></i><div><h2>Our Mission</h2><p>To provide accessible, inclusive and disciplined education that builds strong academic foundations, digital confidence and responsible citizenship.</p><button onClick={() => go('about')}>Learn more <Icon name="arrow" size={14}/></button></div></article>
        <article><i><Icon name="exam"/></i><div><h2>Our Vision</h2><p>Every learner progresses with the knowledge, character and practical skills needed for higher education, work and community life.</p><button onClick={() => go('about')}>Learn more <Icon name="arrow" size={14}/></button></div></article>
      </div>

      <div className="nova-heading"><span>Learning opportunities</span><h2>Programmes we offer</h2><p>Academic, practical and co-curricular experiences designed around the needs of our students.</p></div>
      <div className="nova-programs">
        {[['Science Learning','Hands-on activities that strengthen observation, reasoning and scientific thinking.','exam','purple'],['ICT & Coding','Foundational computer education, digital literacy and responsible technology use.','grid','orange'],['Sports & Fitness','Teamwork, discipline and physical wellbeing through regular school activities.','users','purple'],['Arts & Culture','Creative expression through art, competitions, celebrations and local culture.','image','orange'],['Languages & Reading','Hindi, English and Urdu learning supported by reading and communication practice.','file','purple']].map(([title,body,ico,tone],index)=><article key={title} className={`nova-program ${tone}`}><div className="program-art demo-photo" style={{backgroundImage:`url(${demoActivities})`,backgroundPosition:activityPositions[index]}}><small className="demo-badge">Demo photo</small><span>{String(index+1).padStart(2,'0')}</span></div><i><Icon name={ico} size={18}/></i><h3>{title}</h3><p>{body}</p><button onClick={() => go(index<2?'academics':'gallery')}>Learn more <Icon name="arrow" size={13}/></button></article>)}
      </div>

      <div className="nova-choose"><h2>Why choose UHS Phurhuriya?</h2><div>{[['teacher','Committed teachers'],['home','Government school'],['users','Inclusive learning'],['check','Safe campus'],['grid','Future-ready skills']].map(([ico,text])=><span key={text}><i><Icon name={ico}/></i><b>{text}</b></span>)}</div></div>

      <div className="nova-services">
        <div><span className="nova-kicker">One connected school</span><h2>Simple services for students and families.</h2><p>Submit a registration, follow official notices, contact the school or enter the secure ERP from one clear website.</p></div>
        <div>{[['file','Online registration','Apply for Class IX or XI','admission'],['user','Student portal','Attendance, exams and fees','portal'],['exam','Results & downloads','Result lookup and school documents','results'],['message','Contact school','Submit a trackable query','contact']].map(([ico,title,body,target])=><button key={title} onClick={()=>target==='portal'?onPortal():go(target)}><i><Icon name={ico}/></i><span><strong>{title}</strong><small>{body}</small></span><Icon name="arrow"/></button>)}</div>
      </div>

      <div className="nova-admission"><i><Icon name="file" size={34}/></i><div><span>Registration open · Session 2026–27</span><h2>Begin your student application online.</h2><p>Admission is confirmed after document verification and approval by the school administration.</p></div><button className="btn nova-orange" onClick={() => go('admission')}>Apply now <Icon name="arrow" size={16}/></button></div>

      <div className="nova-news-head"><div><span className="nova-kicker">Stay informed</span><h2>Latest news & events</h2></div><button onClick={() => go('events')}>View all events <Icon name="arrow" size={14}/></button></div>
      <div className="nova-news">{highlights.map((item)=><article key={item.id}><div className="news-art demo-photo" style={{backgroundImage:`url(${demoActivities})`,backgroundPosition:activityPositions[item.image]}}><small className="demo-badge">Demo</small></div><div><span>{item.date} · {item.tag}</span><h3>{item.title}</h3><p>{item.body}</p><button onClick={() => go(item.target)}>Read more <Icon name="arrow" size={13}/></button></div></article>)}</div>
    </section>
  </>;
}

function PageHero({ kicker, title, body }) { return <section className="page-hero nova-page-hero"><div><span className="eyebrow">{kicker}</span><h1>{title}</h1><p>{body}</p></div><div className="page-hero-mark"><span/><span/><span/></div></section>; }

function AboutPage() { return <><PageHero kicker="About our school" title="Education rooted in community." body="UHS Phurhuriya Paraiya serves secondary and higher-secondary learners with a focus on access, discipline, digital literacy and confident citizenship."/><section className="section-wrap split-section nova-about"><div className="about-photo"><img className="rounded-image" src={schoolPhotoAlt} alt="UHS Phurhuriya school campus"/><span><img src={schoolLogo} alt=""/><b>UHS Phurhuriya</b><small>Paraiya, Gaya · Bihar</small></span></div><div className="prose"><span className="eyebrow">Principal’s message</span><h2>Every learner can progress with the right support.</h2><p>Our school works to provide a respectful environment where students are known personally, teachers collaborate, and families remain informed. We value regular attendance, curiosity and responsible use of technology.</p><p>This website and ERP initiative brings that same spirit into our daily administration—making records clearer, communication faster and student progress easier to support.</p><div className="signature"><strong>Head of School</strong><span>UHS Phurhuriya Paraiya</span></div></div></section><section className="section-wrap about-values"><article><i><Icon name="exam"/></i><span><small>Our mission</small><strong>Accessible, disciplined and meaningful learning</strong></span></article><article><i><Icon name="up"/></i><span><small>Our vision</small><strong>Confident students ready for their next step</strong></span></article><article><i><Icon name="users"/></i><span><small>Our community</small><strong>Students, teachers and families working together</strong></span></article></section></>; }

function AcademicsPage() { return <><PageHero kicker="Academics" title="Clear pathways from Class IX to XII." body="A balanced programme aligned with Bihar School Examination Board requirements and supported by practical, digital and co-curricular learning."/><section className="section-wrap academic-grid">{[['Secondary','Classes IX–X','Languages, Mathematics, Science, Social Science and skill-based learning.'],['Higher Secondary · Science','Classes XI–XII','Physics, Chemistry, Biology/Mathematics, languages and practical work.'],['Higher Secondary · Arts','Classes XI–XII','Languages, History, Geography, Political Science and related subjects.']].map((item,i)=><article key={item[0]}><span>0{i+1}</span><small>{item[1]}</small><h3>{item[0]}</h3><p>{item[2]}</p><button>View curriculum <Icon name="arrow" size={15}/></button></article>)}</section><section className="section-wrap facility-band"><div><span className="eyebrow">Student support</span><h2>Resources that strengthen everyday learning.</h2></div><div className="facility-list">{['ICT & computer lab','Science practical activities','Library & reading corner','Sports and cultural events'].map((x,i)=><div key={x}><span>0{i+1}</span><strong>{x}</strong></div>)}</div></section></>; }

function FacilitiesPage() { const facilities=[['ICT & Computer Lab','Eight new HP systems support computer education and supervised digital learning.',1,'grid'],['Science Activities','Practical demonstrations help connect classroom concepts with observation and enquiry.',0,'exam'],['Reading & Languages','Reading practice supports Hindi, English and Urdu communication skills.',4,'file'],['Sports & Fitness','Outdoor games encourage fitness, teamwork, confidence and discipline.',2,'users'],['Arts & Culture','Competitions, celebrations and creative activities give students a stage to participate.',3,'image'],['Project Learning','Group assignments help students plan, discuss and solve real problems together.',5,'up']]; return <><PageHero kicker="School facilities" title="Spaces that support learning." body="A clear view of the academic, digital and co-curricular resources available to students. Temporary photographs will be replaced with verified school images."/><section className="section-wrap facilities-grid">{facilities.map(([title,body,index,ico])=><article key={title}><div className="facility-photo" style={{backgroundImage:`url(${demoActivities})`,backgroundPosition:activityPositions[index]}}><span>Demo photo</span></div><div><i><Icon name={ico}/></i><h2>{title}</h2><p>{body}</p></div></article>)}</section><section className="section-wrap facility-note"><Icon name="image"/><div><strong>Temporary visual content</strong><p>Activity photographs on this page are design placeholders. Before the public launch, they will be replaced with approved photographs taken at UHS Phurhuriya.</p></div></section></>; }

function PublicTeachersPage() {
  const teachers = [
    ['Sunita Kumari', 'Head of School', 'School Leadership', 'Academic planning & student wellbeing'],
    ['Neha Kumari', 'TGT Science', 'Science', 'Classes IX–X'],
    ['Vikash Kumar', 'TGT Mathematics', 'Mathematics', 'Classes IX–X'],
    ['Md. Arif', 'TGT Urdu', 'Urdu', 'Classes IX–X'],
    ['Poonam Kumari', 'TGT Hindi', 'Hindi', 'Classes IX–XII'],
    ['Amit Kumar', 'TGT English', 'English', 'Classes IX–XII'],
    ['Priyanka Kumari', 'TGT Social Science', 'Social Science', 'Classes IX–X'],
    ['Rakesh Ranjan', 'PGT Physics', 'Physics', 'Classes XI–XII'],
    ['Shabnam Parveen', 'PGT Chemistry', 'Chemistry', 'Classes XI–XII'],
    ['Anil Kumar', 'PGT Biology', 'Biology', 'Classes XI–XII'],
    ['Nidhi Kumari', 'Computer Teacher', 'ICT & Digital Skills', 'Classes IX–XII'],
    ['Deepak Kumar', 'Physical Education Teacher', 'Sports & Wellness', 'Classes IX–XII'],
  ];

  return <>
    <PageHero kicker="Our faculty" title="Meet the people who guide every learner." body="A clear, welcoming directory of the teachers supporting academic progress, confidence and student wellbeing at UHS Phurhuriya."/>
    <section className="section-wrap teachers-intro">
      <div><span className="eyebrow">Committed educators</span><h2>Teaching with care, clarity and purpose.</h2><p>Each profile brings subject responsibility and class support together in one place. Verified names, designations and official photographs can be updated before public launch.</p></div>
      <aside><strong>12</strong><span>Teacher profiles prepared</span><small>Current content is for design review</small></aside>
    </section>
    <section className="section-wrap public-teachers-grid">
      {teachers.map(([name, designation, subject, classes], index) => <article className="public-teacher-card" key={name}>
        <div className="teacher-portrait" role="img" aria-label={`Demo portrait for ${name}`} style={{backgroundImage:`url(${demoTeacherPortraits})`,backgroundPosition:teacherPortraitPositions[index]}}><span>Demo profile</span></div>
        <div className="teacher-card-copy">
          <small>{designation}</small>
          <h2>{name}</h2>
          <p>{subject}</p>
          <div><i><Icon name="teacher" size={16}/></i><span>{classes}</span></div>
        </div>
      </article>)}
    </section>
    <section className="section-wrap teacher-demo-note"><Icon name="image"/><div><strong>Temporary teacher details</strong><p>These names, roles and portraits are representative placeholders. They will be replaced with the school’s verified staff list and approved photographs before public release.</p></div></section>
  </>;
}

function NoticesPage({ notices }) { return <><PageHero kicker="School updates" title="Notice board" body="Verified announcements for students, parents and staff. Portal-specific updates remain available after login."/><section className="section-wrap notice-list">{notices.map((n)=><article key={n.id}><div className="notice-date"><strong>{n.date.split(' ')[0]}</strong><span>{n.date.replace(n.date.split(' ')[0]+' ','')}</span></div><div><span className="tag">{n.tag}</span><h3>{n.title}</h3><p>{n.body}</p></div><button className="icon-btn"><Icon name="arrow"/></button></article>)}</section></>; }

function EventsPage() {
  const [filter, setFilter] = useState('All');
  const events = [
    { id:1, day:'28', month:'SEP', title:'Science & ICT Exhibition', category:'Academic', status:'Upcoming', body:'Student models, practical demonstrations and supervised digital projects from Classes IX–XII.', image:0 },
    { id:2, day:'03', month:'OCT', title:'Parent–Teacher Meeting', category:'Community', status:'Upcoming', body:'A focused discussion on attendance, learning progress and support needed for the term ahead.', image:4 },
    { id:3, day:'10', month:'OCT', title:'Inter-house Sports Day', category:'Sports', status:'Upcoming', body:'Team games and athletics activities designed to encourage participation, fitness and discipline.', image:2 },
    { id:4, day:'20', month:'SEP', title:'Swachhata Pakhwada Activities', category:'Community', status:'Upcoming', body:'Poster, essay and campus cleanliness activities with student-led awareness messages.', image:5 },
    { id:5, day:'15', month:'AUG', title:'Independence Day Programme', category:'Cultural', status:'Completed', body:'Flag hoisting, student speeches and cultural presentations celebrating national unity.', image:3 },
    { id:6, day:'12', month:'AUG', title:'Rangoli & Poster Competition', category:'Cultural', status:'Completed', body:'A creative school-level activity preparing students for participation at BRC level.', image:1 },
  ];
  const visibleEvents = filter === 'All' ? events : events.filter((event) => event.status === filter);

  return <>
    <PageHero kicker="News, events & achievements" title="School life beyond the classroom." body="Follow upcoming programmes, recent activities and the milestones that reflect our school’s progress."/>
    <section className="section-wrap events-toolbar">
      <div><span className="eyebrow">School calendar</span><h2>Programmes and activities</h2><p>Use the status buttons to view upcoming or completed events.</p></div>
      <div className="event-filters" aria-label="Filter events">{['All','Upcoming','Completed'].map((item)=><button key={item} aria-pressed={filter===item} className={filter===item?'active':''} onClick={()=>setFilter(item)}>{item}</button>)}</div>
    </section>
    <section className="section-wrap public-events-grid" aria-live="polite">
      {visibleEvents.map((event)=><article key={event.id}>
        <div className="event-photo" style={{backgroundImage:`url(${demoActivities})`,backgroundPosition:activityPositions[event.image]}}><span>Demo event</span><time><b>{event.day}</b><small>{event.month}</small></time></div>
        <div className="event-copy"><div><span className={`event-status ${event.status.toLowerCase()}`}>{event.status}</span><small>{event.category}</small></div><h2>{event.title}</h2><p>{event.body}</p></div>
      </article>)}
    </section>
    <section className="school-milestones">
      <div className="section-wrap"><div className="milestone-heading"><span className="eyebrow">School progress</span><h2>Milestones that strengthen learning.</h2><p>Verified school and prototype figures presented in a clear public snapshot.</p></div><div className="milestone-grid">
        <article><i><Icon name="grid"/></i><strong>8</strong><span>ICT lab systems</span><small>Supporting supervised digital learning</small></article>
        <article><i><Icon name="teacher"/></i><strong>12</strong><span>Teachers & staff</span><small>Profiles prepared for the public directory</small></article>
        <article><i><Icon name="users"/></i><strong>IX–XII</strong><span>Secondary classes</span><small>Academic pathways across Science and Arts</small></article>
        <article><i><Icon name="check"/></i><strong>1</strong><span>Connected ERP</span><small>Registration, records, exams and communication</small></article>
      </div></div>
    </section>
    <section className="section-wrap event-demo-note"><Icon name="calendar"/><div><strong>Prototype event schedule</strong><p>Event descriptions and photographs are sample content for design review. Dates and approved school photographs will be verified before public release.</p></div></section>
  </>;
}

function ResultsDownloadsPage({ onPortal, data }) {
  const [lookup, setLookup] = useState({ identifier:'', dob:'' });
  const [result, setResult] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const subjects = [
    { subject:'MIL', marks:78, fullMarks:100, counted:true },
    { subject:'SIL', marks:72, fullMarks:100, counted:true },
    { subject:'Mathematics', marks:82, fullMarks:100, counted:true },
    { subject:'Science', marks:61, fullMarks:80, counted:true },
    { subject:'Social Science', marks:58, fullMarks:80, counted:true },
    { subject:'English', marks:76, fullMarks:100, counted:false },
  ];
  const downloads = [
    { title:'Admission Document Checklist', body:'Documents required before Class IX or XI admission verification.', file:'/downloads/admission-document-checklist.pdf', meta:'PDF - 1 page', icon:'file' },
    { title:'Academic Calendar 2026-27', body:'A sample overview of examinations, meetings and academic activities.', file:'/downloads/academic-calendar-2026-27.pdf', meta:'PDF - 1 page', icon:'calendar' },
    { title:'Half-yearly Examination Schedule', body:'Representative subject timetable for Classes IX-XII.', file:'/downloads/half-yearly-exam-schedule-2026.pdf', meta:'PDF - 1 page', icon:'exam' },
  ];
  const fillDemo = () => { setLookup({ identifier:'812600000207', dob:'14-02-2012' }); setResult(null); setLookupError(''); };
  const submitLookup = (event) => {
    event.preventDefault();
    const student=data.students.find((item)=>[item.eshiksha,item.pen,item.registration].filter(Boolean).includes(lookup.identifier.trim())&&formatDateDMY(item.dob)===formatDateDMY(lookup.dob));
    if (student) {
      setResult({ student, exam:'First Quarterly Examination 2026-27', subjects, total:351, totalMaximum:460, percentage:'76.3%', status:'PASS', grade:'B+', sectionRank:2, rank:5 });
      setLookupError('');
    } else {
      setResult(null);
      setLookupError('No published result matched these details. Use the sample credentials shown below.');
    }
  };
  const downloadResult = () => result&&downloadMarksheet(result.student,result);

  return <>
    <PageHero kicker="Results & important downloads" title="Academic information, clearly organized." body="Use the protected demo lookup to review the result flow, or download frequently requested school documents."/>
    <section className="section-wrap public-results-layout">
      <form className="result-lookup-card" onSubmit={submitLookup}>
        <div className="result-card-heading"><i><Icon name="search"/></i><div><span className="eyebrow">Published result lookup</span><h2>Find an examination result</h2><p>Use e-ShikshaKosh ID, PEN or BSEB Registration Number with date of birth.</p></div></div>
        <label>Student identifier<input required value={lookup.identifier} onChange={(event)=>setLookup({...lookup,identifier:event.target.value})} placeholder="e-ShikshaKosh / PEN / Registration Number"/></label>
        <label>Date of birth (DD-MM-YYYY)<input required value={lookup.dob} onChange={(event)=>setLookup({...lookup,dob:event.target.value})} placeholder="14-02-2012"/></label>
        <div className="demo-lookup-hint"><div><strong>Try demo details</strong><span>812600000207 / 14-02-2012</span></div><button type="button" onClick={fillDemo}>Use demo details</button></div>
        {lookupError && <div className="result-lookup-error" role="alert">{lookupError}</div>}
        <button className="btn btn-primary" type="submit">View result <Icon name="arrow" size={16}/></button>
      </form>
      <aside className="result-status-card">
        <span className="eyebrow">Current status</span><h2>Results and assessments</h2><p>Individual attendance and verified marks remain available inside the secure student portal.</p>
        <div className="public-result-statuses">
          <article><i className="published"><Icon name="check"/></i><div><strong>Monthly Computer Quiz</strong><span>Classes IX-X - Published</span></div></article>
          <article><i className="published"><Icon name="check"/></i><div><strong>Quarterly Examination</strong><span>Classes IX-XII - Published in ERP</span></div></article>
          <article><i className="scheduled"><Icon name="calendar"/></i><div><strong>Half-yearly Examination</strong><span>Begins 05 October 2026</span></div></article>
        </div>
        <button className="btn result-portal-button" onClick={onPortal}>Open secure student portal <Icon name="arrow" size={16}/></button>
      </aside>
    </section>
    {result && <section className="section-wrap demo-result-sheet" aria-live="polite">
      <header><div><span>Published prototype result</span><h2>{result.student.name}</h2><p>Class {result.student.className} - {result.exam}</p></div><strong>{result.status}</strong></header>
      <div className="public-result-identity"><span>Father: <b>{result.student.guardian}</b></span><span>Mother: <b>{result.student.mother}</b></span><span>Roll: <b>{result.student.roll}</b></span><span>e-ShikshaKosh: <b>{result.student.eshiksha}</b></span></div>
      <div className="result-summary"><div><small>Counted total</small><strong>{result.total}<span>/{result.totalMaximum}</span></strong></div><div><small>Percentage</small><strong>{result.percentage}</strong></div><div><small>Grade</small><strong>{result.grade}</strong></div></div>
      <div className="result-subjects">{subjects.map((item)=><div key={item.subject}><span>{item.subject}{!item.counted&&<small>Not counted in total/result</small>}</span><b>{item.marks}<small>/{item.fullMarks}</small></b><i><span style={{width:`${Math.min(100,item.marks/item.fullMarks*100)}%`}}/></i></div>)}</div>
      <div className="result-ranks"><span>Section Rank <strong>{result.sectionRank}</strong></span><span>{result.student.className.startsWith('11')||result.student.className.startsWith('12')?'Stream Rank':'Class Rank'} <strong>{result.rank}</strong></span></div>
      <footer><p>This is prototype data. Production results will appear only after Admin publication.</p><button className="btn btn-primary" onClick={downloadResult}>Download marksheet PDF <Icon name="file" size={16}/></button></footer>
    </section>}
    <section className="important-downloads">
      <div className="section-wrap"><div className="downloads-heading"><span className="eyebrow">Important downloads</span><h2>Useful documents in one place.</h2><p>Each sample PDF opens or downloads directly and can later be replaced with an approved school document.</p></div><div className="download-grid">{downloads.map((item)=><article key={item.title}><i><Icon name={item.icon}/></i><div><span>{item.meta}</span><h3>{item.title}</h3><p>{item.body}</p><a href={item.file} download>Download PDF <Icon name="arrow" size={14}/></a></div></article>)}</div></div>
    </section>
    <section className="section-wrap result-privacy-note"><Icon name="check"/><div><strong>Student privacy protected</strong><p>A result opens only when a valid student identifier and matching date of birth are entered. Unpublished results remain hidden.</p></div></section>
  </>;
}

function GalleryPage() { const gallery=[['Science learning',0],['ICT & computer education',1],['Sports & teamwork',2],['Arts & culture',3],['Reading together',4],['Project-based learning',5]]; return <><PageHero kicker="Campus life" title="Learning in action" body="A glimpse of classrooms, school spaces and representative student activities. Demo images are clearly marked until approved school photographs are available."/><section className="section-wrap gallery-intro"><figure><img src={schoolPhoto} alt="UHS Phurhuriya campus"/><figcaption><b>Our school campus</b><span>UHS Phurhuriya · Actual school photograph</span></figcaption></figure><div><span className="eyebrow">Campus gallery</span><h2>Every school day tells a story.</h2><p>Learning happens in classrooms, the ICT lab, the playground and through cultural and community activities. The final gallery will document these moments using approved school photographs.</p><div><strong>6</strong><span>Activity categories prepared</span></div></div></section><section className="section-wrap demo-gallery">{gallery.map(([title,index])=><figure key={title}><div style={{backgroundImage:`url(${demoActivities})`,backgroundPosition:activityPositions[index]}}><span>Demo photo</span></div><figcaption><b>{title}</b><small>Temporary design preview</small></figcaption></figure>)}</section></>; }

function ContactPage({ update, notify }) {
  const [form, setForm] = useState({ name: '', mobile: '', subject: '', message: '' });
  const submit = (e) => { e.preventDefault(); const item = { id: `Q-${crypto.randomUUID()}`, from: form.name.trim(), subject: form.subject.trim(), message:form.message.trim(), mobile:form.mobile.trim(), date: schoolDate(), status: 'New', source:'Public website', replies:[] }; update('queries', (x) => [item, ...x]); setForm({ name:'',mobile:'',subject:'',message:'' }); notify(`Query ${item.id} submitted successfully`); };
  return <><PageHero kicker="Contact" title="We’re here to help." body="Send a query online or visit the school during office hours. Please do not share Aadhaar or other sensitive IDs in this public form."/><section className="section-wrap contact-grid"><div className="contact-details"><span className="eyebrow">School office</span><h2>UHS Phurhuriya Paraiya</h2><p>Phurhuriya, Block Paraiya<br/>District Gaya, Bihar</p><div><strong>Office hours</strong><span>Monday–Saturday · 09:30 AM–04:00 PM</span></div><div><strong>Email</strong><span>office@uhsphurhuriya.edu.in</span></div><div><strong>For urgent matters</strong><span>Please contact the school office directly.</span></div></div><form className="form-card" onSubmit={submit}><h3>Submit a query</h3><p>You will receive a reference number for follow-up.</p><label>Full name<input required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Your name"/></label><div className="form-row"><label>Mobile number<input required value={form.mobile} onChange={(e)=>setForm({...form,mobile:e.target.value})} placeholder="10-digit number" pattern="[0-9]{10}"/></label><label>Subject<select required value={form.subject} onChange={(e)=>setForm({...form,subject:e.target.value})}><option value="">Select</option><option>Admission / registration</option><option>Student record correction</option><option>Examination</option><option>Other</option></select></label></div><label>Message<textarea required value={form.message} onChange={(e)=>setForm({...form,message:e.target.value})} placeholder="How can the school help?"/></label><button className="btn btn-primary" type="submit">Submit query <Icon name="arrow" size={16}/></button></form></section></>;
}

function RegistrationPage({ data, update, notify, onDone }) {
  const emptyForm = { name:'', father:'', mother:'', gender:'', dob:'', className:'9', stream:'Science', section:'A', roll:'', mobile:'', email:'', previousSchool:'', address:'' };
  const [mode,setMode]=useState('apply');
  const [step,setStep]=useState(1);
  const [form,setForm]=useState(emptyForm);
  const [receipt,setReceipt]=useState(null);
  const [track,setTrack]=useState({id:'',mobileLast4:''});
  const [trackResult,setTrackResult]=useState(null);
  const [trackError,setTrackError]=useState('');
  const classLabel = form.className === '11' ? `11 ${form.stream}` : form.className;
  const maskName = (name) => name.split(' ').map((part) => `${part[0]}${'*'.repeat(Math.max(2,part.length-1))}`).join(' ');
  const next=(event)=>{event.preventDefault();if(step<3){setStep(step+1);return;}let number;do{number=String(Math.floor(43+Math.random()*900)).padStart(3,'0');}while(data.registrations.some((item)=>item.id===`REG-2026-${number}`));const item={id:`REG-2026-${number}`,...form,className:classLabel,applied:'14 Sep 2026',status:'Pending'};update('registrations',(items)=>[item,...items]);setReceipt(item);setTrack({id:item.id,mobileLast4:item.mobile.slice(-4)});notify(`Application ${item.id} submitted for admin approval`);};
  const resetApplication=()=>{setForm(emptyForm);setStep(1);setReceipt(null);};
  const submitTrack=(event)=>{event.preventDefault();const enteredId=track.id.trim().toUpperCase();const lastFour=track.mobileLast4.replace(/\D/g,'');const found=data.registrations.find((item)=>item.id.toUpperCase()===enteredId);const demoMatch=enteredId==='REG-2026-042'&&lastFour==='0018';const storedDigits=found?.mobile?.replace(/\D/g,'')||'';if(found&&(demoMatch||(lastFour.length===4&&storedDigits.endsWith(lastFour)))){setTrackResult(found);setTrackError('');}else{setTrackResult(null);setTrackError('Application not found. Check the ID and the last four digits of the registered mobile number.');}};
  const useDemoTracker=()=>{setTrack({id:'REG-2026-042',mobileLast4:'0018'});setTrackResult(null);setTrackError('');};
  const downloadReceipt=()=>{if(!receipt)return;const text=`UHS Phurhuriya Paraiya\nSTUDENT REGISTRATION ACKNOWLEDGEMENT\n\nApplication ID: ${receipt.id}\nStudent: ${receipt.name}\nApplying for: Class ${receipt.className}\nSubmitted: ${receipt.applied}\nStatus: Pending - Admin approval required\n\nNext step: Bring original documents to the school for verification.\n\nThis acknowledgement does not confirm admission.`;const url=URL.createObjectURL(new Blob([text],{type:'text/plain'}));const anchor=document.createElement('a');anchor.href=url;anchor.download=`${receipt.id}-acknowledgement.txt`;document.body.appendChild(anchor);anchor.click();anchor.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);};
  const switchMode=(nextMode)=>{setMode(nextMode);setTrackResult(null);setTrackError('');};

  return <><PageHero kicker="Student registration" title="Apply online. Track every step." body="Submit a Class IX or XI application, receive an acknowledgement and follow the Admin approval status without entering the secure ERP."/>
    <section className="section-wrap registration-mode-tabs" aria-label="Registration options"><button className={mode==='apply'?'active':''} onClick={()=>switchMode('apply')}><Icon name="file"/>New application</button><button className={mode==='track'?'active':''} onClick={()=>switchMode('track')}><Icon name="search"/>Track application</button></section>
    {mode==='apply'&&<section className="section-wrap registration-layout enhanced-registration"><aside><span className="eyebrow">Before you begin</span><h2>Keep these documents ready.</h2><ul><li>Birth certificate or previous school record</li><li>Transfer Certificate, where applicable</li><li>Previous class marksheet</li><li>Recent photograph</li><li>Parent or guardian contact details</li></ul><a className="registration-download" href="/downloads/admission-document-checklist.pdf" download><Icon name="file"/><span><strong>Download checklist</strong><small>Admission Document Checklist - PDF</small></span></a><div className="privacy-note"><strong>Privacy protected</strong><p>This public form does not request Aadhaar, PEN or APAAR numbers.</p></div></aside>
      {!receipt?<form className="form-card registration-form-card" onSubmit={next}>
        <div className="registration-stepper">{[['1','Student'],['2','Guardian'],['3','Review']].map(([number,label],index)=><div className={`${step===index+1?'active':''} ${step>index+1?'complete':''}`} key={number}><span>{step>index+1?<Icon name="check" size={14}/>:number}</span><small>{label}</small></div>)}</div>
        {step===1&&<><div className="step-label">Step 1 of 3 - Student details</div><h3>Student information</h3><label>Student full name<input required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="As per school record"/></label><div className="form-row"><label>Gender<select required value={form.gender} onChange={(e)=>setForm({...form,gender:e.target.value})}><option value="">Select</option><option>Female</option><option>Male</option><option>Other</option></select></label><label>Date of birth<input required type="date" value={form.dob} onChange={(e)=>setForm({...form,dob:e.target.value})}/></label></div><div className="form-row"><label>Applying for<select value={form.className} onChange={(e)=>setForm({...form,className:e.target.value})}><option value="9">Class IX</option><option value="11">Class XI</option></select></label>{form.className==='11'?<label>Stream<select value={form.stream} onChange={(e)=>setForm({...form,stream:e.target.value})}><option>Science</option><option>Arts</option></select></label>:<label>Section<select value={form.section} onChange={(e)=>setForm({...form,section:e.target.value})}><option>A</option><option>B</option></select></label>}</div>{form.className==='11'&&<div className="form-row"><label>Section<select value={form.section} onChange={(e)=>setForm({...form,section:e.target.value})}><option>A</option><option>B</option></select></label><label>Roll number<input required inputMode="numeric" value={form.roll} onChange={(e)=>setForm({...form,roll:e.target.value})} placeholder="Current / proposed roll"/></label></div>}{form.className==='9'&&<label>Roll number<input required inputMode="numeric" value={form.roll} onChange={(e)=>setForm({...form,roll:e.target.value})} placeholder="Current / proposed roll"/></label>}</>}
        {step===2&&<><div className="step-label">Step 2 of 3 - Guardian & school details</div><h3>Contact information</h3><label>Father / guardian name<input required value={form.father} onChange={(e)=>setForm({...form,father:e.target.value})} placeholder="Full name"/></label><label>Mother name<input required value={form.mother} onChange={(e)=>setForm({...form,mother:e.target.value})} placeholder="Full name"/></label><div className="form-row"><label>Parent / guardian mobile<input required pattern="[0-9]{10}" inputMode="numeric" value={form.mobile} onChange={(e)=>setForm({...form,mobile:e.target.value})} placeholder="10-digit mobile number"/></label><label>Email - optional<input type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} placeholder="name@example.com"/></label></div><label>Previous school<input required value={form.previousSchool} onChange={(e)=>setForm({...form,previousSchool:e.target.value})} placeholder="School name"/></label><label>Full address<textarea required value={form.address} onChange={(e)=>setForm({...form,address:e.target.value})} placeholder="Village / locality, post, block and district"/></label></>}
        {step===3&&<><div className="step-label">Step 3 of 3 - Review</div><h3>Confirm application details</h3><div className="registration-review-grid"><div><span>Student</span><strong>{form.name}</strong></div><div><span>Class</span><strong>{classLabel} - Section {form.section}</strong></div><div><span>Roll number</span><strong>{form.roll}</strong></div><div><span>Date of birth</span><strong>{form.dob}</strong></div><div><span>Father / guardian</span><strong>{form.father}</strong></div><div><span>Registered mobile</span><strong>******{form.mobile.slice(-4)}</strong></div><div className="review-wide"><span>Previous school</span><strong>{form.previousSchool}</strong></div></div><label className="consent"><input type="checkbox" required/><span>I confirm that the information is correct and understand that admission is completed only after document verification and Admin approval.</span></label></>}
        <div className="registration-form-actions">{step>1&&<button className="btn btn-secondary" type="button" onClick={()=>setStep(step-1)}>Back</button>}<button className="btn btn-primary" type="submit">{step<3?'Continue':'Submit for Admin approval'} <Icon name="arrow" size={16}/></button></div>
      </form>:<div className="registration-success-card"><span className="success-seal"><Icon name="check" size={31}/></span><span className="eyebrow">Application submitted</span><h2>Save your application ID.</h2><p>Your application is waiting for document verification and Admin approval. Submission does not confirm admission.</p><div className="application-id-box"><small>Application ID</small><strong>{receipt.id}</strong><button onClick={()=>{navigator.clipboard?.writeText(receipt.id);notify('Application ID copied');}}>Copy</button></div><div className="receipt-next-steps"><strong>What happens next?</strong><span><i>1</i>Visit the school with original documents.</span><span><i>2</i>The school verifies and reviews the application.</span><span><i>3</i>Track Approved, Pending or Rejected status online.</span></div><div className="registration-success-actions"><button className="btn btn-primary" onClick={downloadReceipt}>Download acknowledgement <Icon name="file" size={16}/></button><button className="btn btn-secondary" onClick={()=>{switchMode('track');setTrack({id:receipt.id,mobileLast4:receipt.mobile.slice(-4)});}}>Track this application</button><button className="text-action" onClick={resetApplication}>Start another application</button><button className="text-action" onClick={onDone}>Back to homepage</button></div></div>}
    </section>}
    {mode==='track'&&<section className="section-wrap application-tracker-layout"><div className="tracker-guide"><span className="eyebrow">Application status</span><h2>Check the latest review status.</h2><p>Enter the acknowledgement ID and only the last four digits of the registered mobile number.</p><div className="tracker-demo"><strong>Demo tracker</strong><span>REG-2026-042 / Mobile last four: 0018</span><button onClick={useDemoTracker}>Use demo details</button></div><div className="privacy-note"><strong>Public privacy control</strong><p>Full mobile numbers, documents and protected student records are never displayed here.</p></div></div><div><form className="form-card tracker-form" onSubmit={submitTrack}><h3>Track an application</h3><label>Application ID<input required value={track.id} onChange={(e)=>setTrack({...track,id:e.target.value})} placeholder="REG-2026-000"/></label><label>Registered mobile - last 4 digits<input required inputMode="numeric" pattern="[0-9]{4}" maxLength="4" value={track.mobileLast4} onChange={(e)=>setTrack({...track,mobileLast4:e.target.value})} placeholder="0000"/></label>{trackError&&<div className="tracker-error" role="alert">{trackError}</div>}<button className="btn btn-primary" type="submit">Check status <Icon name="search" size={16}/></button></form>{trackResult&&<div className={`tracker-result ${trackResult.status.toLowerCase()}`} aria-live="polite"><header><div><span>Application found</span><h3>{trackResult.id}</h3></div><Status>{trackResult.status}</Status></header><div className="tracker-result-summary"><div><small>Student</small><strong>{maskName(trackResult.name)}</strong></div><div><small>Applying for</small><strong>Class {trackResult.className}</strong></div><div><small>Submitted</small><strong>{trackResult.applied}</strong></div></div><div className="status-timeline"><span className="done"><i><Icon name="check" size={13}/></i><b>Application submitted</b></span><span className={trackResult.status==='Pending'?'current':trackResult.status==='Approved'?'done':'stopped'}><i>{trackResult.status==='Approved'?<Icon name="check" size={13}/>:2}</i><b>Document review</b></span><span className={trackResult.status==='Approved'?'done':trackResult.status==='Rejected'?'stopped':''}><i>{trackResult.status==='Approved'?<Icon name="check" size={13}/>:3}</i><b>{trackResult.status==='Rejected'?'Not approved':'Admin decision'}</b></span></div><p>{trackResult.status==='Approved'?'The application is approved and a student record has been created.':trackResult.status==='Rejected'?'The application was not approved. Please contact the school office for clarification.':'The application is under review. Bring original documents to the school if verification is pending.'}</p></div>}</div></section>}
  </>;
}

function Login({ onLogin, onBack }) {
  const [role,setRole]=useState('admin'); const [email,setEmail]=useState('admin@uhs.edu'); const [password,setPassword]=useState('123456'); const [show,setShow]=useState(false); const [error,setError]=useState('');
  const choose=(r)=>{setRole(r);setEmail(`${r}@uhs.edu`);setPassword('123456');setError('');};
  const submit=(e)=>{e.preventDefault();if(email!==`${role}@uhs.edu`||password!=='123456'){setError('For this prototype, use the pre-filled demo credentials.');return;}onLogin(role);};
  return <div className="login-page">
    <div className="login-visual"><img src={schoolPhoto} alt="School campus"/><div className="login-shade"/><button className="back-link" onClick={onBack}><Icon name="home"/> Public website</button><div className="login-quote"><img src={schoolLogo} alt="School logo"/><span>Secure school workspace</span><h1>One school.<br/>One connected system.</h1><p>Admissions, records, learning and communication—organized around every student.</p></div></div>
    <div className="login-panel"><div className="login-box"><Logo/><div className="login-heading"><span className="eyebrow">ERP access</span><h2>Welcome back</h2><p>Choose one of the five roles to review its exact dashboard, menu and permissions.</p></div><div className="role-tabs five-roles">{['admin','headmaster','teacher','clerk','student'].map((r)=><button key={r} className={role===r?'active':''} onClick={()=>choose(r)}><span>{roleConfig[r].initials}</span>{r[0].toUpperCase()+r.slice(1)}</button>)}</div><form onSubmit={submit}><label>Login ID<input value={email} onChange={(e)=>setEmail(e.target.value)} autoComplete="username"/></label><label>Password<div className="password-wrap"><input type={show?'text':'password'} value={password} onChange={(e)=>setPassword(e.target.value)} autoComplete="current-password"/><button type="button" onClick={()=>setShow(!show)}>{show?'Hide':'Show'}</button></div></label>{error&&<div className="form-error">{error}</div>}<button className="btn btn-primary btn-full" type="submit">Sign in as {role} <Icon name="arrow" size={17}/></button></form><div className="demo-note"><strong>Prototype credentials</strong><span>{role}@uhs.edu</span><span>Password: 123456</span></div><p className="security-copy">The default password is shown for review. Production users will be required to change it after first login.</p></div></div>
  </div>;
}

function Portal({ role, onLogout, data, update, reset, notify }) {
  const [view,setView]=useState('overview'); const [mobile,setMobile]=useState(false); const user=roleConfig[role]; const nav=navByRole[role];
  const groups = navigationGroups(role, nav);
  const [expanded, setExpanded] = useState(groups[0]?.id || '');
  const [menuQuery, setMenuQuery] = useState('');
  const [compactMenu, setCompactMenu] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 960px)').matches);
  const searchRef = useRef(null);
  const menuButtonRef = useRef(null);
  const mainRef = useRef(null);
  const activeGroup = groups.find(group => group.items.some(([key]) => key === view));
  const filteredGroups = filterNavigation(groups, menuQuery);
  const pendingApplications = data.registrations.filter(item => item.status === 'Pending').length;
  const workspaceLabel = {admin:'Admin',headmaster:'Headmaster',teacher:'Teacher',clerk:'Clerk',student:'Student'}[role];
  const closeMenu = () => { setMobile(false); requestAnimationFrame(() => menuButtonRef.current?.focus()); };
  const focusSearch = () => { setMobile(true); requestAnimationFrame(() => searchRef.current?.focus()); };
  useEffect(() => {
    const media = window.matchMedia('(max-width: 960px)');
    const resized = event => setCompactMenu(event.matches);
    media.addEventListener('change', resized);
    return () => media.removeEventListener('change', resized);
  }, []);
  useEffect(() => {
    if (!compactMenu || !mobile) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [compactMenu, mobile]);
  useEffect(() => {
    const handleKey = event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setMobile(true); requestAnimationFrame(() => searchRef.current?.focus()); }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);
  const select=(key)=>{
    if (key !== 'settings' && !nav.some(([allowed]) => allowed === key)) return;
    setView(key);setMobile(false);setMenuQuery('');
    const group = groups.find(item => item.items.some(([id]) => id === key));
    if (group) setExpanded(group.id);
    requestAnimationFrame(() => { mainRef.current?.focus({preventScroll:true}); window.scrollTo({top:0}); });
  };
  const sidebarKeys = event => {
    if (event.key === 'Escape') { event.preventDefault(); setMenuQuery(''); closeMenu(); }
    if (event.key !== 'Tab' || !mobile || !window.matchMedia('(max-width: 960px)').matches) return;
    const controls = [...event.currentTarget.querySelectorAll('button,input')].filter(node => node.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  return <div className="portal-shell organized-portal">
    <aside id="erp-navigation" aria-label={`${workspaceLabel} workspace`} inert={compactMenu && !mobile} role={compactMenu && mobile ? 'dialog' : undefined} aria-modal={compactMenu && mobile ? true : undefined} className={mobile?'portal-sidebar open':'portal-sidebar'} onKeyDown={sidebarKeys}>
      <div className="sidebar-brand"><Logo compact/><button className="sidebar-close" aria-label="Close workspace menu" onClick={closeMenu}><Icon name="x"/></button></div>
      <div className="workspace-label"><span>{workspaceLabel} workspace</span><small>{data.academicYear?.current || SESSION}</small></div>
      <div className="menu-search"><Icon name="search" size={17}/><input ref={searchRef} type="search" aria-label="Find a menu" placeholder="Find a menu…" value={menuQuery} onChange={event=>setMenuQuery(event.target.value)}/>{menuQuery && <button aria-label="Clear menu search" onClick={()=>{setMenuQuery('');searchRef.current?.focus();}}><Icon name="x" size={15}/></button>}</div>
      <nav aria-label="ERP pages">
        {!menuQuery.trim() && <button className={`nav-dashboard ${view==='overview'?'active':''}`} aria-current={view==='overview'?'page':undefined} onClick={()=>select('overview')}><Icon name="grid"/><span>Dashboard</span></button>}
        {menuQuery.trim() && 'dashboard overview'.includes(menuQuery.trim().toLowerCase()) && <button className="nav-dashboard" onClick={()=>select('overview')}><Icon name="grid"/><span>Dashboard</span></button>}
        {filteredGroups.map(group => {
          const open = Boolean(menuQuery.trim()) || expanded === group.id;
          return <section className={`nav-group ${activeGroup?.id===group.id?'contains-active':''}`} key={group.id}>
            <button className="nav-group-toggle" aria-expanded={open} aria-controls={`menu-${group.id}`} onClick={()=>{if(menuQuery.trim()){setMenuQuery('');setExpanded(group.id);}else setExpanded(open?'':group.id);}}><Icon name={group.icon}/><span>{group.label}</span>{group.id==='students'&&group.items.some(([key])=>key==='registrations')&&pendingApplications>0&&<b aria-label={`${pendingApplications} pending registrations`}>{pendingApplications}</b>}<Icon name="chevron" size={15}/></button>
            <div id={`menu-${group.id}`} className="nav-submenu" hidden={!open}>{group.items.map(([key,label])=><button key={key} onClick={()=>select(key)} className={view===key?'active':''} aria-current={view===key?'page':undefined}><span>{label}</span>{key==='registrations'&&pendingApplications>0&&<b>{pendingApplications}</b>}</button>)}</div>
          </section>;
        })}
        {menuQuery.trim() && !filteredGroups.length && !'dashboard overview'.includes(menuQuery.trim().toLowerCase()) && <p className="menu-empty" role="status">No matching menu. Try “marks”, “fees” or “student”.</p>}
      </nav>
      <div className="sidebar-bottom"><button className={view==='settings'?'active':''} aria-current={view==='settings'?'page':undefined} onClick={()=>select('settings')}><Icon name="user"/>Account & security</button><button onClick={onLogout}><Icon name="logout"/>Sign out</button></div>
    </aside>
    {mobile&&<button className="sidebar-scrim" tabIndex={-1} aria-label="Close workspace menu" onClick={closeMenu}/>}
    <div className="portal-main" inert={compactMenu && mobile}><header className="portal-header"><div className="portal-title"><button ref={menuButtonRef} className="portal-menu" aria-label="Open workspace menu" aria-controls="erp-navigation" aria-expanded={mobile} onClick={focusSearch}><Icon name="menu"/></button><div><span>UHS Phurhuriya · Session {data.academicYear?.current||SESSION}</span><div className="portal-breadcrumb">{activeGroup && <><span>{activeGroup.label}</span><Icon name="chevron" size={13}/></>}<strong>{view==='overview'?'Dashboard':nav.find(x=>x[0]===view)?.[1]||'Account & security'}</strong></div></div></div><div className="portal-header-actions"><button className="search-btn" onClick={focusSearch}><Icon name="search"/><span>Find a menu</span><kbd>⌘ / Ctrl K</kbd></button><button className="notification-btn" aria-label="Open notices" onClick={()=>select('notices')}><Icon name="bell"/></button><div className="user-chip"><span>{user.initials}</span><div><strong>{user.name}</strong><small>{workspaceLabel}</small></div></div></div></header><main id="workspace-content" className="portal-content" ref={mainRef} tabIndex={-1}>
      {view==='overview'&&<Overview role={role} data={data} navigate={select}/>} {view==='registrations'&&<Registrations data={data} update={update} notify={notify}/>} {view==='students'&&<Students role={role} data={data} update={update} notify={notify} navigate={select}/>} {view==='new-student'&&<NewStudent role={role} data={data} update={update} notify={notify}/>} {view==='bseb'&&<BsebRegistration data={data} update={update} notify={notify}/>} {view==='bonafide'&&['admin','headmaster','clerk'].includes(role)&&<BonafideCertificates role={role} data={data} update={update} notify={notify}/>} {view==='class-setup'&&<ClassSectionManager data={data} update={update} notify={notify}/>} {view==='assignments'&&<AssignmentManager data={data} update={update} notify={notify}/>} {view==='subject-settings'&&<SubjectSettings data={data} update={update} notify={notify}/>} {view==='routine'&&<WeeklyRoutine role={role} data={data} update={update} notify={notify}/>} {view==='teachers'&&<Teachers role={role} data={data} update={update} notify={notify} navigate={select}/>} {view==='leaves'&&<Leaves role={role} data={data} update={update} notify={notify}/>} {view==='exams'&&<Exams role={role} data={data} update={update} notify={notify}/>} {view==='attendance'&&<Attendance role={role} data={data} update={update} notify={notify}/>} {view==='fees'&&<FeeManagement role={role} data={data} update={update} notify={notify}/>} {view==='notices'&&<PortalNotices role={role} data={data} update={update} notify={notify}/>} {view==='queries'&&<Queries role={role} data={data} update={update} notify={notify}/>} {view==='gallery'&&<GalleryAdmin notify={notify}/>} {view==='academic-year'&&['admin','headmaster'].includes(role)&&<AcademicYearManager role={role} data={data} update={update} notify={notify}/>} {view==='progression'&&role==='admin'&&<Progression data={data} update={update} notify={notify}/>} {view==='access'&&role==='admin'&&<AccessControl data={data} update={update} notify={notify}/>} {view==='audit'&&role==='admin'&&<AuditLog data={data}/>} {view==='profile'&&<StudentProfile data={data} navigate={select}/>} {view==='settings'&&<Settings reset={reset} notify={notify}/>} </main></div>
  </div>;
}

function PageTitle({ eyebrow='School ERP', title, body, actions }) { return <div className="page-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{body&&<p>{body}</p>}</div>{actions&&<div className="page-actions">{actions}</div>}</div>; }
function Status({ children }) { return <span className={`status status-${String(children).toLowerCase().replaceAll(' ','-').replace('₹850-due','due')}`}>{children}</span>; }
function Metric({ label, value, detail, tone='navy', icon='grid' }) { return <div className={`metric metric-${tone}`}><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div><i><Icon name={icon}/></i></div>; }

function Overview({ role,data,navigate }) {
  if(role==='clerk') return <OfficeOverview role={role} data={data} navigate={navigate}/>;
  if(role==='admin'||role==='headmaster'){
    const sessionStudents=data.students.filter((student)=>student.visibleInSession!==false&&student.status!=='Passed out');
    const todayRecords=(data.attendanceRecords||[]).filter((record)=>record.date===ATTENDANCE_TODAY);
    const studentEntries=todayRecords.filter((record)=>record.type==='student').flatMap((record)=>record.entries);
    const staffEntries=todayRecords.find((record)=>record.type==='staff')?.entries||[];
    const studentPresent=studentEntries.filter((entry)=>entry.status==='Present').length;
    const staffPresent=staffEntries.filter((entry)=>entry.status==='Present').length;
    const girls=sessionStudents.filter((student)=>student.gender==='Female').length;
    const boys=sessionStudents.filter((student)=>student.gender==='Male').length;
    const girlShare=sessionStudents.length?Math.round(girls*100/sessionStudents.length):0;
    const classAttendance=['9','10','11','12'].map((className)=>{const rows=sessionStudents.filter((student)=>student.className.startsWith(className));return[className,rows.length?Math.round(rows.reduce((sum,student)=>sum+student.attendance,0)/rows.length):0];});
    const todayLeaves=data.leaves.filter((leave)=>leave.status==='Approved'&&dmyTime(ATTENDANCE_TODAY)>=dmyTime(leave.from||leave.dates)&&dmyTime(ATTENDANCE_TODAY)<=dmyTime(leave.to||leave.from||leave.dates));
    const todayDay=routineDayForDate(ATTENDANCE_TODAY);
    const todayAdjustments=(data.dailyRoutineAdjustments||[]).filter((item)=>item.date===ATTENDANCE_TODAY);
    const affectedPeriods=(data.routine||[]).filter((item)=>item.day===todayDay&&todayLeaves.some((leave)=>leave.staffId===item.teacherId)).map((item)=>({...item,leave:todayLeaves.find((leave)=>leave.staffId===item.teacherId),adjustment:todayAdjustments.find((entry)=>entry.routineId===item.id)}));
    return <><PageTitle eyebrow="Good afternoon" title={role==='admin'?'Administration overview':'Headmaster overview'} body="Live student and staff attendance, approvals and school operations." actions={<><button className="btn btn-secondary" onClick={()=>navigate('notices')}>Create notice</button><button className="btn btn-primary" onClick={()=>navigate('attendance')}>Open attendance</button></>}/><div className="metrics"><Metric label="Total students" value={data.students.length} detail={`${girls} girls · ${boys} boys`} tone="blue" icon="users"/><Metric label="Students present" value={`${studentPresent}/${studentEntries.length||'—'}`} detail={`Saved records · ${ATTENDANCE_TODAY}`} tone="green" icon="check"/><Metric label="Appointed staff" value={data.teachers.length} detail={`${staffPresent} present · ${todayLeaves.length} approved leave`} tone="amber" icon="teacher"/><Metric label="Pending approvals" value={data.registrations.filter((item)=>item.status==='Pending').length} detail="Student registrations" tone="violet" icon="file"/></div>{affectedPeriods.length>0&&<section className="content-card dashboard-routine-alert"><div className="card-head"><div><span className="eyebrow">Today · {ATTENDANCE_TODAY}</span><h3>Routine periods need rescheduling</h3></div><button onClick={()=>navigate('routine')}>Open Daily rescheduling</button></div><p>{affectedPeriods.filter((item)=>!item.adjustment).length} period(s) are uncovered because the assigned teacher is on approved leave.</p><div>{affectedPeriods.map((item)=><span className={item.adjustment?'resolved':'uncovered'} key={item.id}><b>Period {item.period} · {item.className}</b><small>{item.adjustment?`${item.adjustment.substituteName} assigned`:`${item.teacher} on leave`}</small></span>)}</div></section>}<div className="dashboard-grid"><section className="content-card action-card"><div className="card-head"><div><span className="eyebrow">Action centre</span><h3>Needs your attention</h3></div></div>{[[`${data.registrations.filter((item)=>item.status==='Pending').length} student registrations`,'Verify documents and approve applications','registrations','file','amber'],[`${data.leaves.filter((item)=>item.status==='Pending').length} leave requests`,'Review staff leave for this week','leaves','calendar','blue'],[`${data.fees.filter((item)=>item.status==='Due').length} fee records due`,'Record offline payments received','fees','wallet','green']].map(([title,sub,key,ico,tone])=><button className="action-row" key={key} onClick={()=>navigate(key)}><i className={`icon-tone ${tone}`}><Icon name={ico}/></i><span><strong>{title}</strong><small>{sub}</small></span><Icon name="arrow"/></button>)}</section><section className="content-card daily-attendance-card"><div className="card-head"><div><span className="eyebrow">Today · {ATTENDANCE_TODAY}</span><h3>Daily attendance status</h3></div><button onClick={()=>navigate('attendance')}>Manage</button></div><div className="daily-attendance-stat"><span>Students marked</span><strong>{studentEntries.length}</strong><small>{studentPresent} present · {studentEntries.filter((entry)=>entry.status==='Absent').length} absent</small></div><div className="daily-attendance-stat"><span>Staff marked</span><strong>{staffEntries.length}</strong><small>{staffPresent} present · {todayLeaves.length} approved leave</small></div></section></div><div className="dashboard-grid attendance-insights"><section className="content-card gender-card"><div className="card-head"><div><span className="eyebrow">Student profile</span><h3>Gender distribution</h3></div></div><div className="gender-chart-wrap"><div className="gender-pie" style={{background:`conic-gradient(#7557c5 0 ${girlShare}%, #2f8f78 ${girlShare}% 100%)`}}><span>{data.students.length}</span></div><div><p><i className="girl"/>Girls <strong>{girls}</strong></p><p><i className="boy"/>Boys <strong>{boys}</strong></p></div></div></section><section className="content-card"><div className="card-head"><div><span className="eyebrow">Monthly average</span><h3>Class-wise attendance</h3></div><button onClick={()=>navigate('attendance')}>View report</button></div>{classAttendance.map(([className,value])=><div className="progress-row" key={className}><span>Class {className}</span><div><i style={{width:`${value}%`}}/></div><strong>{value}%</strong></div>)}</section></div><section className="content-card wide-card"><div className="card-head"><div><span className="eyebrow">Recent activity</span><h3>School operations</h3></div>{role==='admin'&&<button onClick={()=>navigate('audit')}>View Audit Log</button>}</div><div className="activity-line"><span className="avatar green">NK</span><div><strong>Class 9-A attendance saved</strong><small>{ATTENDANCE_TODAY} · Neha Kumari</small></div><time>Today</time></div><div className="activity-line"><span className="avatar amber">HM</span><div><strong>Staff attendance register updated</strong><small>{staffPresent} present · {todayLeaves.length} approved leave</small></div><time>Today</time></div><div className="activity-line"><span className="avatar blue">SA</span><div><strong>Monthly Computer Quiz published</strong><small>Visible to Class IX-X students</small></div><time>2 hr ago</time></div></section></>;
  }
  if(role==='teacher') return <><PageTitle eyebrow="Monday · 13 September" title="Good afternoon, Neha" body="Class IX-A is ready for your next update." actions={<button className="btn btn-primary" onClick={()=>navigate('attendance')}>Mark attendance</button>}/><div className="metrics"><Metric label="Class students" value="42" detail="IX-A · Class teacher" tone="blue" icon="users"/><Metric label="Present today" value="39" detail="3 students absent" tone="green" icon="check"/><Metric label="Classes today" value="5" detail="2 remaining" tone="amber" icon="calendar"/><Metric label="Marks pending" value="1" detail="Computer quiz" tone="violet" icon="exam"/></div><div className="dashboard-grid"><section className="content-card"><div className="card-head"><div><span className="eyebrow">Today’s schedule</span><h3>My classes</h3></div></div>{[['09:30','IX-A','Science'],['10:15','X-A','Science'],['11:45','IX-A','Computer'],['13:15','XI','Biology']].map((x,i)=><div className={`schedule-row ${i<2?'done':''}`} key={x[0]}><time>{x[0]}</time><span><strong>{x[1]}</strong><small>{x[2]}</small></span><Status>{i<2?'Completed':i===2?'Next':'Scheduled'}</Status></div>)}</section><section className="content-card"><div className="card-head"><div><span className="eyebrow">Class IX-A</span><h3>Quick actions</h3></div></div><div className="quick-actions"><button onClick={()=>navigate('attendance')}><Icon name="check"/><span><strong>Attendance</strong><small>Mark today</small></span></button><button onClick={()=>navigate('exams')}><Icon name="exam"/><span><strong>Marks entry</strong><small>1 pending</small></span></button><button onClick={()=>navigate('students')}><Icon name="users"/><span><strong>Student list</strong><small>42 enrolled</small></span></button><button onClick={()=>navigate('notices')}><Icon name="bell"/><span><strong>Notices</strong><small>3 unread</small></span></button></div></section></div></>;
  return <><PageTitle eyebrow="Student portal" title="Hello, Sana" body="Here is your school day at a glance." actions={<button className="btn btn-primary" onClick={()=>navigate('exams')}>View published result</button>}/><div className="student-banner"><div><span>MONDAY · 13 SEPTEMBER</span><h2>Your attendance is <em>excellent</em> this month.</h2><p>Keep it up—you have attended 23 of 24 working days.</p></div><div className="attendance-ring"><strong>96%</strong><span>Attendance</span></div></div><div className="metrics"><Metric label="Next class" value="Science" detail="11:45 AM · Room 4" tone="blue" icon="calendar"/><Metric label="Published result" value="Available" detail="Download marksheet PDF" tone="violet" icon="exam"/><Metric label="Upcoming exam" value="18 Sep" detail="Monthly Computer Quiz" tone="amber" icon="exam"/><Metric label="Fee status" value="Paid" detail="No outstanding dues" tone="green" icon="wallet"/></div><div className="dashboard-grid"><section className="content-card"><div className="card-head"><div><span className="eyebrow">Today</span><h3>My timetable</h3></div></div>{[['09:30','English','Completed'],['10:15','Mathematics','Completed'],['11:45','Science','Next'],['12:30','Hindi','Scheduled']].map(x=><div className="schedule-row" key={x[0]}><time>{x[0]}</time><span><strong>{x[1]}</strong><small>Room 4</small></span><Status>{x[2]}</Status></div>)}</section><section className="content-card"><div className="card-head"><div><span className="eyebrow">Notice board</span><h3>For you</h3></div><button onClick={()=>navigate('notices')}>View all</button></div>{data.notices.slice(0,3).map(n=><div className="mini-notice" key={n.id}><span>{n.date.split(' ')[0]}</span><div><small>{n.tag}</small><strong>{n.title}</strong></div></div>)}</section></div></>;
}

function Registrations({data,update,notify}) { const [filter,setFilter]=useState('Pending'); const [selected,setSelected]=useState(null); const [search,setSearch]=useState(''); const term=search.trim().toLowerCase(); const rows=data.registrations.filter(x=>(filter==='All'||x.status===filter)&&(!term||x.id.toLowerCase().includes(term)||x.name.toLowerCase().includes(term)||x.mobile.toLowerCase().includes(term))); const act=(status)=>{update('registrations',list=>list.map(x=>x.id===selected.id?{...x,status}:x)); if(status==='Approved')update('students',list=>[{id:`UHS-26${Math.floor(1000+Math.random()*8999)}`,name:selected.name,className:`${selected.className}${selected.section?`-${selected.section}`:''}`,roll:selected.roll||'—',gender:selected.gender||'—',dob:selected.dob||'Not provided',guardian:selected.father||'Not provided',mother:selected.mother||'Not provided',mobile:selected.mobile||'Not provided',address:selected.address||'Not provided',admission:'14 September 2026',status:'Active',attendance:0,fee:'Pending',pen:'To be assigned',apaar:'To be assigned',eshiksha:'To be assigned'},...list]); notify(`${selected.id} ${status.toLowerCase()}`);setSelected(null);}; return <><PageTitle title="Student registrations" body="Review applications before creating a permanent student record." actions={<button className="btn btn-primary" onClick={()=>notify('Use the public registration form to create a new application')}>+ New registration</button>}/><div className="filter-bar"><div className="filter-tabs">{['Pending','Approved','Rejected','All'].map(x=><button className={filter===x?'active':''} onClick={()=>setFilter(x)} key={x}>{x}{x==='Pending'&&<b>{data.registrations.filter(y=>y.status==='Pending').length}</b>}</button>)}</div><label className="table-search"><Icon name="search"/><input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Search ID, student or mobile"/></label></div><div className="table-card"><table><thead><tr><th>Application</th><th>Student</th><th>Applying for</th><th>Submitted</th><th>Status</th><th></th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><strong>{r.id}</strong></td><td><div className="person-cell"><span>{r.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</span><div><strong>{r.name}</strong><small>S/o / D/o {r.father}</small></div></div></td><td>Class {r.className}</td><td>{r.applied}</td><td><Status>{r.status}</Status></td><td><button className="table-action" onClick={()=>setSelected(r)}>Review <Icon name="arrow" size={14}/></button></td></tr>)}</tbody></table>{rows.length===0&&<div className="empty-state">No registrations match this view.</div>}</div>{selected&&<Modal title="Review registration" onClose={()=>setSelected(null)} footer={<><button className="btn btn-secondary" onClick={()=>act('Rejected')}>Reject</button><button className="btn btn-primary" onClick={()=>act('Approved')}>Approve & create record</button></>}><div className="review-grid"><div><span>Application ID</span><strong>{selected.id}</strong></div><div><span>Applied on</span><strong>{selected.applied}</strong></div><div><span>Student name</span><strong>{selected.name}</strong></div><div><span>Applying for</span><strong>Class {selected.className}</strong></div><div><span>Section / roll</span><strong>{selected.section||'To be assigned'} / {selected.roll||'To be assigned'}</strong></div><div><span>Gender</span><strong>{selected.gender||'Not provided'}</strong></div><div><span>Father / guardian</span><strong>{selected.father}</strong></div><div><span>Mother</span><strong>{selected.mother||'Not provided'}</strong></div><div><span>Mobile</span><strong>{selected.mobile}</strong></div><div><span>Previous school</span><strong>{selected.previousSchool||'Not provided'}</strong></div></div><div className="document-box"><Icon name="file"/><span><strong>Document verification</strong><small>Verify originals before taking an approval decision</small></span><Status>Review</Status></div></Modal>}</> }

function Students({role,data,update,notify,navigate}) {
  const canManage=role==='admin'||role==='headmaster';
  const canTagSubjects=['admin','headmaster','clerk'].includes(role);
  const [search,setSearch]=useState('');
  const [classFilter,setClassFilter]=useState('All');
  const [selectedId,setSelectedId]=useState(null);
  const [mode,setMode]=useState('view');
  const [draft,setDraft]=useState(null);
  const [reason,setReason]=useState('');
  const [subjectDraft,setSubjectDraft]=useState([]);
  const sessionStudents=data.students.filter((student)=>student.visibleInSession!==false&&student.status!=='Passed out');
  const selected=sessionStudents.find((student)=>student.id===selectedId);
  const selectedSubjects=selected?(selected.subjectSelections?.length?selected.subjectSelections:defaultStudentSubjects(selected)):[];
  const subjectOptions=selected?subjectOptionsForClass(selected.className):[];
  const assigned=sessionStudents.filter((student)=>role!=='teacher'||student.className.startsWith('9'));
  const term=search.trim().toLowerCase();
  const rows=assigned.filter((student)=>(classFilter==='All'||student.className.startsWith(classFilter))&&(!term||`${student.name} ${student.id} ${student.className} ${student.roll}`.toLowerCase().includes(term)));
  const openRecord=(student)=>{setSelectedId(student.id);setMode('view');setDraft(null);setReason('');setSubjectDraft([]);};
  const closeRecord=()=>{setSelectedId(null);setMode('view');setDraft(null);setReason('');setSubjectDraft([]);};
  const startCorrection=()=>{setDraft({...selected});setReason('');setMode('correct');};
  const startSubjectEdit=()=>{setSubjectDraft(selectedSubjects);setMode('subjects');};
  const toggleSubject=(subject)=>setSubjectDraft((current)=>current.some((item)=>subjectOptionKey(item)===subjectOptionKey(subject))?current.filter((item)=>subjectOptionKey(item)!==subjectOptionKey(subject)):[...current,subject]);
  const validateSubjectSelection=()=>{
    if(!subjectDraft.length)return 'Select at least one subject';
    if(examClassNumber(selected.className)<11)return '';
    const count=(group)=>subjectDraft.filter((item)=>item.group===group).length;
    if(examStream(selected.className)==='Science'){
      for(const group of ['Compulsory-1','Compulsory-2','Elective-1','Elective-2','Elective-3'])if(count(group)!==1)return `Select exactly one subject in ${group}`;
      if(count('Additional Subject')>1)return 'Select maximum one Additional Subject';
      const names=subjectDraft.map((item)=>item.name);
      return new Set(names).size===names.length?'':'The same subject cannot be selected as both Elective and Additional';
    }
    if(count('Compulsory Group 1')!==1)return 'Select exactly one subject from Compulsory Group 1';
    if(count('Compulsory Group 2')!==1)return 'Select exactly one subject from Compulsory Group 2';
    if(count('Elective')!==3)return 'Select exactly three Elective subjects';
    if(count('Additional')>1)return 'Select maximum one Additional subject';
    const names=subjectDraft.map((item)=>item.name);
    return new Set(names).size===names.length?'':'The same subject cannot be selected in more than one group';
  };
  const saveSubjects=()=>{const error=validateSubjectSelection();if(error){notify(error);return;}update('students',(list)=>list.map((student)=>student.id===selected.id?{...student,subjectSelections:subjectDraft,subjectsUpdatedBy:roleConfig[role].name,subjectsUpdatedAt:'19-09-2026'}:student),{action:'UPDATE',record:selected.id,detail:`Student subjects updated: ${subjectDraft.map((item)=>item.name).join(', ')}`});setMode('view');notify(`${selected.name} ke ${subjectDraft.length} subjects save ho gaye`);};
  const saveCorrection=(event)=>{event.preventDefault();if(!/^\d{10}$/.test(draft.mobile||'')){notify('Mobile number must contain exactly 10 digits');return;}if(draft.pen&&!/^\d{11}$/.test(draft.pen)){notify('PEN must contain exactly 11 digits');return;}if(draft.eshiksha&&!/^\d{12}$/.test(draft.eshiksha)){notify('e-ShikshaKosh ID must contain exactly 12 digits');return;}if(draft.apaar&&!/^\d{12}$/.test(draft.apaar)){notify('APAAR ID must contain exactly 12 digits');return;}if(draft.bsebRegistered&&!draft.registration){notify('BSEB Registration Number is mandatory');return;}const corrected={...draft,lastCorrection:{reason,date:'19-09-2026',by:roleConfig[role].name}};update('students',(list)=>list.map((student)=>student.id===corrected.id?corrected:student),{action:'UPDATE',record:corrected.id,detail:`Student correction: ${reason}`});setMode('view');setDraft(null);notify(`${corrected.id} record correction saved`);};
  const exportMasked=()=>{const escape=(value)=>`"${String(value??'').replaceAll('"','""')}"`;const header=['Student ID','Name','Class','Roll','Gender','Attendance','Fee status'];const lines=[header,...rows.map((student)=>[student.id,student.name,student.className,student.roll,student.gender,`${student.attendance}%`,student.fee])];const url=URL.createObjectURL(new Blob([lines.map((line)=>line.map(escape).join(',')).join('\n')],{type:'text/csv'}));const anchor=document.createElement('a');anchor.href=url;anchor.download='UHS-student-records-masked.csv';anchor.click();URL.revokeObjectURL(url);notify('Masked student CSV downloaded');};
  const modalFooter=selected?(mode==='correct'?<><button className="btn btn-secondary" type="button" onClick={()=>setMode('view')}>Cancel</button><button className="btn btn-primary" type="submit" form="student-correction-form">Save correction</button></>:mode==='subjects'?<><button className="btn btn-secondary" onClick={()=>setMode('view')}>Cancel</button><button className="btn btn-primary" onClick={saveSubjects}>Save student subjects</button></>:<><button className="btn btn-secondary" onClick={closeRecord}>Close</button>{canTagSubjects&&<button className="btn btn-secondary" onClick={startSubjectEdit}>Manage subjects</button>}{canManage&&<button className="btn btn-primary" onClick={startCorrection}>Correct record</button>}</>):null;
  return <>
    <PageTitle title={role==='teacher'?'My class students':'Student records'} body={role==='teacher'?'Assigned Class IX-A students · academic view only':canTagSubjects?'Open a student profile to assign the exact subjects used in all-paper marks entry.':'Search approved records.'} actions={role!=='teacher'?<><button className="btn btn-secondary" onClick={exportMasked}>Export masked CSV</button><button className="btn btn-primary" onClick={()=>navigate('new-student')}>+ New student</button></>:null}/>
    <div className="record-summary"><div><span>Visible records</span><strong>{rows.length}</strong></div><div><span>Subjects configured</span><strong>{rows.filter((student)=>student.subjectSelections?.length).length}</strong></div><div><span>BSEB registered</span><strong>{rows.filter((student)=>student.bsebRegistered).length}</strong></div><div><span>Access</span><strong>{canManage?'Full record':role==='clerk'?'Office subjects':'Academic only'}</strong></div></div>
    <div className="filter-bar"><label className="table-search wide"><Icon name="search"/><input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Search name, student ID, class or roll"/></label><select className="small-select" value={classFilter} onChange={(event)=>setClassFilter(event.target.value)} aria-label="Filter by class"><option value="All">All classes</option><option value="9">Class 9</option><option value="10">Class 10</option><option value="11">Class 11</option><option value="12">Class 12</option></select></div>
    <div className="table-card student-record-table"><table><thead><tr><th>Student</th><th>Class / Roll</th><th>Category</th><th>Selected papers</th><th>BSEB</th>{canManage&&<th>Protected IDs</th>}<th></th></tr></thead><tbody>{rows.map((student)=>{const subjects=student.subjectSelections?.length?student.subjectSelections:defaultStudentSubjects(student);return <tr key={student.id}><td><div className="person-cell"><span>{student.name.split(' ').map((part)=>part[0]).slice(0,2).join('')}</span><div><strong>{student.name}</strong><small>{student.id}</small></div></div></td><td>{student.className} · {student.roll}</td><td>{student.category||'—'}</td><td><strong>{subjects.length}</strong><small className="block">{subjects.slice(0,3).map((item)=>item.name).join(', ')}{subjects.length>3?'…':''}</small></td><td><Status>{student.bsebRegistered?'Registered':'Pending'}</Status></td>{canManage&&<td className="protected-id">{student.pen||'Optional'}<small>{student.eshiksha||'Optional'}</small></td>}<td><button className="table-action" onClick={()=>openRecord(student)}>View profile <Icon name="arrow" size={14}/></button></td></tr>;})}</tbody></table>{rows.length===0&&<div className="empty-state">No student records match these filters.</div>}</div>
    <div className="security-banner"><Icon name="check"/><div><strong>Student-wise subject control</strong><span>Admin, Headmaster and Clerk can tag subjects. Government IDs remain visible only to Admin and Headmaster.</span></div></div>
    {selected&&<Modal title={mode==='correct'?'Correct student record':mode==='subjects'?'Assign student subjects':'Student profile'} onClose={closeRecord} footer={modalFooter}>
      {mode==='correct'?<form id="student-correction-form" className="modal-form record-edit-form" onSubmit={saveCorrection}>
        <div className="form-row"><label>Student name<input required value={draft.name} onChange={(event)=>setDraft({...draft,name:event.target.value})}/></label><label>Class / stream / section<input required value={draft.className} onChange={(event)=>setDraft({...draft,className:event.target.value})}/></label></div>
        <div className="form-row"><label>Roll number<input required value={draft.roll} onChange={(event)=>setDraft({...draft,roll:event.target.value})}/></label><label>Category<select value={draft.category||'General'} onChange={(event)=>setDraft({...draft,category:event.target.value})}>{['General','BC','EBC','EWS','SC','ST'].map((item)=><option key={item}>{item}</option>)}</select></label></div>
        <div className="form-row"><label>Gender<select value={draft.gender||'Female'} onChange={(event)=>setDraft({...draft,gender:event.target.value})}><option>Female</option><option>Male</option><option>Other</option></select></label><label>Date of birth (DD-MM-YYYY)<input required value={draft.dob||''} onChange={(event)=>setDraft({...draft,dob:event.target.value})}/></label></div>
        <div className="form-row"><label>Father / guardian<input required value={draft.guardian||''} onChange={(event)=>setDraft({...draft,guardian:event.target.value})}/></label><label>Mother<input required value={draft.mother||''} onChange={(event)=>setDraft({...draft,mother:event.target.value})}/></label></div>
        <label>Mobile number<input required maxLength="10" value={draft.mobile||''} onChange={(event)=>setDraft({...draft,mobile:event.target.value.replace(/\D/g,'')})}/></label><label>Address<textarea required value={draft.address||''} onChange={(event)=>setDraft({...draft,address:event.target.value})}/></label>
        <fieldset className="protected-edit-fields"><legend>Government identifiers</legend><div className="form-row"><label>PEN (optional, 11 digits)<input maxLength="11" value={draft.pen||''} onChange={(event)=>setDraft({...draft,pen:event.target.value.replace(/\D/g,'')})}/></label><label>APAAR (optional, 12 digits)<input maxLength="12" value={draft.apaar||''} onChange={(event)=>setDraft({...draft,apaar:event.target.value.replace(/\D/g,'')})}/></label></div><label>e-ShikshaKosh ID (optional, 12 digits)<input maxLength="12" value={draft.eshiksha||''} onChange={(event)=>setDraft({...draft,eshiksha:event.target.value.replace(/\D/g,'')})}/></label></fieldset>
        <label className="checkbox-line"><input type="checkbox" checked={Boolean(draft.bsebRegistered)} onChange={(event)=>setDraft({...draft,bsebRegistered:event.target.checked})}/><span><strong>BSEB registration completed</strong><small>Registration number becomes mandatory.</small></span></label>{draft.bsebRegistered&&<label>BSEB Registration Number<input required value={draft.registration||''} onChange={(event)=>setDraft({...draft,registration:event.target.value})}/></label>}<label>Correction reason<select required value={reason} onChange={(event)=>setReason(event.target.value)}><option value="">Select a reason</option><option>Admission register mismatch</option><option>Verified official document</option><option>Administrative data update</option></select></label>
      </form>:mode==='subjects'?<div className="student-subject-panel">
        <div className="record-lock-note"><Icon name="exam"/><div><strong>{selected.name} · Class {selected.className}</strong><span>Only selected papers will appear for this student in All papers marks entry.</span></div></div>
        <div className="subject-selection-groups">{Object.entries(subjectOptions.reduce((groups,item)=>({...groups,[item.group]:[...(groups[item.group]||[]),item]}),{})).map(([group,subjects])=><fieldset key={group}><legend>{group}</legend>{subjects.map((subject)=><label key={subjectOptionKey(subject)} className={subjectDraft.some((item)=>subjectOptionKey(item)===subjectOptionKey(subject))?'selected':''}><input type="checkbox" checked={subjectDraft.some((item)=>subjectOptionKey(item)===subjectOptionKey(subject))} onChange={()=>toggleSubject(subject)}/><span><strong>{subject.name}</strong><small>{subject.code?`Code ${subject.code}`:'School paper'}</small></span></label>)}</fieldset>)}</div>
        {examClassNumber(selected.className)>=11&&<div className="field-help">{examStream(selected.className)==='Science'?'Rule: one paper in each Compulsory and Elective slot; Additional Subject is optional and cannot duplicate Elective-3.':'Rule: 1 subject from each compulsory group, exactly 3 electives and maximum 1 additional paper.'}</div>}
      </div>:<div className="student-record-detail">
        <header><span className="record-avatar">{selected.name.split(' ').map((part)=>part[0]).slice(0,2).join('')}</span><div><h4>{selected.name}</h4><p>{selected.id} · Class {selected.className} · Roll {selected.roll}</p></div><Status>{selected.status||'Active'}</Status></header>
        <section><h5>Selected subjects</h5><div className="subject-chip-list">{selectedSubjects.map((subject)=><span key={subjectOptionKey(subject)}><b>{subject.name}</b><small>{subject.group}{subject.code?` · ${subject.code}`:''}</small></span>)}</div>{!selected.subjectSelections?.length&&<p className="field-help">Default selection is shown. Use Manage subjects to confirm the student’s actual papers.</p>}</section>
        <section><h5>Academic & personal record</h5><div className="review-grid"><div><span>Attendance</span><strong>{selected.attendance}%</strong></div><div><span>Fee status</span><strong>{selected.fee}</strong></div><div><span>Date of birth</span><strong>{selected.dob||'Not recorded'}</strong></div><div><span>Father / guardian</span><strong>{selected.guardian||'Not recorded'}</strong></div><div><span>Mother</span><strong>{selected.mother||'Not recorded'}</strong></div><div><span>Mobile</span><strong>{selected.mobile||'Not recorded'}</strong></div></div></section>
        {canManage?<section className="protected-record-panel"><div className="protected-record-heading"><Icon name="user"/><div><h5>Government identifiers</h5><p>Admin and Headmaster protected access</p></div></div><div className="protected-record-grid"><div><span>PEN</span><strong>{selected.pen||'Optional'}</strong></div><div><span>APAAR</span><strong>{selected.apaar||'Optional'}</strong></div><div><span>e-ShikshaKosh</span><strong>{selected.eshiksha||'Optional'}</strong></div></div></section>:<div className="record-permission-note"><Icon name="user"/><div><strong>Protected identifiers hidden</strong><span>Clerk can manage subjects, but cannot view protected government IDs.</span></div></div>}
      </div>}
    </Modal>}
  </>;
}

function BonafideCertificates({role,data,update,notify}) {
  const activeStudents=activeSessionStudents(data.students);
  const [search,setSearch]=useState('');
  const [studentId,setStudentId]=useState(activeStudents[0]?.id||'');
  const [purpose,setPurpose]=useState('General verification');
  const [remarks,setRemarks]=useState('');
  const student=activeStudents.find((item)=>item.id===studentId)||activeStudents[0];
  const issuedBy=roleConfig[role]?.name||'Authorized Officer';
  const today=new Date().toLocaleDateString('en-GB').replaceAll('/','-');
  const completionYear=String(Number((data.academicYear?.current||SESSION).slice(0,4))+1);
  const courseName=examClassNumber(student?.className)>=11?`Intermediate ${examStream(student?.className)} programme`:'Secondary school programme';
  const certNo=`UHS/BON/${String(data.bonafideCertificates?.length||0).padStart(3,'0')}/${String((data.bonafideCertificates?.length||0)+1).padStart(3,'0')}`;
  const rows=activeStudents.filter((item)=>`${item.name} ${item.id} ${item.className} ${item.roll} ${item.guardian}`.toLowerCase().includes(search.trim().toLowerCase())).slice(0,80);
  const saveIssue=()=>update('bonafideCertificates',(list=[])=>[{id:certNo,studentId:student.id,studentName:student.name,className:student.className,issuedOn:today,issuedBy,purpose,remarks},...list],{action:'INSERT',record:certNo,detail:`Bonafide certificate generated for ${student.name}`});
  const generatePdf=()=>{
    if(!student){notify('Select a student first');return;}
    const doc=new jsPDF({unit:'mm',format:'a4'});
    const pageWidth=doc.internal.pageSize.getWidth();
    doc.setDrawColor(25,64,120);doc.setLineWidth(0.8);doc.rect(12,12,pageWidth-24,273);
    doc.addImage(schoolLogo,'PNG',18,18,24,24);
    doc.setFont('helvetica','bold');doc.setFontSize(16);doc.text('UTKRAMIT HIGH SCHOOL PHURHURIYA',pageWidth/2,23,{align:'center'});
    doc.setFontSize(11);doc.text('Paraiya, Gaya, Bihar',pageWidth/2,30,{align:'center'});
    doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text(`UDISE Code: ${UDISE_CODE} | Session: ${data.academicYear?.current||SESSION}`,pageWidth/2,36,{align:'center'});
    doc.setLineWidth(0.3);doc.line(18,46,pageWidth-18,46);
    doc.setFontSize(10);doc.text(`Certificate No.: ${certNo}`,18,55);doc.text(`Date: ${today}`,pageWidth-18,55,{align:'right'});
    doc.setFont('helvetica','bold');doc.setFontSize(18);doc.text('BONAFIDE CERTIFICATE',pageWidth/2,72,{align:'center'});
    doc.setFont('helvetica','normal');doc.setFontSize(12);
    const body=`This is to certify that Mr/Ms ${student.name}, bearing Registration No. ${student.registration||student.id}, is a bonafide student of this school, studying in Class ${student.className} under the ${courseName} during Academic Year ${data.academicYear?.current||SESSION}.`;
    doc.text(doc.splitTextToSize(body, pageWidth-44),22,88,{lineHeightFactor:1.8});
    doc.setFont('helvetica','bold');doc.text('The student details as entered in our school record are:',22,122);
    autoTable(doc,{startY:130,theme:'grid',styles:{fontSize:11,cellPadding:3,lineColor:[180,190,205],lineWidth:0.2},headStyles:{fillColor:[25,64,120],textColor:255},head:[['Field','Details']],body:[
      ['Date of Birth',student.dob||'Not recorded'],
      ["Father's Name",student.guardian||'Not recorded'],
      ["Mother's Name",student.mother||'Not recorded'],
      ['Class / Section / Roll',`${student.className} / ${student.section||'-'} / ${student.roll||'-'}`],
      ['Date of Admission',student.admission||'Not recorded'],
      ['Expected Year of Course Completion',completionYear],
      ['Purpose',purpose],
    ]});
    const y=Math.max(doc.lastAutoTable.finalY+24,205);
    if(remarks.trim()){doc.setFont('helvetica','normal');doc.text(`Remarks: ${remarks.trim()}`,22,y-10);}
    doc.line(pageWidth-72,y,pageWidth-22,y);
    doc.setFont('helvetica','bold');doc.text('Authorized Signature with Stamp',pageWidth-22,y+7,{align:'right'});
    doc.setFont('helvetica','normal');doc.text(`Name: ${issuedBy}`,pageWidth-22,y+15,{align:'right'});
    doc.text(`Designation: ${role==='clerk'?'Clerk / School Office':role==='headmaster'?'Headmaster':'School Administrator'}`,pageWidth-22,y+22,{align:'right'});
    doc.text('Mobile: 9876543210',pageWidth-22,y+29,{align:'right'});
    doc.text('Email: uhs.phurhuriya@school.edu',pageWidth-22,y+36,{align:'right'});
    doc.setFontSize(9);doc.text('To be printed on official school letter pad.',pageWidth/2,278,{align:'center'});
    saveIssue();
    doc.save(`${student.name.replaceAll(' ','_')}_Bonafide_Certificate.pdf`);
    notify(`Bonafide certificate generated for ${student.name}`);
  };
  return <>
    <PageTitle title="Bonafide certificates" body="Admin, Headmaster and Clerk can generate a student bonafide certificate in the attached sample format." actions={<button className="btn btn-primary" disabled={!student} onClick={generatePdf}>Download PDF certificate</button>}/>
    <div className="dashboard-grid">
      <section className="content-card">
        <div className="card-head"><div><span className="eyebrow">Student selection</span><h3>Select student</h3></div></div>
        <label className="table-search wide"><Icon name="search"/><input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Search student name, ID, class, roll or father name"/></label>
        <div className="certificate-student-list">{rows.map((item)=><button key={item.id} className={item.id===student?.id?'active':''} onClick={()=>setStudentId(item.id)}><span><strong>{item.name}</strong><small>{item.id} · Class {item.className} · Roll {item.roll}</small></span><Status>{item.bsebRegistered?'Registered':'School ID'}</Status></button>)}</div>
      </section>
      <section className="content-card bonafide-preview">
        <div className="card-head"><div><span className="eyebrow">Certificate preview</span><h3>BONAFIDE CERTIFICATE</h3></div><Status>{role.toUpperCase()}</Status></div>
        {student?<><p>This is to certify that Mr/Ms <strong>{student.name}</strong>, bearing Registration No. <strong>{student.registration||student.id}</strong>, is a bonafide student of this school, studying in Class <strong>{student.className}</strong> during Academic Year <strong>{data.academicYear?.current||SESSION}</strong>.</p>
        <div className="review-grid"><div><span>Date of Birth</span><strong>{student.dob||'Not recorded'}</strong></div><div><span>Father's Name</span><strong>{student.guardian||'Not recorded'}</strong></div><div><span>Mother's Name</span><strong>{student.mother||'Not recorded'}</strong></div><div><span>Date of Admission</span><strong>{student.admission||'Not recorded'}</strong></div><div><span>Expected completion</span><strong>{completionYear}</strong></div><div><span>Issued by</span><strong>{issuedBy}</strong></div></div>
        <label>Purpose<select value={purpose} onChange={(event)=>setPurpose(event.target.value)}><option>General verification</option><option>Scholarship application</option><option>Bank account opening</option><option>Residence proof support</option><option>Board / examination work</option></select></label>
        <label>Remarks / note<textarea rows={3} value={remarks} onChange={(event)=>setRemarks(event.target.value)} placeholder="Optional note printed on the certificate"/></label></>:<div className="empty-state">No active student found.</div>}
      </section>
    </div>
    <section className="content-card">
      <div className="card-head"><div><span className="eyebrow">Issue register</span><h3>Recent bonafide certificates</h3></div></div>
      {(data.bonafideCertificates||[]).length?<div className="table-card embedded-table"><table><thead><tr><th>Certificate</th><th>Student</th><th>Class</th><th>Issued on</th><th>Issued by</th></tr></thead><tbody>{data.bonafideCertificates.slice(0,8).map((item)=><tr key={item.id}><td><strong>{item.id}</strong></td><td>{item.studentName}</td><td>{item.className}</td><td>{item.issuedOn}</td><td>{item.issuedBy}</td></tr>)}</tbody></table></div>:<div className="empty-state">Certificate register will appear after the first PDF is generated.</div>}
    </section>
  </>;
}

function SubjectSettings({data,update,notify}) {
  const [classNumber,setClassNumber]=useState('11');
  const [stream,setStream]=useState('Science');
  const options=subjectOptionsForClass(`${classNumber}-${stream}-A`);
  const settingFor=(subject)=>(data.subjectSettings||[]).find((item)=>item.classNumber===classNumber&&item.stream===stream&&item.subject===subject.name&&item.group===subject.group&&String(item.code||'')===String(subject.code||''));
  const [draft,setDraft]=useState({});
  const formatFor=(subject)=>draft[subjectOptionKey(subject)]||settingFor(subject)?.paperFormat||defaultIntermediatePaperFormat(subject.name);
  const save=()=>{
    const kept=(data.subjectSettings||[]).filter((item)=>item.classNumber!==classNumber||item.stream!==stream);
    const next=options.map((subject)=>({id:`${classNumber}|${stream}|${subjectOptionKey(subject)}`,classNumber,stream,subject:subject.name,group:subject.group,code:subject.code||'',paperFormat:formatFor(subject),updatedAt:'19-09-2026'}));
    update('subjectSettings',()=>[...kept,...next],{action:'UPDATE',record:`Class ${classNumber} ${stream}`,detail:`${next.length} subject paper formats saved`});
    setDraft({});notify(`Class ${classNumber} ${stream} subject settings saved`);
  };
  const grouped=options.reduce((groups,item)=>({...groups,[item.group]:[...(groups[item.group]||[]),item]}),{});
  return <>
    <PageTitle title="Class XI–XII subject settings" body="Set each paper as Theory 100 or Theory 70 + Practical 30. These settings drive all-paper marks entry." actions={<button className="btn btn-primary" onClick={save}>Save subject settings</button>}/>
    <section className="content-card subject-settings-controls"><label>Class<select value={classNumber} onChange={(event)=>{setClassNumber(event.target.value);setDraft({});}}><option value="11">Class XI</option><option value="12">Class XII</option></select></label><label>Stream<select value={stream} onChange={(event)=>{setStream(event.target.value);setDraft({});}}><option>Science</option><option>Arts</option><option>Commerce</option></select></label><div><span>{stream==='Science'?'Selection slots':'Configured papers'}</span><strong>{stream==='Science'?6:options.length}</strong></div></section>
    <div className="subject-settings-list">{Object.entries(grouped).map(([group,subjects])=><section className="content-card" key={group}><header><div><span className="eyebrow">{stream}</span><h3>{group}</h3></div><span>{/additional/i.test(group)?'Optional · excluded from aggregate':'Counts in result'}</span></header>{subjects.map((subject)=><div className="subject-setting-row" key={subjectOptionKey(subject)}><div><strong>{subject.name}</strong><small>{subject.code?`Subject code ${subject.code}`:subjects.length>1?'Choose one for this slot':'Fixed paper'}</small></div><select value={formatFor(subject)} onChange={(event)=>setDraft({...draft,[subjectOptionKey(subject)]:event.target.value})}><option>Theory 100</option><option>Theory 70 + Practical 30</option></select><span>{formatFor(subject)==='Theory 100'?'Pass: 30/100':'Theory pass: 24/70'}</span></div>)}</section>)}</div>
    <div className="security-banner"><Icon name="check"/><div><strong>Paper rules connected to marks entry</strong><span>All-paper marks entry automatically shows one marks column for Theory 100 and separate Theory + Practical columns for practical papers.</span></div></div>
  </>;
}

function Teachers({role,data,update,notify,navigate}) {
  const staff=(data.teachers||INITIAL.teachers).map((teacher,index)=>({userId:teacher.email?.split('@')[0]||`staff${index+1}`,appointedSubject:teacher.subject||'',appointmentGroup:teacher.classes?.includes('XI')?'11-12':'9-10',category:'General',gender:'Other',eshiksha:'',...teacher,dob:formatDateDMY(teacher.dob||'01-01-1990'),joining:formatDateDMY(teacher.joining),retirement:teacher.retirement||calculateRetirementDate(teacher.dob||'01-01-1990')}));
  const canManage=['admin','headmaster'].includes(role);
  const [deleteTarget,setDeleteTarget]=useState(null);
  const [deleteReason,setDeleteReason]=useState('');
  const deleteLinks=(id)=>[
    ['class teacher assignments',(data.classTeacherAssignments||[]).filter(item=>item.teacherId===id).length],
    ['subject assignments',(data.examAssignments||[]).filter(item=>item.teacherId===id).length],
    ['weekly routine periods',(data.routine||[]).filter(item=>item.teacherId===id).length],
    ['current / future daily substitutions',(data.dailyRoutineAdjustments||[]).filter(item=>item.substituteId===id&&dmyTime(item.date)>=dmyTime(schoolDate())).length],
    ['current / future in-charge duties',(data.inchargeDelegations||[]).filter(item=>item.staffId===id&&item.status!=='Cancelled'&&dmyTime(item.to)>=dmyTime(schoolDate())).length],
  ].filter(([,count])=>count>0);
  const deleteStaff=()=>{
    if(!canManage||!deleteTarget||!deleteReason.trim())return;
    if(deleteTarget.name===roleConfig[role].name)return notify('You cannot delete your own staff profile.');
    if(deleteTarget.role==='Admin'&&staff.filter(item=>item.role==='Admin').length<=1)return notify('The last Admin cannot be deleted.');
    if(deleteLinks(deleteTarget.id).length)return notify('Reassign or remove linked assignments and routine periods first.');
    update('teachers',items=>items.map(item=>item.id===deleteTarget.id?{...item,status:'Deleted',deletedAt:approvalTimestamp(),deletedBy:roleConfig[role].name,deletionReason:deleteReason.trim()}:item),{action:'DELETE',record:deleteTarget.id,detail:`Staff ${deleteTarget.name} deleted. Reason: ${deleteReason.trim()}`});
    setDeleteTarget(null);setSelectedId(null);notify('Staff deleted from active directory. Historical records retained.');
  };
  const [search,setSearch]=useState('');
  const [subjectFilter,setSubjectFilter]=useState('All');
  const [statusFilter,setStatusFilter]=useState('All');
  const [selectedId,setSelectedId]=useState(null);
  const [formMode,setFormMode]=useState(null);
  const [draft,setDraft]=useState(null);
  const selected=staff.find((teacher)=>teacher.id===selectedId);
  const subjects=[...new Set(staff.map((teacher)=>teacher.subject))].sort();
  const term=search.trim().toLowerCase();
  const filtered=staff.filter((teacher)=>(subjectFilter==='All'||teacher.subject===subjectFilter)&&(statusFilter==='All'||teacher.status===statusFilter)&&(!term||`${teacher.name} ${teacher.id} ${teacher.designation} ${teacher.subject} ${teacher.classes}`.toLowerCase().includes(term)));
  const openProfile=(teacher)=>{setSelectedId(teacher.id);setFormMode(null);setDraft(null);};
  const startAdd=()=>{
    if(!canManage)return;
    setSelectedId(null);
    setDraft({name:'',gender:'',designation:'TGT',subject:'',appointedSubject:'',appointmentGroup:'9-10',category:'General',eshiksha:'',dob:'',retirement:'',classes:'IX-X',classTeacher:'—',qualification:'',joining:schoolDate(),mobile:'',email:'',userId:'',employmentType:'Permanent',role:'Teacher',status:'Active',attendance:100,photoIndex:staff.length%teacherPortraitPositions.length});
    setFormMode('add');
  };
  const startEdit=()=>{if(!canManage)return;setDraft({...selected});setFormMode('edit');};
  const closeForm=()=>{if(formMode==='add')setSelectedId(null);setFormMode(null);setDraft(null);};
  const saveProfile=(event)=>{
    event.preventDefault();
    if(!canManage||!draft)return;
    if(role!=='admin'&&((formMode==='add'&&!['Teacher','Clerk'].includes(draft.role))||(formMode==='edit'&&draft.role!==selected?.role)))return notify('Only Admin can change an existing staff role.');
    const identifiers=data.staffIdentifiers||staff;
    if(!draft.name.trim()||!draft.userId.trim())return notify('Enter staff name and User ID.');
    if(identifiers.some(item=>item.id!==draft.id&&(item.userId?.toLowerCase()===draft.userId.trim().toLowerCase()||item.email?.toLowerCase()===draft.email.trim().toLowerCase())))return notify('User ID or email already belongs to a staff record.');
    if(!['Female','Male','Other'].includes(draft.gender)){notify('Select staff gender');return;}
    if(!/^\d{2}-\d{2}-\d{4}$/.test(draft.dob||'')||!/^\d{2}-\d{2}-\d{4}$/.test(draft.joining||'')){notify('Date of Birth and Date of Joining must be DD-MM-YYYY');return;}
    if(!/^\d{10}$/.test(draft.mobile||'')){notify('Mobile number must contain exactly 10 digits');return;}
    if((draft.role==='Teacher'||draft.role==='Headmaster')&&!/^\d{12}$/.test(draft.eshiksha||'')){notify('e-ShikshaKosh ID must contain exactly 12 digits');return;}
    const nextNumber=Math.max(0,...identifiers.map((teacher)=>Number(teacher.id.replace(/\D/g,''))||0))+1;
    const saved={...draft,name:draft.name.trim(),userId:draft.userId.trim(),email:draft.email.trim(),subject:draft.appointedSubject||draft.subject,retirement:calculateRetirementDate(draft.dob),id:formMode==='add'?`EMP-${String(nextNumber).padStart(3,'0')}`:draft.id,passwordStatus:formMode==='add'?'Default password 123456':draft.passwordStatus};
    update('teachers',(items)=>formMode==='add'?[...items,saved]:items.map((teacher)=>teacher.id===saved.id?saved:teacher),{action:formMode==='add'?'INSERT':'UPDATE',record:saved.id,detail:formMode==='add'?'Staff account created with default password':'Staff profile updated'});
    setSelectedId(saved.id);
    setFormMode(null);
    setDraft(null);
    notify(formMode==='add'?`${saved.name} added to staff directory`:`${saved.name} profile updated`);
  };
  const uploadPhoto=(file,target)=>{if(!file)return;if(file.size>102400){notify('Profile photo must be 100 KB or smaller');return;}const reader=new FileReader();reader.onload=()=>{if(target==='self'){update('teachers',(items)=>items.map((item)=>item.id===ownProfile.id?{...item,photoUrl:reader.result}:item),{action:'UPDATE',record:ownProfile.id,detail:'Profile photo changed'});notify('Profile photo updated');}else setDraft({...draft,photoUrl:reader.result});};reader.readAsDataURL(file);};
  const ownProfile=staff.find((teacher)=>teacher.name===roleConfig.teacher.name);
  if(role==='teacher'&&!ownProfile)return <PageTitle title="Staff profile unavailable" body="Contact Admin or Headmaster to check your staff record."/>;

  if(role==='teacher') return <>
    <PageTitle eyebrow="Teacher workspace" title="My professional profile" body="Your verified employment details, assignments and school contact information."/>
    <section className="teacher-self-hero">
      <div className="staff-profile-photo" role="img" aria-label={`Profile photo for ${ownProfile.name}`} style={{backgroundImage:`url(${ownProfile.photoUrl||demoTeacherPortraits})`,backgroundSize:ownProfile.photoUrl?'cover':'400% 300%',backgroundPosition:ownProfile.photoUrl?'center':teacherPortraitPositions[ownProfile.photoIndex]}}>{!ownProfile.photoUrl&&<span>Demo photo</span>}</div>
      <div className="teacher-self-copy"><span className="eyebrow">{ownProfile.id} · {ownProfile.employmentType}</span><h2>{ownProfile.name}</h2><p>{ownProfile.designation} · {ownProfile.subject}</p><Status>{ownProfile.status}</Status></div>
      <div className="teacher-self-stats"><div><span>Attendance</span><strong>{ownProfile.attendance}%</strong></div><div><span>Joined</span><strong>{ownProfile.joining}</strong></div></div>
    </section><label className="btn btn-secondary profile-photo-upload">Change profile photo (max 100 KB)<input type="file" accept="image/jpeg,image/png" onChange={(event)=>uploadPhoto(event.target.files?.[0],'self')}/></label>
    <div className="teacher-self-grid">
      <section className="content-card staff-profile-section"><div className="card-head"><div><span className="eyebrow">Professional details</span><h3>Verified profile</h3></div></div><div className="review-grid"><div><span>Employee ID</span><strong>{ownProfile.id}</strong></div><div><span>Gender</span><strong>{ownProfile.gender}</strong></div><div><span>Employment</span><strong>{ownProfile.employmentType}</strong></div><div><span>Qualification</span><strong>{ownProfile.qualification}</strong></div><div><span>Role</span><strong>{ownProfile.role}</strong></div><div><span>Official email</span><strong>{ownProfile.email}</strong></div><div><span>Mobile</span><strong>{ownProfile.mobile}</strong></div></div></section>
      <section className="content-card staff-profile-section"><div className="card-head"><div><span className="eyebrow">Teaching load</span><h3>Current assignments</h3></div></div><div className="assignment-list"><div><i><Icon name="exam"/></i><span><small>Primary subject</small><strong>{ownProfile.subject}</strong></span></div><div><i><Icon name="users"/></i><span><small>Assigned classes</small><strong>{ownProfile.classes}</strong></span></div><div><i><Icon name="teacher"/></i><span><small>Class teacher</small><strong>{ownProfile.classTeacher}</strong></span></div></div><div className="teacher-profile-actions"><button onClick={()=>navigate('leaves')}><Icon name="calendar"/><span><strong>Leave records</strong><small>Apply and track requests</small></span><Icon name="arrow" size={15}/></button><button onClick={()=>navigate('exams')}><Icon name="exam"/><span><strong>Marks & exams</strong><small>Open assigned assessments</small></span><Icon name="arrow" size={15}/></button></div></section>
    </div>
    <div className="security-banner"><Icon name="check"/><div><strong>Verified read-only profile</strong><span>Employment details can only be changed by an authorised administrator after document verification.</span></div></div>
  </>;

  if(!canManage)return <PageTitle title="Staff management unavailable" body="Only Admin and Headmaster can manage staff records."/>;
  const formFooter=<><button className="btn btn-secondary" type="button" onClick={closeForm}>Cancel</button><button className="btn btn-primary" type="submit" form="staff-profile-form">{formMode==='add'?'Add staff member':'Save changes'}</button></>;
  const profileFooter=selected?<><button className="btn btn-secondary" onClick={()=>setSelectedId(null)}>Close</button><button className="btn btn-secondary danger-action" onClick={()=>{setDeleteTarget(selected);setDeleteReason('');setSelectedId(null);}}>Delete staff</button><button className="btn btn-primary" onClick={startEdit}>Edit profile</button></>:null;

  return <>
    <PageTitle title="Teachers & staff" body="Manage verified profiles, subjects and class responsibilities." actions={<button className="btn btn-primary" onClick={startAdd}>+ Add staff member</button>}/>
    <div className="record-summary"><div><span>Total staff</span><strong>{staff.length}</strong></div><div><span>Active</span><strong>{staff.filter((teacher)=>teacher.status==='Active').length}</strong></div><div><span>Class teachers</span><strong>{staff.filter((teacher)=>teacher.classTeacher&&teacher.classTeacher!=='—').length}</strong></div><div><span>On leave</span><strong>{staff.filter((teacher)=>teacher.status==='On leave').length}</strong></div></div>
    <div className="filter-bar staff-filter-bar"><label className="table-search wide"><Icon name="search"/><input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Search name, employee ID, subject or class"/></label><div className="staff-selects"><select className="small-select" value={subjectFilter} onChange={(event)=>setSubjectFilter(event.target.value)} aria-label="Filter by subject"><option value="All">All subjects</option>{subjects.map((subject)=><option key={subject}>{subject}</option>)}</select><select className="small-select" value={statusFilter} onChange={(event)=>setStatusFilter(event.target.value)} aria-label="Filter by status"><option value="All">All status</option><option>Active</option><option>On leave</option><option>Inactive</option></select></div></div>
    <div className="staff-card-grid">{filtered.map((teacher)=><article className="staff-card" key={teacher.id}>
      <div className="staff-photo" role="img" aria-label={`Profile photo for ${teacher.name}`} style={{backgroundImage:`url(${teacher.photoUrl||demoTeacherPortraits})`,backgroundSize:teacher.photoUrl?'cover':'400% 300%',backgroundPosition:teacher.photoUrl?'center':teacherPortraitPositions[teacher.photoIndex??0]}}>{!teacher.photoUrl&&<span>Demo photo</span>}</div>
      <div className="staff-card-copy"><div className="staff-card-heading"><span><small>{teacher.designation}</small><h3>{teacher.name}</h3></span><Status>{teacher.status}</Status></div><p>{teacher.subject}</p><dl><div><dt>Employee ID</dt><dd>{teacher.id}</dd></div><div><dt>Class teacher</dt><dd>{teacher.classTeacher}</dd></div><div><dt>Assigned classes</dt><dd>{teacher.classes}</dd></div></dl><button className="btn btn-secondary btn-full" onClick={()=>openProfile(teacher)}>View profile <Icon name="arrow" size={15}/></button></div>
    </article>)}</div>
    {filtered.length===0&&<div className="content-card empty-state">No staff profiles match these filters.</div>}
    <div className="staff-demo-note"><Icon name="image"/><div><strong>Prototype staff directory</strong><span>Names, contact details and portraits are sample data. Replace them with verified staff records and approved photographs before public launch.</span></div></div>
    {formMode&&draft&&<Modal title={formMode==='add'?'Add staff member':'Edit staff profile'} onClose={closeForm} footer={formFooter}><form id="staff-profile-form" className="modal-form staff-edit-form" onSubmit={saveProfile}>
      <div className="record-lock-note"><Icon name={formMode==='add'?'users':'file'}/><div><strong>{formMode==='add'?'New employee record':'Administrator edit mode'}</strong><span>{formMode==='add'?'An employee ID will be generated when this record is saved.':`${draft.id} is locked; profile changes are recorded in the prototype directory.`}</span></div></div>
      <div className="form-row"><label>Full name<input required value={draft.name} onChange={(event)=>setDraft({...draft,name:event.target.value})}/></label><label>Designation<input required value={draft.designation} onChange={(event)=>setDraft({...draft,designation:event.target.value})}/></label></div>
      <div className="form-row"><label>Appointed subject<input required={draft.role!=='Clerk'} value={draft.appointedSubject||''} onChange={(event)=>setDraft({...draft,appointedSubject:event.target.value,subject:event.target.value})}/></label><label>Highest qualification<input required value={draft.qualification} onChange={(event)=>setDraft({...draft,qualification:event.target.value})}/></label></div>
      <div className="form-row"><label>Teacher category<select value={draft.appointmentGroup||'9-10'} onChange={(event)=>setDraft({...draft,appointmentGroup:event.target.value})}><option>9-10</option><option>11-12</option></select></label><label>Gender<select required value={draft.gender||''} onChange={(event)=>setDraft({...draft,gender:event.target.value})}><option value="">Select gender</option><option>Female</option><option>Male</option><option>Other</option></select></label></div>
      <label>Social category<select value={draft.category||'General'} onChange={(event)=>setDraft({...draft,category:event.target.value})}>{['General','BC','EBC','EWS','SC','ST'].map((item)=><option key={item}>{item}</option>)}</select></label>
      <div className="form-row"><label>Assigned classes<input required={draft.role!=='Clerk'} value={draft.classes} onChange={(event)=>setDraft({...draft,classes:event.target.value})}/></label><label>Class Teacher assignment<input value={draft.classTeacher} disabled/><small>Managed separately under Teacher Assignments.</small></label></div>
      <div className="form-row"><label>Date of birth (DD-MM-YYYY)<input required placeholder="02-01-1990" value={draft.dob||''} onChange={(event)=>setDraft({...draft,dob:event.target.value,retirement:calculateRetirementDate(event.target.value)})}/></label><label>Retirement date<input value={draft.retirement||calculateRetirementDate(draft.dob)} readOnly/></label></div>
      <div className="form-row"><label>Date of joining (DD-MM-YYYY)<input required value={draft.joining} onChange={(event)=>setDraft({...draft,joining:event.target.value})}/></label><label>Employment type<select value={draft.employmentType} onChange={(event)=>setDraft({...draft,employmentType:event.target.value})}><option>Permanent</option><option>Contract</option><option>Guest faculty</option></select></label></div>
      <div className="form-row"><label>Official email<input type="email" required value={draft.email} onChange={(event)=>setDraft({...draft,email:event.target.value})}/></label><label>Mobile - 10 digits<input required maxLength="10" value={draft.mobile} onChange={(event)=>setDraft({...draft,mobile:event.target.value.replace(/\D/g,'')})}/></label></div>
      <div className="form-row"><label>User ID<input required value={draft.userId||''} onChange={(event)=>setDraft({...draft,userId:event.target.value})}/></label><label>e-ShikshaKosh ID<input maxLength="12" value={draft.eshiksha||''} onChange={(event)=>setDraft({...draft,eshiksha:event.target.value.replace(/\D/g,'')})}/></label></div>
      <div className="form-row"><label>ERP role<select disabled={role!=='admin'&&formMode!=='add'} value={draft.role} onChange={(event)=>setDraft({...draft,role:event.target.value})}>{(role==='admin'?['Admin','Teacher','Headmaster','Clerk']:formMode==='add'?['Teacher','Clerk']:[draft.role]).map(item=><option key={item}>{item}</option>)}</select></label><label>Status<select value={draft.status} onChange={(event)=>setDraft({...draft,status:event.target.value})}><option>Active</option><option>On leave</option><option>Inactive</option></select></label></div>
      <label className="photo-placeholder-note profile-photo-field"><Icon name="image"/><span>Profile photo (JPG/PNG, maximum 100 KB)</span><input type="file" accept="image/jpeg,image/png" onChange={(event)=>uploadPhoto(event.target.files?.[0],'draft')}/></label>
      {formMode==='add'&&<div className="record-lock-note"><Icon name="check"/><div><strong>Default password: 123456</strong><span>The new staff member must change it after first login.</span></div></div>}
    </form></Modal>}
    {deleteTarget&&<Modal title="Delete staff member" onClose={()=>setDeleteTarget(null)} footer={<><button className="btn btn-secondary" onClick={()=>setDeleteTarget(null)}>Cancel</button><button className="btn btn-primary danger-action" disabled={!deleteReason.trim()||deleteLinks(deleteTarget.id).length>0||deleteTarget.name===roleConfig[role].name||(deleteTarget.role==='Admin'&&staff.filter(item=>item.role==='Admin').length<=1)} onClick={deleteStaff}>Confirm delete</button></>}><h3>{deleteTarget.name} · {deleteTarget.id}</h3><p>This removes the staff member from the active directory and staff selectors. Previous leave, attendance and audit records will be retained.</p>{deleteTarget.name===roleConfig[role].name&&<p role="alert">You cannot delete your own staff profile.</p>}{deleteTarget.role==='Admin'&&staff.filter(item=>item.role==='Admin').length<=1&&<p role="alert">The last Admin cannot be deleted.</p>}{deleteLinks(deleteTarget.id).length>0&&<div className="warning-banner"><div><strong>Reassign these responsibilities first</strong><ul>{deleteLinks(deleteTarget.id).map(([label,count])=><li key={label}>{count} {label}</li>)}</ul><p>Use Academics → Teacher assignments / Routine management, then delete this staff member.</p></div></div>}<label>Reason for deletion<textarea required value={deleteReason} onChange={event=>setDeleteReason(event.target.value)}/></label></Modal>}
    {!formMode&&selected&&<Modal title="Staff profile" onClose={()=>setSelectedId(null)} footer={profileFooter}><div className="staff-profile-view"><header><div className="staff-profile-photo" role="img" aria-label={`Profile photo for ${selected.name}`} style={{backgroundImage:`url(${selected.photoUrl||demoTeacherPortraits})`,backgroundSize:selected.photoUrl?'cover':'400% 300%',backgroundPosition:selected.photoUrl?'center':teacherPortraitPositions[selected.photoIndex??0]}}>{!selected.photoUrl&&<span>Demo photo</span>}</div><div><small>{selected.id} · {selected.employmentType}</small><h4>{selected.name}</h4><p>{selected.designation} · {selected.subject}</p></div><Status>{selected.status}</Status></header><section><h5>Professional information</h5><div className="review-grid"><div><span>User ID</span><strong>{selected.userId}</strong></div><div><span>Gender</span><strong>{selected.gender}</strong></div><div><span>Qualification</span><strong>{selected.qualification}</strong></div><div><span>Date of birth</span><strong>{selected.dob}</strong></div><div><span>Date of joining</span><strong>{selected.joining}</strong></div><div><span>Retirement date</span><strong>{selected.retirement}</strong></div><div><span>Category</span><strong>{selected.category}</strong></div><div><span>ERP role</span><strong>{selected.role}</strong></div><div><span>e-ShikshaKosh ID</span><strong>{selected.eshiksha||'Not recorded'}</strong></div></div></section><section><h5>Current assignments</h5><div className="review-grid"><div><span>Appointed subject</span><strong>{selected.appointedSubject||selected.subject}</strong></div><div><span>Teacher category</span><strong>{selected.appointmentGroup}</strong></div><div><span>Assigned classes</span><strong>{selected.classes}</strong></div><div><span>Class teacher</span><strong>{selected.classTeacher}</strong></div></div></section><section><h5>School contact</h5><div className="review-grid"><div><span>Official email</span><strong>{selected.email}</strong></div><div><span>Mobile</span><strong>{selected.mobile}</strong></div></div></section><div className="correction-history"><Icon name="check"/><div><strong>Authorized staff record</strong><span>Admin or Headmaster may update verified profile fields. Only Admin can change the ERP role.</span></div></div></div></Modal>}
  </>;
}

function Leaves({role,data,update,notify}) {
  const canManage=role==='admin'||role==='headmaster';
  const isAdmin=role==='admin';
  const [modal,setModal]=useState(false);
  const [tab,setTab]=useState('requests');
  const [form,setForm]=useState({staffId:'EMP-014',from:'24-09-2026',to:'25-09-2026',leaveType:'Casual leave',reason:'Essential personal work',inchargeId:''});
  const [protectedLeaveAction,setProtectedLeaveAction]=useState(null);
  const [protectedLeaveReason,setProtectedLeaveReason]=useState('');
  const staff=data.teachers.filter((item)=>item.role==='Teacher'||item.role==='Headmaster');
  const teachers=staff.filter((item)=>item.role==='Teacher'&&item.status!=='Inactive');
  const normalize=(item)=>{
    const found=staff.find((member)=>member.id===item.staffId||member.name===item.name);
    const dates=String(item.dates||'').match(/(\d{2}-\d{2}-\d{4})(?:\s+to\s+(\d{2}-\d{2}-\d{4}))?/);
    return {...item,staffId:item.staffId||found?.id||'',from:item.from||dates?.[1]||'',to:item.to||dates?.[2]||dates?.[1]||'',leaveType:item.leaveType||item.reason||'Leave',staffRole:found?.role||(String(item.role).startsWith('Headmaster')?'Headmaster':'Teacher')};
  };
  const today=dmyTime(ATTENDANCE_TODAY);
  const rows=(canManage?data.leaves:data.leaves.filter((item)=>item.staffId==='EMP-014'||item.name==='Neha Kumari')).map(normalize);
  const delegations=(data.inchargeDelegations||[]).map((item)=>{
    const state=item.status==='Revoked'?'Revoked':today>dmyTime(item.to)?'Expired':today>=dmyTime(item.from)?'Active':'Scheduled';
    return {...item,state};
  });
  const applicant=staff.find((item)=>item.id===form.staffId)||staff[0];
  const isHeadmasterLeave=applicant?.role==='Headmaster';
  const setApplicant=(staffId)=>{const next=staff.find((item)=>item.id===staffId);setForm({...form,staffId,inchargeId:'',leaveType:next?.gender==='Female'?form.leaveType:form.leaveType==='Special leave (SL)'?'Casual leave':form.leaveType});};
  const daysInclusive=(from,to)=>Math.floor((dmyTime(to)-dmyTime(from))/86400000)+1;
  const specialMonth=String(form.from).slice(3);
  const specialUsed=rows.filter((item)=>item.staffId===applicant?.id&&item.leaveType==='Special leave (SL)'&&!['Rejected','Revoked'].includes(item.status)&&String(item.from).slice(3)===specialMonth).reduce((sum,item)=>sum+Math.max(0,daysInclusive(item.from,item.to)),0);
  const reject=(item)=>{update('leaves',(items)=>items.map((row)=>row.id===item.id?{...row,status:'Rejected',decidedBy:roleConfig[role].name,decidedAt:'17-09-2026 12:00 PM'}:row),{action:'UPDATE',record:`Leave ${item.id}`,detail:`${item.name} leave rejected`});notify('Leave request rejected');};
  const approve=(item)=>{
    update('leaves',(items)=>items.map((row)=>row.id===item.id?{...row,status:'Approved',substituteId:'',substituteName:'',approvedBy:roleConfig[role].name,approvedAt:'17-09-2026 12:00 PM'}:row),{action:'UPDATE',record:`Leave ${item.id}`,detail:`${item.name} leave approved; daily routine flagged for rescheduling`});
    notify('Leave approved; affected periods will appear red in Daily rescheduling');
  };
  const finalizeLeaveRevocation=(item,dualApproval=false)=>{
    update('leaves',(items)=>items.map((row)=>row.id===item.id?{...row,status:'Revoked',cancellationRequest:null,revokedBy:roleConfig[role].name,revokedAt:'20-09-2026 10:18 PM',dualApproval}:row),{action:dualApproval?'REVOKE':'UPDATE',record:`Leave ${item.id}`,detail:dualApproval?`${item.name} completed leave revoked after separate Admin and Headmaster approvals`:`${item.name} approved leave revoked`});
    update('dailyRoutineAdjustments',(items=[])=>items.filter((entry)=>!(entry.originalTeacherId===item.staffId&&dmyTime(entry.date)>=dmyTime(item.from)&&dmyTime(entry.date)<=dmyTime(item.to))),{action:'DELETE',record:item.staffId,detail:'Date-specific substitute duties removed after leave revocation'});
    if(item.staffRole==='Headmaster'){update('inchargeDelegations',(items=[])=>items.map((entry)=>entry.leaveId===item.id?{...entry,status:'Revoked',revokedBy:roleConfig[role].name}:entry),{action:'UPDATE',record:`Delegation ${item.id}`,detail:'Temporary Headmaster delegation revoked'});}
    notify(dualApproval?'Completed leave revoked after both approvals':'Leave revoked; date-specific routine adjustments removed');
  };
  const revoke=(item)=>{
    if(item.staffRole==='Headmaster'&&!isAdmin){notify('Only Admin can revoke an approved Headmaster leave');return;}
    if(dmyTime(item.to)<today){setProtectedLeaveAction({action:'request',leaveId:item.id,name:item.name});setProtectedLeaveReason('');return;}
    finalizeLeaveRevocation(item);
  };
  const openLeaveRejection=(item)=>{setProtectedLeaveAction({action:'reject',leaveId:item.id,name:item.name});setProtectedLeaveReason('');};
  const submitProtectedLeaveAction=()=>{const reason=protectedLeaveReason.trim();const item=rows.find((row)=>row.id===protectedLeaveAction?.leaveId);if(!item||!reason)return notify('Reason is required');if(protectedLeaveAction.action==='request'){const request={requestedBy:roleConfig[role].name,requestedRole:role,requestedAt:'20-09-2026 10:15 PM',reason,approvals:{admin:role==='admin',headmaster:role==='headmaster'}};update('leaves',(items)=>items.map((row)=>row.id===item.id?{...row,cancellationRequest:request}:row),{action:'REQUEST',record:`Leave ${item.id}`,detail:`Completed leave cancellation requested by ${roleConfig[role].name}; ${role} approval recorded. Reason: ${reason}`});notify(`Cancellation request recorded; ${role==='admin'?'Headmaster':'Admin'} decision is pending`);}else{update('leaves',(items)=>items.map((row)=>row.id===item.id?{...row,cancellationRequest:null,lastCancellationDecision:{status:'Rejected',rejectedBy:roleConfig[role].name,rejectedRole:role,rejectedAt:'20-09-2026 10:18 PM',reason}}:row),{action:'REJECT',record:`Leave ${item.id}`,detail:`Completed leave cancellation rejected by ${roleConfig[role].name} (${role}). Reason: ${reason}`});notify('Leave cancellation rejected; the approved leave remains unchanged');}setProtectedLeaveAction(null);setProtectedLeaveReason('');};
  const approvePastCancellation=(item)=>{const approvals={admin:false,headmaster:false,...item.cancellationRequest?.approvals,[role]:true};update('leaves',(items)=>items.map((row)=>row.id===item.id?{...row,cancellationRequest:{...row.cancellationRequest,approvals}}:row),{action:'APPROVE',record:`Leave ${item.id}`,detail:`Completed leave cancellation approved by ${roleConfig[role].name} (${role})`});if(approvals.admin&&approvals.headmaster)finalizeLeaveRevocation(item,true);};
  const submit=(event)=>{
    event.preventDefault();
    if(!/^\d{2}-\d{2}-\d{4}$/.test(form.from)||!/^\d{2}-\d{2}-\d{4}$/.test(form.to)||dmyTime(form.from)>dmyTime(form.to)){notify('Enter a valid From and To date in DD-MM-YYYY format');return;}
    if(form.leaveType==='Special leave (SL)'){
      const requestedDays=daysInclusive(form.from,form.to);
      if(applicant.gender!=='Female'){notify('Special Leave is available only for female staff');return;}
      if(String(form.from).slice(3)!==String(form.to).slice(3)||requestedDays<1||requestedDays>2){notify('Special Leave must be within one month and cannot exceed 2 consecutive days');return;}
      if(specialUsed+requestedDays>2){notify(`${applicant.name} has already used ${specialUsed} Special Leave day(s) in ${specialMonth}`);return;}
    }
    const incharge=teachers.find((item)=>item.id===form.inchargeId);
    if(isHeadmasterLeave&&!incharge){notify('Select a temporary In-charge Headmaster');return;}
    const id=Math.max(0,...data.leaves.map((item)=>Number(item.id)||0))+1;
    const directEntry=canManage;
    const item={id,staffId:applicant.id,name:applicant.name,gender:applicant.gender,role:`${applicant.role} · ${applicant.subject}`,from:form.from,to:form.to,dates:form.from===form.to?form.from:`${form.from} to ${form.to}`,leaveType:form.leaveType,reason:form.reason,status:directEntry||isHeadmasterLeave?'Approved':'Pending',directEntry,autoApproved:isHeadmasterLeave,inchargeId:incharge?.id||'',inchargeName:incharge?.name||'',approvedBy:directEntry?roleConfig[role].name:isHeadmasterLeave?'System rule · Headmaster leave':'',approvedAt:directEntry||isHeadmasterLeave?'17-09-2026 12:00 PM':''};
    update('leaves',(items)=>[item,...items],{action:'INSERT',record:`Leave ${id}`,detail:isHeadmasterLeave?`Headmaster leave recorded; ${incharge.name} delegated as In-charge`:directEntry?`${applicant.name} leave entered directly by ${roleConfig[role].name}`:`${applicant.name} leave request submitted`});
    if(isHeadmasterLeave){update('inchargeDelegations',(items=[])=>[{id:`DEL-${id}`,leaveId:id,staffId:incharge.id,name:incharge.name,from:form.from,to:form.to,status:'Scheduled',appointedBy:applicant.name,actingRole:'Headmaster (In-charge)'},...items],{action:'INSERT',record:`DEL-${id}`,detail:`${incharge.name} appointed temporary In-charge Headmaster`});}
    setModal(false);setForm({...form,reason:'',inchargeId:''});notify(isHeadmasterLeave?'Leave recorded and In-charge Headmaster scheduled':directEntry?'Approved leave entered directly; affected routine will be flagged':'Leave request submitted for approval');
  };
  const actionButtons=<div className="leave-title-actions">{canManage&&<button className="btn btn-primary" onClick={()=>{setForm({...form,staffId:'EMP-014',leaveType:'Casual leave'});setModal(true);}}>+ Direct leave entry</button>}{!canManage&&<button className="btn btn-primary" onClick={()=>setModal(true)}>+ Apply for leave</button>}</div>;
  return <>{protectedLeaveAction&&<Modal title={protectedLeaveAction.action==='request'?'Request completed-leave cancellation':'Reject leave-cancellation request'} onClose={()=>{setProtectedLeaveAction(null);setProtectedLeaveReason('');}} footer={<><button className="btn btn-secondary" onClick={()=>{setProtectedLeaveAction(null);setProtectedLeaveReason('');}}>Cancel</button><button className="btn btn-primary danger" disabled={!protectedLeaveReason.trim()} onClick={submitProtectedLeaveAction}>{protectedLeaveAction.action==='request'?'Submit request':'Confirm rejection'}</button></>}><div className="modal-form"><div className="warning-banner"><span>!</span><div><strong>{protectedLeaveAction.name}</strong><p>{protectedLeaveAction.action==='request'?'A completed leave can be cancelled only after the other role approves.':'Rejecting keeps the approved leave unchanged.'} The decision will be recorded in Audit Log.</p></div></div><label>{protectedLeaveAction.action==='request'?'Reason for cancellation':'Reason for rejection'}<textarea value={protectedLeaveReason} onChange={(event)=>setProtectedLeaveReason(event.target.value)} required/></label></div></Modal>}<PageTitle title={canManage?'Leave management & delegation':'My leave requests'} body={canManage?'Enter approved leave directly or decide Teacher requests. Substitute duties are assigned separately in Daily rescheduling.':'Apply online and track the decision. Teachers cannot cancel an approved leave themselves.'} actions={actionButtons}/>
    <div className="metrics three"><Metric label="Pending requests" value={data.leaves.filter((item)=>item.status==='Pending').length} detail="Awaiting decision" tone="amber" icon="calendar"/><Metric label="Approved today" value={rows.filter((item)=>item.status==='Approved'&&dmyTime(ATTENDANCE_TODAY)>=dmyTime(item.from)&&dmyTime(ATTENDANCE_TODAY)<=dmyTime(item.to)).length} detail="Daily routine will flag periods" tone="green" icon="check"/><Metric label="Special Leave used" value={`${specialUsed}/2`} detail={`${applicant?.name||'Selected staff'} · ${specialMonth}`} tone="blue" icon="users"/></div>
    {canManage&&<div className="filter-tabs leave-workspace-tabs">{[['requests','Leave records'],['special','Special Leave register'],['delegations','In-charge Headmaster']].map(([key,label])=><button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}>{label}{key==='requests'&&data.leaves.some((item)=>item.status==='Pending')&&<b>{data.leaves.filter((item)=>item.status==='Pending').length}</b>}</button>)}</div>}
    {(!canManage||tab==='requests')&&<><div className="security-banner leave-rule-banner"><Icon name="check"/><div><strong>Leave approval and daily routine are separate</strong><p>Admin or Headmaster may enter an approved leave directly. Approving a request does not choose a substitute; affected periods appear red on that date under Routine → Daily rescheduling. A completed leave can be cancelled only after separate Admin and Headmaster decisions.</p></div></div><div className="table-card leave-table"><table><thead><tr><th>Staff member</th><th>Leave period</th><th>Type & reason</th><th>Entry source</th><th>Status</th>{canManage&&<th>Decision</th>}</tr></thead><tbody>{rows.map((item)=>{const canRevoke=item.status==='Approved'&&dmyTime(item.to)>=today&&(item.staffRole!=='Headmaster'||isAdmin);const pastApproved=item.status==='Approved'&&dmyTime(item.to)<today;const cancellation=item.cancellationRequest;return <tr key={item.id}><td><strong>{item.name}</strong><small className="block">{item.staffRole} · {item.staffId||'Staff record'} · {item.gender||staff.find((member)=>member.id===item.staffId)?.gender||'Gender not set'}</small></td><td><div className="leave-date-stack"><strong>{item.from||item.dates}</strong>{item.to&&item.to!==item.from&&<span>to {item.to}</span>}</div></td><td><strong>{item.leaveType}</strong><small className="block">{item.reason}</small></td><td><strong>{item.inchargeName?item.inchargeName:item.directEntry?'Direct entry':'Teacher application'}</strong><small className="block">{item.inchargeName?'Temporary In-charge':item.directEntry?`Entered by ${item.approvedBy||'authorised user'}`:'Approval required'}</small></td><td><Status>{item.status}</Status>{item.autoApproved&&<small className="block">Headmaster leave rule</small>}{cancellation&&<small className="block approval-status">Cancel: Admin {cancellation.approvals?.admin?'✓':'pending'} · Headmaster {cancellation.approvals?.headmaster?'✓':'pending'}</small>}</td>{canManage&&<td>{item.status==='Pending'?<div className="inline-actions"><button onClick={()=>reject(item)}>Reject</button><button className="approve" onClick={()=>approve(item)}>Approve</button></div>:canRevoke?<button className="table-action danger-action" onClick={()=>revoke(item)}>Revoke leave</button>:pastApproved&&cancellation?(cancellation.approvals?.[role]?<span className="muted">Waiting for {role==='admin'?'Headmaster':'Admin'}</span>:<div className="inline-actions"><button onClick={()=>openLeaveRejection(item)}>Reject</button><button className="approve" onClick={()=>approvePastCancellation(item)}>Approve</button></div>):pastApproved&&(item.staffRole!=='Headmaster'||isAdmin)?<button className="table-action danger-action" onClick={()=>revoke(item)}>Request cancellation</button>:<span className="muted">{item.status==='Approved'&&item.staffRole==='Headmaster'&&!isAdmin?'Admin control only':'Decision recorded'}</span>}</td>}</tr>;})}</tbody></table></div></>}
    {canManage&&tab==='special'&&<div className="table-card"><table><thead><tr><th>Female staff</th><th>Month</th><th>Special Leave dates</th><th>Days used</th><th>Status</th></tr></thead><tbody>{rows.filter((item)=>item.leaveType==='Special leave (SL)').map((item)=><tr key={item.id}><td><strong>{item.name}</strong><small className="block">{item.staffId}</small></td><td>{String(item.from).slice(3)}</td><td>{item.from}{item.to!==item.from?` to ${item.to}`:''}</td><td><strong>{daysInclusive(item.from,item.to)} / 2</strong></td><td><Status>{item.status}</Status></td></tr>)}</tbody></table>{!rows.some((item)=>item.leaveType==='Special leave (SL)')&&<div className="empty-state">No Special Leave has been recorded. This leave type is available only to female staff, for a maximum of 2 consecutive days per month.</div>}</div>}
    {canManage&&tab==='delegations'&&<div className="delegation-list">{delegations.map((item)=><article className="content-card delegation-card" key={item.id}><span className="delegation-icon"><Icon name="teacher"/></span><div><span className="eyebrow">Temporary school leadership</span><h3>{item.name}</h3><p>{item.actingRole} · {item.from} to {item.to}</p><small>Appointed by {item.appointedBy}. Access expires automatically after the end date.</small></div><Status>{item.state}</Status>{isAdmin&&item.state!=='Expired'&&item.state!=='Revoked'&&<button className="btn btn-secondary" onClick={()=>{const leave=rows.find((row)=>row.id===item.leaveId);if(leave)revoke(leave);}}>Revoke delegation</button>}</article>)}{!delegations.length&&<div className="content-card empty-state">No Headmaster delegation is scheduled. Recording Headmaster leave requires an In-charge selection.</div>}</div>}
    {modal&&<Modal title={canManage?'Direct approved leave entry':'Apply for leave'} onClose={()=>setModal(false)} footer={<><button className="btn btn-secondary" onClick={()=>setModal(false)}>Cancel</button><button className="btn btn-primary" type="submit" form="leave-form">{isHeadmasterLeave?'Record & delegate':canManage?'Record approved leave':'Submit request'}</button></>}><form id="leave-form" className="modal-form" onSubmit={submit}>{canManage?<><div className="record-lock-note"><Icon name="check"/><div><strong>No application required</strong><span>This leave will be saved directly as Approved by {roleConfig[role].name}. Substitute duty will be handled later in Daily rescheduling.</span></div></div><label>Staff member<select value={form.staffId} onChange={(event)=>setApplicant(event.target.value)}>{staff.map((item)=><option value={item.id} key={item.id}>{item.name} · {item.role} · {item.gender||'Gender not set'}</option>)}</select></label></>:<div className="record-lock-note"><Icon name="user"/><div><strong>Neha Kumari · EMP-014</strong><span>Science Teacher · Female</span></div></div>}<div className="form-row"><label>From (DD-MM-YYYY)<input value={form.from} onChange={(event)=>setForm({...form,from:event.target.value})} placeholder="DD-MM-YYYY" pattern="\d{2}-\d{2}-\d{4}" required/></label><label>To (DD-MM-YYYY)<input value={form.to} onChange={(event)=>setForm({...form,to:event.target.value})} placeholder="DD-MM-YYYY" pattern="\d{2}-\d{2}-\d{4}" required/></label></div><label>Leave type<select value={form.leaveType} onChange={(event)=>setForm({...form,leaveType:event.target.value})}><option>Casual leave</option><option>Medical leave</option><option>Earned leave</option>{applicant?.gender==='Female'&&<option>Special leave (SL)</option>}</select></label>{applicant?.gender==='Female'&&<div className="special-leave-note"><strong>Special Leave: {specialUsed}/2 days used in {specialMonth}</strong><span>Female staff only · maximum 2 consecutive days in one month.</span></div>}<label>Reason<textarea value={form.reason} onChange={(event)=>setForm({...form,reason:event.target.value})} required/></label>{isHeadmasterLeave&&<><label>Temporary In-charge Headmaster<select value={form.inchargeId} onChange={(event)=>setForm({...form,inchargeId:event.target.value})} required><option value="">Select eligible teacher</option>{teachers.map((teacher)=><option value={teacher.id} key={teacher.id}>{teacher.name} · {teacher.designation}</option>)}</select></label><div className="record-lock-note"><Icon name="check"/><div><strong>Headmaster leave requires delegation</strong><span>The selected In-charge receives temporary operational responsibility only for this leave period. Only Admin can revoke it.</span></div></div></>}</form></Modal>}</>;
}

function AllPaperMarksModal({role,data,update,notify,onClose}) {
  const classOptions=[...new Set(data.students.map((student)=>student.className))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  const [className,setClassName]=useState(classOptions[0]||'9-A');
  const matchingExams=(data.exams||[]).filter((exam)=>exam.mode==='Offline'&&examClassNumber(exam.classes)===examClassNumber(className)&&String(exam.classes).split('-').pop()===String(className).split('-').pop());
  const availableExams=matchingExams.filter((exam)=>exam.status==='Active'||exam.status==='Completed');
  const examOptions=availableExams.length?availableExams:matchingExams;
  const [examId,setExamId]=useState(examOptions[0]?.id||'');
  const activeExam=(data.exams||[]).find((exam)=>String(exam.id)===String(examId))||examOptions[0];
  const classStudents=data.students.filter((student)=>student.className===className).sort((a,b)=>Number(a.roll)-Number(b.roll));
  const paperOptions=[...new Map(classStudents.flatMap((student)=>student.subjectSelections?.length?student.subjectSelections:defaultStudentSubjects(student)).map((subject)=>[subjectOptionKey(subject),subject])).values()];
  const [paperKey,setPaperKey]=useState(subjectOptionKey(paperOptions[0]||{}));
  const activePaper=paperOptions.find((paper)=>subjectOptionKey(paper)===paperKey)||paperOptions[0];
  const studentsForPaper=activePaper?classStudents.filter((student)=>(student.subjectSelections?.length?student.subjectSelections:defaultStudentSubjects(student)).some((subject)=>subjectOptionKey(subject)===subjectOptionKey(activePaper))):[];
  const savedSetting=activePaper?(data.subjectSettings||[]).find((item)=>item.classNumber===String(examClassNumber(className))&&item.stream===examStream(className)&&item.subject===activePaper.name&&item.group===activePaper.group&&String(item.code||'')===String(activePaper.code||'')):null;
  const paperFormat=examClassNumber(className)>=11?(savedSetting?.paperFormat||defaultIntermediatePaperFormat(activePaper?.name)):'Auto';
  const rule=activePaper?getExamSubjectRule({classes:className,examType:activeExam?.examType||activeExam?.name,subject:activePaper.name,subjectGroup:activePaper.group,paperFormat}):null;
  const savedMarks=activeExam&&activePaper?(activeExam.allPaperMarks?.[subjectOptionKey(activePaper)]||(activeExam.subject===activePaper.name?activeExam.marks:{})):{};
  const [marks,setMarks]=useState({});
  const [loadedKey,setLoadedKey]=useState('');
  const contextKey=`${activeExam?.id||''}|${className}|${paperKey}`;
  if(contextKey!==loadedKey){
    const next=Object.fromEntries(studentsForPaper.map((student)=>{const mark=normalizeMark(savedMarks?.[student.id],rule);return [student.id,{theory:mark.theory??'',component:mark.component??''}];}));
    setMarks(next);setLoadedKey(contextKey);
  }
  const changeClass=(next)=>{setClassName(next);const exams=(data.exams||[]).filter((exam)=>exam.mode==='Offline'&&examClassNumber(exam.classes)===examClassNumber(next)&&String(exam.classes).split('-').pop()===String(next).split('-').pop());setExamId((exams.find((exam)=>exam.status==='Active'||exam.status==='Completed')||exams[0])?.id||'');const firstStudent=data.students.find((student)=>student.className===next);const firstPaper=(firstStudent?.subjectSelections?.length?firstStudent.subjectSelections:defaultStudentSubjects(firstStudent||{className:next}))[0];setPaperKey(subjectOptionKey(firstPaper||{}));setLoadedKey('');};
  const changeExam=(next)=>{setExamId(next);setLoadedKey('');};
  const changePaper=(next)=>{setPaperKey(next);setLoadedKey('');};
  const persist=(status)=>{
    if(!activeExam||!activePaper||!rule){notify('Select an announced examination and paper');return;}
    if(activeExam.status==='Scheduled'){notify('Announce this examination before marks entry');return;}
    const saved=Object.fromEntries(studentsForPaper.map((student)=>{const draft=marks[student.id]||{};const theory=draft.theory===''?null:Number(draft.theory);const component=rule.componentMax?(draft.component===''?null:Number(draft.component)):null;return [student.id,rule.componentMax?{theory,component,total:(theory??0)+(component??0)}:theory];}));
    update('exams',(items)=>items.map((exam)=>exam.id===activeExam.id?{...exam,allPaperMarks:{...(exam.allPaperMarks||{}),[subjectOptionKey(activePaper)]:saved},paperStatuses:{...(exam.paperStatuses||{}),[subjectOptionKey(activePaper)]:status},lastMarksEntryBy:roleConfig[role].name}:exam),{action:'UPDATE',record:activeExam.name,detail:`${activePaper.name} ${status.toLowerCase()} for ${className}`});
    notify(`${activePaper.name} marks ${status==='Submitted'?'submitted':'saved as draft'}`);
  };
  const uploadCsv=async(event)=>{const file=event.target.files?.[0];if(!file||!rule)return;const rows=(await file.text()).split(/\r?\n/).filter(Boolean).slice(1);const next={...marks};let count=0;rows.forEach((line)=>{const [studentId,theoryValue,componentValue='']=line.split(',').map((value)=>value.trim());if(!studentsForPaper.some((student)=>student.id===studentId))return;const theory=Number(theoryValue);const component=Number(componentValue||0);if(theoryValue!==''&&!Number.isNaN(theory)&&theory<=rule.theoryMax&&(!rule.componentMax||component<=rule.componentMax)){next[studentId]={theory:String(theory),component:rule.componentMax?String(component):''};count+=1;}});setMarks(next);event.target.value='';notify(`${count} ${activePaper.name} rows loaded from CSV`);};
  const submittedCount=activeExam?Object.values(activeExam.paperStatuses||{}).filter((status)=>status==='Submitted').length:0;
  const isReadOnly=Boolean(activeExam?.deletionRequest)||['Published','Correction approval'].includes(activeExam?.resultStatus);
  return <Modal title="All papers marks entry" onClose={onClose} footer={<><button className="btn btn-secondary" onClick={onClose}>Close</button><button className="btn btn-secondary" disabled={isReadOnly||!studentsForPaper.length} onClick={()=>persist('Draft')}>Save paper draft</button><button className="btn btn-primary" disabled={isReadOnly||!studentsForPaper.length} onClick={()=>persist('Submitted')}>{role==='admin'?'Mark paper complete':'Submit paper to Admin'}</button></>}>
    <div className="all-paper-controls"><label>Class / stream / section<select value={className} onChange={(event)=>changeClass(event.target.value)}>{classOptions.map((item)=><option key={item}>{item}</option>)}</select></label><label>Examination<select value={activeExam?.id||''} onChange={(event)=>changeExam(event.target.value)}>{examOptions.map((exam)=><option value={exam.id} key={exam.id}>{exam.name} · {exam.status}</option>)}</select></label><label>Paper<select value={activePaper?subjectOptionKey(activePaper):''} onChange={(event)=>changePaper(event.target.value)}>{paperOptions.map((paper)=><option value={subjectOptionKey(paper)} key={subjectOptionKey(paper)}>{paper.name}{paper.code?` (${paper.code})`:''} · {paper.group}</option>)}</select></label></div>
    {!activeExam?<div className="empty-state">No offline examination is available for this class. Admin or Headmaster must create and announce one first.</div>:!activePaper?<div className="empty-state">No subjects are tagged for students in this class.</div>:<>
      <div className="marks-assignment"><div><span className="eyebrow">All-paper workflow</span><h4>{activePaper.name}{activePaper.code?` · ${activePaper.code}`:''}</h4><p>{activeExam.name} · Class {className} · {paperFormat}</p></div><div className="paper-progress"><strong>{submittedCount}/{paperOptions.length}</strong><span>papers submitted</span></div></div>
      <div className="marks-rule-banner"><strong>{rule.ruleLabel}</strong><span>{studentsForPaper.length} tagged students · only students who selected this paper are listed.</span></div>
      <div className="all-paper-toolbar"><span>Entered by {roleConfig[role].name}</span><label className="table-action file-button">Load current paper CSV<input type="file" accept=".csv,text/csv" disabled={isReadOnly} onChange={uploadCsv}/></label></div>
      <div className={`marks-entry-head ${rule.componentMax?'marks-entry-split':''}`}><span>Student</span><span>Roll</span>{rule.componentMax?<><span>Theory / {rule.theoryMax}</span><span>{rule.componentLabel} / {rule.componentMax}</span><span>Total</span></>:<span>Marks / {rule.fullMarks}</span>}</div>
      {isReadOnly&&<p role="status">Marks are locked. Resolve pending approvals before editing.</p>}{!studentsForPaper.length&&<div className="empty-state" role="status">No eligible students for this section and paper. Check student subject selections and academic-year progression.</div>}{studentsForPaper.map((student)=>{const draft=marks[student.id]||{theory:'',component:''};const total=(Number(draft.theory)||0)+(Number(draft.component)||0);return <div className={`marks-entry-row ${rule.componentMax?'marks-entry-split':''}`} key={student.id}><div className="person-cell"><i>{student.name.split(' ').map((part)=>part[0]).slice(0,2).join('')}</i><div><strong>{student.name}</strong><small>{student.id}</small></div></div><b>{student.roll}</b><input type="number" min="0" max={rule.theoryMax} disabled={isReadOnly} value={draft.theory} onChange={(event)=>setMarks({...marks,[student.id]:{...draft,theory:event.target.value}})}/>{rule.componentMax&&<><input type="number" min="0" max={rule.componentMax} disabled={isReadOnly} value={draft.component} onChange={(event)=>setMarks({...marks,[student.id]:{...draft,component:event.target.value}})}/><strong>{total}/{rule.fullMarks}</strong></>}</div>;})}
    </>}
  </Modal>;
}
void AllPaperMarksModal;

const activeSessionStudents = (students=[]) => students.filter((student)=>student.visibleInSession!==false&&student.status!=='Passed out');
const examPaperKey = (className,subject) => `${className}::${subjectOptionKey(subject)}`;
const studentPapers = (student) => student.subjectSelections?.length?student.subjectSelections:defaultStudentSubjects(student);

function OfficeStudentMarksWorkspace({role,data,update,notify,onClose,className,classOptions,changeClass,activeExam,matchingExams,changeExam,classStudents,allPapers,isReadOnly,announceAndOpen,uploadAll,exportExcel,exportPdf}) {
  const [studentId,setStudentId]=useState(classStudents[0]?.id||'');
  const selectedStudent=classStudents.find((student)=>student.id===studentId)||classStudents[0];
  const selectedPapers=selectedStudent?studentPapers(selectedStudent):[];
  const [studentMarks,setStudentMarks]=useState({});
  const [loadedKey,setLoadedKey]=useState('');
  const contextKey=`${activeExam?.id||''}|${className}|${selectedStudent?.id||''}`;
  const paperDetails=(paper)=>{
    const setting=(data.subjectSettings||[]).find((item)=>item.classNumber===String(examClassNumber(className))&&item.stream===examStream(className)&&sameSubject(item.subject,paper.name)&&item.group===paper.group&&String(item.code||'')===String(paper.code||''));
    const paperFormat=examClassNumber(className)>=11?(setting?.paperFormat||defaultIntermediatePaperFormat(paper.name)):'Auto';
    const rule=getExamSubjectRule({classes:className,examType:activeExam?.examType||activeExam?.name,subject:paper.name,subjectGroup:paper.group,paperFormat});
    return {paperFormat,rule};
  };
  if(contextKey!==loadedKey){
    const next=Object.fromEntries(selectedPapers.map((paper)=>{
      const key=examPaperKey(className,paper);
      const raw=activeExam?.allPaperMarks?.[key]?.[selectedStudent?.id]??activeExam?.allPaperMarks?.[subjectOptionKey(paper)]?.[selectedStudent?.id];
      const mark=normalizeMark(raw);
      return [subjectOptionKey(paper),{theory:mark.theory??'',component:mark.component??''}];
    }));
    setStudentMarks(next);setStudentId(selectedStudent?.id||'');setLoadedKey(contextKey);
  }
  const selectStudent=(next)=>{setStudentId(next);setLoadedKey('');};
  const subjectComplete=(paper)=>{const draft=studentMarks[subjectOptionKey(paper)]||{};const {rule}=paperDetails(paper);return draft.theory!==''&&draft.theory!==null&&draft.theory!==undefined&&(!rule.componentMax||(draft.component!==''&&draft.component!==null&&draft.component!==undefined));};
  const completedSubjects=selectedPapers.filter(subjectComplete).length;
  const persistStudent=(status)=>{
    if(!activeExam||!selectedStudent)return notify('Select an announced examination and student');
    if(isReadOnly)return notify(activeExam.status==='Scheduled'?'Announce this examination before marks entry':'Marks entry is locked for this examination');
    for(const paper of selectedPapers){
      const {rule}=paperDetails(paper);
      const error=validateMarks([selectedStudent],{[selectedStudent.id]:studentMarks[subjectOptionKey(paper)]||{}},rule,status==='Submitted');
      if(error)return notify(`${paper.name}: ${error}`);
    }
    update('exams',(items)=>items.map((exam)=>{
      if(exam.id!==activeExam.id)return exam;
      const nextAll={...(exam.allPaperMarks||{})};
      selectedPapers.forEach((paper)=>{
        const key=examPaperKey(className,paper);
        const {rule}=paperDetails(paper);
        const draft=studentMarks[subjectOptionKey(paper)]||{};
        const theory=draft.theory===''?null:Number(draft.theory);
        const component=rule.componentMax?(draft.component===''?null:Number(draft.component)):null;
        nextAll[key]={...(nextAll[key]||{}),[selectedStudent.id]:rule.componentMax?{theory,component,total:(theory??0)+(component??0)}:theory};
      });
      const statuses={...(exam.paperStatuses||{})};
      selectedPapers.forEach((paper)=>{
        const key=examPaperKey(className,paper);
        const {rule}=paperDetails(paper);
        const eligible=classStudents.filter((student)=>studentPapers(student).some((subject)=>subjectOptionKey(subject)===subjectOptionKey(paper)));
        const complete=eligible.length>0&&eligible.every((student)=>{const mark=normalizeMark(nextAll[key]?.[student.id]);return mark.theory!==null&&(!rule.componentMax||mark.component!==null);});
        statuses[key]=complete?'Submitted':'Draft';
      });
      const required=(exam.papers||allPapers.map((paper)=>({...paper,key:examPaperKey(className,paper)}))).map((paper)=>paper.key);
      const batchComplete=required.length>0&&required.every((key)=>statuses[key]==='Submitted');
      const entryKey=`${className}::${selectedStudent.id}`;
      return {...exam,allPaperMarks:nextAll,paperStatuses:statuses,studentEntryStatuses:{...(exam.studentEntryStatuses||{}),[entryKey]:status},resultStatus:batchComplete?'Submitted':'Draft',lastMarksEntryBy:roleConfig[role].name};
    }),{action:'UPDATE',record:activeExam.name,detail:`${selectedStudent.name}: ${selectedPapers.length} subjects ${status.toLowerCase()} together by ${roleConfig[role].name}`});
    notify(status==='Submitted'?`${selectedStudent.name} के सभी ${selectedPapers.length} subjects एक साथ submit हो गए`:`${selectedStudent.name} के सभी subjects draft में save हो गए`);
  };
  const studentStatus=activeExam?.studentEntryStatuses?.[`${className}::${selectedStudent?.id}`]||'Not submitted';
  return <Modal title="Student-wise all-subject marks entry" onClose={onClose} footer={<><button className="btn btn-secondary" onClick={onClose}>Close</button>{!isReadOnly&&selectedStudent&&selectedPapers.length>0&&<><button className="btn btn-secondary" onClick={()=>persistStudent('Draft')}>Save student draft</button><button className="btn btn-primary" onClick={()=>persistStudent('Submitted')}>Submit all subjects</button></>}</>}>
    <div className="all-paper-controls student-marks-controls"><label>Class / stream / section<select value={className} onChange={(event)=>changeClass(event.target.value)}>{classOptions.map((item)=><option key={item}>{item}</option>)}</select></label><label>Examination<select value={activeExam?.id||''} onChange={(event)=>changeExam(event.target.value)}>{matchingExams.map((exam)=><option value={exam.id} key={exam.id}>{exam.name} · {exam.status}</option>)}</select></label><label>Student<select value={selectedStudent?.id||''} onChange={(event)=>selectStudent(event.target.value)}>{classStudents.map((student)=><option value={student.id} key={student.id}>{student.roll} · {student.name}</option>)}</select></label></div>
    {!activeExam?<div className="empty-state">No examination is available for this class.</div>:!selectedStudent?<div className="empty-state">No active student is available in this class and section.</div>:<>
      <div className="marks-assignment student-entry-summary"><div><span className="eyebrow">Student-wise entry</span><h4>{selectedStudent.name}</h4><p>{selectedStudent.id} · Class {selectedStudent.className} · Roll {selectedStudent.roll}</p></div><div className="paper-progress"><strong>{completedSubjects}/{selectedPapers.length}</strong><span>subjects entered · {studentStatus}</span></div></div>
      {activeExam.status==='Scheduled'&&['admin','headmaster'].includes(role)&&<div className="record-lock-note"><Icon name="exam"/><div><strong>This exam is not announced yet</strong><span>Announce it now to enable all-subject entry for office users and allotted-paper entry for Teachers.</span></div><button className="btn btn-primary" onClick={announceAndOpen}>Announce & open marks entry</button></div>}
      <div className="all-paper-toolbar"><span>All tagged subjects of one student are saved together.</span><div className="exam-row-actions"><label className="table-action file-button">Bulk all-subject CSV<input type="file" accept=".csv,text/csv" disabled={isReadOnly} onChange={uploadAll}/></label><button className="table-action" onClick={exportExcel}>Export Excel</button><button className="table-action" onClick={exportPdf}>Export PDF</button></div></div>
      <div className="student-subject-marks-table"><div className="student-subject-marks-head"><span>Subject</span><span>Paper rule</span><span>Theory / Marks</span><span>Practical / Internal</span><span>Total</span></div>{selectedPapers.map((paper)=>{const key=subjectOptionKey(paper);const draft=studentMarks[key]||{theory:'',component:''};const {paperFormat,rule}=paperDetails(paper);const total=(Number(draft.theory)||0)+(Number(draft.component)||0);return <div className="student-subject-marks-row" key={key}><div><strong>{paper.name}</strong><small>{paper.group}{paper.code?` · ${paper.code}`:''}</small></div><span>{paperFormat==='Auto'?rule.ruleLabel:paperFormat}</span><label><em>{rule.componentMax?`Theory / ${rule.theoryMax}`:`Marks / ${rule.fullMarks}`}</em><input aria-label={`${paper.name} marks for ${selectedStudent.name}`} placeholder="Marks" disabled={isReadOnly} type="number" min="0" max={rule.theoryMax} value={draft.theory} onChange={(event)=>setStudentMarks({...studentMarks,[key]:{...draft,theory:event.target.value}})}/></label><label>{rule.componentMax?<><em>{rule.componentLabel} / {rule.componentMax}</em><input aria-label={`${paper.componentLabel||rule.componentLabel} marks for ${selectedStudent.name}`} placeholder="Marks" disabled={isReadOnly} type="number" min="0" max={rule.componentMax} value={draft.component} onChange={(event)=>setStudentMarks({...studentMarks,[key]:{...draft,component:event.target.value}})}/></>:<span className="not-applicable">Not applicable</span>}</label><strong>{subjectComplete(paper)?`${total}/${rule.fullMarks}`:'—'}</strong></div>;})}</div>
      {isReadOnly&&<p role="status">{activeExam.status==='Scheduled'?(role==='clerk'?'Admin or Headmaster must announce this examination before marks entry.':'Announce this examination to enable marks entry.'):'Marks are locked. Resolve pending approvals before editing.'}</p>}
    </>}
  </Modal>;
}

function BatchMarksWorkspace({role,data,update,notify,onClose,initialExamId=''}) {
  const officeRole=['admin','headmaster','clerk'].includes(role);
  const currentTeacherId='EMP-014';
  const currentStudentId='UHS-260207';
  const activeStudents=activeSessionStudents(data.students);
  const teacherPapers=(data.examAssignments||[]).filter((item)=>item.teacherId===currentTeacherId);
  const teacherClasses=(data.classTeacherAssignments||[]).filter((item)=>item.teacherId===currentTeacherId);
  const configuredClasses=(data.sections||[]).flatMap((item)=>item.sections.map((section)=>`${examClassNumber(item.className)}${item.stream&&item.stream!=='Not applicable'?` ${item.stream}`:''}-${section}`));
  const allowedClassNames=role==='student'
    ? activeStudents.filter((item)=>item.id===currentStudentId).map((item)=>item.className)
    : role==='teacher'
      ? [...new Set([...teacherPapers.map((item)=>classNameForAssignment(item)),...teacherClasses.flatMap((item)=>item.sections.map((section)=>classNameForAssignment(item,section)))])]
      : [...new Set([...configuredClasses,...activeStudents.map((student)=>student.className)])];
  const classOptions=allowedClassNames.filter(Boolean).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  const initialExam=(data.exams||[]).find((exam)=>String(exam.id)===String(initialExamId));
  const initialClass=initialExam?.isBatch
    ? classOptions.find((name)=>examClassNumber(name)===Number(initialExam.classNumber)&&(Number(initialExam.classNumber)<11||examStream(name)===initialExam.stream))
    : classOptions.find((name)=>examClassNumber(name)===examClassNumber(initialExam?.classes))||classOptions[0];
  const [className,setClassName]=useState(initialClass||classOptions[0]||'9-A');
  const examAllowed=(exam,targetClass=className)=>{
    if(exam.mode!=='Offline')return false;
    if(!examMatchesClass(exam,targetClass))return false;
    if(role==='student')return exam.resultStatus==='Published';
    if(role==='teacher'){
      const entry=exam.resultStatus!=='Published'&&exam.status!=='Scheduled'&&teacherPapers.some((assignment)=>assignmentMatchesClass(assignment,targetClass));
      const result=exam.resultStatus==='Published'&&teacherClasses.some((assignment)=>assignmentMatchesClass(assignment,targetClass));
      return entry||result;
    }
    return true;
  };
  const matchingExams=(data.exams||[]).filter((exam)=>examAllowed(exam,className));
  const preferredExam=preferredMarksExam(matchingExams);
  const [examId,setExamId]=useState(initialExam?.id||preferredExam?.id||'');
  const activeExam=matchingExams.find((exam)=>String(exam.id)===String(examId))||preferredExam;
  const classStudents=studentsForExam(activeStudents,{classes:className});
  const resultStudents=resultStudentsForRole(classStudents,role,currentStudentId);
  const configuredPapers=(activeExam?.papers||[]).filter((paper)=>paper.className===className);
  const allPapers=[...new Map([...configuredPapers,...classStudents.flatMap(studentPapers)].map((paper)=>[subjectOptionKey(paper),paper])).values()];
  const paperOptions=role==='teacher'&&activeExam?.resultStatus!=='Published'
    ? allPapers.filter((paper)=>teacherPapers.some((item)=>assignmentMatchesClass(item,className)&&sameSubject(item.subject,paper.name)))
    : allPapers;
  const [paperKey,setPaperKey]=useState(subjectOptionKey(paperOptions[0]||{}));
  const activePaper=paperOptions.find((paper)=>subjectOptionKey(paper)===paperKey)||paperOptions[0];
  const storageKey=activePaper?examPaperKey(className,activePaper):'';
  const studentsForPaper=activePaper?classStudents.filter((student)=>studentPapers(student).some((subject)=>subjectOptionKey(subject)===subjectOptionKey(activePaper))):[];
  const savedSetting=activePaper?(data.subjectSettings||[]).find((item)=>item.classNumber===String(examClassNumber(className))&&item.stream===examStream(className)&&item.subject===activePaper.name&&item.group===activePaper.group&&String(item.code||'')===String(activePaper.code||'')):null;
  const paperFormat=examClassNumber(className)>=11?(savedSetting?.paperFormat||defaultIntermediatePaperFormat(activePaper?.name)):'Auto';
  const rule=activePaper?getExamSubjectRule({classes:className,examType:activeExam?.examType||activeExam?.name,subject:activePaper.name,subjectGroup:activePaper.group,paperFormat}):null;
  const savedMarks=activeExam&&activePaper?(activeExam.allPaperMarks?.[storageKey]||activeExam.allPaperMarks?.[subjectOptionKey(activePaper)]||{}):{};
  const [marks,setMarks]=useState({});
  const [loadedKey,setLoadedKey]=useState('');
  const [selectedStudents,setSelectedStudents]=useState([]);
  const contextKey=`${activeExam?.id||''}|${className}|${paperKey}`;
  if(contextKey!==loadedKey){
    setMarks(Object.fromEntries(studentsForPaper.map((student)=>{const mark=normalizeMark(savedMarks?.[student.id],rule);return[student.id,{theory:mark.theory??'',component:mark.component??''}];})));
    setSelectedStudents(resultStudents.map((student)=>student.id));setLoadedKey(contextKey);
  }
  const changeClass=(next)=>{setClassName(next);const exams=(data.exams||[]).filter((exam)=>examAllowed(exam,next));setExamId(preferredMarksExam(exams)?.id||'');const student=activeStudents.find((item)=>item.className===next);setPaperKey(subjectOptionKey(studentPapers(student||{className:next})[0]||{}));setLoadedKey('');};
  const changeExam=(next)=>{setExamId(next);setLoadedKey('');};
  const changePaper=(next)=>{setPaperKey(next);setLoadedKey('');};
  const isReadOnly=!activeExam||activeExam.status==='Scheduled'||role==='student'||(role==='teacher'&&!data.permissions?.teacherCanEnterMarks)||Boolean(activeExam?.deletionRequest)||activeExam?.resultStatus==='Published'||activeExam?.resultStatus==='Correction approval';
  const announceAndOpen=()=>{
    if(!activeExam||!['admin','headmaster'].includes(role)||activeExam.status!=='Scheduled'||activeExam.deletionRequest)return;
    update('exams',(items)=>items.map((exam)=>exam.id===activeExam.id?{...exam,status:'Active',resultStatus:'Draft'}:exam),{action:'UPDATE',record:activeExam.name,detail:`Examination announced and marks entry opened by ${roleConfig[role].name}`});
    notify(`${activeExam.name} announced; marks entry is now active`);
  };
  const persist=(status)=>{
    if(!activeExam||!activePaper||!rule)return notify('Select an announced examination and paper');
    if(activeExam.status==='Scheduled')return notify('Announce this examination before marks entry');
    if(isReadOnly)return notify('Marks entry is locked for this examination');const error=validateMarks(studentsForPaper,marks,rule,status==='Submitted');if(error)return notify(error);
    const saved=Object.fromEntries(studentsForPaper.map((student)=>{const draft=marks[student.id]||{};const theory=draft.theory===''?null:Number(draft.theory);const component=rule.componentMax?(draft.component===''?null:Number(draft.component)):null;return[student.id,rule.componentMax?{theory,component,total:(theory??0)+(component??0)}:theory];}));
    update('exams',(items)=>items.map((exam)=>{
      if(exam.id!==activeExam.id)return exam;
      const statuses={...(exam.paperStatuses||{}),[storageKey]:status};
      const required=(exam.papers||[]).map((paper)=>paper.key);
      const complete=required.length>0&&required.every((key)=>statuses[key]==='Submitted');
      return {...exam,allPaperMarks:{...(exam.allPaperMarks||{}),[storageKey]:saved},paperStatuses:statuses,resultStatus:complete?'Submitted':exam.resultStatus==='Not started'?'Draft':exam.resultStatus,lastMarksEntryBy:roleConfig[role].name};
    }),{action:'UPDATE',record:activeExam.name,detail:`${activePaper.name} ${status.toLowerCase()} for ${className}`});
    notify(status==='Submitted'?`${activePaper.name} submitted${activeExam.papers?.length?' — batch completion checked':''}`:`${activePaper.name} draft saved`);
  };
  const uploadCurrent=async(event)=>{if(isReadOnly)return notify('Marks entry is locked');const file=event.target.files?.[0];if(!file||!rule)return;const next={...marks};let count=0;(await file.text()).split(/\r?\n/).filter(Boolean).slice(1).forEach((line)=>{const [studentId,theoryValue,componentValue='']=line.split(',').map((value)=>value.trim());if(!studentsForPaper.some((student)=>student.id===studentId))return;const theory=Number(theoryValue);const component=Number(componentValue||0);if(theoryValue!==''&&!Number.isNaN(theory)&&theory<=rule.theoryMax&&(!rule.componentMax||component<=rule.componentMax)){next[studentId]={theory:String(theory),component:rule.componentMax?String(component):''};count+=1;}});setMarks(next);event.target.value='';notify(`${count} rows loaded for ${activePaper.name}`);};
  const uploadAll=async(event)=>{if(isReadOnly)return notify('Marks entry is locked');const file=event.target.files?.[0];if(!file||!activeExam)return;const batchStudents=activeStudents.filter((student)=>examClassNumber(student.className)===examClassNumber(activeExam.classes)&&(examClassNumber(activeExam.classes)<11||examStream(student.className)===activeExam.stream));const nextAll={...(activeExam.allPaperMarks||{})};const touched=new Set();let count=0;(await file.text()).split(/\r?\n/).filter(Boolean).slice(1).forEach((line)=>{const [studentId,subjectName,group='',theoryValue,componentValue='']=line.split(',').map((value)=>value.trim());const student=batchStudents.find((item)=>item.id===studentId);const paper=student&&studentPapers(student).find((item)=>sameSubject(item.name,subjectName)&&(!group||item.group.toLowerCase()===group.toLowerCase()));if(!paper||theoryValue==='')return;const format=(data.subjectSettings||[]).find((item)=>item.classNumber===String(examClassNumber(student.className))&&item.stream===examStream(student.className)&&sameSubject(item.subject,paper.name)&&item.group===paper.group)?.paperFormat||defaultIntermediatePaperFormat(paper.name);const paperRule=getExamSubjectRule({classes:student.className,examType:activeExam.examType,subject:paper.name,subjectGroup:paper.group,paperFormat:format});const theory=Number(theoryValue);const component=Number(componentValue||0);if(Number.isNaN(theory)||theory>paperRule.theoryMax||component>paperRule.componentMax)return;const key=examPaperKey(student.className,paper);nextAll[key]={...(nextAll[key]||{}),[studentId]:paperRule.componentMax?{theory,component,total:theory+component}:theory};touched.add(key);count+=1;});const statuses={...(activeExam.paperStatuses||{})};touched.forEach((key)=>{statuses[key]='Draft';});update('exams',(items)=>items.map((exam)=>exam.id===activeExam.id?{...exam,allPaperMarks:nextAll,paperStatuses:statuses,resultStatus:'Draft',lastMarksEntryBy:roleConfig[role].name}:exam));event.target.value='';setLoadedKey('');notify(`${count} all-section, all-subject marks loaded from CSV`);};
  const resultFor=(student)=>{
    const subjects=studentPapers(student).map((paper)=>{const key=examPaperKey(student.className,paper);const format=(data.subjectSettings||[]).find((item)=>item.classNumber===String(examClassNumber(student.className))&&item.stream===examStream(student.className)&&item.subject===paper.name&&item.group===paper.group)?.paperFormat||defaultIntermediatePaperFormat(paper.name);const paperRule=getExamSubjectRule({classes:student.className,examType:activeExam?.examType,subject:paper.name,subjectGroup:paper.group,paperFormat:format});const mark=activeExam?.allPaperMarks?.[key]?.[student.id]??activeExam?.allPaperMarks?.[subjectOptionKey(paper)]?.[student.id];const outcome=evaluateMark(mark,paperRule);return{subject:`${paper.name}${paper.group&&examClassNumber(student.className)>=11?` (${paper.group})`:''}`,marks:outcome.total,fullMarks:paperRule.fullMarks,counted:!paperRule.excludedFromAggregate,status:outcome.status};});
    const counted=subjects.filter((item)=>item.counted);const total=counted.reduce((sum,item)=>sum+Number(item.marks||0),0);const totalMaximum=counted.reduce((sum,item)=>sum+Number(item.fullMarks||0),0);const pending=counted.some((item)=>item.status==='Pending');const failed=counted.some((item)=>item.status==='Fail');return{exam:activeExam?.name||'Examination',subjects,total,totalMaximum,percentage:pending?'Pending':`${totalMaximum?Math.round(total*100/totalMaximum):0}%`,status:pending?'PENDING':failed?'FAIL':'PASS',sectionRank:'—',rank:'—'};
  };
  const batchPopulation=activeStudents.filter((student)=>activeExam&&examClassNumber(student.className)===examClassNumber(activeExam.classes)&&(examClassNumber(activeExam.classes)<11||examStream(student.className)===activeExam.stream));
  const baseResults=batchPopulation.map((student)=>({student,result:resultFor(student)}));
  const resultWithRanks=(student)=>{const base=baseResults.find((row)=>row.student.id===student.id)?.result||resultFor(student);const sectionRows=baseResults.filter((row)=>row.student.className===student.className).sort((a,b)=>b.result.total-a.result.total);const overallRows=baseResults.filter((row)=>examClassNumber(student.className)>=11?examStream(row.student.className)===examStream(student.className):examClassNumber(row.student.className)===examClassNumber(student.className)).sort((a,b)=>b.result.total-a.result.total);return{...base,sectionRank:Math.max(1,sectionRows.findIndex((row)=>row.student.id===student.id)+1),rank:Math.max(1,overallRows.findIndex((row)=>row.student.id===student.id)+1)};};
  const ranked=[...resultStudents].map((student)=>({student,result:resultWithRanks(student)})).sort((a,b)=>b.result.total-a.result.total);
  const exportRows=()=>{
    const papers=role==='teacher'&&activeExam?.resultStatus!=='Published'?paperOptions:allPapers;
    const summary=role!=='teacher'||activeExam?.resultStatus==='Published';
    return [['Student ID','Student','Class','Section','Roll',...papers.map(paper=>`${paper.name}${paper.group?` (${paper.group})`:''}`),...(summary?['Counted Total','Maximum','Percentage','Result']:[])],...resultStudents.map(student=>{
      const result=resultWithRanks(student);
      return [student.id,student.name,student.className,student.section||'',student.roll,...papers.map(paper=>{
        if(!studentPapers(student).some(item=>subjectOptionKey(item)===subjectOptionKey(paper)))return '';
        const label=`${paper.name}${paper.group&&examClassNumber(student.className)>=11?` (${paper.group})`:''}`;
        const row=result.subjects.find(item=>item.subject===label);
        return row?.status==='Pending'?'':row?.marks??'';
      }),...(summary?[result.total,result.totalMaximum,result.percentage,result.status]:[])];
    })];
  };
  const exportExcel=()=>{const html=`<table>${exportRows().map((row,index)=>`<tr>${row.map((value)=>`<${index?'td':'th'}>${String(value??'')}</${index?'td':'th'}>`).join('')}</tr>`).join('')}</table>`;const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([html],{type:'application/vnd.ms-excel'}));link.download=`${activeExam?.name||'Exam'}-${className}-marks.xls`;link.click();URL.revokeObjectURL(link.href);};
  const exportPdf=()=>{const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});doc.setFontSize(14);doc.text(`${activeExam?.name||'Examination'} — Class ${className}`,14,14);doc.setFontSize(8);doc.text(`Academic Session ${data.academicYear?.current||SESSION} | UDISE+ ${UDISE_CODE}`,14,20);const rows=exportRows();autoTable(doc,{startY:25,head:[rows[0]],body:rows.slice(1),styles:{fontSize:6,cellPadding:1},headStyles:{fillColor:[42,36,102]}});doc.save(`${activeExam?.name||'Exam'}-${className}-marks.pdf`);};
  const downloadCombinedMarksheets=(ids)=>{if(activeExam?.resultStatus!=='Published')return notify('Marksheets are available after publication');const chosen=resultStudents.filter((student)=>ids.includes(student.id));if(!chosen.length)return notify('Select at least one student');const doc=new jsPDF({unit:'mm',format:'a4'});chosen.forEach((student,index)=>{if(index)doc.addPage();const result=resultWithRanks(student);const rankLabel=examClassNumber(student.className)>=11?'Stream Rank':'Class Rank';doc.setDrawColor(42,36,102);doc.setLineWidth(1);doc.rect(10,10,190,270);doc.setTextColor(42,36,102);doc.setFont('helvetica','bold');doc.setFontSize(17);doc.text('UHS PHURHURIYA PARAIYA',105,24,{align:'center'});doc.setFontSize(9);doc.text(`UDISE+ ${UDISE_CODE} | Academic Session ${data.academicYear?.current||SESSION}`,105,32,{align:'center'});doc.setFontSize(13);doc.text(`${activeExam.name} — STATEMENT OF MARKS`,105,45,{align:'center'});autoTable(doc,{startY:53,margin:{left:18,right:18},theme:'plain',styles:{fontSize:8,cellPadding:1.7},body:[['Student',student.name,'Roll',student.roll],["Father's name",student.guardian,"Mother's name",student.mother],['Class / Stream',student.className,'Section',student.section||'—'],['e-ShikshaKosh ID',student.eshiksha||'Not recorded','Result',result.status]]});autoTable(doc,{startY:doc.lastAutoTable.finalY+5,margin:{left:18,right:18},head:[['Subject','Full marks','Marks','Status']],body:result.subjects.map((row)=>[row.subject,row.fullMarks,row.status==='Pending'?'—':row.marks,row.counted?row.status:'Not counted']),styles:{fontSize:8,cellPadding:2},headStyles:{fillColor:[42,36,102]}});const y=doc.lastAutoTable.finalY+8;doc.text(`Counted total: ${result.total}/${result.totalMaximum}    Percentage: ${result.percentage}`,20,y);doc.text(`Section Rank: ${result.sectionRank}    ${rankLabel}: ${result.rank}`,20,y+7);doc.line(25,252,72,252);doc.line(132,252,180,252);doc.setFontSize(8);doc.text('Class Teacher',48,258,{align:'center'});doc.text('Headmaster',156,258,{align:'center'});});doc.save(`${activeExam.name.replaceAll(' ','-')}-${className}-marksheets.pdf`);};
  const submittedCount=activeExam?Object.values(activeExam.paperStatuses||{}).filter((status)=>status==='Submitted').length:0;
  const totalPapers=activeExam?.papers?.length||paperOptions.length;
  const published=activeExam?.resultStatus==='Published';
  if(officeRole&&!published)return <OfficeStudentMarksWorkspace role={role} data={data} update={update} notify={notify} onClose={onClose} className={className} classOptions={classOptions} changeClass={changeClass} activeExam={activeExam} matchingExams={matchingExams} changeExam={changeExam} classStudents={classStudents} allPapers={allPapers} isReadOnly={isReadOnly} announceAndOpen={announceAndOpen} uploadAll={uploadAll} exportExcel={exportExcel} exportPdf={exportPdf}/>;
  return <Modal title={published?'Published result & marksheets':'All papers marks entry'} onClose={onClose} footer={<><button className="btn btn-secondary" onClick={onClose}>Close</button>{!isReadOnly&&activePaper&&studentsForPaper.length>0&&<><button className="btn btn-secondary" onClick={()=>persist('Draft')}>Save paper draft</button><button className="btn btn-primary" onClick={()=>persist('Submitted')}>{role==='admin'?'Mark paper complete':'Submit paper to Admin'}</button></>}{published&&<button className="btn btn-primary" onClick={()=>downloadCombinedMarksheets(selectedStudents)}>{role==='student'?'Download my marksheet':'Download selected marksheets'}</button>}</>}>
    <div className="all-paper-controls"><label>Class / stream / section<select value={className} onChange={(event)=>changeClass(event.target.value)}>{classOptions.map((item)=><option key={item}>{item}</option>)}</select></label><label>Examination<select value={activeExam?.id||''} onChange={(event)=>changeExam(event.target.value)}>{matchingExams.map((exam)=><option value={exam.id} key={exam.id}>{exam.name} · {exam.status}</option>)}</select></label>{!published&&<label>Paper<select value={activePaper?subjectOptionKey(activePaper):''} onChange={(event)=>changePaper(event.target.value)}>{paperOptions.map((paper)=><option value={subjectOptionKey(paper)} key={subjectOptionKey(paper)}>{paper.name}{paper.code?` (${paper.code})`:''} · {paper.group}</option>)}</select></label>}</div>
    {!activeExam?<div className="empty-state">No examination is available for this class and role.</div>:published?<><div className="all-paper-toolbar"><strong>{role==='student'?'My published result':`${resultStudents.length} students · published marks`}</strong><div className="exam-row-actions"><button className="table-action" onClick={exportExcel}>Export Excel</button><button className="table-action" onClick={exportPdf}>Export PDF</button><button className="table-action" onClick={()=>downloadCombinedMarksheets(resultStudents.map((student)=>student.id))}>{role==='student'?'My marksheet PDF':'All marksheets PDF'}</button></div></div><div className="table-card batch-result-table"><table><thead><tr><th><input type="checkbox" checked={selectedStudents.length===resultStudents.length&&resultStudents.length>0} onChange={(event)=>setSelectedStudents(event.target.checked?resultStudents.map((student)=>student.id):[])}/></th><th>Student</th><th>Class / Roll</th><th>Total</th><th>Percentage</th><th>Result</th><th>Rank</th><th></th></tr></thead><tbody>{ranked.filter(({student})=>role!=='student'||student.id===currentStudentId).map(({student,result})=><tr key={student.id}><td><input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={()=>setSelectedStudents((items)=>items.includes(student.id)?items.filter((id)=>id!==student.id):[...items,student.id])}/></td><td><strong>{student.name}</strong><small className="block">{student.id}</small></td><td>{student.className} · {student.roll}</td><td>{result.total}/{result.totalMaximum}</td><td>{result.percentage}</td><td><Status>{result.status}</Status></td><td>{result.sectionRank}</td><td><button className="table-action" onClick={()=>downloadCombinedMarksheets([student.id])}>PDF</button></td></tr>)}</tbody></table></div></>:!activePaper?<div className="empty-state">No allotted paper is available for this role and class.</div>:<><div className="marks-assignment"><div><span className="eyebrow">Class examination batch</span><h4>{activePaper.name}{activePaper.code?` · ${activePaper.code}`:''}</h4><p>{activeExam.name} · Class {className} · {paperFormat}</p></div><div className="paper-progress"><strong>{submittedCount}/{totalPapers}</strong><span>section-papers submitted</span></div></div><div className="marks-rule-banner"><strong>{rule.ruleLabel}</strong><span>{studentsForPaper.length} tagged students · section-wise paper data remains separate.</span></div>{activeExam.status==='Scheduled'&&['admin','headmaster'].includes(role)&&<div className="record-lock-note"><Icon name="exam"/><div><strong>This exam is not announced yet</strong><span>Announce it now to enable marks fields for Admin, Headmaster, Clerk and allotted Teachers.</span></div><button className="btn btn-primary" onClick={announceAndOpen}>Announce & open marks entry</button></div>}<div className="all-paper-toolbar"><span>Entered by {roleConfig[role].name}</span><div className="exam-row-actions"><label className="table-action file-button">Current paper CSV<input type="file" accept=".csv,text/csv" disabled={isReadOnly} onChange={uploadCurrent}/></label>{officeRole&&<label className="table-action file-button">Bulk all-subject CSV<input type="file" accept=".csv,text/csv" disabled={isReadOnly} onChange={uploadAll}/></label>}<button className="table-action" onClick={exportExcel}>Export Excel</button><button className="table-action" onClick={exportPdf}>Export PDF</button></div></div><div className={`marks-entry-head ${rule.componentMax?'marks-entry-split':''}`}><span>Student</span><span>Roll</span>{rule.componentMax?<><span>Theory / {rule.theoryMax}</span><span>{rule.componentLabel} / {rule.componentMax}</span><span>Total</span></>:<span>Marks / {rule.fullMarks}</span>}</div>{isReadOnly&&<p role="status">{activeExam?.status==='Scheduled'?(role==='clerk'||role==='teacher'?'Admin or Headmaster must announce this examination before marks entry.':'Announce this examination to enable marks entry.'):'Marks are locked. Resolve pending approvals before editing.'}</p>}{!studentsForPaper.length&&<div className="empty-state" role="status">No eligible students for this section and paper. Check student subject selections and academic-year progression.</div>}{studentsForPaper.map((student)=>{const draft=marks[student.id]||{theory:'',component:''};const total=(Number(draft.theory)||0)+(Number(draft.component)||0);return <div className={`marks-entry-row ${rule.componentMax?'marks-entry-split':''}`} key={student.id}><div className="person-cell"><i>{student.name.split(' ').map((part)=>part[0]).slice(0,2).join('')}</i><div><strong>{student.name}</strong><small>{student.id}</small></div></div><b>{student.roll}</b><input aria-label={`Theory marks for ${student.name}`} placeholder="Enter marks" disabled={isReadOnly} type="number" min="0" max={rule.theoryMax} value={draft.theory} onChange={(event)=>setMarks({...marks,[student.id]:{...draft,theory:event.target.value}})}/>{rule.componentMax&&<><input aria-label={`${rule.componentLabel} marks for ${student.name}`} placeholder="Marks" disabled={isReadOnly} type="number" min="0" max={rule.componentMax} value={draft.component} onChange={(event)=>setMarks({...marks,[student.id]:{...draft,component:event.target.value}})}/><strong>{total}/{rule.fullMarks}</strong></>}</div>;})}</>}
  </Modal>;
}

function Exams({role,data,update,notify}) {
  const officeRole=['admin','headmaster','clerk'].includes(role);
  const canAnnounce=role==='admin'||role==='headmaster';
  const questionSets={
    Computer:[['The brain of a computer is…',['Monitor','CPU','Keyboard','Printer'],1],['Which is an input device?',['Speaker','Projector','Mouse','Monitor'],2],['1 kilobyte equals…',['100 bytes','512 bytes','1024 bytes','2048 bytes'],2]],
    Science:[['Green plants prepare food through…',['Respiration','Photosynthesis','Transpiration','Germination'],1],['The SI unit of force is…',['Joule','Newton','Watt','Pascal'],1],['Water boils at sea level at…',['50°C','75°C','100°C','120°C'],2]],
  };
  const questionsFor=(exam)=>questionSets[exam?.subject]||questionSets.Computer;
  const [createOpen,setCreateOpen]=useState(false);
  const [panel,setPanel]=useState(null);
  const [selectedId,setSelectedId]=useState(null);
  const [marksDraft,setMarksDraft]=useState({});
  const [quizExamId,setQuizExamId]=useState(null);
  const [answer,setAnswer]=useState({});
  const [rulesTab,setRulesTab]=useState('IX-X');
  const [allPapersOpen,setAllPapersOpen]=useState(false);
  const [workspaceExamId,setWorkspaceExamId]=useState('');
  const [deleteExamId,setDeleteExamId]=useState(null);
  const [deleteReason,setDeleteReason]=useState('');
  const [examDraft,setExamDraft]=useState({classNumber:'9',stream:'Not applicable'});
  const [examStageFilter,setExamStageFilter]=useState('all');
  const selectedExam=data.exams.find((exam)=>exam.id===selectedId);
  const quizExam=data.exams.find((exam)=>exam.id===quizExamId);
  const activeQuestions=questionsFor(quizExam);
  const classStudents=studentsForExam(data.students,selectedExam);
  const permission=data.permissions||INITIAL.permissions;
  const teacherAssignments=data.examAssignments?.filter((item)=>item.teacherId==='EMP-014')||[];
  const classTeacherAssignments=(data.classTeacherAssignments||[]).filter((item)=>item.teacherId==='EMP-014');
  const visibleExams=role==='student'
    ? data.exams.filter((exam)=>{const student=data.students.find(item=>item.id==='UHS-260207');return student&&examMatchesClass(exam,student.className)&&(exam.resultStatus==='Published'||(exam.mode==='Online'&&exam.status==='Published'));})
    : role==='teacher'
      ? data.exams.filter((exam)=>{
        const allotted=teacherAssignments.some((assignment)=>examClassNumber(exam.classes)===examClassNumber(assignment.className)&&(examClassNumber(exam.classes)<11||exam.stream===assignment.stream));
        const classResult=exam.resultStatus==='Published'&&classTeacherAssignments.some((assignment)=>examClassNumber(exam.classes)===examClassNumber(assignment.className)&&(examClassNumber(exam.classes)<11||exam.stream===assignment.stream));
        return exam.status!=='Scheduled'&&(exam.resultStatus==='Published'?classResult:allotted);
      })
      : data.exams;
  const stageForExam=(exam)=>{
    if(exam.resultStatus==='Published'||exam.resultStatus==='Correction approval'||(exam.mode==='Online'&&exam.status==='Published'))return 'published';
    if(exam.resultStatus==='Submitted')return 'ready';
    if(exam.status==='Scheduled')return 'scheduled';
    return 'entry';
  };
  const examProgress=(exam)=>{
    const stage=stageForExam(exam);
    const totalPapers=exam.isBatch?exam.papers?.length||0:1;
    const submittedPapers=exam.isBatch?Object.values(exam.paperStatuses||{}).filter((status)=>status==='Submitted').length:Object.keys(exam.marks||{}).length?1:0;
    const students=activeSessionStudents(data.students).filter((student)=>examMatchesClass(exam,student.className));
    const submittedStudents=exam.isBatch?Object.values(exam.studentEntryStatuses||{}).filter((status)=>status==='Submitted').length:Object.keys(exam.marks||{}).length;
    const percent=stage==='published'||stage==='ready'?100:stage==='scheduled'?0:totalPapers?Math.round(submittedPapers*100/totalPapers):0;
    return {totalPapers,submittedPapers,students:students.length,submittedStudents,percent};
  };
  const stageMeta={
    scheduled:{number:'1',label:'Scheduled',title:'Announce examination',description:'Marks entry is locked until Admin or Headmaster announces it.'},
    entry:{number:'2',label:'Marks entry',title:'Complete student marks',description:'Office users enter all subjects together; Teachers see only allotted papers.'},
    ready:{number:'3',label:'Ready to publish',title:'Review completed marks',description:'All required section-papers are complete. Result can now be published.'},
    published:{number:'4',label:'Published',title:'Result & marksheets',description:'Students and Class Teachers can view and download marksheets.'},
  };
  const officeStageExams=visibleExams.filter((exam)=>exam.mode==='Offline');
  const stageCounts=Object.keys(stageMeta).reduce((counts,key)=>({...counts,[key]:officeStageExams.filter((exam)=>stageForExam(exam)===key).length}),{});
  const filteredOfficeExams=examStageFilter==='all'?officeStageExams:officeStageExams.filter((exam)=>stageForExam(exam)===examStageFilter);
  const setExam=(id,changes,meta)=>update('exams',(items)=>items.map((exam)=>exam.id===id?{...exam,...changes}:exam),meta);
  const gradeFor=(marks,max=100)=>{const percent=max?marks/max*100:0;return percent>=90?'A+':percent>=80?'A':percent>=70?'B+':percent>=60?'B':percent>=45?'C':'D';};
  const selectedRule=selectedExam?getExamSubjectRule(selectedExam):null;
  const selectedMark=(studentId)=>selectedRule?evaluateMark(selectedExam?.marks?.[studentId],selectedRule):{total:0,status:'Pending'};
  const openDetails=(exam)=>{setSelectedId(exam.id);setPanel('details');};
  const closePanel=()=>{setSelectedId(null);setPanel(null);setMarksDraft({});};
  const openMarks=(exam)=>{const rule=getExamSubjectRule(exam);const students=studentsForExam(data.students,exam);setSelectedId(exam.id);setMarksDraft(Object.fromEntries(students.map((student)=>{const mark=normalizeMark(exam.marks?.[student.id],rule);return [student.id,{theory:mark.theory??'',component:mark.component??''}];})));setPanel('marks');};
  const openReview=(exam)=>{setSelectedId(exam.id);setPanel('review');};
  const createExam=(event)=>{
    event.preventDefault();
    const form=new FormData(event.currentTarget);
    if(role==='teacher'){
      const nextId=Math.max(0,...data.exams.map((exam)=>Number(exam.id)||0))+1;
      const item={id:nextId,name:form.get('name'),examType:form.get('name'),mode:'Online',classes:'9-A',start:formatDateDMY(form.get('start')),duration:form.get('duration'),subject:form.get('subject'),subjectGroup:'Assigned',paperFormat:'Online quiz',status:'Published',resultStatus:'Live',marks:{},quizAttempt:null,createdBy:roleConfig[role].name};
      update('exams',(items)=>[item,...items],{action:'INSERT',record:item.name,detail:'Teacher online assessment created'});setCreateOpen(false);notify('Online test published to assigned students');return;
    }
    const grade=Number(examDraft.classNumber);
    const stream=grade>=11?examDraft.stream:'Not applicable';
    let examType=String(form.get('examType'));
    if((grade===9||grade===11)&&examType==='Sent-up')examType='Final';
    if((grade===10||grade===12)&&examType==='Final')examType='Sent-up';
    const sectionRecord=(data.sections||[]).find((item)=>examClassNumber(item.className)===grade&&(grade<11||item.stream===stream));
    const sections=sectionRecord?.sections?.length?sectionRecord.sections:['A'];
    const activeStudents=activeSessionStudents(data.students);
    const papers=sections.flatMap((section)=>{
      const exactClass=`${grade}${grade>=11?` ${stream}`:''}-${section}`;
      const students=activeStudents.filter((student)=>student.className===exactClass);
      const subjects=[...new Map((students.length?students.flatMap(studentPapers):defaultStudentSubjects({className:exactClass})).map((paper)=>[subjectOptionKey(paper),paper])).values()];
      return subjects.map((paper)=>({...paper,className:exactClass,section,key:examPaperKey(exactClass,paper)}));
    });
    const nextId=Math.max(0,...data.exams.map((exam)=>Number(exam.id)||0))+1;
    const item={id:nextId,isBatch:true,name:`${examType} Examination`,examType,mode:'Offline',classNumber:String(grade),stream,sections,classes:`${grade}${grade>=11?` ${stream}`:''} · All sections (${sections.join(', ')})`,start:formatDateDMY(form.get('start')||'20-10-2026'),duration:form.get('duration')||'3 hours',subject:'All subjects',subjectGroup:'All',paperFormat:'Per subject settings',papers,allPaperMarks:{},paperStatuses:{},status:'Scheduled',resultStatus:'Not started',marks:{},correctionApprovals:{admin:false,headmaster:false},createdBy:roleConfig[role].name,academicYear:data.academicYear?.current||SESSION};
    update('exams',(items)=>[item,...items],{action:'INSERT',record:item.name,detail:`Class ${grade}${grade>=11?` ${stream}`:''}: ${sections.length} sections and ${papers.length} section-papers created automatically`});
    setCreateOpen(false);notify(`${item.name} created for ${sections.length} sections and ${papers.length} papers`);
  };
  const publishSchedule=(exam)=>{if(exam.deletionRequest)return notify('Deletion approval is pending; this examination cannot be announced');setExam(exam.id,{status:exam.mode==='Online'?'Published':'Active',resultStatus:exam.mode==='Online'?'Live':'Draft'});notify(`${exam.name} announced; marks entry is now active`);};
  const persistMarks=(resultStatus)=>{if(!selectedExam||selectedExam.deletionRequest||selectedExam.resultStatus!=='Draft')return;const error=validateMarks(classStudents,marksDraft,selectedRule,resultStatus==='Submitted');if(error)return notify(error);const marks=Object.fromEntries(classStudents.map((student)=>{const draft=marksDraft[student.id]||{};const theory=draft.theory===''?null:Number(draft.theory);const component=selectedRule.componentMax?(draft.component===''?null:Number(draft.component)):null;return [student.id,selectedRule.componentMax?{theory,component,total:(theory??0)+(component??0)}:theory];}));setExam(selectedExam.id,{marks,resultStatus,submittedBy:resultStatus==='Submitted'?roleConfig[role].name:selectedExam.submittedBy,submittedAt:resultStatus==='Submitted'?'24-09-2026':selectedExam.submittedAt});notify(resultStatus==='Submitted'?(canAnnounce?'Marks saved; result is ready for review and publication':'Marks submitted for approval'):'Marks draft saved');if(resultStatus==='Submitted'){if(canAnnounce)setPanel('review');else closePanel();}};
  const submitMarks=(event)=>{event.preventDefault();persistMarks('Submitted');};
  const publishResults=()=>{setExam(selectedExam.id,{resultStatus:'Published',publishedAt:'24-09-2026',publishedBy:roleConfig[role].name,correctionApprovals:{admin:false,headmaster:false}});notify('Result published to Student portal and public lookup');closePanel();};
  const returnMarks=()=>{setExam(selectedExam.id,{resultStatus:'Draft'});notify('Marks returned to Teacher for correction');closePanel();};
  const requestCorrection=()=>{if(!canAnnounce||selectedExam?.resultStatus!=='Published')return;const approvals={admin:false,headmaster:false,[role]:true};setExam(selectedExam.id,{resultStatus:'Correction approval',correctionApprovals:approvals,correctionUnlocked:false,correctionDecision:null},{action:'REQUEST',record:selectedExam.name,detail:`Marks correction requested by ${roleConfig[role].name}; ${role} approval recorded`});notify(`Published-mark correction requested; ${role==='admin'?'Headmaster':'Admin'} approval is pending`);closePanel();};
  const approveCorrection=()=>{if(selectedExam?.resultStatus!=='Correction approval'||!canDecideApproval(selectedExam.correctionApprovals,role))return;const approvals={admin:false,headmaster:false,...selectedExam.correctionApprovals,[role]:true};const unlocked=approvals.admin&&approvals.headmaster;setExam(selectedExam.id,{correctionApprovals:approvals,resultStatus:unlocked?'Draft':'Correction approval',correctionUnlocked:unlocked,correctionDecision:{status:'Approved',by:role,at:approvalTimestamp()},...(unlocked&&selectedExam.isBatch?{paperStatuses:{}}:{})},{action:'APPROVE',record:selectedExam.name,detail:`Marks correction approved by ${roleConfig[role].name}; ${unlocked?'both approvals recorded, marks unlocked':'second approval pending'}`});notify(unlocked?'Both approvals recorded; marks are unlocked for correction':'One of two approvals recorded');closePanel();};
  const rejectCorrection=(reason)=>{if(!reason.trim()||selectedExam?.resultStatus!=='Correction approval'||!canDecideApproval(selectedExam.correctionApprovals,role))return;update('exams',(items)=>items.map((exam)=>exam.id===selectedExam.id?{...exam,resultStatus:'Published',correctionUnlocked:false,correctionApprovals:{admin:false,headmaster:false},correctionDecision:{status:'Rejected',by:role,reason,at:approvalTimestamp()}}:exam),{action:'REJECT',record:selectedExam.name,detail:`Marks correction rejected by ${roleConfig[role].name}. Reason: ${reason}. Published marks remain locked.`});notify('Correction rejected; published marks remain unchanged and locked');closePanel();};
  const uploadMarks=async(exam,event)=>{const file=event.target.files?.[0];if(!file)return;const rule=getExamSubjectRule(exam);const text=await file.text();const lines=text.split(/\r?\n/).filter(Boolean);const marks={...exam.marks};let count=0;for(const line of lines.slice(1)){const [studentId,theoryValue,componentValue='']=line.split(',').map((part)=>part.trim());const theory=Number(theoryValue);const component=Number(componentValue||0);if(data.students.some((student)=>student.id===studentId)&&theoryValue!==''&&!Number.isNaN(theory)&&theory<=rule.theoryMax&&(!rule.componentMax||component<=rule.componentMax)){marks[studentId]=rule.componentMax?{theory,component,total:theory+component}:theory;count+=1;}}setExam(exam.id,{marks,resultStatus:'Draft',submittedBy:roleConfig[role].name});notify(`${count} marks imported from CSV${rule.componentMax?' (theory + component)':''}`);event.target.value='';};
  const startQuiz=(exam)=>{setQuizExamId(exam.id);setAnswer({});};
  const submitQuiz=()=>{const score=activeQuestions.filter((question,index)=>answer[index]===question[2]).length;setExam(quizExam.id,{quizAttempt:{studentId:'UHS-260207',score,total:activeQuestions.length,submitted:'14 Sep 2026'}});notify('Online test submitted successfully');};
  const togglePermission=(key)=>{update('permissions',(current)=>({...INITIAL.permissions,...current,[key]:!permission[key]}));notify(`Teacher permission ${permission[key]?'disabled':'enabled'}`);};
  const resultValues=selectedExam?Object.values(selectedExam.marks||{}).filter((value)=>value!==null&&value!=='').map((value)=>evaluateMark(value,selectedRule).total):[];
  const resultAverage=resultValues.length?Math.round(resultValues.reduce((total,value)=>total+value,0)/resultValues.length/(selectedRule?.fullMarks||100)*100):0;
  const rankedStudents=selectedExam?[...classStudents].filter((student)=>selectedExam.marks?.[student.id]!==null&&selectedExam.marks?.[student.id]!==undefined).sort((a,b)=>selectedMark(b.id).total-selectedMark(a.id).total):[];
  const marksheetResult=(student)=>{const outcome=selectedMark(student.id);const rank=Math.max(1,rankedStudents.findIndex((item)=>item.id===student.id)+1);return {exam:selectedExam?.name||'Examination',subjects:[{subject:selectedExam?.subject||'Overall',marks:outcome.total,fullMarks:selectedRule?.fullMarks||100,counted:!selectedRule?.excludedFromAggregate,status:outcome.status}],total:selectedRule?.excludedFromAggregate?0:outcome.total,totalMaximum:selectedRule?.excludedFromAggregate?0:selectedRule?.fullMarks||100,percentage:selectedRule?.excludedFromAggregate?'Not counted':`${Math.round(outcome.total/(selectedRule?.fullMarks||100)*100)}%`,status:outcome.status.toUpperCase(),sectionRank:rank,rank};};
  const downloadStudentMarksheet=(studentId='UHS-260207')=>{const student=data.students.find((item)=>item.id===studentId);if(student&&selectedExam)downloadMarksheet(student,marksheetResult(student));};
  const exportResultCsv=()=>{if(!selectedExam)return;const rows=[['Student ID','Student Name','Class','Section','Roll','Subject','Theory',selectedRule.componentLabel||'Component','Total','Full Marks','Result','Counted in aggregate'],...classStudents.map((student)=>{const outcome=selectedMark(student.id);return [student.id,student.name,student.className,student.section||'',student.roll,selectedExam.subject,outcome.theory??'',outcome.component??'',outcome.total,selectedRule.fullMarks,outcome.status,selectedRule.excludedFromAggregate?'No':'Yes'];})];const csv=rows.map((row)=>row.map((value)=>`"${String(value).replaceAll('"','""')}"`).join(',')).join('\n');const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));link.download=`${selectedExam.name.replaceAll(' ','-')}-results.csv`;link.click();URL.revokeObjectURL(link.href);};
  const downloadClassMarksheets=()=>{if(!selectedExam)return;const doc=new jsPDF({unit:'mm',format:'a4'});classStudents.forEach((student,index)=>{if(index)doc.addPage();const result=marksheetResult(student);const outcome=selectedMark(student.id);doc.setDrawColor(42,36,102);doc.setLineWidth(1);doc.rect(10,10,190,270);doc.setTextColor(42,36,102);doc.setFont('helvetica','bold');doc.setFontSize(17);doc.text('UHS PHURHURIYA PARAIYA',105,25,{align:'center'});doc.setFontSize(9);doc.text(`UDISE+ ${UDISE_CODE} | Academic Session ${SESSION}`,105,33,{align:'center'});doc.setFontSize(13);doc.text(`${selectedExam.name} - MARKSHEET`,105,47,{align:'center'});autoTable(doc,{startY:56,margin:{left:20,right:20},theme:'plain',styles:{fontSize:9,cellPadding:2},body:[['Student',student.name,'Roll',student.roll],["Father's name",student.guardian,"Mother's name",student.mother],['Class / Stream',`${student.className} / ${student.stream||'Not applicable'}`,'Section',student.section||'—'],['e-ShikshaKosh ID',student.eshiksha||'Not recorded','Rank',result.rank]]});const head=selectedRule.componentMax?['Subject',`Theory / ${selectedRule.theoryMax}`,`${selectedRule.componentLabel} / ${selectedRule.componentMax}`,'Total','Result']:['Subject','Full marks','Marks obtained','Result'];const body=selectedRule.componentMax?[[selectedExam.subject,outcome.theory??'—',outcome.component??'—',`${outcome.total}/${selectedRule.fullMarks}`,outcome.status]]:[[selectedExam.subject,selectedRule.fullMarks,result.total,result.status]];autoTable(doc,{startY:doc.lastAutoTable.finalY+7,margin:{left:20,right:20},head:[head],body,headStyles:{fillColor:[42,36,102],textColor:255}});doc.setFontSize(8);doc.setTextColor(90,96,110);doc.text(selectedRule.ruleLabel,20,doc.lastAutoTable.finalY+9);doc.setDrawColor(120,126,140);doc.line(25,250,72,250);doc.line(132,250,180,250);doc.setFontSize(8);doc.text('Class Teacher',48,256,{align:'center'});doc.text('Headmaster',156,256,{align:'center'});});doc.save(`${selectedExam.name.replaceAll(' ','-')}-Class-${selectedExam.classes}-marksheets.pdf`);};

  if(role==='student'&&quizExam)return <div><button className="back-button" onClick={()=>{setQuizExamId(null);setAnswer({});}}><Icon name="arrow"/> Back to exams</button><PageTitle eyebrow="Online assessment" title={quizExam.name} body={`${activeQuestions.length} questions · ${quizExam.duration} · One attempt`}/>{quizExam.quizAttempt?<section className="quiz-complete-card"><span><Icon name="check" size={28}/></span><p className="eyebrow">Attempt submitted</p><h2>{quizExam.quizAttempt.score}/{quizExam.quizAttempt.total}</h2><strong>Grade {gradeFor(quizExam.quizAttempt.score,quizExam.quizAttempt.total)}</strong><p>Your answers were submitted on {quizExam.quizAttempt.submitted}. This demo permits one attempt.</p><button className="btn btn-secondary" onClick={()=>setQuizExamId(null)}>Return to exams</button></section>:<div className="quiz-card">{activeQuestions.map((question,questionIndex)=><div className="question" key={question[0]}><span>Question {questionIndex+1}</span><h3>{question[0]}</h3>{question[1].map((option,optionIndex)=><label key={option} className={answer[questionIndex]===optionIndex?'selected':''}><input type="radio" name={`q${questionIndex}`} onChange={()=>setAnswer({...answer,[questionIndex]:optionIndex})}/><i/>{option}</label>)}</div>)}<button className="btn btn-primary" disabled={Object.keys(answer).length<activeQuestions.length} onClick={submitQuiz}>Submit answers</button></div>}</div>;

  const onlineExam=visibleExams.find((exam)=>exam.mode==='Online'&&exam.status==='Published'&&exam.resultStatus==='Live');
  const marksReadOnly=Boolean(selectedExam?.deletionRequest)||selectedExam?.resultStatus!=='Draft'||(role==='teacher'&&!permission.teacherCanEnterMarks);
  const modalFooter=panel==='marks'?(marksReadOnly?<button className="btn btn-secondary" onClick={closePanel}>Close</button>:<><button className="btn btn-secondary" disabled={!classStudents.length} onClick={()=>persistMarks('Draft')}>Save draft</button><button className="btn btn-primary" type="submit" form="marks-entry-form" disabled={!classStudents.length}>{canAnnounce?'Save & proceed to review':'Submit to Admin'}</button></>):panel==='review'&&selectedExam?.resultStatus==='Submitted'&&canAnnounce?<><button className="btn btn-secondary" onClick={returnMarks}>Return for correction</button><button className="btn btn-primary" onClick={publishResults}>Publish result</button></>:panel==='review'&&selectedExam?.resultStatus==='Published'&&role==='student'?<><button className="btn btn-secondary" onClick={closePanel}>Close</button><button className="btn btn-primary" onClick={()=>downloadStudentMarksheet()}>Download marksheet PDF</button></>:panel==='review'&&selectedExam?.resultStatus==='Published'&&canAnnounce?<><button className="btn btn-secondary" onClick={closePanel}>Close</button>{!selectedExam.isBatch&&<><button className="btn btn-secondary" onClick={exportResultCsv}>Export CSV</button><button className="btn btn-secondary" onClick={downloadClassMarksheets}>Class marksheets PDF</button></>}<button className="btn btn-primary" onClick={requestCorrection}>Request marks correction</button></>:panel==='review'&&selectedExam?.resultStatus==='Correction approval'&&canAnnounce?<><button className="btn btn-secondary" onClick={closePanel}>Close</button><RejectApproval disabled={!canDecideApproval(selectedExam.correctionApprovals,role)} onReject={rejectCorrection} label="Reject correction"/><button className="btn btn-primary" disabled={!canDecideApproval(selectedExam.correctionApprovals,role)} onClick={approveCorrection}>{selectedExam.correctionApprovals?.[role]?'Your approval recorded':'Approve correction'}</button></>:<button className="btn btn-secondary" onClick={closePanel}>Close</button>;
  const openBatchWorkspace=(exam)=>{setWorkspaceExamId(exam?.id||'');setAllPapersOpen(true);};
  const announceAndOpenBatch=(exam)=>{publishSchedule(exam);openBatchWorkspace(exam);};
  const publishBatch=(exam)=>{if(!canAnnounce||exam.resultStatus!=='Submitted')return;setExam(exam.id,{resultStatus:'Published',status:'Completed',publishedAt:'24-09-2026',publishedBy:roleConfig[role].name,correctionApprovals:{admin:false,headmaster:false}},{action:'PUBLISH',record:exam.name,detail:`Result published by ${roleConfig[role].name} after all required papers were completed`});notify('Complete class result published; marksheets are now visible to Class Teacher and students');};
  const submitDeletionRequest=()=>{
    const exam=data.exams.find((item)=>item.id===deleteExamId);
    const reason=deleteReason.trim();
    if(!exam||!reason)return notify('Deletion reason is required');
    if(!canAnnounce||exam.deletionRequest||!['Scheduled','Active'].includes(exam.status))return;
    const request={requestedBy:roleConfig[role].name,requestedRole:role,requestedAt:approvalTimestamp(),reason,approvals:{admin:role==='admin',headmaster:role==='headmaster'}};
    update('exams',(items)=>items.map((item)=>item.id===exam.id?{...item,deletionRequest:request,deletionDecision:null}:item),{action:'REQUEST',record:exam.name,detail:`Exam deletion requested by ${roleConfig[role].name}; ${role} approval recorded. Reason: ${reason}`});
    setDeleteExamId(null);setDeleteReason('');notify(`Deletion request recorded; ${role==='admin'?'Headmaster':'Admin'} approval is pending`);
  };
  const approveExamDeletion=(exam)=>{
    if(!exam.deletionRequest||!canDecideApproval(exam.deletionRequest.approvals,role))return;
    const approvals={admin:false,headmaster:false,...exam.deletionRequest?.approvals,[role]:true};
    update('exams',(items)=>items.map((item)=>item.id===exam.id?{...item,deletionRequest:{...item.deletionRequest,approvals}}:item),{action:'APPROVE',record:exam.name,detail:`Exam deletion approved by ${roleConfig[role].name} (${role})`});
    if(approvals.admin&&approvals.headmaster){
      update('exams',(items)=>items.filter((item)=>item.id!==exam.id),{action:'DELETE',record:exam.name,detail:`Scheduled/announced examination deleted after separate Admin and Headmaster approvals. Reason: ${exam.deletionRequest?.reason||'Not recorded'}`});
      notify(`${exam.name} deleted after both approvals`);return;
    }
    notify(`Your approval is recorded; ${role==='admin'?'Headmaster':'Admin'} approval is still pending`);
  };
  const rejectExamDeletion=(exam,reason)=>{if(!reason.trim()||!exam.deletionRequest||!canDecideApproval(exam.deletionRequest.approvals,role))return;update('exams',(items)=>items.map((item)=>item.id===exam.id?{...item,deletionRequest:null,deletionDecision:{...item.deletionRequest,status:'Rejected',by:role,reason,at:approvalTimestamp()}}:item),{action:'REJECT',record:exam.name,detail:`Exam deletion rejected by ${roleConfig[role].name}. Reason: ${reason}`});notify('Deletion rejected; examination retained');};
  const renderPrimaryExamAction=(exam)=>{
    if(exam.isBatch){
      if(canAnnounce&&['Published','Correction approval'].includes(exam.resultStatus))return <><button className="table-action" onClick={()=>openBatchWorkspace(exam)}>View results & marksheets</button><button className="table-action" onClick={()=>openReview(exam)}>{exam.resultStatus==='Correction approval'?'Review correction request':'Marks correction'}</button></>;
      if(officeRole){
        if(exam.status==='Scheduled')return canAnnounce?<button className="table-action primary-exam-action" onClick={()=>announceAndOpenBatch(exam)}>Announce & open marks entry</button>:<span className="muted">Waiting for Admin / Headmaster announcement</span>;
        if(exam.resultStatus==='Submitted')return canAnnounce?<div className="exam-row-actions"><button className="table-action" onClick={()=>openBatchWorkspace(exam)}>Review entered marks</button><button className="table-action approve primary-exam-action" onClick={()=>publishBatch(exam)}>Publish result</button></div>:<button className="table-action" onClick={()=>openBatchWorkspace(exam)}>View submitted marks</button>;
        return <button className="table-action primary-exam-action" onClick={()=>openBatchWorkspace(exam)}>{exam.resultStatus==='Published'?'View results & marksheets':'Continue student-wise marks entry'}</button>;
      }
      if(role==='teacher')return <button className="table-action" onClick={()=>openBatchWorkspace(exam)}>{exam.resultStatus==='Published'?'View class result':'Enter allotted marks'} <Icon name="arrow" size={14}/></button>;
      return exam.resultStatus==='Published'?<button className="table-action" onClick={()=>openBatchWorkspace(exam)}>View marksheet</button>:<button className="table-action" onClick={()=>openDetails(exam)}>View details</button>;
    }
    if(officeRole){
      if(exam.status==='Scheduled')return canAnnounce?<button className="table-action" onClick={()=>publishSchedule(exam)}>Announce exam</button>:<span className="muted">Waiting for announcement</span>;
      if(exam.resultStatus==='Submitted')return <button className="table-action" onClick={()=>openReview(exam)}>{canAnnounce?'Review & publish':'View submitted marks'}</button>;
      if(exam.resultStatus==='Published'||exam.resultStatus==='Correction approval')return <button className="table-action" onClick={()=>openReview(exam)}>View result</button>;
      if(exam.mode==='Offline'&&(exam.status==='Active'||exam.status==='Completed'))return <div className="exam-row-actions"><button className="table-action" onClick={()=>openMarks(exam)}>Enter marks</button><label className="table-action file-button">Marks CSV<input type="file" accept=".csv,text/csv" onChange={(event)=>uploadMarks(exam,event)}/></label></div>;
      return <button className="table-action" onClick={()=>openDetails(exam)}>View details</button>;
    }
    if(role==='teacher'){if(exam.resultStatus==='Published')return <button className="table-action" onClick={()=>openReview(exam)}>View class result</button>;return exam.mode==='Offline'&&(exam.status==='Active'||exam.status==='Completed')&&permission.teacherCanEnterMarks?<button className="table-action" onClick={()=>openMarks(exam)}>{exam.resultStatus==='Draft'?'Enter assigned marks':'View submission'} <Icon name="arrow" size={14}/></button>:<button className="table-action" onClick={()=>openDetails(exam)}>View details</button>;}
    return exam.mode==='Online'&&exam.status==='Published'?<button className="table-action" onClick={()=>startQuiz(exam)}>{exam.quizAttempt?'View score':'Start test'}</button>:exam.resultStatus==='Published'?<button className="table-action" onClick={()=>openReview(exam)}>View result</button>:<button className="table-action" onClick={()=>openDetails(exam)}>View details</button>;
  };
  const renderDeletionAction=(exam)=>{
    if(!canAnnounce||!['Scheduled','Active'].includes(exam.status))return null;
    const request=exam.deletionRequest;
    if(!request)return <button className="table-action danger-action" onClick={()=>{setDeleteExamId(exam.id);setDeleteReason('');}}>Request deletion</button>;
    if(canDecideApproval(request.approvals,role))return <><small className="block">Reason: {request.reason}</small><button className="table-action danger-action" onClick={()=>approveExamDeletion(exam)}>Approve deletion</button><RejectApproval onReject={(reason)=>rejectExamDeletion(exam,reason)} label="Reject deletion"/></>;
    return <span className="muted">Waiting for {role==='admin'?'Headmaster':'Admin'}</span>;
  };
  const renderExamAction=(exam)=><div className="exam-row-actions">{!exam.deletionRequest&&renderPrimaryExamAction(exam)}{renderDeletionAction(exam)}</div>;

  return <>
    <PageTitle title={officeRole?'Examinations & marks':role==='teacher'?'Assigned marks & examinations':'Exams & results'} body={canAnnounce?'Choose only class and exam type; every configured section and subject is created automatically.':role==='clerk'?'Enter every tagged subject for one student together or upload one bulk CSV.':role==='teacher'?'Only allotted class-section-subject papers appear after announcement; Class Teachers also receive published class results.':'View and download only your published marksheet.'} actions={officeRole?<><button className="btn btn-secondary" onClick={()=>openBatchWorkspace(null)}>Student-wise marks entry</button>{canAnnounce&&<button className="btn btn-primary" onClick={()=>setCreateOpen(true)}>+ Create class exam</button>}</>:role==='teacher'&&permission.teacherCanCreateTests?<button className="btn btn-primary" onClick={()=>setCreateOpen(true)}>+ Create online test</button>:null}/>
    {role==='admin'&&<details className="content-card exam-settings-disclosure"><summary><span><b>Teacher academic permissions</b><small>Open only when you need to change test or marks-entry access.</small></span><em>Manage</em></summary><section className="exam-permission-card"><div><span className="eyebrow">Teacher permissions</span><h3>Neha Kumari · Science · Class IX-A</h3><p>Admin controls whether this Teacher can create online tests or enter offline marks.</p></div><label><input type="checkbox" checked={permission.teacherCanCreateTests} onChange={()=>togglePermission('teacherCanCreateTests')}/><span><strong>Create online tests</strong><small>{permission.teacherCanCreateTests?'Granted':'Not granted'}</small></span></label><label><input type="checkbox" checked={permission.teacherCanEnterMarks} onChange={()=>togglePermission('teacherCanEnterMarks')}/><span><strong>Enter offline marks</strong><small>{permission.teacherCanEnterMarks?'Granted':'Not granted'}</small></span></label></section></details>}
    {role==='teacher'&&(!permission.teacherCanCreateTests||!permission.teacherCanEnterMarks)&&<div className="warning-banner"><span>!</span><div><strong>Some academic permissions are restricted</strong><p>Only the School Administrator can grant test-creation and marks-entry access.</p></div></div>}
    {role==='student'&&onlineExam&&<div className="exam-hero"><div><span className="tag">{onlineExam.quizAttempt?'ATTEMPT SUBMITTED':'AVAILABLE NOW'}</span><h2>{onlineExam.name}</h2><p>Class {onlineExam.classes} · {questionsFor(onlineExam).length} questions · {onlineExam.duration}</p></div><button className="btn btn-light" onClick={()=>startQuiz(onlineExam)}>{onlineExam.quizAttempt?'View score':'Start test'} <Icon name="arrow"/></button></div>}
    {officeRole?<>
      <section className="content-card exam-workflow-guide"><header><div><span className="eyebrow">Simple examination workflow</span><h3>Follow these four stages</h3><p>Each card shows the next permitted action. Every configured class–stream–section has 20 active test students.</p></div><span className="demo-data-badge">200 test students</span></header><div className="exam-workflow-steps">{Object.entries(stageMeta).map(([key,item])=><button type="button" key={key} className={stageCounts[key]?'has-items':''} onClick={()=>setExamStageFilter(key)}><i>{item.number}</i><span><strong>{item.label}</strong><small>{item.title}</small></span><b>{stageCounts[key]}</b></button>)}</div></section>
      <div className="record-summary exam-summary"><div><span>Needs announcement</span><strong>{stageCounts.scheduled}</strong></div><div><span>Marks entry</span><strong>{stageCounts.entry}</strong></div><div><span>Ready to publish</span><strong>{stageCounts.ready}</strong></div><div><span>Published</span><strong>{stageCounts.published}</strong></div></div>
      <div className="exam-board-toolbar"><div className="filter-tabs exam-stage-tabs">{[['all','All exams'],['scheduled','Scheduled'],['entry','Marks entry'],['ready','Ready to publish'],['published','Published']].map(([key,label])=><button type="button" key={key} className={examStageFilter===key?'active':''} onClick={()=>setExamStageFilter(key)}>{label}<b>{key==='all'?officeStageExams.length:stageCounts[key]}</b></button>)}</div><span>Session {data.academicYear?.current||SESSION}</span></div>
      <div className="exam-workflow-list">{filteredOfficeExams.map((exam)=>{const stage=stageForExam(exam);const meta=stageMeta[stage];const progress=examProgress(exam);return <article className={`exam-workflow-card stage-${stage}`} key={exam.id}><div className="exam-stage-marker"><i>{meta.number}</i><span>{meta.label}</span></div><div className="exam-card-main"><header><div><span className={`exam-stage-pill ${stage}`}>{meta.title}</span>{exam.isDemo&&<span className="demo-pill">Demo</span>}<h3>{exam.name}</h3><p>Class {exam.classes} · {formatDateDMY(exam.start)} · {exam.duration}</p></div><Status>{exam.resultStatus}</Status></header><p className="exam-stage-help">{meta.description}</p><div className="exam-progress-block"><div><span><b>{progress.submittedPapers}</b> of {progress.totalPapers||1} section-papers complete</span><span>{progress.students} students</span></div><progress max="100" value={progress.percent}/><small>{progress.percent}% complete{progress.submittedStudents?` · ${progress.submittedStudents} student submissions`:''}</small></div>{exam.deletionRequest&&<div className="approval-status exam-card-approval"><strong>Deletion approval pending</strong><span>Admin {exam.deletionRequest.approvals?.admin?'✓':'pending'} · Headmaster {exam.deletionRequest.approvals?.headmaster?'✓':'pending'}</span></div>}<footer>{renderExamAction(exam)}{exam.deletionDecision?.status==='Rejected'&&<small>Deletion rejected by {exam.deletionDecision.by}: {exam.deletionDecision.reason}</small>}{exam.correctionDecision?.status==='Rejected'&&<small>Correction rejected by {exam.correctionDecision.by}: {exam.correctionDecision.reason}</small>}</footer></div></article>;})}{!filteredOfficeExams.length&&<div className="content-card empty-state">No examination is currently in this stage.</div>}</div>
    </>:<><div className="record-summary exam-summary"><div><span>{role==='student'?'Available exams':'Assigned exams'}</span><strong>{visibleExams.length}</strong></div><div><span>Active marks entry</span><strong>{visibleExams.filter((exam)=>exam.status==='Active').length}</strong></div><div><span>Published results</span><strong>{visibleExams.filter((exam)=>exam.resultStatus==='Published').length}</strong></div><div><span>Academic session</span><strong>{data.academicYear?.current||SESSION}</strong></div></div><div className="table-card exam-table"><table><thead><tr><th>Examination</th><th>Mode</th><th>Classes</th><th>Date</th><th>Schedule</th><th>Result workflow</th><th>Action</th></tr></thead><tbody>{visibleExams.map((exam)=><tr key={exam.id}><td><strong>{exam.name}</strong><small className="block">{exam.subject} · {exam.duration}</small></td><td><span className={`exam-mode ${exam.mode.toLowerCase()}`}>{exam.mode}</span></td><td>{exam.classes}</td><td>{formatDateDMY(exam.start)}</td><td><Status>{exam.status}</Status></td><td><Status>{exam.resultStatus}</Status></td><td>{renderExamAction(exam)}</td></tr>)}</tbody></table></div></>}
    {role!=='student'&&<details className="content-card exam-rules-disclosure"><summary><span><b>Marks, paper format & passing rules</b><small>Reference settings are kept separate from the daily examination workflow.</small></span><em>View rules</em></summary><section className="exam-rule-card"><div className="exam-rule-heading"><div><span className="eyebrow">Subject master</span><h3>Full marks & passing rules</h3><p>Subject codes for Intermediate Arts and Commerce are taken from the supplied BSEB registration form.</p></div><div className="filter-tabs exam-rule-tabs">{['IX-X','Arts','Commerce'].map((item)=><button type="button" key={item} className={rulesTab===item?'active':''} onClick={()=>setRulesTab(item)}>{item}</button>)}</div></div>{rulesTab==='IX-X'?<div className="secondary-rule-grid">{SECONDARY_SUBJECTS.map((subject)=><article key={subject.name}><div><strong>{subject.label}</strong><small>{subject.name==='Science'?'80; IX Final/X Sent-up: 80 theory + 20 practical':subject.name==='Social Science'?'80; IX Final/X Sent-up: 80 theory + 20 internal/project':`${subject.fullMarks} full marks`}</small></div><span className={subject.excluded?'rule-excluded':'rule-pass'}>{subject.excluded?'Not counted':'30% pass'}</span></article>)}</div>:<div className="intermediate-rule-groups">{Object.entries(INTERMEDIATE_SUBJECT_CATALOG[rulesTab]).map(([group,subjects])=><article key={group}><header><strong>{group}</strong><span>{group==='Additional'?'Not counted in aggregate':group.includes('Compulsory')?'Select one':'Select three'}</span></header><div>{subjects.map((subject)=><span key={`${group}-${subject.code}`}><b>{subject.name}</b><small>{subject.code}</small></span>)}</div></article>)}</div>}<footer className="exam-rule-note"><strong>Intermediate marks rule</strong><span>Theory-only paper: 100 marks, minimum 30. Practical paper: Theory 70 + Practical 30, minimum 24/70 in Theory. Additional paper never changes aggregate or overall result.</span></footer></section></details>}
    {role!=='student'&&<div className="security-banner"><Icon name="check"/><div><strong>Publishing is available to Admin and Headmaster</strong><span>The publish button appears only after all required section-papers are complete. Clerk may enter or bulk-upload marks but cannot publish. Any later marks correction still requires separate Admin and Headmaster approvals.</span></div></div>}
    {createOpen&&<Modal title={role==='teacher'?'Create online test':'Create examination'} onClose={()=>setCreateOpen(false)} footer={<><button className="btn btn-secondary" onClick={()=>setCreateOpen(false)}>Cancel</button><button className="btn btn-primary" type="submit" form="exam-create-form">{role==='teacher'?'Create & publish':'Create schedule'}</button></>}>
      <form id="exam-create-form" className="modal-form" onSubmit={createExam}>
        {role==='teacher'?<><label>Examination title<input name="name" defaultValue="Science fundamentals quiz" required/></label><div className="form-row"><label>Assigned class<input name="classes" value="9-A" readOnly/></label><label>Assigned subject<input name="subject" value="Science" readOnly/></label></div><div className="form-row"><label>Date (DD-MM-YYYY)<input name="start" defaultValue="20-10-2026" required/></label><label>Duration<select name="duration" defaultValue="10 minutes"><option>10 minutes</option><option>20 minutes</option><option>1 hour</option></select></label></div><div className="record-lock-note"><Icon name="exam"/><div><strong>Assigned scope only</strong><span>Teacher-created online tests remain limited to allotted class, section and subject.</span></div></div></>:<><div className="form-row"><label>Class<select value={examDraft.classNumber} onChange={(event)=>setExamDraft({...examDraft,classNumber:event.target.value,stream:Number(event.target.value)>=11?'Science':'Not applicable'})}><option value="9">Class IX</option><option value="10">Class X</option><option value="11">Class XI</option><option value="12">Class XII</option></select></label><label>Examination type<select name="examType" defaultValue="First Quarterly"><option>First Quarterly</option><option>Half Yearly</option><option>Second Quarterly</option>{['9','11'].includes(examDraft.classNumber)?<option>Final</option>:<option>Sent-up</option>}</select></label></div>{Number(examDraft.classNumber)>=11&&<label>Stream<select value={examDraft.stream} onChange={(event)=>setExamDraft({...examDraft,stream:event.target.value})}><option>Science</option><option>Arts</option><option>Commerce</option></select></label>}<div className="form-row"><label>Date (DD-MM-YYYY)<input name="start" defaultValue="20-10-2026" pattern="\d{2}-\d{2}-\d{4}" required/></label><label>Duration<select name="duration" defaultValue="3 hours"><option>1 hour</option><option>3 hours</option></select></label></div><div className="record-lock-note"><Icon name="exam"/><div><strong>Automatic class batch</strong><span>All configured sections and every student-tagged subject will be created automatically. Subject paper rules come from Subject settings.</span></div></div></>}
      </form>
    </Modal>}
    {deleteExamId&&<Modal title="Request examination deletion" onClose={()=>{setDeleteExamId(null);setDeleteReason('');}} footer={<><button className="btn btn-secondary" onClick={()=>{setDeleteExamId(null);setDeleteReason('');}}>Cancel</button><button className="btn btn-primary danger" disabled={!deleteReason.trim()} onClick={submitDeletionRequest}>Submit deletion request</button></>}>
      <div className="modal-form"><div className="warning-banner"><span>!</span><div><strong>Two-person approval is mandatory</strong><p>This Scheduled or Announced examination will be deleted only after separate Admin and Headmaster approvals. Every step is recorded in Audit Log.</p></div></div><label>Reason for deletion<textarea value={deleteReason} onChange={(event)=>setDeleteReason(event.target.value)} placeholder="Explain why this examination must be deleted" required/></label></div>
    </Modal>}
    {allPapersOpen&&<BatchMarksWorkspace role={role} data={data} update={update} notify={notify} initialExamId={workspaceExamId} onClose={()=>{setAllPapersOpen(false);setWorkspaceExamId('');}}/>}
    {selectedExam&&panel&&<Modal title={panel==='marks'?`${selectedExam.subject} marks entry`:panel==='review'?'Result review':'Examination details'} onClose={closePanel} footer={modalFooter}>
      {panel==='marks'?<form id="marks-entry-form" className="marks-entry-form" onSubmit={submitMarks}>
        <div className="marks-assignment"><div><span className="eyebrow">Assigned scope</span><h4>{selectedExam.name}</h4><p>Class {selectedExam.classes} · {selectedExam.subject}{selectedExam.subjectCode?` (${selectedExam.subjectCode})`:''} · Full marks {selectedRule.fullMarks}</p></div><Status>{selectedExam.resultStatus}</Status></div>
        <div className="marks-rule-banner"><strong>{selectedRule.ruleLabel}</strong><span>{selectedRule.excludedFromAggregate?'This paper is excluded from aggregate and overall result.':selectedRule.componentMax?`${selectedRule.componentLabel} is entered separately and total is calculated automatically.`:'Marks total is calculated automatically.'}</span></div>
        {marksReadOnly&&<div className="record-permission-note"><Icon name="user"/><div><strong>{permission.teacherCanEnterMarks?'Submission locked':'Marks-entry permission not granted'}</strong><span>{permission.teacherCanEnterMarks?'Admin review must finish before any further correction.':'Ask the School Administrator to grant this academic permission.'}</span></div></div>}
        <div className={`marks-entry-head ${selectedRule.componentMax?'marks-entry-split':''}`}><span>Student</span><span>Roll</span>{selectedRule.componentMax?<><span>Theory / {selectedRule.theoryMax}</span><span>{selectedRule.componentLabel} / {selectedRule.componentMax}</span><span>Total</span></>:<span>Marks / {selectedRule.fullMarks}</span>}</div>
        {!classStudents.length&&<div className="empty-state" role="status">No eligible students found for this exam. Check the class, section and student progression for the current academic year.</div>}{classStudents.map((student)=>{const draft=marksDraft[student.id]||{theory:'',component:''};const total=(Number(draft.theory)||0)+(Number(draft.component)||0);return <div className={`marks-entry-row ${selectedRule.componentMax?'marks-entry-split':''}`} key={student.id}><div className="person-cell"><i>{student.name.split(' ').map((part)=>part[0]).slice(0,2).join('')}</i><div><strong>{student.name}</strong><small>{student.id}</small></div></div><b>{student.roll}</b><input aria-label={`Theory marks for ${student.name}`} placeholder="Enter marks" type="number" min="0" max={selectedRule.theoryMax} required={!marksReadOnly} disabled={marksReadOnly} value={draft.theory} onChange={(event)=>setMarksDraft({...marksDraft,[student.id]:{...draft,theory:event.target.value}})}/>{selectedRule.componentMax&&<><input aria-label={`${selectedRule.componentLabel} marks for ${student.name}`} type="number" min="0" max={selectedRule.componentMax} required={!marksReadOnly} disabled={marksReadOnly} value={draft.component} onChange={(event)=>setMarksDraft({...marksDraft,[student.id]:{...draft,component:event.target.value}})}/><strong className="mark-auto-total">{total}/{selectedRule.fullMarks}</strong></>}</div>;})}
      </form>:panel==='review'&&selectedExam.isBatch?<div><h4>{selectedExam.name}</h4><p>Class {selectedExam.classes} · All section papers</p><Status>{selectedExam.resultStatus}</Status><p>Marks stay locked until Admin and Headmaster both approve. Either pending approver can reject the request.</p><div className="approval-grid"><span>Admin: {selectedExam.correctionApprovals?.admin?'Approved':'Pending'}</span><span>Headmaster: {selectedExam.correctionApprovals?.headmaster?'Approved':'Pending'}</span></div></div>:panel==='review'?<div className="result-review">
        <div className="result-review-hero"><div><span className="eyebrow">{selectedExam.resultStatus==='Published'?'Published result':'Admin approval required'}</span><h4>{selectedExam.name}</h4><p>Class {selectedExam.classes} · {selectedExam.subject} · {selectedRule.ruleLabel}</p></div><Status>{selectedExam.resultStatus}</Status></div>
        {role==='student'?<div className="result-stat-strip"><div><span>My marks</span><strong>{selectedMark('UHS-260207').total}</strong></div><div><span>Maximum</span><strong>{selectedRule.fullMarks}</strong></div><div><span>Result</span><strong>{selectedMark('UHS-260207').status}</strong></div></div>:<div className="result-stat-strip"><div><span>Students</span><strong>{resultValues.length}</strong></div><div><span>Average</span><strong>{resultAverage}%</strong></div><div><span>Highest / {selectedRule.fullMarks}</span><strong>{resultValues.length?Math.max(...resultValues):'—'}</strong></div></div>}
        <div className="result-list">{classStudents.filter((student)=>role!=='student'||student.id==='UHS-260207').map((student)=>{const outcome=selectedMark(student.id);return <div key={student.id}><span><strong>{student.name}</strong><small>Roll {student.roll}{selectedRule.componentMax&&outcome.theory!==null?` · Theory ${outcome.theory}, ${selectedRule.componentLabel} ${outcome.component??0}`:''}</small></span><b>{outcome.theory===null?'—':`${outcome.total} / ${selectedRule.fullMarks}`}</b><em className={outcome.status==='Fail'?'result-fail':''}>{outcome.status}</em></div>;})}</div>
        {role==='student'&&<div className="student-result-seal"><Icon name="check"/><div><strong>Admin-approved result</strong><span>Published {selectedExam.publishedAt||'for academic session 2026–27'}</span></div></div>}
      </div>:<div className="exam-detail-view"><span className={`exam-mode ${selectedExam.mode.toLowerCase()}`}>{selectedExam.mode}</span><h4>{selectedExam.name}</h4><p>{selectedExam.subject}{selectedExam.subjectCode?` · Code ${selectedExam.subjectCode}`:''}</p><div className="review-grid"><div><span>Classes</span><strong>{selectedExam.classes}</strong></div><div><span>Date</span><strong>{selectedExam.start}</strong></div><div><span>Paper format</span><strong>{selectedExam.paperFormat||selectedRule.ruleLabel}</strong></div><div><span>Full marks</span><strong>{selectedRule.fullMarks}</strong></div><div><span>Result status</span><strong>{selectedExam.resultStatus}</strong></div><div><span>Created by</span><strong>{selectedExam.createdBy||'School Administrator'}</strong></div></div>{role==='student'&&selectedExam.resultStatus!=='Published'&&<div className="record-permission-note"><Icon name="exam"/><div><strong>Result not published yet</strong><span>You will see marks here only after Teacher submission and Admin approval.</span></div></div>}</div>}
    </Modal>}
  </>;
}

function Attendance({role,data,update,notify}) {
  const records=data.attendanceRecords||[];
  const sessionStudents=data.students.filter((student)=>student.visibleInSession!==false&&student.status!=='Passed out');
  const classOptions=[...new Set(sessionStudents.map((student)=>student.className))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  const defaultClass=role==='teacher'?(classOptions.find((item)=>item==='9-A')||classOptions[0]):classOptions[0];
  const [tab,setTab]=useState(role==='student'?'student':role==='teacher'?'students':'students');
  const [date,setDate]=useState(ATTENDANCE_TODAY);
  const [selectedClass,setSelectedClass]=useState(defaultClass);
  const studentRows=sessionStudents.filter((student)=>student.className===selectedClass);
  const existingStudentRecord=(nextClass=selectedClass,nextDate=date)=>records.find((record)=>record.type==='student'&&record.date===nextDate&&record.group===nextClass);
  const studentDraftFor=(nextClass=selectedClass,nextDate=date)=>Object.fromEntries(sessionStudents.filter((student)=>student.className===nextClass).map((student)=>[student.id,existingStudentRecord(nextClass,nextDate)?.entries.find((entry)=>entry.id===student.id)?.status||'Present']));
  const existingStaffRecord=(nextDate=date)=>records.find((record)=>record.type==='staff'&&record.date===nextDate);
  const staffDraftFor=(nextDate=date)=>Object.fromEntries(data.teachers.map((teacher)=>[teacher.id,existingStaffRecord(nextDate)?.entries.find((entry)=>entry.id===teacher.id)?.status||(teacher.status==='On leave'?'Leave':'Present')]));
  const [studentDraft,setStudentDraft]=useState(()=>studentDraftFor(defaultClass,ATTENDANCE_TODAY));
  const [staffDraft,setStaffDraft]=useState(()=>staffDraftFor(ATTENDANCE_TODAY));
  const canManage=role==='admin'||role==='headmaster';
  const actor=roleConfig[role];
  const changeClass=(nextClass)=>{setSelectedClass(nextClass);setStudentDraft(studentDraftFor(nextClass,date));};
  const changeDate=(nextDate)=>{setDate(nextDate);setStudentDraft(studentDraftFor(selectedClass,nextDate));setStaffDraft(staffDraftFor(nextDate));};
  const upsertRecord=(record)=>update('attendanceRecords',(rows=[])=>rows.some((item)=>item.id===record.id)?rows.map((item)=>item.id===record.id?record:item):[record,...rows],{action:existingStudentRecord()?'UPDATE':'INSERT',record:record.id,detail:`${record.type} attendance saved for ${record.group}`});
  const saveStudents=()=>{
    if(!/^\d{2}-\d{2}-\d{4}$/.test(date)){notify('Date must be in DD-MM-YYYY format');return;}
    const entries=studentRows.map((student)=>({id:student.id,status:studentDraft[student.id]||'Present'}));
    upsertRecord({id:`STU-${date}-${selectedClass}`.replaceAll('/','-'),type:'student',date,group:selectedClass,recordedBy:actor.name,recordedRole:role[0].toUpperCase()+role.slice(1),entries});
    notify(`${selectedClass} attendance saved for ${date}`);
  };
  const saveStaff=()=>{
    if(!/^\d{2}-\d{2}-\d{4}$/.test(date)){notify('Date must be in DD-MM-YYYY format');return;}
    const entries=data.teachers.map((teacher)=>({id:teacher.id,status:staffDraft[teacher.id]||'Present'}));
    const record={id:`STAFF-${date}`.replaceAll('/','-'),type:'staff',date,group:'All staff',recordedBy:actor.name,recordedRole:role[0].toUpperCase()+role.slice(1),entries};
    update('attendanceRecords',(rows=[])=>rows.some((item)=>item.id===record.id)?rows.map((item)=>item.id===record.id?record:item):[record,...rows],{action:existingStaffRecord()?'UPDATE':'INSERT',record:record.id,detail:'Staff attendance saved'});
    notify(`Staff attendance saved for ${date}`);
  };
  const monthlyRows=sessionStudents.map((student)=>{const entries=records.filter((record)=>record.type==='student'&&record.date.endsWith('09-2026')).map((record)=>record.entries.find((entry)=>entry.id===student.id)).filter(Boolean);if(!entries.length){const workingDays=24;const present=Math.round((Number(student.attendance)||0)*workingDays/100);return{...student,workingDays,present,absent:workingDays-present,leave:0,percentage:Number(student.attendance)||0};}const present=entries.filter((entry)=>entry.status==='Present').length;const absent=entries.filter((entry)=>entry.status==='Absent').length;const leave=entries.filter((entry)=>entry.status==='Leave').length;return{...student,workingDays:entries.length,present,absent,leave,percentage:Math.round(present*100/entries.length)};});
  const exportMonthly=()=>{
    const header=['Student ID','Student Name','Class','Working Days','Present','Absent','Leave','Attendance %'];
    const lines=[header,...monthlyRows.map((row)=>[row.id,row.name,row.className,row.workingDays,row.present,row.absent,row.leave,row.percentage])].map((row)=>row.map((value)=>`"${String(value).replaceAll('"','""')}"`).join(','));
    const url=URL.createObjectURL(new Blob([`\uFEFF${lines.join('\n')}`],{type:'text/csv;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download='UHS-Attendance-September-2026.csv';link.click();URL.revokeObjectURL(url);notify('Monthly attendance CSV downloaded');
  };
  if(role==='student'){
    const student=data.students.find((item)=>item.id==='UHS-260207')||data.students[0];
    const studentStatuses=Object.fromEntries(records.filter((record)=>record.type==='student'&&record.entries.some((entry)=>entry.id===student.id)).map((record)=>[Number(record.date.slice(0,2)),record.entries.find((entry)=>entry.id===student.id)?.status]));
    const present=Math.round((student.attendance||0)*24/100);
    return <><PageTitle title="My attendance" body="Monthly attendance summary for academic session 2026–27."/><div className="student-banner compact"><div><span>SEPTEMBER 2026</span><h2>{present} days present out of 24</h2><p>{student.attendance>=75?'Attendance is above the recommended 75% requirement.':'Attendance requires immediate improvement.'}</p></div><div className="attendance-ring"><strong>{student.attendance}%</strong><span>Attendance</span></div></div><div className="calendar-card"><div className="calendar-head"><button>‹</button><strong>September 2026</strong><button>›</button></div><div className="calendar-grid">{['M','T','W','T','F','S','S'].map((item,index)=><b key={`${item}-${index}`}>{item}</b>)}{Array.from({length:30},(_,index)=>index+1).map((day)=>{const status=studentStatuses[day];const className=status==='Absent'?'absent':status==='Leave'?'leave':day%7===0?'holiday':day===16?'today':'present';return <span key={day} className={className}>{day}</span>;})}</div><div className="calendar-legend"><span><i className="present"/>Present</span><span><i className="absent"/>Absent</span><span><i className="leave"/>Leave</span><span><i className="holiday"/>Holiday</span></div></div></>;
  }
  const activeDraft=tab==='staff'?staffDraft:studentDraft;
  const activeRows=tab==='staff'?data.teachers:studentRows;
  const totals={present:activeRows.filter((item)=>activeDraft[item.id]==='Present').length,absent:activeRows.filter((item)=>activeDraft[item.id]==='Absent').length,leave:activeRows.filter((item)=>activeDraft[item.id]==='Leave').length};
  return <>
    <PageTitle title={role==='teacher'?`Class ${selectedClass} attendance`:'Attendance & Daily Register'} body={role==='teacher'?'Class Teacher attendance entry with a saved daily record.':'Student and staff attendance with daily controls and monthly reporting.'} actions={tab==='report'?<button className="btn btn-primary" onClick={exportMonthly}>Export monthly CSV</button>:<button className="btn btn-primary" onClick={tab==='staff'?saveStaff:saveStudents}>Save attendance</button>}/>
    {canManage&&<div className="filter-tabs module-tabs attendance-tabs">{[['students','Student attendance'],['staff','Staff attendance'],['report','Monthly report']].map(([key,label])=><button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}>{label}</button>)}</div>}
    {tab!=='report'&&<><section className="content-card attendance-controls"><label>Date (DD-MM-YYYY)<input value={date} onChange={(event)=>changeDate(event.target.value)}/></label>{tab==='students'&&<label>Class / section<select value={selectedClass} disabled={role==='teacher'} onChange={(event)=>changeClass(event.target.value)}>{classOptions.map((item)=><option key={item}>{item}</option>)}</select></label>}<div><span>Present</span><strong>{totals.present}</strong></div><div><span>Absent</span><strong>{totals.absent}</strong></div><div><span>Leave</span><strong>{totals.leave}</strong></div></section><div className="attendance-register"><div className="attendance-register-head"><span>#</span><span>{tab==='staff'?'Staff member':'Student'}</span><span>{tab==='staff'?'Post / subject':'Roll / ID'}</span><span>Status</span></div>{activeRows.map((item,index)=><div className={`attendance-register-row status-row-${String(activeDraft[item.id]||'Present').toLowerCase()}`} key={item.id}><span>{index+1}</span><div className="person-cell"><i>{item.name.split(' ').map((part)=>part[0]).slice(0,2).join('')}</i><div><strong>{item.name}</strong><small>{item.id}</small></div></div><span>{tab==='staff'?(item.designation||item.subject):`Roll ${item.roll}`}</span><select value={activeDraft[item.id]||'Present'} onChange={(event)=>tab==='staff'?setStaffDraft({...staffDraft,[item.id]:event.target.value}):setStudentDraft({...studentDraft,[item.id]:event.target.value})}><option>Present</option><option>Absent</option><option>Leave</option></select></div>)}</div></>}
    {tab==='report'&&<><div className="record-summary"><div><span>Month</span><strong>September 2026</strong></div><div><span>Student records</span><strong>{monthlyRows.length}</strong></div><div><span>Below 75%</span><strong>{monthlyRows.filter((row)=>row.percentage<75).length}</strong></div><div><span>Report format</span><strong>CSV</strong></div></div><div className="table-card"><table><thead><tr><th>Student</th><th>Class</th><th>Working days</th><th>Present</th><th>Absent</th><th>Leave</th><th>Attendance</th></tr></thead><tbody>{monthlyRows.map((row)=><tr key={row.id}><td><strong>{row.name}</strong><small className="block">{row.id}</small></td><td>{row.className}</td><td>{row.workingDays}</td><td>{row.present}</td><td>{row.absent}</td><td>{row.leave}</td><td><strong className={row.percentage<75?'text-amber':'text-green'}>{row.percentage}%</strong></td></tr>)}</tbody></table></div></>}
  </>;
}

function PortalNotices(props) { return <NoticeWorkspace {...props} PageTitle={PageTitle} Modal={Modal}/>; }

function Queries(props) { return <QueryWorkspace {...props} PageTitle={PageTitle} Modal={Modal}/>; }

function GalleryAdmin({notify}) { return <><PageTitle title="Gallery management" body="Curate approved photographs for the public school website." actions={<button className="btn btn-primary" onClick={()=>notify('Upload area opened in prototype')}>+ Upload photos</button>}/><div className="admin-gallery"><figure><img src={schoolPhoto} alt="School campus"/><figcaption><strong>School campus</strong><span>Published · Home & gallery</span></figcaption></figure><figure><img src={schoolPhotoAlt} alt="School learning spaces"/><figcaption><strong>Learning spaces</strong><span>Published · Gallery</span></figcaption></figure><div className="gallery-upload" onClick={()=>notify('Select approved school photos to upload')}><Icon name="image" size={30}/><strong>Add approved photographs</strong><span>JPG or PNG · max 5 MB</span></div></div><div className="security-banner"><Icon name="user"/><div><strong>Student privacy</strong><span>Publish student photographs only after confirming school consent and removing sensitive information.</span></div></div></>; }

const nextAcademicYear=(session='2026-27')=>{const match=String(session).match(/^(\d{4})-(\d{2})$/);if(!match)return session;const start=Number(match[1])+1;return `${start}-${String((start+1)%100).padStart(2,'0')}`;};

function AcademicYearManager({role,data,update,notify}) {
  const year=data.academicYear||INITIAL_ERP.academicYear;
  const [reversalReason,setReversalReason]=useState('');
  const awaiting=data.students.filter((student)=>student.sessionStatus==='Awaiting progression').length;
  const active=data.students.filter((student)=>student.visibleInSession!==false&&student.status!=='Passed out').length;
  const canReverse=['admin','headmaster'].includes(role)&&Boolean(year.closedAt||year.transitionFrom);
  const closeYear=()=>{if(role!=='admin'||year.status!=='Open')return;if(year.reversalRequest)return notify('Resolve the pending reversal request first');update('academicYear',()=>({...year,status:'Closed',closedAt:'20-09-2026 09:15 PM',progressionOpen:false,reversalRequest:null}),{action:'UPDATE',record:year.current,detail:'Academic year closed by Admin'});notify(`${year.current} closed. Start ${year.next} to enable progression.`);};
  const startYear=()=>{if(role!=='admin'||year.status!=='Closed')return;if(year.reversalRequest)return notify('Resolve the pending reversal request first');const newCurrent=year.next;update('students',(students)=>students.map((student)=>student.status==='Passed out'?student:{...student,sessionTransitionBackup:{className:student.className,roll:student.roll,status:student.status,visibleInSession:student.visibleInSession,sessionStatus:student.sessionStatus,academicYear:student.academicYear,previousClassName:student.previousClassName,previousAcademicYear:student.previousAcademicYear,progressedAt:student.progressedAt},previousClassName:student.className,visibleInSession:false,sessionStatus:'Awaiting progression',previousAcademicYear:year.current}),{action:'UPDATE',record:newCurrent,detail:'Existing students moved to progression queue with a reversible snapshot'});update('academicYear',()=>({current:newCurrent,next:nextAcademicYear(newCurrent),status:'Progression pending',closedAt:year.closedAt,startedAt:'20-09-2026 09:20 PM',progressionOpen:true,transitionFrom:year.current,reversalRequest:null}),{action:'INSERT',record:newCurrent,detail:'New academic year started by Admin'});notify(`${newCurrent} started. Students will appear only after progression.`);};
  const complete=()=>{if(role!=='admin')return;if(awaiting)return notify(`${awaiting} student records are still awaiting progression`);update('academicYear',(current)=>({...current,status:'Open',progressionOpen:false}),{action:'UPDATE',record:year.current,detail:'Progression completed and academic year opened'});notify(`${year.current} progression completed; academic year is now open`);};
  const requestReversal=()=>{if(year.reversalRequest)return;const reason=reversalReason.trim();if(!canReverse)return notify('No ended academic year is available to reverse');if(!reason)return notify('Reversal reason is required');const request={requestedBy:roleConfig[role].name,requestedRole:role,requestedAt:approvalTimestamp(),reason,approvals:{admin:role==='admin',headmaster:role==='headmaster'}};update('academicYear',(current)=>({...current,reversalRequest:request,reversalDecision:null}),{action:'REQUEST',record:year.transitionFrom||year.current,detail:`Academic year reversal requested by ${roleConfig[role].name}; ${role} approval recorded. Reason: ${reason}`});setReversalReason('');notify(`Reversal request recorded; ${role==='admin'?'Headmaster':'Admin'} approval is pending`);};
  const approveReversal=()=>{if(!canReverse||!year.reversalRequest||!canDecideApproval(year.reversalRequest.approvals,role))return;const approvals={admin:false,headmaster:false,...year.reversalRequest?.approvals,[role]:true};update('academicYear',(current)=>({...current,reversalRequest:{...current.reversalRequest,approvals}}),{action:'APPROVE',record:year.transitionFrom||year.current,detail:`Academic year reversal approved by ${roleConfig[role].name} (${role})`});if(!(approvals.admin&&approvals.headmaster)){notify(`Your approval is recorded; ${role==='admin'?'Headmaster':'Admin'} approval is still pending`);return;}const restoredYear=year.transitionFrom||year.current;if(year.transitionFrom){update('students',(students)=>students.map((student)=>{if(student.sessionTransitionBackup){const {sessionTransitionBackup,...record}=student;return{...record,...sessionTransitionBackup};}return student.academicYear===year.current?{...student,visibleInSession:false,sessionStatus:'Future session record'}:student;}),{action:'REVERSE',record:restoredYear,detail:`Student session state restored after Admin and Headmaster approvals. Reason: ${year.reversalRequest?.reason||'Not recorded'}`});}update('academicYear',(current)=>({...current,current:restoredYear,next:year.transitionFrom?year.current:current.next,status:'Open',closedAt:'',startedAt:'',progressionOpen:false,transitionFrom:'',reversalRequest:null}),{action:'REVERSE',record:restoredYear,detail:`Academic year end reversed after separate Admin and Headmaster approvals. Reason: ${year.reversalRequest?.reason||'Not recorded'}`});notify(`Academic year restored to ${restoredYear} after both approvals`);};
  const rejectReversal=(reason)=>{if(!reason.trim()||!canReverse||!year.reversalRequest||!canDecideApproval(year.reversalRequest.approvals,role))return;update('academicYear',(current)=>({...current,reversalRequest:null,reversalDecision:{...current.reversalRequest,status:'Rejected',by:role,reason,at:approvalTimestamp()}}),{action:'REJECT',record:year.current,detail:`Academic year reversal rejected by ${roleConfig[role].name}. Reason: ${reason}. Session and student records unchanged.`});notify('Reversal rejected; academic year and student records unchanged');};
  return <><PageTitle eyebrow={role==='admin'?'Admin control':'Headmaster approval'} title="Academic year control" body={role==='admin'?'Close the current year, start the next year and unlock student progression in the required order.':'Review and approve an academic-year reversal request. Close, start and progression controls remain Admin-only.'}/>
    <div className="metrics three"><Metric label="Current academic year" value={year.current} detail={year.status} tone="blue" icon="calendar"/><Metric label="Active students" value={active} detail="Visible in current session" tone="green" icon="users"/><Metric label="Awaiting progression" value={awaiting} detail={year.progressionOpen?'Progression enabled':'Progression locked'} tone="amber" icon="up"/></div>
    <section className="content-card academic-year-flow"><div className={year.status==='Open'?'current':'done'}><span>1</span><div><strong>Close {year.current}</strong><p>Stops session changes and prepares the next academic year.</p></div><button className="btn btn-secondary" disabled={role!=='admin'||year.status!=='Open'} onClick={closeYear}>{role!=='admin'?'Admin only':year.status==='Open'?'Close academic year':'Closed'}</button></div><div className={year.status==='Closed'?'current':year.startedAt?'done':''}><span>2</span><div><strong>Start {year.next}</strong><p>Switches ERP to the new year and hides old students until progression.</p></div><button className="btn btn-secondary" disabled={role!=='admin'||year.status!=='Closed'} onClick={startYear}>{role!=='admin'?'Admin only':'Start new academic year'}</button></div><div className={year.progressionOpen?'current':year.status==='Open'&&year.startedAt?'done':''}><span>3</span><div><strong>Complete progression</strong><p>Promote, repeat or pass-out every queued student before opening the session.</p></div><button className="btn btn-primary" disabled={role!=='admin'||!year.progressionOpen||awaiting>0} onClick={complete}>{role!=='admin'?'Admin only':'Complete progression'}</button></div></section>
    {canReverse&&<section className="content-card reversal-card"><div className="card-head"><div><span className="eyebrow">Protected reversal</span><h3>Reverse academic year end</h3></div><Status>{year.reversalRequest?'Approval pending':'Two approvals required'}</Status></div>{year.reversalRequest?<><p><strong>Reason:</strong> {year.reversalRequest.reason}</p><div className="approval-grid"><span>Admin <b>{year.reversalRequest.approvals?.admin?'Approved':'Pending'}</b></span><span>Headmaster <b>{year.reversalRequest.approvals?.headmaster?'Approved':'Pending'}</b></span></div><RejectApproval disabled={!canDecideApproval(year.reversalRequest.approvals,role)} onReject={rejectReversal} label="Reject reversal"/><button className="btn btn-primary" disabled={!canDecideApproval(year.reversalRequest.approvals,role)} onClick={approveReversal}>{year.reversalRequest.approvals?.[role]?'Your approval recorded':'Approve reversal'}</button></>:<><p>{year.reversalDecision?.status==='Rejected'&&<>Last request rejected by {year.reversalDecision.by}: {year.reversalDecision.reason}<br/></>}Use only when the year was ended by mistake. Student session data will be restored from the saved transition snapshot.</p><label>Reason for reversal<textarea value={reversalReason} onChange={(event)=>setReversalReason(event.target.value)} placeholder="Explain why the academic year end must be reversed"/></label><button className="btn btn-secondary danger" disabled={!reversalReason.trim()} onClick={requestReversal}>Request reversal</button></>}</section>}
    <div className="security-banner"><Icon name="check"/><div><strong>Protected academic-year transition</strong><span>Only Admin can close/start the year. Reversal requires separate Admin and Headmaster approvals, and every step is written to Audit Log.</span></div></div>
  </>;
}

function Progression({data,update,notify}) {
  const year=data.academicYear||INITIAL_ERP.academicYear;
  const [checked,setChecked]=useState([]);
  const [action,setAction]=useState('Promote');
  const [classFilter,setClassFilter]=useState('All');
  const candidates=data.students.filter((student)=>student.sessionStatus==='Awaiting progression'&&(classFilter==='All'||String(examClassNumber(student.previousClassName||student.className))===classFilter));
  const destination=(student)=>{const grade=examClassNumber(student.previousClassName||student.className);if(action==='Repeat')return student.previousClassName||student.className;if(action==='Pass out'||grade===10||grade===12)return 'Passed out';return String(student.previousClassName||student.className).replace(/^9(?=\D|$)/,'10').replace(/^11(?=\D|$)/,'12');};
  const apply=()=>{if(!year.progressionOpen)return notify('Close the old year and start the new academic year first');update('students',(students)=>students.map((student)=>{if(!checked.includes(student.id))return student;const next=destination(student);const passedOut=next==='Passed out';return{...student,className:passedOut?student.previousClassName||student.className:next,roll:passedOut?student.roll:'—',status:passedOut?'Passed out':'Active',visibleInSession:!passedOut,sessionStatus:passedOut?'Passed out':action==='Repeat'?'Repeated':'Progressed',academicYear:year.current,progressedAt:'20-09-2026'};}),{action:'UPDATE',record:`${checked.length} students`,detail:`Academic progression: ${action}`});update('progressionHistory',(items=[])=>[{id:Date.now(),academicYear:year.current,action,count:checked.length,studentIds:checked},...items]);notify(`${checked.length} student record${checked.length===1?'':'s'} updated as ${action}`);setChecked([]);};
  if(!year.progressionOpen)return <><PageTitle eyebrow="Admin only" title="Student progression" body="This module unlocks only after Academic Year Close and New Year Start."/><div className="warning-banner"><span>!</span><div><strong>Progression is locked</strong><p>Open Academic year, close {year.current}, and start {year.next}. Until then no student can be promoted, repeated or passed out.</p></div></div><div className="content-card empty-state">Academic year transition is required before progression.</div></>;
  return <><PageTitle eyebrow="Admin only" title="Student progression" body={`Process students for academic year ${year.current}. Only processed students become visible in the new session.`} actions={<button className="btn btn-primary" disabled={!checked.length} onClick={apply}>Apply {action} ({checked.length})</button>}/><div className="progression-setup"><label>New session<input value={year.current} readOnly/></label><label>Previous class<select value={classFilter} onChange={(event)=>{setClassFilter(event.target.value);setChecked([]);}}><option value="All">All classes</option><option value="9">Class IX</option><option value="10">Class X</option><option value="11">Class XI</option><option value="12">Class XII</option></select></label><span><Icon name="arrow"/></span><label>Action<select value={action} onChange={(event)=>setAction(event.target.value)}><option>Promote</option><option>Repeat</option><option>Pass out</option></select></label><label>Queued students<input value={candidates.length} readOnly/></label></div><div className="table-card"><table><thead><tr><th><input type="checkbox" checked={checked.length===candidates.length&&candidates.length>0} onChange={(event)=>setChecked(event.target.checked?candidates.map((student)=>student.id):[])}/></th><th>Student</th><th>Previous class</th><th>Result action</th><th>New status</th></tr></thead><tbody>{candidates.map((student)=><tr key={student.id}><td><input type="checkbox" checked={checked.includes(student.id)} onChange={()=>setChecked((items)=>items.includes(student.id)?items.filter((id)=>id!==student.id):[...items,student.id])}/></td><td><div className="person-cell"><span>{student.name.split(' ').map((part)=>part[0]).slice(0,2).join('')}</span><div><strong>{student.name}</strong><small>{student.id}</small></div></div></td><td>{student.previousClassName||student.className}</td><td>{action}</td><td><strong>{destination(student)}</strong></td></tr>)}</tbody></table>{!candidates.length&&<div className="empty-state">No students are awaiting progression in this filter.</div>}</div></>;
}

function StudentProfile({data,navigate}) {
  const student=data.students.find((item)=>item.id==='UHS-260207')||INITIAL.students[1];
  return <><PageTitle title="My profile" body="Your approved school profile is read-only in the Student workspace." actions={<button className="btn btn-primary" onClick={()=>navigate('queries')}>Request a correction</button>}/><div className="student-read-only"><Icon name="check"/><div><strong>Read-only student view</strong><span>Submit a correction request if any personal detail is inaccurate. The school will verify supporting records before changing it.</span></div></div><div className="profile-layout"><section className="content-card profile-head"><span className="profile-avatar">SP</span><h2>{student.name}</h2><p>{student.id} · Class {student.className} · Roll {student.roll}</p><Status>{student.status||'Active student'}</Status></section><section className="content-card profile-details"><div className="card-head"><div><span className="eyebrow">Student details</span><h3>Personal information</h3></div></div><div className="review-grid"><div><span>Father / guardian</span><strong>{student.guardian||'Not recorded'}</strong></div><div><span>Mother</span><strong>{student.mother||'Not recorded'}</strong></div><div><span>Date of birth</span><strong>{student.dob||'Not recorded'}</strong></div><div><span>Admission date</span><strong>{student.admission||'Not recorded'}</strong></div><div><span>Mobile</span><strong>{student.mobile||'Not recorded'}</strong></div><div><span>Address</span><strong>{student.address||'Not recorded'}</strong></div></div><div className="protected-card"><Icon name="user"/><div><strong>Government student identifiers are protected</strong><p>PEN, APAAR and E-ShikshaKosh IDs can only be viewed or edited by an authorised school administrator.</p></div></div></section></div></>;
}

function Settings({reset,notify}) { return <><PageTitle title="Account & security" body="Prototype preferences and session controls."/><div className="settings-grid"><section className="content-card"><h3>Security</h3><p>Production accounts will use secure password hashing, server-side sessions, permission checks and logged administrative actions.</p><button className="btn btn-secondary" onClick={()=>notify('Password flow validated in prototype')}>Change password</button></section><section className="content-card"><h3>Reset demo data</h3><p>Restore registrations, fees, leave requests, queries and notices to their original sample state.</p><button className="btn btn-secondary danger" onClick={()=>{reset();notify('Prototype data reset');}}>Reset prototype</button></section></div></>; }

export default function App() {
  const {data,update,reset}=usePersistentState(); const [surface,setSurface]=useState('public'); const [role,setRole]=useState(null); const [toast,setToast]=useState('');
  const notify=(message)=>{setToast(message);window.clearTimeout(window.__uhsToast);window.__uhsToast=window.setTimeout(()=>setToast(''),3200);};
  const login=(nextRole)=>{setRole(nextRole);setSurface('portal');notify(`Signed in as ${nextRole}`);};
  const trackedUpdate=(key,fn,meta={})=>{update(key,fn);if(role&&key!=='auditLogs'){const actor=roleConfig[role];update('auditLogs',(rows=[])=>[{id:Date.now()+Math.random(),dateTime:approvalTimestamp(),user:actor.name,role:role[0].toUpperCase()+role.slice(1),action:meta.action||'UPDATE',module:key[0].toUpperCase()+key.slice(1),record:meta.record||'Record',detail:meta.detail||`${key} data changed`},...rows]);}};
  const visibleData={...data,teachers:data.teachers.filter(item=>!item.deletedAt),staffIdentifiers:data.teachers.map(({id,userId,email})=>({id,userId,email})),notices:noticesForAudience(data.notices,surface==='portal'?role:'public')};
  return <><Toast message={toast}/>{surface==='public'&&<PublicSite onPortal={()=>setSurface('login')} data={visibleData} update={update} notify={notify}/>} {surface==='login'&&<Login onLogin={login} onBack={()=>setSurface('public')}/>} {surface==='portal'&&<Portal role={role} onLogout={()=>{setRole(null);setSurface('public');}} data={visibleData} update={trackedUpdate} reset={reset} notify={notify}/>}</>;
}
