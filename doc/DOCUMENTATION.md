# b1t-Sched - Complete Project Documentation

> **Academic Task Scheduler** - A Single Page Application (SPA) for managing academic tasks, assignments, exams, and events with personalized department-specific content.

# 02.09.26

**User Role Display, DptCoor Role, Faculty Customizations, Notice Permissions & Admin Role Preview Mode**
- **Faculty Self-Registration & Unapproved State**: Added a "Faculty Account" toggle (`#set-is-faculty-checkbox`) in the Initial Setup view (`set-details-view`). When enabled, adapts the Student ID field into `"Faculty Initial"` (with placeholder `"Enter your faculty initial (e.g. ABC)"`), while cleanly hiding and bypassing semester and section requirements. Upon submission, the account is registered with `isFaculty: true, role: 'Faculty', isApproved: false`. In Profile Settings, unapproved faculty accounts display an amber `(unapproved)` tag (`#profile-role-approval-tag`) directly beside the role status badge.
- **Account Approvals Management (Modal, Sidebar & Theme Support)**: Implemented a dedicated Account Approvals system (`js/approvals.js`, `#approval-modal`, `#approval-sidebar`) accessible via a sleek desktop floating icon-only shield button (`#approval-button-desktop` with `48x48px` dimensions) elevated to `bottom: 138px` cleanly above the "Notes" button, and via a mobile bookmark toggle tab (`#approval-toggle` positioned at `bottom: 355px` to cleanly clear existing sidebar toggles).
  - **Homescreen-Only Scoping**: Enforced strict route scoping across `js/routing.js`, `js/ui.js`, and `js/approvals.js` ensuring the desktop button and mobile toggle exclusively display on the main dashboard (`#dashboard`) and remain completely hidden across all other routes (Profile, User Management, Classroom, Timeline).
  - **Full Theme Adaptation**: Added solid, non-transparent container backgrounds and contrast-tuned text/borders for Light theme (`#ffffff` / `#f8fafc`), Dark theme (`#121212` / `#09090b` / `#18181b`), and Gray theme (`#1a1a1a` / `#141414` / `#222222`).
  - **Mobile Overlay State Fix**: Configured `#approval-overlay` with default `visibility: hidden; opacity: 0; pointer-events: none;` preventing unwanted dark backdrop blockage on mobile viewports until actively toggled open.
  - **Admin & DptCoor**: Views pending faculty registration requests (scoped to department for DptCoor, global for Admin) with real-time request counts and one-click **Approve** (activates full faculty access) and **Reject** actions.
- **Department Notices for Faculty & DptCoor**: Updated Notice modals (`#notice-modal`, `#add-cr-notice-modal`, `#edit-cr-notice-modal`, `#old-cr-notices-modal`) and mobile sidebar (`#notice-sidebar`) in `js/notice.js` and `js/cr-notice.js` to dynamically display `"Department Notices"` for Faculty and DptCoor users. Replaced Firestore composite query (`.where('department').orderBy('timestamp')`) with single-field filtering and client-side sorting in `CRNoticeViewer`, resolving the `"System is optimizing database"` (missing Firestore index) error and enabling immediate, out-of-the-box loading without manual index creation. General Faculty members can view Department Notices, while posting/editing is strictly restricted to **DptCoor** and **Admin** roles.
- **Home Page FAQ Role Documentation**: Overhauled the FAQ section (`#faq-section`) in `index.html` with an in-depth breakdown of all 6 platform role contexts (`Admin`, `DptCoor`, `Faculty`, `CR`, `Regular Student / User`, `Blocked`) clarifying task scoping, notice publishing permissions, and profile constraints.
- **Faculty Profile Sem/Section Hiding**: Hidden semester and section dropdown selectors (`#profile-semester-group`, `#profile-section-group`) for Faculty and DptCoor users in Profile Settings, as faculties operate department-wide without semester/section restrictions.
- **Faculty Task Modals & "Meetings" Type**: Customized the Course field in Add Task and Edit Task modals for Faculty users to show label `"Course / Designation"` and placeholder `"Task for a Faculty / Course"`. Added a new `"Meetings"` task type option (`.task-type-badge.meetings`) in Add/Edit Task modals and Pending Tasks filter.
- **Profile Role Status**: Displayed active user role badge (`#profile-role-badge`) directly below Student ID in Profile Settings with real-time class styling across Admin, Faculty, DptCoor, CR, Student, and Blocked roles.
- **Admin Role Preview Simulation & 2-Row Vertical Control**: Introduced an interactive "Preview as" dropdown (`#admin-preview-select`) in Profile Settings exclusively for Admins stacked cleanly into 2 vertical rows (Label on Row 1, Dropdown and Exit button on Row 2) to simulate other user roles (Faculty, DptCoor, CR, Student, Blocked) in temporary `sessionStorage`. In preview mode, the role status displays an amber `(preview)` tag (`#profile-role-preview-tag`).
- **Repositioned Floating Preview Banner & 3-Second Auto-Minimize**: Positioned the floating banner (`#admin-preview-banner`) at the bottom-right corner for desktop and centered at the bottom on mobile devices (`max-width: 768px`). Displays the expanded view for 3 seconds before automatically minimizing into an unobtrusive floating eye icon (`#admin-preview-toggle-btn`) matching the banner's height (34px). Clicking the eye icon expands the full banner back into view for 3 seconds to access the Exit Preview action (`App.exitPreview()`).
- **Session Isolation**: Role simulation strictly persists within the active browser tab via `sessionStorage` and automatically resets to the default Admin view upon tab closure or next session start, preventing any permanent alterations to user accounts or database permissions.

**Firebase Task ID in Show More and Direct Old Tasks Editing**
- **Pending Tasks Firebase ID**: Integrated Firestore document ID into expanded pending task cards (`.task-id-info`, `.task-id-code`) inside `js/ui.js` and `css/components.css`. Displays automatically alongside creator details when "Show more" is clicked, with `user-select: all` for instant copying.
- **Editable Old Tasks**: Enabled role-based editing directly within the Old Tasks modal (`.old-task-actions`, `.old-task-edit-btn`) for Admins and task owners (Students, CRs, and Faculty).
- **Task Migration on Deadline Extension**: Updated `js/app.js` (`openEditTaskModal`, `handleEditTask`) and `js/db.js` (`getOldTasks`) so that editing an old task's deadline to a future date or removing the deadline automatically restores it to the "Pending Tasks" list in real-time and refreshes the Old Tasks view.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack (Detailed)](#technology-stack-detailed)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [JavaScript Modules](#javascript-modules)
6. [Styling System](#styling-system)
7. [Firebase/Firestore Data Model](#firebasefirestore-data-model)
8. [User Flows](#user-flows)
9. [Views & Components](#views--components)
10. [API Reference](#api-reference)
11. [Activity Timeline & Migration](#activity-timeline--migration)
12. [Design References & Inspirations](#design-references--inspirations)
13. [Additional Resources](#additional-resources)

---

## Project Overview

### Description

b1t-Sched is a web-based academic task scheduler designed for university students. It provides a personalized dashboard with tasks, events, and resource links filtered by the student's department, semester, and section.

### Key Features

- **Single-Page Application (SPA)** - Hash-based routing for seamless navigation
- **Firebase Authentication** - Secure email/password login system with email verification and password reset
- **User Profiles** - Student ID, department, semester, and section
- **Personalized Dashboard** - Content filtered by user's academic details
- **Task Management** - View pending assignments and exams with deadlines (or "No official Time limit"), with enhanced markdown support (**bold**, _italic_, fenced code blocks, inline code, links), HTML entity rendering (e.g., \*, &times;), `<pre>` tag support for preserved formatting, clickable links, and collapsible descriptions (2-line truncation). "Set Deadline" is now the default option when adding tasks.
- **Task Completion** - Checkboxes to mark tasks complete, persistent per-user
- **Task Editing** - Users can edit their own tasks; admins can edit all tasks; Course is required field
- **Event Calendar** - Track upcoming academic events with enhanced markdown support (HTML entities, code blocks, `<pre>` tags), clickable links, collapsible descriptions (2-line truncation), and department scope badge (ALL/CSE/etc.)
- **Event Editing** - Admins can edit all events; CRs can edit/delete their own events
- **Resource Links** - Quick access to department-specific resources with built-in PDF viewer (desktop: Google Docs Viewer in modal; mobile: opens in new tab)
- **Google Classroom Integration** - View all assignments, announcements, and posted course materials from enrolled courses in a unified interface with OAuth authentication and session persistence (auto-refresh tokens & cached fallback mode). Features three view toggle tabs (**To-Do**, **Notices**, **Materials**), real-time assignment status badges (**Assigned** [Blue], **Missing** [Red], **Turned in** / **Turned in (Late)** [Green], and **Returned** / **Graded: X/Y** [Purple]), responsive mobile course view header (toggle buttons wrap cleanly to the 2nd line under the course title), default hiding of Archived Classrooms with an interactive toggle button, a unified pill-styled Sign Out button dynamically shown when logged in, seamless expired token recovery with a 1-click **Reconnect** banner (prevents popup flashes and blank screens), and a one-click **Sync to Tasks** feature for Admins/CRs to automatically add Classroom assignments to the main Tasks list (avoids duplicates).
- **Session Security** - Automatic logout after 1 hour of inactivity (unless "Stay logged in" is checked), with activity-based timer reset for enhanced security
- **Stay Logged In** - Optional "Trust this device" checkbox on login to persist session indefinitely on safe devices
- **Role Badges** - Visual indicators for CR and Faculty contributors in task cards and contribution lists
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Maroon Theme** - Professional dark maroon and off-white color scheme
- **Dark Theme Customization** - Dynamic, RealtimeColors-based dark theme (`#1a1c0d`, `#d4dd93`, `#d5eb2c` palette) with seamless toggling via "Appearance Settings" in the Profile menu. Avoids caching FOUC (flash of unstyled content) via inline scripting. Includes high-contrast, dark red styling (`#8b0000`) for urgent deadline visibility.
- **Gray Mode Theme** - A sleek monochromatic alternative theme. Modern system dark mode preferences now default to "Gray Mode" for a premium, low-strain experience. Includes full UI integration for Classroom, Timeline, and Dashboards.
- **Improved Initial Preloader** - A synchronized loading screen that persists until all dashboard data is fully fetched. Features a high `z-index` overlay (10005) and body scroll locking to prevent premature element visibility.
- **Admin Features** - Task reset, task/event delete, event creation, user management with password reset and deletion
- **Admin User Management** - View all users, search by email/ID/dept/sem/sec (`#user-search-input`), manage roles (CR/Faculty/Blocked), edit user profiles, send password resets (via Client SDK), delete users
- **Student Search Bar** - Real-time search in User Management view (`#user-search-input`) with instant filtering and clear search button.
- **Password Reset Enhancements** - "Forgot Password" link on login failure, "Reset Password" button in Profile Settings, and robust Admin reset functionality bypassing CORS issues
- **CR Role** - Class Representatives can reset and delete tasks for their section, create events for their semester, and edit/delete their own events
- **Faculty Role** - Faculty members can view department-wide tasks (no semester/section filtering), create events for their department, and edit/delete their own events
- **Blocked Users** - Restricted accounts in read-only mode (cannot add/edit/delete tasks or change profile)
- **CR Info Message** - Non-CR users see instructions to contact admin for CR role
- **Semester Auto-Promotion** - Student semesters automatically advance every July and January on sign-in based on `lastSemesterCycle`. If a student modified their profile within the last 30 days, auto-promotion is paused and an amber notice is shown in Profile Settings. Includes an interactive homepage notice banner directing students to check Profile Settings, which persists dismissal across sessions per semester cycle (`localStorage.setItem('semesterNoticeDismissedCycle', currentCycle)`).
- **Admin Fail-Safe Bulk Semester Update** - Dedicated button in User Management view allowing admins to run bulk semester auto-updates. Features a 30-second read-only verification countdown timer upon opening the modal, an amber verification notice, and a 6-month ($180\text{ days}$) execution cooldown recorded in `/metadata/semesterConfig`.
- **Profile Change Cooldown** - Users can only change profile once per 30 days (anti-spam)
- **Two-Column Layout** - Events sidebar on desktop, slide-out panel (40vw) on mobile
- **Notice Viewer** - View UCAM university notices with PDF preview (desktop modal with split-pane layout; mobile slide-out sidebar), powered by Vercel serverless backend (`/api/notices`) with global Vercel Blob Edge CDN caching (`@vercel/blob`). Automatically loads notices from Vercel Blob cloud storage on open/init, with a **Check Updates** button to fetch new notices from the backend server on demand, a 60-second automatic retry timer with live countdown on cold start / 503 errors, and emergency stale fallbacks.
- **Note Taking** - Personal note-taking feature with enhanced markdown support (including fenced code blocks and HTML entities), auto-save, and PDF export. Supports file attachments via temporary link sharing (Catbox/Tmpfiles) and a "Shorten" feature that exports notes as a local `.md` file for manual sharing. PDF export is optimized for both light and dark themes with forced visibility.
- **Task Filtering** - Filter pending tasks by type (Assignment, Homework, Exam, Project, Presentation, Other)
- **Task Export** - Export tasks to TXT, Markdown (.md), or vector PDF with pure black selectable fonts (`#000000`), embedded clickable links, 120% scale, straight line dividers, active type filter support (`Exam`, `Assignment`, etc.), and dedicated Old Tasks pagination.
- **Navbar Logo Navigation** - Clickable brand logo and title navigating to `#/dashboard` from anywhere in the app with smooth scroll-to-top.
- **Global Contributions** - View a leaderboard of top contributors (group-specific or global across all departments)
- **User Counter** - Live count of total registered users displayed on the dashboard and footer.
- **Mobile Calendar** - Monthly and weekly views for mobile with a toggle to switch between them. Monthly view features a compact date grid with maroon dot indicators for dates with tasks, today highlight, and a tappable task list panel showing course + title + deadline time. Weekly view provides vertical scrolling by week. Includes Month/Year dropdowns for quick navigation.
- **FAQ Section** - Collapsible accordion explaining how the site works, user roles, and profile settings
- **Footer with Credits** - Source code link, total user count, and dynamic copyright year

### Technology Stack (Summary)

| Category                  | Technology                               |
| ------------------------- | ---------------------------------------- |
| Frontend                  | HTML5, CSS3, Vanilla JavaScript          |
| Backend (Database & Auth) | Firebase (Firestore, Authentication)     |
| Backend (Notice API)      | Vercel Serverless Functions (Node.js)    |
| PDF Generation            | jsPDF 2.5.1, html2pdf.js 0.10.1          |
| Icons                     | Font Awesome 6.5                         |
| Hosting                   | Netlify (frontend), Vercel (backend API) |

---

## Technology Stack (Detailed)

This section provides a comprehensive breakdown of every library, framework, service, and tool used in the project.

### Frontend Technologies

| Technology                    | Version | Purpose                                                                | Delivery |
| ----------------------------- | ------- | ---------------------------------------------------------------------- | -------- |
| **HTML5**                     | —       | Page structure, semantic markup                                        | Native   |
| **CSS3**                      | —       | Styling, layouts, responsive design, CSS custom properties (variables) | Native   |
| **Vanilla JavaScript (ES6+)** | —       | Application logic, DOM manipulation, SPA routing                       | Native   |
| **jsPDF**                     | 2.5.1   | Client-side vector PDF generation with native hyperlinks and selectable text | CDN (`cdnjs.cloudflare.com`) |
| **html2pdf.js**               | 0.10.1  | DOM-to-PDF conversion for notes export                                 | CDN (`cdnjs.cloudflare.com`) |
| **JSZip**                     | 3.10.1  | Client-side file zipping for note archive bundles                      | CDN (`cdnjs.cloudflare.com`) |

### Firebase SDK

| Package                       | Version | Purpose                                                                        | Delivery            |
| ----------------------------- | ------- | ------------------------------------------------------------------------------ | ------------------- |
| **firebase-app-compat**       | 10.7.1  | Firebase core initialization                                                   | CDN (`gstatic.com`) |
| **firebase-auth-compat**      | 10.7.1  | Email/password authentication, email verification, password reset              | CDN (`gstatic.com`) |
| **firebase-firestore-compat** | 10.7.1  | NoSQL cloud database (Firestore) for users, tasks, events, resources, metadata | CDN (`gstatic.com`) |

> **Note:** The project uses the Firebase **compat** (v8-style) SDK loaded via CDN `<script>` tags, not the modular v9+ import style.

### Google APIs

| Library                      | Version | Purpose                                                  | Delivery                               |
| ---------------------------- | ------- | -------------------------------------------------------- | -------------------------------------- |
| **Google Identity Services** | Latest  | OAuth 2.0 authentication for Google Classroom API access | CDN (`accounts.google.com/gsi/client`) |

### Icons & Fonts

| Library          | Version | Purpose                                                             | Delivery                     |
| ---------------- | ------- | ------------------------------------------------------------------- | ---------------------------- |
| **Font Awesome** | 6.5.0   | UI icons (navigation, buttons, status indicators, task/event icons) | CDN (`cdnjs.cloudflare.com`) |

### Backend Services

| Service                         | Purpose                                                     | Details                                                              |
| ------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------- |
| **Firebase Authentication**     | User sign-up, login, email verification, password reset     | Email/password provider                                              |
| **Cloud Firestore**             | Primary database for all application data                   | Collections: `users`, `tasks`, `events`, `resourceLinks`, `metadata` |
| **Vercel Serverless Functions** | Notice scraping API backend (`b1t-acad-backend.vercel.app`) | Node.js runtime; scrapes UCAM portal notices, proxies PDF downloads  |

### Hosting & Deployment

| Platform    | Purpose                 | Details                                                                         |
| ----------- | ----------------------- | ------------------------------------------------------------------------------- |
| **Netlify** | Frontend static hosting | Deploys `index.html` + CSS/JS assets; domain: `b1tsched.netlify.app`            |
| **Vercel**  | Backend API hosting     | Serverless functions for notice scraping; domain: `b1t-acad-backend.vercel.app` |

### Browser APIs & Web Standards Used

| API                                         | Purpose                                             |
| ------------------------------------------- | --------------------------------------------------- |
| **localStorage**                            | Client-side caching (notice data, user preferences) |
| **Fetch API**                               | HTTP requests to Vercel backend for notices/PDFs    |
| **Hash-based Routing** (`hashchange` event) | SPA navigation without page reloads                 |
| **Blob API**                                | PDF handling for notice downloads                   |

### Development & Configuration

| Tool                         | Purpose                                                              |
| ---------------------------- | -------------------------------------------------------------------- |
| **Firestore Security Rules** | Server-side access control (role-based: Admin, CR, Blocked, Regular) |
| **Domain Restrictions**      | HTTP Referrers restricted to `https://b1tsched.netlify.app/*` via Google Cloud Console to protect the Firebase API Key from unauthorized usage |
| **Git**                      | Version control                                                      |

---

## Architecture

### Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                           │
│                    (Single Entry Point)                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     JavaScript Modules                      │
│  ┌─────────────┐  ┌──────────┐  ┌────────┐  ┌────────────┐  │
│  │ firebase-   │  │  auth.js │  │ db.js  │  │ routing.js │  │
│  │ config.js   │  │          │  │        │  │            │  │
│  └─────────────┘  └──────────┘  └────────┘  └────────────┘  │
│  ┌─────────────┐  ┌──────────┐  ┌────────┐  ┌────────────┐  │
│  │ profile.js  │  │  ui.js   │  │utils.js│  │  app.js    │  │
│  │             │  │          │  │        │  │  (Main)    │  │
│  └─────────────┘  └──────────┘  └────────┘  └────────────┘  │
│  ┌─────────────┐                                            │
│  │ notice.js   │                                            │
│  │             │                                            │
│  └─────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Backend                         │
│  ┌─────────────────────┐  ┌────────────────────────────────┐│
│  │   Authentication    │  │         Firestore              ││
│  │  (Email/Password)   │  │  ┌──────┐ ┌─────┐ ┌──────────┐ ││
│  └─────────────────────┘  │  │users │ │tasks│ │  events  │ ││
│                           │  └──────┘ └─────┘ └──────────┘ ││
│                           │  ┌────────────┐ ┌────────────┐ ││
│                           │  │resourceLink│ │  metadata  │ ││
│                           │  └────────────┘ └────────────┘ ││
│                           └────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Vercel Serverless Backend                      │
│  ┌─────────────────────┐  ┌────────────────────────────────┐│
│  │   api/notices.js    │  │       api/pdf.js               ││
│  │  (Scrape notice     │  │  (Proxy PDF downloads          ││
│  │   list from UCAM)   │  │   from UCAM portal)            ││
│  └─────────────────────┘  └────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Module Dependencies

```
app.js (Main Application)
├── Auth (auth.js)
├── DB (db.js)
├── UI (ui.js)
├── Router (routing.js)
├── Profile (profile.js)
├── Utils (utils.js)
└── NoticeViewer (notice.js)

firebase-config.js (Loaded First)
└── Initializes: auth, db (Firestore instances)

notice.js (Independent Module)
└── Fetches from: Vercel backend API (b1t-acad-backend.vercel.app)
```

---

## Project Structure

```
b1t-Sched/
│
├── index.html                    # Main SPA entry point
├── manifest.json                 # PWA manifest
├── sw.js                         # Service worker
├── Social-Preview.webp           # Logo/favicon
├── Social-Preview.ico            # Favicon (ICO format)
├── LICENSE                       # Project license
├── README.md                     # Quick start guide
│
├── css/                          # Stylesheets
│   ├── colors.css               # CSS variables (theme colors)
│   ├── main.css                 # Core styles, layouts
│   ├── components.css           # Reusable component styles
│   ├── dashboard.css            # Dashboard layout, modals, admin controls
│   ├── navbar.css               # Navigation bar styles
│   ├── user-details-card.css    # User profile card styles
│   ├── notice.css               # Notice viewer modal, sidebar, PDF panel styles; Quick Links PDF viewer modal
│   ├── classroom.css            # Google Classroom integration styles (sidebar, modal, course badges)
│   ├── responsive.css           # Mobile/tablet breakpoints
│   ├── buttons.css              # Button variations
│   ├── drop-down.css            # Dropdown menu styles
│   ├── menu-bar.css             # Menu bar styles
│   ├── selector.css             # Dropdown/select styles
│   ├── timeline.css             # Activity timeline styles (heatmap, charts)
│   └── styles.css               # Additional styles
│
├── js/                           # JavaScript modules
│   ├── firebase-config.js       # Firebase initialization
│   ├── auth.js                  # Authentication module
│   ├── db.js                    # Database operations
│   ├── ui.js                    # UI rendering functions
│   ├── routing.js               # SPA hash-based routing
│   ├── profile.js               # Profile management
│   ├── utils.js                 # Utility functions
│   ├── notice.js                # Notice viewer module (UCAM notices + PDF)
│   ├── notes.js                 # Note-taking module with file upload
│   ├── classroom.js             # Google Classroom API integration
│   ├── raids-feed.js            # UITS Event Raiders RSS & JSON feed service
│   ├── admin-api.js             # Admin API client (password reset, user deletion)
│   ├── pwa-detector.js          # PWA detection
│   ├── manifest-generator.js    # Manifest generation
│   ├── cache-manager.js         # Data caching
│   ├── install-prompt.js        # Install prompt management
│   ├── offline-indicator.js     # Offline UI indicator
│   ├── offline-manager.js       # Offline operation queue
│   ├── sw-update-manager.js     # Service worker updates
│   ├── pwa-init.js              # PWA initialization
│   ├── notifications-types.js   # Notification type definitions
│   ├── permission-manager.js    # Notification permission management
│   ├── notification-content-formatter.js # Notification content formatting
│   ├── notification-manager.js  # Core notification logic
│   ├── firestore-listener-manager.js # Firestore real-time listeners
│   ├── firestore-listener-manager.js # Firestore real-time listeners
│   ├── activity-logger.js       # User activity tracking & backpopulation
│   ├── timeline-data.js         # Timeline data fetching & processing
│   ├── timeline-ui.js           # Timeline visualization rendering
│   ├── calendar-view.js         # Interactive calendar modal management
│   └── app.js                   # Main application logic
│
├── doc/                          # Documentation
│   ├── DOCUMENTATION.md         # Complete project documentation (this file)
│   ├── FIREBASE_SETUP.md        # Firebase setup guide
│   ├── QUICKSTART.md            # Quick start guide
│   ├── REDESIGN_PLAN.md         # Design documentation
│   ├── ADMIN_FEATURES.md        # Admin functionality docs
│   └── FIRESTORE_TASK_CHANGES.md # Task schema changes
│
├── functions/                    # Firebase Cloud Functions
│   ├── index.js                 # Functions entry point
│   ├── admin/                   # Admin functions
│   │   ├── sendPasswordReset.js # Password reset function
│   │   └── deleteUser.js        # User deletion function
│   ├── package.json             # Functions dependencies
│   └── DEPLOYMENT_GUIDE.md      # Functions deployment guide
│
├── images/                       # Image assets
│   ├── logo/                    # Logo variations
│   └── Social-logo/             # Social media assets
│
└── Archive/                      # Legacy/unused files (see Archive/README.md)
    ├── Abstraction/             # Old prototype files
    ├── D1/                      # Legacy department schedules
    ├── Note/                    # Code examples
    └── *.html, *.md             # Old static pages
```

---

## JavaScript Modules

### 1. firebase-config.js

**Purpose:** Initialize Firebase services

```javascript
// Configuration object
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

> **Important**: This setup requires a build step/bundler (like Vite, Webpack, or Netlify snippet injection) to replace the `process.env` references with actual variables during deployment, as native browsers do not support `.env` files directly.

// Exposed globals
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(); // Authentication instance
const db = firebase.firestore(); // Firestore instance
```

---

### 2. Auth (auth.js)

**Purpose:** Handle user authentication and session management

**Session Management:**

- Automatic logout after 1 hour of inactivity for enhanced security (unless device is trusted)
- Activity-based timer reset on user interactions (mouse, keyboard, touch, scroll)
- Session timer starts on login (if not trusted) and clears on logout
- "Trust this device" feature uses `localStorage` to bypass session timeout

**Properties:**

- `SESSION_TIMEOUT`: 3600000 ms (1 hour)
- `sessionTimer`: Timer reference for session timeout
- `currentUser`: Current authenticated user object
- `cacheManager`: Cache manager instance

| Method                               | Parameters              | Returns                    | Description                                                          |
| ------------------------------------ | ----------------------- | -------------------------- | -------------------------------------------------------------------- |
| `signup(email, password)`            | string, string          | `{success, user/error}`    | Create new user account                                              |
| `login(email, password, rememberMe)` | string, string, boolean | `{success, user/error}`    | Sign in existing user; optional `rememberMe` to skip session timeout |
| `logout()`                           | -                       | `{success, error?}`        | Sign out current user and clear session timer                        |
| `onAuthStateChanged(callback)`       | function                | unsubscribe function       | Listen for auth state changes; manages session timer                 |
| `getCurrentUser()`                   | -                       | User object or null        | Get current Firebase user                                            |
| `getUserId()`                        | -                       | string or null             | Get current user's UID                                               |
| `getUserEmail()`                     | -                       | string or null             | Get current user's email                                             |
| `getErrorMessage(errorCode)`         | string                  | string                     | Convert Firebase error codes to user-friendly messages               |
| `resendVerificationEmail()`          | -                       | `{success, message/error}` | Resend email verification link                                       |
| `sendPasswordResetEmail(email)`      | string                  | `{success, message/error}` | Send password reset link to email                                    |
| `startSessionTimer()`                | -                       | void                       | Start 1-hour session timeout timer                                   |
| `clearSessionTimer()`                | -                       | void                       | Clear active session timeout timer                                   |
| `resetSessionTimer()`                | -                       | void                       | Reset session timer on user activity                                 |

**Activity Listeners:**
The module automatically listens for user activity events (`mousedown`, `keydown`, `scroll`, `touchstart`, `click`) to reset the session timer, ensuring active users remain logged in while inactive sessions expire after 1 hour.

**Error Messages Handled:**

- `auth/email-already-in-use`
- `auth/invalid-email`
- `auth/weak-password`
- `auth/user-not-found`
- `auth/wrong-password`
- `auth/too-many-requests`
- `auth/network-request-failed`

---

### 3. DB (db.js)

**Purpose:** Firestore database operations

#### User Operations

| Method                            | Parameters     | Returns                 | Description             |
| --------------------------------- | -------------- | ----------------------- | ----------------------- |
| `createUserProfile(userId, data)` | string, object | `{success, error?}`     | Create new user profile |
| `getUserProfile(userId)`          | string         | `{success, data/error}` | Get user profile data   |
| `updateUserProfile(userId, data)` | string, object | `{success, error?}`     | Update user profile     |

**User Profile Schema:**

```javascript
{
  email: string,
  studentId: string,      // 10-16 digit student ID
  department: string,     // e.g., "CSE", "IT"
  semester: string,       // e.g., "1st", "2nd" (null for Faculty)
  section: string,        // e.g., "A1", "B2" (null for Faculty)
  isAdmin: boolean,       // Optional - admin privileges (set manually)
  isCR: boolean,          // Optional - CR privileges (set via admin panel)
  isFaculty: boolean,     // Optional - Faculty privileges (set via admin panel)
  isBlocked: boolean,     // Optional - blocked/restricted user (set via admin panel)
  theme: string,          // Optional - User's selected theme ('system', 'light', 'dark', 'gray')
  lastProfileChange: Timestamp, // Optional - last profile edit timestamp (30-day cooldown)
  lastProfileChangeByAdmin: Timestamp, // Optional - last admin edit timestamp
  createdAt: Timestamp,
  updatedAt: Timestamp,
  noteContent: string,    // Optional - user's personal notes (max 1MB)
  noteUpdatedAt: Timestamp // Optional - last note update timestamp
}
```

#### Task Operations

| Method                                               | Parameters              | Returns                         | Description                                                                        |
| ---------------------------------------------------- | ----------------------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| `getTasks(department, semester, section)`            | string, string, string  | `{success, data/error}`         | Get pending tasks (includes overdue within 12h grace period and no-deadline tasks) |
| `getFacultyTasks(department)`                        | string                  | `{success, data/error}`         | Get department-wide tasks for Faculty users (no semester/section filtering)        |
| `getAllActiveTasks()`                                | -                       | `{success, data/error}`         | Get all active tasks across all departments (for global contributions)             |
| `createTask(userId, userEmail, data)`                | string, string, object  | `{success, id/error}`           | Create new task. Deadline can be a timestamp or `null` ("No official Time limit")  |
| `updateTask(taskId, data)`                           | string, object          | `{success, error?}`             | Update existing task. Deadline can be changed between timestamp and `null`         |
| `getUserTaskCompletions(userId)`                     | string                  | `{success, data/error}`         | Get user's completed tasks                                                         |
| `toggleTaskCompletion(userId, taskId, isCompleted)`  | string, string, boolean | `{success, error?}`             | Toggle task completion                                                             |
| `getOldTasks(userId, department, semester, section)` | strings                 | `{success, data/error}`         | Get tasks past 12h grace period (excludes no-deadline tasks)                       |
| `deleteTask(taskId)`                                 | string                  | `{success, error?}`             | Delete task (admin or CR)                                                          |
| `resetOldTasks(department, semester, section)`       | strings                 | `{success, deletedCount/error}` | Delete all past tasks, skipping no-deadline tasks (admin or CR)                    |

**Task Schema:**

```javascript
{
  id: string,
  title: string,
  description: string,
  details: string,        // Optional
  course: string,
  type: string,           // "assignment", "exam", "quiz"
  department: string,
  semester: string,
  section: string,
  status: string,         // "active", "completed"
  deadline: Timestamp | null // null means "No official Time limit"
}
```

#### Event Operations

| Method                       | Parameters              | Returns                 | Description                                        |
| ---------------------------- | ----------------------- | ----------------------- | -------------------------------------------------- |
| `getEvents(department)`      | string (default: 'ALL') | `{success, data/error}` | Get upcoming events                                |
| `createEvent(data)`          | object                  | `{success, id/error}`   | Create event (admin or CR for own department)      |
| `updateEvent(eventId, data)` | string, object          | `{success, error?}`     | Update existing event (admin or CR for own events) |
| `deleteEvent(eventId)`       | string                  | `{success, error?}`     | Delete event (admin or CR for own events)          |
| `getOldEvents(department)`   | string                  | `{success, data/error}` | Get past events                                    |

#### Role Operations

| Method                 | Parameters | Returns                                     | Description                          |
| ---------------------- | ---------- | ------------------------------------------- | ------------------------------------ |
| `getUserRoles(userId)` | string     | `{success, isAdmin, isCR, isBlocked/error}` | Check user's admin/CR/blocked status |

#### User Management Operations (Admin Only)

| Method                                 | Parameters              | Returns                 | Description                                 |
| -------------------------------------- | ----------------------- | ----------------------- | ------------------------------------------- |
| `getAllUsers()`                        | -                       | `{success, data/error}` | Get all users for admin panel               |
| `updateUserRole(userId, role, value)`  | string, string, boolean | `{success, error?}`     | Set user role (isCR, isBlocked)             |
| `adminUpdateUserProfile(userId, data)` | string, object          | `{success, error?}`     | Admin edit user profile (bypasses cooldown) |

**Event Schema:**

```javascript
{
  id: string,
  title: string,
  description: string,
  department: string,     // specific or "ALL"
  date: Timestamp,
  createdBy: string,      // userId of creator (admin)
  createdAt: Timestamp
}
```

#### Resource Links Operations

| Method                         | Parameters | Returns                 | Description              |
| ------------------------------ | ---------- | ----------------------- | ------------------------ |
| `getResourceLinks(department)` | string     | `{success, data/error}` | Get department resources |

#### Metadata Operations

| Method                              | Parameters     | Returns                 | Description                                                                                                   |
| ----------------------------------- | -------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------- |
| `getDepartments()`                  | -              | `{success, data/error}` | Get list of departments (prioritizes fresh server fetch, multi-structure support, graceful fallback)          |
| `getSemesters()`                    | -              | `{success, data/error}` | Get list of semesters (prioritizes fresh server fetch, multi-structure support, includes alumni / special)   |
| `getSections(department, semester)` | string, string | `{success, data/error}` | Get sections for dept/sem (case-insensitive key matching with automatic default fallback)                    |

---

### 4. Router (routing.js)

**Purpose:** Hash-based SPA routing

#### Routes Configuration

| Hash                 | Route Name       | View ID                 |
| -------------------- | ---------------- | ----------------------- |
| `""` (empty)         | login            | `login-view`            |
| `#/dashboard`        | dashboard        | `dashboard-view`        |
| `#/profile-settings` | profile-settings | `profile-settings-view` |
| `#/set-details`      | set-details      | `set-details-view`      |     
| `#/user-management` | user-management | `user-management-view` |

#### Methods

| Method                    | Parameters | Description                                 |
| ------------------------- | ---------- | ------------------------------------------- |
| `init()`                  | -          | Initialize router, listen for hashchange    |
| `handleRoute()`           | -          | Process current hash, show appropriate view |
| `navigate(route)`         | string     | Navigate to named route                     |
| `showView(viewName)`      | string     | Display specific view, hide others          |
| `onRouteChange(callback)` | function   | Register route change listener              |
| `getCurrentRoute()`       | -          | Get current route name                      |

---

### 5. UI (ui.js)

**Purpose:** UI rendering and manipulation

| Method                                                              | Parameters                              | Description                                                                                                                       |
| ------------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `showLoading(show)`                                                 | boolean                                 | Show/hide loading screen                                                                                                          |
| `showMessage(elementId, message, type)`                             | string, string, string                  | Display message (error/success/info)                                                                                              |
| `hideMessage(elementId)`                                            | string                                  | Hide message element                                                                                                              |
| `updateUserDetailsCard(email, dept, sem, section)`                  | strings                                 | Update navbar user card                                                                                                           |
| `renderResourceLinks(links)`                                        | array                                   | Render resource link cards; detects `.pdf` URLs and intercepts clicks (desktop: opens PDF viewer modal; mobile: opens in new tab) |
| `initPdfViewer()`                                                   | -                                       | Initialize PDF viewer modal: close button and backdrop click listeners                                                            |
| `openPdfViewer(url, title)`                                         | string, string                          | Open PDF in viewer modal using Google Docs Viewer iframe                                                                          |
| `closePdfViewer()`                                                  | -                                       | Close PDF viewer modal and clear iframe                                                                                           |
| `renderTasks(tasks, userCompletions, isAdmin, isCR, currentUserId)` | array, object, boolean, boolean, string | Render task cards with checkboxes, collapsible descriptions, vertical edit/delete buttons                                         |
| `renderOldTasks(tasks)`                                             | array                                   | Render old tasks (past 12h grace period) with completion status                                                                   |
| `renderEvents(events, isAdmin)`                                     | array, boolean                          | Render event cards with edit/delete buttons                                                                                       |
| `renderOldEvents(events)`                                           | array                                   | Render past events list                                                                                                           |
| `populateDropdown(elementId, items, selectedValue)`                 | string, array, string?                  | Populate select dropdown                                                                                                          |
| `showModal(modalId)`                                                | string                                  | Display modal dialog                                                                                                              |
| `hideModal(modalId)`                                                | string                                  | Hide modal dialog                                                                                                                 |
| `toggleEventsSidebar(open)`                                         | boolean                                 | Open/close mobile events sidebar                                                                                                  |
| `toggleAdminControls(isAdmin, isCR)`                                | boolean, boolean                        | Show/hide admin-only and CR elements                                                                                              |
| `toggleBlockedUserMode(isBlocked)`                                  | boolean                                 | Enable/disable read-only mode for blocked users                                                                                   |

---

### 6. Profile (profile.js)

**Purpose:** Profile settings management

| Method                                                       | Parameters | Description                                                                                 |
| ------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------- |
| `init()`                                                     | -          | Initialize profile module                                                                   |
| `setupEventListeners()`                                      | -          | Attach event listeners to profile UI                                                        |
| `loadProfile()`                                              | -          | Load and display user profile, including pre-selecting "Appearance Settings"                |
| `updateSectionDropdown(elementId, dept, sem, selectedValue)` | strings    | Update section dropdown                                                                     |
| `updateCooldownMessage()`                                    | -          | Display remaining days until profile can be changed                                         |
| `handleSaveProfile()`                                        | -          | Save profile changes to Firestore. Note: Theme updates bypass the standard 30-day cooldown. |

**Event Listeners:**

- User details card click → Navigate to profile settings
- Back button → Navigate to dashboard
- Cancel button → Navigate to dashboard
- Logout button → Sign out and reload
- Form submit → Save profile changes
- Department/Semester change → Update section dropdown

---

### 7. NoticeViewer (notice.js)

**Purpose:** UCAM university notice viewer with PDF preview

#### Configuration

```javascript
NoticeViewer.API_BASE = "https://b1t-acad-backend.vercel.app"; // Vercel backend
NoticeViewer.CACHE_KEY = "b1tSched_notices"; // localStorage key
NoticeViewer.CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7-day cache TTL
```

#### Methods

| Method                                         | Parameters               | Description                                                                                                                                                                    |
| ---------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `init()`                                       | -                        | Initialize notice viewer: setup event listeners for desktop modal and mobile sidebar; attach load/close buttons                                                                |
| `checkCache()`                                 | -                        | Check localStorage for cached notices within TTL; returns cached data or `null`                                                                                                |
| `saveToCache(notices)`                         | array                    | Save fetched notices to localStorage with timestamp                                                                                                                            |
| `loadNotices(forceRefresh)`                    | boolean                  | Fetch notices from Vercel backend with cache fallback; renders to desktop and mobile containers. Automatically loads from Vercel Blob storage on init/open. If `forceRefresh` is true (Check Updates button), passes `?refresh=true` to fetch fresh notices from backend server. |
| `renderAllNotices()`                           | -                        | Render notice lists in both desktop and mobile containers                                                                                                                      |
| `renderNoticeList(containerId, isMobile)`      | string, boolean          | Render notice list items into a given container (desktop: clickable list with PDF preview)                                                                                     |
| `renderNoticeListMobile(containerId)`          | string                   | Render mobile-optimized notice list (tap to open PDF in new tab)                                                                                                               |
| `selectNotice(id, clickedItem, listContainer)` | string, element, element | Select a notice: highlight it, load PDF into iframe (desktop only)                                                                                                             |
| `openNoticePdfInNewTab(id)`                    | string                   | Open notice PDF in a new browser tab (mobile)                                                                                                                                  |
| `showLoadingState(isCheckUpdates)`             | boolean                  | Show loading spinner in notice containers with context-specific loading message                                                                                                |
| `scheduleAutoRetry(seconds)`                   | number                   | Schedule automatic reload after a 60-second cooldown when server is starting up or returns 503.                                                                              |
| `manualRetry()`                                | -                        | Instantly cancel retry timers and manually re-trigger notice load.                                                                                                             |
| `clearAutoRetryTimers()`                       | -                        | Reset active auto-retry timeout and countdown interval.                                                                                                                       |
| `showErrorState(message)`                      | string                   | Show error message with live 60s countdown timer and "Retry Now" button in notice containers.                                                                                 |
| `toggleNoticeSidebar(open)`                    | boolean                  | Toggle mobile notice sidebar open/closed with overlay (auto-fetches Vercel Blob notices if not loaded).                                                                        |
| `openNoticeModal()`                            | -                        | Open desktop notice modal (auto-fetches Vercel Blob notices if not loaded).                                                                                                    |
| `closeNoticeModal()`                           | -                        | Close desktop notice modal.                                                                                                                                                    |

**Backend PDF Fetching & Notice Scraping:**
The Vercel backend (`/api/notices`) scans the UCAM portal for new notices. If the primary listing page fails to scrape, it falls back to an ID-probing approach. It starts from a base seed ID (currently defaulting to `760`) and probes up to 20 IDs ahead to find newly uploaded notices. Both Vercel Blob storage (`notices.json` saved via `put()` with `allowExisting: true`) and client-side local storage keep previously loaded notices alongside new ones by merging and deduplicating notices by ID. To reduce loading times and bypass CORS restrictions when downloading PDFs, the backend provides a proxy endpoint (`/api/pdf?id=...`). The client frontend uses this endpoint, allowing the serverless function to download the PDF, attach appropriate headers, and stream it securely to the client.

**Check Updates Logic:** A "Check Updates" button is available in the headers of both mobile and desktop notice views (`refresh-notices-btn-mobile` and `refresh-notices-btn-desktop`). Clicking it passes `?refresh=true` to the backend API, triggering fresh server scraping from UCAM and updating Vercel Blob cloud storage (`allowExisting: true`) for all users.

**Desktop Flow:** Navbar "Notice" button → Modal opens (auto-loads Vercel Blob notices) → Notice list + PDF preview panel (split-pane layout) → Click notice → PDF loads in embedded iframe → Open/Download buttons. Click "Check Updates" to fetch new server notices.

**Mobile Flow:** Floating "Notices" toggle → Sidebar slides in (auto-loads Vercel Blob notices) → Notice list → Tap notice → PDF opens in new tab. Tap "Check Updates" to fetch new server notices.

**Error Handling & Server Cold Start Auto-Retry:** When the Vercel backend is unavailable or warming up (503 error), the app first attempts to load cached notices from `localStorage` (if available within 7-day TTL) and displays a warning banner: "Server unavailable. Showing cached notices." If no cached notices exist in storage, `NoticeViewer` initiates a 60-second auto-retry timer displaying a live countdown ("Server is starting up. Retrying automatically in 60s...") along with a "Retry Now" button to manually bypass the timer.

---

### 8. NoteManager (notes.js)

**Purpose:** Personal note-taking with markdown support, auto-save, merged UI, and comprehensive file upload fallbacks.

#### Configuration

```javascript
NoteManager.autoSaveTimer = null; // Auto-save debounce timer
NoteManager.currentUserId = null; // Current authenticated user
NoteManager.isEditing = false; // State toggle for merged editor
NoteManager.UPLOAD_TIMEOUT = 20000; // 20-second timeout per upload provider
```

#### Methods

| Method                                   | Parameters     | Description                                                                                                 |
| ---------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------- |
| `init()`                                 | -              | Initialize note module with auth listener                                                                   |
| `setupEventListeners()`                  | -              | Attach event listeners for modal, buttons, file input, and editor toggle                                    |
| `enableNoteFeature()`                    | -              | Show note toggle buttons for authenticated users                                                            |
| `disableNoteFeature()`                   | -              | Hide note toggle buttons for unauthenticated users                                                          |
| `openModal()`                            | -              | Open note modal in preview mode and load user's note                                                        |
| `closeModal()`                           | -              | Close note modal                                                                                            |
| `switchToEditor()` / `switchToPreview()` | -              | Toggle between the textarea editor and the live markdown preview pane                                       |
| `handleNoteLinkClick(e)`                 | Event          | Intercept clicks on links in the preview to force immediate download, providing a fallback link             |
| `triggerFileUpload()`                    | -              | Trigger hidden file input click                                                                             |
| `handleFileSelect(event)`                | Event          | Handle file selection and upload process                                                                    |
| `uploadWithFallback(file)`               | File           | Upload file trying multiple providers (Catbox, Tmpfiles) with a 20s timeout race                            |
| `handleShortenNote()`                    | -              | Convert current note text into a downloadable `.md` file, upload it, and replace note content with its link |
| `insertLinkIntoNote(filename, url)`      | string, string | Insert markdown link at cursor position in textarea                                                         |
| `updatePreview(content)`                 | string         | Update preview pane with formatted markdown                                                                 |
| `setupAutoSave(content)`                 | string         | Setup auto-save with 500ms debounce                                                                         |
| `loadNote(userId)`                       | string         | Load note from Firestore                                                                                    |
| `saveNote(userId, content)`              | string, string | Save note to Firestore (max 1MB)                                                                            |
| `handleSave()`                           | -              | Handle manual save button click                                                                             |
| `handleClear()`                          | -              | Handle clear button click with confirmation                                                                 |
| `clearNote(userId)`                      | string         | Clear note from Firestore                                                                                   |
| `validateNoteContent(content)`           | string         | Validate note size (max 1MB)                                                                                |
| `showMessage(message, type)`             | string, string | Display message to user                                                                                     |

**Features:**

- **Merged UI:** Start in preview mode; click/tap the preview to seamlessly switch to editing.
- **Auto-save:** Saves note content automatically with 500ms debounce.
- **Robust File Uploads:** Tries Catbox (up to 200MB) followed by Tmpfiles (up to 100MB), racing against a 20-second timeout per provider.
- **Upload Fallback:** If all automatic uploads fail, shows a helper message suggesting manual upload to file.io.
- **Immediate Downloads:** Clicking a file link in the preview triggers a direct `window.open()` call. If a direct download is blocked or fails (e.g., cross-origin), a helper message appears with platform-specific instructions (Mobile: "press and hold → Open in new tab"; Desktop: "right-click → Save link as...").
- **"Shorten" Automation:** Allows users to convert their entire text note into a hosted `.md` file to save space and simplify sharing.
- **Markdown Links:** Inserts `[filename](url)` at cursor position after upload.
- **Persistent Storage:** Notes stored in Firestore user document (max 1MB).

---

### 9. Utils (utils.js)

**Purpose:** Utility functions

| Function                      | Parameters       | Returns  | Description                                                                                                                                                                         |
| ----------------------------- | ---------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `formatDate(date)`            | Date/string      | string   | Format date with time                                                                                                                                                               |
| `formatDateShort(date)`       | Date/string      | string   | Format date (month, day only)                                                                                                                                                       |
| `daysUntil(date)`             | Date/string      | number   | Calculate days until date                                                                                                                                                           |
| `isValidEmail(email)`         | string           | boolean  | Validate email format                                                                                                                                                               |
| `isValidPassword(password)`   | string           | boolean  | Validate password (min 6 chars)                                                                                                                                                     |
| `truncate(text, maxLength)`   | string, number   | string   | Truncate text with ellipsis                                                                                                                                                         |
| `debounce(func, wait)`        | function, number | function | Debounce function calls                                                                                                                                                             |
| `getSectionGroup(section)`    | string           | string   | Get section group letter (A1 → A)                                                                                                                                                   |
| `getSectionsInGroup(section)` | string           | array    | Get all sections in group (A1 → [A1, A2])                                                                                                                                           |
| `linkify(text)`               | string           | string   | Convert URLs in text to clickable anchor tags                                                                                                                                       |
| `applyBasicMarkdown(text)`    | string           | string   | Legacy helper (unused): applies bold, italic, and inline code. Use `escapeAndLinkify` for full support.                                                                             |
| `escapeAndLinkify(text)`      | string           | string   | Robust rendering pipeline: extracts `<pre>` and code blocks, escapes HTML (XSS-safe), decodes safe HTML entities (math/Greek), applies markdown/linkification, and restores blocks. |

**Storage Helpers (`Utils.storage`):**

| Method            | Parameters  | Returns  | Description              |
| ----------------- | ----------- | -------- | ------------------------ |
| `get(key)`        | string      | any/null | Get from localStorage    |
| `set(key, value)` | string, any | boolean  | Save to localStorage     |
| `remove(key)`     | string      | boolean  | Remove from localStorage |
| `clear()`         | -           | boolean  | Clear all localStorage   |

---

### 10. App (app.js)

**Purpose:** Main application controller

| Method                                        | Parameters       | Description                                                                                                                                          |
| --------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `init()`                                      | -                | Initialize application                                                                                                                               |
| `setupEventListeners()`                       | -                | Setup form and button listeners                                                                                                                      |
| `handleLogin()`                               | -                | Process login form submission                                                                                                                        |
| `handleSignup()`                              | -                | Process signup form submission                                                                                                                       |
| `handlePasswordReset()`                       | -                | Process password reset form submission                                                                                                               |
| `handleAuthenticatedUser(user)`               | User object      | Handle post-authentication flow                                                                                                                      |
| `handleUnauthenticatedUser()`                 | -                | Handle logged out state                                                                                                                              |
| `loadSetDetailsForm()`                        | -                | Load set details form dropdowns                                                                                                                      |
| `updateSetDetailsSections()`                  | -                | Update sections on dept/sem change                                                                                                                   |
| `handleSetDetails()`                          | -                | Process set details form (with studentId)                                                                                                            |
| `loadDashboardData()`                         | -                | Load tasks, events, resources; reapplies active task filter after loading                                                                            |
| `setupTaskEventListeners()`                   | -                | Setup task-related event handlers                                                                                                                    |
| `setupEventsSidebarListeners()`               | -                | Setup mobile sidebar handlers                                                                                                                        |
| `setupAdminEventListeners()`                  | -                | Setup admin-related event handlers                                                                                                                   |
| `handleTaskCompletion(taskId, isCompleted)`   | string, boolean  | Toggle task completion                                                                                                                               |
| `openAddTaskModal()`                          | -                | Open add task modal                                                                                                                                  |
| `handleAddTask()`                             | -                | Process add task form. Supports two deadline options: (1) No official Time limit (stores deadline as null), or (2) a specific date/time.             |
| `openOldTasksModal()`                         | -                | Open completed tasks modal                                                                                                                           |
| `handleResetTasks()`                          | -                | Reset all old tasks (admin or CR)                                                                                                                    |
| `handleDeleteTask(taskId)`                    | string           | Delete task (admin or CR)                                                                                                                            |
| `openEditTaskModal(taskId)`                   | string           | Open edit task modal with pre-filled data                                                                                                            |
| `handleEditTask()`                            | -                | Process edit task form submission. Supports two deadline options: (1) No official Time limit (stores deadline as null), or (2) a specific date/time. |
| `openAddEventModal()`                         | -                | Open add event modal (admin)                                                                                                                         |
| `handleAddEvent()`                            | -                | Process add event form (admin)                                                                                                                       |
| `handleDeleteEvent(eventId)`                  | string           | Delete event (admin)                                                                                                                                 |
| `openEditEventModal(eventId)`                 | string           | Open edit event modal with pre-filled data (admin)                                                                                                   |
| `handleEditEvent()`                           | -                | Process edit event form submission (admin)                                                                                                           |
| `openOldEventsModal()`                        | -                | Open past events modal                                                                                                                               |
| `setupUserManagementListeners()`              | -                | Setup user management event handlers                                                                                                                 |
| `loadUserManagement()`                        | -                | Load all users for admin panel                                                                                                                       |
| `renderUserList(users)`                       | array            | Render user cards in admin panel                                                                                                                     |
| `filterUsers()`                               | -                | Filter users by department/semester/section/role                                                                                                     |
| `clearUserFilters()`                          | -                | Reset all user filters                                                                                                                               |
| `toggleUserRole(userId, role, value)`         | strings, boolean | Toggle user role (isCR, isBlocked)                                                                                                                   |
| `openEditUserModal(userId)`                   | string           | Open edit user modal                                                                                                                                 |
| `updateEditUserSections(selectedValue)`       | string?          | Update sections in edit user modal                                                                                                                   |
| `handleEditUser()`                            | -                | Process edit user form (admin)                                                                                                                       |
| `handleEditUser()`                            | -                | Process edit user form (admin)                                                                                                                       |
| `handleAdminPasswordReset(userId, userEmail)` | string, string   | Send password reset email (admin) using Client SDK to bypass CORS                                                                                    |
| `openDeleteUserDialog(userId, email)`         | string, string   | Open delete user confirmation dialog                                                                                                                 |
| `handleDeleteUser(userId)`                    | string           | Delete user account (admin)                                                                                                                          |

**Application State:**

```javascript
App.userProfile = {
  email: string,
  studentId: string,
  department: string,
  semester: string,
  section: string,
};
App.userCompletions = {}; // Task completion states
App.currentTasks = []; // Loaded tasks
App.currentEvents = []; // Loaded events
App.isAdmin = false; // Admin privileges
App.isCR = false; // CR (Class Representative) privileges
App.isFaculty = false; // Faculty privileges
App.isBlocked = false; // Blocked/restricted user status
App.allUsers = []; // All users (admin panel)
App.isSigningUp = false; // Flag to prevent auth state handling during signup
```

**Signup Race Condition Prevention:**

During signup, Firebase triggers `onAuthStateChanged` immediately when the user is created (before email verification). Without protection, this would cause `handleAuthenticatedUser()` to run and display an error message ("Please verify your email...") that overwrites the success message. The `isSigningUp` flag prevents auth state handling during the signup process:

1. Flag is set before `Auth.signup()` is called
2. `onAuthStateChanged` callback checks the flag and skips handling
3. Flag is cleared after logout completes (success) or on error

---

### 11. CalendarView (calendar-view.js)

**Purpose:** Manages the interactive calendar modal, displaying tasks and events in a monthly or weekly view (mobile).

**Key Features:**

- **Responsive Views:** Full monthly grid on desktop; monthly or weekly view on mobile with toggle.
- **Mobile Monthly View:** Compact date grid with week numbers, maroon dot indicators for dates with tasks, today highlight (maroon circle), Sunday red text, other-month grayed dates. Tapping a date shows a task list panel with course name + task title + deadline time. Uses light maroon+white theme matching the website.
- **Mobile Weekly View:** Vertically scrolling week cards with task details per day.
- **Monthly/Weekly Toggle:** Both mobile views include toggle buttons (Monthly/Weekly) to switch between views.
- **Task Visualization:** Displays tasks on their due dates with type-specific badges.
- **Event Visualization:** Displays events on their scheduled dates.
- **Interactive Navigation:**
  - **Month/Year Dropdowns:** Direct navigation to specific months and years.
  - **Arrow Navigation:** Move to previous/next month.
  - **Keyboard Support:** Arrow keys (Ctrl+Left/Right) for navigation, Escape to close.
- **Task Details:** Click on a task to view full details (description, course, type).
- **Empty State Handling:** Displays "No tasks scheduled for this month" when appropriate.
- **Loading States:** Visual feedback during data fetching/rendering.

| Method   | Description                                               |
| -------- | --------------------------------------------------------- |
| `init()` | Initialize the calendar module (attach global listeners). |
| `open()` | Open the calendar modal and render the current view.      |

---

### 12. Classroom (classroom.js)

**Purpose:** Google Classroom API integration for fetching courses, assignments, announcements, and posted course materials.

**Authentication & Session Persistence:**

- Uses **Google Identity Services (GIS)** for OAuth 2.0 with scopes for courses, coursework, announcements, and coursework materials (`https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly`).
- Implements a promise-based initialization (`init()`) synchronized with the main application loading screen.
- **Persistent Connection & Expired Token Banner**: The `classroom_connected` flag remains intact across access token expirations ($1\text{ hour}$). When a stored access token expires, `b1t-Sched` avoids disruptive background iframe/popup flashes and prevents blank unauthorized API views by immediately displaying cached assignments, announcements, and materials alongside a 1-click **Reconnect** banner. Clicking **Reconnect** calls `Classroom.login()`, opening the Google authentication prompt to obtain a fresh token without requiring manual sign-out.
- **Mobile Header Responsiveness**: On mobile screen sizes (`@media (max-width: 768px)` and mobile sidebar drawer), `.classroom-view-header` flexes vertically into a stacked 2-line layout. Line 1 displays the back button and full course title; line 2 displays full-width view toggle buttons (**To-Do**, **Notices**, **Materials**), eliminating horizontal title truncation and button crowding.
- **Unified Sign Out Button**: A single pill-styled Sign Out button (`.classroom-header-logout-btn`, `border-radius: 20px`) is embedded in top window title headers (`#classroom-sidebar` mobile and `#classroom-modal` desktop). The button is dynamically displayed only when logged in / connected. Explicit logout revokes the OAuth token, clears local storage connection flags, clears cache, and resets the view to the login prompt.
- **Archived Classrooms Management**: Fetches both active and archived courses (`courseStates=ACTIVE&courseStates=ARCHIVED`). Archived classrooms are hidden by default in the "My Classes" view, with a toggle button to expand/hide them. Unified feeds (**To-Do**, **Notices**, **Materials**) strictly filter out content from archived courses.
- **Client JSON Template Caching & Persistent Reconnect Footer**: Serializes user courses, assignments, notices, and materials into a structured JSON template (`classroom_cached_json`) saved to `localStorage` (mirrored in `sessionStorage`) for persistent offline access across browser tab closures and token expirations. When cached content is displayed due to an expired session, a sticky bottom footer bar (`#classroom-footer-mobile` and `#classroom-footer-desktop`) is rendered with a narrow banner (`"Cached Content, login again to see new data"`) and a persistent `"Reconnect Classroom"` button (`Classroom.login()`).
- **Vertical To-Do Multi-Group Hierarchy & Deadline Priority**: Automatically organizes assignments into hierarchical vertical sections:
  1. **Active Upcoming Deadlines**: Tasks with future due dates prioritized at the very top, sorted chronologically (earliest deadline first) so upcoming work is immediately actionable.
  2. **Assigned (No Due Date)**: Tasks without deadlines listed directly below upcoming deadlines.
  3. **Past Deadline Tasks**: Unsubmitted/overdue tasks grouped under a compact `"Past deadline"` divider banner with task count badge (`<i class="fa-solid fa-clock-rotate-left"></i>`). The banner is conditionally shown when active upcoming/assigned tasks exist above it.
  4. **Completed Tasks**: Submitted, graded, or returned tasks grouped under a `"Completed"` divider banner (`<i class="fa-solid fa-circle-check"></i>`), sub-divided so completed tasks whose deadline is still open appear first, followed by a `"Past deadline"` sub-banner and completed tasks submitted late/past deadline.
- **Desktop Window Border Padding Elimination**: Excludes `#classroom-modal .modal-content` and `.classroom-modal-content` from default modal padding on 769px–1366px displays and height-constrained screens, rendering flush without border clipping or nested whitespace.
- **Materials Change Detection**: Live updates to course materials (new Drive files, YouTube links, Forms, or descriptions) are dynamically recognized via `updateTime` comparison and rendered as interactive attachment pills.

**Properties:**

- `accessToken`: Current OAuth 2.0 access token.
- `courses`: Cached list of enrolled active and archived courses.
- `currentView`: Active view mode (`'todo'`, `'notifications'`, or `'materials'`).
- `showArchivedCourses`: Flag for toggling archived course card visibility in "My Classes".
- `hasExpiredSession`: Flag indicating cached display mode with re-connect banner.
- `JSON_CACHE_KEY`: Storage key for the JSON snapshot (`'classroom_cached_json'`).
- `_authResolve`: Internal resolver to signal authentication completion to the main app.

| Method                           | Parameters | Returns | Description                                                                                        |
| -------------------------------- | ---------- | ------- | -------------------------------------------------------------------------------------------------- |
| `init()`                         | -          | Promise | Initialize GIS client and check for persisted session.                                             |
| `checkPersistedSession()`        | -          | Promise | Check storage for valid token or attempt silent refresh without clearing connection state.          |
| `login()`                        | -          | void    | Trigger manual OAuth login popup.                                                                  |
| `handleAuthSuccess(response)`    | object     | void    | Handle successful token acquisition and start data fetching.                                       |
| `fetchCoursesAndLoadAll()`       | -          | void    | Batch load active/archived courses and load unified items based on `currentView`.                  |
| `loadAllMaterials()`             | -          | Promise | Fetch posted materials across all active courses within the date cutoff and render.                |
| `fetchCourseMaterials(courseId)` | string     | Promise | Fetch posted materials for a specific course ID.                                                   |
| `saveJsonCache(dataType, data)`  | string, arr| void    | Serialize structured Classroom state into local/session JSON cache.                                |
| `getJsonCache()`                 | -          | obj|null | Retrieve and parse the cached JSON snapshot from storage.                                          |
| `clearJsonCache()`               | -          | void    | Clear local and session JSON template cache entries.                                               |
| `updateBottomCachedFooter(show, timeLabel)` | bool, str | void | Toggle and render the persistent bottom cached content banner and Reconnect button.               |
| `openUnifiedView()`              | -          | void    | Reset `currentCourseId` to `null` and return to the default unified view feed.                     |
| `toggleArchivedCourses()`        | -          | void    | Toggle visibility of archived classroom cards in the "My Classes" view.                            |
| `toggleItemExpand(event, btn)`   | Event, Elem| void    | Toggle inline expansion of truncated description/text details for a Classroom list item.           |
| `copyItemText(event, btn)`       | Event, Elem| Promise | Copy item title/caption text to system clipboard with temporary checkmark visual feedback.           |
| `handleItemClick(event, link)`   | Event, Link| void    | Delegate row clicks to open the item URL while ignoring clicks on nested buttons and links.        |
| `renderItemAttachments(materials)`| Array     | string  | Render Google Drive files, YouTube videos, web links, and forms as clickable attachment pills.     |
| `getAssignmentStatusInfo(item)`  | object     | object  | Compute detailed status badge info (`label`, `className`, `icon`) for Missing, Assigned, Turned in, and Returned/Graded states. |
| `sortAssignments(assignments)`   | Array      | Array   | Sort assignments into vertical groups (Upcoming deadlines first, Assigned with no due date, Past deadline, Completed below) in ascending due dates. |
| `syncTurnedInAssignmentsToUserCompletions(assignments)` | Array | Promise | Automatically mark matching tasks in Pending Tasks as checked/completed for turned-in or graded assignments. |
| `updateLogoutButtonVisibility()` | -          | void    | Dynamically show or hide header Sign Out buttons based on connection state.                        |
| `syncAssignmentsToTasks()`       | -          | void    | (Admin/CR only) Sync assignments to main task list with two-way additions and deadline updates.    |
| `logout()`                       | -          | void    | Explicitly revoke OAuth token, clear local storage connection flags, clear cache, and reset state. |
| `cleanupSession()`               | -          | void    | Reset module memory state and render initial login screen.                                         |
| `close()`                        | Close the calendar modal.                                                                                                                                    |
| `renderCalendar()`               | Main render function; delegates to `generateCalendarGrid` (desktop), `renderMonthlyViewMobile` or `renderWeeklyView` (mobile, based on `currentMobileView`). |
| `renderMonthlyViewMobile()`      | Renders the compact monthly grid for mobile with toggle, day headers, date cells, dot indicators, and task list panel.                                       |
| `renderWeeklyView()`             | Renders the weekly scrolling view for mobile with toggle buttons.                                                                                            |
| `updateHeader()`                 | Updates the Month/Year dropdowns and navigation state.                                                                                                       |
| `previousMonth()`                | Navigate to the previous month.                                                                                                                              |
| `nextMonth()`                    | Navigate to the next month.                                                                                                                                  |
| `populateTasksInGrid()`          | Places task elements into the correct day cells.                                                                                                             |
| `isTaskOverdue(task)`            | Checks if a task is overdue.                                                                                                                                 |

---

### 12. PWA Modules

**Purpose:** Progressive Web App functionality for offline support, caching, and installability

#### PWA Detector (`js/pwa-detector.js`)

- Detects existing PWA configuration
- Validates manifest file and service worker registration
- Generates recommendations for missing components

#### Manifest Generator (`js/manifest-generator.js`)

- Creates web app manifest with required fields
- Validates manifest completeness
- Links manifest in HTML head

#### Cache Manager (`js/cache-manager.js`)

- Caches authentication state (24-hour expiration)
- Caches Google Classroom data (1-hour expiration)
- Independent caching for assignments and announcements
- Cache freshness checking and storage quota management

#### Install Prompt Manager (`js/install-prompt.js`)

- Captures `beforeinstallprompt` event
- Shows custom install prompt UI
- Handles user dismissal preferences
- Detects if app is already installed
- iOS-specific installation instructions

#### Offline Manager (`js/offline-manager.js`)

- Queues write operations when offline
- Processes queued operations when connection restored
- Supports task and event operations
- Background sync capability

#### Offline Indicator (`js/offline-indicator.js`)

- Visual indicator when user is offline
- Shows "You're offline. Showing cached content."
- Dedicated space layout: measures rendered banner height via `ResizeObserver` and sets `--offline-banner-height` CSS custom property to push the fixed navbar, main content, sidebars, mobile navigation drawer, and login screen down cleanly without overlaying content
- Automatically hides and resets `--offline-banner-height` to `0px` when connection is restored
- Smooth transitions on navbar top and main content padding

#### SW Update Manager (`js/sw-update-manager.js`)

- Detects service worker updates
- Notifies user when new version available
- Handles update acceptance and reload
- Periodic update checks (every hour)

#### PWA Initialization (`js/pwa-init.js`)

- Orchestrates all PWA components
- Auto-initializes on page load
- Graceful degradation if features unavailable

---

### 12. Push Notifications System

**Purpose:** Real-time browser notifications for new tasks and events

#### Permission Manager (`js/permission-manager.js`)

- Manages notification permission state
- Requests permission from users
- Provides browser-specific instructions for enabling notifications
- Handles permission prompt UI interactions

#### Notification Content Formatter (`js/notification-content-formatter.js`)

- Formats task and event data for notifications
- Truncates content to fit notification size constraints (50 chars title, 150 chars body)
- Formats dates/times in user-friendly format

#### Notification Manager (`js/notification-manager.js`)

- Core notification system controller
- Checks browser API support
- Displays task, event, and CR notice notifications
- Urgent notices use `requireInteraction: true` to persist until dismissed
- Handles notification click events (navigates to dashboard)

#### Firestore Listener Manager (`js/firestore-listener-manager.js`)

- Sets up real-time listeners on tasks, events, and CR notices collections
- Detects new documents (ignores initial load)
- Filters by user's department, semester, and section (notices use section group)
- Triggers notifications when new items are added

---

### 13. Classroom (classroom.js)

**Purpose:** Google Classroom API integration for viewing assignments and announcements

#### Configuration

```javascript
Classroom.CLIENT_ID =
  "142195418679-0ripc2dn76otvkvfnk6kdk2aitdd29rm.apps.googleusercontent.com";
Classroom.SCOPES =
  "https://www.googleapis.com/auth/classroom.courses.readonly ...";
Classroom.DATE_FILTER_MONTHS = 6; // Only show items from last 6 months
```

#### Methods

| Method                              | Parameters     | Description                                                                      |
| ----------------------------------- | -------------- | -------------------------------------------------------------------------------- |
| `init()`                            | -              | Initialize Google Classroom module with retry logic for Google Identity Services |
| `setupEventListeners()`             | -              | Attach click listeners to toggle buttons and close buttons with null checks      |
| `openClassroomParams()`             | -              | Open classroom interface (sidebar on mobile, modal on desktop)                   |
| `toggleSidebar(open)`               | boolean        | Open/close mobile classroom sidebar                                              |
| `toggleModal(open)`                 | boolean        | Open/close desktop classroom modal                                               |
| `login()`                           | -              | Request Google OAuth access token                                                |
| `logout()`                          | -              | Revoke Google OAuth access token                                                 |
| `handleAuthSuccess()`               | -              | Handle successful authentication                                                 |
| `fetchCoursesAndLoadAll()`          | -              | Fetch all active courses and load unified assignments view                       |
| `loadAllAssignments()`              | -              | Load all assignments from all active courses (unified view)                      |
| `loadAllAnnouncements()`            | -              | Load all announcements from all active courses (unified view)                    |
| `switchView(view)`                  | string         | Toggle between 'todo' and 'notifications' views                                  |
| `renderAllItems(items, viewType)`   | array, string  | Render unified list of assignments or announcements                              |
| `renderUnifiedListItem(item, type)` | object, string | Render individual item with course badge                                         |
| `renderInitialState()`              | -              | Render login prompt                                                              |
| `renderLoading(message)`            | string         | Show loading indicator                                                           |
| `renderError(message)`              | string         | Show error message                                                               |

**Features:**

- **Unified View:** Shows all assignments/announcements from all enrolled courses in one list
- **Course Filtering:** Only fetches from ACTIVE courses (excludes archived/deleted courses)
- **Date Filtering:** Configurable date range (default: last 6 months) to exclude old items
- **Course Badges:** Each item displays which course it belongs to
- **Toggle View:** Switch between To-Do (assignments) and Notices (announcements)
- **Responsive:** Mobile sidebar and desktop modal
- **OAuth Authentication:** Separate from Firebase auth, uses Google Identity Services
- **OAuth Authentication:** Separate from Firebase auth, uses Google Identity Services
- **Session Persistence:** Automatically restores session on page reload using `localStorage` and silent token refresh
- **Auto-Refresh:** Proactively refreshes access tokens 5 minutes before expiry to prevent session timeouts
- **Retry Logic:** Automatically retries initialization if Google Identity Services isn't loaded yet
- **Cache Fallback:** If the session is expired, shows cached assignments/announcements with an amber expiry banner instead of a broken login UI flash.
- **Manual Refresh:** Adds a dedicated refresh button (🔄) to manually clear cache and fetch fresh Classroom data.

**Date Filter Configuration:**

To adjust the time range for fetching assignments/announcements, modify the `DATE_FILTER_MONTHS` constant at the top of `classroom.js`:

```javascript
DATE_FILTER_MONTHS: 6,  // Change to 3, 12, etc.
```

**Desktop Flow:** Navbar "Classroom" button → Modal opens → Sign in with Google → View all assignments (default) → Toggle to Notices → Click item to open in Google Classroom

---

### 14. TaskExport (task-export.js)

**Purpose:** Comprehensive multi-format task schedule exporter supporting TXT, Markdown (.md), and pure vector PDF with selectable text and embedded clickable hyperlinks.

#### Methods

| Method | Parameters | Returns | Description |
| --- | --- | --- | --- |
| `init()` | - | void | Initialize task export module; attaches listeners to open/close buttons, format pills, and export scope buttons. |
| `openModal()` | - | void | Opens export modal, highlights current format, and displays active filter status. |
| `closeModal()` | - | void | Closes export modal dialog. |
| `getActiveTaskFilter()` | - | string | Reads selected dashboard task filter radio (`'exam'`, `'assignment'`, `'homework'`, etc.) or returns `'all'`. |
| `getTasksForExport(scope)` | string (`'current'` \| `'all'`) | Promise\<Object\> | Fetches tasks for user profile; tags archived tasks (`isOldTask`), applies active task filter, sorts by deadline, and computes metadata. |
| `handleExport(scope)` | string | Promise\<void\> | Main orchestrator to trigger format generation and download for selected scope. |
| `generateTxt(tasks, meta)` | Array, Object | string | Generates plain text export dividing tasks with `/////   /////   /////` and inserting `OLD TASKS` divider. |
| `generateMd(tasks, meta)` | Array, Object | string | Generates Markdown export with metadata block, task dividers, and centered `# 📂 OLD TASKS` header. |
| `ensureJsPdfLoaded()` | - | Promise\<Class\> | Resolves `jsPDF` constructor from global namespace or dynamically loads standalone CDN script. |
| `parseRichTokens(text)` | string | Array\<Object\> | Parses text into plain text chunks and clickable link tokens (markdown `[Title](URL)` and raw URLs). |
| `measureRichTextHeight(doc, text, ...)` | Object, string, ... | number | Accurately calculates wrapped text height for PDF page-break calculations. |
| `renderRichTextWithLinks(doc, text, ...)` | Object, string, ... | number | Renders wrapped text in PDF with clickable blue hyperlinks (`doc.link()`). |
| `generatePdf(tasks, meta, filename)` | Array, Object, string | Promise\<void\> | Generates pure vector PDF with 120% scale, pure black selectable text, straight line dividers, clickable header/footer links, active filter heading, and dedicated Old Tasks pagebreak. |
| `downloadFile(filename, content, mime)` | string, string, string | void | Triggers browser download for generated text/markdown blobs. |

**Key Features:**
- **Vector PDF Output:** 100% selectable text in pure black `#000000` rendered directly with `jsPDF` (no blank canvas or rasterized screenshots).
- **Clickable Links:** Embedded description links and attached links styled in blue and registered with native PDF link annotations. Header logo `b1t-Sched` and footer brand text link to `https://b1tsched.netlify.app/`.
- **120% Scale Typography:** Proportioned font sizing and line spacing for readability.
- **Conditional Task Filtering:** Automatically exports only the active task type (e.g. `Exam`, `Assignment`) if filtered on the dashboard, with a central heading indicating the filtered type.
- **Old Tasks Separation:** "Export All Tasks" organizes active tasks first, followed by a page break and an **`OLD TASKS`** heading before listing past/archived tasks.

---

## Styling System

### CSS Architecture

```
colors.css          → CSS Variables (Theme)
    ↓
main.css            → Core Styles, Layouts
    ↓
components.css      → Reusable Components
    ↓
dashboard.css       → Dashboard Layout, Modals, Admin Controls
    ↓
navbar.css          → Navigation Specific
user-details-card.css → User Card Specific
notice.css          → Notice Viewer (Modal + Sidebar + PDF panel) + Quick Links PDF Viewer Modal
    ↓
responsive.css      → Media Queries + Zoom Normalization
```

### Theme Colors (CSS Variables)

```css
/* Primary Maroon Colors */
--primary-maroon: #800000;
--secondary-maroon: #660000;
--accent-maroon: #a00000;
--light-maroon: #b30000;
--maroon-hover: #990000;

/* Background Colors */
--bg-light: #f5f3f0;
--bg-lighter: #f9f7f4;
--bg-white: #ffffff;
--bg-dark: #e8e6e3;

/* Text Colors */
--text-dark: #333333;
--text-medium: #666666;
--text-light: #999999;
--text-white: #ffffff;

/* Status Colors */
--info: #17a2b8;
--danger: #dc3545;

/* Theme Overrides are applied via body classes: .dark-mode, .gray-mode */
```

### Gray Mode Theme

The Gray Mode theme provides a high-contrast, low-brightness monochromatic experience. It is the default fallback for system dark mode users.

**Key Gray Mode Variables:**

- `--primary-maroon`: #ff6360 (Vibrant coral accent)
- `--bg-dark`: #161616
- `--text-dark`: #eae9f1
- `--border-medium`: #404040

### Dark Mode (Realtime Colors)

The standard dark theme uses a high-contrast palette with deep backgrounds (#000000) and lime/yellow accents.

### Spacing Scale

| Variable        | Value |
| --------------- | ----- |
| `--spacing-xs`  | 4px   |
| `--spacing-sm`  | 8px   |
| `--spacing-md`  | 16px  |
| `--spacing-lg`  | 24px  |
| `--spacing-xl`  | 32px  |
| `--spacing-xxl` | 48px  |

### Typography Scale

| Variable     | Value |
| ------------ | ----- |
| `--font-xs`  | 12px  |
| `--font-sm`  | 14px  |
| `--font-md`  | 16px  |
| `--font-lg`  | 18px  |
| `--font-xl`  | 24px  |
| `--font-xxl` | 32px  |

### Responsive Breakpoints

```css
/* Tablet */
@media (max-width: 768px) { ... }

/* Mobile */
@media (max-width: 480px) { ... }
```

### Zoom Normalization

CSS `zoom` is applied per screen width to prevent UI overflow on devices that render at non-standard zoom levels. Supported in Chromium-based browsers (Chrome, Edge, Opera, Samsung Internet).

| Screen Width | Zoom |
| ------------ | ---- |
| ≤ 360px      | 85%  |
| 361–480px    | 90%  |
| 481–768px    | 95%  |
| 769–1920px   | 100% |
| 1921px+      | 110% |

---

## Firebase/Firestore Data Model

### Collections Structure

```
Firestore Database
│
├── users/                      # User profiles
│   └── {userId}/
│       ├── email: string
│       ├── studentId: string   # 10-16 digits
│       ├── department: string
│       ├── semester: string
│       ├── section: string
│       ├── isAdmin: boolean    # Optional - admin privileges
│       ├── isCR: boolean       # Optional - CR privileges
│       ├── isFaculty: boolean  # Optional - Faculty privileges
│       ├── isBlocked: boolean  # Optional - blocked/restricted user
│       ├── lastProfileChange: timestamp  # Optional - 30-day cooldown
│       ├── lastProfileChangeByAdmin: timestamp  # Optional - admin edit
│       ├── noteContent: string # Optional - user's personal notes (max 1MB)
│       ├── noteUpdatedAt: timestamp # Optional - last note update
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       └── completedTasks/     # Subcollection: task completions
│           └── {taskId}/
│               └── completedAt: timestamp
│
├── tasks/                      # Academic tasks
│   └── {taskId}/
│       ├── title: string
│       ├── description: string
│       ├── details: string?
│       ├── course: string
│       ├── type: string        # "assignment"|"exam"|"quiz"
│       ├── department: string
│       ├── semester: string
│       ├── section: string
│       ├── status: string      # "active"|"completed"
│       └── deadline: timestamp|null  # null = "No official Time limit"
│
├── events/                     # Academic events
│   └── {eventId}/
│       ├── title: string
│       ├── description: string
│       ├── department: string  # or "ALL"
│       ├── date: timestamp
│       ├── createdBy: string   # userId (admin or CR)
│       ├── createdByName: string # "Admin" or "CR"
│       └── createdAt: timestamp
│
├── resourceLinks/              # Department resources
│   └── {department}/           # e.g., "CSE", "IT"
│       └── resources: [
│           {
│             title: string,
│             description: string,
│             url: string,
│             icon: string      # emoji or icon code
│           }
│         ]
│
└── metadata/                   # App metadata
    ├── departments/
    │   └── list: ["CSE", "IT", "CE", "EEE", "BBA"]
    │
    ├── semesters/
    │   └── list: ["1st", "2nd", ..., "8th"]
    │
    └── sections/
        └── {dept}-{sem}: ["A1", "A2", "B1", "B2"]
│
├── cr_notices/                 # CR-posted class notices
│   └── {noticeId}/
│       ├── title: string       # Notice title (max 200 chars)
│       ├── description: string # Notice body (max 2000 chars)
│       ├── department: string  # Auto-filled from poster's profile
│       ├── semester: string    # Auto-filled from poster's profile
│       ├── section: string     # Section group letter (e.g., "B")
│       ├── priority: string    # "normal" | "important" | "urgent"
│       ├── deadline: string|null # Optional ISO datetime or null
│       ├── createdBy: string   # userId of poster
│       ├── createdByName: string # Email username of poster
│       └── createdAt: timestamp
│
├── activity_timeline/          # Immutable activity logs
│   └── {activityId}/
│       ├── activityType: string # "login" | "task_add" | "event_add" | etc.
│       ├── timestamp: timestamp
│       ├── userId: string
│       ├── userName: string
│       └── userRole: string
│
├── activity_logs/              # Legacy activity logs (backward compat)
│   └── {logId}/
│       └── ...
│
├── facultyTokens/              # Faculty auth tokens
│   └── {facultyId}/
│       └── ...
│
└── adminLogs/                  # Admin action logs
    └── {logId}/
        └── ...
```

### Firestore Security Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }

    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // Helper function to check if user is admin
    function isAdmin() {
      return isSignedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Helper function to check if user is CR
    function isCR() {
      return isSignedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isCR == true;
    }

    // Helper function to check if user is blocked
    function isBlocked() {
      return isSignedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isBlocked == true;
    }

    // Users collection
    match /users/{userId} {
      // Users can read their own profile; Admins can read all users
      allow read: if isOwner(userId) || isAdmin();

      // Users can create their own profile
      allow create: if isSignedIn() && request.auth.uid == userId;

      // Users can update their own profile (if not blocked); Admins can update any
      allow update: if (isOwner(userId) && !isBlocked()) || isAdmin();

      // Only admins can delete user profiles
      allow delete: if isAdmin();
    }

    // Task completions subcollection (user's personal completion status)
    match /users/{userId}/completedTasks/{taskId} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId) && !isBlocked();
    }

    // Tasks collection
    match /tasks/{taskId} {
      // Anyone authenticated can read
      allow read: if isSignedIn();

      // Create: authenticated and not blocked
      allow create: if isSignedIn() && !isBlocked();

      // Update: Admin or task owner (if not blocked)
      allow update: if isSignedIn() && (
        isAdmin() ||
        (resource.data.addedBy == request.auth.uid && !isBlocked())
      );

      // Delete: Admin, CR, or task owner (if not blocked)
      allow delete: if isSignedIn() && (
        isAdmin() ||
        isCR() ||
        (resource.data.addedBy == request.auth.uid && !isBlocked())
      );
    }

    // Helper function to get user's semester
    function getUserSemester() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.semester;
    }

    // Helper function to validate required event fields
    function hasRequiredEventFields() {
      return request.resource.data.keys().hasAll(['title', 'description', 'date', 'department', 'semester', 'createdBy']) &&
             request.resource.data.title is string && request.resource.data.title.size() > 0 &&
             request.resource.data.description is string && request.resource.data.description.size() > 0 &&
             request.resource.data.department is string && request.resource.data.department.size() > 0 &&
             request.resource.data.semester is string && request.resource.data.semester.size() > 0 &&
             request.resource.data.createdBy is string && request.resource.data.createdBy.size() > 0;
    }

    // Events collection - Admin full access, CR limited access (semester-based)
    match /events/{eventId} {
      allow read: if isSignedIn();

      // Admin can create any event; CR can create events for their own semester
      allow create: if isAdmin() || (
        isCR() &&
        hasRequiredEventFields() &&
        request.resource.data.createdBy == request.auth.uid &&
        request.resource.data.semester == getUserSemester()
      );

      // Admin can edit any event; CR can edit only their own events (cannot change createdBy or semester)
      allow update: if isAdmin() || (
        isCR() &&
        resource.data.createdBy == request.auth.uid &&
        !request.resource.data.diff(resource.data).affectedKeys().hasAny(['createdBy']) &&
        (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['semester']) ||
         request.resource.data.semester == getUserSemester())
      );

      // Admin can delete any event; CR can delete only their own events
      allow delete: if isAdmin() || (
        isCR() &&
        resource.data.createdBy == request.auth.uid
      );
    }

    // Admin logs collection - Admin only
    match /adminLogs/{logId} {
      allow read, write: if isAdmin();
    }

    // Resource links - read only for users, admin can write
    match /resourceLinks/{department} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }

    // Metadata - read only for users, admin can write
    match /metadata/{document=**} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
  }
}
```

### User Role Permissions Summary

#### Role Descriptions

- **Blocked User** — Account suspended by Admin. Read-only access to all public data. Cannot add, edit, or delete anything.
- **Regular User (Student)** — Default role after sign-up. Can create/edit/delete own tasks, complete tasks, change own profile (30-day cooldown), take notes, and view notices.
- **CR (Class Representative)** — Section leader. Can reset/delete all tasks in their section, create events for their semester, post notices visible to their section group (e.g., B1+B2), and edit/delete own notices.
- **Faculty** — Views department-wide tasks (no semester/section filter). Can create events for their department and edit/delete own events.
- **Admin** — Full access. Can manage users, assign roles, reset passwords, create/edit/delete any tasks/events/notices, and access admin logs.

#### Permissions Matrix

| Action                            | Blocked       | Student             | CR              | Faculty        | Admin           |
| --------------------------------- | ------------- | ------------------- | --------------- | -------------- | --------------- |
| Read tasks                        | ✓ (read-only) | ✓                   | ✓               | ✓ (dept-wide)  | ✓               |
| Create tasks                      | ✗             | ✓                   | ✓               | ✓              | ✓               |
| Edit own tasks                    | ✗             | ✓                   | ✓               | ✓              | ✓               |
| Edit any task                     | ✗             | ✗                   | ✗               | ✗              | ✓               |
| Delete own tasks                  | ✗             | ✓                   | ✓               | ✓              | ✓               |
| Delete any task                   | ✗             | ✗                   | ✓               | ✗              | ✓               |
| Reset tasks                       | ✗             | ✗                   | ✓               | ✗              | ✓               |
| Mark tasks complete               | ✗             | ✓                   | ✓               | ✓              | ✓               |
| Read events                       | ✓             | ✓                   | ✓               | ✓              | ✓               |
| Create events (own dept/sem)      | ✗             | ✗                   | ✓ (semester)    | ✓ (department) | ✓               |
| Edit/Delete own events            | ✗             | ✗                   | ✓               | ✓              | ✓               |
| Edit/Delete any event             | ✗             | ✗                   | ✗               | ✗              | ✓               |
| Read CR notices (section group)   | ✓ (read-only) | ✓                   | ✓               | ✓              | ✓               |
| Create CR notices (section group) | ✗             | ✗                   | ✓ (auto-filled) | ✗              | ✓ (any section) |
| Edit CR notices                   | ✗             | ✗                   | ✓ (own only)    | ✗              | ✓ (any)         |
| Delete CR notices                 | ✗             | ✗                   | ✓ (own)         | ✗              | ✓               |
| Change own profile                | ✗             | ✓ (30-day cooldown) | ✓               | ✓              | ✓               |
| Manage users                      | ✗             | ✗                   | ✗               | ✗              | ✓               |
| Assign/remove roles               | ✗             | ✗                   | ✗               | ✗              | ✓               |
| Send password reset               | ✗             | ✗                   | ✗               | ✗              | ✓               |
| Delete users                      | ✗             | ✗                   | ✗               | ✗              | ✓               |

---

## User Flows

### 1. New User Registration Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Login     │    │   Signup    │    │ Set Details │    │  Dashboard  │
│    View     │───▶│    Form     │───▶│    Form     │───▶│    View     │
│             │    │             │    │             │    │             │
│ Click       │    │ Enter email │    │ Enter:      │    │ Shows:      │
│ "Create     │    │ & password  │    │ - StudentID │    │ - Tasks     │
│  Account"   │    │             │    │ - Dept      │    │ - Events    │
└─────────────┘    └─────────────┘    │ - Semester  │    │ - Resources │
                                      │ - Section   │    └─────────────┘
                                      └─────────────┘
```

### 2. Returning User Login Flow

```
┌─────────────┐    ┌─────────────┐
│   Login     │    │  Dashboard  │
│    View     │───▶│    View     │
│             │    │             │
│ Enter email │    │ Loads user  │
│ & password  │    │ profile &   │
│             │    │ content     │
└─────────────┘    └─────────────┘
```

### 3. Profile Update Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Dashboard  │    │  Profile    │    │  Dashboard  │
│    View     │───▶│  Settings   │───▶│    View     │
│             │    │             │    │             │
│ Click user  │    │ Update:     │    │ Reloads     │
│ card/cog    │    │ - Dept      │    │ with new    │
│             │    │ - Semester  │    │ content     │
└─────────────┘    │ - Section   │    └─────────────┘
                   │             │
                   │ (Email/ID   │
                   │  read-only) │
                   └─────────────┘
```

### 4. Logout Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Profile    │    │   Confirm   │    │   Login     │
│  Settings   │───▶│   Dialog    │───▶│    View     │
│             │    │             │    │             │
│ Click       │    │ "Are you    │    │ localStorage│
│ "Logout"    │    │  sure?"     │    │ cleared     │
└─────────────┘    └─────────────┘    │ Page reload │
                                      └─────────────┘
```

### 5. Password Reset Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Login     │    │   Login     │    │  Password   │    │   Email     │
│    View     │───▶│   Failed    │───▶│   Reset     │───▶│   Sent      │
│             │    │             │    │   Modal     │    │             │
│ Enter wrong │    │ "Forgot     │    │ Enter email │    │ Check inbox │
│ credentials │    │  Password?" │    │ address     │    │ for reset   │
│             │    │ link shows  │    │             │    │ link        │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

## Views & Components

### Views (Screens)

| View ID                 | Route                | Description           |
| ----------------------- | -------------------- | --------------------- |
| `login-view`            | `/`                  | Login/signup forms    |
| `set-details-view`      | `#/set-details`      | First-time user setup |
| `dashboard-view`        | `#/dashboard`        | Main dashboard        |
| `profile-settings-view` | `#/profile-settings` | Profile management    |

### Login View Components

- Logo and branding
- Login form (email, password)
- Signup form (email, password, confirm)
- Toggle between login/signup
- Auth message display

### Set Details View Components

- Student ID input (10-16 digits)
- Department dropdown
- Semester dropdown
- Section dropdown (dynamic)
- Save & Continue button

### Dashboard View Components

- **Resource Links Section** - Department-specific quick links
  - Mobile: "Quick Links" header, icons hidden, external "All Resources" link
- **Pending Tasks Section** - Task cards with Course Title (primary), collapsible descriptions, vertical edit/delete buttons
  - Course shown larger than Task Title; descriptions truncated to 2 lines with "Show more" toggle
  - Edit/delete buttons vertically stacked on right side below task type badge
  - "Added by" info appears only when description is expanded
  - Overdue tasks (within 12h of deadline) remain visible with "Overdue!" label; move to Old Tasks after 12h
  - Tasks with "No official Time limit" remain in Pending Tasks indefinitely, sorted to the bottom (just above completed tasks)
  - Add Tasks button - Opens task creation modal (Course required, two deadline options: "No official Time limit" or specific date/time)
  - View Old button - Opens tasks past 12h grace period (excludes no-deadline tasks)
  - Reset Tasks button (admin/CR) - Clears past tasks (skips no-deadline tasks)
- **Upcoming Events Section** - Calendar events with collapsible descriptions (2-line truncation with "Show more" toggle), department scope badge (ALL/CSE/etc.), "Added by Admin/CR" label, and edit/delete buttons
  - Add Event button (admin/CR) - Opens event creation modal; CRs create events for their own department
  - Old Events button - Opens past events modal
  - CRs can edit/delete their own events; admins can edit/delete any event
- **Events Sidebar (Mobile)** - Slide-out panel (40vw) with events and action buttons
- **Notice Viewer (Desktop)** - Modal with split-pane layout: notice list panel (left) + PDF preview panel (right) with Open/Download actions; "Load Notices" on-demand button to fetch from UCAM via Vercel backend
- **Notice Sidebar (Mobile)** - Slide-out panel with notice list; tapping a notice opens PDF in a new tab
- **Google Classroom Viewer (Desktop)** - Modal with unified view of all assignments/announcements from enrolled courses; toggle between To-Do and Notices; OAuth authentication with Google
- **Google Classroom Sidebar (Mobile)** - Slide-out panel with unified assignments/announcements view; green toggle button on right edge
- **FAQ Section** - Collapsible accordion with three items:
  - How b1t-Sched works (shared tasks, individual checkboxes)
  - User roles (Admin, CR, Faculty, Blocked) and their permissions
  - Profile settings and 30-day change cooldown disclaimer
- **Note Taking** - Personal note modal with enhanced markdown support (code blocks, HTML entities), auto-save, file upload via Catbox/Tmpfiles/file.io with direct download support, and live preview with theme-optimized PDF export.
- **Modals:**
  - Add Task Modal - Task creation form with Course as required field and two deadline options: "No official Time limit" or a specific date/time
  - Old Tasks Modal - List of tasks past 12h grace period (with completion status)
  - Add Event Modal (admin/CR) - Event creation form
  - Old Events Modal - List of past events
  - Notice Viewer Modal (desktop) - University notice list + embedded PDF viewer
  - Google Classroom Modal (desktop) - Unified assignments/announcements from all enrolled courses

### Profile Settings View Components

- Back button
- Profile info (email, student ID - read-only)
- Department dropdown
- Semester dropdown
- Section dropdown (dynamic)
- Save Changes button
- Cancel button
- Logout button

### Navigation Components

- Logo and title
- Navigation links (Dashboard, Resources)
- User details card (email, dept/sem/section, cog icon)

---

## API Reference

### Global Objects

After scripts load, these are available globally:

```javascript
// Firebase instances
auth; // Firebase Auth instance
db; // Firestore instance

// Application modules
Auth; // Authentication module
DB; // Database module
UI; // UI rendering module
Router; // Routing module
Profile; // Profile management module
Utils; // Utility functions
App; // Main application
```

### Common Response Format

All DB operations return:

```javascript
// Success
{ success: true, data: ... }

// Failure
{ success: false, error: "Error message" }
```

### Event System

```javascript
// Auth state changes
Auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
  } else {
    // User is signed out
  }
});

// Route changes
Router.onRouteChange((routeName) => {
  // Handle route-specific logic
});
```

---

## Version History

| Version  | Date        | Changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.0.0    | Feb 2026    | Complete redesign as SPA with Firebase backend                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2.0.1    | Feb 2026    | Added Student ID field (10-16 digits), fixed profile save/logout                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2.1.0    | Feb 2026    | Task completion with checkboxes, user task creation, view old tasks                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2.2.0    | Feb 2026    | Two-column dashboard layout, mobile events sidebar                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2.3.0    | Feb 2026    | Admin features: reset tasks, delete tasks/events, add events, view old events                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2.3.1    | Feb 2026    | Mobile CSS fixes: Reset Tasks button layout, Events sidebar padding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2.3.2    | Feb 2026    | Removed orderBy from getTasks query (avoid composite index requirement)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2.4.0    | Feb 2026    | Section grouping: A1+A2, B1+B2, C1+C2 merged; shows task creator's section                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2.5.0    | Feb 2026    | CR role: Class Representatives can reset tasks for their section                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2.6.0    | Feb 2026    | Improved signup flow: better email verification messages; CR can delete tasks; Events sidebar slide-out (40vw when open) with clickable links in descriptions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2.6.1    | Feb 2026    | Mobile UX: Resources section with header, hidden icons, external "All Resources" link                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2.6.2    | Feb 2026    | Security: Added `rel="noopener noreferrer"` to all external links (`target="_blank"`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2.7.0    | Feb 2026    | Password reset: "Forgot Password?" link appears after failed login, opens modal to request reset email; Clickable links in task descriptions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2.8.0    | Feb 2026    | Basic markdown support in task/event descriptions: `**bold**`, `*italic*`, `` `code` ``, and line breaks                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2.9.0    | Feb 2026    | Edit functionality: Users can edit own tasks; admins can edit all tasks and events                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2.9.1    | Feb 2026    | Permissions fix: Regular users can now delete their own tasks; clarified role permissions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2.10.0   | Feb 2026    | CR info message for non-CR users; Profile change 30-day cooldown; Footer with credits and dynamic year                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2.11.0   | Feb 2026    | Admin User Management: view all users, filter by dept/sem/section/role, toggle isCR/isBlocked roles, edit user profiles; Blocked users restricted to read-only mode                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2.12.0   | Feb 2026    | Task UI improvements: Course as required field (displayed first), collapsible descriptions with 2-line truncation, vertical edit/delete buttons, "View Old" shows past deadline tasks, compact spacing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2.13.0   | Feb 2026    | Admin: Firebase Dashboard button in Profile Settings; Markdown link support `[text](url)` in task descriptions; 12-hour grace period for overdue tasks before moving to Old Tasks                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2.14.0   | Feb 2026    | Tasks now support "No official Time limit" as a deadline option. Add/Edit Task modals allow choosing between no deadline and a specific date/time. UI and schema updated.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2.14.1   | Feb 2026    | Bugfix: No-deadline tasks now correctly stay in Pending Tasks instead of being moved to Old Tasks. Fixed `createTask()` and `updateTask()` to store `null` instead of epoch timestamp when no deadline is set. Fixed `resetOldTasks()` to skip no-deadline tasks.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2.15.0   | Feb 2026    | Events UI: collapsible descriptions (2-line truncation with "Show more" toggle), department scope badge (ALL/CSE/etc.), "Added by Admin/CR" label. CR event privileges: CRs can create events for their own department, edit/delete their own events. FAQ section: collapsible accordion at bottom of page (how the site works, user roles, profile settings). Updated Firestore security rules for CR event access.                                                                                                                                                                                                                                                                                                                                                                            |
| 2.16.0   | Feb 2026    | Notice Viewer: View UCAM university notices with PDF preview. Desktop: modal with split-pane layout (notice list + embedded PDF iframe with Open/Download). Mobile: slide-out sidebar with notice list (tap to open PDF in new tab). On-demand loading via Vercel serverless backend (`b1t-acad-backend.vercel.app`). 7-day localStorage cache for notice data. New files: `js/notice.js`, `css/notice.css`.                                                                                                                                                                                                                                                                                                                                                                                    |
| 2.17.0   | Feb 2026    | Quick Links PDF Viewer: Resource links pointing to `.pdf` files now open in an in-page viewer modal (Google Docs Viewer in iframe) with Open-in-Tab and Download buttons. Mobile: PDF links open directly in a new tab. New HTML modal (`#pdf-viewer-modal`) in `index.html`, new methods (`initPdfViewer`, `openPdfViewer`, `closePdfViewer`) in `ui.js`, PDF viewer styles in `notice.css`, init wired in `app.js`.                                                                                                                                                                                                                                                                                                                                                                           |
| 2.18.0   | Feb 2026    | New Features: Task Filtering (by type), Global Contribution List (with toggle for all-department view), Total User Counter (live badge), and Mobile UI fixes (login scroll, zoom).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2.18.0.1 | Feb 2026    | Reverted back to "open links in new tab" for Pending Tasks and Events descriptions.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2.19.0   | Feb 2026    | Google Classroom Integration: View all assignments and announcements from enrolled Google Classroom courses in a unified interface. Features: OAuth authentication with Google Identity Services, unified To-Do/Notices view with toggle, course badges for each item, filters only ACTIVE courses (excludes archived), configurable date filter (default: last 6 months), responsive design (mobile sidebar with green toggle, desktop modal). New files: `js/classroom.js`, `css/classroom.css`. Google Identity Services SDK loaded via CDN.                                                                                                                                                                                                                                                 |
| 2.20.0   | Feb 2026    | Progressive Web App (PWA) Setup: Installable app with offline support, service worker caching (cache-first for static assets, network-first for API calls), automatic cache cleanup, install prompt management, offline operation queue, offline indicator, service worker update notifications. New files: `manifest.json`, `sw.js`, `js/pwa-detector.js`, `js/manifest-generator.js`, `js/cache-manager.js`, `js/install-prompt.js`, `js/offline-manager.js`, `js/offline-indicator.js`, `js/sw-update-manager.js`, `js/pwa-init.js`. Auth and Classroom modules updated with caching support.                                                                                                                                                                                                |
| 2.21.0   | Feb 2026    | Push Notifications System: Real-time browser notifications for new tasks and events using Web Notifications API and Firestore real-time listeners. Features: permission management with browser-specific instructions, content formatting with truncation, click-to-navigate, initial load detection, automatic cleanup on logout. New files: `js/notifications-types.js`, `js/permission-manager.js`, `js/notification-content-formatter.js`, `js/notification-manager.js`, `js/firestore-listener-manager.js`. Notification prompt UI added to dashboard.                                                                                                                                                                                                                                     |
| 2.22.0   | Feb 2026    | Firebase CR Permissions Fix: Updated Firestore security rules for CR event creation/editing. Changed from department-based to semester-based validation. CRs can now create events for their semester, edit/delete only their own events. Added field immutability checks (createdBy, semester). New helper functions: `getUserSemester()`, `hasRequiredEventFields()`.                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2.23.0   | Feb 2026    | User Management UI Updates: Admin features for password reset and user deletion via Firebase Cloud Functions. Features: filter popup with badge showing active filter count, action button optimizations, delete confirmation dialog, admin logs collection. New files: `functions/index.js`, `functions/admin/sendPasswordReset.js`, `functions/admin/deleteUser.js`, `functions/DEPLOYMENT_GUIDE.md`, `js/admin-api.js`. Updated `index.html`, `css/components.css`, `css/dashboard.css`, `js/app.js`, `firestore.rules`.                                                                                                                                                                                                                                                                     |
| 2.24.0   | Feb 2026    | Faculty Role Implementation: Faculty users can view department-wide tasks (no semester/section filtering), create events for their department, edit/delete their own events. Faculty toggle available in user management. Updated Firestore security rules with `isFaculty()` helper. New method: `DB.getFacultyTasks()`. Updated `js/db.js`, `js/app.js`, `js/ui.js`, `firestore.rules`.                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2.25.0   | Feb 2026    | Note Taking Feature: Personal note-taking with markdown support, auto-save (500ms debounce), automatic file upload via file.io API (max 100MB, 14-day retention), live preview pane. Files uploaded automatically insert markdown links at cursor position. Notes stored in Firestore (max 1MB). New files: `js/notes.js`, `css/note.css`. Updated `index.html` with note modal and hidden file input.                                                                                                                                                                                                                                                                                                                                                                                          |
| 2.25.1   | Feb 2026    | Bug Fixes: Added Faculty toggle button active state CSS (blue background). Improved notice API error handling with cache fallback - when server returns 503, app loads cached notices with warning banner. Fixed notification prompt inline color styles. Updated `css/dashboard.css`, `js/notice.js`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2.26.0   | Feb 2026    | UX & Security Improvements: (1) Deadline options reordered - "Set Deadline" now appears first and is default in Add/Edit Task modals. (2) File downloads in notes now work directly without opening new tab (added `download` attribute to file.io links). (3) Automatic session timeout - users are logged out after 1 hour of inactivity for security, with activity-based timer reset. (4) Role badges - CR and Faculty contributors now have colored badges in task cards and contribution list. (5) Mobile notifications fixed - now use Service Worker API for iOS Safari and Chrome on Android compatibility, with vibration and badge support. Updated `index.html`, `js/utils.js`, `js/auth.js`, `js/app.js`, `js/ui.js`, `js/notification-manager.js`, `sw.js`, `css/components.css`. |
| 2.27.0   | Feb 2026    | File Upload Service Migration: Migrated from tmpfiles.org to file.io API for note file uploads. Benefits: 14-day file retention (vs 1 hour), direct download links, more reliable service. Updated `js/notes.js` (renamed `uploadToTmpFiles` to `uploadToFileIO`), `js/utils.js` (updated download link detection), `index.html` (updated upload instructions), `doc/DOCUMENTATION.md`.                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2.28.0   | Feb 2026    | Activity Timeline & User Counter: Added interactive activity heatmap and bar chart to visualize user productivity (logins, tasks, events). Added live user counter to dashboard and footer. Mobile UI fixes: resolved clickability issues by removing overlay conflicts, improved Note button visibility logic.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2.29.0   | Feb 2026    | Session Management & UI Improvements: Added "Stay logged in" checkbox to persist session on trusted devices. Implemented Google Classroom session persistence with auto-refresh tokens. UI refinement: "Refresh Tasks" button moved to header group on mobile for better accessibility.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2.30.0   | Feb 2026    | Password Reset System Overhaul: (1) **Admin Fix**: Refactored Admin Password Reset to use Client SDK (`Auth.sendPasswordResetEmail`) instead of backend Cloud Function, effectively bootstrapping a workaround for CORS issues on the `sendPasswordReset` endpoint. (2) **Conflict Resolution**: Renamed `handlePasswordReset` to `handleAdminPasswordReset` in `app.js` to fix naming collision that broke the "Forgot Password" modal. (3) **UI Enhancements**: Added "Forgot Password" link on login failure and a new "Reset Password" button in Profile Settings. (4) **UX**: Improved visual prominence of reset links.                                                                                                                                                                   |
| 2.31.0   | Feb 2026    | CR Notice Creation Fix: Fixed CRs and Admins being unable to post class notices. **(Bug)** `cr-notice.js` read user profile from non-existent `localStorage` keys (`userDepartment`, `userSemester`, `userSection`) instead of `Utils.storage.get('userProfile')`. **(Fix)** `subscribeToNotices()` and `submitNotice()` now read profile via `Utils.storage.get('userProfile')`. Removed Department/Semester/Section dropdowns from Add Notice form (auto-filled from profile). Updated Firestore rules to allow Admins to create notices. Files: `js/cr-notice.js`, `index.html`, `firestore.rules`.                                                                                                                                                                                          |
| 2.33.0   | Feb 2026    | UI and Responsive Fixes: Fixed Activity Timeline bar chart clickability issue on zoomed displays (switched from Chart.js built-in onClick to robust index-based interaction mode). Added comprehensive dark mode overrides for Timeline modal, FAQ button, and Profile Settings Logout button. Fixed "All Resources" mobile center alignment.                                                                                                                                                                                                                                                                                        |
| 2.34.0   | Feb 2026    | Classroom Sync to Tasks Feature: Added "Sync to Tasks" button functionality for Admins and CRs in the Google Classroom To-Do interface. Features: one-click sync of active assignments into b1t-Sched tasks, duplicate prevention via `classroomWorkId` DB queries, automatic conversion of due dates, appended markdown links redirecting to the Google Classroom assignment, and a custom "Added from Classroom" green badge in the Tasks UI.                                                                                                                                                                                      |
| 2.35.0   | Feb 2026    | Dark Theme Overhaul: Implemented a new dark theme based on the Realtime Colors palette (--text: #e7f0dc; --background: #000000; --primary: #badd93; --secondary: #578323; --accent: #89d134;). Updated `css/colors.css` with new primary, secondary, accent, and text colors. Updated `css/styles.css`, `css/main.css`, `css/responsive.css`, and `css/calendar.css` to integrate the new color scheme across the entire application. Updated `package.json` with new color palette metadata.                                                                                                                                                                                                                                                                                                   |
| 2.36.0   | Feb 2026    | Google Classroom API now loads content from All Courses right after Sign In, instead of loading the enrolled courses.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2.37.0   | Feb 2026    | **Theming & UX Overhaul**: 1. **Gray Mode Theme**: Added a new monochromatic theme; set as the default for system dark mode preferences. 2. **Overdue Task Styling**: Redesigned overdue backgrounds for dark/gray modes to ensure clarity without excessive brightness (`rgba(220, 53, 69, 0.15)`). 3. **Classroom UI Theming**: Full theme integration for Google Classroom components in Gray Mode. 4. **FOUC Prevention**: Enhanced inline script to handle Gray Mode initialization.                                                                                                                             |
| 2.38.0   | Feb 2026    | **Bug Fixes & UI Enhancements**: (1) Notice Refresh: Added "Refresh Notices" button to UI that passes `?refresh=true` to backend to bypass server-side caching. (2) Mobile Zoom & Canvas Coordinate Fix: Applied dynamic JS-based 95% zoom (`document.body.style.zoom`) for screens <= 768px, with specific resets in `timeline-ui.js` to preserve `Chart.js` canvas coordinate integrity when modal is active. (3) Empty states: Added `"No upcoming events"` fallback for mobile Events sidebar. (4) Notes Modals: Fixed Note Preview infinitely growing by enforcing `max-height: 48vh;` internal scrolling. (5) Section Guides: Added hoverable/clickable tooltips (`<i class="fas fa-info-circle">`) to main feature headers explaining their purpose for new users.                       |
| 2.39.0   | Feb 2026    | **Note Section Overhaul**: (1) **PDF Export**: Integrated `html2pdf.js` for one-click note-to-PDF generation. (2) **Automatic ZIP Fallback**: Integrated `JSZip` to client-side compress unsupported file types (e.g., `.sh`, `.exe`) into `.zip` blobs before upload. (3) **Layout Optimization**: Removed fixed `max-height` constraints in `css/note.css` to enable full flexbox expansion, eliminating whitespace gaps in the note modal editor. (4) **CORS Fix**: Re-prioritized `file.io` as the lead upload provider to bypass `catbox.moe` CORS restrictions on certain domains.                                                                                                                                                                                                        |
| 2.40.0   | Mar 2026    | PWA Offline Improvements: Resolved view loading issues in offline mode; fixed Google Classroom caching persistence across views; implemented Vercel Blob storage for backend file serving.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2.41.0   | Mar 11 2026 | Enhanced Markdown Support: Rewrote rendering pipeline to support fenced code blocks (```), <pre> tags, and safe HTML entities (math/Greek symbols) globally across tasks, events, notices, and notes. Improved CSS for code block visibility.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2.44.0   | Aug 2026    | Google Classroom Materials Tab & Client JSON Caching: Added Materials view tab, full client JSON template caching (`classroom_cached_json`), unified pre-fetching with incremental skip tracking, persistent bottom reconnect banner, and row copy actions.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2.45.0   | Aug 2026    | Dynamic Department & Metadata Options: Server-priority fetching for Firestore metadata, multi-structure document support, dynamic event department selectors, and comprehensive faculty filters.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2.46.0   | Aug 2026    | Google Classroom Assignment Status Badges: Integrated real-time student submission tracking (`studentSubmissions?userId=me`) to render distinct bottom-right status badges on all To-Do assignments for Missing (Red), Assigned (Blue), Turned in (Green), and Returned / Graded: X/Y (Purple) across all color themes.                                                                                                                                                                                                                                                                                                                                    |
| 2.47.0   | Aug 2026    | UITS Event Raiders Live Feed Integration: Syndicated live hackathons, contests, olympiads, and symposiums from `ou1ts/events` RSS/JSON feeds (`js/raids-feed.js`). Organized desktop sidebar with dedicated vertical separation below upcoming events, and integrated a vertically centered solid maroon right-arrowhead view switcher on the mobile events drawer.                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2.48.0   | Aug 2026    | Google Classroom Window Padding & Multi-Group Deadline Hierarchy: Removed border padding on smaller desktop displays (769px–1366px). Restructured To-Do assignments to prioritize upcoming deadlines chronologically at the top, followed by assigned tasks (no due date), past deadline tasks with conditional "Past deadline" banners, and completed tasks sub-grouped by remaining deadline status.                                                                                                                                                                                                                                                                                                                                                                               |                                                                                                                                                                                                                                                                                                                                                                                                                                      |

---

## Related Documentation

- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Firebase project setup guide
- [QUICKSTART.md](QUICKSTART.md) - Quick start for developers
- [REDESIGN_PLAN.md](REDESIGN_PLAN.md) - Original redesign planning document
- [ADMIN_FEATURES.md](ADMIN_FEATURES.md) - Admin functionality documentation
- [FIRESTORE_TASK_CHANGES.md](FIRESTORE_TASK_CHANGES.md) - Task completion schema changes
- [doc/plan/g-class-api/](doc/plan/g-class-api/) - Google Classroom API setup and implementation plans

---

_Documentation last updated: August 26, 2026_
_Version: 2.48.0_

---

## Recent Updates (February 2026)

### Calendar View Feature

**Version 2.20.0** - Calendar View for Tasks

Added a monthly calendar view to visualize pending tasks by their deadlines.

**Features:**

- Monthly calendar grid showing all days
- Tasks displayed on their deadline dates
- Color-coded task type badges (Assignment, Homework, Exam, etc.)
- Task count indicators on dates with multiple tasks
- Overdue task highlighting
- Click tasks to view full details
- Navigate between months
- Empty state when no tasks scheduled
- Keyboard accessible (Tab navigation, Enter/Space to activate)
- Focus trap within modal

**Files:**

- `js/calendar-view.js` - Calendar view implementation
- `css/calendar.css` - Calendar styling
- `index.html` - Calendar button and modal structure

**Usage:**

- Click calendar icon button next to "Pending Tasks" header
- Navigate months using arrow buttons
- Click any task to view details
- Close with X button or Escape key

**Bug Fix (2.20.1):**

- Removed ES6 export statement causing syntax error in browser
- Calendar button now properly opens modal
- Fixed initialization order in app.js

---

### File Upload System Upgrade

**Version 2.21.0** - Multi-Provider File Upload with Automatic Fallback

Completely redesigned the file upload system for the note-taking feature with multiple providers and automatic fallback.

**Previous Issue:**
File.io API was blocking uploads due to CORS policy (missing `Access-Control-Allow-Origin` header).

**New Implementation:**
Multi-provider upload system that tries providers in order until one succeeds:

1. **Firebase Storage** (Primary)
   - Permanent storage
   - Max file size: 10 MB
   - Free tier: 5 GB total storage, 1 GB downloads/day
   - Integrated with Firebase auth
   - User-specific organization: `note-attachments/{userId}/{timestamp}_{filename}`

2. **Catbox.moe** (Fallback 1)
   - Permanent storage
   - Max file size: 200 MB
   - Free tier: Unlimited uploads
   - No authentication required
   - CORS-friendly

3. **Tmpfiles.org** (Fallback 2)
   - Temporary storage (1 year expiration)
   - Max file size: 100 MB
   - Free tier: Unlimited uploads
   - No authentication required
   - CORS-friendly

**Features:**

- Automatic provider selection based on file size and availability
- Success message shows which provider was used
- Expiration warning for temporary storage
- Graceful fallback if primary provider fails
- Maximum file size: 200 MB (Catbox limit)

**Files Changed:**

- `index.html` - Added Firebase Storage SDK script
- `js/firebase-config.js` - Initialized Firebase Storage
- `js/notes.js` - Implemented multi-provider upload system with three methods:
  - `uploadWithFallback()` - Orchestrates provider selection
  - `uploadToFirebaseStorage()` - Firebase Storage upload
  - `uploadToCatbox()` - Catbox.moe upload
  - `uploadToTmpfiles()` - Tmpfiles.org upload

**Documentation:**

- `doc/FILE_UPLOAD_OPTIONS_ANALYSIS.md` - Detailed analysis of all options
- `doc/FILE_UPLOAD_QUICK_REFERENCE.md` - Quick reference guide
- `doc/summaries/FIREBASE_STORAGE_MIGRATION.md` - Migration summary

**Benefits:**

- No CORS issues (all providers support cross-origin requests)
- Redundancy (if one service is down, others work)
- Flexible file sizes (up to 200MB)
- Mix of permanent and temporary storage
- Cost control (all free tiers)
- Better reliability

**Firebase Storage Limits:**

- Total storage: 5 GB (free tier)
- Downloads: 1 GB per day
- Upload operations: 20,000 per day
- Download operations: 50,000 per day

**Monitoring Recommendations:**

- Check Firebase Console → Storage for usage
- Implement file cleanup for old files if needed
- Set up billing alerts before hitting limits
- Consider user quotas (e.g., 50 MB per user)

---

## Technology Stack Updates

### Firebase SDK (Updated)

| Package                       | Version | Purpose                       | Delivery            |
| ----------------------------- | ------- | ----------------------------- | ------------------- |
| **firebase-app-compat**       | 10.7.1  | Firebase core initialization  | CDN (`gstatic.com`) |
| **firebase-auth-compat**      | 10.7.1  | Email/password authentication | CDN (`gstatic.com`) |
| **firebase-firestore-compat** | 10.7.1  | NoSQL cloud database          | CDN (`gstatic.com`) |
| **firebase-storage-compat**   | 10.7.1  | Cloud file storage            | CDN (`gstatic.com`) |

### File Upload Services

| Service              | Storage Type       | Max Size | Free Tier  | CORS | Auth Required |
| -------------------- | ------------------ | -------- | ---------- | ---- | ------------- |
| **Firebase Storage** | Permanent          | 10 MB    | 5 GB total | ✅   | Yes           |
| **Catbox.moe**       | Permanent          | 200 MB   | Unlimited  | ✅   | No            |
| **Tmpfiles.org**     | Temporary (1 year) | 100 MB   | Unlimited  | ✅   | No            |

---

## Module Updates

### 8. NoteManager (notes.js) - Updated

**Purpose:** Personal note-taking with markdown support and multi-provider file upload

#### Configuration

```javascript
NoteManager.autoSaveTimer = null; // Auto-save debounce timer
NoteManager.currentUserId = null; // Current authenticated user
```

#### Methods (Updated)

| Method                              | Parameters     | Description                                                   |
| ----------------------------------- | -------------- | ------------------------------------------------------------- |
| `init()`                            | -              | Initialize note module with auth listener                     |
| `setupEventListeners()`             | -              | Attach event listeners for modal, buttons, file input         |
| `enableNoteFeature()`               | -              | Show note toggle buttons for authenticated users              |
| `disableNoteFeature()`              | -              | Hide note toggle buttons for unauthenticated users            |
| `openModal()`                       | -              | Open note modal and load user's note                          |
| `closeModal()`                      | -              | Close note modal                                              |
| `triggerFileUpload()`               | -              | Trigger hidden file input click                               |
| `handleFileSelect(event)`           | Event          | Handle file selection and upload with multi-provider fallback |
| `uploadWithFallback(file)`          | File           | Try multiple upload providers in order until one succeeds     |
| `uploadToFirebaseStorage(file)`     | File           | Upload file to Firebase Storage (10MB limit)                  |
| `uploadToCatbox(file)`              | File           | Upload file to Catbox.moe (200MB limit, permanent)            |
| `uploadToTmpfiles(file)`            | File           | Upload file to Tmpfiles.org (100MB limit, 1 year expiration)  |
| `insertLinkIntoNote(filename, url)` | string, string | Insert markdown link at cursor position in textarea           |
| `updatePreview(content)`            | string         | Update preview pane with formatted markdown                   |
| `setupAutoSave(content)`            | string         | Setup auto-save with 500ms debounce                           |
| `loadNote(userId)`                  | string         | Load note from Firestore                                      |
| `saveNote(userId, content)`         | string, string | Save note to Firestore (max 1MB)                              |
| `handleSave()`                      | -              | Handle manual save button click                               |
| `handleClear()`                     | -              | Handle clear button click with confirmation                   |
| `clearNote(userId)`                 | string         | Clear note from Firestore                                     |
| `validateNoteContent(content)`      | string         | Validate note size (max 1MB)                                  |
| `showMessage(message, type)`        | string, string | Display message to user                                       |

**Features:**

- **Auto-save:** Saves note content automatically with 500ms debounce
- **Multi-Provider Upload:** Automatic fallback between Firebase Storage, Catbox, and Tmpfiles
- **File Size Support:** Up to 200MB files (Catbox limit)
- **Permanent & Temporary Storage:** Mix of storage options
- **Markdown Links:** Inserts `[filename](url)` at cursor position after upload
- **Preview Pane:** Live preview with markdown rendering (bold, italic, code, links)
- **Persistent Storage:** Notes stored in Firestore user document (max 1MB)
- **Upload Progress:** Shows spinner and provider name during upload
- **Error Handling:** Validates file size and handles upload failures gracefully
- **PDF Export:** Generates PDF locally with `html2pdf.js` featuring reliable rendering for dark and gray themes via delayed capture techniques.

**Upload Flow:**

1. Click "Upload Files" → Select file
2. System tries Firebase Storage (if ≤10MB & authenticated)
3. If fails, tries Catbox.moe (if ≤200MB)
4. If fails, tries Tmpfiles.org (if ≤100MB)
5. Success message shows provider used
6. Markdown link inserted at cursor
7. Auto-save triggered

**Success Messages:**

- `✅ File uploaded successfully via Firebase Storage!`
- `✅ File uploaded successfully via Catbox!`
- `✅ File uploaded successfully via Tmpfiles! (Expires in 1 year)`

---

### 14. CalendarView (calendar-view.js) - New Module

**Purpose:** Monthly calendar view for visualizing task deadlines

#### Configuration

```javascript
CalendarView.currentDate = new Date(); // Current date reference
CalendarView.displayedMonth = number; // Currently displayed month (0-11)
CalendarView.displayedYear = number; // Currently displayed year
CalendarView.isOpen = boolean; // Modal open state
CalendarView.minYear = currentYear - 100; // Navigation limit (past)
CalendarView.maxYear = currentYear + 100; // Navigation limit (future)
```

#### Methods

| Method                        | Parameters | Description                                                                |
| ----------------------------- | ---------- | -------------------------------------------------------------------------- |
| `init()`                      | -          | Initialize calendar view (button, modal, event listeners)                  |
| `createButton()`              | -          | Create calendar icon button next to "Pending Tasks" header                 |
| `createModal()`               | -          | Create calendar modal structure with grid and controls                     |
| `open()`                      | -          | Open calendar modal, render calendar, set focus, prevent background scroll |
| `close()`                     | -          | Close calendar modal, restore focus, enable background scroll              |
| `trapFocus(event)`            | Event      | Trap focus within modal for accessibility                                  |
| `generateCalendarGrid()`      | -          | Generate calendar grid data structure with dates                           |
| `getTasksForMonth()`          | -          | Filter tasks with deadlines in displayed month                             |
| `isTaskOverdue(task)`         | Object     | Check if task is overdue (past deadline and not completed)                 |
| `populateTasksInGrid()`       | -          | Render tasks in calendar cells with overflow handling                      |
| `renderCalendar()`            | -          | Render complete calendar grid with tasks                                   |
| `previousMonth()`             | -          | Navigate to previous month                                                 |
| `nextMonth()`                 | -          | Navigate to next month                                                     |
| `updateHeader()`              | -          | Update month/year header text                                              |
| `showTaskDetails(taskId)`     | string     | Display task details modal                                                 |
| `showSimpleTaskDetails(task)` | Object     | Fallback task details view                                                 |
| `showLoading()`               | -          | Show loading indicator                                                     |
| `hideLoading()`               | -          | Hide loading indicator                                                     |
| `showError()`                 | -          | Show error state                                                           |
| `attachEventListeners()`      | -          | Attach all event listeners                                                 |

**Features:**

- **Monthly Grid View:** 7-column grid (Sun-Sat) with all days of month
- **Task Display:** Shows up to 3 tasks per date with overflow indicator
- **Task Type Badges:** Color-coded badges (A=Assignment, H=Homework, E=Exam, etc.)
- **Overdue Highlighting:** Red styling for overdue tasks
- **Task Count:** Shows total task count on dates with tasks
- **Month Navigation:** Previous/Next buttons with year rollover
- **Empty State:** Shows message when no tasks scheduled
- **Loading State:** Shows spinner during rendering
- **Error Handling:** Graceful error display with retry option
- **Keyboard Accessible:** Tab navigation, Enter/Space activation, Escape to close
- **Focus Management:** Traps focus within modal, restores on close
- **Adjacent Month Dates:** Muted styling for previous/next month dates
- **Today Highlight:** Special styling for current date

**Calendar Grid Structure:**

```
┌─────────────────────────────────────────┐
│  ← January 2026 →                    ✕  │
├─────────────────────────────────────────┤
│ Sun Mon Tue Wed Thu Fri Sat             │
├─────────────────────────────────────────┤
│ 29  30  31   1   2   3   4              │
│  5   6   7   8   9  10  11              │
│ 12  13  14  15  16  17  18              │
│ 19  20  21  22  23  24  25              │
│ 26  27  28  29  30  31   1              │
└─────────────────────────────────────────┘
```

**Task Display:**

- Each date cell shows up to 3 tasks
- Tasks show type badge + truncated title
- Overflow indicator: "+2 more" if >3 tasks
- Click task to view full details
- Task count badge in corner of cell

**Accessibility:**

- ARIA labels on all interactive elements
- Role="dialog" and aria-modal="true" on modal
- Role="grid" and role="gridcell" on calendar
- Keyboard navigation support
- Focus trap prevents tabbing outside modal

---

## Version History (Updated)

| Version | Date     | Changes                                                                                                                                                                                                                                       |
| ------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.20.0  | Feb 2026 | Calendar View: Monthly calendar visualization of task deadlines with navigation, task details, and accessibility features                                                                                                                     |
| 2.20.1  | Feb 2026 | Calendar View Bug Fix: Removed ES6 export statement causing browser syntax error; fixed initialization order                                                                                                                                  |
| 2.21.0  | Feb 2026 | File Upload System Upgrade: Multi-provider upload with Firebase Storage (primary), Catbox.moe (fallback 1), and Tmpfiles.org (fallback 2); automatic fallback on failure; supports up to 200MB files; permanent and temporary storage options |

---

### 15. Activity Logging & Timeline

**Purpose:** Track and visualize user engagement and productivity.

#### Activity Logger (`js/activity-logger.js`)

- Tracks user actions: Login, Task Completion, Event Creation, Profile Update
- Stores logs in `users/{userId}/activity_logs` subcollection
- Fields: `type`, `description`, `timestamp`, `metadata`

#### Timeline Data (`js/timeline-data.js`)

- Fetches activity logs from Firestore
- Aggregates data by date and type
- Prepares datasets for visualization (heatmap, bar chart)

#### Timeline UI (`js/timeline-ui.js`)

- Renders Activity Timeline modal
- Displays interactive Heatmap (GitHub-style)
- Displays Weekly Activity Bar Chart
- Displays recent activity list
- Uses `Chart.js` for bar charts (loaded via CDN)

**Key Features:**

- **Heatmap:** Visual intensity of activity over the last year
- **Stats:** Current streak, max streak, total contributions
- **Filtering:** View by specific activity type

---

## Troubleshooting

### CR Notice Issues

**CRs cannot post notices:**

- Verify the user's profile has `department`, `semester`, and `section` set (Profile Settings)
- Check browser console for `User profile incomplete` log — indicates missing profile data in `localStorage`
- Ensure the user has the CR role (check `isCR` in Firestore user document)
- Verify Firestore rules are deployed: `firebase deploy --only firestore:rules`

**Notices not appearing after posting:**

- Check Firestore console → `cr_notices` collection for the new document
- Verify the `department`, `semester`, `section` fields match the viewing user's profile
- Check browser console for Firestore query errors (may indicate missing composite index)

**"Profile incomplete" message in CR Notices section:**

- User's profile is missing department, semester, or section
- Go to Profile Settings and set all three fields
- Reload the page after saving

### Calendar View Issues

**Calendar button doesn't work:**

- Check browser console for JavaScript errors
- Verify `calendar-view.js` is loaded (check Network tab)
- Ensure no ES6 export statements in calendar-view.js
- Check that CalendarView is defined: `console.log(typeof CalendarView)`

**Calendar shows "undefined" or blank:**

- Verify App.currentTasks is populated
- Check that tasks have valid deadline formats
- Ensure Firestore data is loading correctly

**Tasks not appearing in calendar:**

- Verify task deadlines are in the displayed month
- Check that deadline is not "No official Time limit" (null)
- Ensure task status is "active"

### File Upload Issues

**Upload fails on all providers:**

- Check browser console for errors
- Verify internet connection
- Check if services are down (status pages)
- Verify file size is within limits (≤200MB)

**Firebase Storage quota exceeded:**

- Check Firebase Console → Storage for usage
- Implement file cleanup for old files
- Switch to Catbox/Tmpfiles temporarily
- Consider upgrading to Firebase Blaze plan

**Files not accessible after upload:**

- Check if URL is correct in note
- Verify Firebase Security Rules allow read access
- Check if temporary file expired (Tmpfiles: 1 year)
- Test URL in incognito mode

**Upload succeeds but link doesn't work:**

- Verify markdown link format: `[filename](url)`
- Check that URL is complete and valid
- Test URL directly in browser
- Check for special characters in filename

---

## Best Practices

### Calendar View

- Use calendar view for deadline planning and visualization
- Navigate months to see upcoming and past tasks
- Click tasks for full details instead of opening task list
- Use keyboard navigation (Tab, Enter, Escape) for efficiency

### File Uploads

- Keep files under 10MB for Firebase Storage (faster, permanent)
- Use Catbox for larger files (10-200MB, permanent)
- Be aware of Tmpfiles expiration (1 year)
- Monitor Firebase Storage usage if uploading frequently
- Clean up old files periodically to stay within free tier
- Test file links after upload to ensure accessibility

### Storage Management

- Implement file cleanup for files older than X days
- Set user quotas (e.g., 50 MB per user) if needed
- Monitor Firebase Console for storage usage
- Set up billing alerts before hitting 5 GB limit
- Consider upgrading to Blaze plan if exceeding free tier

---

## 11. Activity Timeline & Migration

### Overview

The **Activity Timeline** provides a comprehensive visual history of university-wide activities. It aggregates data from all departments, semesters, and sections to show productivity trends without exposing private student information.

### Features

#### 1. Global Data Aggregation

- **Scope:** Fetches `activity_logs` from the entire database.
- **Privacy:** Displays "Department/Course/Time" but hides Student Names in the public view.

#### 2. Yearly Heatmap (GitHub-Style)

- **Visual:** A colored grid showing daily activity intensity for the entire year.
- **Interaction:**
  - **Hover:** See the exact count of activities for a specific date.
  - **Click:** Open a "Details Popup" showing a list of activities for that day, grouped by Course.
  - **Scroll:** Horizontally scrollable to view the full year.
- **Navigation:** Dropdown to switch between the current and previous years.

#### 3. Monthly Activity Breakdown

- **Visual:** A bar chart displaying daily activity counts for a selected month.
- **Navigation:** **Month** and **Year** dropdown selectors for quick navigation to any date.
- **Interaction:** Click on any bar to open the Details Popup.

#### 4. Details Popup

- Grouped view of activities (by Course or Department).
- Shows: Task Title, Type, Time, and Context (Dept/Sem/Sec).
- Hides: Student PII.

### Data Migration Script

Since `activity_logs` is a new collection, existing `tasks` and `events` need to backpopulated.

#### Script: `js/migrate-activity-logs.js`

**Purpose:**

- Iterates through all documents in `tasks` and `events`.
- Checks if a corresponding `activity_log` already exists (deduplication).
- Creates a new `activity_log` document with the original `createdAt` timestamp.

**Usage:**

1. Open the browser console (F12).
2. Run the global function: `migrateActivityLogs()`.
3. Monitor progress in the console.

**Technical Details:**

- Uses Firestore `batch` writes (commits every 400 operations) for efficiency and rate-limit compliance.
- Preserves original timestamps to ensure historical accuracy in the timeline.

---

## 12. Design References & Inspirations

### Calendar View

**Desktop:** The calendar view design was inspired by **ClickUp's calendar interface**, featuring:

- Monthly grid layout with task visualization
- Compact cell design with date indicators
- Task type badges and overflow indicators
- Inline navigation controls

**Reference:** [ClickUp Calendar View](https://clickup.com/)

**Mobile:** The mobile calendar view is inspired by **Google Calendar's weekly view**, featuring:

- Horizontal scrolling through weeks of the month
- Week-by-week navigation with swipe gestures
- Compact day columns with vertical task lists
- Month navigation controls to switch between months
- Touch-optimized interface

**Reference:** [Google Calendar](https://calendar.google.com/)

### Activity Timeline

Visualizes user productivity and engagement:

- **Heatmap**: GitHub-style contribution graph showing daily activity intensity.
- **Weekly Stats**: Bar chart showing activity distribution by day of the week.
- **Activity Log**: Chronological list of recent actions (Task Added, Completed, Event Created).
- **Backpopulation**: Utility (`migrateActivityLogs()`) to import past tasks into history.

### File Upload System

The note-taking feature uses multiple file upload providers for reliability:

#### Primary: Firebase Storage

- **Service:** Google Firebase Cloud Storage
- **Limits:** 10 MB per file, 5 GB total (free tier)
- **Retention:** Permanent
- **Documentation:** [Firebase Storage](https://firebase.google.com/docs/storage)

#### Fallback 1: Catbox.moe

- **Service:** Catbox.moe File Hosting API
- **Limits:** 200 MB per file
- **Retention:** Permanent
- **API Endpoint:** `https://catbox.moe/user/api.php`
- **Documentation:** [Catbox API](https://catbox.moe/api.php)

#### Fallback 2: Tmpfiles.org

- **Service:** Tmpfiles.org Temporary File Hosting
- **Limits:** 100 MB per file
- **Retention:** 1 year expiration
- **API Endpoint:** `https://tmpfiles.org/api/v1/upload`
- **Documentation:** [Tmpfiles API](https://tmpfiles.org/)

#### Deprecated: File.io

- **Status:** Removed due to CORS issues
- **Issue:** Missing `Access-Control-Allow-Origin` header blocked browser uploads
- **Replacement:** Multi-provider fallback system (Firebase → Catbox → Tmpfiles)

**Implementation Details:**

- Automatic fallback on provider failure
- Progress indication during upload
- Direct download support (no new tab required)
- Markdown link generation: `[filename](url)`
- Error handling with user-friendly messages

---

## Short Guides & Tips

### Uploading Files in Notes

1. Open the **Notes** panel (pen icon in bottom-right corner)
2. Click the **Upload** button (📎) in the notes toolbar
3. Select a file (max 10 MB for Firebase, 200 MB for Catbox fallback)
4. The file is uploaded automatically and a markdown download link `[filename](url)` is inserted into your note
5. The link opens a direct download — no new tab required

### Posting CR Notices

1. Navigate to the **Notices** section (sidebar on desktop, toggle on mobile)
2. Click **Add Notice** (visible only to CRs and Admins)
3. Fill in Title, Priority, and Description
4. Department, Semester, and Section are auto-filled from your profile
5. Notices are visible to **all sub-sections** in your group (e.g., B1 notice is also seen by B2)

### Using Markdown in Tasks & Events

You can use basic markdown formatting in task and event descriptions:

- `**bold text**` → **bold text**
- `*italic text*` → _italic text_
- `` `inline code` `` → `inline code`
- `[link text](https://example.com)` → clickable link (opens in new tab)

### Keyboard Shortcuts & Quick Actions

- **Esc** — Close any open modal
- **Click** the maroon checkbox on a task card to toggle completion
- **Long descriptions** are truncated to 2 lines — click "See more" to expand
- **Filter tasks** by clicking the filter icon beside "Pending Tasks" heading

---

## 13. Additional Resources

### File Upload Documentation

- `doc/FILE_UPLOAD_OPTIONS_ANALYSIS.md` - Comprehensive analysis of upload options
- `doc/FILE_UPLOAD_QUICK_REFERENCE.md` - Quick reference for developers
- `doc/summaries/FIREBASE_STORAGE_MIGRATION.md` - Migration details

### Calendar View Documentation

- `doc/summaries/CALENDAR_FIX_SUMMARY.md` - Calendar bug fix details
- `.kiro/specs/task-calendar-view/` - Complete spec with requirements, design, and tasks

### Firebase Documentation

- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Firebase Pricing](https://firebase.google.com/pricing)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

_Last Updated: August 26, 2026 (v2.49.0)_

## Version History

### v2.49.0 (Latest)

- **New Feature**: **Google Classroom Announcement & Assignment Creation Option for Faculty & CR Roles** — Added a dedicated floating action button (`.classroom-create-fab`) positioned in the bottom-right corner of the Classroom mobile sidebar (`#classroom-sidebar`) and desktop modal (`#classroom-modal`).
  - **Role-Gated Access**: Dynamically displayed only for authenticated users with **Faculty** or **CR** (Class Representative) roles, or Administrators (`isFacultyOrCR()`).
  - **Template Redirect Modal (`#classroom-create-modal`)**: Clicking the button opens a clean Work-in-Progress modal dialog featuring an active 3-second countdown timer that automatically redirects to the relevant course URL on Google Classroom (or general Google Classroom), alongside **"Go to Classroom Now"** and **"Cancel"** options.
- **Enhancement**: **Calendar View Task Description Clickable Links & Collapsible Dropdown Toggle** (`js/calendar-view.js`, `css/calendar.css`) —
  - **Clickable Markdown & URL Parsing**: Upgraded `showSimpleTaskDetails` in `js/calendar-view.js` to parse task descriptions and additional details through `Utils.escapeAndLinkify()`, converting markdown links `[label](url)` and raw URLs into clickable interactive hyperlinks.
  - **Collapsible Dropdown Button (`.task-description-toggle`)**: Embedded a collapsible dropdown button (*Show more / Show less* with rotating chevron) into task descriptions and details within the calendar task detail popup.
  - **Multi-Line Clamping**: Truncates descriptions to 2 lines (`-webkit-line-clamp: 2`) when collapsed and smoothly expands to full content height when toggled, styled across Light, Dark, and Gray themes.
- **Enhancement**: **LocalSend Web Direct Peer-to-Peer Sharing Integration** (`index.html`, `css/note.css`) — Added an inline link to [LocalSend Web](https://web.localsend.org/) within the personal Note Taking modal footer upload instructions (`.upload-instruction`) for direct local network peer-to-peer file sharing between devices without intermediate cloud upload.

### v2.48.0 (Stable)

- **Enhancement**: **Google Classroom Smaller Desktop Border Padding Elimination** — Excluded `#classroom-modal .modal-content` and `.classroom-modal-content` from generic modal padding on screen widths 769px–1366px and max-height 768px in `css/responsive.css` and `css/classroom.css`, rendering the Classroom window flush against modal bounds without nested borders or unwanted padding.
- **New Feature**: **Google Classroom To-Do Upcoming Deadlines Priority & Multi-Group Vertical Layout** — Reorganized the To-Do assignments section (`js/classroom.js`) into a structured hierarchy:
  - **Upcoming Deadlines (Top Priority)**: Active assignments with deadlines yet to pass appear at the very top, sorted chronologically with earliest deadlines first.
  - **Assigned (No Due Date)**: Active assignments without set deadlines follow directly below upcoming deadlines.
  - **"Past deadline" Divider Banner**: Overdue/missing unsubmitted tasks are separated by a small-height divider banner (`.passed-due-divider`) with a clock icon and item count badge. The banner is shown when active upcoming or assigned tasks exist above it.
  - **"Completed" Divider Banner & Deadline Sub-Grouping**: Submitted, graded, and returned assignments are displayed under a `Completed` divider banner. Completed items are vertically arranged by deadline status (early/on-time submissions first, followed by a `Past deadline` sub-banner and late-submitted assignments).
- **Enhancement**: **Theme-Adaptive Divider Banner Styling** — Added compact badge and hairline divider styling for `.classroom-group-divider` across Default Maroon, Dark Mode, and Gray Mode themes.

### v2.47.0 (Latest)

- **New Feature**: **UITS Event Raiders Live RSS & JSON Feed Syndication** (`js/raids-feed.js`) — Syndicated active tech competitions, hackathons, olympiads, and symposiums live from the `ou1ts/events` portal into b1t-Sched.
  - **Native JSON & RSS Fallback Ingestion**: Consumes `https://ou1ts.github.io/events/raids.json` preserving rich metadata (`subEvents`, `venue`, `fee`, `RegEndDate`, `dateRange`, and deep links) with an automatic fallback parser for the RSS 2.0 XML feed (`https://ou1ts.github.io/events/feed.xml`).
  - **Resilient Client Caching**: Stores feed results in `localStorage` (`b1t_raider_events_cache`) with a 30-minute TTL and graceful stale cache fallback during offline or network error states.
  - **Rich Event Presentation**: Renders event cards with date badge (Day/Month), category badge, registration deadline pill, fee badge, venue/online tag, contest segments count, collapsible description (*Show more / Show less*), and direct portal link buttons.
- **Enhancement**: **Desktop Sidebar Dedicated Vertical Events Layout** (`css/dashboard.css`)
  - Enforced strict vertical flex layout on `.dashboard-sidebar.desktop-only` with generous spacing (`gap: var(--spacing-xl)`) and visual separation between `<section class="events-section">` and `<section class="raider-events-section">`.
  - Both upcoming academic events and syndicated Raider events occupy dedicated full-width vertical space inside the sticky sidebar, eliminating horizontal scrollbar and card squeeze.
- **New Feature**: **Mobile Events Drawer Arrowhead View Switcher** (`css/dashboard.css`, `js/ui.js`, `js/app.js`)
  - Integrated a solid maroon right-pointing arrowhead button (`#events-view-switch-btn`) positioned at the vertical center of the sidebar's left border (`top: 50%; transform: translateY(-50%)`).
  - Button remains strictly hidden when the drawer is closed and appears smoothly when opened (`.events-sidebar.open`).
  - Seamlessly toggles the mobile drawer between **b1t-Sched Events** and **UITS Event Raiders** with directional arrow flipping and animated panel transitions.
- **Enhancement**: **Mobile Events Sidebar View State Persistence** (`js/app.js`, `js/ui.js`)
  - Automatically saves the active mobile events drawer view (`'internal'` vs `'raiders'`) to `localStorage` (`b1t_events_sidebar_view`).
  - Restores the user's view preference on initialization, keeping their preferred view active across page refreshes and app launches.
- **Enhancement**: **Two-Segment Event Card Grid Layout** (`js/ui.js`, `css/components.css`, `css/dashboard.css`)
  - Restructured event cards into two clear segments: `.event-header` containing the event title (and department scope badge) alongside `.event-date`, and `.event-details` containing badge pills, contest segments count, collapsible descriptions, and action buttons.
- **Enhancement**: **Offline Banner Dedicated Layout Space & Dynamic Height Offset** (`js/offline-indicator.js`, `css/components.css`, `css/navbar.css`, `css/main.css`, `index.html`, `css/dashboard.css`, `css/notice.css`, `css/classroom.css`)
  - Re-engineered the offline indicator from a floating overlay into a dedicated layout space that dynamically pushes all top-level website content, navbars, sidebars, and login views downward.
  - Implemented dynamic rendered height measurement with `ResizeObserver` (and window `resize` fallback) setting the root CSS custom property `--offline-banner-height`.
  - Configured `body.offline-active` styling across `.navbar`, `.main-content`, `.nav-center` (mobile drawer), `.auth-container`, `.set-details-container`, `.dashboard-sidebar`, mobile drawer sidebars (`#events-sidebar`, `#notice-sidebar`, `#classroom-sidebar`), and dimming backdrops (`#events-overlay`, `#notice-overlay`, `#classroom-overlay`) with `!important` offsets and `max-height` constraints so that no content or header is clipped or hidden when offline.
  - Added smooth CSS `top` and `height` transitions to `.navbar`, `.main-content`, `.events-sidebar`, `.notice-sidebar`, and `.classroom-sidebar` for fluid layout shifting.

### v2.46.0

- **New Feature**: **Google Classroom Real-Time Assignment Status Indicators** — Added comprehensive submission state tracking for all assignments listed under the **To-Do** section (both Unified "All Courses" and Course Detail views).
  - **Student Submissions API Integration**: Extended `fetchAssignmentsData()` to concurrently query the Google Classroom Student Submissions endpoint (`courses/{courseId}/courseWork/-/studentSubmissions?userId=me`) alongside coursework.
  - **Multi-State Classification**: Automatically parses submission state (`RETURNED`, `TURNED_IN`, `NEW`, `CREATED`), late submission flags (`isLate: true`), and grades (`assignedGrade` / `maxPoints`) while checking due dates against real time:
    - **`Missing`** (Red label `.status-missing`, `<i class="fa-solid fa-circle-exclamation"></i>`): Assignment is past its due date and has not been submitted.
    - **`Assigned`** (Blue label `.status-assigned`, `<i class="fa-solid fa-clock"></i>`): Active upcoming assignment awaiting student submission.
    - **`Turned in`** / **`Turned in (Late)`** (Green label `.status-turned-in`, `<i class="fa-solid fa-circle-check"></i>`): Successfully submitted by the student.
    - **`Returned`** / **`Graded: X/Y`** (Purple label `.status-returned`, `<i class="fa-solid fa-award"></i>`): Evaluated and returned by the teacher, displaying points earned when available.
  - **Dynamic Status Helper (`getAssignmentStatusInfo`)**: Generates consistent status labels, badge classes, and icons for both fresh API results and persistent offline JSON cache items.
  - **Cache & Merge Sensitivity**: Enhanced `mergeAndSkipUnchanged()` to check `existing.status === item.status`, ensuring changes in assignment submission status immediately invalidate stale cache rows and refresh the UI.
  - **Auto-Sync to Pending Tasks (`syncTurnedInAssignmentsToUserCompletions`)**: Whenever the user signs into Classroom or loads classroom contents, assignments detected as `Turned in`, `Turned in (Late)`, `Returned`, or `Graded` automatically match and mark corresponding tasks in the user's "Pending Tasks" list as completed/checked in Firestore and UI.
  - **Classroom Sync Two-Way Add & Update (`syncAssignmentsToTasks`)**: Enhanced the Admin/CR Sync feature so that clicking **Sync** not only adds new assignments to the main task list, but also automatically updates existing synced tasks if a teacher modifies deadlines, titles, or descriptions in Google Classroom.
  - **Classroom Desktop Minimum Width & Overflow Protection**: Enforced an 800px minimum width (`min-width: 800px;`) on `.classroom-modal-content` with horizontal scroll support on `#classroom-modal`, ensuring cards, action buttons, and course details are never squeezed on compact desktop or laptop displays.
  - **Pill UI & Theming**: Fixed at the bottom-right corner of each assignment card (`bottom: 10px; right: 16px;`) with dedicated light, dark, and monochromatic gray theme styling.

### v2.45.0
### v2.45.1 (Latest)

- **Enhancement**: **Changelog Modal Theme Colors & Vivid Badges** — Enhanced font brightness and contrast in dark and gray modes for changelog descriptions, dates, and subtitle texts. Added bright, high-contrast category badges for New Feature, Fix & Enhancement, Security, and Major updates.
- **Enhancement**: **Calendar Desktop Minimum Width & Cell Sizing** — Enforced an 820px minimum width on the desktop calendar modal content and 780px on the calendar grid with horizontal overflow support, preventing task items and course names from being squeezed on compact displays.
- **Fix & Enhancement**: **Protruding Floating Close Button & Unclipped Corner** — Redesigned the calendar modal close button to float over the top-right corner with 360-degree rotation and scale micro-interactions. Eliminated container corner clipping by enforcing visible overflow and elevated z-index.
- **Enhancement**: **Theme-Adaptive Month & Year Dropdown Chevrons** — Replaced harsh red dropdown arrows with sleek, modern stroke chevrons tuned to match active Light, Dark (lime green), and Gray (lavender/silver) themes.
- **Enhancement**: **Hidden Scrollbars Across Calendar Window** — Applied cross-browser scrollbar hiding across the calendar grid, weekly views, mobile date lists, and task detail modals while retaining full smooth scrolling via touch, mouse wheel, and trackpad.

### v2.45.0

- **New Feature**: **Version Update & What's New Modal** — Interactive changelog modal that automatically notifies users whenever a new service worker version is deployed, loading update history directly from `changes.json` with direct links to full documentation.
- **Fix & Enhancement**: **Persistent Task Type Filters & Re-clickable Controls** — Task list filters (Assignment, Homework, Exam, Project, Presentation, Other) remain strictly active when checking/unchecking tasks or deleting entries. Filter buttons are re-clickable to instantly refresh the filtered view.
- **Fix & Enhancement**: **Dynamic Department & Metadata Options Architecture** — Resolved issue where adding new department options in Firebase Firestore did not reflect in frontend dropdown selectors.
  - **Server-Priority Fetching**: Configured `DB.getDepartments()`, `DB.getSemesters()`, and `DB.getSections()` to prioritize fetching fresh metadata directly from the Firestore server (`source: 'server'`), preventing stale cache issues caused by offline IndexedDB persistence.
  - **Multi-Structure Document Support**: Added flexible parsing across various Firestore data formats (`list`, `departments`, `options`, `values`, `items`, `data`, comma-separated strings, numeric-keyed arrays, and key-value maps) and standalone `departments` collections.
  - **Dynamic Event Department Selectors**: Replaced hardcoded department options in `event-department` and `edit-event-department` modals in `index.html` with dynamic populator `App.populateEventDepartmentDropdown()`, ensuring all configured departments are available when creating or editing events.
  - **Comprehensive Faculty Filter**: Updated `App.setupFacultyDepartmentFilter()` to load all configured departments from Firestore metadata in addition to active tasks.
  - **Dropdown State Preservation**: Enhanced `UI.populateDropdown()` to preserve user selections when dropdowns are re-populated dynamically.
  - **Onboarding Route Listener**: Added explicit `set-details` route handling to `Router.onRouteChange` so onboarding department selectors load reliably on direct navigation and refreshes.
- **Enhancement**: **Smaller Desktop Display Responsiveness (1366x768px)** — Added optimized typography, spacing, card dimensions, and UI scaling specifically tuned for compact desktop displays and standard 1366x768 laptop screens.
- **Enhancement**: **Dedicated Semester Notice Dismissal Flag** — Semester auto-promotion notice dismissal is now persisted to the user profile in Firestore database (`semesterNoticeDismissedCycle`), keeping the banner dismissed across multiple logins until the next promotion cycle.

### v2.44.0

- **New Feature**: **Google Classroom Materials Tab** — Added a third view toggle tab (**Materials**) alongside To-Do and Notices to view all posted course materials across active courses (or within a specific course), powered by Google Classroom `/courseWorkMaterials` REST API and cached via `CacheManager`.
- **Enhancement**: **Auto-Collapse Accordion Logic** — Updated `Classroom.toggleItemExpand()` to automatically contract any previously expanded row when a user clicks to expand a new item, maintaining a clean single-expanded-row accordion view.
- **Enhancement**: **Seamless CSS Micro-Animations** — Added smooth `cubic-bezier(0.4, 0, 0.2, 1)` transition effects across classroom items, action buttons (`.classroom-item-action-btn`), icons, course cards, and view toggle tabs.
- **Enhancement**: **Copy Row Caption Button** — Added a row action Copy button (`copyItemText`) beside the expand chevron on each item row in Unified and Course views to easily copy full notice text, material descriptions, or assignment titles to the system clipboard with instant checkmark visual feedback (`fa-check`).
- **Enhancement**: **Hover Expand Dropdown & Attachment Support** — Added an interactive hover dropdown button (`.classroom-item-expand-btn`) to list item rows across Unified and Course detail views to expand truncated text inline. Expanded views automatically render Google Drive files, YouTube videos, forms, and web links (`renderItemAttachments`) as clickable pills separated by a horizontal line.
- **Fix**: **DOM Layout Card Breakdown Fix** — Converted item card containers from `<a class="classroom-item">` to `<div class="classroom-item" onclick="Classroom.handleItemClick(event, link)">` to prevent nested linkified URLs (`<a>` tags) in announcement bodies from breaking the browser HTML parser into 3 split rows.
- **Fix**: **Expand Button Top Alignment** — Updated `.classroom-item-expand-btn` in `classroom.css` with `align-self: flex-start; margin-top: 2px;` so the dropdown chevron button stays pinned to the top right of the row when expanded instead of floating down to the vertical center.
- **UI Clean-up**: **Notice Window Announcement Title Removal** — Removed the repetitive hardcoded `"Announcement"` title heading from all notice list items in the Notices view to display announcement content cleanly.
- **Enhancement**: **Archived Classrooms Management** — Updated Google Classroom course fetching to include archived courses while hiding them by default in "My Classes". Added a **"Show archived classrooms"** toggle button at the bottom of the course list, and ensured unified feeds strictly filter out content from archived classrooms.
- **Fix**: **Header Sign Out Button Visibility** — Header Sign Out buttons (`#logout-classroom-sidebar` and `#logout-classroom-modal`) start hidden when unauthenticated and are dynamically shown only when an active/connected Google Classroom session exists.

### v2.44.0

- **New Feature**: **Google Classroom Client JSON Template Caching** — Serializes user courses, assignments, notices, and materials into a structured JSON template (`classroom_cached_json`) saved to `localStorage` (mirrored in `sessionStorage`) for persistent offline access across browser tab closures and token expirations.
- **New Feature**: **Google Classroom Unified Pre-Fetching & Incremental Sync** — Refactored `Classroom.fetchCoursesAndLoadAll()` to pre-fetch active courses, assignments, announcements, and materials together in parallel (`fetchAllContentData`). Implemented `mergeAndSkipUnchanged()` fingerprinting (`id` + `updateTime`) so that unchanged items already loaded in cache are recognized and skipped during sync to prevent redundant processing.
- **New Feature**: **Seamless Expired Navigation & Reconnect Re-Fetch** — Extended expired session support across the Course List ("My Classes"), Unified Views, and Course-Wise Views, allowing users to browse cached course details and switch tabs seamlessly off cached data. Clicking **"Reconnect Classroom"** triggers a fresh batch fetch with incremental skip tracking.
- **New Feature**: **Persistent Bottom Reconnect Banner & Button** — Pinned sticky bottom footer bar (`#classroom-footer-mobile` and `#classroom-footer-desktop`) displaying a narrow warning banner (`"Cached Content, login again to see new data"`) and a persistent `"Reconnect Classroom"` button (`Classroom.login()`) whenever cached content is rendered due to token expiry.
- **UI Fix**: **Note Modal Fixed Upload & Action Row** — Placed `#upload-files-btn` into `.note-footer-buttons` alongside `Clear`, `PDF`, `Shorten`, and `Save` buttons inside `.modal-footer` (`.note-modal-footer`) so that all upload actions and modal controls stay fixed at the bottom of the modal while note content scrolls independently in `.note-modal-body`.
- **UI Enhancement**: **Desktop Calendar View Button Prominence** — Updated `#calendar-view-btn` in `dashboard.css` for desktop viewports (`@media (min-width: 769px)`) with generous padding (`8px 20px`), smooth rounded pill corners (`border-radius: 24px`), bold font weight (`600`), and interactive hover shadow/lift micro-animations.
- **UI Enhancement**: **Header Quick Links Dropdown Conversion** — Replaced the homepage resource links card grid (`.resource-links-section`) with a compact **Quick Links** dropdown menu button (`#quick-links-dropdown-btn`) placed right beside the Calendar View button (`#calendar-view-btn`) in `.section-header h2`. Removed link icons for a clean, minimalist typography dropdown list with PDF viewer modal interception and click-outside auto-dismissal.
- **UI Enhancement**: **Font Awesome v5/v6/v7 Cross-Version Support** — Upgraded Font Awesome CDN in `index.html` to version **6.7.2** and added full cross-version syntax support across Font Awesome versions 5, 6, and 7 (`fa-solid`, `fa-regular`, `fa-light`, `fa-thin`, `fa-duotone`, `fas`, `far`) with font-weight standardizations (`400` / `900`) so regular and solid style icons render cleanly across all themes.

### v2.43.0

- **Fix**: **Google Classroom Session Persistence** — `classroom_connected` flag is preserved across 1-hour access token expirations instead of prematurely logging out the user. The app attempts silent token renewal (`prompt: 'none'`) and falls back to serving cached assignments/announcements from `CacheManager` with a 1-click **Reconnect** banner if 3rd-party cookie policies block silent auth.
- **Enhancement**: **Google Classroom Unified Sign Out Button** — Single pill-styled (`border-radius: 20px`) Sign Out button (`.classroom-header-logout-btn`) added to top window title headers (`#classroom-sidebar` mobile and `#classroom-modal` desktop) beside title text. Redundant inner view Sign Out buttons were removed.
- **Enhancement**: **Semester Auto-Promotion Notice Banner Dismissal Persistence** — Dismissing the homepage banner (`#home-semester-notice-card`) via either "Check Profile" or "Dismiss" (`X`) now persists across browser sessions using semester cycle tracking (`localStorage.setItem('semesterNoticeDismissedCycle', currentCycle)`). The banner remains hidden until the next semester auto-promotion cycle starts in July or January.

### v2.41.2

- **Security & Config**: Migrated standard Firebase API keys inside `firebase-config.js` to environment variables (`process.env.*`) and updated the documentation with bundler requirements.
- **Documentation**: Documented strict Google Cloud Console HTTP Referrers setup (`https://b1tsched.netlify.app/*`) for securing the raw Firebase API Keys.


### v2.41.1

- **Update Feature Descriptions**: Added details about enhanced markdown support (bold, italic, fenced code blocks, inline code, links), HTML entity rendering (e.g., \*, &times;), and <pre> tag support in Tasks, Events, and Notes.
- **Update API Reference**: Refined the description of Utils.escapeAndLinkify to highlight its new robust rendering pipeline.
- **Add Version History**: Included entries for version 2.40.0 (PWA and offline fixes) and 2.41.0 (Enhanced Markdown Support).
- **Fix Stale Information**: Corrected the file upload description for notes (Catbox/Tmpfiles/file.io) and updated the "last updated" date and version footer.

### v2.41.0

- **Fix**: **Google Classroom Refresh Issue** — Removed the broken silent token refresh mechanism (`prompt: 'none'`). Now, when a session expires, the app falls back to displaying cached data (if available) with an amber "Session expired · Last updated X ago" banner. If no cache exists, it defaults to the sign-in screen.
- **Enhancement**: **Classroom Drop-in Refresh** — Added a manual refresh button (🔄) next to the Home button in the "All Courses" header that clears the Cache API and re-fetches fresh assignments and announcements.
- **Fix**: **Note PDF Export Blank Font** — Fixed an issue where PDF exports generated via `html2pdf.js` would render with invisible text in dark themes. Added a delay (`requestAnimationFrame` + `setTimeout`) to ensure the browser repaints the forced black text before capturing, and fortified the CSS override with a white background and transparent borders.

### v2.40.0

- **Fix**: **Google Classroom Login Flash** — Defer silent token refresh logic until user interaction (clicking navigation button or toggle) to prevent a brief Google Sign-In interface flash on initial page load. Added `needsSilentRefresh` flag and loading state during deferred reconnection.
- **Fix**: **Task Card Layout Optimization** — Expanded description and deadline width to fill the empty space below checkboxes. Switched checkbox to absolute positioning and adjusted header padding (`padding-left: 38px`).
- **Fix**: **Offline Banner Mobile Layout** — Reduced height/padding of the offline banner on mobile screens. Improved layout logic to push the entire page content (including fixed-position sidebar toggles like Events and Classroom) downward when the banner is active using `body.offline-active`.
- **Fix**: **Note Link Download Reliability** — Rewrote link click handler to use `window.open()` and implemented platform-specific fallback instructions (Mobile: long-press; Desktop: right-click) via the download helper.
- **Fix**: **Title Wrap for Recent/Old Items** — Fixed a bug where long titles in "Old Tasks", "Old Events", and "Old Notices" were truncated with ellipsis. Now uses `word-break: break-word` for full visibility.
- **Fix**: **Task Title Overlap** — Added significant right padding to the task header title area to prevent overlapping with the task type badge and action buttons.
- **Enhancement**: **Unified Close Buttons** — Replaced legacy `<span>×</span>` close buttons in the Activity Timeline modal and details popup with standard, accessible `<button class="btn btn-icon">` elements.

### v2.39.0 (Stable)

- **Fix**: **Urgent Deadline Visibility** — Updated Dark Mode styling for urgent deadlines to use high-contrast dark red (`#8b0000`) text, improving readability over the warning background.
- **Fix**: **Application Preloader Logic** — Resolved issue where the footer and user counter were visible prematurely during initial load; visibility is now synchronized with data completion.
- **Enhancement**: **Enhanced Loading Screen** — Increased preloader `z-index` to `10005` and implemented body scroll locking while the loading screen is active.
- **Refactor**: **Visibility Controller** — Centralized all dashboard-specific element visibility (Footer, Total User Count, FAQ, Contributions) into the route-based logic in `UI.updateSectionVisibility()`.
- **Refactor**: **Data Fetching Synchronization** — Added `isLoadingData` state and improved `handleAuthenticatedUser` logic to ensure the dashboard is fully populated before revealing the UI.

### v2.38.0 (Stable)

- **Fix**: **Note PDF Export** — Forced a white background and black text during PDF generation to ensure visibility in dark mode. Added `.printing-pdf` CSS class for style overrides.
- **Enhancement**: **Note Shorten Feature** — Simplified "Shorten" to a local `.md` download with the `shortened-` prefix, bypassing JS upload blocks and CORS issues.
- **Fix**: **Note Modal UI** — Added `min-height: 0` to the modal body and adjusted flex properties to prevent message banners from overlapping with text fields or action buttons.
- **Enhancement**: **Upload Fallback Reordering** — Reordered third-party upload providers to prioritize reliable services (Catbox, Tmpfiles) and put `file.io` as the final fallback.

### v2.37.0 (Stable)

- **New Feature**: **Gray Mode Theme** — Added a sleek monochromatic theme available in Profile Appearance settings.
- **Enhancement**: **System Dark Mode Default** — System theme preference now defaults to "Gray Mode" for a better low-strain experience.
- **Fix**: **Overdue Task Styling** — Redesigned overdue highlights for all dark themes to ensure readability.
- **Enhancement**: **Full Component Integration** — Classroom, Timeline, and Dashboards fully updated for monochromatic Gray Mode consistency.

### v2.36.0

- **Enhancement**: Google Classroom API now loads content from All Courses right after Sign In.
- **New Feature**: Dedicated button to load enrolled courses list.

### v2.35.0

- **Fix**: Google Classroom Sign-In Flicker — updated initialization logic to be promise-based, allowing the application to hide the brief GIS silent refresh popup behind the initial loading screen.
- **Enhancement**: Added a 5-second safety timeout to Classroom initialization to prevent the app from hanging on slow network connections.
- **Refactor**: `Classroom.init()` and `Classroom.checkPersistedSession()` now return Promises for better synchronization with the main app lifecycle.

### v2.34.0

### v2.33.0

- **New Feature**: CR Notice deadline support — optional deadline field ("No official Time limit" or specific datetime) for notices, displayed with clock icon (green for active, red for past).
- **New Feature**: Mobile Calendar Monthly View — compact date grid with week numbers, maroon dot indicators for dates with tasks, today highlight, and tappable task list panel showing course + title + deadline time.
- **New Feature**: Monthly/Weekly toggle on both mobile calendar views — users can switch between monthly and weekly views.
- **Enhancement**: Mobile monthly calendar uses light maroon+white theme matching the website (previously dark theme).
- **Enhancement**: Task list panel in monthly view shows course name alongside task title.
- **Enhancement**: Firestore rules updated with `hasValidDeadline()` helper for CR Notice deadline validation.
- **Enhancement**: Deadline form labels styled with bottom border for visual separation.
- **Enhancement**: Deadline radio button labels updated to "No official Time limit" (from "No Deadline") for consistency.

### v2.33.0

- **New Feature**: Student Search Bar — Real-time search in User Management view (`#user-search-input`) by email, student ID, department, semester, or section with clear button.
- **New Feature**: Vercel Blob Notice Caching — Serverless backend (`api/notices.js`) uses `@vercel/blob` (`notices.json`) for global Edge CDN notice caching with 6-hour TTL, force refresh (`?refresh=true`), and emergency stale fallbacks.
- **New Feature**: Semester Auto-Promotion — Student semesters automatically advance every July and January on user login based on `lastSemesterCycle`.
- **New Feature**: Homepage Semester Auto-Promotion Notice Banner (`#home-semester-notice-card`) with a direct button link to Profile Settings.
- **New Feature**: 30-Day Manual Profile Cooldown Protection — Auto-promotion is paused if a student manually modified their profile within 30 days, displaying an amber notice in Profile Settings.
- **New Feature**: Admin Fail-Safe Bulk Semester Update — Dedicated button in User Management view with a 30-second read-only verification countdown timer, fail-safe verification prompt, and a 6-month ($180\text{ days}$) execution cooldown saved to `/metadata/semesterConfig`.

### v2.32.0

- **New Feature**: CR Notice section merging — notices posted by B1 CR are now visible to B2 users (and vice versa). Sections are grouped by letter (A1+A2 → A).
- **New Feature**: Compact notice cards with "See More" toggle for long descriptions (2-line truncation, expandable).
- **New Feature**: CR Notice editing — CRs can edit their own notices; Admins can edit any notice.
- **New Feature**: "Added by" info displayed on notice cards (shows email username).
- **Enhancement**: CR Notice create/delete actions are now logged to the Activity Timeline.
- **Enhancement**: Improved Edit Notice modal CSS with maroon accent, focus states, and consistent form styling.
- **Enhancement**: Firestore rules use section group matching (`getUserSection()[0:1]`) for broader notice visibility.
- **Fix**: Replaced broken `UI.escapeHtml` calls with `Utils.escapeAndLinkify` in notice rendering.

### v2.31.0

- **Fix**: CR Notice data population — department, semester, and section are now auto-read from user profile instead of broken manual dropdowns.
- **Fix**: Admin notice creation — Firestore rules updated to allow Admins to create notices.

### v2.30.0

- **Enhancement**: Notice viewer profile message removed (no more "Complete your profile" blocking message).
- **Enhancement**: PDF modal enlarged for desktop viewing.

### v2.29.0

- **New Feature**: Activity Timeline with heatmap and weekly stats.
- **New Feature**: Live User Counter on dashboard and footer.
- **Enhancement**: Mobile Calendar UI overhaul (centered, scrollable, borders).
- **Enhancement**: Note Button visibility logic improved (route-based & auth-aware).
- **Fix**: Collection name mismatch (`activity_timeline` -> `activity_logs`).
- **Fix**: Mobile clickability issues (z-index overlay).
- **Utility**: Added `backpopulateTasks` for timeline history migration.

### v2.28.0
