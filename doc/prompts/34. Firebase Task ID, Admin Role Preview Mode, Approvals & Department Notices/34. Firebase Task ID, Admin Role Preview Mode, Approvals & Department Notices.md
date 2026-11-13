<!--
tags: [chat-archive, pending-tasks, old-tasks, firebase-id, task-editing, deadlines, profile, user-roles, admin-preview, preview-mode, session-storage, faculty-customization, auto-minimize, meetings-type, dpthead, faculty, department-notices, notice-modals, dptcoor, department-coordinator, faq, role-permissions, user-management, make-dptcoor, admin-controls, faculty-promotion, faculty-signup, approvals-modal, approvals-sidebar, cr-approvals-notice, unapproved-state, theme-styling, dark-mode, gray-mode, mobile-overlay-fix, bookmark-toggle-position, approvals-button, desktop-ui, button-padding, button-elevation, visual-hierarchy, icon-only-button, floating-action-button, notice-modal, bug-fix, routing-scoping, homescreen-only, role-preview, faculty-preview, student-preview, visibility-fix, loader-fix, firestore-index, client-sorting, error-handling, faculty-notices]
-->

# Chat Conversation - 34. Firebase Task ID, Admin Role Preview Mode, Approvals & Department Notices

Note: _This is a comprehensive record of the pair programming session covering Firebase Task ID display in Pending Tasks, editable Old Tasks, Admin Role Preview Mode, DptHead and DptCoor roles, Faculty self-registration and approvals system, and department notices indexing._

---

## Turn 1: . Firebase Task ID in Show More and Editable Old Tasks

## User Request
```
in @[d:\GitHub\[oU1TS]\b1t-Sched\js\app.js] the "Pending Tasks" cards should show the task id from firebase when "Show more" for each task card is expanded. 
the "Old Tasks" should allow editing the tasks for the same roles. And if the dates are changed to a later deadline then the task will reappear in the "Pending Tasks".
```

### Thinking
- Inspected the codebase to understand how Pending Tasks, description toggles, Firebase IDs, and Old Tasks modal work.
- In `js/ui.js` (`renderTaskCard`), inserted the Firebase Task ID (`task.id`) within `.task-description-wrapper` using class `.task-added-by-hidden`.
- In `css/components.css`, updated `.task-description-text.expanded ~ .task-added-by-hidden` to expand all hidden meta blocks (both "Added by" and "Task ID"). Added `.task-id-info` and `.task-id-code` with `user-select: all`.
- In `js/ui.js` (`renderOldTasks`), added role-based edit buttons for Admin and task creators (`task.addedBy === currentUserId`).
- In `js/app.js`:
  - Updated `oldTasksContainer` event delegation to intercept clicks on `.old-task-edit-btn` and open the edit modal.
  - Updated `openEditTaskModal(taskId)` to search across both `this.currentTasks` and `this.oldTasks`.
  - Updated `handleEditTask()` to reload `loadDashboardData()` and re-query `DB.getOldTasks()`, so extending the deadline moves the task from Old Tasks back to Pending Tasks in real-time.
  - Hardened `DB.getOldTasks()` in `js/db.js` for Faculty users.
- Updated documentation in `doc/DOCUMENTATION.md` and `changes.json`.

### AI Response
Implemented Firebase Task ID display in expanded Pending Tasks cards and enabled role-based editing for Old Tasks with automatic return to Pending Tasks when deadlines are updated.

---

## Turn 2: Admin Role Preview Mode

## User Request
```
show the current user role below the student id in @[d:\GitHub\[oU1TS]\b1t-Sched\js\profile.js] and a dropdown button beside the role only for admins "preview as" that will allow admins to interact the website as other roles. It should be temporary state that should not hinder regular operations, and in the next session the admin should return to their default view. When in other roles besides admin, the "role" status under hte student id should show a `(preview)` beside it. I am unsure about where to put the `exit preview` button in the website.
```

### Thinking
- Analyzed the requirements:
  1. Show current user role below Student ID in Profile Settings.
  2. Add "Preview as" dropdown beside the role only for Admins.
  3. Preview is a temporary session state (`sessionStorage`) that resets on next session / tab close.
  4. Non-admin preview roles show `(preview)` tag beside the role name.
  5. Placed `Exit Preview` controls on a floating top-centered global pill banner (`#admin-preview-banner`) accessible anywhere in the website, as well as an exit button inside Profile Settings.
- Modified:
  - `index.html`: Added `#admin-preview-banner` and `#profile-role-wrapper` with role badge, preview tag, and dropdown.
  - `css/dashboard.css`: Styled floating preview banner, preview tag, select dropdown, and dark/gray themes.
  - `js/ui.js`: Added `UI.updatePreviewBanner()`.
  - `js/app.js`: Added `realRoles` tracking, `applyPreviewRole()`, `exitPreview()`, and event handlers.
  - `js/profile.js`: Added `Profile.updateRoleDisplay()` and preview selector event listeners.
  - `changes.json` & `doc/DOCUMENTATION.md`: Documented changes under `# 02.09.26`.

### AI Response
Implemented user role status display in Profile Settings and an Admin "Preview as" role simulation system with temporary `sessionStorage` and a top floating Exit Preview banner.

---

## Turn 3: Admin Role Preview Banner Repositioning and 2-Line Dropdown Text

## User Request
```
@[d:\GitHub\[oU1TS]\b1t-Sched\doc\prompts\34.3 Admin Role Preview Mode.md]@[d:\GitHub\[oU1TS]\b1t-Sched\doc\prompts\34.4 Implementation Plan - Admin Role Preview Mode.md]@[d:\GitHub\[oU1TS]\b1t-Sched\doc\prompts\34.5 Walkthrough - Admin Role Preview Mode.md] 
- instead of "floating top-centered" banner for the premive mode, make it bottom centered for mobile, and bottom-right corner for desktop screens.
- make the dropdown menu button text 2 lines for "preview as"
```

### Follow-up Request 1
```
for mobile screens, hide the eye icon and "exit preview" text from "preview mode" banner. @[d:\GitHub\[oU1TS]\b1t-Sched\index.html:L1370] and @[d:\GitHub\[oU1TS]\b1t-Sched\index.html:L1371-L1377]  should be placed in 2 vertical rows instead of in a single line
```

### Follow-up Request 2
```
the preview banner should minimize as just the eye icon after showing for 3 seconds as the expanded view, being expandable again upon clicking on the eye icon. Only in the expanded view can the "exit preview" button be used.
```

### Follow-up Request 3
```
for the `faculty` users hide the `semester` and `section` dropdown selectors in @[d:\GitHub\[oU1TS]\b1t-Sched\js\profile.js] . What is the purpose of `Filter by Department` in `Pending Tasks` for faculty users? A faculty from `CSE` department should only be able  to see the tasks for `CSE` department. For faculties, the `Add New Task` modal should show "Course / Designation" And the placeholder should show "Task for a Faculty / Course". And a new type should be added in the dropdown selector: "Meetings"

make the eye icon button smaller, of similar height as the preview mode banner. The banner should be minimized as the eye icon button every 3 seconds after it has been expanded.
```

### Thinking
- Reviewed all requested updates:
  1. **Faculty Profile Form**:
     - Hidden `#profile-semester-group` and `#profile-section-group` when user is Faculty (real or in preview mode).
     - Removed `required` constraints so form submits smoothly with only Department.
  2. **Department Scoping for Faculty in Pending Tasks**:
     - Explained that Faculty tasks are already automatically scoped to their department in Firestore queries (`DB.getFacultyTasks(department)`), rendering the old client-side `#faculty-department-filter` redundant. Hidden the redundant filter.
  3. **Faculty Add/Edit Task Modals**:
     - Dynamically set Course field label to `"Course / Designation"` and placeholder to `"Task for a Faculty / Course"`.
     - Added new task type `"Meetings"` (`meetings`) in Add Task, Edit Task, and the Pending Tasks filter radio group with badge styling (`.task-type-badge.meetings`).
  4. **Eye Icon Button Size & 3-Second Auto-Minimize on Every Expansion**:
     - Minimized eye icon button sized to 34px (32px on mobile) matching the exact height of the expanded preview banner.
     - Scheduled a 3-second auto-minimize timer every time the banner is expanded (initially and upon clicking the eye icon).
- Updated files:
  - `index.html`: Added `"Meetings"` option to `#task-type`, `#edit-task-type`, and filter radio group; added IDs to profile form groups.
  - `js/profile.js`: Updated `renderFacultyProfileUI()`, `loadProfile()`, and `updateRoleDisplay()` to hide semester/section for faculty.
  - `js/app.js`: Customized Course label & placeholder for faculty in `openAddTaskModal()` and `openEditTaskModal()`; handled banner auto-minimize timer and mouseleave restart.
  - `js/ui.js`: Updated `minimizePreviewBanner()` to trigger 3s auto-collapse timer upon expansion.
  - `css/dashboard.css` & `css/components.css`: Adjusted minimized button dimensions and added `.task-type-badge.meetings` styling.
  - `doc/DOCUMENTATION.md` & `changes.json`: Documented changes under `# 02.09.26`.

### AI Response
Addressed all faculty customizations, answered the Department Filter question, added the "Meetings" task type, and tuned the eye icon button dimensions and 3-second auto-minimize timer.

---

## Turn 4: DptHead User Role and Faculty Department Notices

## User Request
```
create a new user role `DptHead` similar to `CR` for `Faculty` users. For faculty users the Notice modals @[d:\GitHub\[oU1TS]\b1t-Sched\js\notice.js]  should show `Department Notice` in place of `CR Notices`
```

### Thinking
- Analyzed requirements:
  1. **New Role `DptHead` (Department Head)**:
     - Equivalent to `CR` for Faculty users (faculty leadership role).
     - Full faculty privileges (department-wide, no semester/section requirements).
     - In `js/db.js`: Updated `getUserRoles(userId)` to return `isDptHead`, `getUserRole(userId)` to return `'DptHead'`, and `createTask` to assign `addedByRole = 'DptHead'`.
     - In `js/app.js`: Added `isDptHead` state property and included `'DptHead'` in `realRoles` and Admin `applyPreviewRole('DptHead')`.
     - In `js/profile.js`: Updated `updateRoleDisplay()`, `loadProfile()`, and `handleSaveProfile()` to support `DptHead` role badge (`.role-badge.dpthead`), display, and automatic semester/section hiding.
     - In `index.html`: Added `<option value="DptHead">DptHead</option>` to `#admin-preview-select`.
     - In `css/dashboard.css`, `css/components.css`, `css/calendar.css`: Styled `.role-badge.dpthead` and `.role-badge-dpthead` with distinct teal background and accent border.
  2. **Department Notices for Faculty & DptHead Users**:
     - For Faculty and DptHead users, the Notice modals (`#notice-modal`, `#add-cr-notice-modal`, `#edit-cr-notice-modal`, `#old-cr-notices-modal`) and mobile sidebar (`#notice-sidebar`) dynamically display `"Department Notices"` instead of `"CR Notices"` / `"Class Notices"`.
     - Added `updateNoticeTitles(isFacultyOrDptHead)` in `js/notice.js` and `js/cr-notice.js`.
     - In `js/cr-notice.js`: Updated `checkCROrAdmin()` to grant notice authoring permissions to Faculty and DptHead users. Subscribes and publishes notices on a department-wide level without requiring semester or section parameters.
  3. **Documentation & Changelog**:
     - Updated `doc/DOCUMENTATION.md` and `changes.json` under `# 02.09.26`.

### AI Response
Implemented the `DptHead` role and dynamic "Department Notices" across all Notice modals and mobile sidebars for Faculty and DptHead users.

---

## Turn 5: DptCoor Role Permissions and Role FAQ Updates

## User Request
```
`faculty` users should not be able to use `Add Department Notice` modal, they need to have the `DptHead` role for it. Also, rename the `DptHead` to `DptCoor` representing Department Coordinator, resembling a more flexible role as opposed to dept Heads. Update the FAQ section for all the role contexts in the home page section @index.html:L1877-L1971
```

### Thinking
- Analyzed the three core parts of the request:
  1. **Notice Creation Restriction for Faculty vs Coordinator**:
     - Regular `Faculty` users cannot use the `Add Department Notice` modal / button.
     - Only `DptCoor` (Department Coordinator) and `Admin` have permission to post, edit, or delete department notices (analogous to `CR` for section-level class notices).
     - In `js/cr-notice.js`: Updated `checkCROrAdmin()` so `.cr-only-notice` elements (Add Notice buttons) are only shown if `_isCR || _isDptCoor || _isAdmin`. Updated `submitNotice()` to reject submissions if the user lacks these roles.
  2. **Renaming `DptHead` to `DptCoor`**:
     - Renamed all identifiers, UI badges, role keys, and preview options from `DptHead` to `DptCoor` across `index.html`, `js/db.js`, `js/app.js`, `js/profile.js`, `js/notice.js`, `js/cr-notice.js`, `js/ui.js`, `css/dashboard.css`, `css/components.css`, and `css/calendar.css`.
     - Preserved backwards-compatibility fallbacks in database queries.
  3. **Updating the Home Page FAQ Section**:
     - Updated `#faq-section` in `index.html` to comprehensively explain all 6 role contexts (`Admin`, `DptCoor`, `Faculty`, `CR`, `Regular Student / User`, `Blocked`) with clear descriptions of task scopes, notice creation privileges, event management, and profile constraints.
  4. **Documentation & Changelog**:
     - Updated `doc/DOCUMENTATION.md` and `changes.json` under `# 02.09.26`.

### AI Response
Configured `DptCoor` role permissions, restricted Department Notice creation to `DptCoor` and `Admin`, renamed references across codebase/styles, and updated the comprehensive home page FAQ role breakdown.

---

## Turn 6: User Management Make DptCoor Role Button

## User Request
```
add the button to make a `faculty` user a `DptCoor` in the user management @js/app.js
```

### Thinking
- Analyzed requirements:
  1. In the User Management view (`#/user-management`), Admins need a quick-action button to promote/demote a `Faculty` user to `DptCoor` (Department Coordinator).
  2. In `js/app.js`:
     - In `renderUserList()`: Added conditional rendering for `.toggle-dptcoor-btn` when a user is Faculty or already DptCoor. Dynamically toggles between `"Make DptCoor"` and `"Remove DptCoor"`.
     - In `setupUserManagementListeners()`: Added click event delegation for `.toggle-dptcoor-btn`.
     - In `toggleUserRole()`: Handled role `'isDptCoor'`, synchronizing local state across `isFaculty`, `role`, and `isDptCoor`.
     - In `filterUsers()`: Added filtering support for `role === 'DptCoor'` and updated `Faculty` filtering.
  3. In `js/db.js`:
     - Updated `updateUserRole(userId, role, value)` so setting `isDptCoor = true` automatically updates `isFaculty = true`, `role = 'DptCoor'`, and clears semester/section. Setting `isDptCoor = false` safely downgrades back to `role = 'Faculty'`.
  4. In `css/dashboard.css`:
     - Added `.toggle-dptcoor-btn.active` style with teal `#0d9488` background.
  5. In `index.html`:
     - Added `<option value="DptCoor">DptCoor</option>` to the role filter popup.
  6. In `doc/DOCUMENTATION.md` and `changes.json`:
     - Documented the changes under `# 02.09.26`.

### AI Response
Added the `Make DptCoor` / `Remove DptCoor` action button in User Management for faculty members, complete with full Firestore state synchronization and filter support.

---

## Turn 7: Faculty Self-Registration and Account Approvals System

## User Request
```
the `faculty` role seems to be redundant when `DptCoor` exists. Let's also add a faculty toggle beside the "Student ID" in `set-details` section, so Faculties can also sign up using their initials. But before they can use the features, they need to be approved by the `DptCoor` or `admin`. before that, they will be in an `unapproved` state (shown in a brackets `unapproved` besid ethe role status in profile view). For this "approval" mechanics. add a new modal with a button with shield icon above "Notes" for desktop screens and as a sidebar with bookmark toggle (like Notice, Events and Classroom sidebar and their toggles) for mobile screens in the homescreen view. The `CR` users can also see this modal, but they will see "Approvals for student accounts will arrive soon" message instead of a working feature. Since this feature will strictly be available for faculties for now.
```

### Thinking
- Requirements breakdown:
  1. **Faculty Account Toggle in `set-details`**:
     - Added `#set-is-faculty-checkbox` ("Faculty Account") toggle beside "Student ID" in `#set-details-form`.
     - When toggled on: Adapts Student ID field into "Faculty Initial" with placeholder `"Enter your faculty initial (e.g. ABC)"`, removes digit pattern constraint, and cleanly hides/bypasses semester and section requirements.
     - On submission: Saved to Firestore with `isFaculty: true, role: 'Faculty', isApproved: false, facultyInitial: initial`.
  2. **Unapproved Faculty State**:
     - In Profile Settings (`#profile-settings-view`), if a faculty member's profile has `isApproved: false`, an amber badge `(unapproved)` (`#profile-role-approval-tag`) is displayed directly beside the role badge.
  3. **Account Approvals Management UI**:
     - **Desktop**: Added `#approval-button-desktop` with shield icon (`<i class="fas fa-user-shield"></i>`) placed cleanly above the Notes button at `bottom: 125px; right: 20px;`. Clicking opens `#approval-modal`.
     - **Mobile**: Added `#approval-toggle` bookmark tab on the right edge along with other mobile toggles (`#events-toggle`, `#notice-toggle`, `#classroom-toggle`). Tapping slides open `#approval-sidebar` with `#approval-overlay`.
  4. **Role Permissions & Approvals Handling (`js/approvals.js`)**:
     - **Admin & DptCoor**: Can review pending unapproved faculty requests (department-scoped for `DptCoor`, all departments for `Admin`), approve them (`isApproved: true`), or reject them (`isFaculty: false, role: 'Student'`).
     - **Class Representatives (CR)**: Can access the modal/sidebar, but are presented with an informational notice: *"Approvals for student accounts will arrive soon"*.
     - Regular students do not see the approvals button/toggle.
  5. **Database & Firestore Security**:
     - Added `getPendingFacultyApprovals()`, `approveFacultyUser()`, and `rejectFacultyUser()` in `js/db.js`.
     - Updated `firestore.rules` allowing `isDptCoor()` to read and approve user registrations.
  6. **Documentation & Archiving**:
     - Updated `doc/DOCUMENTATION.md` and `changes.json` under `# 02.09.26`.

### AI Response
Implemented the complete Faculty Self-Registration flow with unapproved state indicator and the Account Approvals system across desktop (modal above Notes) and mobile (bookmark toggle & slide-in sidebar).

---

## Turn 8: Approvals Modal Theme Styling and Overlay Fixes

## User Request
```
the approval window has transparent background. Add proper colors corresponding to each themes. The mobile screen size is showing a dark semi-transparent overlay all over the screen (the console shows it as the approvals overlay) and the approval sidebar toggle needs to be placed a bit higher so it does to cover other toggles.
```

### Thinking
- Identified issues:
  1. **Transparent Approval Window**:
     - The modal and sidebar content were missing explicit solid background tokens and relying on missing CSS variables.
     - Added dedicated solid colors and borders across Light (`#ffffff` / `#f8fafc`), Dark (`#121212` / `#09090b` / `#18181b`), and Gray (`#1a1a1a` / `#141414` / `#222222`) themes with contrast-tuned text colors for initials, meta info, notices, and badges.
  2. **Mobile Overlay Blocking Screen**:
     - The `#approval-overlay` had `.mobile-only` class which applied `display: block` on mobile screens by default.
     - Updated `.approval-overlay` to default to `opacity: 0; visibility: hidden; pointer-events: none;` and only reveal with `opacity: 1; visibility: visible; pointer-events: auto;` when `.active` or `.open` class is attached.
     - Synchronized `js/approvals.js` to manage `.active` class on drawer open/close.
  3. **Sidebar Toggle Overlap**:
     - Raised `#approval-toggle` to `bottom: 355px` (above Events toggle at `bottom: 300px`, Notices at `bottom: 245px`, Classroom at `bottom: 190px`) and removed inline `margin-top`.
- Documentation updated in `doc/DOCUMENTATION.md` and `changes.json` under `# 02.09.26`.

### AI Response
Fixed the approval modal and sidebar backgrounds across all three themes (Light, Dark, Gray), corrected the mobile overlay default visibility to prevent blocking the screen, and elevated the mobile bookmark toggle to `bottom: 355px` to cleanly prevent any overlap with other sidebars.

---

## Turn 9: Desktop Approvals Button Padding and Elevation

## User Request
```
make the approvals modal button have more padding like Notes button in desktop screens and move it a bit higher, adding gap between it and the Notes button
```

### Thinking
- In `css/dashboard.css`:
  - Adjusted `.approval-button-desktop`:
    - Updated padding to `var(--spacing-md) var(--spacing-lg)` (matching `.note-button-desktop`).
    - Raised vertical position to `bottom: 138px; right: 20px;` creating a clean, consistent vertical gap above the Notes button located at `bottom: 70px;`.
- Documentation updated in `doc/DOCUMENTATION.md` under `# 02.09.26`.

### AI Response
Updated the desktop Approvals button with full padding (`var(--spacing-md) var(--spacing-lg)`) matching the Notes button, and raised its position to `bottom: 138px` to provide comfortable visual separation above Notes.

---

## Turn 10: Desktop Approvals Icon-Only Button

## User Request
```
hide the text in approvals button in desktop screen
```

### Thinking
- Removed the text `<span>Approvals</span>` from `#approval-button-desktop` in `index.html`.
- In `css/dashboard.css`:
  - Transformed `.approval-button-desktop` into a centered 48x48px floating icon button with `.approval-badge-count` placed on the top-right corner.
- Documentation updated in `doc/DOCUMENTATION.md` under `# 02.09.26`.

### AI Response
Removed the text from the desktop Approvals button, formatting it into a compact, icon-only floating action button (`48x48px`) with top-right notification badge positioning.

---

## Turn 11: Notice Modal Fix and Approvals Homescreen Scoping

## User Request
```
the Notice modal is not opening. Also the Approvals button for desktop screen is showing up in other places than the home screen (please make sure it only shows in homescreen view)
```

### Thinking
- Identified two key issues:
  1. **Notice Modal Not Opening**:
     - In `js/notice.js` inside `updateNoticeTitles(isFacultyOrDptCoor)`, line 581 checked `if (isFacultyOrDptHead)` instead of `if (isFacultyOrDptCoor)`.
     - This caused a runtime `ReferenceError` when opening the modal. Fixed variable reference to `isFacultyOrDptCoor`.
  2. **Approvals Button Displaying Outside Homescreen**:
     - Updated `ApprovalManager.updateVisibility()` in `js/approvals.js` to strictly verify `Router.getCurrentRoute() === 'dashboard'` before showing the desktop button or mobile toggle.
     - Ensured `UI.updateSectionVisibility()` and `js/routing.js` maintain hidden state when navigating away to other views (Profile, User Management, Timeline, Classroom).
- Updated documentation in `doc/DOCUMENTATION.md` under `# 02.09.26`.

### AI Response
Fixed the typo in `NoticeViewer.updateNoticeTitles()` so the Notice modal opens as expected, and enforced strict homescreen-only containment for the desktop Approvals button across all routing transitions.

---

## Turn 12: Role Preview Approvals Button Visibility Fix

## User Request
```
I can see the Approvals modal / sidebar when I preview the website as `Faculty` or `Student`, which should not be possible according to the plan.
```

### Thinking
- Root cause:
  - Inside `UI.showLoading(false)` in `js/ui.js`, whenever dashboard loading finished, it was blindly removing the `.hidden` class from `#approval-button-desktop` and `#approval-toggle`.
  - In `js/approvals.js`, `ApprovalManager.updateVisibility()` did not use `!important` when setting `display: none` to override responsive `.desktop-only` / `.mobile-only` rules when `.hidden` was removed.
- Resolution:
  1. Updated `UI.showLoading(false)` in `js/ui.js` to avoid unconditionally unhiding approvals controls, delegating strictly to `ApprovalManager.updateVisibility()`.
  2. Updated `ApprovalManager.updateVisibility()` in `js/approvals.js` to apply `.style.setProperty('display', 'none', 'important')` and `.classList.add('hidden')` when the user's active/preview role is `Faculty`, `Student`, or `Blocked`.
- Documentation updated in `doc/DOCUMENTATION.md` under `# 02.09.26`.

### AI Response
Fixed the loader and role-preview visibility logic so that the Approvals button and sidebar toggle remain strictly hidden whenever previewing as `Faculty`, `Student`, or `Blocked`.

---

## Turn 13: Department Notices Missing Index Fix

## User Request
```
the `Department Notices` shown as `Faculty` or `DptCoor` roles show `Error: System is optimizing database. Please try again later.`. Why is that?
```

### Thinking
- Why did this happen?
  - When querying `cr_notices` for Faculty / DptCoor roles, Firestore was executed with `.where('department', '==', userDept).orderBy('timestamp', 'desc')`.
  - Firestore requires a Composite Index on `cr_notices` (`department` + `timestamp`). Without that composite index deployed on Firebase Console, Firestore throws a `requires an index` error.
  - In `CRNoticeViewer.renderError()`, any error message containing `"requires an index"` is translated into the user-friendly text: `"System is optimizing database. Please try again later."`
- Resolution:
  - In `js/cr-notice.js`, removed `.orderBy('timestamp', 'desc')` from the Firestore query to perform a simple single-field query (`.where('department', '==', userDept)`).
  - Implemented client-side timestamp descending sorting in JavaScript:
    ```javascript
    notices.sort((a, b) => {
      const tA = a.timestamp?.toMillis ? a.timestamp.toMillis() : (a.timestamp?.seconds ? a.timestamp.seconds * 1000 : (a.timestamp ? new Date(a.timestamp).getTime() : 0));
      const tB = b.timestamp?.toMillis ? b.timestamp.toMillis() : (b.timestamp?.seconds ? b.timestamp.seconds * 1000 : (b.timestamp ? new Date(b.timestamp).getTime() : 0));
      return tB - tA;
    });
    ```
  - This allows Department Notices to load instantly and reliably without depending on manual composite index creation in Firebase Console.
- Documentation updated in `doc/DOCUMENTATION.md` under `# 02.09.26`.

### AI Response
Explained the Firestore composite index error cause and implemented client-side sorting in `CRNoticeViewer` so Department Notices load immediately without missing index errors.
