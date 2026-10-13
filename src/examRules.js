export const SECONDARY_SUBJECTS = [
  { name: 'MIL', label: 'MIL', fullMarks: 100 },
  { name: 'SIL', label: 'SIL', fullMarks: 100 },
  { name: 'Mathematics', label: 'Mathematics', fullMarks: 100 },
  { name: 'Science', label: 'Science', fullMarks: 80 },
  { name: 'Social Science', label: 'Social Science', fullMarks: 80 },
  { name: 'English', label: 'English', fullMarks: 100, excluded: true },
];

const languages = (start) => [
  ['English', start], ['Hindi', start + 1], ['Urdu', start + 2], ['Maithili', start + 3],
  ['Sanskrit', start + 4], ['Prakrit', start + 5], ['Magahi', start + 6],
  ['Bhojpuri', start + 7], ['Arabic', start + 8], ['Persian', start + 9],
  ['Pali', start + 10], ['Bangla', start + 11],
].map(([name, code]) => ({ name, code: String(code) }));

export const INTERMEDIATE_SUBJECT_CATALOG = {
  Arts: {
    'Compulsory Group 1': [{ name: 'English', code: '305' }, { name: 'Hindi', code: '306' }],
    'Compulsory Group 2': languages(305),
    Elective: [
      ['Music', 318], ['Home Science', 319], ['Philosophy', 320], ['History', 321],
      ['Political Science', 322], ['Geography', 323], ['Psychology', 324],
      ['Sociology', 325], ['Economics', 326], ['Mathematics', 327],
    ].map(([name, code]) => ({ name, code: String(code) })),
    Additional: [
      ['Yoga & Physical Education', 317], ['Music', 318], ['Home Science', 319],
      ['Philosophy', 320], ['History', 321], ['Political Science', 322],
      ['Geography', 323], ['Psychology', 324], ['Sociology', 325], ['Economics', 326],
      ['Mathematics', 327], ['Computer Science', 328], ['Multimedia & Web Technology', 329],
      ['English', 330], ['Hindi', 331], ['Urdu', 332], ['Maithili', 333],
      ['Sanskrit', 334], ['Prakrit', 335], ['Magahi', 336], ['Bhojpuri', 337],
      ['Arabic', 338], ['Persian', 339], ['Pali', 340], ['Bangla', 341],
    ].map(([name, code]) => ({ name, code: String(code) })),
  },
  Commerce: {
    'Compulsory Group 1': [{ name: 'English', code: '205' }, { name: 'Hindi', code: '206' }],
    'Compulsory Group 2': languages(205),
    Elective: [
      ['Business Studies', 217], ['Entrepreneurship', 218], ['Economics', 219], ['Accountancy', 220],
    ].map(([name, code]) => ({ name, code: String(code) })),
    Additional: [
      ['Business Studies', 217], ['Entrepreneurship', 218], ['Economics', 219],
      ['Accountancy', 220], ['Computer Science', 221], ['Multimedia & Web Technology', 222],
      ['English', 223], ['Hindi', 224], ['Urdu', 225], ['Maithili', 226],
      ['Sanskrit', 227], ['Prakrit', 228], ['Magahi', 229], ['Bhojpuri', 230],
      ['Arabic', 231], ['Persian', 232], ['Pali', 233], ['Bangla', 234],
    ].map(([name, code]) => ({ name, code: String(code) })),
  },
};

export const SCIENCE_STREAM_SUBJECTS = [
  { name: 'Hindi', code: '', group: 'Compulsory-1' },
  { name: 'English', code: '', group: 'Compulsory-2' },
  { name: 'Physics', code: '', group: 'Elective-1' },
  { name: 'Chemistry', code: '', group: 'Elective-2' },
  { name: 'Biology', code: '', group: 'Elective-3' },
  { name: 'Mathematics', code: '', group: 'Elective-3' },
  { name: 'Biology', code: '', group: 'Additional Subject' },
  { name: 'Mathematics', code: '', group: 'Additional Subject' },
  { name: 'Computer Science', code: '', group: 'Additional Subject' },
];

const practicalDefaults = new Set([
  'Physics', 'Chemistry', 'Biology',
  'Music', 'Home Science', 'Geography', 'Psychology', 'Entrepreneurship',
  'Computer Science', 'Multimedia & Web Technology', 'Yoga & Physical Education',
]);

export function defaultIntermediatePaperFormat(subject) {
  return practicalDefaults.has(subject) ? 'Theory 70 + Practical 30' : 'Theory 100';
}

export function examClassNumber(classes = '') {
  const value = String(classes).toUpperCase();
  const token=value.trim().match(/^(12|11|10|9|XII|XI|IX|X)(?=$|[^A-Z0-9])/);
  if(token)return ({IX:9,X:10,XI:11,XII:12})[token[1]]||Number(token[1]);
  return 0;
}

export function examStream(classes = '') {
  const value = String(classes).toLowerCase();
  if (value.includes('commerce')) return 'Commerce';
  if (value.includes('arts')) return 'Arts';
  if (value.includes('science')) return 'Science';
  return 'Not applicable';
}

export function subjectOptionsForClass(classes = '') {
  const grade = examClassNumber(classes);
  if (grade === 9 || grade === 10) return SECONDARY_SUBJECTS.map((item) => ({ ...item, group: 'Core', code: '' }));
  const stream = examStream(classes);
  if (INTERMEDIATE_SUBJECT_CATALOG[stream]) {
    return Object.entries(INTERMEDIATE_SUBJECT_CATALOG[stream]).flatMap(([group, subjects]) => subjects.map((subject) => ({ ...subject, group })));
  }
  return SCIENCE_STREAM_SUBJECTS.map((subject) => ({ ...subject }));
}

export function subjectOptionKey(subject = {}) {
  return `${subject.group || 'Core'}|${subject.name || ''}|${subject.code || ''}`;
}

export function defaultStudentSubjects(student = {}) {
  const grade = examClassNumber(student.className);
  const options = subjectOptionsForClass(student.className);
  if (grade === 9 || grade === 10) return options;
  if (examStream(student.className) === 'Science') {
    const preferred = {
      'Compulsory-1': 'Hindi',
      'Compulsory-2': 'English',
      'Elective-1': 'Physics',
      'Elective-2': 'Chemistry',
      'Elective-3': 'Mathematics',
    };
    return options.filter((subject) => preferred[subject.group] === subject.name);
  }
  const preferred = examStream(student.className) === 'Commerce'
    ? { 'Compulsory Group 1': 'Hindi', 'Compulsory Group 2': 'English', Elective: ['Business Studies', 'Economics', 'Accountancy'] }
    : { 'Compulsory Group 1': 'Hindi', 'Compulsory Group 2': 'English', Elective: ['History', 'Political Science', 'Geography'] };
  return options.filter((subject) => {
    const selection = preferred[subject.group];
    return Array.isArray(selection) ? selection.includes(subject.name) : selection === subject.name;
  });
}

export function getExamSubjectRule({ classes = '', examType = '', subject = '', subjectGroup = '', paperFormat = '' } = {}) {
  const grade = examClassNumber(classes);
  const cleanSubject = subject === 'Maths' ? 'Mathematics' : subject;
  if (grade === 9 || grade === 10) {
    const specialExam = (grade === 9 && /final/i.test(examType)) || (grade === 10 && /(sent.?up|setup)/i.test(examType));
    const science = cleanSubject === 'Science';
    const social = cleanSubject === 'Social Science';
    const hasComponent = specialExam && (science || social);
    const fullMarks = science || social ? (hasComponent ? 100 : 80) : 100;
    return {
      grade,
      fullMarks,
      theoryMax: science || social ? 80 : 100,
      componentMax: hasComponent ? 20 : 0,
      componentLabel: science ? 'Practical' : social ? 'Internal / Project' : '',
      passThreshold: Math.ceil(fullMarks * 0.30),
      theoryPassThreshold: 0,
      excludedFromAggregate: cleanSubject === 'English',
      affectsResult: cleanSubject !== 'English',
      ruleLabel: cleanSubject === 'English' ? '100 marks · not counted in aggregate or result' : `${fullMarks} marks · 30% required`,
    };
  }
  const split = paperFormat === 'Theory 70 + Practical 30';
  const additional = /additional/i.test(subjectGroup);
  return {
    grade,
    fullMarks: 100,
    theoryMax: split ? 70 : 100,
    componentMax: split ? 30 : 0,
    componentLabel: split ? 'Practical' : '',
    passThreshold: split ? 0 : 30,
    theoryPassThreshold: split ? 24 : 0,
    excludedFromAggregate: additional,
    affectsResult: !additional,
    ruleLabel: split ? 'Theory 70 + Practical 30 · minimum 24/70 in theory' : 'Theory 100 · minimum 30 marks',
  };
}

export function normalizeMark(raw) {
  if (raw && typeof raw === 'object') {
    const theory = raw.theory === '' || raw.theory === null || raw.theory === undefined ? null : Number(raw.theory);
    const component = raw.component === '' || raw.component === null || raw.component === undefined ? null : Number(raw.component);
    return { theory, component, total: (theory ?? 0) + (component ?? 0) };
  }
  const number = raw === '' || raw === null || raw === undefined ? null : Number(raw);
  return { theory: number, component: null, total: number ?? 0 };
}

export function evaluateMark(raw, rule) {
  const mark = normalizeMark(raw, rule);
  if (mark.theory === null) return { ...mark, status: 'Pending', passed: false };
  if (!rule.affectsResult) return { ...mark, status: 'Not counted', passed: true };
  const passed = rule.theoryPassThreshold ? mark.theory >= rule.theoryPassThreshold : mark.total >= rule.passThreshold;
  return { ...mark, status: passed ? 'Pass' : 'Fail', passed };
}
