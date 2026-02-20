> Original Source: plan/g-class-api/1-implementation_plan.md

# Implementation Plan: Google Classroom Integration

## Goal Description
Integrate Google Classroom API to allow students to view their course notifications (announcements) and to-do lists (course work) directly within the b1t-Sched application. The feature will include a desktop window view and a mobile sidebar, styled with the Google Classroom green theme.

## User Review Required
> [!IMPORTANT]
> **Google Cloud Project Setup**: You must set up a Google Cloud Project and enable the Classroom API as described in `GOOGLE_CLASSROOM_SETUP.md` before this feature will work. You need to provide the **Client ID** and **API Key** (if applicable) to embed in the implementation.

> [!WARNING]
> **Authentication Flow**: This implementation uses the Google Identity Services SDK for client-side authentication. Users will need to grant permission via a popup window. This is separate from the main Firebase authentication.

## Proposed Changes

### Frontend (HTML/CSS)
#### [NEW] [css/classroom.css](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/css/classroom.css)
- Define variables for Classroom green theme (`--classroom-green`).
- Styles for `classroom-sidebar` (mobile) and `classroom-modal` (desktop).
- Styles for course cards, assignment lists, and announcement streams.

#### [MODIFY] [index.html](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/index.html)
- Add "Google Classroom" toggle button to the Dashboard (Green icon).
- Add `#classroom-sidebar` container for mobile.
- Add `#classroom-modal` container for desktop.
- Load the Google Identity Services script: `<script src="https://accounts.google.com/gsi/client" async defer></script>`.

### Frontend (JavaScript)
#### [NEW] [js/classroom.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/classroom.js)
- **Init**: Initialize the Google Token Client.
- **Auth**: Handle login/logout for Classroom scopes.
- **API Wrapper**: Methods to fetch `courses`, `courseWork`, and `announcements`.
- **UI Rendering**: Functions to render the course list, assignments, and announcements.
- **Logic**: Toggle between "To-Do" (CourseWork) and "Notifications" (Announcements).

#### [MODIFY] [js/app.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/app.js)
- Initialize `Classroom.init()` in `App.init()`.
- Bind specific event listeners for the Classroom toggle buttons.

#### [MODIFY] [js/ui.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/ui.js)
- Add helper methods if needed for the new sidebar/modal toggling (similar to `toggleEventsSidebar`).

### Backend / Configuration
- **Firestore**: (Optional/Future) schema updates if CR configuration needs persistent storage of "Official Course IDs". For this iteration, we will store CR configurations in a new `classroom_config` collection if needed, or simply list all user courses.

## Verification Plan

### Automated Tests
- None (Client-side integration with external API).

### Manual Verification
1.  **Setup**:
    -   Configure the Google Cloud Project and update the Client ID in `js/classroom.js`.
    -   Serve the application locally (`http://localhost:5500`).
2.  **Authentication**:
    -   Click the "Google Classroom" icon.
    -   Verify the Google Sign-In popup appears.
    -   Grant permissions.
3.  **Data Loading**:
    -   Verify that the list of enrolled courses appears.
    -   Click a course.
    -   Verify "To-Do" list shows assignments.
    -   Toggle to "Notifications" view.
    -   Verify announcements appear.
4.  **Responsiveness**:
    -   **Desktop**: Ensure the content opens in a modal/window.
    -   **Mobile**: Ensure the content opens in a right-side sidebar (Green toggle).
5.  **Theming**:
    -   Verify the green theme matches Google Classroom.
