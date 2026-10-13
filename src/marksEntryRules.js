import { examClassNumber, examStream } from './examRules.js';
export const sectionOf = (record) => String(record.section || String(record.className || record.classes || '').match(/[-–]\s*([A-Z])\s*$/i)?.[1] || '').trim().toUpperCase();

export function normalizeSubjectName(subject = '') {
  const normalized = String(subject).trim().replace(/\s+/g, ' ').toLowerCase();
  const aliases = {
    maths: 'mathematics',
    'social studies': 'social science',
    sst: 'social science',
  };
  return aliases[normalized] || normalized;
}

export const sameSubject = (left, right) => normalizeSubjectName(left) === normalizeSubjectName(right);

export function classNameForAssignment(assignment = {}, section = assignment.section) {
  const grade = examClassNumber(assignment.className);
  const stream = assignment.stream || examStream(assignment.className);
  if (!grade) return '';
  return `${grade}${grade >= 11 && stream && stream !== 'Not applicable' ? ` ${stream}` : ''}${section ? `-${String(section).trim().toUpperCase()}` : ''}`;
}

export function assignmentMatchesClass(assignment = {}, className = '') {
  const grade = examClassNumber(className);
  if (!grade || examClassNumber(assignment.className) !== grade) return false;
  if (grade >= 11 && (assignment.stream || examStream(assignment.className)) !== examStream(className)) return false;
  const sections = assignment.sections?.length ? assignment.sections : [assignment.section];
  return !sections.filter(Boolean).length || sections.map((value) => String(value).trim().toUpperCase()).includes(sectionOf({ className }));
}

export function examMatchesClass(exam = {}, className = '') {
  const grade = examClassNumber(className);
  if (!grade || examClassNumber(exam.classes || exam.classNumber) !== grade) return false;
  if (grade >= 11 && (exam.stream || examStream(exam.classes)) !== examStream(className)) return false;
  return Boolean(exam.isBatch) || !sectionOf(exam) || sectionOf(exam) === sectionOf({ className });
}

export function preferredMarksExam(exams = []) {
  const score = (exam) => {
    if (exam.deletionRequest || exam.resultStatus === 'Correction approval') return 50;
    if (exam.status === 'Active' && exam.resultStatus === 'Draft') return 0;
    if (exam.status === 'Active' && exam.resultStatus === 'Not started') return 1;
    if (exam.resultStatus === 'Submitted') return 2;
    if ((exam.status === 'Active' || exam.status === 'Completed') && exam.resultStatus !== 'Published') return 3;
    if (exam.status === 'Scheduled') return 10;
    if (exam.resultStatus === 'Published') return 20;
    return 30;
  };
  return [...exams].sort((left, right) => score(left) - score(right))[0];
}

export function studentsForExam(students, exam) {
  if (!exam) return [];
  const grade = examClassNumber(exam.classes || exam.classNumber);
  const stream = exam.stream || examStream(exam.classes);
  const section = sectionOf(exam);
  return students.filter(student => student.visibleInSession !== false && student.status !== 'Passed out' && examClassNumber(student.className) === grade && (grade < 11 || (student.stream || examStream(student.className)) === stream) && (!section || sectionOf(student) === section)).sort((a,b)=>Number(a.roll)-Number(b.roll));
}
export function validateMarks(students, marks, rule, complete=false) {
  if (!students.length) return 'No eligible students found. Check class, section and academic-year progression.';
  for (const student of students) {
    for (const [key,max] of [['theory',rule.theoryMax],...(rule.componentMax?[['component',rule.componentMax]]:[])]) {
      const value=marks[student.id]?.[key];
      if (value === '' || value == null) { if(complete)return `Enter all marks for ${student.name} before completing this paper.`; continue; }
      if (!Number.isFinite(Number(value)) || Number(value)<0 || Number(value)>max) return `${student.name}: marks must be between 0 and ${max}.`;
    }
  }
  return '';
}
