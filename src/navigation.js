// Groups only organize the existing role-specific destinations.
const officeGroups = [
  ['students', 'Students', 'users', ['students', 'new-student', 'registrations', 'bseb', 'bonafide']],
  ['academics', 'Academics', 'exam', ['exams', 'routine', 'attendance', 'assignments', 'subject-settings', 'class-setup']],
  ['staff', 'Staff', 'teacher', ['teachers', 'leaves']],
  ['finance', 'Finance', 'wallet', ['fees']],
  ['communication', 'Communication', 'message', ['notices', 'queries', 'gallery']],
  ['administration', 'Administration', 'grid', ['academic-year', 'progression', 'access', 'audit']],
];

const personalGroups = {
  teacher: [
    ['teaching', 'My teaching', 'exam', ['students', 'exams', 'routine', 'attendance']],
    ['staff', 'My workspace', 'teacher', ['teachers', 'leaves']],
    ['communication', 'Communication', 'message', ['notices']],
  ],
  student: [
    ['studies', 'My studies', 'exam', ['profile', 'exams', 'attendance']],
    ['finance', 'My fees', 'wallet', ['fees']],
    ['communication', 'Communication', 'message', ['notices', 'queries']],
  ],
};

const keywords = {
  students: 'student records profile subject tag विद्यार्थी छात्र',
  'new-student': 'admission enrolment add student नामांकन',
  registrations: 'applications admission approval registration नामांकन',
  bseb: 'board registration update पंजीकरण',
  bonafide: 'bonafide certificate student proof प्रमाण पत्र bonafide प्रमाणपत्र',
  exams: 'exam examination marks entry result marksheet publish announce परीक्षा अंक परिणाम',
  routine: 'weekly timetable daily reschedule substitute routine समय सारणी',
  attendance: 'attendance reports present absent उपस्थिति',
  assignments: 'class teacher subject allotment marks entry assignment',
  'subject-settings': 'subjects theory practical compulsory elective additional विषय',
  'class-setup': 'class stream section कक्षा',
  teachers: 'teacher staff profile शिक्षक',
  leaves: 'leave request approve absence छुट्टी अवकाश',
  fees: 'fees payment receipt structure finance शुल्क रसीद',
  notices: 'notice announcement सूचना',
  queries: 'query questions help contact सवाल',
  gallery: 'gallery photos images',
  'academic-year': 'session academic year close start reverse approval सत्र',
  progression: 'student promotion pass out academic year',
  access: 'roles passwords reset permissions',
  audit: 'audit log history changes',
};

export function navigationGroups(role, destinations) {
  const available = new Map(destinations.map(item => [item[0], item]));
  return (personalGroups[role] || officeGroups).map(([id, label, icon, keys]) => ({
    id, label, icon, items: keys.filter(key => available.has(key)).map(key => available.get(key)),
  })).filter(group => group.items.length);
}

export function filterNavigation(groups, query) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return groups.map(group => ({...group, items: group.items.filter(([key, label]) =>
    words.every(word => `${group.label} ${label} ${keywords[key] || ''}`.toLocaleLowerCase().includes(word)),
  )})).filter(group => group.items.length);
}

export const publicNavigation = [
  {id: 'school', label: 'Our school', items: [['about', 'About the school'], ['teachers', 'Our teachers'], ['facilities', 'Facilities']]},
  {id: 'learning', label: 'Academics', items: [['academics', 'Classes & programmes'], ['results', 'Results & downloads'], ['admission', 'Registration & tracking']]},
  {id: 'updates', label: 'Updates', items: [['notices', 'Notices'], ['events', 'Events & achievements'], ['gallery', 'Photo gallery']]},
];
