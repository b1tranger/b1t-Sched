<!--
tags: [chat-archive, pending-tasks, old-tasks, firebase-id, task-editing, deadlines, profile, user-roles, admin-preview, preview-mode, session-storage, faculty-customization, auto-minimize, meetings-type, dpthead, faculty, department-notices, notice-modals, dptcoor, department-coordinator, faq, role-permissions, user-management, make-dptcoor, admin-controls, faculty-promotion, faculty-signup, approvals-modal, approvals-sidebar, cr-approvals-notice, unapproved-state, theme-styling, dark-mode, gray-mode, mobile-overlay-fix, bookmark-toggle-position, approvals-button, desktop-ui, button-padding, button-elevation, visual-hierarchy, icon-only-button, floating-action-button, notice-modal, bug-fix, routing-scoping, homescreen-only, role-preview, faculty-preview, student-preview, visibility-fix, loader-fix, firestore-index, client-sorting, error-handling, faculty-notices]
-->

# Session Summary - 34. Firebase Task ID, Admin Role Preview Mode, Approvals & Department Notices

## Metadata
- **Session Index**: 34
- **Session Title**: Firebase Task ID, Admin Role Preview Mode, Approvals & Department Notices
- **Current Version**: `v2.52.5 to v2.52.9`
- **Date**: August - September 2026

---

## User Goals & Directives
1. **Firebase Task ID Display**: In Pending Tasks cards, render the Firestore task ID whenever the user expands "Show more".
2. **Editable Old Tasks**: Allow editing past-deadline tasks (e.g. extending deadlines, modifying instructions) directly from the Old Tasks view.
3. **Admin Role Preview Mode**: Enable Admins to preview the application as Student, CR, Faculty, Department Coordinator (DptCoor), or Department Head (DptHead) via a persistent session preview banner.
4. **Faculty Registration & Account Approvals**: Implement self-registration for faculty members with an approval workflow managed by Admins and Department Coordinators.
5. **Department Notices**: Scoped notice querying and security rules ensuring department-wide notices are properly indexed and rendered.

---

## Key Technical Decisions & Architecture
1. **Task Card Metadata Expansion**:
   - Rendered monospace Firestore document ID inside the collapsible details footer with copy-to-clipboard functionality.
2. **Old Tasks Edit Handler**:
   - Extended `openEditTaskModal()` to support tasks retrieved from the historical archive, updating Firestore and repositioning tasks into active lists if the deadline is extended.
3. **Session-Scoped Admin Preview Engine**:
   - Added `sessionStorage` persistence for preview role state (`previewRole`, `previewDept`, `previewSem`, `previewSection`).
   - Implemented top fixed indicator banner (`#admin-preview-banner`) with an Exit Preview button.
4. **Faculty Account Approvals Workflow**:
   - Created `js/approvals.js` managing pending faculty registrations.
   - Updated `firestore.rules` allowing Admins and DptCoor to approve faculty accounts within their department.

---

## Files Modified & Created
- `js/app.js` (Task card rendering, old tasks edit handler, preview mode state)
- `js/ui.js` (Task card metadata, admin preview banner)
- `js/approvals.js` (Account approvals modal and review actions)
- `js/notice.js` (Department notice indexing and query scoping)
- `firestore.rules` (Approvals collection and department notice rules)
- `index.html` & `css/main.css` (Approvals modal markup and preview banner styles)

---

## Verification
- Verified task ID appears and copies correctly from expanded task cards.
- Verified editing old tasks with future deadlines moves them back to Pending Tasks.
- Verified Admin Role Preview Mode updates visible controls dynamically.
- Verified faculty self-registration blocks unapproved logins and approvals elevate roles immediately.
