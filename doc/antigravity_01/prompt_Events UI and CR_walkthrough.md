# Walkthrough: Events UI + CR Privileges

## Changes Made

### Task-1: Events "See More" + Scope Badge

| File | Change |
|------|--------|
| [ui.js](file:///e:/Git_WIP/2.%20Personal%20Repositories/b1t-Sched/js/ui.js) | `renderEvents()` now wraps descriptions in a collapsible wrapper with 2-line clamp, "Show more/less" toggle, "Added by Admin/CR" hidden label, and department scope badge (ALL/CSE/etc.) |
| [app.js](file:///e:/Git_WIP/2.%20Personal%20Repositories/b1t-Sched/js/app.js) | Added `.event-description-toggle` click delegation in `setupEventsSidebarListeners()` for both desktop and mobile containers |
| [components.css](file:///e:/Git_WIP/2.%20Personal%20Repositories/b1t-Sched/css/components.css) | Added `.event-description-wrapper`, `.event-description-text` (2-line clamp), `.event-added-by-hidden`, `.event-description-toggle`, `.event-header`, `.event-scope-badge` styles |
| [dashboard.css](file:///e:/Git_WIP/2.%20Personal%20Repositories/b1t-Sched/css/dashboard.css) | Removed old `line-clamp: 5` from sidebar/mobile event descriptions (JS toggle now controls) |

### Task-2: CR Event Privileges

| File | Change |
|------|--------|
| [db.js](file:///e:/Git_WIP/2.%20Personal%20Repositories/b1t-Sched/js/db.js) | `createEvent()` stores `createdByName` ("Admin" or "CR") |
| [ui.js](file:///e:/Git_WIP/2.%20Personal%20Repositories/b1t-Sched/js/ui.js) | `renderEvents()` accepts `isCR` + `currentUserId`, shows edit/delete for CR's own events |
| [app.js](file:///e:/Git_WIP/2.%20Personal%20Repositories/b1t-Sched/js/app.js) | `openAddEventModal` locks department for CR; `handleAddEvent` forces CR department + sets `createdByName`; `openEditEventModal`/`handleEditEvent`/`handleDeleteEvent` allow CR for own events; `loadDashboardData` passes `isCR` + `userId` |
| [index.html](file:///e:/Git_WIP/2.%20Personal%20Repositories/b1t-Sched/index.html) | "Add Event" buttons changed from `admin-only` to `cr-or-admin` |
| [firestore.rules](file:///e:/Git_WIP/2.%20Personal%20Repositories/b1t-Sched/firestore.rules) | Added `getUserDepartment()` helper; CR can create (own dept), update (own events), delete (own events) |

### Task-3: Documentation

| File | Change |
|------|--------|
| [DOCUMENTATION.md](file:///e:/Git_WIP/2.%20Personal%20Repositories/b1t-Sched/doc/DOCUMENTATION.md) | Updated Key Features, permissions table (3 rows for events), event schema (`createdByName`), Firestore rules section |

## Verification

> [!IMPORTANT]
> **Firestore rules** must be deployed (`firebase deploy --only firestore:rules`) for CR event permissions to take effect server-side.

Manual testing needed:
1. **See More**: Open dashboard → event descriptions should show 2-line truncation + "Show more" button + scope badge. Click toggle to expand/collapse.
2. **CR Privileges**: Log in as CR → "Add Event" button visible → create event (department auto-set) → edit/delete own events → cannot edit/delete admin events.
