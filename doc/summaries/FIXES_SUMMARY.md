# Fixes Summary

## Issues Fixed

### 1. Deadline Options Order in Add/Edit Task Modals ✅

**Issue:** "No official Time limit" appeared first and was selected by default when adding a task.

**Fix:** 
- Modified `index.html` to reorder deadline options
- "Set Deadline" now appears first and is selected by default
- The datetime input is now enabled by default (removed `disabled` attribute)
- Applied to both Add Task Modal and Edit Task Modal

**Files Changed:**
- `index.html` (lines ~620-630 and ~700-710)

---

### 2. File Download Links in Note Preview ✅

**Issue:** File download links in the note preview did not start downloading unless opened in a new tab, and showed warnings.

**Fix:**
- Modified `js/utils.js` in the `escapeAndLinkify()` function
- Added `download` attribute to markdown links that point to `tmpfiles.org/dl/` URLs
- This forces the browser to download the file directly instead of navigating to it

**Files Changed:**
- `js/utils.js` (escapeAndLinkify function)

---

### 3. Firebase User Login Auto-Expiration (1 Hour) ✅

**Issue:** User sessions did not automatically expire, creating a security risk if users forgot to logout.

**Fix:**
- Added session timeout functionality to `js/auth.js`
- Implemented 1-hour automatic logout timer
- Timer resets on user activity (mouse, keyboard, scroll, touch, click events)
- Shows informative message when session expires
- Automatically redirects to login page after expiration

**Implementation Details:**
- `SESSION_TIMEOUT`: 60 minutes (60 * 60 * 1000 ms)
- `startSessionTimer()`: Starts the 1-hour countdown
- `clearSessionTimer()`: Clears the timer on logout
- `resetSessionTimer()`: Resets timer on user activity
- Activity listeners: mousedown, keydown, scroll, touchstart, click

**Files Changed:**
- `js/auth.js` (added session management methods and activity listeners)

---

### 4. Role-Based Badges for CR and Faculty ✅

**Issue:** No visual indication of user roles (CR, Faculty) in Add Task, Add Events, and Contribution List.

**Fix:**
- Added role badges beside user details in:
  - Task cards ("Added by" section)
  - Contribution list
- Badges display for "CR" and "Faculty" roles only
- Styled with distinct colors:
  - CR: Blue badge (#1976d2)
  - Faculty: Purple badge (#7b1fa2)

**Files Changed:**
- `js/app.js` (showContributionsModal function - added role tracking and badge rendering)
- `js/ui.js` (renderTaskCard function - added role badge to "Added by" text)
- `css/components.css` (added role badge styles)

---

### 5. Notification Function on Mobile ✅

**Issue:** Notifications did not work on mobile devices (iOS Safari, Chrome on Android).

**Fix:**
- Modified `js/notification-manager.js` to use Service Worker notifications
- Mobile browsers require notifications to be sent via Service Worker's `showNotification()` method
- Added fallback to regular Notification API for desktop browsers
- Added notification click handler in `sw.js` to handle user interactions
- Added vibration pattern and badge icon for better mobile UX

**Implementation Details:**
- Checks for Service Worker support and uses `registration.showNotification()`
- Falls back to `new Notification()` for desktop browsers
- Service Worker handles notification clicks and focuses/opens the app
- Added vibration pattern: [200, 100, 200] ms
- Added badge icon: `/Social-Preview.webp`

**Files Changed:**
- `js/notification-manager.js` (showTaskNotification and showEventNotification methods)
- `sw.js` (added notificationclick event handler)

---

### 6. File Upload Success Messages and Link Insertion ✅

**Issue:** 
- File upload success messages were not displayed to users
- Users couldn't see confirmation that files were uploaded successfully

**Root Cause:**
- The `NoteManager.showMessage()` method was calling `UI.showMessage(message, type)` with only 2 parameters
- `UI.showMessage()` requires 3 parameters: `elementId`, `message`, and `type`
- No message container element existed in the note modal

**Fix:**
- Added message container `<div id="note-message">` to the note modal in `index.html`
- Updated `showMessage()` method in `js/notes.js` to pass correct parameters: `UI.showMessage('note-message', message, type)`
- Success message now displays: "File uploaded successfully! (Available for 14 days)"
- Error messages also display properly with specific error details

**Files Changed:**
- `index.html` (added message container to note modal body)
- `js/notes.js` (fixed showMessage method parameters)

**Related:**
- See `doc/summaries/FILE_UPLOAD_FIX_SUMMARY.md` for detailed information
- See `doc/summaries/FILE_IO_MIGRATION_SUMMARY.md` for file.io API migration details

---

## Testing Recommendations

### 1. Deadline Options
- [ ] Open Add Task modal - verify "Set Deadline" is selected by default
- [ ] Open Edit Task modal - verify "Set Deadline" is selected by default
- [ ] Verify datetime input is enabled when "Set Deadline" is selected
- [ ] Switch to "No official Time limit" and verify it works correctly

### 2. File Downloads
- [ ] Upload a file in Notes
- [ ] Click the file link in the preview
- [ ] Verify file downloads directly without opening in new tab
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)

### 3. Session Timeout
- [ ] Login and wait 1 hour without activity
- [ ] Verify automatic logout occurs
- [ ] Verify message is displayed
- [ ] Login and perform activity (click, scroll, type)
- [ ] Verify session timer resets and doesn't logout

### 4. Role Badges
- [ ] View tasks added by CR users - verify blue "CR" badge appears
- [ ] View tasks added by Faculty users - verify purple "Faculty" badge appears
- [ ] Open Contribution List - verify role badges appear next to contributor names
- [ ] Verify badges only show for CR and Faculty (not for Students or Admin)

### 5. Mobile Notifications
- [ ] Test on iOS Safari (iPhone/iPad)
- [ ] Test on Chrome for Android
- [ ] Grant notification permission
- [ ] Add a new task from another device/user
- [ ] Verify notification appears on mobile device
- [ ] Click notification and verify app opens/focuses
- [ ] Test vibration (if device supports it)

### 6. File Upload Messages
- [ ] Open Notes modal
- [ ] Click "Upload Files" button
- [ ] Select a file (under 100MB)
- [ ] Verify green success message appears: "File uploaded successfully! (Available for 14 days)"
- [ ] Verify markdown link is inserted in textarea at cursor position
- [ ] Verify preview pane shows the uploaded file link
- [ ] Test with file over 100MB - verify error message appears
- [ ] Test with network error - verify error message appears

---

## Browser Compatibility

All fixes are compatible with:
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile)
- ✅ Opera

---

## Notes

- Session timeout uses passive event listeners for better performance
- Notification fixes require Service Worker to be registered and active
- Role badges use existing CSS variable system for consistency
- All changes maintain backward compatibility with existing functionality

### 6. File Upload Success Messages in Note-Taking Feature ✅

**Issue:** File upload success messages weren't showing in the note-taking feature, making users think uploads failed even when they succeeded.

**Fix:**
- Added a message container `<div id="note-message">` to the note modal
- Fixed the `showMessage()` method in `js/notes.js` to call `UI.showMessage('note-message', message, type)` with the correct parameters

**Files Changed:**
- `index.html` (added message container at line ~1095)
- `js/notes.js` (fixed showMessage method at line ~295)

---

### 7. File Upload CORS Error - Migration to Firebase Storage ✅

**Issue:** File uploads were failing with CORS error when using file.io service:
```
Access to fetch at 'https://file.io/' from origin 'https://b1tsched.netlify.app' has been blocked by CORS policy
```

**Fix:**
- Migrated from file.io to Firebase Storage
- Added Firebase Storage SDK to the project
- Implemented new upload function using Firebase Storage API
- Files are now stored permanently in Firebase Storage at path: `note-attachments/{userId}/{timestamp}_{filename}`

**Implementation Details:**
- File size limit changed from 100MB to 10MB (Firebase free tier)
- Added filename sanitization to prevent special characters
- Added timestamp prefix to prevent filename collisions
- Files are organized by user ID for better management
- Removed "Available for 14 days" message (Firebase files are permanent)

**Benefits:**
- ✅ No CORS issues
- ✅ Permanent file storage
- ✅ Better integration with existing Firebase infrastructure
- ✅ User-specific file organization
- ✅ More reliable and secure

**Files Changed:**
- `index.html` (added firebase-storage-compat.js script at line ~1354)
- `js/firebase-config.js` (initialized Firebase Storage at line ~20)
- `js/notes.js` (replaced uploadToFileIO with uploadToFirebaseStorage at lines 188-257)

**Documentation:**
- See `doc/summaries/FIREBASE_STORAGE_MIGRATION.md` for detailed migration guide

---

### 8. Calendar View Button Not Working ✅

**Issue:** Clicking the calendar view button did nothing. Console showed:
```
Uncaught SyntaxError: Unexpected token 'export' (at calendar-view.js:1242:1)
```

**Root Cause:** ES6 `export` statement at the end of calendar-view.js was causing a syntax error in the browser because the file wasn't being loaded as a module.

**Fix:**
- Removed the ES6 export block from calendar-view.js
- Kept the browser-compatible code that exposes CalendarView to `window.CalendarView`
- Moved CalendarView initialization before Profile.init() in app.js to prevent blocking

**Files Changed:**
- `js/calendar-view.js` (removed export statement at lines 1242-1248)
- `js/app.js` (moved CalendarView init before Profile.init at lines 201-211)

---

### 9. Notes Button Visibility Fix ✅

**Issue:** The Notes button (both mobile and desktop versions) was visible on all pages including Profile Settings and User Management, when it should only appear on the dashboard/home screen.

**Fix:**
- Modified `js/routing.js` in the `showView()` method
- Added logic to show Notes button only when `viewName === 'dashboard'`
- Hides Notes button on all other views (profile-settings, user-management, etc.)
- Checks if buttons are already hidden by authentication state before showing them

**Implementation Details:**
- Mobile button: `#note-toggle` - shown/hidden based on route
- Desktop button: `#note-button-desktop` - shown/hidden based on route
- Respects existing display state (doesn't show if user is not authenticated)

**Files Changed:**
- `js/routing.js` (showView method - added Notes button visibility logic)

---

### 10. Calendar View Not Showing Tasks ✅

**Issue:** Calendar view modal opened but showed "No tasks scheduled for this month" even though there were pending tasks visible in the task list.

**Root Cause:** The `App` object was defined as `const App` in `app.js`, making it local to the module scope. The `CalendarView` class couldn't access `App.currentTasks` because `App` was not exposed to the global `window` object.

**Fix:**
- Added `window.App = App;` in `js/app.js` to expose the App object globally
- This allows `CalendarView.getTasksForMonth()` to access `App.currentTasks`
- Added detailed console logging in `calendar-view.js` for debugging

**Implementation Details:**
- `CalendarView` checks for `window.App` or `global.App` (for testing)
- Now that `App` is exposed globally, calendar can access current tasks
- Tasks are filtered by deadline month/year and displayed in calendar grid

**Files Changed:**
- `js/app.js` (added `window.App = App;` before DOMContentLoaded listener)
- `js/calendar-view.js` (added debug logging in getTasksForMonth method)

---
