> Original Source: plan/updating_role_events_implementation_plan.md

# Events "See More" Button + CR Event Privileges

Three tasks: (1) Add a "See more" collapsible description to Events sidebar (mirroring the existing Tasks pattern), (2) Give CR role limited event management privileges, (3) Update documentation.

## User Review Required

> [!IMPORTANT]
> **CR Event Scope**: CRs will be able to create events for **their own department only**, and can only edit/delete events **they created**. Admins retain full control over all events, including CR-created ones.

> [!IMPORTANT]
> **"Added by" Label**: When expanded, events will show "Added by Admin" for admin-created events, and "Added by CR" for CR-created ones.

---

## Proposed Changes

### Task-1: Events "See more" Button

#### [MODIFY] [ui.js](file:///e:/Git_WIP/2.%20Personal%20Repositories/b1t-Sched/js/ui.js)

Update `renderEvents()` to wrap the event description in the same collapsible pattern used by tasks:
- Wrap `event-description` text in a `event-description-wrapper` > `event-description-text` div (2-line clamp)
- Add a **scope badge** showing the event's target department (e.g. "ALL", "CSE") next to the event title — styled like `.task-type-badge`
- Add hidden "Added by Admin" / "Added by CR" paragraph (revealed on expand via CSS sibling selector)
- Add a "Show more" toggle button with chevron icon

Signature change: `renderEvents(events, isAdmin = false)` → `renderEvents(events, isAdmin = false, isCR = false, currentUserId = null)`

#### [MODIFY] [app.js](file:///e:/Git_WIP/2.%20Personal%20Repositories/b1t-Sched/js/app.js)

- Add click delegation for `.event-description-toggle` in `setupAdminEventListeners()` (for both `events-container` and `events-container-mobile`)
- The toggle handler mirrors the task toggle: toggles `expanded` class on text, updates button text

#### [MODIFY] [components.css](file:///e:/Git_WIP/2.%20Personal%20Repositories/b1t-Sched/css/components.css)

Add styles for event description toggle, reusing the same pattern as task descriptions:
- `.event-description-wrapper` — relative position
- `.event-description-text` — 2-line clamp (collapse)  
- `.event-description-text.expanded` — unset clamp
- `.event-added-by-hidden` — hidden by default, shown when expanded
- `.event-description-toggle` — same styling as `.task-description-toggle`

#### [MODIFY] [dashboard.css](file:///e:/Git_WIP/2.%20Personal%20Repositories/b1t-Sched/css/dashboard.css)

Remove the existing `line-clamp: 5` rules on `.dashboard-sidebar .event-description` and `.events-container-mobile .event-description` since the JS toggle now controls visibility.

---

### Task-2: CR Event Privileges

#### [MODIFY] [db.js](file:///e:/Git_WIP/2.%20Personal%20Repositories/b1t-Sched/js/db.js)

- `createEvent()`: Add `createdByName` field (passed from caller)
- `updateEvent()`: Comment update to note it works for both admin and CR

#### [MODIFY] [ui.js](file:///e:/Git_WIP/2.%20Personal%20Repositories/b1t-Sched/js/ui.js)

- `renderEvents()`: Accept `isCR` and `currentUserId` params.  
  - Show edit/delete buttons if `isAdmin` OR if `isCR` AND event was created by current user
  - Show "Added by Admin" or "Added by CR" depending on creator

#### [MODIFY] [app.js](file:///e:/Git_WIP/2.%20Personal%20Repositories/b1t-Sched/js/app.js)

- `loadDashboardData()`: Pass `this.isCR` and `userId` to `UI.renderEvents()`
- `openAddEventModal()`: Allow if admin OR CR. For CR, auto-set department to user's own department and hide/disable the department dropdown.
- `handleAddEvent()`: For CR, force department to user's own department. Pass `createdByName` ("Admin" or "CR").
- `openEditEventModal()`: Allow if admin OR if CR and event.createdBy matches userId
- `handleEditEvent()`: Allow if admin OR if CR and event matches
- `handleDeleteEvent()`: Allow if admin OR if CR and event.createdBy matches userId
- `toggleAdminControls()` in `ui.js`: Show "Add Event" button for CR users too (via `cr-or-admin` class on the button)

#### [MODIFY] [firestore.rules](file:///e:/Git_WIP/2.%20Personal%20Repositories/b1t-Sched/firestore.rules)

Updated events rules:
```
match /events/{eventId} {
  allow read: if isSignedIn();
  
  // Admin can do anything; CR can create events for their own department
  allow create: if isAdmin() || (
    isCR() && 
    request.resource.data.createdBy == request.auth.uid &&
    request.resource.data.department == getUserDepartment()
  );
  
  // Admin can edit any; CR can edit only their own events
  allow update: if isAdmin() || (
    isCR() && 
    resource.data.createdBy == request.auth.uid
  );
  
  // Admin can delete any; CR can delete only their own events
  allow delete: if isAdmin() || (
    isCR() && 
    resource.data.createdBy == request.auth.uid
  );
}
```

Need a new helper function:
```
function getUserDepartment() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.department;
}
```

---

### Task-3: Documentation

#### [MODIFY] [DOCUMENTATION.md](file:///e:/Git_WIP/2.%20Personal%20Repositories/b1t-Sched/doc/DOCUMENTATION.md)

- Update Key Features list (events now have collapsible descriptions)
- Update User Role Permissions table (CR can create/edit/delete own events)
- Update Firestore Security Rules section
- Update Event Schema (add `createdByName`)
- Update `renderEvents` signature docs
- Update `handleAddEvent`/`openEditEventModal`/`handleEditEvent`/`handleDeleteEvent` docs

---

## Verification Plan

### Manual Verification

Since this is a Firebase-backed web app with no automated test suite, verification is manual:

1. **Events "See more" (Task-1)**: Open the dashboard → check that event descriptions are truncated to 2 lines with a "Show more" button. Click "Show more" → description expands, shows "Added by Admin", button text changes to "Show less", chevron rotates. Click "Show less" → collapses back. Test on both desktop sidebar and mobile slide-out panel.

2. **CR Privileges (Task-2)**: Log in as a CR user → verify the "Add Event" button appears → create an event (department should be auto-set to CR's department) → verify edit/delete buttons appear on the CR's own event, but NOT on admin-created events → edit the event → delete the event. Log in as admin → verify admin can still edit/delete CR-created events.

3. **Firestore Rules**: Deploy the updated `firestore.rules` and test that a CR can only create events for their own department, can only edit/delete their own events, and cannot modify admin events.
