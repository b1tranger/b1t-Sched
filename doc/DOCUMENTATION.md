# b1t-Sched - Complete Project Documentation

> **Academic Task Scheduler** - A Single Page Application (SPA) for managing academic tasks, assignments, exams, and events with personalized department-specific content.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [JavaScript Modules](#javascript-modules)
5. [Styling System](#styling-system)
6. [Firebase/Firestore Data Model](#firebasefirestore-data-model)
7. [User Flows](#user-flows)
8. [Views & Components](#views--components)
9. [API Reference](#api-reference)

---

## Project Overview

### Description
b1t-Sched is a web-based academic task scheduler designed for university students. It provides a personalized dashboard with tasks, events, and resource links filtered by the student's department, semester, and section.

### Key Features
- **Single-Page Application (SPA)** - Hash-based routing for seamless navigation
- **Firebase Authentication** - Secure email/password login system
- **User Profiles** - Student ID, department, semester, and section
- **Personalized Dashboard** - Content filtered by user's academic details
- **Task Management** - View pending assignments and exams with deadlines
- **Task Completion** - Checkboxes to mark tasks complete, persistent per-user
- **Event Calendar** - Track upcoming academic events
- **Resource Links** - Quick access to department-specific resources
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Maroon Theme** - Professional dark maroon and off-white color scheme
- **Admin Features** - Task reset, task/event delete, event creation (admin-only)
- **CR Role** - Class Representatives can reset tasks for their section
- **Two-Column Layout** - Events sidebar on desktop, slide-out panel on mobile

### Technology Stack
| Category | Technology |
|----------|------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Firebase (Firestore, Authentication) |
| Icons | Font Awesome 6.5 |
| Hosting | Static hosting (Netlify compatible) |

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
```

### Module Dependencies

```
app.js (Main Application)
├── Auth (auth.js)
├── DB (db.js)
├── UI (ui.js)
├── Router (routing.js)
├── Profile (profile.js)
└── Utils (utils.js)

firebase-config.js (Loaded First)
└── Initializes: auth, db (Firestore instances)
```

---

## Project Structure

```
b1t-Sched/
│
├── index.html                    # Main SPA entry point
├── Social-Preview.webp           # Logo/favicon
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
│   ├── responsive.css           # Mobile/tablet breakpoints
│   ├── buttons.css              # Button variations
│   ├── selector.css             # Dropdown/select styles
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
│   └── app.js                   # Main application logic
│
├── doc/                          # Documentation
│   ├── FIREBASE_SETUP.md        # Firebase setup guide
│   ├── QUICKSTART.md            # Quick start guide
│   ├── REDESIGN_PLAN.md         # Design documentation
│   └── PROJECT_DOCUMENTATION.md # This file
│
├── images/                       # Image assets
│   ├── logo/                    # Logo variations
│   └── Social-logo/             # Social media assets
│
└── D1/                           # Department schedules (legacy)
    ├── CSE/                      # CSE semester files
    └── IT/                       # IT semester files
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

**Purpose:** Handle user authentication

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `signup(email, password)` | string, string | `{success, user/error}` | Create new user account |
| `login(email, password)` | string, string | `{success, user/error}` | Sign in existing user |
| `logout()` | - | `{success, error?}` | Sign out current user |
| `onAuthStateChanged(callback)` | function | unsubscribe function | Listen for auth state changes |
| `getCurrentUser()` | - | User object or null | Get current Firebase user |
| `getUserId()` | - | string or null | Get current user's UID |
| `getUserEmail()` | - | string or null | Get current user's email |
| `getErrorMessage(errorCode)` | string | string | Convert Firebase error codes to user-friendly messages |

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
  semester: string,       // e.g., "1st", "2nd"
  section: string,        // e.g., "A1", "B2"
  isAdmin: boolean,       // Optional - admin privileges (set manually)
  isCR: boolean,          // Optional - CR privileges (set manually)
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### Task Operations

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getTasks(department, semester, section)` | string, string, string | `{success, data/error}` | Get filtered tasks |
| `createTask(userId, userEmail, data)` | string, string, object | `{success, id/error}` | Create new task |
| `getUserTaskCompletions(userId)` | string | `{success, data/error}` | Get user's completed tasks |
| `toggleTaskCompletion(userId, taskId, isCompleted)` | string, string, boolean | `{success, error?}` | Toggle task completion |
| `getOldTasks(userId, department, semester, section)` | strings | `{success, data/error}` | Get completed/past tasks |
| `deleteTask(taskId)` | string | `{success, error?}` | Delete task (admin) |
| `resetOldTasks(department, semester, section)` | strings | `{success, deletedCount/error}` | Delete all past tasks (admin) |

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
  deadline: Timestamp
}
```

#### Event Operations

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getEvents(department)` | string (default: 'ALL') | `{success, data/error}` | Get upcoming events |
| `createEvent(data)` | object | `{success, id/error}` | Create event (admin) |
| `deleteEvent(eventId)` | string | `{success, error?}` | Delete event (admin) |
| `getOldEvents(department)` | string | `{success, data/error}` | Get past events |

#### Role Operations

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getUserRoles(userId)` | string | `{success, isAdmin, isCR/error}` | Check user's admin/CR status |

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
| `#/set-details` | set-details | `set-details-view` |

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
| `renderResourceLinks(links)` | array | Render resource link cards |
| `renderTasks(tasks, userCompletions, isAdmin)` | array, object, boolean | Render task cards with checkboxes |
| `renderOldTasks(tasks)` | array | Render completed tasks list |
| `renderEvents(events, isAdmin)` | array, boolean | Render event cards with delete buttons |
| `renderOldEvents(events)` | array | Render past events list |
| `populateDropdown(elementId, items, selectedValue)` | string, array, string? | Populate select dropdown |
| `showModal(modalId)` | string | Display modal dialog |
| `hideModal(modalId)` | string | Hide modal dialog |
| `toggleEventsSidebar(open)` | boolean | Open/close mobile events sidebar |
| `toggleAdminControls(isAdmin, isCR)` | boolean, boolean | Show/hide admin-only and CR elements |

---

### 6. Profile (profile.js)

**Purpose:** Profile settings management

| Method | Parameters | Description |
|--------|------------|-------------|
| `init()` | - | Initialize profile module |
| `setupEventListeners()` | - | Attach event listeners to profile UI |
| `loadProfile()` | - | Load and display user profile |
| `updateSectionDropdown(elementId, dept, sem, selectedValue)` | strings | Update section dropdown |
| `handleSaveProfile()` | - | Save profile changes to Firestore |

**Event Listeners:**
- User details card click → Navigate to profile settings
- Back button → Navigate to dashboard
- Cancel button → Navigate to dashboard
- Logout button → Sign out and reload
- Form submit → Save profile changes
- Department/Semester change → Update section dropdown

---

### 7. Utils (utils.js)

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

**Storage Helpers (`Utils.storage`):**

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `get(key)` | string | any/null | Get from localStorage |
| `set(key, value)` | string, any | boolean | Save to localStorage |
| `remove(key)` | string | boolean | Remove from localStorage |
| `clear()` | - | boolean | Clear all localStorage |

---

### 8. App (app.js)

**Purpose:** Main application controller

| Method | Parameters | Description |
|--------|------------|-------------|
| `init()` | - | Initialize application |
| `setupEventListeners()` | - | Setup form and button listeners |
| `handleLogin()` | - | Process login form submission |
| `handleSignup()` | - | Process signup form submission |
| `handleAuthenticatedUser(user)` | User object | Handle post-authentication flow |
| `handleUnauthenticatedUser()` | - | Handle logged out state |
| `loadSetDetailsForm()` | - | Load set details form dropdowns |
| `updateSetDetailsSections()` | - | Update sections on dept/sem change |
| `handleSetDetails()` | - | Process set details form (with studentId) |
| `loadDashboardData()` | - | Load tasks, events, resources |
| `setupTaskEventListeners()` | - | Setup task-related event handlers |
| `setupEventsSidebarListeners()` | - | Setup mobile sidebar handlers |
| `setupAdminEventListeners()` | - | Setup admin-related event handlers |
| `handleTaskCompletion(taskId, isCompleted)` | string, boolean | Toggle task completion |
| `openAddTaskModal()` | - | Open add task modal |
| `handleAddTask()` | - | Process add task form |
| `openOldTasksModal()` | - | Open completed tasks modal |
| `handleResetTasks()` | - | Reset all old tasks (admin) |
| `handleDeleteTask(taskId)` | string | Delete task (admin) |
| `openAddEventModal()` | - | Open add event modal (admin) |
| `handleAddEvent()` | - | Process add event form (admin) |
| `handleDeleteEvent(eventId)` | string | Delete event (admin) |
| `openOldEventsModal()` | - | Open past events modal |

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
```

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
    ↓
responsive.css      → Media Queries
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
│       └── deadline: timestamp
│
├── events/                     # Academic events
│   └── {eventId}/
│       ├── title: string
│       ├── description: string
│       ├── department: string  # or "ALL"
│       ├── date: timestamp
│       ├── createdBy: string   # userId (admin)
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
```

### Firestore Security Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check admin status
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Helper function to check CR status
    function isCR() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isCR == true;
    }
    
    // Users can read/write their own profile and completedTasks subcollection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /completedTasks/{taskId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Tasks - any authenticated user can read and create; admin or CR can delete
    match /tasks/{taskId} {
      allow read, create: if request.auth != null;
      allow delete: if isAdmin() || isCR();
    }
    
    // Events - all can read; only admin can create/delete
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow create, delete: if isAdmin();
    }
    
    // Resource links and metadata - read only for authenticated users
    match /resourceLinks/{department} {
      allow read: if request.auth != null;
    }
    
    match /metadata/{document} {
      allow read: if request.auth != null;
    }
  }
}
```

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
- **Pending Tasks Section** - Task cards with checkboxes, deadlines, delete buttons (admin)
  - Add Tasks button - Opens task creation modal
  - View Old button - Opens completed tasks modal
  - Reset Tasks button (admin-only) - Clears past tasks
- **Upcoming Events Section** - Calendar events with delete buttons (admin)
  - Add Event button (admin-only) - Opens event creation modal
  - Old Events button - Opens past events modal
- **Events Sidebar (Mobile)** - Slide-out panel with events and action buttons
- **Modals:**
  - Add Task Modal - Task creation form
  - Old Tasks Modal - List of completed/past tasks
  - Add Event Modal (admin) - Event creation form
  - Old Events Modal - List of past events

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

---

## Related Documentation

- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Firebase project setup guide
- [QUICKSTART.md](QUICKSTART.md) - Quick start for developers
- [REDESIGN_PLAN.md](REDESIGN_PLAN.md) - Original redesign planning document
- [ADMIN_FEATURES.md](ADMIN_FEATURES.md) - Admin functionality documentation
- [FIRESTORE_TASK_CHANGES.md](FIRESTORE_TASK_CHANGES.md) - Task completion schema changes

---

*Documentation last updated: February 11, 2026*
*Version: 2.5.0*
