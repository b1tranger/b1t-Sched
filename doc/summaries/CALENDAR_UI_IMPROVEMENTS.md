# Calendar View UI Improvements

## Date: February 18, 2026

## Changes Made

### 1. Script Loading Order Fix
**Issue:** Calendar view showed "No tasks scheduled" even when tasks existed.

**Root Cause:** Script loading order issue - `calendar-view.js` loaded before `app.js`, so `window.App` was undefined when CalendarView tried to access it.

**Fix:**
- Moved `calendar-view.js` to load AFTER `app.js` in `index.html`
- New order: `app.js` (line 1384) → `calendar-view.js` (line 1385)

**Files Changed:**
- `index.html` (script loading order)

---

### 2. Show Course Title in Calendar Tasks
**Issue:** Calendar task items only showed task title, making it hard to identify which course the task belongs to.

**Implementation:**
- Modified `populateTasksInGrid()` method in `js/calendar-view.js`
- Created new container structure: badge + content container (course + title)
- Course name displayed prominently in bold
- Task title shown below course name in smaller, lighter text
- If no task title exists, only course name is shown

**Structure:**
```
[Badge] Course Name
        Task Title (optional)
```

**Files Changed:**
- `js/calendar-view.js` (lines ~550-580 in populateTasksInGrid method)
- `css/calendar.css` (added `.calendar-task-content`, `.calendar-task-course` styles)

---

### 3. Inline Calendar Button with Text Label
**Issue:** Calendar button was positioned below the "Pending Tasks" heading, taking up extra vertical space.

**Implementation:**
- Moved calendar button inside the `<h2>` element, right after "Pending Tasks" text
- Changed button class from `btn-icon` to `btn-text-icon`
- Added text label "Calendar View" next to the icon
- Text label hidden on mobile screens (<768px) to save space
- Button styled with maroon border, transparent background
- Hover effect: filled maroon background with white text

**Visual Result:**
```
Desktop: [Tasks Icon] Pending Tasks [Calendar Icon] Calendar View
Mobile:  [Tasks Icon] Pending Tasks [Calendar Icon]
```

**Files Changed:**
- `index.html` (moved button inside h2 tag, added span with text)
- `css/dashboard.css` (added inline button styling with responsive behavior)

---

## CSS Classes Added

### Calendar Task Display
- `.calendar-task-content` - Container for course + title
- `.calendar-task-course` - Course name styling (bold, primary text)
- `.calendar-task-content .calendar-task-title` - Task title when shown with course (lighter, smaller)

### Inline Calendar Button
- Styling for `#calendar-view-btn` when inside `.section-header h2`
- Responsive behavior to hide text label on mobile

---

## Testing Checklist

- [x] Calendar opens and displays tasks
- [ ] Tasks show course name prominently
- [ ] Task title appears below course name (when present)
- [ ] Calendar button appears inline with "Pending Tasks" heading
- [ ] Button shows "Calendar View" text on desktop
- [ ] Button shows only icon on mobile
- [ ] Button hover effect works correctly
- [ ] No layout issues or text overflow

---

## Browser Compatibility

All changes use standard CSS and JavaScript features compatible with:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Related Files

- `js/calendar-view.js` - Calendar rendering logic
- `js/app.js` - App initialization (exposes window.App)
- `index.html` - HTML structure and script loading
- `css/calendar.css` - Calendar-specific styles
- `css/dashboard.css` - Dashboard and section header styles
