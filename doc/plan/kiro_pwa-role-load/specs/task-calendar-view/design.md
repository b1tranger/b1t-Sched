# Design Document: Task Calendar View

## Overview

The Task Calendar View feature provides users with a visual, date-based representation of their pending tasks. The feature is implemented as a modal overlay that displays a monthly calendar grid, with tasks positioned on their respective deadline dates. This design follows the existing application patterns for modals, task cards, and responsive layouts.

The calendar view serves as an alternative visualization to the linear task list, helping users understand their workload distribution across time. It filters tasks from the existing `App.currentTasks` array, displaying only those with valid deadline dates.

## Architecture

### Component Structure

The calendar view consists of the following components:

1. **Calendar Button**: A calendar icon button positioned next to the "Pending Tasks" header
2. **Calendar Modal**: An overlay modal containing the calendar interface
3. **Calendar Header**: Month/year display with navigation controls
4. **Calendar Grid**: A 7-column grid representing days of the week
5. **Calendar Cells**: Individual date cells containing task information
6. **Task Detail View**: A detail panel or modal showing full task information

### Integration Points

- **App.currentTasks**: The calendar reads from the existing task array without additional database queries
- **Task Filtering**: Reuses existing task filtering logic (by type, department, etc.)
- **Task Styling**: Reuses existing task card CSS classes and styling patterns
- **Modal System**: Follows the existing modal pattern used for add/edit task dialogs
- **Responsive Design**: Integrates with existing responsive breakpoints and mobile patterns

## Components and Interfaces

### CalendarView Class

```javascript
class CalendarView {
  constructor() {
    this.currentDate = new Date();
    this.displayedMonth = this.currentDate.getMonth();
    this.displayedYear = this.currentDate.getFullYear();
    this.modal = null;
    this.isOpen = false;
  }

  // Initialize the calendar view
  init() {
    this.createButton();
    this.createModal();
    this.attachEventListeners();
  }

  // Create the calendar icon button
  createButton() {
    // Insert button next to "Pending Tasks" header
    // Button HTML: <button id="calendar-view-btn" class="btn btn-icon" title="Calendar view">
    //   <i class="fas fa-calendar-alt"></i>
    // </button>
  }

  // Create the modal structure
  createModal() {
    // Create modal with:
    // - Modal overlay
    // - Modal content container
    // - Calendar header (month/year + navigation)
    // - Calendar grid container
    // - Close button
  }

  // Open the calendar modal
  open() {
    this.isOpen = true;
    this.modal.style.display = 'flex';
    this.renderCalendar();
    this.setFocus();
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  // Close the calendar modal
  close() {
    this.isOpen = false;
    this.modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
  }

  // Render the calendar grid
  renderCalendar() {
    const tasks = this.getTasksForMonth();
    const grid = this.generateCalendarGrid();
    this.populateTasksInGrid(grid, tasks);
    this.updateHeader();
  }

  // Get tasks with deadlines in the displayed month
  getTasksForMonth() {
    return App.currentTasks.filter(task => {
      if (!task.deadline) return false;
      const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
      return deadline.getMonth() === this.displayedMonth && 
             deadline.getFullYear() === this.displayedYear;
    });
  }

  // Generate calendar grid structure
  generateCalendarGrid() {
    const firstDay = new Date(this.displayedYear, this.displayedMonth, 1);
    const lastDay = new Date(this.displayedYear, this.displayedMonth + 1, 0);
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = lastDay.getDate();
    
    // Return grid data structure with dates
    return {
      startingDayOfWeek,
      daysInMonth,
      firstDay,
      lastDay
    };
  }

  // Populate tasks into calendar cells
  populateTasksInGrid(grid, tasks) {
    // Group tasks by date
    const tasksByDate = this.groupTasksByDate(tasks);
    
    // For each date in the month, render tasks
    // Handle overflow (>3 tasks per cell)
    // Apply overdue styling
  }

  // Group tasks by their deadline date (ignoring time)
  groupTasksByDate(tasks) {
    const grouped = {};
    tasks.forEach(task => {
      const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
      const dateKey = `${deadline.getFullYear()}-${deadline.getMonth()}-${deadline.getDate()}`;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(task);
    });
    return grouped;
  }

  // Navigate to previous month
  previousMonth() {
    this.displayedMonth--;
    if (this.displayedMonth < 0) {
      this.displayedMonth = 11;
      this.displayedYear--;
    }
    this.renderCalendar();
  }

  // Navigate to next month
  nextMonth() {
    this.displayedMonth++;
    if (this.displayedMonth > 11) {
      this.displayedMonth = 0;
      this.displayedYear++;
    }
    this.renderCalendar();
  }

  // Update month/year header
  updateHeader() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const headerText = `${monthNames[this.displayedMonth]} ${this.displayedYear}`;
    // Update header element
  }

  // Show task details
  showTaskDetails(taskId) {
    const task = App.currentTasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Reuse existing task card rendering
    // Display in a detail panel or modal
  }

  // Check if a task is overdue
  isTaskOverdue(task) {
    if (!task.deadline) return false;
    const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
    const isCompleted = App.userCompletions[task.id] || false;
    return deadline < this.currentDate && !isCompleted;
  }

  // Set focus to modal for accessibility
  setFocus() {
    this.modal.focus();
  }

  // Attach event listeners
  attachEventListeners() {
    // Calendar button click
    // Modal close button click
    // Overlay click (close modal)
    // Escape key press (close modal)
    // Navigation button clicks
    // Task click events
    // Keyboard navigation
  }

  // Handle task updates
  onTasksUpdated() {
    if (this.isOpen) {
      this.renderCalendar();
    }
  }
}
```

### HTML Structure

```html
<!-- Calendar View Button (inserted next to Pending Tasks header) -->
<button id="calendar-view-btn" class="btn btn-icon" title="Calendar view">
  <i class="fas fa-calendar-alt"></i>
</button>

<!-- Calendar Modal -->
<div id="calendar-modal" class="modal calendar-modal" style="display: none;" role="dialog" aria-modal="true" aria-labelledby="calendar-title">
  <div class="modal-content calendar-modal-content">
    <!-- Header -->
    <div class="calendar-header">
      <button class="calendar-nav-btn" id="calendar-prev-month" aria-label="Previous month">
        <i class="fas fa-chevron-left"></i>
      </button>
      <h2 id="calendar-title" class="calendar-month-year">January 2024</h2>
      <button class="calendar-nav-btn" id="calendar-next-month" aria-label="Next month">
        <i class="fas fa-chevron-right"></i>
      </button>
      <button class="btn btn-icon calendar-close-btn" aria-label="Close calendar">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid-container">
      <!-- Day headers -->
      <div class="calendar-day-headers">
        <div class="calendar-day-header">Sun</div>
        <div class="calendar-day-header">Mon</div>
        <div class="calendar-day-header">Tue</div>
        <div class="calendar-day-header">Wed</div>
        <div class="calendar-day-header">Thu</div>
        <div class="calendar-day-header">Fri</div>
        <div class="calendar-day-header">Sat</div>
      </div>

      <!-- Calendar grid (dynamically populated) -->
      <div class="calendar-grid" id="calendar-grid">
        <!-- Calendar cells will be inserted here -->
      </div>
    </div>

    <!-- Empty state -->
    <div id="calendar-empty-state" class="calendar-empty-state" style="display: none;">
      <i class="fas fa-calendar-check"></i>
      <p>No tasks scheduled for this month</p>
    </div>

    <!-- Loading state -->
    <div id="calendar-loading" class="calendar-loading" style="display: none;">
      <div class="loader"></div>
      <p>Loading calendar...</p>
    </div>
  </div>
</div>

<!-- Calendar Cell Template -->
<div class="calendar-cell" data-date="2024-01-15" role="gridcell" aria-label="January 15, 2024, 2 tasks">
  <div class="calendar-date-number">15</div>
  <div class="calendar-cell-tasks">
    <div class="calendar-task" data-task-id="task-123">
      <span class="task-type-badge assignment">A</span>
      <span class="calendar-task-title">Math Assignment</span>
    </div>
    <div class="calendar-task" data-task-id="task-124">
      <span class="task-type-badge exam">E</span>
      <span class="calendar-task-title">Physics Exam</span>
    </div>
    <div class="calendar-task-more">+1 more</div>
  </div>
</div>
```

## Data Models

### Task Object (Existing)

```javascript
{
  id: string,
  title: string,
  course: string,
  description: string,
  details: string,
  type: 'assignment' | 'homework' | 'exam' | 'project' | 'presentation' | 'other',
  deadline: Timestamp | Date | null,
  department: string,
  semester: string,
  section: string,
  addedBy: string,
  addedByName: string,
  addedByRole: string
}
```

### Calendar Grid Data Structure

```javascript
{
  year: number,
  month: number, // 0-11
  weeks: [
    {
      days: [
        {
          date: Date,
          dayNumber: number,
          isCurrentMonth: boolean,
          isToday: boolean,
          tasks: Task[]
        }
      ]
    }
  ]
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Modal Opens on Button Click
*For any* calendar view button click event, the calendar modal should become visible and display the current month.
**Validates: Requirements 1.2**

### Property 2: Modal Prevents Background Interaction
*For any* open calendar modal, clicking on elements behind the modal overlay should not trigger their actions.
**Validates: Requirements 1.3**

### Property 3: Modal Closes on Escape or Outside Click
*For any* open calendar modal, pressing the Escape key or clicking the overlay should close the modal.
**Validates: Requirements 1.4**

### Property 4: Calendar Grid Has Seven Columns
*For any* rendered calendar grid, it should contain exactly 7 columns representing the days of the week.
**Validates: Requirements 2.2**

### Property 5: All Month Dates Are Displayed
*For any* month and year, the calendar should display all dates from day 1 to the last day of that month.
**Validates: Requirements 2.3**

### Property 6: Today's Date Is Highlighted
*For any* calendar view displaying the current month, today's date cell should have a distinct highlight class or style.
**Validates: Requirements 2.4**

### Property 7: Adjacent Month Dates Are Muted
*For any* calendar grid containing dates from adjacent months, those dates should have a muted visual style distinct from current month dates.
**Validates: Requirements 2.5**

### Property 8: Month Navigation Updates Display
*For any* month displayed in the calendar, clicking the next or previous month button should update the calendar to show the adjacent month.
**Validates: Requirements 3.2, 3.3**

### Property 9: Header Updates with Month Navigation
*For any* month navigation action, the calendar header should update to display the new month and year.
**Validates: Requirements 3.4**

### Property 10: Tasks Filter by Displayed Month
*For any* month displayed in the calendar, only tasks with deadlines in that month should appear in the calendar grid.
**Validates: Requirements 3.5**

### Property 11: Only Tasks with Deadlines Appear
*For any* set of tasks in App.currentTasks, only tasks with non-null deadline values should appear in the calendar view.
**Validates: Requirements 4.1**

### Property 12: Tasks Group by Date
*For any* set of tasks with deadlines on the same date but different times, they should all appear in the same calendar cell.
**Validates: Requirements 4.3**

### Property 13: All Tasks for a Date Are Displayed
*For any* date with multiple tasks, all tasks should appear in that date's calendar cell (subject to overflow handling).
**Validates: Requirements 4.4**

### Property 14: Task Count Indicator Appears
*For any* calendar cell containing one or more tasks, a task count indicator should be visible.
**Validates: Requirements 5.1**

### Property 15: Task Titles Appear in Cells
*For any* task displayed in a calendar cell, its title should be visible within that cell.
**Validates: Requirements 5.2**

### Property 16: Long Titles Are Truncated
*For any* task with a title exceeding the cell width, the title should be truncated with an ellipsis.
**Validates: Requirements 5.3**

### Property 17: Overflow Tasks Show "+N More"
*For any* calendar cell with more than 3 tasks, the first 3 tasks should be displayed and a "+N more" indicator should show the count of remaining tasks.
**Validates: Requirements 5.4**

### Property 18: Task Type Badges Appear
*For any* task displayed in a calendar cell, its type badge should be visible.
**Validates: Requirements 5.5**

### Property 19: Overdue Tasks Are Classified Correctly
*For any* task with a deadline before the current date and time, and not marked as completed, it should be classified as overdue.
**Validates: Requirements 6.1**

### Property 20: Overdue Tasks Have Red Styling
*For any* overdue task displayed in the calendar, it should have red styling applied.
**Validates: Requirements 6.2**

### Property 21: Completed Tasks Are Not Shown as Overdue
*For any* task marked as completed, it should not have overdue styling regardless of its deadline.
**Validates: Requirements 6.3**

### Property 22: Mixed Cell Styling Is Correct
*For any* calendar cell containing both overdue and non-overdue tasks, overdue tasks should have red styling and non-overdue tasks should have normal styling.
**Validates: Requirements 6.4**

### Property 23: Task Click Shows Details
*For any* task displayed in the calendar, clicking it should display the full task details.
**Validates: Requirements 7.1**

### Property 24: Task Details Show All Fields
*For any* task detail view, it should display the task's title, course, description, deadline, and type.
**Validates: Requirements 7.2**

### Property 25: Responsive Layout on Mobile
*For any* viewport width less than 768px, the calendar should adjust its layout to fit the screen.
**Validates: Requirements 8.1**

### Property 26: Mobile Font Sizes Are Reduced
*For any* mobile viewport, the calendar should use reduced font sizes and padding compared to desktop.
**Validates: Requirements 8.2**

### Property 27: Mobile Modal Sizing
*For any* mobile viewport, the calendar modal should take up the full viewport or an appropriate portion.
**Validates: Requirements 8.3**

### Property 28: Touch-Friendly Button Sizes
*For any* interactive element in the mobile calendar view, it should have a minimum size of 44x44 pixels.
**Validates: Requirements 8.4**

### Property 29: Desktop Modal Is Centered
*For any* viewport width 768px or greater, the calendar modal should be centered with appropriate sizing.
**Validates: Requirements 8.5**

### Property 30: No Additional Database Queries
*For any* calendar view open action, no additional database queries should be made beyond the existing App.currentTasks data.
**Validates: Requirements 9.1**

### Property 31: Calendar Reflects Task Updates
*For any* update to App.currentTasks while the calendar is open, the calendar should reflect those changes.
**Validates: Requirements 9.2**

### Property 32: Empty State Shows for No Tasks
*For any* month with no tasks having deadlines, the calendar should display an empty state message.
**Validates: Requirements 9.4**

### Property 33: Focus Set on Modal Open
*For any* calendar modal open action, focus should be set to the modal container.
**Validates: Requirements 10.1**

### Property 34: Keyboard Navigation Works
*For any* interactive element in the calendar, users should be able to tab through them in logical order.
**Validates: Requirements 10.2**

### Property 35: ARIA Labels Are Present
*For any* navigation button or calendar cell, appropriate ARIA labels should be present.
**Validates: Requirements 10.4**

### Property 36: Screen Reader Text for Task Cells
*For any* calendar cell containing tasks, screen reader accessible text should indicate the date and number of tasks.
**Validates: Requirements 10.5**

## Error Handling

### Invalid Date Handling
- If a task has an invalid deadline format, log a warning and exclude it from the calendar
- Gracefully handle Firestore Timestamp conversion errors

### Missing Task Data
- If a task is missing required fields (title, course), display placeholder text
- Log warnings for data integrity issues

### Navigation Edge Cases
- Prevent navigation beyond reasonable date ranges (e.g., 100 years in past/future)
- Handle year transitions correctly (December → January, January → December)

### Responsive Breakpoint Handling
- Use CSS media queries for responsive behavior
- Provide fallback layouts if viewport detection fails

### Accessibility Errors
- If ARIA attributes fail to apply, log warnings but don't break functionality
- Ensure keyboard navigation works even if focus management has issues

## Testing Strategy

### Unit Tests

Unit tests should focus on specific examples, edge cases, and integration points:

1. **Calendar Button Rendering**
   - Test that the calendar button is inserted in the correct location
   - Test button has correct icon and accessibility attributes

2. **Modal Structure**
   - Test that modal HTML structure is created correctly
   - Test modal has correct ARIA attributes

3. **Date Calculations**
   - Test first day of month calculation for various months
   - Test last day of month calculation including leap years
   - Test day-of-week calculation for month start

4. **Task Filtering Edge Cases**
   - Test filtering with empty task array
   - Test filtering with all tasks having null deadlines
   - Test filtering with mixed deadline formats (Timestamp vs Date)

5. **Overflow Handling**
   - Test cell with exactly 3 tasks (no overflow)
   - Test cell with 4 tasks (shows "+1 more")
   - Test cell with 10 tasks (shows "+7 more")

6. **Overdue Classification Edge Cases**
   - Test task with deadline exactly at current time
   - Test task with deadline 1 second in the past
   - Test completed task with past deadline

7. **Month Navigation Edge Cases**
   - Test navigation from December to January (year increment)
   - Test navigation from January to December (year decrement)
   - Test navigation across multiple years

8. **Responsive Breakpoints**
   - Test layout at exactly 768px width
   - Test layout at 767px width (mobile)
   - Test layout at 769px width (desktop)

9. **Integration with App.currentTasks**
   - Test calendar updates when tasks are added
   - Test calendar updates when tasks are deleted
   - Test calendar updates when task deadlines are modified

### Property-Based Tests

Property-based tests should verify universal properties across all inputs. Each test should run a minimum of 100 iterations.

1. **Property 1: Modal Opens on Button Click**
   - Generate: Random initial calendar state
   - Action: Simulate button click
   - Assert: Modal is visible and displays current month
   - **Tag: Feature: task-calendar-view, Property 1: Modal Opens on Button Click**

2. **Property 3: Modal Closes on Escape or Outside Click**
   - Generate: Random calendar state with modal open
   - Action: Simulate Escape key or overlay click
   - Assert: Modal is hidden
   - **Tag: Feature: task-calendar-view, Property 3: Modal Closes on Escape or Outside Click**

3. **Property 5: All Month Dates Are Displayed**
   - Generate: Random month and year
   - Action: Render calendar for that month
   - Assert: All dates from 1 to last day of month are present
   - **Tag: Feature: task-calendar-view, Property 5: All Month Dates Are Displayed**

4. **Property 6: Today's Date Is Highlighted**
   - Generate: Random date as "today"
   - Action: Render calendar for current month
   - Assert: Today's cell has highlight class
   - **Tag: Feature: task-calendar-view, Property 6: Today's Date Is Highlighted**

5. **Property 8: Month Navigation Updates Display**
   - Generate: Random starting month
   - Action: Click next or previous month button
   - Assert: Calendar displays adjacent month
   - **Tag: Feature: task-calendar-view, Property 8: Month Navigation Updates Display**

6. **Property 11: Only Tasks with Deadlines Appear**
   - Generate: Random mix of tasks with and without deadlines
   - Action: Render calendar
   - Assert: Only tasks with non-null deadlines appear
   - **Tag: Feature: task-calendar-view, Property 11: Only Tasks with Deadlines Appear**

7. **Property 12: Tasks Group by Date**
   - Generate: Random tasks with same date but different times
   - Action: Render calendar
   - Assert: All tasks appear in the same cell
   - **Tag: Feature: task-calendar-view, Property 12: Tasks Group by Date**

8. **Property 17: Overflow Tasks Show "+N More"**
   - Generate: Random date with N > 3 tasks
   - Action: Render calendar cell
   - Assert: First 3 tasks shown, "+N more" indicator present with correct count
   - **Tag: Feature: task-calendar-view, Property 17: Overflow Tasks Show "+N More"**

9. **Property 19: Overdue Tasks Are Classified Correctly**
   - Generate: Random tasks with various deadlines relative to current time
   - Action: Classify each task
   - Assert: Tasks with past deadlines and not completed are marked overdue
   - **Tag: Feature: task-calendar-view, Property 19: Overdue Tasks Are Classified Correctly**

10. **Property 21: Completed Tasks Are Not Shown as Overdue**
    - Generate: Random completed tasks with past deadlines
    - Action: Render calendar
    - Assert: No overdue styling applied
    - **Tag: Feature: task-calendar-view, Property 21: Completed Tasks Are Not Shown as Overdue**

11. **Property 30: No Additional Database Queries**
    - Generate: Random task set in App.currentTasks
    - Action: Open calendar view
    - Assert: No database query functions called
    - **Tag: Feature: task-calendar-view, Property 30: No Additional Database Queries**

12. **Property 31: Calendar Reflects Task Updates**
    - Generate: Random initial task set
    - Action: Update App.currentTasks, verify calendar updates
    - Assert: Calendar displays updated tasks
    - **Tag: Feature: task-calendar-view, Property 31: Calendar Reflects Task Updates**

### Testing Tools

- **Unit Testing**: Jest or Mocha for JavaScript unit tests
- **Property-Based Testing**: fast-check library for JavaScript
- **DOM Testing**: jsdom or Testing Library for DOM manipulation tests
- **Accessibility Testing**: axe-core for automated accessibility checks
- **Visual Regression**: Percy or Chromatic for visual testing (optional)

### Test Configuration

- Minimum 100 iterations per property-based test
- Use consistent random seeds for reproducibility
- Mock Firestore Timestamp objects for testing
- Mock App.currentTasks and App.userCompletions for isolation
- Test across multiple viewport sizes (320px, 768px, 1024px, 1920px)
