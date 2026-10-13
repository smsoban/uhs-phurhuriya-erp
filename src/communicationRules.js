export function noticesForAudience(notices, role = 'public') {
  if (['admin', 'headmaster'].includes(role)) return notices;
  return notices.filter(notice => (notice.status || 'Published') === 'Published' && (
    !notice.audience || notice.audience === 'Everyone' ||
    (notice.audience === 'Students' && role === 'student') ||
    (notice.audience === 'Staff' && ['teacher', 'clerk'].includes(role))
  ));
}

export function queriesForUser(queries, role, student) {
  if (['admin', 'headmaster'].includes(role)) return queries;
  if (role !== 'student' || !student) return [];
  return queries.filter(query => query.studentId === student.id ||
    (!query.studentId && student.id === 'UHS-260207' && query.from === 'Sana Parveen · IX-A'));
}

export function resultStudentsForRole(students, role, studentId) {
  if (role === 'student') return students.filter(student => student.id === studentId);
  return ['admin', 'headmaster', 'clerk', 'teacher'].includes(role) ? students : [];
}

export function schoolDate() {
  return new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Kolkata', day:'2-digit', month:'2-digit', year:'numeric'}).format(new Date()).replaceAll('/', '-');
}
