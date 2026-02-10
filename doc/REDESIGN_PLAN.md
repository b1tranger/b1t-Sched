# b1t-Sched Website Redesign Plan

## Overview
Transform the website from a multi-page departmental structure (`D1/CSE/S01.html`) to a single-page application (SPA) with persistent user settings, streamlined login flow, and improved UX.

---

## 1. ARCHITECTURE OVERVIEW

### Current Structure
```
index.html → Semesters.html → D1/CSE/S01.html (Google Sheets links)
```

### Proposed Single-Page Structure
```
index.html (SPA with routing)
├── Login Screen
├── Set Details Screen (First login only)
├── Main Dashboard
│   ├── Pending Tasks
│   ├── Events
│   └── Profile Settings (modal/slide-out)
└── All content served dynamically via JavaScript
```

---

## 2. USER FLOW (Based on Your Reference Image)

```
1. User visits website
   ↓
2. Check localStorage for existing session
   ├─ If logged in → Go to step 4
   └─ If not → Show Login Screen
   ↓
3. Login Screen
   ├─ User enters ID/Email & Password
   ├─ Validate against database
   └─ Success → Go to step 4
   ↓
4. Check if user has set details before
   ├─ If not (first login) → Show Set Details Screen
   │  ├─ Select Department (CSE, IT, CE, etc.)
   │  ├─ Select Semester (1st, 2nd, 3rd, etc.)
   │  ├─ Select Section (A1, A2, B1, B2, etc.)
   │  └─ Save to database + localStorage
   └─ If yes → Skip to step 5
   ↓
5. Display Main Dashboard
   ├─ Show user details card (top-right corner): Email, Department, Semester, Section
   ├─ Load department-specific resource links (CSE Routine, Calendar, Faculty)
   ├─ Load tasks filtered by user's department, semester, section
   ├─ Show pending tasks (sorted by deadline)
   └─ Show upcoming events
   ↓
6. User can:
   ├─ View & manage tasks
   ├─ Click resource links (open in new tab)
   ├─ Click user details card (top-right) → Navigate to Profile Settings page
   │  ├─ View current settings (Department, Semester, Section)
   │  ├─ Edit Department dropdown
   │  ├─ Edit Semester dropdown
   │  ├─ Edit Section dropdown
   │  ├─ Save changes (updates database + localStorage + resource links)
   │  └─ Return to dashboard
   └─ Logout
```

---

## 3. TECHNOLOGY RECOMMENDATIONS

### 3.1 Database Options

#### Option A: Google Forms + Google Sheets (Recommended for Low Budget)
**Pros:**
- ✅ Free and easy to set up
- ✅ No backend server needed
- ✅ Data visible in familiar spreadsheet format
- ✅ Good for small-to-medium user bases

**Cons:**
- ❌ Limited query flexibility
- ❌ Slower response times (API calls can be delayed)
- ❌ Less secure (authentication limited)
- ❌ Rate limiting issues with high traffic
- ❌ Difficult to implement complex features

**Best For:** MVP, learning projects, small institutions (< 500 active users)

---

#### Option B: Firebase Realtime Database or Firestore (Recommended for Production)
**Pros:**
- ✅ Real-time data synchronization
- ✅ Built-in authentication
- ✅ Excellent scalability
- ✅ Easy to use client-side
- ✅ Free tier generous enough for students
- ✅ Automatic backups and security

**Cons:**
- ❌ Limited query options (no complex SQL)
- ❌ Potential vendor lock-in

**Best For:** Production SPA, real-time features, scalability

---

#### Option C: Dedicated Backend + Database (SQL/PostgreSQL, MongoDB, etc.)
**Pros:**
- ✅ Full control over backend logic
- ✅ Complex queries and relationships
- ✅ Better security (can hide sensitive logic)
- ✅ Unlimited customization

**Cons:**
- ❌ Requires server hosting (cost)
- ❌ More maintenance burden
- ❌ Longer development time

**Best For:** Large-scale apps, complex requirements, privacy-critical data

---

### **RECOMMENDATION FOR YOUR PROJECT:**

Start with **Firebase** because:
1. You want to keep backend logic private
2. Firebase allows separating public client-side code from authentication logic
3. Zero server maintenance
4. Firestore Security Rules can enforce access control
5. Easy admin dashboard for managing tasks/users
6. Perfect for college/university applications
7. Free tier is sufficient for students

---

### 3.2 Authentication Systems

#### Option A: Firebase Authentication (Recommended)
**Features:**
- Email/Password authentication
- Phone authentication available
- Social login (Google, GitHub) optional
- Built-in security (password hashing, session management)
- Admin SDK for backend if needed
- Free and scalable

**Pros:**
- ✅ No backend code exposed to clients
- ✅ Industry-standard security
- ✅ Can use private GitHub repo for any backend functions
- ✅ Free for student numbers
- ✅ Easy role-based access control

**Cons:**
- ❌ Vendor lock-in (Google)

---

#### Option B: Custom Backend Authentication (GitHub Repo Private)
**Setup:**
- Backend: Node.js/Python REST API (private GitHub repo)
- Host on: Heroku, Railway, Render, AWS
- Frontend: Calls your backend API
- Authentication tokens (JWT)

**Pros:**
- ✅ Complete control
- ✅ Backend hidden from users
- ✅ Can implement complex logic

**Cons:**
- ❌ Requires server maintenance
- ❌ Longer development time
- ❌ Hosting costs ($5-15/month typically)

---

### **RECOMMENDATION:**

**Use Firebase Authentication** with this architecture:
```
Frontend (Public GitHub)
    ↓ (API calls with auth token)
Firebase Backend
    ├── Authentication
    ├── Firestore Database
    └── Cloud Functions (if needed, keep logic minimal)
    
Optional: Private GitHub repo with deployment scripts/config
```

Why this works:
- Your authentication code stays on Firebase (not in client-side code)
- Users cannot see your backend logic
- Still fully customizable with Firebase Cloud Functions
- Zero server maintenance

---

## 4. COLOR SCHEME (Maroon + Dark Off-White)

### Primary Colors
```css
--maroon:              #800000
--dark-maroon:         #660000
--light-maroon:        #A00000
--dark-off-white:      #F5F3F0 (or #FAFAF8)
--lighter-off-white:   #F9F7F4
```

### Application of Colors
- **Navigation Bar:** Dark maroon background
- **Main Background:** Dark off-white
- **Buttons (Primary):** Maroon
- **Buttons (Secondary):** Dark maroon
- **Text:** Dark gray (#333333) on light background
- **Accents:** Light maroon for hover states
- **Cards/Containers:** White with subtle maroon borders

### Example CSS
```css
:root {
  --primary-maroon: #800000;
  --secondary-maroon: #660000;
  --accent-maroon: #A00000;
  --bg-light: #F5F3F0;
  --bg-white: #FFFFFF;
  --text-dark: #333333;
  --border-light: #E8E6E3;
}

body {
  background-color: var(--bg-light);
  color: var(--text-dark);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.navbar {
  background-color: var(--secondary-maroon);
  color: white;
}

.btn-primary {
  background-color: var(--primary-maroon);
  color: white;
}

.btn-primary:hover {
  background-color: var(--accent-maroon);
}
```

---

## 5. DASHBOARD UI LAYOUT

### Main Dashboard Structure
```
┌─────────────────────────────────────────────────────────────┐
│  Navbar (Maroon)                  [User Details Card] ← Click│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Resource Links (3 cards - CSE Routine, Calendar, Faculty) │
│  [📅 CSE Routine]  [📆 Calendar]  [👥 Faculty List]         │
│                                                             │
│  Pending Tasks                                              │
│  ┌──────────────────────────────────────────┐              │
│  │ Task 1: OS Assignment Due Feb 15         │              │
│  │ Task 2: Math Homework Due Feb 18         │              │
│  └──────────────────────────────────────────┘              │
│                                                             │
│  Events                                                     │
│  ┌──────────────────────────────────────────┐              │
│  │ Midterm Exam - March 1                   │              │
│  └──────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### User Details Card (Top-Right Corner)
**Location:** Fixed position in top-right of navbar/header
**Content:**
```html
<div class="user-details-card" onclick="navigateToProfileSettings()">
  <div class="user-avatar">👤</div>
  <div class="user-info">
    <p class="user-email">student@example.com</p>
    <p class="user-department">CSE • 1st Semester • A1</p>
  </div>
  <div class="settings-icon">⚙️</div>
</div>
```
**Interaction:** Click anywhere on card → Navigate to Profile Settings page

### Profile Settings Page
**URL/Route:** `#/profile-settings` or `/settings`
**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  [← Back to Dashboard]    Profile Settings          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ID: DHAKA-1                                        │
│  Email: student@example.com   [Cannot change]      │
│                                                     │
│  Department:      [CSE ▼]                           │
│  Semester:        [1st ▼]                           │
│  Section:         [A1 ▼]                            │
│                                                     │
│  [Save Changes]  [Cancel]                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```
**Features:**
- Current values pre-selected in dropdowns
- Confirmation dialog before saving changes
- Auto-update dashboard data (tasks + resource links) on save
- Return to dashboard after successful save

---

## 6. NEW FILE STRUCTURE

```
b1t-Sched/
├── index.html (Main SPA entry point)
├── manifest.json (PWA config)
├── css/
│   ├── main.css (New unified stylesheet)
│   ├── colors.css (Color variables)
│   ├── components.css (Buttons, cards, modals)
│   ├── navbar.css
│   ├── user-details-card.css
│   ├── responsive.css
│   └── [old CSS files - can be deprecated after migration]
├── js/
│   ├── app.js (Main app initialization)
│   ├── auth.js (Firebase authentication)
│   ├── db.js (Firebase database operations)
│   ├── ui.js (UI updates and rendering)
│   ├── routing.js (SPA routing/views)
│   ├── profile.js (Profile settings logic)
│   ├── utils.js (Helper functions)
│   └── [old JS files can be archived]
├── components/ (HTML snippets for dynamic loading)
│   ├── navbar.html
│   ├── user-details-card.html
│   ├── login-form.html
│   ├── set-details-form.html
│   ├── task-card.html
│   ├── event-card.html
│   ├── resource-links.html
│   └── profile-settings.html
├── data/ (Static data like departments/semesters)
│   ├── departments.json
│   └── task-templates.json
├── images/ (Existing images)
├── REDESIGN_PLAN.md (This file)
└── D1/ (Keep for backward compatibility or archive)
```

---

## 6. DATABASE SCHEMA (Firebase Firestore)

### Collections & Documents

#### `users` Collection
```json
{
  "users": {
    "user123": {
      "email": "student@example.com",
      "uid": "user123",
      "department": "CSE",
      "semester": "1st",
      "section": "A1",
      "createdAt": "2026-02-10T10:00:00Z",
      "updatedAt": "2026-02-10T10:00:00Z"
    }
  }
}
```

#### `tasks` Collection
```json
{
  "tasks": {
    "task001": {
      "title": "OS Assignment 1",
      "course": "CSE-3101",
      "department": "CSE",
      "semester": "1st",
      "section": "A1",
      "deadline": "2026-03-15T23:59:59Z",
      "type": "assignment", // "assignment", "homework", "exam", "project"
      "description": "Complete chapters 1-3...",
      "details": "Submit via email or portal",
      "createdAt": "2026-02-10T10:00:00Z",
      "status": "active" // "active", "completed", "archived"
    }
  }
}
```

#### `events` Collection
```json
{
  "events": {
    "event001": {
      "title": "Spring Semester Begins",
      "date": "2026-02-15T00:00:00Z",
      "department": "ALL", // or specific department
      "semester": "1st",
      "description": "Official start date",
      "createdAt": "2026-02-10T10:00:00Z"
    }
  }
}
```

#### `metadata` Collection
```json
{
  "metadata": {
    "departments": {
      "list": ["CSE", "IT", "CE", "EEE", "BBA"]
    },
    "semesters": {
      "list": ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"]
    },
    "sections": {
      "CSE-1st": ["A1", "A2"],
      "CSE-2nd": ["A1", "A2", "B1", "B2"],
      // ... etc
    }
  }
}
```

#### `resourceLinks` Collection
```json
{
  "resourceLinks": {
    "CSE": {
      "department": "CSE",
      "resources": [
        {
          "id": 1,
          "title": "CSE Routine",
          "description": "(tmp Spring-2026)",
          "url": "https://docs.google.com/spreadsheets/d/1HLhnOWYCOJMzJ-ffADqrdapEsP6tx2PY6XDPMdNypCI/edit",
          "icon": "📅",
          "type": "routine"
        },
        {
          "id": 2,
          "title": "Academic Calendar",
          "description": "(2026)",
          "url": "https://calendar.google.com/...",
          "icon": "📆",
          "type": "calendar"
        },
        {
          "id": 3,
          "title": "CSE Faculty & Advisor List",
          "description": "(Spring-2026)",
          "url": "https://docs.google.com/...",
          "icon": "👥",
          "type": "faculty"
        }
      ]
    },
    "IT": {
      "department": "IT",
      "resources": [
        {
          "id": 1,
          "title": "IT Routine",
          "description": "(tmp Spring-2026)",
          "url": "https://...",
          "icon": "📅",
          "type": "routine"
        },
        // ... IT-specific resources
      ]
    }
    // ... other departments
  }
}
```

---

## 7. DEPARTMENT-SPECIFIC RESOURCE LINKS

### Feature Overview
Display 3 dynamic resource links alongside pending tasks that change based on the logged-in user's department. These links provide quick access to:
- Department routine/schedule
- Academic calendar
- Faculty & advisor contact information

### Implementation Details

**Display Location:** Dashboard header, below user info or above task list
**Update Trigger:** When user selects/changes department in settings
**Data Source:** `resourceLinks` Firestore collection

**Example Flow:**
```
User logs in with CSE department
  ↓
Load resourceLinks for CSE
  ↓
Display 3 resource cards:
  ├─ CSE Routine (tmp Spring-2026)
  ├─ Academic Calendar (2026)
  └─ CSE Faculty & Advisor List (Spring-2026)

---

User changes department to IT
  ↓
Load resourceLinks for IT
  ↓
Display 3 resource cards (updated):
  ├─ IT Routine
  ├─ Academic Calendar
  └─ IT Faculty List
```

**Component Structure (HTML):**
```html
<div class="resource-links-container">
  <div class="resource-link-card">
    <a href="[url]" target="_blank">
      <div class="resource-icon">📅</div>
      <h3>CSE Routine</h3>
      <p>(tmp Spring-2026)</p>
    </a>
  </div>
  <!-- Repeat for other resources -->
</div>
```

**Styling (CSS):**
- Cards arranged horizontally in a row (responsive: stack on mobile)
- Maroon border/hover effect
- Icon + title + description visible
- Click opens link in new tab

---

## 8. KEY FEATURES TO IMPLEMENT

### Phase 1: Core (MVP)
- [x] Responsive SPA layout
- [ ] SPA routing (#/dashboard, #/profile-settings)
- [ ] Firebase Authentication (Email/Password)
- [ ] User profile with department/semester/section selection
- [ ] User details card (top-right corner) with click navigation
- [ ] Profile Settings page (editable Department, Semester, Section)
- [ ] Task display filtered by user settings
- [ ] Department-specific resource links (CSE Routine, Calendar, Faculty list)
- [ ] Logout functionality
- [ ] LocalStorage for session persistence

### Phase 2: Enhanced
- [ ] Task filtering and sorting options
- [ ] Search functionality
- [ ] Events calendar view
- [ ] Mark tasks as complete/incomplete
- [ ] Confirmation dialogs for critical actions

### Phase 3: Advanced
- [ ] Push notifications for approaching deadlines
- [ ] Dark mode toggle (optional - you said no theme switchers)
- [ ] Mobile app (PWA/React Native)
- [ ] Admin panel for managing tasks
- [ ] Email digest of pending tasks

---

## 8. IMMEDIATE ACTION ITEMS

### Setup Firebase Project
1. Go to https://console.firebase.google.com
2. Create new project (free tier)
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Get config credentials

### Create Initial Files
```
✓ index.html (new SPA entry point)
✓ css/main.css (with color scheme)
✓ js/app.js (initialization)
✓ js/auth.js (Firebase setup)
✓ js/db.js (Firestore operations)
✓ Migrate existing task data to Firestore
```

### Data Migration
- Extract tasks from existing HTML/Google Sheets
- Organize by department/semester/section
- Create Firestore import script

---

## 9. TECHNOLOGY STACK SUMMARY

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | HTML5 + CSS3 + Vanilla JS | Lightweight, no build needed |
| SPA Routing | Hash-based Router (#/) | Simple requirements, avoid framework overhead |
| Authentication | Firebase Auth | Secure, no server, free |
| Database | Firestore | Real-time, scalable, free tier sufficient |
| Styling | CSS Custom Properties | Maroon + off-white theme |
| Hosting | Vercel / Netlify | Free, fast deployment |
| Storage | Firestore + Firebase Storage | For documents if needed |

### SPA Routes Structure
```javascript
// Route definitions
const routes = {
  '/':                   'showLoginScreen',      // Default: login
  '#/dashboard':         'showDashboard',        // Main dashboard
  '#/profile-settings':  'showProfileSettings',  // Profile settings page
  '#/set-details':       'showSetDetails',       // First-time setup (hidden route)
};

// Navigation flow examples:
// Login success → #/dashboard
// Click user details card → #/profile-settings
// Save profile changes → #/dashboard
// First login → #/set-details → #/dashboard
```

---

## 10. ANSWERS TO YOUR QUESTIONS

### Q1: Google Forms/Sheets vs Dedicated Database?
**Answer:** Go with **Firebase Firestore**
- Better than Google Sheets for real-time filtering
- Better than custom database for your use case (no maintenance)
- Free, scalable, perfect for student projects
- Can query efficiently (e.g., "show me CSE 1st semester A1 section tasks")

### Q2: Firebase Auth vs Custom Backend?
**Answer:** Go with **Firebase Authentication**
- Separates concerns (auth handled by Google, not your code)
- Your client-side code is public, but auth logic is private
- If you want to add backend logic later, use Cloud Functions (also private)
- No server to maintain
- Better security than a custom system
- Can create a private GitHub repo for deployment configs if needed

---

## 11. IMPLEMENTATION ROADMAP

### Week 1: Foundation
- [ ] Set up Firebase project
- [ ] Create index.html (SPA template)
- [ ] Implement color scheme
- [ ] Build login/signup forms

### Week 2: Database & Auth
- [ ] Implement Firebase authentication
- [ ] Create Firestore collections
- [ ] Migrate existing data
- [ ] Test auth flow

### Week 3: Dashboard
- [ ] Build user details card (top-right corner)
- [ ] Build task display component
- [ ] Implement filtering by user settings
- [ ] Create department-specific resource links
- [ ] Build Profile Settings page
- [ ] Implement routing (#/dashboard, #/profile-settings)
- [ ] Test main user flows (login → dashboard → profile settings → save)

### Week 4: Polish & Deploy
- [ ] Responsive design testing
- [ ] Bug fixes
- [ ] Deploy to production
- [ ] Monitor and iterate

---

## 12. RISKS & MITIGATION

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Data loss during migration | High | Backup all existing data, test import |
| Firebase limitations | Medium | Review Firestore queries, plan workarounds |
| User adoption of new system | Medium | Clear instructions, gradual rollout |
| Scope creep | High | Stick to MVP, defer Phase 2+ features |

---

## NEXT STEP

**Please review this plan and confirm:**
1. ✅ SPA approach acceptable?
2. ✅ Firebase + Firestore stack approved?
3. ✅ Color scheme (maroon + off-white) approved?
4. ✅ File structure makes sense?
5. ✅ Any modifications needed?

Once approved, I can begin implementation starting with:
- Firebase project setup
- New index.html with SPA structure
- Color scheme CSS
- Authentication system
