# b1t-Sched - Complete Project Documentation

> **Academic Task Scheduler** - A Single Page Application (SPA) for managing academic tasks, assignments, exams, and events with personalized department-specific content.

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
- **Task Management** - View pending assignments and exams with deadlines (or "No official Time limit"), with basic markdown (`**bold**`, `*italic*`, `` `code` ``, `[link](url)`), and clickable links, collapsible descriptions (2-line truncation). "Set Deadline" is now the default option when adding tasks.
- **Task Completion** - Checkboxes to mark tasks complete, persistent per-user
- **Task Editing** - Users can edit their own tasks; admins can edit all tasks; Course is required field
- **Event Calendar** - Track upcoming academic events with basic markdown, clickable links, collapsible descriptions (2-line truncation), and department scope badge (ALL/CSE/etc.)
- **Event Editing** - Admins can edit all events; CRs can edit/delete their own events
- **Resource Links** - Quick access to department-specific resources with built-in PDF viewer (desktop: Google Docs Viewer in modal; mobile: opens in new tab)
- **Google Classroom Integration** - View all assignments and announcements from enrolled courses in a unified interface with OAuth authentication and session persistence (auto-refresh tokens). Includes a one-click **Sync to Tasks** feature for Admins/CRs to automatically add Classroom assignments to the main Tasks list (avoids duplicates).
- **Session Security** - Automatic logout after 1 hour of inactivity (unless "Stay logged in" is checked), with activity-based timer reset for enhanced security
- **Stay Logged In** - Optional "Trust this device" checkbox on login to persist session indefinitely on safe devices
- **Role Badges** - Visual indicators for CR and Faculty contributors in task cards and contribution lists
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Maroon Theme** - Professional dark maroon and off-white color scheme
- **Dark Theme Customization** - Dynamic, RealtimeColors-based dark theme (`#1a1c0d`, `#d4dd93`, `#d5eb2c` palette) with seamless toggling via "Appearance Settings" in the Profile menu. Avoids caching FOUC (flash of unstyled content) via inline scripting.
- **Admin Features** - Task reset, task/event delete, event creation, user management with password reset and deletion
- **Admin User Management** - View all users, manage roles (CR/Faculty/Blocked), edit user profiles, send password resets (via Client SDK), delete users
- **Password Reset Enhancements** - "Forgot Password" link on login failure, "Reset Password" button in Profile Settings, and robust Admin reset functionality bypassing CORS issues
- **CR Role** - Class Representatives can reset and delete tasks for their section, create events for their semester, and edit/delete their own events
- **Faculty Role** - Faculty members can view department-wide tasks (no semester/section filtering), create events for their department, and edit/delete their own events
- **Blocked Users** - Restricted accounts in read-only mode (cannot add/edit/delete tasks or change profile)
- **CR Info Message** - Non-CR users see instructions to contact admin for CR role
- **Profile Change Cooldown** - Users can only change profile once per 30 days (anti-spam)
- **Two-Column Layout** - Events sidebar on desktop, slide-out panel (40vw) on mobile
- **Notice Viewer** - View UCAM university notices with PDF preview (desktop modal with split-pane layout; mobile slide-out sidebar), powered by Vercel serverless backend with local caching
- **Note Taking** - Personal note-taking feature with markdown support, auto-save, and automatic file upload via file.io API with direct download support (no new tab required)
- **Task Filtering** - Filter pending tasks by type (Assignment, Homework, Exam, Project, Presentation, Other)
- **Global Contributions** - View a leaderboard of top contributors (group-specific or global across all departments)
- **User Counter** - Live count of total registered users displayed on the dashboard and footer
- **Activity Timeline** - Visual heatmap and bar chart tracking user activity (logins, tasks, events, profile updates) to visualize productivity patterns. Includes a backpopulation utility for existing tasks.
- **User Counter** - Live count of total registered users displayed on the dashboard and footer.
- **Mobile Calendar** - Monthly and weekly views for mobile with a toggle to switch between them. Monthly view features a compact date grid with maroon dot indicators for dates with tasks, today highlight, and a tappable task list panel showing course + title + deadline time. Weekly view provides vertical scrolling by week. Includes Month/Year dropdowns for quick navigation.
- **FAQ Section** - Collapsible accordion explaining how the site works, user roles, and profile settings
- **Footer with Credits** - Source code link, total user count, and dynamic copyright year

### Technology Stack (Summary)
| Category | Technology |
|----------|------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend (Database & Auth) | Firebase (Firestore, Authentication) |
| Backend (Notice API) | Vercel Serverless Functions (Node.js) |
| Icons | Font Awesome 6.5 |
| Hosting | Netlify (frontend), Vercel (backend API) |

---

## Technology Stack (Detailed)

This section provides a comprehensive breakdown of every library, framework, service, and tool used in the project.

### Frontend Technologies

| Technology | Version | Purpose | Delivery |
|-----------|---------|---------|----------|
| **HTML5** | — | Page structure, semantic markup | Native |
| **CSS3** | — | Styling, layouts, responsive design, CSS custom properties (variables) | Native |
| **Vanilla JavaScript (ES6+)** | — | Application logic, DOM manipulation, SPA routing | Native |

### Firebase SDK

| Package | Version | Purpose | Delivery |
|---------|---------|---------|----------|
| **firebase-app-compat** | 10.7.1 | Firebase core initialization | CDN (`gstatic.com`) |
| **firebase-auth-compat** | 10.7.1 | Email/password authentication, email verification, password reset | CDN (`gstatic.com`) |
| **firebase-firestore-compat** | 10.7.1 | NoSQL cloud database (Firestore) for users, tasks, events, resources, metadata | CDN (`gstatic.com`) |

> **Note:** The project uses the Firebase **compat** (v8-style) SDK loaded via CDN `<script>` tags, not the modular v9+ import style.

### Google APIs

| Library | Version | Purpose | Delivery |
|---------|---------|---------|----------|
| **Google Identity Services** | Latest | OAuth 2.0 authentication for Google Classroom API access | CDN (`accounts.google.com/gsi/client`) |

### Icons & Fonts

| Library | Version | Purpose | Delivery |
|---------|---------|---------|----------|
| **Font Awesome** | 6.5.0 | UI icons (navigation, buttons, status indicators, task/event icons) | CDN (`cdnjs.cloudflare.com`) |

### Backend Services

| Service | Purpose | Details |
|---------|---------|----------|
| **Firebase Authentication** | User sign-up, login, email verification, password reset | Email/password provider |
| **Cloud Firestore** | Primary database for all application data | Collections: `users`, `tasks`, `events`, `resourceLinks`, `metadata` |
| **Vercel Serverless Functions** | Notice scraping API backend (`b1t-acad-backend.vercel.app`) | Node.js runtime; scrapes UCAM portal notices, proxies PDF downloads |

### Hosting & Deployment

| Platform | Purpose | Details |
|---------|---------|----------|
| **Netlify** | Frontend static hosting | Deploys `index.html` + CSS/JS assets; domain: `b1tsched.netlify.app` |
| **Vercel** | Backend API hosting | Serverless functions for notice scraping; domain: `b1t-acad-backend.vercel.app` |

### Browser APIs & Web Standards Used

| API | Purpose |
|-----|----------|
| **localStorage** | Client-side caching (notice data, user preferences) |
| **Fetch API** | HTTP requests to Vercel backend for notices/PDFs |
| **Hash-based Routing** (`hashchange` event) | SPA navigation without page reloads |
| **Blob API** | PDF handling for notice downloads |

### Development & Configuration

| Tool | Purpose |
|------|----------|
| **Firestore Security Rules** | Server-side access control (role-based: Admin, CR, Blocked, Regular) |
| **Git** | Version control |

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
│                     JavaScript Modules                       │
│  ┌─────────────┐  ┌──────────┐  ┌────────┐  ┌────────────┐  │
│  │ firebase-   │  │  auth.js │  │ db.js  │  │ routing.js │  │
│  │ config.js   │  │          │  │        │  │            │  │
│  └─────────────┘  └──────────┘  └────────┘  └────────────┘  │
│  ┌─────────────┐  ┌──────────┐  ┌────────┐  ┌────────────┐  │
│  │ profile.js  │  │  ui.js   │  │utils.js│  │  app.js    │  │
│  │             │  │          │  │        │  │  (Main)    │  │
│  └─────────────┘  └──────────┘  └────────┘  └────────────┘  │
│  ┌─────────────┐                                             │
│  │ notice.js   │                                             │
│  │             │                                             │
│  └─────────────┘                                             │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Backend                          │
│  ┌─────────────────────┐  ┌────────────────────────────────┐│
│  │   Authentication    │  │         Firestore              ││
│  │  (Email/Password)   │  │  ┌──────┐ ┌─────┐ ┌──────────┐││
│  └─────────────────────┘  │  │users │ │tasks│ │  events  │││
│                           │  └──────┘ └─────┘ └──────────┘││
│                           │  ┌────────────┐ ┌────────────┐││
│                           │  │resourceLink│ │  metadata  │││
│                           │  └────────────┘ └────────────┘││
│                           └────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Vercel Serverless Backend                       │
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
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

// Exposed globals
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();      // Authentication instance
const db = firebase.firestore();   // Firestore instance
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

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `signup(email, password)` | string, string | `{success, user/error}` | Create new user account |
| `login(email, password, rememberMe)` | string, string, boolean | `{success, user/error}` | Sign in existing user; optional `rememberMe` to skip session timeout |
| `logout()` | - | `{success, error?}` | Sign out current user and clear session timer |
| `onAuthStateChanged(callback)` | function | unsubscribe function | Listen for auth state changes; manages session timer |
| `getCurrentUser()` | - | User object or null | Get current Firebase user |
| `getUserId()` | - | string or null | Get current user's UID |
| `getUserEmail()` | - | string or null | Get current user's email |
| `getErrorMessage(errorCode)` | string | string | Convert Firebase error codes to user-friendly messages |
| `resendVerificationEmail()` | - | `{success, message/error}` | Resend email verification link |
| `sendPasswordResetEmail(email)` | string | `{success, message/error}` | Send password reset link to email |
| `startSessionTimer()` | - | void | Start 1-hour session timeout timer |
| `clearSessionTimer()` | - | void | Clear active session timeout timer |
| `resetSessionTimer()` | - | void | Reset session timer on user activity |

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

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `createUserProfile(userId, data)` | string, object | `{success, error?}` | Create new user profile |
| `getUserProfile(userId)` | string | `{success, data/error}` | Get user profile data |
| `updateUserProfile(userId, data)` | string, object | `{success, error?}` | Update user profile |

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
  theme: string,          // Optional - User's selected theme ('system', 'light', 'dark')
  lastProfileChange: Timestamp, // Optional - last profile edit timestamp (30-day cooldown)
  lastProfileChangeByAdmin: Timestamp, // Optional - last admin edit timestamp
  createdAt: Timestamp,
  updatedAt: Timestamp,
  noteContent: string,    // Optional - user's personal notes (max 1MB)
  noteUpdatedAt: Timestamp // Optional - last note update timestamp
}
```

#### Task Operations

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getTasks(department, semester, section)` | string, string, string | `{success, data/error}` | Get pending tasks (includes overdue within 12h grace period and no-deadline tasks) |
| `getFacultyTasks(department)` | string | `{success, data/error}` | Get department-wide tasks for Faculty users (no semester/section filtering) |
| `getAllActiveTasks()` | - | `{success, data/error}` | Get all active tasks across all departments (for global contributions) |
| `createTask(userId, userEmail, data)` | string, string, object | `{success, id/error}` | Create new task. Deadline can be a timestamp or `null` ("No official Time limit") |
| `updateTask(taskId, data)` | string, object | `{success, error?}` | Update existing task. Deadline can be changed between timestamp and `null` |
| `getUserTaskCompletions(userId)` | string | `{success, data/error}` | Get user's completed tasks |
| `toggleTaskCompletion(userId, taskId, isCompleted)` | string, string, boolean | `{success, error?}` | Toggle task completion |
| `getOldTasks(userId, department, semester, section)` | strings | `{success, data/error}` | Get tasks past 12h grace period (excludes no-deadline tasks) |
| `deleteTask(taskId)` | string | `{success, error?}` | Delete task (admin or CR) |
| `resetOldTasks(department, semester, section)` | strings | `{success, deletedCount/error}` | Delete all past tasks, skipping no-deadline tasks (admin or CR) |

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

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getEvents(department)` | string (default: 'ALL') | `{success, data/error}` | Get upcoming events |
| `createEvent(data)` | object | `{success, id/error}` | Create event (admin or CR for own department) |
| `updateEvent(eventId, data)` | string, object | `{success, error?}` | Update existing event (admin or CR for own events) |
| `deleteEvent(eventId)` | string | `{success, error?}` | Delete event (admin or CR for own events) |
| `getOldEvents(department)` | string | `{success, data/error}` | Get past events |

#### Role Operations

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getUserRoles(userId)` | string | `{success, isAdmin, isCR, isBlocked/error}` | Check user's admin/CR/blocked status |

#### User Management Operations (Admin Only)

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getAllUsers()` | - | `{success, data/error}` | Get all users for admin panel |
| `updateUserRole(userId, role, value)` | string, string, boolean | `{success, error?}` | Set user role (isCR, isBlocked) |
| `adminUpdateUserProfile(userId, data)` | string, object | `{success, error?}` | Admin edit user profile (bypasses cooldown) |

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

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getResourceLinks(department)` | string | `{success, data/error}` | Get department resources |

#### Metadata Operations

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getDepartments()` | - | `{success, data/error}` | Get list of departments |
| `getSemesters()` | - | `{success, data/error}` | Get list of semesters |
| `getSections(department, semester)` | string, string | `{success, data/error}` | Get sections for dept/sem |

---

### 4. Router (routing.js)

**Purpose:** Hash-based SPA routing

#### Routes Configuration

| Hash | Route Name | View ID |
|------|------------|---------|
| `""` (empty) | login | `login-view` |
| `#/dashboard` | dashboard | `dashboard-view` |
| `#/profile-settings` | profile-settings | `profile-settings-view` |
| `#/set-details` | set-details | `set-details-view` || `#/user-management` | user-management | `user-management-view` |
#### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `init()` | - | Initialize router, listen for hashchange |
| `handleRoute()` | - | Process current hash, show appropriate view |
| `navigate(route)` | string | Navigate to named route |
| `showView(viewName)` | string | Display specific view, hide others |
| `onRouteChange(callback)` | function | Register route change listener |
| `getCurrentRoute()` | - | Get current route name |

---

### 5. UI (ui.js)

**Purpose:** UI rendering and manipulation

| Method | Parameters | Description |
|--------|------------|-------------|
| `showLoading(show)` | boolean | Show/hide loading screen |
| `showMessage(elementId, message, type)` | string, string, string | Display message (error/success/info) |
| `hideMessage(elementId)` | string | Hide message element |
| `updateUserDetailsCard(email, dept, sem, section)` | strings | Update navbar user card |
| `renderResourceLinks(links)` | array | Render resource link cards; detects `.pdf` URLs and intercepts clicks (desktop: opens PDF viewer modal; mobile: opens in new tab) |
| `initPdfViewer()` | - | Initialize PDF viewer modal: close button and backdrop click listeners |
| `openPdfViewer(url, title)` | string, string | Open PDF in viewer modal using Google Docs Viewer iframe |
| `closePdfViewer()` | - | Close PDF viewer modal and clear iframe |
| `renderTasks(tasks, userCompletions, isAdmin, isCR, currentUserId)` | array, object, boolean, boolean, string | Render task cards with checkboxes, collapsible descriptions, vertical edit/delete buttons |
| `renderOldTasks(tasks)` | array | Render old tasks (past 12h grace period) with completion status |
| `renderEvents(events, isAdmin)` | array, boolean | Render event cards with edit/delete buttons |
| `renderOldEvents(events)` | array | Render past events list |
| `populateDropdown(elementId, items, selectedValue)` | string, array, string? | Populate select dropdown |
| `showModal(modalId)` | string | Display modal dialog |
| `hideModal(modalId)` | string | Hide modal dialog |
| `toggleEventsSidebar(open)` | boolean | Open/close mobile events sidebar |
| `toggleAdminControls(isAdmin, isCR)` | boolean, boolean | Show/hide admin-only and CR elements |
| `toggleBlockedUserMode(isBlocked)` | boolean | Enable/disable read-only mode for blocked users |

---

### 6. Profile (profile.js)

**Purpose:** Profile settings management

| Method | Parameters | Description |
|--------|------------|-------------|
| `init()` | - | Initialize profile module |
| `setupEventListeners()` | - | Attach event listeners to profile UI |
| `loadProfile()` | - | Load and display user profile, including pre-selecting "Appearance Settings" |
| `updateSectionDropdown(elementId, dept, sem, selectedValue)` | strings | Update section dropdown |
| `updateCooldownMessage()` | - | Display remaining days until profile can be changed |
| `handleSaveProfile()` | - | Save profile changes to Firestore. Note: Theme updates bypass the standard 30-day cooldown. |

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
NoticeViewer.API_BASE = 'https://b1t-acad-backend.vercel.app'  // Vercel backend
NoticeViewer.CACHE_KEY = 'b1tSched_notices'                    // localStorage key
NoticeViewer.CACHE_TTL = 7 * 24 * 60 * 60 * 1000               // 7-day cache TTL
```

#### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `init()` | - | Initialize notice viewer: setup event listeners for desktop modal and mobile sidebar; attach load/close buttons |
| `checkCache()` | - | Check localStorage for cached notices within TTL; returns cached data or `null` |
| `saveToCache(notices)` | array | Save fetched notices to localStorage with timestamp |
| `loadNotices()` | - | Fetch notices from Vercel backend with cache fallback; renders to desktop and mobile containers. On server error (503), attempts to load from cache and displays warning banner. |
| `renderAllNotices()` | - | Render notice lists in both desktop and mobile containers |
| `renderNoticeList(containerId, isMobile)` | string, boolean | Render notice list items into a given container (desktop: clickable list with PDF preview) |
| `renderNoticeListMobile(containerId)` | string | Render mobile-optimized notice list (tap to open PDF in new tab) |
| `selectNotice(id, clickedItem, listContainer)` | string, element, element | Select a notice: highlight it, load PDF into iframe (desktop only) |
| `openNoticePdfInNewTab(id)` | string | Open notice PDF in a new browser tab (mobile) |
| `showLoadingState()` | - | Show loading spinner in notice containers |
| `showErrorState(message)` | string | Show error message with retry button in notice containers |
| `toggleNoticeSidebar(open)` | boolean | Toggle mobile notice sidebar open/closed with overlay |
| `openNoticeModal()` | - | Open desktop notice modal |
| `closeNoticeModal()` | - | Close desktop notice modal |

**Desktop Flow:** Navbar "Notice" button → Modal opens → Click "Load Notices" → Notice list + PDF preview panel (split-pane layout) → Click notice → PDF loads in embedded iframe → Open/Download buttons

**Mobile Flow:** Floating "Notices" toggle → Sidebar slides in → Click "Load Notices" → Notice list → Tap notice → PDF opens in new tab

**Error Handling:** When the Vercel backend is unavailable (503 error), the app automatically falls back to cached notices (if available within 7-day TTL) and displays a warning banner: "Server unavailable. Showing cached notices." This ensures users can still access notices even when the backend is down.

---

### 8. NoteManager (notes.js)

**Purpose:** Personal note-taking with markdown support and automatic file upload

#### Configuration

```javascript
NoteManager.autoSaveTimer = null           // Auto-save debounce timer
NoteManager.currentUserId = null           // Current authenticated user
```

#### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `init()` | - | Initialize note module with auth listener |
| `setupEventListeners()` | - | Attach event listeners for modal, buttons, file input |
| `enableNoteFeature()` | - | Show note toggle buttons for authenticated users |
| `disableNoteFeature()` | - | Hide note toggle buttons for unauthenticated users |
| `openModal()` | - | Open note modal and load user's note |
| `closeModal()` | - | Close note modal |
| `triggerFileUpload()` | - | Trigger hidden file input click |
| `handleFileSelect(event)` | Event | Handle file selection and upload |
| `uploadToFileIO(file)` | File | Upload file to file.io API, returns direct download URL |
| `insertLinkIntoNote(filename, url)` | string, string | Insert markdown link at cursor position in textarea |
| `updatePreview(content)` | string | Update preview pane with formatted markdown |
| `setupAutoSave(content)` | string | Setup auto-save with 500ms debounce |
| `loadNote(userId)` | string | Load note from Firestore |
| `saveNote(userId, content)` | string, string | Save note to Firestore (max 1MB) |
| `handleSave()` | - | Handle manual save button click |
| `handleClear()` | - | Handle clear button click with confirmation |
| `clearNote(userId)` | string | Clear note from Firestore |
| `validateNoteContent(content)` | string | Validate note size (max 1MB) |
| `showMessage(message, type)` | string, string | Display message to user |

**Features:**
- **Auto-save:** Saves note content automatically with 500ms debounce
- **File Upload:** Automatic upload to file.io API (max 100MB per file)
- **Direct Download URLs:** file.io provides direct download links (available for 14 days)
- **Markdown Links:** Inserts `[filename](url)` at cursor position after upload
- **Preview Pane:** Live preview with markdown rendering (bold, italic, code, links)
- **Persistent Storage:** Notes stored in Firestore user document (max 1MB)
- **Upload Progress:** Shows spinner during file upload
- **Error Handling:** Validates file size and handles upload failures

**Upload Flow:** Click "Upload Files" → Select file → Auto-upload to file.io → Insert markdown link at cursor → Auto-save note

**file.io API:**
- Endpoint: `https://file.io/`
- Method: POST with FormData
- Max file size: 100MB
- Response: `{success: true, link: "https://file.io/abc123"}`
- Files available for 14 days with direct download support

---

### 9. Utils (utils.js)

**Purpose:** Utility functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `formatDate(date)` | Date/string | string | Format date with time |
| `formatDateShort(date)` | Date/string | string | Format date (month, day only) |
| `daysUntil(date)` | Date/string | number | Calculate days until date |
| `isValidEmail(email)` | string | boolean | Validate email format |
| `isValidPassword(password)` | string | boolean | Validate password (min 6 chars) |
| `truncate(text, maxLength)` | string, number | string | Truncate text with ellipsis |
| `debounce(func, wait)` | function, number | function | Debounce function calls |
| `getSectionGroup(section)` | string | string | Get section group letter (A1 → A) |
| `getSectionsInGroup(section)` | string | array | Get all sections in group (A1 → [A1, A2]) |
| `linkify(text)` | string | string | Convert URLs in text to clickable anchor tags |
| `applyBasicMarkdown(text)` | string | string | Apply basic markdown: `**bold**`, `*italic*`, `` `code` `` |
| `escapeAndLinkify(text)` | string | string | Escape HTML, apply markdown, linkify URLs, convert line breaks (XSS-safe) |

**Storage Helpers (`Utils.storage`):**

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `get(key)` | string | any/null | Get from localStorage |
| `set(key, value)` | string, any | boolean | Save to localStorage |
| `remove(key)` | string | boolean | Remove from localStorage |
| `clear()` | - | boolean | Clear all localStorage |

---

### 10. App (app.js)

**Purpose:** Main application controller

| Method | Parameters | Description |
|--------|------------|-------------|
| `init()` | - | Initialize application |
| `setupEventListeners()` | - | Setup form and button listeners |
| `handleLogin()` | - | Process login form submission |
| `handleSignup()` | - | Process signup form submission |
| `handlePasswordReset()` | - | Process password reset form submission |
| `handleAuthenticatedUser(user)` | User object | Handle post-authentication flow |
| `handleUnauthenticatedUser()` | - | Handle logged out state |
| `loadSetDetailsForm()` | - | Load set details form dropdowns |
| `updateSetDetailsSections()` | - | Update sections on dept/sem change |
| `handleSetDetails()` | - | Process set details form (with studentId) |
| `loadDashboardData()` | - | Load tasks, events, resources; reapplies active task filter after loading |
| `setupTaskEventListeners()` | - | Setup task-related event handlers |
| `setupEventsSidebarListeners()` | - | Setup mobile sidebar handlers |
| `setupAdminEventListeners()` | - | Setup admin-related event handlers |
| `handleTaskCompletion(taskId, isCompleted)` | string, boolean | Toggle task completion |
| `openAddTaskModal()` | - | Open add task modal |
| `handleAddTask()` | - | Process add task form. Supports two deadline options: (1) No official Time limit (stores deadline as null), or (2) a specific date/time. |
| `openOldTasksModal()` | - | Open completed tasks modal |
| `handleResetTasks()` | - | Reset all old tasks (admin or CR) |
| `handleDeleteTask(taskId)` | string | Delete task (admin or CR) |
| `openEditTaskModal(taskId)` | string | Open edit task modal with pre-filled data |
| `handleEditTask()` | - | Process edit task form submission. Supports two deadline options: (1) No official Time limit (stores deadline as null), or (2) a specific date/time. |
| `openAddEventModal()` | - | Open add event modal (admin) |
| `handleAddEvent()` | - | Process add event form (admin) |
| `handleDeleteEvent(eventId)` | string | Delete event (admin) |
| `openEditEventModal(eventId)` | string | Open edit event modal with pre-filled data (admin) |
| `handleEditEvent()` | - | Process edit event form submission (admin) |
| `openOldEventsModal()` | - | Open past events modal |
| `setupUserManagementListeners()` | - | Setup user management event handlers |
| `loadUserManagement()` | - | Load all users for admin panel |
| `renderUserList(users)` | array | Render user cards in admin panel |
| `filterUsers()` | - | Filter users by department/semester/section/role |
| `clearUserFilters()` | - | Reset all user filters |
| `toggleUserRole(userId, role, value)` | strings, boolean | Toggle user role (isCR, isBlocked) |
| `openEditUserModal(userId)` | string | Open edit user modal |
| `updateEditUserSections(selectedValue)` | string? | Update sections in edit user modal |
| `handleEditUser()` | - | Process edit user form (admin) |
| `handleEditUser()` | - | Process edit user form (admin) |
| `handleAdminPasswordReset(userId, userEmail)` | string, string | Send password reset email (admin) using Client SDK to bypass CORS |
| `openDeleteUserDialog(userId, email)` | string, string | Open delete user confirmation dialog |
| `handleDeleteUser(userId)` | string | Delete user account (admin) |

**Application State:**
```javascript
App.userProfile = {
  email: string,
  studentId: string,
  department: string,
  semester: string,
  section: string
}
App.userCompletions = {}      // Task completion states
App.currentTasks = []         // Loaded tasks
App.currentEvents = []        // Loaded events
App.isAdmin = false           // Admin privileges
App.isCR = false              // CR (Class Representative) privileges
App.isFaculty = false         // Faculty privileges
App.isBlocked = false         // Blocked/restricted user status
App.allUsers = []             // All users (admin panel)
App.isSigningUp = false       // Flag to prevent auth state handling during signup
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

| Method | Description |
|--------|-------------|
| `init()` | Initialize the calendar module (attach global listeners). |
| `open()` | Open the calendar modal and render the current view. |
| `close()` | Close the calendar modal. |
| `renderCalendar()` | Main render function; delegates to `generateCalendarGrid` (desktop), `renderMonthlyViewMobile` or `renderWeeklyView` (mobile, based on `currentMobileView`). |
| `renderMonthlyViewMobile()` | Renders the compact monthly grid for mobile with toggle, day headers, date cells, dot indicators, and task list panel. |
| `renderWeeklyView()` | Renders the weekly scrolling view for mobile with toggle buttons. |
| `updateHeader()` | Updates the Month/Year dropdowns and navigation state. |
| `previousMonth()` | Navigate to the previous month. |
| `nextMonth()` | Navigate to the next month. |
| `populateTasksInGrid()` | Places task elements into the correct day cells. |
| `isTaskOverdue(task)` | Checks if a task is overdue. |

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
- Automatically hides when connection restored

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
Classroom.CLIENT_ID = '142195418679-0ripc2dn76otvkvfnk6kdk2aitdd29rm.apps.googleusercontent.com'
Classroom.SCOPES = 'https://www.googleapis.com/auth/classroom.courses.readonly ...'
Classroom.DATE_FILTER_MONTHS = 6  // Only show items from last 6 months
```

#### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `init()` | - | Initialize Google Classroom module with retry logic for Google Identity Services |
| `setupEventListeners()` | - | Attach click listeners to toggle buttons and close buttons with null checks |
| `openClassroomParams()` | - | Open classroom interface (sidebar on mobile, modal on desktop) |
| `toggleSidebar(open)` | boolean | Open/close mobile classroom sidebar |
| `toggleModal(open)` | boolean | Open/close desktop classroom modal |
| `login()` | - | Request Google OAuth access token |
| `logout()` | - | Revoke Google OAuth access token |
| `handleAuthSuccess()` | - | Handle successful authentication |
| `fetchCoursesAndLoadAll()` | - | Fetch all active courses and load unified assignments view |
| `loadAllAssignments()` | - | Load all assignments from all active courses (unified view) |
| `loadAllAnnouncements()` | - | Load all announcements from all active courses (unified view) |
| `switchView(view)` | string | Toggle between 'todo' and 'notifications' views |
| `renderAllItems(items, viewType)` | array, string | Render unified list of assignments or announcements |
| `renderUnifiedListItem(item, type)` | object, string | Render individual item with course badge |
| `renderInitialState()` | - | Render login prompt |
| `renderLoading(message)` | string | Show loading indicator |
| `renderError(message)` | string | Show error message |

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

**Date Filter Configuration:**

To adjust the time range for fetching assignments/announcements, modify the `DATE_FILTER_MONTHS` constant at the top of `classroom.js`:

```javascript
DATE_FILTER_MONTHS: 6,  // Change to 3, 12, etc.
```

**Desktop Flow:** Navbar "Classroom" button → Modal opens → Sign in with Google → View all assignments (default) → Toggle to Notices → Click item to open in Google Classroom

**Mobile Flow:** Green "Classroom" toggle on right edge → Sidebar slides in → Sign in with Google → View all assignments (default) → Toggle to Notices → Click item to open in Google Classroom

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
--accent-maroon: #A00000;
--light-maroon: #B30000;
--maroon-hover: #990000;

/* Background Colors */
--bg-light: #F5F3F0;
--bg-lighter: #F9F7F4;
--bg-white: #FFFFFF;
--bg-dark: #E8E6E3;

/* Text Colors */
--text-dark: #333333;
--text-medium: #666666;
--text-light: #999999;
--text-white: #FFFFFF;

/* Status Colors */
--success: #28a745;
--warning: #ffc107;
--danger: #dc3545;
--info: #17a2b8;
```

### Spacing Scale

| Variable | Value |
|----------|-------|
| `--spacing-xs` | 4px |
| `--spacing-sm` | 8px |
| `--spacing-md` | 16px |
| `--spacing-lg` | 24px |
| `--spacing-xl` | 32px |
| `--spacing-xxl` | 48px |

### Typography Scale

| Variable | Value |
|----------|-------|
| `--font-xs` | 12px |
| `--font-sm` | 14px |
| `--font-md` | 16px |
| `--font-lg` | 18px |
| `--font-xl` | 24px |
| `--font-xxl` | 32px |

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
|---|---|
| ≤ 360px | 85% |
| 361–480px | 90% |
| 481–768px | 95% |
| 769–1920px | 100% |
| 1921px+ | 110% |

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

| Action | Blocked | Student | CR | Faculty | Admin |
|--------|---------|---------|-----|---------|-------|
| Read tasks | ✓ (read-only) | ✓ | ✓ | ✓ (dept-wide) | ✓ |
| Create tasks | ✗ | ✓ | ✓ | ✓ | ✓ |
| Edit own tasks | ✗ | ✓ | ✓ | ✓ | ✓ |
| Edit any task | ✗ | ✗ | ✗ | ✗ | ✓ |
| Delete own tasks | ✗ | ✓ | ✓ | ✓ | ✓ |
| Delete any task | ✗ | ✗ | ✓ | ✗ | ✓ |
| Reset tasks | ✗ | ✗ | ✓ | ✗ | ✓ |
| Mark tasks complete | ✗ | ✓ | ✓ | ✓ | ✓ |
| Read events | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create events (own dept/sem) | ✗ | ✗ | ✓ (semester) | ✓ (department) | ✓ |
| Edit/Delete own events | ✗ | ✗ | ✓ | ✓ | ✓ |
| Edit/Delete any event | ✗ | ✗ | ✗ | ✗ | ✓ |
| Read CR notices (section group) | ✓ (read-only) | ✓ | ✓ | ✓ | ✓ |
| Create CR notices (section group) | ✗ | ✗ | ✓ (auto-filled) | ✗ | ✓ (any section) |
| Edit CR notices | ✗ | ✗ | ✓ (own only) | ✗ | ✓ (any) |
| Delete CR notices | ✗ | ✗ | ✓ (own) | ✗ | ✓ |
| Change own profile | ✗ | ✓ (30-day cooldown) | ✓ | ✓ | ✓ |
| Manage users | ✗ | ✗ | ✗ | ✗ | ✓ |
| Assign/remove roles | ✗ | ✗ | ✗ | ✗ | ✓ |
| Send password reset | ✗ | ✗ | ✗ | ✗ | ✓ |
| Delete users | ✗ | ✗ | ✗ | ✗ | ✓ |

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

| View ID | Route | Description |
|---------|-------|-------------|
| `login-view` | `/` | Login/signup forms |
| `set-details-view` | `#/set-details` | First-time user setup |
| `dashboard-view` | `#/dashboard` | Main dashboard |
| `profile-settings-view` | `#/profile-settings` | Profile management |

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
- **Note Taking** - Personal note modal with markdown support, auto-save, file upload via tmpfiles.org API with direct download support, and live preview
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
auth          // Firebase Auth instance
db            // Firestore instance

// Application modules
Auth          // Authentication module
DB            // Database module
UI            // UI rendering module
Router        // Routing module
Profile       // Profile management module
Utils         // Utility functions
App           // Main application
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

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | Feb 2026 | Complete redesign as SPA with Firebase backend |
| 2.0.1 | Feb 2026 | Added Student ID field (10-16 digits), fixed profile save/logout |
| 2.1.0 | Feb 2026 | Task completion with checkboxes, user task creation, view old tasks |
| 2.2.0 | Feb 2026 | Two-column dashboard layout, mobile events sidebar |
| 2.3.0 | Feb 2026 | Admin features: reset tasks, delete tasks/events, add events, view old events |
| 2.3.1 | Feb 2026 | Mobile CSS fixes: Reset Tasks button layout, Events sidebar padding |
| 2.3.2 | Feb 2026 | Removed orderBy from getTasks query (avoid composite index requirement) |
| 2.4.0 | Feb 2026 | Section grouping: A1+A2, B1+B2, C1+C2 merged; shows task creator's section |
| 2.5.0 | Feb 2026 | CR role: Class Representatives can reset tasks for their section |
| 2.6.0 | Feb 2026 | Improved signup flow: better email verification messages; CR can delete tasks; Events sidebar slide-out (40vw when open) with clickable links in descriptions |
| 2.6.1 | Feb 2026 | Mobile UX: Resources section with header, hidden icons, external "All Resources" link |
| 2.6.2 | Feb 2026 | Security: Added `rel="noopener noreferrer"` to all external links (`target="_blank"`) |
| 2.7.0 | Feb 2026 | Password reset: "Forgot Password?" link appears after failed login, opens modal to request reset email; Clickable links in task descriptions |
| 2.8.0 | Feb 2026 | Basic markdown support in task/event descriptions: `**bold**`, `*italic*`, `` `code` ``, and line breaks |
| 2.9.0 | Feb 2026 | Edit functionality: Users can edit own tasks; admins can edit all tasks and events |
| 2.9.1 | Feb 2026 | Permissions fix: Regular users can now delete their own tasks; clarified role permissions |
| 2.10.0 | Feb 2026 | CR info message for non-CR users; Profile change 30-day cooldown; Footer with credits and dynamic year |
| 2.11.0 | Feb 2026 | Admin User Management: view all users, filter by dept/sem/section/role, toggle isCR/isBlocked roles, edit user profiles; Blocked users restricted to read-only mode |
| 2.12.0 | Feb 2026 | Task UI improvements: Course as required field (displayed first), collapsible descriptions with 2-line truncation, vertical edit/delete buttons, "View Old" shows past deadline tasks, compact spacing |
| 2.13.0 | Feb 2026 | Admin: Firebase Dashboard button in Profile Settings; Markdown link support `[text](url)` in task descriptions; 12-hour grace period for overdue tasks before moving to Old Tasks |
| 2.14.0 | Feb 2026 | Tasks now support "No official Time limit" as a deadline option. Add/Edit Task modals allow choosing between no deadline and a specific date/time. UI and schema updated. |
| 2.14.1 | Feb 2026 | Bugfix: No-deadline tasks now correctly stay in Pending Tasks instead of being moved to Old Tasks. Fixed `createTask()` and `updateTask()` to store `null` instead of epoch timestamp when no deadline is set. Fixed `resetOldTasks()` to skip no-deadline tasks. |
| 2.15.0 | Feb 2026 | Events UI: collapsible descriptions (2-line truncation with "Show more" toggle), department scope badge (ALL/CSE/etc.), "Added by Admin/CR" label. CR event privileges: CRs can create events for their own department, edit/delete their own events. FAQ section: collapsible accordion at bottom of page (how the site works, user roles, profile settings). Updated Firestore security rules for CR event access. |
| 2.16.0 | Feb 2026 | Notice Viewer: View UCAM university notices with PDF preview. Desktop: modal with split-pane layout (notice list + embedded PDF iframe with Open/Download). Mobile: slide-out sidebar with notice list (tap to open PDF in new tab). On-demand loading via Vercel serverless backend (`b1t-acad-backend.vercel.app`). 7-day localStorage cache for notice data. New files: `js/notice.js`, `css/notice.css`. |
| 2.17.0 | Feb 2026 | Quick Links PDF Viewer: Resource links pointing to `.pdf` files now open in an in-page viewer modal (Google Docs Viewer in iframe) with Open-in-Tab and Download buttons. Mobile: PDF links open directly in a new tab. New HTML modal (`#pdf-viewer-modal`) in `index.html`, new methods (`initPdfViewer`, `openPdfViewer`, `closePdfViewer`) in `ui.js`, PDF viewer styles in `notice.css`, init wired in `app.js`. |
| 2.18.0 | Feb 2026 | New Features: Task Filtering (by type), Global Contribution List (with toggle for all-department view), Total User Counter (live badge), and Mobile UI fixes (login scroll, zoom). |
| 2.18.0.1 | Feb 2026 | Reverted back to "open links in new tab" for Pending Tasks and Events descriptions. |
| 2.19.0 | Feb 2026 | Google Classroom Integration: View all assignments and announcements from enrolled Google Classroom courses in a unified interface. Features: OAuth authentication with Google Identity Services, unified To-Do/Notices view with toggle, course badges for each item, filters only ACTIVE courses (excludes archived), configurable date filter (default: last 6 months), responsive design (mobile sidebar with green toggle, desktop modal). New files: `js/classroom.js`, `css/classroom.css`. Google Identity Services SDK loaded via CDN. |
| 2.20.0 | Feb 2026 | Progressive Web App (PWA) Setup: Installable app with offline support, service worker caching (cache-first for static assets, network-first for API calls), automatic cache cleanup, install prompt management, offline operation queue, offline indicator, service worker update notifications. New files: `manifest.json`, `sw.js`, `js/pwa-detector.js`, `js/manifest-generator.js`, `js/cache-manager.js`, `js/install-prompt.js`, `js/offline-manager.js`, `js/offline-indicator.js`, `js/sw-update-manager.js`, `js/pwa-init.js`. Auth and Classroom modules updated with caching support. |
| 2.21.0 | Feb 2026 | Push Notifications System: Real-time browser notifications for new tasks and events using Web Notifications API and Firestore real-time listeners. Features: permission management with browser-specific instructions, content formatting with truncation, click-to-navigate, initial load detection, automatic cleanup on logout. New files: `js/notifications-types.js`, `js/permission-manager.js`, `js/notification-content-formatter.js`, `js/notification-manager.js`, `js/firestore-listener-manager.js`. Notification prompt UI added to dashboard. |
| 2.22.0 | Feb 2026 | Firebase CR Permissions Fix: Updated Firestore security rules for CR event creation/editing. Changed from department-based to semester-based validation. CRs can now create events for their semester, edit/delete only their own events. Added field immutability checks (createdBy, semester). New helper functions: `getUserSemester()`, `hasRequiredEventFields()`. |
| 2.23.0 | Feb 2026 | User Management UI Updates: Admin features for password reset and user deletion via Firebase Cloud Functions. Features: filter popup with badge showing active filter count, action button optimizations, delete confirmation dialog, admin logs collection. New files: `functions/index.js`, `functions/admin/sendPasswordReset.js`, `functions/admin/deleteUser.js`, `functions/DEPLOYMENT_GUIDE.md`, `js/admin-api.js`. Updated `index.html`, `css/components.css`, `css/dashboard.css`, `js/app.js`, `firestore.rules`. |
| 2.24.0 | Feb 2026 | Faculty Role Implementation: Faculty users can view department-wide tasks (no semester/section filtering), create events for their department, edit/delete their own events. Faculty toggle available in user management. Updated Firestore security rules with `isFaculty()` helper. New method: `DB.getFacultyTasks()`. Updated `js/db.js`, `js/app.js`, `js/ui.js`, `firestore.rules`. |
| 2.25.0 | Feb 2026 | Note Taking Feature: Personal note-taking with markdown support, auto-save (500ms debounce), automatic file upload via file.io API (max 100MB, 14-day retention), live preview pane. Files uploaded automatically insert markdown links at cursor position. Notes stored in Firestore (max 1MB). New files: `js/notes.js`, `css/note.css`. Updated `index.html` with note modal and hidden file input. |
| 2.25.1 | Feb 2026 | Bug Fixes: Added Faculty toggle button active state CSS (blue background). Improved notice API error handling with cache fallback - when server returns 503, app loads cached notices with warning banner. Fixed notification prompt inline color styles. Updated `css/dashboard.css`, `js/notice.js`. |
| 2.26.0 | Feb 2026 | UX & Security Improvements: (1) Deadline options reordered - "Set Deadline" now appears first and is default in Add/Edit Task modals. (2) File downloads in notes now work directly without opening new tab (added `download` attribute to file.io links). (3) Automatic session timeout - users are logged out after 1 hour of inactivity for security, with activity-based timer reset. (4) Role badges - CR and Faculty contributors now have colored badges in task cards and contribution list. (5) Mobile notifications fixed - now use Service Worker API for iOS Safari and Chrome on Android compatibility, with vibration and badge support. Updated `index.html`, `js/utils.js`, `js/auth.js`, `js/app.js`, `js/ui.js`, `js/notification-manager.js`, `sw.js`, `css/components.css`. |
| 2.27.0 | Feb 2026 | File Upload Service Migration: Migrated from tmpfiles.org to file.io API for note file uploads. Benefits: 14-day file retention (vs 1 hour), direct download links, more reliable service. Updated `js/notes.js` (renamed `uploadToTmpFiles` to `uploadToFileIO`), `js/utils.js` (updated download link detection), `index.html` (updated upload instructions), `doc/DOCUMENTATION.md`. |
| 2.28.0 | Feb 2026 | Activity Timeline & User Counter: Added interactive activity heatmap and bar chart to visualize user productivity (logins, tasks, events). Added live user counter to dashboard and footer. Mobile UI fixes: resolved clickability issues by removing overlay conflicts, improved Note button visibility logic. |
| 2.29.0 | Feb 2026 | Session Management & UI Improvements: Added "Stay logged in" checkbox to persist session on trusted devices. Implemented Google Classroom session persistence with auto-refresh tokens. UI refinement: "Refresh Tasks" button moved to header group on mobile for better accessibility. |
| 2.30.0 | Feb 2026 | Password Reset System Overhaul: (1) **Admin Fix**: Refactored Admin Password Reset to use Client SDK (`Auth.sendPasswordResetEmail`) instead of backend Cloud Function, effectively bootstrapping a workaround for CORS issues on the `sendPasswordReset` endpoint. (2) **Conflict Resolution**: Renamed `handlePasswordReset` to `handleAdminPasswordReset` in `app.js` to fix naming collision that broke the "Forgot Password" modal. (3) **UI Enhancements**: Added "Forgot Password" link on login failure and a new "Reset Password" button in Profile Settings. (4) **UX**: Improved visual prominence of reset links. |
| 2.31.0 | Feb 2026 | CR Notice Creation Fix: Fixed CRs and Admins being unable to post class notices. **(Bug)** `cr-notice.js` read user profile from non-existent `localStorage` keys (`userDepartment`, `userSemester`, `userSection`) instead of `Utils.storage.get('userProfile')`. **(Fix)** `subscribeToNotices()` and `submitNotice()` now read profile via `Utils.storage.get('userProfile')`. Removed Department/Semester/Section dropdowns from Add Notice form (auto-filled from profile). Updated Firestore rules to allow Admins to create notices. Files: `js/cr-notice.js`, `index.html`, `firestore.rules`. |
| 2.33.0 | Feb 2026 | UI and Responsive Fixes: Fixed Activity Timeline bar chart clickability issue on zoomed displays (switched from Chart.js built-in onClick to robust index-based interaction mode). Added comprehensive dark mode overrides for Timeline modal, FAQ button, and Profile Settings Logout button. Fixed "All Resources" mobile center alignment. |
| 2.34.0 | Feb 2026 | Classroom Sync to Tasks Feature: Added "Sync to Tasks" button functionality for Admins and CRs in the Google Classroom To-Do interface. Features: one-click sync of active assignments into b1t-Sched tasks, duplicate prevention via `classroomWorkId` DB queries, automatic conversion of due dates, appended markdown links redirecting to the Google Classroom assignment, and a custom "Added from Classroom" green badge in the Tasks UI. |
| 2.35.0 | Feb 2026 | Dark Theme Overhaul: Implemented a new dark theme based on the Realtime Colors palette (--text: #e7f0dc; --background: #000000; --primary: #badd93; --secondary: #578323; --accent: #89d134;). Updated `css/colors.css` with new primary, secondary, accent, and text colors. Updated `css/styles.css`, `css/main.css`, `css/responsive.css`, and `css/calendar.css` to integrate the new color scheme across the entire application. Updated `package.json` with new color palette metadata. |

---

## Related Documentation

- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Firebase project setup guide
- [QUICKSTART.md](QUICKSTART.md) - Quick start for developers
- [REDESIGN_PLAN.md](REDESIGN_PLAN.md) - Original redesign planning document
- [ADMIN_FEATURES.md](ADMIN_FEATURES.md) - Admin functionality documentation
- [FIRESTORE_TASK_CHANGES.md](FIRESTORE_TASK_CHANGES.md) - Task completion schema changes
- [doc/plan/g-class-api/](doc/plan/g-class-api/) - Google Classroom API setup and implementation plans

---

*Documentation last updated: February 20, 2026*
*Version: 2.33.0*


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

| Package | Version | Purpose | Delivery |
|---------|---------|---------|----------|
| **firebase-app-compat** | 10.7.1 | Firebase core initialization | CDN (`gstatic.com`) |
| **firebase-auth-compat** | 10.7.1 | Email/password authentication | CDN (`gstatic.com`) |
| **firebase-firestore-compat** | 10.7.1 | NoSQL cloud database | CDN (`gstatic.com`) |
| **firebase-storage-compat** | 10.7.1 | Cloud file storage | CDN (`gstatic.com`) |

### File Upload Services

| Service | Storage Type | Max Size | Free Tier | CORS | Auth Required |
|---------|-------------|----------|-----------|------|---------------|
| **Firebase Storage** | Permanent | 10 MB | 5 GB total | ✅ | Yes |
| **Catbox.moe** | Permanent | 200 MB | Unlimited | ✅ | No |
| **Tmpfiles.org** | Temporary (1 year) | 100 MB | Unlimited | ✅ | No |

---

## Module Updates

### 8. NoteManager (notes.js) - Updated

**Purpose:** Personal note-taking with markdown support and multi-provider file upload

#### Configuration

```javascript
NoteManager.autoSaveTimer = null           // Auto-save debounce timer
NoteManager.currentUserId = null           // Current authenticated user
```

#### Methods (Updated)

| Method | Parameters | Description |
|--------|------------|-------------|
| `init()` | - | Initialize note module with auth listener |
| `setupEventListeners()` | - | Attach event listeners for modal, buttons, file input |
| `enableNoteFeature()` | - | Show note toggle buttons for authenticated users |
| `disableNoteFeature()` | - | Hide note toggle buttons for unauthenticated users |
| `openModal()` | - | Open note modal and load user's note |
| `closeModal()` | - | Close note modal |
| `triggerFileUpload()` | - | Trigger hidden file input click |
| `handleFileSelect(event)` | Event | Handle file selection and upload with multi-provider fallback |
| `uploadWithFallback(file)` | File | Try multiple upload providers in order until one succeeds |
| `uploadToFirebaseStorage(file)` | File | Upload file to Firebase Storage (10MB limit) |
| `uploadToCatbox(file)` | File | Upload file to Catbox.moe (200MB limit, permanent) |
| `uploadToTmpfiles(file)` | File | Upload file to Tmpfiles.org (100MB limit, 1 year expiration) |
| `insertLinkIntoNote(filename, url)` | string, string | Insert markdown link at cursor position in textarea |
| `updatePreview(content)` | string | Update preview pane with formatted markdown |
| `setupAutoSave(content)` | string | Setup auto-save with 500ms debounce |
| `loadNote(userId)` | string | Load note from Firestore |
| `saveNote(userId, content)` | string, string | Save note to Firestore (max 1MB) |
| `handleSave()` | - | Handle manual save button click |
| `handleClear()` | - | Handle clear button click with confirmation |
| `clearNote(userId)` | string | Clear note from Firestore |
| `validateNoteContent(content)` | string | Validate note size (max 1MB) |
| `showMessage(message, type)` | string, string | Display message to user |

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
CalendarView.currentDate = new Date()      // Current date reference
CalendarView.displayedMonth = number       // Currently displayed month (0-11)
CalendarView.displayedYear = number        // Currently displayed year
CalendarView.isOpen = boolean              // Modal open state
CalendarView.minYear = currentYear - 100   // Navigation limit (past)
CalendarView.maxYear = currentYear + 100   // Navigation limit (future)
```

#### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `init()` | - | Initialize calendar view (button, modal, event listeners) |
| `createButton()` | - | Create calendar icon button next to "Pending Tasks" header |
| `createModal()` | - | Create calendar modal structure with grid and controls |
| `open()` | - | Open calendar modal, render calendar, set focus, prevent background scroll |
| `close()` | - | Close calendar modal, restore focus, enable background scroll |
| `trapFocus(event)` | Event | Trap focus within modal for accessibility |
| `generateCalendarGrid()` | - | Generate calendar grid data structure with dates |
| `getTasksForMonth()` | - | Filter tasks with deadlines in displayed month |
| `isTaskOverdue(task)` | Object | Check if task is overdue (past deadline and not completed) |
| `populateTasksInGrid()` | - | Render tasks in calendar cells with overflow handling |
| `renderCalendar()` | - | Render complete calendar grid with tasks |
| `previousMonth()` | - | Navigate to previous month |
| `nextMonth()` | - | Navigate to next month |
| `updateHeader()` | - | Update month/year header text |
| `showTaskDetails(taskId)` | string | Display task details modal |
| `showSimpleTaskDetails(task)` | Object | Fallback task details view |
| `showLoading()` | - | Show loading indicator |
| `hideLoading()` | - | Hide loading indicator |
| `showError()` | - | Show error state |
| `attachEventListeners()` | - | Attach all event listeners |

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
- Screen reader friendly date announcements

---

## Version History (Updated)

| Version | Date | Changes |
|---------|------|---------|
| 2.20.0 | Feb 2026 | Calendar View: Monthly calendar visualization of task deadlines with navigation, task details, and accessibility features |
| 2.20.1 | Feb 2026 | Calendar View Bug Fix: Removed ES6 export statement causing browser syntax error; fixed initialization order |
| 2.21.0 | Feb 2026 | File Upload System Upgrade: Multi-provider upload with Firebase Storage (primary), Catbox.moe (fallback 1), and Tmpfiles.org (fallback 2); automatic fallback on failure; supports up to 200MB files; permanent and temporary storage options |

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
- `*italic text*` → *italic text*
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

*Last Updated: February 20, 2026 (v2.33.0)*

## Version History

### v2.34.0 (Current)
- **New Feature**: Push notifications for CR Notices — users now receive mobile/desktop push notifications when a new CR notice is posted in their section, with priority indicators (🔴 urgent, ⚠️ important) and deadline info.
- **Enhancement**: Urgent CR notices use `requireInteraction: true` to persist until dismissed.
- **Enhancement**: Zoom normalization in `responsive.css` — CSS `zoom` rules per screen width breakpoint (85%–110%) to prevent UI overflow on devices rendering at non-standard zoom levels.
- **Enhancement**: Manifest `theme_color` updated to `#660000` (maroon) for PWA theming.
- **Refactor**: `handleNotificationClick` simplified — all notification types navigate to dashboard (removed redundant per-type if/else blocks).

### v2.33.0
- **New Feature**: CR Notice deadline support — optional deadline field ("No official Time limit" or specific datetime) for notices, displayed with clock icon (green for active, red for past).
- **New Feature**: Mobile Calendar Monthly View — compact date grid with week numbers, maroon dot indicators for dates with tasks, today highlight, and tappable task list panel showing course + title + deadline time.
- **New Feature**: Monthly/Weekly toggle on both mobile calendar views — users can switch between monthly and weekly views.
- **Enhancement**: Mobile monthly calendar uses light maroon+white theme matching the website (previously dark theme).
- **Enhancement**: Task list panel in monthly view shows course name alongside task title.
- **Enhancement**: Firestore rules updated with `hasValidDeadline()` helper for CR Notice deadline validation.
- **Enhancement**: Deadline form labels styled with bottom border for visual separation.
- **Enhancement**: Deadline radio button labels updated to "No official Time limit" (from "No Deadline") for consistency.

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
