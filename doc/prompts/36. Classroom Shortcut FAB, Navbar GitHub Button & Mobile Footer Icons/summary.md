<!--
tags: [visitor-mode, dptcoor-permissions, task-reset, no-deadline-tasks, forgot-password-timer, notifications-mobile, service-worker, uni-notices-cache, desktop-login, responsive-zoom, documentation-cleanup, v2.53.16]
-->

# Session Summary - 36. Classroom Shortcut FAB, Navbar GitHub Button & Mobile Footer Icons

## Metadata
- **Session Index**: 36
- **Conversation ID**: `b72c1402-0b1e-42a7-a81f-3e22e5e1408d`
- **Session Title**: Classroom Shortcut FAB, Navbar GitHub Button, Mobile Footer Icons & Backlog Audit Execution
- **Current Version**: `v2.53.0 to v2.53.16`
- **Date**: November 2026

---

## User Goals & Directives
1. **Always-Visible Classroom `+` Shortcut**: Make the floating button always present above the Classroom modal and sidebar. (Completed Turn 1)
2. **Top Bar GitHub Button & Mobile Footer Icons**: Icon-only button in the top bar; mobile footer icons only with full credits. (Completed Turn 1)
3. **Approved Backlog Roadmap Execution**:
   - **Item 16 Sub-item 2**: Forgot password link reveals after 2 minutes of idle time.
   - **Item 17**: Department Coordinator ability to edit/delete other faculty tasks within the same department.
   - **Item 19 Sub-item 2**: Admin/CR deletion option for tasks without deadlines, plus auto-deletion after one semester (~180 days).
   - **Item 18**: Visitor mode with client-side only static mock data (zero Firebase/Auth calls) and "Visitor" profile representation.
   - **Item 6 Sub-item 1**: University notices cached in Firestore metadata (`metadata/uni_notices`) for fast loading without cold server delays.
   - **Item 14 Sub-item 3**: Mobile notifications fix prioritizing `ServiceWorkerRegistration.showNotification()`.
   - **Items 4 & 9**: Desktop login card styling and resolution-aware scaling.
   - **Items 12 & 14 Sub-item 1**: Documentation taxonomy in `doc/README.md` and detailed design references in `doc/DOCUMENTATION.md`.

---

## Key Technical Decisions & Architecture
1. **Client-Side Visitor Architecture**:
   - Implemented `js/features/visitor-data.js` containing rich static datasets.
   - Implemented `startVisitorMode()` and `exitVisitorMode()` in `App`.
   - Explicitly bypassed Firestore reads in `loadDashboardData()` and mutations in `handleAddTask()`, `openEditTaskModal()`, `handleDeleteTask()`, and `handleResetTasks()`.
   - Allowed in-memory interactive task completions for demo purposes.
2. **Department Coordinator Security & UI Scoping**:
   - Added `(isDptCoor() && resource.data.department == getUserDepartment())` in `firestore.rules` under `/tasks/{taskId}`.
   - Extended `UI.renderTasks()` and `UI.renderTaskCard()` with `isDptCoor` and `userDepartment` parameters to conditionally display edit/delete buttons for departmental faculty tasks.
3. **Semester Tracking & Auto-Completion of No-Deadline Tasks**:
   - Replaced auto-deletion of no-deadline tasks with **auto-completion**.
   - Added `Utils.getSemesterEnd(date)` and `Utils.getCurrentSemesterInfo(date)` to track and calculate semester periods.
   - For all tasks created with 'No Deadline', the default deadline is set to the end of that semester (Spring: June 30 23:59:59, Fall: December 31 23:59:59) with `isNoDeadline: true`.
   - In `DB.resetOldTasks()`, removed document deletion for no-deadline tasks; if `now > semesterEnd` (or when requested during reset), tasks are marked completed (`batch.update(..., { isCompleted: true, autoCompleted: true })`).
   - In `App.loadDashboardData()`, automatically marks any past-semester tasks without deadlines as completed in `this.userCompletions`.
   - In `UI.renderTaskCard()`, clearly displays `Due: End of Semester (Date)`.
4. **Mobile Web Notification Constructor Fix**:
   - Avoided `new Notification()` on mobile platforms by awaiting `navigator.serviceWorker.ready` and invoking `registration.showNotification()`.
5. **Notice Persistence**:
   - Added Firestore caching to `metadata/uni_notices` for low-latency CDN reads on startup, with Admin write sync.

6. **Footer Links Duplication Fix & Mobile Responsive Icons**:
   - Resolved malformed nested anchor tags in `index.html` preventing doubled link text.
   - Styled `@media (max-width: 768px)` in `css/main.css` hiding text labels (`.footer-link-text`) on mobile viewports so only icons render, while preserving full creator credits.

---

## Files Modified & Created
- `js/features/visitor-data.js` (Created)
- `doc/README.md` (Created)
- `doc/prompts/36.2 Walkthrough - Visitor Mode, DptCoor Permissions, Task Reset & UI Polish.md` (Created)
- `doc/prompts/36. Classroom Shortcut FAB, Navbar GitHub Button & Mobile Footer Icons/` (Created & Populated)
- `firestore.rules` (Updated task rules for `isDptCoor`)
- `index.html` (Added visitor mode button, visitor preview floating banner, and visitor data script)
- `js/core/app.js` (Visitor state, forgot password idle timer, DptCoor task handlers, reset prompts, resolution zoom)
- `js/core/ui.js` (Task card and old tasks rendering with DptCoor permissions)
- `js/core/db.js` (Reset tasks with no-deadline deletion and 180-day semester threshold)
- `js/features/notice.js` (Firestore metadata caching and pre-fetch)
- `js/features/profile.js` (Visitor profile rendering and save protection)
- `js/notifications/notification-manager.js` (SW priority and mobile constructor protection)
- `css/main.css` (Desktop login elevated card and spacing)
- `sw.js` (Bumped to `v2.53.16` and added `visitor-data.js` to static assets)
- `changes.json` (Consolidated under `v2.53.0 to v2.53.16`)
- `doc/DOCUMENTATION.md` (Version history table and Section 17 design references)
- `README.md` (Version badge and feature additions)

---

## Verification
- Syntax checked all modified JavaScript files using `node --check` (All passed, exit 0).
- Validated `changes.json` using `JSON.parse` (Passed, exit 0).
- Verified git status and ensured clean workspace.



---

## Turn 5: Desktop Floating "Browse as Visitor" Button

### Directives & Changes
- **Problem**: On desktop viewports, the "Browse as Visitor" button was taking up vertical space at the bottom of `.auth-card`, causing the card to overlap directly with the centered bouncing "FAQ & Support" scroll indicator (`.login-scroll-indicator`).
- **Solution**:
  1. Extracted `#visitor-mode-btn` from `<form id="login-form">` to sit directly under the forms in `.auth-card`.
  2. Applied responsive desktop styling (`@media (min-width: 769px)`) transforming `#visitor-mode-btn` into a fixed bottom-right floating pill button (`bottom: 24px; right: 28px; z-index: 95;`) with elevation, hover animation, and Dark/Gray mode theme adaptation.
  3. Shortened `.auth-card` height on desktop, providing generous vertical clearance above the centered `.login-scroll-indicator` ("FAQ & Support").
  4. Preserved clean block button rendering on mobile viewports (`<= 768px`) while hiding on mobile signup mode.


---

## Turn 6: Prompts Directory Taxonomy Reorganization (AGENTS.md Compliance)

### Directives & Changes
- **Problem**: In `doc/prompts/`, historical sessions 31 through 35 were stored as 32 loose flat markdown files directly in the directory root, while session 36 had duplicated loose files alongside its serial folder.
- **Solution**:
  1. Reorganized all loose session files (31, 32, 33, 34, 35) into dedicated serial session folders:
     - `31. Offline Banner Dedicated Layout Space and Content Push Down/`
     - `32. Classroom Window Border Padding and 3-Group Assignment Layout/`
     - `33. LocalSend Integration, Calendar Links with Description Toggle, and Faculty-CR Classroom Announcement Option/`
     - `34. Firebase Task ID, Admin Role Preview Mode, Approvals & Department Notices/`
     - `35. Classroom Sync, Modular Architecture, Theming & Authentication/`
  2. Each serial session folder now houses:
     - `conversation.md`: Verbatim Markdown rendering of the session's prompt conversation.
     - `summary.md`: Standardized session summary including tags, metadata, user goals, technical decisions, files modified, and verification.
     - Companion implementation plans and walkthroughs (`<N>.1`, `<N>.2`, etc.).
     - Preserved original `<N>. <Title>.md` for link and reference continuity.
  3. Cleaned up all loose files from the root of `doc/prompts/`, leaving only clean directories.
  4. Updated `doc/README.md` Section 5 indexing the newly organized serial session folders.


---

## Turn 7: Complete Historical Prompts Reorganization (Sessions 1 to 30)

### Directives & Changes
- **Problem**: Earlier prompt archives were bundled in batch directories (`doc/prompts/1-12/` and `doc/prompts/12-30/`), inconsistent with the modern serial folder architecture of Sessions 31 through 36.
- **Solution**:
  1. Unpacked and organized all historical sessions (1 through 30) into individual serial session folders directly under `doc/prompts/`:
     - Sessions 1 to 12: SPA onboarding, profile settings, admin resets, password resets, user management, notice viewer, PDF viewer, task filters, UI fixes, notice merging, notice refresh, and markdown support.
     - Sessions 13 to 30: Email verification expiration, CSS forms, admin features, localhost & semester migration, API key expiration, semester auto-promotion, notice storage, Google Classroom caching, materials, mobile course toggles, dynamic departments, task export, desktop sizing, and Event Raiders RSS.
  2. Standardized every session folder with `conversation.md`, `summary.md` (metadata, tags, user goals, technical decisions, files modified, verification), and original prompt records.
  3. Safely removed the legacy batch directories (`1-12/` and `12-30/`).
  4. Updated `doc/README.md` Section 5 indexing the full chronological repository of all 36 sessions.


---

## Turn 8: Git Commit Long Path Failure Resolution

### Directives & Changes
- **Problem**: When staging and committing in Git on Windows, the commit failed with:
  `error: open("doc/prompts/33. LocalSend Integration.../33. LocalSend Integration..."): Filename too long`
  caused by a 266-character path exceeding the default Windows 260-character `MAX_PATH` limit.
- **Solution**:
  1. Enabled `core.longpaths = true` in the repository's Git configuration (`git config core.longpaths true`).
  2. Removed the redundant duplicate file `33. LocalSend Integration, Calendar Links with Description Toggle, and Faculty-CR Classroom Announcement Option.md` inside session folder 33 (which already contains the identical `conversation.md`).
  3. Successfully ran `git add -A`, cleanly staging all modified, renamed, and newly tracked files.


---

## Turn 9: Git Staging Verification & Continuity Check

### Status
- Confirmed repository clean staging state across all modified and newly reorganized prompt directories (Sessions 1 to 36).
- Validated all 36 session folders comply with AGENTS.md Rule 2 format and documentation standards.
- Ready to proceed with backlog implementation plan phases or assist with commit/push.
