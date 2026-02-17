# Implementation Plan: Task Calendar View

## Overview

This implementation plan breaks down the Task Calendar View feature into discrete, actionable coding tasks. The feature provides a modal-based monthly calendar interface that displays pending tasks on their deadline dates. The implementation builds incrementally, starting with core UI structure, then adding calendar rendering logic, task integration, and finally responsive design and accessibility features.

The calendar view integrates with the existing `App.currentTasks` array and reuses existing task card styling patterns. All tasks reference specific requirements from the requirements document for traceability.

## Tasks

- [ ] 1. Set up calendar view module structure and initialize button
  - [x] 1.1 Create calendar button in the Pending Tasks section header
    - Insert calendar icon button next to "Pending Tasks" heading
    - Add Font Awesome calendar icon (`fa-calendar-alt`)
    - Apply existing button styling classes (`btn btn-icon`)
    - Add accessibility attributes (title, aria-label)
    - _Requirements: 1.1_

  - [x] 1.2 Implement CalendarView.init() method
    - Call createButton() to insert the calendar button
    - Call createModal() to build modal structure
    - Call attachEventListeners() to wire up interactions
    - Initialize on page load after DOM is ready
    - _Requirements: 1.1_

  - [ ]* 1.3 Write unit tests for button creation
    - Test button is inserted in correct location
    - Test button has correct icon and classes
    - Test button has accessibility attributes
    - _Requirements: 1.1_

- [ ] 2. Build calendar modal structure and styling
  - [x] 2.1 Implement CalendarView.createModal() method
    - Create modal overlay with backdrop
    - Create modal content container
    - Add calendar header with month/year display
    - Add previous/next month navigation buttons
    - Add close button with icon
    - Add calendar grid container with day headers (Sun-Sat)
    - Add empty state and loading state elements
    - Set initial display to hidden
    - _Requirements: 1.2, 2.1, 2.2, 3.1_

  - [x] 2.2 Create CSS styles for calendar modal
    - Style modal overlay (full viewport, semi-transparent backdrop)
    - Style modal content (centered, appropriate width/height)
    - Style calendar header (flexbox layout, navigation buttons)
    - Style calendar grid (7-column CSS Grid layout)
    - Style day headers (Sun-Sat labels)
    - Style calendar cells (border, padding, hover effects)
    - Add responsive breakpoints for mobile (<768px) and desktop (>=768px)
    - _Requirements: 1.2, 2.2, 8.1, 8.2, 8.3, 8.5_

  - [ ]* 2.3 Write unit tests for modal structure
    - Test modal HTML structure is created correctly
    - Test modal has correct ARIA attributes (role="dialog", aria-modal="true")
    - Test modal is initially hidden
    - _Requirements: 1.2_

- [ ] 3. Implement modal open/close functionality
  - [x] 3.1 Implement CalendarView.open() method
    - Set isOpen flag to true
    - Show modal (display: flex)
    - Call renderCalendar() to populate content
    - Set focus to modal container for accessibility
    - Prevent background scrolling (body overflow: hidden)
    - _Requirements: 1.2, 10.1_

  - [x] 3.2 Implement CalendarView.close() method
    - Set isOpen flag to false
    - Hide modal (display: none)
    - Restore background scrolling (body overflow: '')
    - _Requirements: 1.4_

  - [x] 3.3 Implement event listeners for modal interactions
    - Calendar button click → open()
    - Close button click → close()
    - Overlay click (outside modal content) → close()
    - Escape key press → close()
    - _Requirements: 1.2, 1.4, 10.3_

  - [ ]* 3.4 Write property test for modal open/close behavior
    - **Property 1: Modal Opens on Button Click**
    - **Property 3: Modal Closes on Escape or Outside Click**
    - **Validates: Requirements 1.2, 1.4**

- [ ] 4. Implement calendar grid generation
  - [x] 4.1 Implement CalendarView.generateCalendarGrid() method
    - Calculate first day of displayed month
    - Calculate last day of displayed month
    - Calculate starting day of week (0=Sunday)
    - Calculate number of days in month
    - Generate array of date objects for the month
    - Include dates from previous/next months to fill grid rows
    - Mark dates as current month, adjacent month, or today
    - Return structured grid data
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [x] 4.2 Implement CalendarView.renderCalendar() method
    - Call generateCalendarGrid() to get grid structure
    - Clear existing calendar grid content
    - Create calendar cell elements for each date
    - Add date number to each cell
    - Apply "today" highlight class to current date
    - Apply muted styling to adjacent month dates
    - Append cells to calendar grid container
    - Call updateHeader() to show current month/year
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 4.3 Write unit tests for calendar grid generation
    - Test first day calculation for various months
    - Test last day calculation including leap years
    - Test day-of-week calculation for month start
    - Test grid includes all dates from 1 to last day of month
    - _Requirements: 2.3_

  - [ ]* 4.4 Write property tests for calendar grid
    - **Property 4: Calendar Grid Has Seven Columns**
    - **Property 5: All Month Dates Are Displayed**
    - **Property 6: Today's Date Is Highlighted**
    - **Property 7: Adjacent Month Dates Are Muted**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5**

- [ ] 5. Implement month navigation
  - [x] 5.1 Implement CalendarView.previousMonth() method
    - Decrement displayedMonth
    - Handle year rollback (month < 0 → month = 11, year--)
    - Call renderCalendar() to update display
    - _Requirements: 3.2_

  - [x] 5.2 Implement CalendarView.nextMonth() method
    - Increment displayedMonth
    - Handle year rollover (month > 11 → month = 0, year++)
    - Call renderCalendar() to update display
    - _Requirements: 3.3_

  - [x] 5.3 Implement CalendarView.updateHeader() method
    - Format month name from displayedMonth (use month names array)
    - Update header text to show "Month Year" format
    - Update ARIA label for accessibility
    - _Requirements: 3.4_

  - [x] 5.4 Add event listeners for navigation buttons
    - Previous month button click → previousMonth()
    - Next month button click → nextMonth()
    - Add keyboard navigation support (arrow keys)
    - _Requirements: 3.2, 3.3, 10.2_

  - [ ]* 5.5 Write unit tests for month navigation edge cases
    - Test navigation from December to January (year increment)
    - Test navigation from January to December (year decrement)
    - Test navigation across multiple years
    - _Requirements: 3.2, 3.3_

  - [ ]* 5.6 Write property tests for month navigation
    - **Property 8: Month Navigation Updates Display**
    - **Property 9: Header Updates with Month Navigation**
    - **Validates: Requirements 3.2, 3.3, 3.4**

- [ ] 6. Implement task filtering and display
  - [x] 6.1 Implement CalendarView.getTasksForMonth() method
    - Filter App.currentTasks to include only tasks with non-null deadlines
    - Filter to include only tasks with deadlines in displayedMonth and displayedYear
    - Handle both Firestore Timestamp and JavaScript Date formats
    - Return filtered task array
    - _Requirements: 4.1, 4.2, 3.5_

  - [x] 6.2 Implement CalendarView.populateTasksInGrid() method
    - Call getTasksForMonth() to get tasks for displayed month
    - Call groupTasksByDate() to group tasks by date
    - For each calendar cell, find tasks for that date
    - Render task elements in the cell
    - Handle overflow (>3 tasks per cell) with "+N more" indicator
    - Apply task type badges (assignment, exam, project, etc.)
    - Apply overdue styling to tasks with past deadlines
    - _Requirements: 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.4_

  - [x] 6.3 Integrate task population into renderCalendar()
    - Call populateTasksInGrid() after rendering calendar cells
    - Show empty state if no tasks exist for the month
    - _Requirements: 4.4, 9.4_

  - [ ]* 6.4 Write unit tests for task filtering edge cases
    - Test filtering with empty task array
    - Test filtering with all tasks having null deadlines
    - Test filtering with mixed deadline formats (Timestamp vs Date)
    - _Requirements: 4.1, 4.2_

  - [ ]* 6.5 Write property tests for task filtering and display
    - **Property 10: Tasks Filter by Displayed Month**
    - **Property 11: Only Tasks with Deadlines Appear**
    - **Property 13: All Tasks for a Date Are Displayed**
    - **Validates: Requirements 3.5, 4.1, 4.4**

- [ ] 7. Implement task overflow and visual indicators
  - [x] 7.1 Add task count indicator to calendar cells
    - Display count badge when cell has tasks
    - Position badge in cell (e.g., top-right corner)
    - Style badge with background color and padding
    - _Requirements: 5.1_

  - [x] 7.2 Implement task overflow handling
    - Limit visible tasks to 3 per cell
    - Calculate remaining task count (total - 3)
    - Display "+N more" indicator for overflow
    - Style overflow indicator distinctly
    - _Requirements: 5.4_

  - [x] 7.3 Implement task title truncation
    - Apply CSS text-overflow: ellipsis to task titles
    - Set max-width or use flexbox to constrain width
    - Add title attribute for full text on hover
    - _Requirements: 5.3_

  - [x]* 7.4 Write unit tests for overflow handling
    - Test cell with exactly 3 tasks (no overflow)
    - Test cell with 4 tasks (shows "+1 more")
    - Test cell with 10 tasks (shows "+7 more")
    - _Requirements: 5.4_

  - [x]* 7.5 Write property test for overflow display
    - **Property 17: Overflow Tasks Show "+N More"**
    - **Validates: Requirements 5.4**

- [ ] 8. Implement overdue task detection and styling
  - [x] 8.1 Implement CalendarView.isTaskOverdue() method
    - Check if task deadline is before current date/time
    - Check if task is marked as completed in App.userCompletions
    - Return true only if deadline is past AND task is not completed
    - Handle both Firestore Timestamp and JavaScript Date formats
    - _Requirements: 6.1, 6.3_

  - [x] 8.2 Apply overdue styling in populateTasksInGrid()
    - Call isTaskOverdue() for each task
    - Add "overdue" CSS class to overdue task elements
    - Style overdue tasks with red color/background
    - Ensure non-overdue tasks in same cell have normal styling
    - _Requirements: 6.2, 6.4_

  - [ ]* 8.3 Write unit tests for overdue classification edge cases
    - Test task with deadline exactly at current time
    - Test task with deadline 1 second in the past
    - Test completed task with past deadline (should not be overdue)
    - _Requirements: 6.1, 6.3_

  - [ ]* 8.4 Write property tests for overdue task handling
    - **Property 19: Overdue Tasks Are Classified Correctly**
    - **Property 21: Completed Tasks Are Not Shown as Overdue**
    - **Validates: Requirements 6.1, 6.3**

- [ ] 9. Implement task detail view
  - [x] 9.1 Implement CalendarView.showTaskDetails() method
    - Find task in App.currentTasks by task ID
    - Create or show task detail panel/modal
    - Display task title, course, description, deadline, and type
    - Reuse existing task card rendering/styling
    - Provide close button to return to calendar view
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 9.2 Add click event listeners to task elements
    - Attach click handler to each task element in calendar cells
    - Pass task ID to showTaskDetails()
    - Ensure click events don't interfere with cell selection
    - _Requirements: 7.1_

  - [ ]* 9.3 Write unit tests for task detail display
    - Test task details show all required fields
    - Test detail view opens when task is clicked
    - Test detail view closes when close button is clicked
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 9.4 Write property test for task interaction
    - **Property 23: Task Click Shows Details**
    - **Property 24: Task Details Show All Fields**
    - **Validates: Requirements 7.1, 7.2**

- [ ] 10. Implement responsive design
  - [x] 10.1 Add mobile-specific CSS styles
    - Reduce font sizes for mobile (<768px)
    - Reduce padding and margins for mobile
    - Make modal full-width or near-full-width on mobile
    - Adjust calendar cell sizes for smaller screens
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 10.2 Ensure touch-friendly button sizes
    - Set minimum button size to 44x44px
    - Add appropriate touch target spacing
    - Test on mobile devices or emulators
    - _Requirements: 8.4_

  - [x] 10.3 Add desktop-specific CSS styles
    - Center modal on desktop (>=768px)
    - Set appropriate modal width (e.g., 90% max-width 1200px)
    - Use larger font sizes and spacing
    - _Requirements: 8.5_

  - [ ]* 10.4 Write unit tests for responsive breakpoints
    - Test layout at exactly 768px width
    - Test layout at 767px width (mobile)
    - Test layout at 769px width (desktop)
    - _Requirements: 8.1, 8.5_

  - [ ]* 10.5 Write property tests for responsive design
    - **Property 25: Responsive Layout on Mobile**
    - **Property 29: Desktop Modal Is Centered**
    - **Validates: Requirements 8.1, 8.5**

- [ ] 11. Implement accessibility features
  - [x] 11.1 Add ARIA labels and roles
    - Add role="dialog" and aria-modal="true" to modal
    - Add aria-label to navigation buttons ("Previous month", "Next month")
    - Add aria-label to close button ("Close calendar")
    - Add aria-label to calendar cells with date and task count
    - Update aria-labelledby for modal title
    - _Requirements: 10.4, 10.5_

  - [x] 11.2 Implement keyboard navigation
    - Ensure tab order is logical (header → grid → close button)
    - Add keyboard support for navigation (arrow keys optional)
    - Ensure all interactive elements are keyboard accessible
    - Test with keyboard-only navigation
    - _Requirements: 10.2_

  - [x] 11.3 Implement focus management
    - Set focus to modal container when opened
    - Trap focus within modal while open
    - Restore focus to calendar button when closed
    - _Requirements: 10.1_

  - [ ]* 11.4 Write unit tests for accessibility
    - Test ARIA attributes are present on all required elements
    - Test focus is set to modal on open
    - Test keyboard navigation works (tab, escape)
    - _Requirements: 10.1, 10.2, 10.4, 10.5_

  - [ ]* 11.5 Write property tests for accessibility
    - **Property 33: Focus Set on Modal Open**
    - **Property 34: Keyboard Navigation Works**
    - **Property 35: ARIA Labels Are Present**
    - **Validates: Requirements 10.1, 10.2, 10.4**

- [ ] 12. Implement data loading and updates
  - [x] 12.1 Implement CalendarView.onTasksUpdated() method
    - Check if calendar is currently open (isOpen flag)
    - If open, call renderCalendar() to refresh display
    - Handle task additions, edits, and deletions
    - _Requirements: 9.2_

  - [x] 12.2 Integrate with App.currentTasks updates
    - Hook into existing task update events/callbacks
    - Call onTasksUpdated() when App.currentTasks changes
    - Ensure no additional database queries are made
    - _Requirements: 9.1, 9.2_

  - [x] 12.3 Add loading state handling
    - Show loading indicator when calendar is rendering
    - Hide loading indicator when rendering is complete
    - Handle errors gracefully (log warnings, show error state)
    - _Requirements: 9.3_

  - [x] 12.4 Add empty state handling
    - Check if any tasks exist for displayed month
    - Show empty state message if no tasks
    - Hide empty state when tasks are present
    - _Requirements: 9.4_

  - [ ]* 12.5 Write unit tests for data loading
    - Test calendar uses existing App.currentTasks data
    - Test calendar updates when tasks are added
    - Test calendar updates when tasks are deleted
    - Test calendar updates when task deadlines are modified
    - _Requirements: 9.1, 9.2_

  - [ ]* 12.6 Write property tests for data handling
    - **Property 30: No Additional Database Queries**
    - **Property 31: Calendar Reflects Task Updates**
    - **Property 32: Empty State Shows for No Tasks**
    - **Validates: Requirements 9.1, 9.2, 9.4**

- [ ] 13. Final integration and polish
  - [x] 13.1 Integrate calendar view into main application
    - Import CalendarView module in main app file
    - Initialize calendar view after DOM is ready
    - Ensure calendar works with existing task management features
    - Test with real task data from Firestore
    - _Requirements: All_

  - [x] 13.2 Add error handling and edge cases
    - Handle invalid date formats gracefully
    - Handle missing task data (show placeholders)
    - Prevent navigation beyond reasonable date ranges
    - Log warnings for data integrity issues
    - _Requirements: All_

  - [x] 13.3 Perform cross-browser testing
    - Test in Chrome, Firefox, Safari, Edge
    - Test on iOS and Android devices
    - Fix any browser-specific issues
    - _Requirements: All_

  - [ ]* 13.4 Write integration tests
    - Test full user flow: open calendar → navigate months → click task → view details → close
    - Test calendar with various task data scenarios
    - Test responsive behavior at different viewport sizes
    - _Requirements: All_

- [x] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property-based tests should run a minimum of 100 iterations
- The calendar view reuses existing App.currentTasks data without additional database queries
- All styling should follow existing application patterns and responsive breakpoints
- Accessibility is a core requirement, not an afterthought
- The implementation builds incrementally: UI structure → calendar logic → task integration → polish
