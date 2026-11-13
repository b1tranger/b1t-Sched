# b1t-Sched - Documentation Directory Index

This directory contains the complete technical, architectural, feature, and historical documentation for **b1t-Sched (Academic Task Scheduler)**.

---

## 1. Primary Documentation
- **[DOCUMENTATION.md](file:///d:/GitHub/[oU1TS]/b1t-Sched/doc/DOCUMENTATION.md)**: The authoritative, comprehensive reference manual for the application. Covers system architecture, technology stack, module structure, Firestore data models, API methods, responsive styling, design inspirations, and full version history.

---

## 2. Features Documentation
- **[ADMIN_FEATURES.md](file:///d:/GitHub/[oU1TS]/b1t-Sched/doc/ADMIN_FEATURES.md)**: Guide to Administrator and Department Coordinator tools, including user role toggling (Admin, DptCoor, Faculty, CR, Student, Blocked), Admin Role Preview mode, and bulk semester promotions.
- **[rss-events-integration/](file:///d:/GitHub/[oU1TS]/b1t-Sched/doc/rss-events-integration/)**: Specifications for integrating university-wide events and the external UITS Event Raiders syndication feed.
- **[firebaseQueries/](file:///d:/GitHub/[oU1TS]/b1t-Sched/doc/firebaseQueries/)**: Firestore querying patterns, indexing requirements, and performance optimizations.

---

## 3. Architecture & Setup
- **[QUICKSTART.md](file:///d:/GitHub/[oU1TS]/b1t-Sched/doc/QUICKSTART.md)**: Quick start guide for running b1t-Sched locally with Live Server or static hosting.
- **[FIREBASE_SETUP.md](file:///d:/GitHub/[oU1TS]/b1t-Sched/doc/FIREBASE_SETUP.md)**: Firebase project configuration, API keys, and environment initialization.
- **[FIREBASE_DATABASE_SETUP_INSTRUCTIONS.md](file:///d:/GitHub/[oU1TS]/b1t-Sched/doc/FIREBASE_DATABASE_SETUP_INSTRUCTIONS.md)**: Firestore security rules, collection schemas, and indexes.
- **[FIRESTORE_TASK_CHANGES.md](file:///d:/GitHub/[oU1TS]/b1t-Sched/doc/FIRESTORE_TASK_CHANGES.md)**: Evolution of task document schema, completion maps, and role permissions.
- **[REDESIGN_PLAN.md](file:///d:/GitHub/[oU1TS]/b1t-Sched/doc/REDESIGN_PLAN.md)**: Architectural plan for the modular 2.0 rewrite.

---

## 4. Reverted Implementations & Known Limitations
- **Firebase Storage Bucket Uploads (Reverted)**:
  - *Context*: Notes originally attempted to upload attachments to Firebase Cloud Storage (`uploadToFirebaseStorage`).
  - *Reason for Reversion*: Strict free-tier quota limits (5 GB total storage, 1 GB/day bandwidth) and CORS configuration overhead.
  - *Current Solution*: Multi-provider fallback pipeline (`Catbox.moe` primary with 200 MB limit, `Tmpfiles.org` secondary) combined with client-side blob downloads.
- **Mobile Web Notification API Restriction (Known Limitation)**:
  - *Context*: Direct `new Notification(...)` calls fail with an `Illegal constructor` error on mobile operating systems (Android Chrome, iOS Safari).
  - *Current Solution*: Priority resolution via Service Worker (`navigator.serviceWorker.ready -> registration.showNotification`).
- **Device Viewport Auto-Zoom (Known Limitation)**:
  - *Context*: Android and iOS browsers trigger aggressive zoom-in when focusing `<input>` elements with font sizes below `16px`.
  - *Current Solution*: Modal forms enforce `font-size: 16px !important` on mobile, `100dvh` modal viewport clamping, and responsive CSS scaling.

---

## 5. Serial Prompts, Plans & Walkthroughs (AGENTS.md Archives)
All prompt sessions, implementation plans, and post-execution walkthroughs are systematically recorded in **[`doc/prompts/`](file:///d:/GitHub/[oU1TS]/b1t-Sched/doc/prompts/)** under dedicated serial session folders matching the `AGENTS.md` standard (each housing `conversation.md`, `summary.md`, original prompt files, and companion plans/walkthroughs):
- **[Session 36](file:///d:/GitHub/[oU1TS]/b1t-Sched/doc/prompts/36.%20Classroom%20Shortcut%20FAB,%20Navbar%20GitHub%20Button%20&%20Mobile%20Footer%20Icons/)**: Classroom Shortcut FAB, Navbar GitHub Button, Mobile Footer Icons & Backlog Audit.
- **[Session 35](file:///d:/GitHub/[oU1TS]/b1t-Sched/doc/prompts/35.%20Classroom%20Sync,%20Modular%20Architecture,%20Theming%20&%20Authentication/)**: Classroom Sync, Modular Architecture, Theming & Authentication.
- **[Session 34](file:///d:/GitHub/[oU1TS]/b1t-Sched/doc/prompts/34.%20Firebase%20Task%20ID,%20Admin%20Role%20Preview%20Mode,%20Approvals%20&%20Department%20Notices/)**: Firebase Task ID, Admin Role Preview Mode, Approvals & Department Notices.
- **[Session 33](file:///d:/GitHub/[oU1TS]/b1t-Sched/doc/prompts/33.%20LocalSend%20Integration,%20Calendar%20Links%20with%20Description%20Toggle,%20and%20Faculty-CR%20Classroom%20Announcement%20Option/)**: LocalSend Integration, Calendar Links with Description Toggle, and Faculty-CR Classroom Announcement Option.
- **[Session 32](file:///d:/GitHub/[oU1TS]/b1t-Sched/doc/prompts/32.%20Classroom%20Window%20Border%20Padding%20and%203-Group%20Assignment%20Layout/)**: Classroom Window Border Padding and 3-Group Assignment Layout.
- **[Session 31](file:///d:/GitHub/[oU1TS]/b1t-Sched/doc/prompts/31.%20Offline%20Banner%20Dedicated%20Layout%20Space%20and%20Content%20Push%20Down/)**: Offline Banner Dedicated Layout Space and Content Push Down.
- **Sessions 21-30**: Google Classroom status badges, RSS events integration, JSON caching, mobile layout, and dynamic departments.
- **Sessions 11-20**: University notice indexing, Firebase API key resolution, semester auto-promotion, and form CSS fixes.
- **Sessions 1-10**: Initial SPA architecture, user onboarding, multi-section task reset, PDF notice viewer, and admin user management.

