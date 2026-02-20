# Calendar & Notices Refinements — Implementation Plan

Five enhancements to the b1t-Sched app: notice deadlines, mobile form layout, CSS fixes, README update, and mobile calendar monthly view.

## User Review Required

> [!IMPORTANT]
> **Task 3 (CSS Updates)** — the theme-color and `note.css` fixes were already applied earlier in this conversation. No further action needed.

> [!IMPORTANT]
> **Duplicate CR Notice Modals** — There are two `add-cr-notice-modal` elements in `index.html` (lines 934 and 1471). The newer one at line 1471 (inside the `contributions-section`) is the active one used by `cr-notice.js`. The deadline fields will be added to **both** modals and both edit modals to maintain consistency.

> [!WARNING]
> **Task 5 (Mobile Calendar)** is the most complex change. It modifies the existing `renderWeeklyView()` flow in `calendar-view.js`. Please confirm the reference images previously shared are the target design.

---

## Proposed Changes

### Task 1: Class Notice Deadline

Add deadline support to CR Notices, mirroring the existing Pending Tasks deadline pattern.

#### [MODIFY] [index.html](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/index.html)

**Add CR Notice form (line ~1500):** Insert a deadline form group after the Description field:
```diff
+<div class="form-group">
+    <label>Deadline</label>
+    <div class="notice-deadline-options">
+        <input type="radio" name="cr-notice-deadline-option" id="cr-notice-deadline-none" value="none" checked>
+        <label for="cr-notice-deadline-none">No Deadline</label>
+        <input type="radio" name="cr-notice-deadline-option" id="cr-notice-deadline-date" value="date">
+        <label for="cr-notice-deadline-date">Set Deadline</label>
+        <input type="datetime-local" id="cr-notice-deadline" class="form-control" disabled>
+    </div>
+</div>
```

**Edit CR Notice form (line ~1545):** Same pattern with `edit-cr-notice-deadline-*` IDs.

Also apply the same to the legacy modal at line ~960.

#### [MODIFY] [cr-notice.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/cr-notice.js)

- **`submitNotice()`**: Read the deadline radio + datetime value, store as `deadline` field (ISO string or `null`).
- **`openAddModal()`**: Set up radio button listeners for enable/disable of datetime input. Set min date to now.
- **`createNoticeCard()`**: Display deadline below description if present (formatted via `Utils.formatDate()`).
- **`openEditModal()`**: Pre-fill the deadline radio + datetime based on existing notice data.
- **`submitEditNotice()`**: Read and save updated deadline.

---

### Task 2: Mobile Radio Button Layout

#### [MODIFY] [responsive.css](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/css/responsive.css) or inline style fix

The deadline radio buttons container at line 669 uses `display: flex` inline. Add a media query to stack them vertically on mobile:

```css
@media (max-width: 768px) {
  #add-task-form .form-group div[style*="display: flex"],
  #edit-task-form .form-group div[style*="display: flex"] {
    flex-direction: column;
    align-items: flex-start;
  }
}
```

Better approach: Add a class `deadline-options` to the wrapper div instead of relying on inline style selectors, then target that class.

---

### Task 3: CSS Updates ✅ Already Done

- `index.html` line 15: `theme-color` changed from `#4CAF50` to maroon
- `manifest.json` line 8: `theme_color` changed from `#4CAF50` to maroon  
- `css/note.css` line 217: stray `padding-left` removed

---

### Task 4: README Update

#### [MODIFY] [README.md](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/README.md)

1. Add an **Appreciation** section after the "Feature Request:" section (after line ~520):
```markdown
## 🙏 Appreciation

Thanks to these individuals who helped with testing, suggestions and support.
```

2. Update the **Features** list (line ~11-23) to reference newer features: CR Notices, Activity Timeline, Google Classroom, Note Taking.

3. Update the **Project Structure** (line ~112-141) to include newer files: `cr-notice.js`, `calendar-view.js`, `timeline-*.js`, `classroom.js`, `notes.js`, `calendar.css`, `timeline.css`, etc.

---

### Task 5: Mobile Calendar Monthly View

#### [MODIFY] [calendar-view.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/calendar-view.js)

- Add `currentMobileView` state property (`'monthly'` | `'weekly'`), defaulting to `'monthly'`.
- In `renderCalendar()`: for mobile, check `currentMobileView` and call either `renderMonthlyViewMobile()` or `renderWeeklyView()`.
- **New method `renderMonthlyViewMobile()`**: Render a compact monthly grid with:
  - Day headers (S M T W T F S)
  - Date cells with dot indicators for dates that have tasks
  - Tap handler on each date to display tasks below the calendar
- Add toggle buttons (Monthly / Weekly) above the calendar grid on mobile.
- Consolidate the duplicate `isMobileView()` definitions.

#### [MODIFY] [calendar.css](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/css/calendar.css)

Add styles for:
- `.mobile-calendar-toggle` — toggle button row
- `.mobile-monthly-grid` — compact calendar grid
- `.mobile-date-cell` — individual date cells
- `.mobile-date-cell.has-tasks` — dot indicator styling
- `.mobile-date-cell.today` — highlight for today
- `.mobile-date-cell.selected` — selected date highlight
- `.mobile-task-list` — task list below calendar

---

## Verification Plan

### Manual Verification

Since this is a client-side SPA with no automated test framework in active use (tests exist only in `Archive/`), verification will be manual through the browser.

**Task 1 (Notice Deadline):**
1. Open the app in a browser, log in as a CR user
2. Open the Notices section → click "Add" to open Add Class Notice modal
3. Verify the deadline radio buttons appear (No Deadline selected by default)
4. Switch to "Set Deadline" → confirm datetime input becomes enabled
5. Submit the notice and verify it appears with the deadline displayed on the card
6. Edit the notice → verify deadline is pre-filled correctly
7. Change deadline to "No Deadline" and save → verify deadline is removed from card

**Task 2 (Mobile Radio Buttons):**
1. Open DevTools → toggle mobile viewport (≤768px)
2. Open the "Add Task" form
3. Verify the "No official Time limit" and "Set Deadline" radio buttons stack **vertically**
4. Same check for the "Edit Task" form

**Task 4 (README):**
1. Open `README.md` and verify the "Appreciation" section exists after "Feature Request:"
2. Confirm updated features list and project structure

**Task 5 (Mobile Calendar):**
1. Open DevTools → mobile viewport
2. Open Calendar View → verify it shows **Monthly view** by default
3. Verify toggle buttons (Monthly/Weekly) appear at top
4. Check dates with tasks have dot indicators
5. Tap a date → verify tasks display below the calendar
6. Switch to Weekly view → verify it renders correctly
7. Switch back to Monthly → verify state persists
