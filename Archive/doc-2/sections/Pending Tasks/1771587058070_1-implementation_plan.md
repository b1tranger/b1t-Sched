> Original Source: plan/task-filter and contribution-list/1-implementation_plan.md

# b1t-Sched: 4 Feature Implementation Plan

## Task-1: Task Filter in Pending Tasks

Add horizontal radio buttons to filter pending tasks by type.

### Pending Tasks Section
#### [MODIFY] [index.html](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/index.html)
- Insert a filter row between the `tasks-actions` div (line ~296) and the `<br>` before `tasks-container`
- Contains 6 radio buttons (Assignment, Homework, Exam, Project, Presentation, Other) + a "Clear Filter" button
- Radio buttons use `name="task-filter"` with `value` matching lowercase type strings

#### [MODIFY] [dashboard.css](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/css/dashboard.css)
- Add styles for `.task-filter-row` — horizontal flex layout, wrapping on mobile, pill-style radio labels
- Style the clear filter button

#### [MODIFY] [ui.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/ui.js)
- In `renderTasks`, add a `data-type` attribute to each `.task-card` div

#### [MODIFY] [app.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/app.js)
- Add filter event listeners: when a radio button is selected, hide task cards whose `data-type` doesn't match; show the "no tasks" message if all are hidden
- "Clear Filter" button resets all radio buttons and shows all task cards

---

## Task-2: Fix Mobile Display Issues

### Login Scroll Fix
#### [MODIFY] [main.css](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/css/main.css)
- Change `.auth-container` to use `height: 100vh` + `overflow: hidden` instead of `min-height: 100vh` so the login page is fixed and non-scrollable

### Mobile Zoom Fix
#### [MODIFY] [index.html](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/index.html)
- Update the viewport meta tag (line 6) to add `maximum-scale=1.0, user-scalable=no` to prevent zoomed-in appearance on some mobile devices

---

## Task-3: Contribution List

### Contributions Button & Modal
#### [MODIFY] [index.html](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/index.html)
- Add a "Contributions" button just below the FAQ `</section>` closing tag (line ~995)
- Add a contributions modal with a table (columns: Email, Tasks Added)

#### [MODIFY] [main.css](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/css/main.css)
- Style the contributions button (centered, maroon theme) and the modal table

#### [MODIFY] [app.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/app.js)
- Add click listener for the contributions button
- On click: aggregate `currentTasks` by `addedByName` (the email prefix), count tasks per contributor, sort descending, and render into the modal table
- Wire up modal close/open

> [!NOTE]
> The contribution data comes from the currently loaded tasks (`this.currentTasks`), which are scoped to the user's department/semester/section. This means contributions shown are for the user's group only, not global.

---

## Task-4: Total User Counter (Bottom-Right)

#### [MODIFY] [index.html](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/index.html)
- Add a fixed-position `<div id="total-user-counter">` inside the dashboard-view, styled to sit at the bottom-right corner

#### [MODIFY] [dashboard.css](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/css/dashboard.css)
- Style `#total-user-counter` as a small pill/badge at bottom-right with a user icon and count

#### [MODIFY] [app.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/app.js)
- In `loadDashboardData`, call `DB.getAllUsers()` to get user count and update `#total-user-counter`

> [!IMPORTANT]
> `DB.getAllUsers()` is currently admin-only protected by Firestore rules. If non-admin users get a permission error, we'll need a dedicated counter document or adjust the approach. Please confirm whether all users should see the total count, or only admin users.

---

## Verification Plan

### Manual Verification (Browser Testing)
1. **Task Filter**: Open the dashboard after login → verify radio buttons appear horizontally below "Add Tasks / View Old" buttons → click each filter and verify only matching tasks show → click "Clear Filter" and verify all reappear
2. **Mobile Fix**: Open Chrome DevTools → toggle device toolbar to a mobile device → verify the page is not zoomed in and the login page does not scroll
3. **Contributions**: Scroll to FAQ section → click "Contributions" button → verify modal opens with contributor email prefixes and task counts
4. **User Counter**: After login, verify a small counter badge appears at the bottom-right corner showing total user count
