# Fix CR Notice — Auto-populate from User Profile

CRs (and Admins) cannot add notices because `cr-notice.js` reads user data from `localStorage` keys (`userDepartment`, `userSemester`, `userSection`) that are **never set**. Profile data is stored as a JSON object via `Utils.storage.set('userProfile', ...)`. Additionally, the Firestore rules only allow CRs to create, not Admins.

The fix follows the same pattern used by the **Events** system (`app.js:openAddEventModal` / `handleAddEvent`): auto-populate department/semester/section from the user's profile and remove those form fields entirely.

## Root Causes

| # | Issue | Location |
|---|-------|----------|
| 1 | `localStorage.getItem('userDepartment')` is never set — profile stored as JSON under `userProfile` key | `cr-notice.js` lines 86-88, 321-323 |
| 2 | `submitNotice()` reads dept/sem/sec from DOM dropdowns that may be empty | `cr-notice.js` lines 349-351 |
| 3 | Firestore create rule only permits CRs, not Admins | `firestore.rules` line 167 |

## Proposed Changes

### CR Notice Module

#### [MODIFY] [cr-notice.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/cr-notice.js)

- **`subscribeToNotices()`** — Replace `localStorage.getItem('userDepartment')` etc. with `Utils.storage.get('userProfile')` to correctly read the user's department, semester, and section
- **`openAddModal()`** — Remove all dropdown-related logic (populating, enabling/disabling dept/sem/sec selects). The modal now only shows Title, Priority, and Description
- **`submitNotice()`** — Read `department`, `semester`, `section` from `Utils.storage.get('userProfile')` instead of from DOM dropdowns. Remove the validation alert about selecting department/semester/section

---

### HTML Templates

#### [MODIFY] [index.html](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/index.html)

- **Modal at lines ~1470-1533** (the main Add CR Notice modal) — Remove the three form groups for Department, Semester, and Section dropdowns (`cr-notice-department`, `cr-notice-semester`, `cr-notice-section`)
- **Modal at lines ~933-969** (duplicate/legacy modal) — Keep as-is since it already lacks those fields

---

### Firestore Security Rules

#### [MODIFY] [firestore.rules](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/firestore.rules)

- **Create rule** (line 167) — Add `isAdmin()` as an alternative path so Admins can also create CR notices for any section:
  ```
  allow create: if isAdmin() && hasRequiredNoticeFields() || (
    isCR() && 
    request.resource.data.createdBy == request.auth.uid &&
    request.resource.data.department == getUserDepartment() &&
    ...
  );
  ```

## Verification Plan

> [!IMPORTANT]
> This is a Firebase web app with no automated test suite. Verification is manual.

### Manual Verification
1. **Deploy** the updated `firestore.rules` to Firebase (`firebase deploy --only firestore:rules`)
2. **Open the site** and log in as a **CR** user
3. Open the Notice modal → Click "Add Notice" → Confirm the form only shows **Title**, **Priority**, and **Description** (no department/semester/section dropdowns)
4. Fill in a title + description → Click "Post Notice" → Confirm success alert
5. Verify the newly posted notice appears in the CR Notices list
6. Check **Firestore console** → `cr_notices` collection → confirm the document has `department`, `semester`, `section` matching the CR's profile
7. **(Optional)** Log in as **Admin** and repeat steps 3-6
