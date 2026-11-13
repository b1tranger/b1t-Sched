<!--
tags: [classroom-sync, git-diff, version-control, modal, line-diff, assignments, admin, cr, refresh-button, announcements, classroom, refresh, sync, task-sync, decouple, refactor, permissions, user-management, firebase-uid, copy-button, clipboard, search-filter, login-screen, auth, role-toggle, faculty, student-id, faculty-initial, password-eye, theme-contrast, faq, telegram, ou1ts, pwa, install-prompt, desktop-layout, auto-dismiss, post-login, responsive, faculty-role, account-approvals, modal-padding, mobile-sidebar, full-height, bookmark-toggle, badge-indicator, pending-tasks, task-card, ui-refinement, task-id, inline-meta, filter-users, faculty-constraints, readonly-select, task-completion, turned-in-verification, google-classroom, student-submissions, submission-history, profile-settings, faculty-id, role-display, admin-preview, dynamic-labels, toast-notifications, copied-uid, bottom-right-toast, alumni-special, semester-selector, auto-promotion, auto-sync, fetchAssignmentsData, syncTurnedInAssignmentsToUserCompletions, dashboard, task-copy, copySingleTask, copyTaskId, task-meta-footer, left-aligned, layout, firestore-deletion, firebase-auth, delete-user, guidance-modal, copy-uid, console-redirect, remove-details, firestore-rules, border-padding, modal-styling, cross-course-matching, sync-button, google-classroom-api, cache-version, architecture, refactoring, folder-organization, modularity, script-tags, edit-user-modal, button-removal, ui-cleanup, theme, dark-mode, high-contrast, gray-mode, option-ordering, ui-ux, blue-accent, theme-colors, css-variables, 3b82f6, event-raiders, task-actions, reset-tasks, responsive-buttons, mobile-layout, role-enforcement, set-details, dptcoor, notices-permissions, pending-tasks-filter, mobile-dropdown, login-hero, scroll-indicator, login, 3-row-layout, theme-background, scroll-reset, agents-compliance, prompt-archival, changelog-modal, min-width, console-errors, is-admin, firestore-permissions, response-clone, repository-rules, agents-md, dual-write, automation, readme-update, documentation-sync, v2.53.7, modular-structure, role-hierarchy, changelog, claude-md, changelog-maintenance, readme-sync]
-->

# Session Summary - 35. Classroom Sync, Modular Architecture, Theming & Authentication

## Metadata
- **Session Index**: 35
- **Session Title**: Classroom Sync, Modular Architecture, Theming & Authentication
- **Current Version**: `v2.53.0 to v2.53.15`
- **Date**: September - November 2026

---

## User Goals & Directives
1. **Classroom Sync Briefing Modal with Git-Diff View**: Replaced plain alert dialogs on Google Classroom sync with an interactive diff modal showing updated announcements, coursework, and added files with GitHub-style line diffs.
2. **Decouple Task Sync from Classroom Refresh**: Decoupled manual task sync from general classroom refresh so assignment completion tracking runs automatically in the background without modal spam.
3. **Modular Architecture Reorganization**: Organized 37 root JavaScript files into five modular categorical subdirectories (`js/core/`, `js/features/`, `js/pwa/`, `js/notifications/`, `js/admin/`).
4. **Login Screen Overhaul**: Segmented Student/Faculty role toggle, dual-format login (Student ID / Email for students; Name Initial / Email for faculty), high-contrast password visibility toggle, Telegram community contact card, and expandable FAQ accordion.
5. **Task Export Unicode Bangla Resolution**: Integrated `html2pdf.js` retina canvas pipeline and native print window generation ensuring vector quality and complete Bengali Unicode script font rendering.
6. **Multi-Theme Shift**: Reordered themes (Dark Mode primary with blue accent `#3b82f6`, High Contrast with neon green accents, and Gray Mode).

---

## Key Technical Decisions & Architecture
1. **GitHub-Style Line Diff Engine**:
   - Implemented `diffLines()` algorithm computing line additions and deletions with colored visual blocks for classroom announcements.
2. **Categorical Directory Structure**:
   - Partitioned codebase into `js/core/` (app, auth, db, ui, router, utils), `js/features/` (classroom, notes, notice, approvals, timeline, task-export), `js/pwa/`, `js/notifications/`, and `js/admin/`.
3. **Cross-Role Authentication Enforcement**:
   - Strictly validates account role in Firestore upon sign-in to prevent cross-role login spoofing.
4. **Native Print & Retina PDF Pipeline**:
   - Dual-pipeline architecture: native `window.print()` for crisp vector text plus `html2pdf.js` canvas fallback with UTF-8 BOM encoding for plain text and Markdown exports.

---

## Files Modified & Created
- All files in `js/core/`, `js/features/`, `js/pwa/`, `js/notifications/`, and `js/admin/`
- `index.html` (Modular script tag updates, login role tabs, FAQ accordion)
- `sw.js` (CACHE_VERSION bump to `v2.53.0` through `v2.53.15` and modular caching)
- `css/main.css`, `css/components.css`, `css/classroom.css`, `css/timeline.css`
- `changes.json`, `README.md`, `doc/DOCUMENTATION.md`

---

## Verification
- Verified all categorical scripts pass `node --check` syntax tests.
- Validated service worker caching across all modular assets.
- Tested student and faculty login paths with numerical ID and initial.
- Exported tasks in Bengali Unicode, verifying zero font clipping or box-glyph artifacts.
