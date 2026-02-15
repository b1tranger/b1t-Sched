# Implementation Plan - Refining Classroom Toggle

The goal is to fix the visibility and styling of the Google Classroom toggle button on mobile and ensure the desktop navigation button works as intended.

## User Review Required
> [!NOTE]
> I will be adjusting the positioning of the Google Classroom toggle to align visually with the existing Notice and Events toggles. I will assume a standard vertical gap based on the existing elements.

## Proposed Changes

### CSS Styling
#### [MODIFY] [classroom.css](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/css/classroom.css)
- Update `.classroom-toggle` to match `.notice-toggle` styling from `notice.css`.
- Use consistent `z-index` variables (check `colors.css` or `main.css`).
- Adjust `top` positioning to sit correctly below the Notice toggle.

### HTML Structure
#### [MODIFY] [index.html](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/index.html)
- Adjust inline styles for `#classroom-toggle` to align with the visual pattern (or remove inline styles if CSS handles it).
- Ensure the specific classes match the expectations of `classroom.js`.

### JavaScript Logic
#### [MODIFY] [classroom.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/classroom.js)
- Verify event listeners are attaching correctly (already looks good, but double-check).

## Verification Plan

### Manual Verification
- **Mobile View**:
    - resizing the window to < 768px.
    - Check if the "Classroom" toggle appears on the right edge.
    - Check if it is positioned below the "Notice" toggle with consistent spacing.
    - Click the toggle and verify the sidebar opens.
- **Desktop View**:
    - Resize window to > 992px.
    - Verify the "Classroom" toggle is hidden.
    - Verify the "Classroom" link in the top navigation bar is visible.
    - Click the navigation link and verify the Classroom modal opens.
