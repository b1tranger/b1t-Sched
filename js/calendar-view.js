/**
 * Calendar View Module
 * Displays pending tasks in a monthly calendar layout
 */

class CalendarView {
  constructor() {
    this.currentDate = new Date();
    this.displayedMonth = this.currentDate.getMonth();
    this.displayedYear = this.currentDate.getFullYear();
    this.modal = null;
    this.isOpen = false;
  }

  /**
   * Initialize the calendar view
   */
  init() {
    // To be implemented in later tasks
  }

  /**
   * Create the calendar icon button
   */
  createButton() {
    // To be implemented in later tasks
  }

  /**
   * Create the modal structure
   */
  createModal() {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'calendar-modal';
    modal.className = 'modal calendar-modal';
    modal.style.display = 'none';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'calendar-title');
    modal.setAttribute('tabindex', '-1');

    // Create modal content container
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content calendar-modal-content';

    // Create calendar header
    const header = document.createElement('div');
    header.className = 'calendar-header';

    // Previous month button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'calendar-nav-btn';
    prevBtn.id = 'calendar-prev-month';
    prevBtn.setAttribute('aria-label', 'Previous month');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';

    // Month/year display
    const title = document.createElement('h2');
    title.id = 'calendar-title';
    title.className = 'calendar-month-year';
    title.textContent = 'January 2024';

    // Next month button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'calendar-nav-btn';
    nextBtn.id = 'calendar-next-month';
    nextBtn.setAttribute('aria-label', 'Next month');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-icon calendar-close-btn';
    closeBtn.setAttribute('aria-label', 'Close calendar');
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';

    // Assemble header
    header.appendChild(prevBtn);
    header.appendChild(title);
    header.appendChild(nextBtn);
    header.appendChild(closeBtn);

    // Create calendar grid container
    const gridContainer = document.createElement('div');
    gridContainer.className = 'calendar-grid-container';

    // Create day headers (Sun-Sat)
    const dayHeaders = document.createElement('div');
    dayHeaders.className = 'calendar-day-headers';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-day-header';
      dayHeader.textContent = day;
      dayHeaders.appendChild(dayHeader);
    });

    // Create calendar grid
    const grid = document.createElement('div');
    grid.className = 'calendar-grid';
    grid.id = 'calendar-grid';

    gridContainer.appendChild(dayHeaders);
    gridContainer.appendChild(grid);

    // Create empty state
    const emptyState = document.createElement('div');
    emptyState.id = 'calendar-empty-state';
    emptyState.className = 'calendar-empty-state';
    emptyState.style.display = 'none';
    emptyState.innerHTML = '<i class="fas fa-calendar-check"></i><p>No tasks scheduled for this month</p>';

    // Create loading state
    const loadingState = document.createElement('div');
    loadingState.id = 'calendar-loading';
    loadingState.className = 'calendar-loading';
    loadingState.style.display = 'none';
    loadingState.innerHTML = '<div class="loader"></div><p>Loading calendar...</p>';

    // Assemble modal
    modalContent.appendChild(header);
    modalContent.appendChild(gridContainer);
    modalContent.appendChild(emptyState);
    modalContent.appendChild(loadingState);
    modal.appendChild(modalContent);

    // Append to body
    document.body.appendChild(modal);

    // Store reference
    this.modal = modal;
  }

  /**
   * Open the calendar modal
   * Sets isOpen flag, shows modal, renders calendar, sets focus, and prevents background scrolling
   * Requirements: 1.2, 10.1
   */
  open() {
    // Set isOpen flag to true
    this.isOpen = true;

    // Show modal (display: flex)
    if (this.modal) {
      this.modal.style.display = 'flex';
    }

    // Call renderCalendar() to populate content
    this.renderCalendar();

    // Set focus to modal container for accessibility
    if (this.modal) {
      this.modal.focus();
    }

    // Prevent background scrolling (body overflow: hidden)
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close the calendar modal
   * Sets isOpen flag, hides modal, and restores background scrolling
   * Requirements: 1.4
   */
  close() {
    // Set isOpen flag to false
    this.isOpen = false;
    
    // Hide modal (display: none)
    if (this.modal) {
      this.modal.style.display = 'none';
    }
    
    // Restore background scrolling (body overflow: '')
    document.body.style.overflow = '';
  }

  /**
   * Generate calendar grid structure
   * @returns {Object} Grid data structure with dates and metadata
   */
  generateCalendarGrid() {
    // Calculate first and last day of displayed month
    const firstDay = new Date(this.displayedYear, this.displayedMonth, 1);
    const lastDay = new Date(this.displayedYear, this.displayedMonth + 1, 0);

    // Calculate starting day of week (0=Sunday)
    const startingDayOfWeek = firstDay.getDay();

    // Calculate number of days in month
    const daysInMonth = lastDay.getDate();

    // Generate array of date objects for the entire grid
    const dates = [];

    // Calculate dates from previous month to fill the first week
    const prevMonthLastDay = new Date(this.displayedYear, this.displayedMonth, 0);
    const prevMonthDays = prevMonthLastDay.getDate();

    // Add dates from previous month
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = new Date(this.displayedYear, this.displayedMonth - 1, day);
      dates.push({
        date: date,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: isToday(date),
        isAdjacentMonth: true
      });
    }

    // Add dates from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.displayedYear, this.displayedMonth, day);
      dates.push({
        date: date,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: isToday(date),
        isAdjacentMonth: false
      });
    }

    // Add dates from next month to complete the grid (up to 6 weeks)
    const totalCells = Math.ceil(dates.length / 7) * 7;
    let nextMonthDay = 1;
    while (dates.length < totalCells) {
      const date = new Date(this.displayedYear, this.displayedMonth + 1, nextMonthDay);
      dates.push({
        date: date,
        dayNumber: nextMonthDay,
        isCurrentMonth: false,
        isToday: isToday(date),
        isAdjacentMonth: true
      });
      nextMonthDay++;
    }

    // Return structured grid data
    return {
      startingDayOfWeek: startingDayOfWeek,
      daysInMonth: daysInMonth,
      firstDay: firstDay,
      lastDay: lastDay,
      dates: dates
    };
  }

  /**
   * Get tasks with deadlines in the displayed month
   * Filters App.currentTasks to include only tasks with valid deadlines in the current month
   * Requirements: 4.1, 4.2, 3.5
   * @returns {Array} Filtered array of tasks with deadlines in the displayed month
   */
  getTasksForMonth() {
    // Check if App.currentTasks exists (support both window and global for testing)
    const App = (typeof window !== 'undefined' ? window.App : global.App);
    if (!App || !Array.isArray(App.currentTasks)) {
      return [];
    }

    return App.currentTasks.filter(task => {
      // Filter out tasks with null or undefined deadlines
      if (!task.deadline) return false;

      // Filter out tasks with "No official Time limit" deadline
      if (task.deadline === "No official Time limit") return false;

      // Handle both Firestore Timestamp and JavaScript Date formats
      let deadline;
      try {
        deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
      } catch (error) {
        console.warn('Invalid deadline format for task:', task.id, error);
        return false;
      }

      // Check if deadline is in the displayed month and year
      return deadline.getMonth() === this.displayedMonth && 
             deadline.getFullYear() === this.displayedYear;
    });
  }

  /**
   * Check if a task is overdue
   * A task is overdue if its deadline is in the past and it's not marked as completed
   * Requirements: 6.1, 6.3
   * @param {Object} task - The task object to check
   * @returns {boolean} True if the task is overdue
   */
  isTaskOverdue(task) {
    if (!task.deadline) return false;

    // Handle both Firestore Timestamp and JavaScript Date formats
    let deadline;
    try {
      deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
    } catch (error) {
      return false;
    }

    // Check if task is marked as completed (support both window and global for testing)
    const App = (typeof window !== 'undefined' ? window.App : global.App);
    const isCompleted = App && App.userCompletions && App.userCompletions[task.id];

    // Task is overdue if deadline is past AND task is not completed
    return deadline < this.currentDate && !isCompleted;
  }

  /**
   * Populate tasks into calendar cells
   * Renders task elements in their corresponding date cells with overflow handling
   * Requirements: 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.4
   */
  populateTasksInGrid() {
    // Get tasks for the displayed month
    const tasks = this.getTasksForMonth();

    // Group tasks by date
    const tasksByDate = groupTasksByDate(tasks);

    // Get all calendar cells
    const cells = document.querySelectorAll('.calendar-cell');

    // For each calendar cell, find and render tasks for that date
    cells.forEach(cell => {
      const dateKey = cell.getAttribute('data-date');
      const cellTasks = tasksByDate[dateKey] || [];

      // Skip if no tasks for this date
      if (cellTasks.length === 0) return;

      // Create tasks container
      const tasksContainer = document.createElement('div');
      tasksContainer.className = 'calendar-cell-tasks';

      // Determine how many tasks to show (max 3)
      const maxVisible = 3;
      const visibleTasks = cellTasks.slice(0, maxVisible);
      const overflowCount = cellTasks.length - maxVisible;

      // Render visible tasks
      visibleTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'calendar-task';
        taskElement.setAttribute('data-task-id', task.id);

        // Apply overdue styling if task is overdue
        if (this.isTaskOverdue(task)) {
          taskElement.classList.add('calendar-task-overdue');
        }

        // Add task type badge
        const badge = document.createElement('span');
        badge.className = `task-type-badge ${task.type || 'other'}`;
        
        // Badge text based on task type
        const badgeText = {
          'assignment': 'A',
          'homework': 'H',
          'exam': 'E',
          'project': 'P',
          'presentation': 'Pr',
          'other': 'O'
        };
        badge.textContent = badgeText[task.type] || 'O';

        // Add task title
        const title = document.createElement('span');
        title.className = 'calendar-task-title';
        title.textContent = task.title || 'Untitled Task';
        title.setAttribute('title', task.title || 'Untitled Task'); // Full text on hover

        taskElement.appendChild(badge);
        taskElement.appendChild(title);

        // Add click event listener to show task details
        // Requirements: 7.1
        taskElement.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent cell selection
          this.showTaskDetails(task.id);
        });

        tasksContainer.appendChild(taskElement);
      });

      // Add overflow indicator if needed
      if (overflowCount > 0) {
        const overflowElement = document.createElement('div');
        overflowElement.className = 'calendar-task-more';
        overflowElement.textContent = `+${overflowCount} more`;
        tasksContainer.appendChild(overflowElement);
      }

      // Add task count indicator
      const countIndicator = document.createElement('div');
      countIndicator.className = 'calendar-task-count';
      countIndicator.textContent = cellTasks.length;
      cell.appendChild(countIndicator);

      // Append tasks container to cell
      cell.appendChild(tasksContainer);

      // Update ARIA label to include task count
      const currentLabel = cell.getAttribute('aria-label');
      cell.setAttribute('aria-label', `${currentLabel}, ${cellTasks.length} task${cellTasks.length !== 1 ? 's' : ''}`);
    });
  }

  /**
   * Render the calendar grid
   * Generates and displays the calendar cells for the current month
   * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.4, 9.4
   */
  renderCalendar() {
    // Get the calendar grid structure
    const gridData = this.generateCalendarGrid();

    // Get the calendar grid container
    const gridContainer = document.getElementById('calendar-grid');
    if (!gridContainer) {
      console.error('Calendar grid container not found');
      return;
    }

    // Clear existing calendar grid content
    gridContainer.innerHTML = '';

    // Create calendar cell elements for each date
    gridData.dates.forEach(dateInfo => {
      const cell = document.createElement('div');
      cell.className = 'calendar-cell';

      // Add date number to each cell
      const dateNumber = document.createElement('div');
      dateNumber.className = 'calendar-date-number';
      dateNumber.textContent = dateInfo.dayNumber;

      // Apply "today" highlight class to current date
      if (dateInfo.isToday) {
        cell.classList.add('calendar-cell-today');
      }

      // Apply muted styling to adjacent month dates
      if (dateInfo.isAdjacentMonth) {
        cell.classList.add('calendar-cell-adjacent');
      }

      // Set data attribute for the date
      const year = dateInfo.date.getFullYear();
      const month = String(dateInfo.date.getMonth() + 1).padStart(2, '0');
      const day = String(dateInfo.date.getDate()).padStart(2, '0');
      cell.setAttribute('data-date', `${year}-${month}-${day}`);

      // Add ARIA label for accessibility
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const ariaLabel = `${monthNames[dateInfo.date.getMonth()]} ${dateInfo.date.getDate()}, ${dateInfo.date.getFullYear()}`;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', ariaLabel);

      // Append date number to cell
      cell.appendChild(dateNumber);

      // Append cell to calendar grid container
      gridContainer.appendChild(cell);
    });

    // Call updateHeader() to show current month/year
    this.updateHeader();

    // Populate tasks in the grid after rendering calendar cells
    this.populateTasksInGrid();

    // Handle empty state - show if no tasks exist for the month
    const tasks = this.getTasksForMonth();
    const emptyState = document.getElementById('calendar-empty-state');
    const gridContainerElement = document.querySelector('.calendar-grid-container');
    
    if (emptyState && gridContainerElement) {
      if (tasks.length === 0) {
        emptyState.style.display = 'flex';
        gridContainerElement.style.display = 'none';
      } else {
        emptyState.style.display = 'none';
        gridContainerElement.style.display = 'block';
      }
    }
  }

  /**
   * Navigate to previous month
   * Decrements displayedMonth and handles year rollback
   * Requirements: 3.2
   */
  previousMonth() {
    this.displayedMonth--;
    if (this.displayedMonth < 0) {
      this.displayedMonth = 11;
      this.displayedYear--;
    }
    this.renderCalendar();
  }

  /**
   * Navigate to next month
   * Increments displayedMonth and handles year rollover
   * Requirements: 3.3
   */
  nextMonth() {
    this.displayedMonth++;
    if (this.displayedMonth > 11) {
      this.displayedMonth = 0;
      this.displayedYear++;
    }
    this.renderCalendar();
  }

  /**
   * Update month/year header
   * Updates the calendar header to display the current month and year
   * Also updates ARIA label for accessibility
   */
  updateHeader() {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Format header text as "Month Year"
    const headerText = `${monthNames[this.displayedMonth]} ${this.displayedYear}`;

    // Update header element
    const headerElement = document.getElementById('calendar-title');
    if (headerElement) {
      headerElement.textContent = headerText;

      // Update ARIA label for accessibility
      headerElement.setAttribute('aria-label', `Calendar showing ${headerText}`);
    }
  }

  /**
   * Show task details
   * Displays full task information when a task is clicked
   * Requirements: 7.1, 7.2, 7.3
   * @param {string} taskId - The ID of the task to display
   */
  showTaskDetails(taskId) {
    // Find task in App.currentTasks by task ID
    const App = (typeof window !== 'undefined' ? window.App : global.App);
    if (!App || !Array.isArray(App.currentTasks)) {
      console.error('App.currentTasks not available');
      return;
    }

    const task = App.currentTasks.find(t => t.id === taskId);
    if (!task) {
      console.error('Task not found:', taskId);
      return;
    }

    // Check if UI module exists and has showTaskDetails method
    if (typeof UI !== 'undefined' && typeof UI.showTaskDetails === 'function') {
      // Reuse existing task detail display from UI module
      UI.showTaskDetails(task);
    } else {
      // Fallback: create a simple detail view
      this.showSimpleTaskDetails(task);
    }
  }

  /**
   * Show simple task details (fallback)
   * Creates a basic detail view if UI.showTaskDetails is not available
   * Requirements: 7.2, 7.3
   * @param {Object} task - The task object to display
   */
  showSimpleTaskDetails(task) {
    // Create or get detail modal
    let detailModal = document.getElementById('calendar-task-detail-modal');
    
    if (!detailModal) {
      detailModal = document.createElement('div');
      detailModal.id = 'calendar-task-detail-modal';
      detailModal.className = 'modal calendar-task-detail-modal';
      detailModal.setAttribute('role', 'dialog');
      detailModal.setAttribute('aria-modal', 'true');
      detailModal.setAttribute('aria-labelledby', 'task-detail-title');
      detailModal.style.display = 'none';
      detailModal.style.zIndex = '10001'; // Higher than calendar modal
      document.body.appendChild(detailModal);
    }

    // Format deadline
    let deadlineStr = 'No deadline';
    let isOverdue = false;
    if (task.deadline) {
      const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
      deadlineStr = deadline.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      isOverdue = this.isTaskOverdue(task);
    }

    // Task type badge text
    const badgeText = {
      'assignment': 'Assignment',
      'homework': 'Homework',
      'exam': 'Exam',
      'project': 'Project',
      'presentation': 'Presentation',
      'other': 'Other'
    };

    // Create detail content with task card styling
    detailModal.innerHTML = `
      <div class="modal-content calendar-task-detail-content">
        <div class="calendar-task-detail-header">
          <h2 id="task-detail-title" class="task-detail-title">${task.title || 'Untitled Task'}</h2>
          <button class="btn btn-icon calendar-task-detail-close" id="close-task-detail" aria-label="Close task details">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="calendar-task-detail-body">
          <div class="task-detail-field">
            <div class="task-detail-label">
              <i class="fas fa-book"></i>
              <strong>Course</strong>
            </div>
            <div class="task-detail-value">${task.course || 'No course specified'}</div>
          </div>
          <div class="task-detail-field">
            <div class="task-detail-label">
              <i class="fas fa-tag"></i>
              <strong>Type</strong>
            </div>
            <div class="task-detail-value">
              <span class="task-type-badge ${task.type || 'other'}">${badgeText[task.type] || 'Other'}</span>
            </div>
          </div>
          <div class="task-detail-field">
            <div class="task-detail-label">
              <i class="fas fa-clock"></i>
              <strong>Deadline</strong>
            </div>
            <div class="task-detail-value ${isOverdue ? 'task-detail-overdue' : ''}">${deadlineStr}${isOverdue ? ' <span class="overdue-label">(Overdue!)</span>' : ''}</div>
          </div>
          ${task.description ? `
          <div class="task-detail-field task-detail-description">
            <div class="task-detail-label">
              <i class="fas fa-align-left"></i>
              <strong>Description</strong>
            </div>
            <div class="task-detail-value">${task.description}</div>
          </div>
          ` : ''}
          ${task.details ? `
          <div class="task-detail-field task-detail-description">
            <div class="task-detail-label">
              <i class="fas fa-info-circle"></i>
              <strong>Details</strong>
            </div>
            <div class="task-detail-value">${task.details}</div>
          </div>
          ` : ''}
          ${task.addedByName ? `
          <div class="task-detail-field task-detail-meta">
            <div class="task-detail-label">
              <i class="fas fa-user"></i>
              <strong>Added by</strong>
            </div>
            <div class="task-detail-value">
              ${task.addedByName}${task.addedByRole ? ` <span class="role-badge role-badge-${task.addedByRole.toLowerCase()}">${task.addedByRole}</span>` : ''}
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    `;

    // Show modal
    detailModal.style.display = 'flex';

    // Set focus to modal for accessibility
    detailModal.focus();

    // Add close button listener
    const closeBtn = document.getElementById('close-task-detail');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        detailModal.style.display = 'none';
      });
    }

    // Close on overlay click
    detailModal.addEventListener('click', (e) => {
      if (e.target === detailModal) {
        detailModal.style.display = 'none';
      }
    });

    // Close on Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        detailModal.style.display = 'none';
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  }

  /**
   * Attach event listeners for modal interactions
   * Sets up listeners for calendar button, close button, overlay, escape key, and navigation
   * Requirements: 1.2, 1.4, 10.3
   */
  attachEventListeners() {
    // Calendar button click → open()
    const calendarBtn = document.getElementById('calendar-view-btn');
    if (calendarBtn) {
      calendarBtn.addEventListener('click', () => this.open());
    }

    // Close button click → close()
    const closeBtn = document.querySelector('.calendar-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Overlay click (outside modal content) → close()
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        // Only close if clicking the overlay itself, not the modal content
        if (e.target === this.modal) {
          this.close();
        }
      });
    }

    // Escape key press → close()
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Previous month button click → previousMonth()
    const prevBtn = document.getElementById('calendar-prev-month');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousMonth());
    }

    // Next month button click → nextMonth()
    const nextBtn = document.getElementById('calendar-next-month');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextMonth());
    }
  }

}

// Date Utility Functions

/**
 * Get the first day of the month
 * @param {number} year - The year
 * @param {number} month - The month (0-11)
 * @returns {Date} The first day of the month
 */
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1);
}

/**
 * Get the last day of the month
 * @param {number} year - The year
 * @param {number} month - The month (0-11)
 * @returns {Date} The last day of the month
 */
function getLastDayOfMonth(year, month) {
  return new Date(year, month + 1, 0);
}

/**
 * Get the number of days in a month
 * @param {number} year - The year
 * @param {number} month - The month (0-11)
 * @returns {number} The number of days in the month
 */
function getDaysInMonth(year, month) {
  return getLastDayOfMonth(year, month).getDate();
}

/**
 * Check if a date is today
 * @param {Date} date - The date to check
 * @returns {boolean} True if the date is today
 */
function isToday(date) {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

/**
 * Group tasks by their deadline date (ignoring time component)
 * @param {Array} tasks - Array of task objects with deadline property
 * @returns {Object} Object with date keys in format "YYYY-MM-DD" and task arrays as values
 */
function groupTasksByDate(tasks) {
  const grouped = {};
  
  tasks.forEach(task => {
    if (!task.deadline) return;
    
    // Handle both Firestore Timestamp and JavaScript Date
    const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
    
    // Format date as YYYY-MM-DD
    const year = deadline.getFullYear();
    const month = String(deadline.getMonth() + 1).padStart(2, '0');
    const day = String(deadline.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(task);
  });
  
  return grouped;
}

// Export for ES modules (testing environment)
export {
  CalendarView,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getDaysInMonth,
  isToday,
  groupTasksByDate
};

// Also expose to global scope for browser environment
if (typeof window !== 'undefined') {
  window.CalendarView = CalendarView;
  window.getFirstDayOfMonth = getFirstDayOfMonth;
  window.getLastDayOfMonth = getLastDayOfMonth;
  window.getDaysInMonth = getDaysInMonth;
  window.isToday = isToday;
  window.groupTasksByDate = groupTasksByDate;
}
