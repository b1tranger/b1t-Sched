# b1t-Sched - Academic Task Scheduler

> **Academic Task Scheduler** - A modern Single Page Application (SPA) designed for university students, class representatives (CRs), and faculty members to organize and track academic tasks, routines, assignments, exams, and notices with department-specific personalization.

<div align="center">
  <img src="Social-Preview.webp" width="220px" alt="b1t-Sched Logo" style="border-radius: 16px; margin-bottom: 12px;">
  <h1>👉 <a href="https://github.com/b1tranger/b1t-Sched/blob/main/doc/DOCUMENTATION.md">Complete Documentation</a> 👈</h1>
  <p>
    <strong>Current Version:</strong> <code>v2.53.0 to v2.53.10</code> • 
    <strong>Architecture:</strong> Vanilla JS SPA + Firebase Firestore & Auth + PWA
  </p>
</div>

---

## ✨ Features Overview

### 🔐 Authentication & Role Management
- **Flexible Credential Login**: Students can log in with their Student ID (normalized across string, numeric, and formatted inputs with dashes/spaces) or Email. Faculty can log in with their Faculty ID, initials (case-insensitive), or Email.
- **Segmented Role Toggles**: Dedicated Student and Faculty login tabs with strict cross-role enforcement (prevents student accounts from authenticating via the faculty tab and vice versa).
- **Onboarding Role Lockdown**: After initial signup, role identity is locked on the details setup screen, ensuring students cannot bypass section assignments or switch to faculty post-registration.
- **6-Tier Role System**:
  1. `Student` - View personalized section tasks, export tasks, take markdown notes, and sync personal Google Classroom assignments.
  2. `CR` (Class Representative) - Create, edit, and manage section tasks, deadlines, and group notices.
  3. `Faculty` - Create and manage departmental tasks, access Faculty Classroom, and post department-wide notices.
  4. `DptCoor` (Department Coordinator) - Faculty privileges plus account review, approvals, and role elevation within their department.
  5. `DptHead` (Department Head) - Comprehensive departmental oversight and coordinator capabilities.
  6. `Admin` - Complete platform administration, user management, account approvals, role assignments, UID lookups, and the **Admin Role Preview Mode** (simulate any role with a real-time floating indicator).
- **Faculty Self-Registration & Approvals**: Faculty self-register with pending status until approved by an Admin or Department Coordinator via the interactive Approvals modal.

### 📋 Task Management & Productivity
- **Personalized Task Feed**: Automatic task filtering based on Department, Semester, and Section Group (`A1+A2`, `B1+B2`, etc.).
- **Overdue Grace Period**: Retains tasks in the active feed for a 12-hour grace period after the deadline passes before archiving.
- **Desktop Single-Row Layout**: Coordinated action row for `Add Tasks`, `View Old`, and `Reset Tasks` on desktop screens.
- **Mobile-Responsive Task Actions & Filters**:
  - Compact button labels on mobile (`Add`, `Old`, `Reset`).
  - Mobile compact dropdown filter (`Filters: [Set Filter] [Clear]`) synchronized bi-directionally with desktop radio pill buttons.
- **Task Identification**: Copyable Firebase Task UIDs and timestamps for reliable reference and verification.

### 🛡️ Live Feeds & External Integrations
- **UITS Event Raiders Syndication**: Live syndication of hackathons, contests, symposiums, and tech events from `ou1ts/events` RSS/JSON feeds with desktop sticky sidebar integration and mobile toggle view switchers.
- **Google Classroom Integration**:
  - Unified course stream showing assignments, materials, and announcements with OAuth session persistence.
  - 3-group status layout (**Assigned**, **Missing**, **Turned In / Graded**) with chronological upcoming deadline priority and "Past deadline" visual divider banners.
  - Strict turn-in verification for automatic task completion.
  - Decoupled Classroom sync briefing summaries and quick announcement/assignment posting for Faculty and CRs.
- **University & CR Notices**: Real-time section notices posted by CRs and department notices posted by Faculty, alongside a UCAM university notice viewer with inline PDF preview via a Vercel serverless backend.

### 📝 Notes & Productivity Tools
- **Rich Markdown Notes**: Personal note-taking module with auto-save, search, formatting tools, and temporary file hosting (Catbox.moe / Tmpfiles.org).
- **LocalSend Web Integration**: Direct peer-to-peer note and file sharing over local Wi-Fi networks without internet bandwidth overhead.
- **Task Export**: Export tasks to clean Vector PDF, Markdown (.md), or Plain Text (.txt) with selectable fonts, active type filter support, and dedicated Old Tasks pagination.
- **Activity Timeline**: Interactive contribution heatmap and activity breakdown charts tracking tasks, events, and login frequency.

### 🎨 Design & Accessibility
- **Curated Multi-Theme System**:
  - **Light Mode**: Clean, high-contrast default theme for unauthenticated visitors and public views.
  - **Dark Mode**: Charcoal base (`#1a1a1a`) with vibrant blue accents (`#3b82f6`) and elevated cards.
  - **High Contrast**: Pitch black base (`#000000`) with vibrant neon green accents (`#89d134`).
  - **System Default**: Automatically synchronizes with OS color preferences.
  - Live theme preview selector in Profile Settings.
- **Changelog Modal ("What's New in b1t-Sched")**: Responsive modal with a desktop min-width (`600px`) and version badge hierarchy.
- **Viewport Scroll Stability**: Enforced manual browser scroll restoration and instant scroll-to-top resets on SPA route navigation, user sign-out, and unauthenticated redirects.

### 📱 Progressive Web App (PWA) & Offline
- **Offline Resilient**: Service worker (`v2.53.7`) caches static assets, dynamic layouts, and recent task data for seamless offline usage.
- **Adaptive Offline Banner**: Dynamic top banner that pushes navigation and views downward without overlaying or obscuring interactive elements.
- **PWA Installation**: Installable desktop and mobile app with a customized 3-row install prompt (Icon + Title, Description, Action Buttons) featuring solid backgrounds across all themes.

---

## 📁 Modular Project Structure

All JavaScript modules are categorized into distinct architectural directories:

```
b1t-Sched/
├── index.html                    # Single Page Application entry point
├── manifest.json                 # PWA Web App Manifest
├── sw.js                         # Service Worker (v2.53.7 caching & background sync)
├── changes.json                  # Machine-readable release changelog history
├── firestore.rules               # Firestore Cloud Security Rules & role helpers
├── README.md                     # Project overview & documentation
│
├── css/                          # Modular Stylesheets
│   ├── colors.css               # Color tokens & theme palettes (Light, Dark, High Contrast)
│   ├── main.css                 # Base resets, typography, and auth hero layouts
│   ├── components.css           # Reusable UI elements, modals, and PWA install prompt
│   ├── dashboard.css            # Task cards, Event Raiders feed, action button rows
│   ├── navbar.css               # Navigation bar & brand logo styling
│   ├── classroom.css            # Google Classroom assignment lists & status badges
│   ├── calendar.css             # Interactive monthly & weekly calendar views
│   ├── timeline.css             # Activity timeline heatmaps & charts
│   ├── note.css                 # Markdown note-taking & LocalSend sharing interface
│   ├── notice.css               # University & CR notice viewers
│   ├── changelog.css            # "What's New" modal styling & desktop min-width
│   └── responsive.css           # Mobile breakpoints, compact dropdowns, sidebar drawers
│
├── js/                           # Organized Categorical JavaScript Architecture
│   ├── admin/                   # Administrative Operations & Data Migration
│   │   ├── activity-logger.js   # Admin-level activity logging
│   │   ├── admin-api.js         # Administrative utility APIs
│   │   ├── migrate-activity-logs.js # Historical activity log migration
│   │   └── update-user-semesters.js # Semester auto-promotion batch tooling
│   │
│   ├── core/                    # Core Infrastructure & Foundations
│   │   ├── app.js               # Application orchestrator, event listeners, auth routing
│   │   ├── auth.js              # Firebase Authentication wrapper & session timer
│   │   ├── db.js                # Firestore CRUD, normalized ID lookups & local fallbacks
│   │   ├── firebase-config.js   # Firebase SDK credentials & service initialization
│   │   ├── firestore-listener-manager.js # Real-time snapshot listeners for tasks/notices
│   │   ├── permission-manager.js# Role capability matrix & permission enforcement
│   │   ├── routing.js           # Hash-based SPA routing with scroll position resets
│   │   ├── ui.js                # Common UI notifications, loading screen, modal handling
│   │   └── utils.js             # Formatting, section grouping, and storage helpers
│   │
│   ├── features/                # Application Domain Features
│   │   ├── approvals.js         # Faculty self-registration review & approval modal
│   │   ├── calendar-view.js     # Monthly/weekly calendar renderer with task badges
│   │   ├── changelog-modal.js   # "What's New" release notes modal
│   │   ├── classroom.js         # Google Classroom integration & task sync
│   │   ├── cr-notice.js         # Section notice creation & deadline management
│   │   ├── facultyClassroom.js  # Faculty classroom stream & announcement manager
│   │   ├── notes.js             # Personal notes module, Catbox uploads, LocalSend
│   │   ├── notice.js            # UCAM university notice reader & PDF viewer
│   │   ├── profile.js           # Profile settings, cooldown timers, theme selection
│   │   ├── raids-feed.js        # UITS Event Raiders live RSS/JSON syndication
│   │   ├── task-export.js       # Vector PDF, Markdown, and TXT task exporter
│   │   ├── timeline-data.js     # Activity timeline aggregation
│   │   └── timeline-ui.js       # Heatmap visualization & bar charts
│   │
│   ├── notifications/           # Notification Systems
│   │   ├── notification-manager.js # Browser Push notification orchestrator
│   │   ├── notification-content-formatter.js # Payload and badge formatting
│   │   └── notifications-types.js  # Notification category constants
│   │
│   └── pwa/                     # Progressive Web App & Offline Experience
│       ├── cache-manager.js     # Local cache management & user storage cleanup
│       ├── install-prompt.js    # Custom 3-row PWA installation banner
│       ├── manifest-generator.js# Dynamic manifest generator
│       ├── offline-indicator.js # Top-level push-down offline banner
│       ├── offline-manager.js   # Connectivity detection & event listeners
│       ├── pwa-detector.js      # Standalone / browser environment detection
│       ├── pwa-init.js          # Service worker registration & lifecycle
│       └── sw-update-manager.js # Service worker update notifications
│
└── doc/                         # Comprehensive Project Documentation
    ├── DOCUMENTATION.md         # Full chronological project documentation
    ├── FIREBASE_SETUP.md        # Step-by-step Firebase configuration guide
    └── prompts/                 # Complete archive of implementation plans & walkthroughs
```

---

## 🚀 Quick Setup Guide

### Prerequisites
- Modern Web Browser (Chrome, Edge, Firefox, Safari, Brave)
- Code Editor (VS Code recommended)
- Firebase Account (Free Spark Plan is sufficient)

### Step 1: Firebase Project Setup
1. Follow the step-by-step setup guide in [`doc/FIREBASE_SETUP.md`](doc/FIREBASE_SETUP.md).
2. Create Firestore collections (`users`, `tasks`, `events`, `cr_notices`, `resourceLinks`, `metadata`).
3. Deploy the security rules from [`firestore.rules`](firestore.rules) in the Firebase Console under **Firestore Database** → **Rules**.

### Step 2: Configure Firebase in Project
Open [`js/core/firebase-config.js`](js/core/firebase-config.js) and add your project configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 3: Run Locally
You can run the application with any local HTTP server:
- **VS Code Live Server**: Right-click `index.html` → *Open with Live Server*
- **Python**: `python -m http.server 8000`
- **Node.js**: `npx.cmd serve .`

---

## 🔒 Security & Access Control

Firestore security rules enforce strict privilege separation:
- **Public / Unauthenticated**: Can read active user IDs/emails for credential resolution (if `firestore.rules` is published) and general app metadata.
- **Students**: Can create personal tasks, update/delete tasks they created, view section group tasks, and manage their own notes.
- **CRs**: Can create and edit section-level tasks, post and manage section notices, and delete group tasks.
- **Faculty**: Can post department-wide notices, manage departmental tasks, and access Faculty Classroom tools.
- **Department Coordinators (DptCoor)**: Full faculty permissions plus account approval rights and role modifications for faculty/students within their department.
- **Admins**: Unrestricted platform management, user role assignments, UID lookups, system-wide task/event management, and the **Admin Role Preview Mode**.

---

## 🛠️ Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy --only hosting
```

---

## 🤝 Feature Requests & Progress Tracking

- [x] **Quick Navbar Navigation**: Clickable brand logo and title to return to Dashboard with smooth scroll-to-top.
- [x] **FAQ Section**: Expandable accordion explaining sections, permissions, roles, and profile settings.
- [x] **Theme System**: Light Mode, Dark Mode (blue accent `#3b82f6`), and High Contrast (neon green `#89d134`).
- [x] **Monthly & Weekly Calendar**: Responsive calendar views with task deadline badges and modal details.
- [x] **Google Classroom Synchronization**: Automated assignment discovery, status tracking, turned-in verification, and task sync.
- [x] **Activity Timeline**: Heatmap and frequency bar charts for tracking daily productivity and academic engagement.
- [x] **Integrated PDF Viewing**: Native in-app viewer for routines, academic calendars, and university notices.
- [x] **Faculty Roles & Dedicated Workspaces**: Role segregation, faculty-specific set-details, and department notice broadcasting.
- [x] **Semester Auto-Promotion**: Automatic semester advancement every July and January on user login with 30-day manual profile protection and an Admin fail-safe bulk update tool.
- [x] **Mobile Pending Tasks Optimization**: Compact dropdown filter (`Filters: [Set Filter] [Clear]`) and shortened button labels (`Add`, `Old`, `Reset`).
- [x] **PWA Install Experience**: Solid themed backgrounds and 3-row architecture for the install banner.

---

## 🙏 Appreciation

Thanks to these individuals who helped with testing, suggestions and support.

Faculties
- [S. M. Zafrul Islam (zafrul.islam@uits.edu.bd)](https://github.com/zafrul097)

Seniors
- [Md Kamruzzaman Shishir (1814355002)](https://github.com/MuhammadShishir)
- [Md. Sakibul Hakim (Sadab) (2114951038)](https://github.com/foxxie911)
- [Zobayer Hasan (2215151106)](https://github.com/zobayersq)
- [Mohammad Masud Chowdhury Mahir (2215151105)](https://github.com/mahirmasud)
- [Md Sakib Hosen (0432220005101058)](https://github.com/chatok-jnr)
- [Akib Reza (0432220005101061)](https://github.com/AkibReza)
- [Md. Safrid Bhueyan (0432310005101080)](https://github.com/safridbhueyan)
- [K. M. Jakaria (0432310005101037)](https://github.com/Reaper-X003)
- [Md. Robiul Hassan (Rabin) (0432310005101096)](https://github.com/Arriesgado47)
- [Md. Mahfuz (0432310005101057)](https://github.com/Mahfuz5634)
- [Md. Masud Rahman (0432320005101064)](https://github.com/shoytanbaba99)
- [Kazi Md. Azhar Uddin Abeer (0432320005101120)](https://github.com/4xrhd)
- [Md.Jihad Hossan (0432320005101017)](https://github.com/tofazmahmud)
- [Md. Muhaiminul Islam (0432320005101207)](https://github.com/Maheem0)
- [Rudro Antony Mrong (0432320005101059)](https://github.com/LackOfHP)

Classmates
- [Jannatul Ferdus (0432410005101058)](https://github.com/jannatulferdus182003)
- [Shalehin Ahmed (0432410005101083)](https://github.com/ORNOB-083)
- [Shamiur Hasan (0432410005101053)](https://github.com/shamiurhasan100)
- [Md. Jubair Ahammed (0432410005101112)](https://github.com/JubairAhammedJubu)
- [Saha Pradyumna Prasad (Ankur) (0432410005101159)](https://github.com/Saha-Pradyumna-Prasad)
- [Manik Halder (0432410005101113)](https://github.com/RayneAshe0)
- [@Helal Udding Patwary (Shakil) (0432410005101086)](https://github.com/Binary-Eclipse)

Juniors
- [Mamunur Rahman (04325205101031)](https://github.com/Zirconium001)
- [Kazi Rabit Jahir (04325205101006)](https://github.com/RabbitJahir)




