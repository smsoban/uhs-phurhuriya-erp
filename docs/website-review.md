# UHS Phurhuriya website review — 27 September 2026

## Follow-up update

The next update fixes the client-side Student result/export roster and query visibility. Published class results for Teachers now require a Class Teacher assignment; unpublished Teacher report columns are limited to allotted papers. These are prototype interface checks, not server authorization.

Admin and Headmaster can create, edit, draft and publish notices using entered values. Audience filtering hides drafts and staff/student-only notices from public pages. Student queries preserve their actual subject/message; Admin and Headmaster can read, reply and change status. Public contact submissions preserve the message and mobile number. New communication dates use DD-MM-YYYY in Asia/Kolkata.

Targeted audience, missing-identity and export-scope checks passed. Student result/query and Headmaster notice components render successfully. Real authentication, shared storage, Gallery upload, password changes and date-aware attendance remain pending. The original findings below describe the pre-update review; notice/query and client export items have now been addressed as above.

Scope: current private Site, active React application and all role destinations. This is a source and rendering review, not a certification of production security or a complete interactive browser test. The older Node/MongoDB pages in the repository are not the application's active entry point.

## Navigation changes in this update

| Workspace | Groups |
| --- | --- |
| Admin / Headmaster | Students; Academics; Staff; Finance; Communication; Administration |
| Clerk | Students; Academics; Finance; Communication |
| Teacher | My teaching; My workspace; Communication |
| Student | My studies; My fees; Communication |

Dashboard remains a direct destination. Account & security and Sign out remain at the bottom. Grouping retains every existing role-specific destination. Admin-only progression, role/password controls and Audit Log remain absent from Headmaster and other menus. Headmaster retains academic-year approval.

Students contains records, new entry, application review and BSEB registration. Academics contains examinations, routine, attendance, teacher assignments, subject settings and classes/sections. Staff contains profiles and leave. Finance contains the existing fee workspace, including payment, structure and receipt tabs. Communication contains notices, queries and gallery. Administration contains session management and the existing Admin-only controls.

Menu search supports destination names and familiar terms such as marks, receipt, timetable, promotion and Hindi equivalents. The old inactive header search now opens this search; the bell opens Notices. The header shows the current category and page. The sidebar opens the selected page's group, supports keyboard navigation and has a mobile drawer with focus containment.

Public navigation now uses Home, Our school, Academics, Updates and Contact. Existing registration, application tracking, results/downloads, teachers, facilities, events and gallery pages remain reachable. The header reads the current academic session from ERP state.

## Review findings and next priorities

| Priority | Area | Evidence in the current application | Recommended next work |
| --- | --- | --- | --- |
| Essential before real school use | Shared data and accounts | `usePersistentState` stores records in browser localStorage. `Login` accepts fixed demo identities; staff roles/password changes are not tied to a real authentication service. | Connect the active application to durable shared storage and real accounts, then enforce permissions on the server. Add backup and recovery before importing real records. |
| Essential before real school use | Student privacy and export scopes | Published result tables filter the visible student row, but batch exports and combined marksheet selection still use the class roster. Queries use a shared list. Some teacher screens use a fixed demo teacher/class. | Enforce identity-based read/export scope for every role, including downloads and queries. Validate Class Teacher and subject-teacher access separately. |
| High | Notices, queries and gallery | Notice and query submission handlers use fixed sample text; some Edit/View controls have no action. Gallery upload displays a prototype message. Headmaster notice/query management does not match Admin. | Save actual form values; implement edit/view/reply/upload; align Admin/Headmaster operational rights. |
| High | Password and account controls | Password reset/change buttons show messages instead of changing authentication credentials. Demo reset is available under every role's settings. | Implement authenticated password change/reset and first-login change; restrict demo reset and remove it from production. |
| High | Calendar and attendance | Attendance has a fixed date/month, several dashboard counts and student timetable entries are samples, and academic-year actions contain fixed timestamps. | Use school-local current dates, selectable reporting months, saved attendance/routine data and generated timestamps throughout. |
| High | Demo migrations | Loading stored data merges missing initial students/exams back into the saved data. | Introduce versioned, one-time migrations so deleted demo records do not reappear and historical sessions remain stable. |
| Medium | Data validation and audit durability | Most flows run in a single browser state; audit records can be reset with that state. | Validate duplicate IDs/receipts and concurrent changes on the server. Preserve approval decisions and audit history independently of editable records. |
| Medium | Reports and accessibility | Fee/marks PDF generation, CSV workflows and responsive rules exist; many older page labels are still small. | Validate representative downloaded documents and CSV round-trips with real-format sample data. Continue readable typography, form labels and keyboard checks across individual modules. |

Existing exam stages, student-wise marks entry, fee structure/receipt flow, independent teacher assignments, routine rescheduling, leave, BSEB update and dual-approval screens are retained. Their presence in source does not establish that they are ready for simultaneous real-user use.

## Suggested order

1. Real accounts, shared data, backup and role-scoped exports.
2. Complete communication forms and password controls.
3. Remove fixed dates/dashboard samples and make reports session-aware.
4. Run end-to-end school scenarios on a separate test dataset, then import verified school data.

This release changes navigation and its directly related controls; the larger items above remain follow-up work. The Site must remain private during this work.

## Validation

- All existing destinations retained exactly once: Admin 21, Headmaster 18, Teacher 8, Clerk 9, Student 7 (including each dashboard).
- Five workspace shells and the public homepage render successfully. All 11 public destinations remain in the menu.
- Role-specific menu boundaries, empty search, receipt search and Hindi examination search passed targeted checks.
- Interactive browser verification was unavailable in this session; desktop/mobile layout and keyboard behavior still need a visual click-through.
