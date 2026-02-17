/**
 * Calendar View Module
 * Displays pending tasks in a monthly calendar layout
 */

class CalendarView {
  constructor() {
      // Current date for reference
      this.currentDate = new Date();

      // Displayed month and year (can be different from current)
      this.displayedMonth = this.currentDate.getMonth();
      this.displayedYear = this.currentDate.getFullYear();

      // Modal reference
      this.modal = null;

      // Open state flag
      this.isOpen = false;

      // Store the element that had focus before modal opened
      this.previouslyFocusedElement = null;

      // Store bound event handler for focus trap
      this.handleFocusTrap = this.trapFocus.bind(this);

      // Date navigation limits (prevent navigation beyond reasonable ranges)
      // Allow navigation 100 years in the past and future
      this.minYear = this.currentDate.getFullYear() - 100;
      this.maxYear = this.currentDate.getFullYear() + 100;
    }


  /**
   * Initialize the calendar view
   * Calls createButton(), createModal(), and attachEventListeners()
   * Should be called after DOM is ready
   * Requirements: 1.1
   */
  init() {
    // Call createButton() to insert the calendar button (if not already present)
    this.createButton();
    
    // Call createModal() to build modal structure
    this.createModal();
    
    // Call attachEventListeners() to wire up interactions
    this.attachEventListeners();
  }

  /**
   * Create the calendar icon button
   * Inserts button next to "Pending Tasks" header if not already present
   * Requirements: 1.1
   */
  createButton() {
    // Check if button already exists
    const existingBtn = document.getElementById('calendar-view-btn');
    if (existingBtn) {
      // Button already exists (e.g., in HTML), no need to create
      return;
    }

    // Find the Pending Tasks section header
    const sectionHeaders = document.querySelectorAll('.section-header h2');
    let pendingTasksHeader = null;
    
    for (const header of sectionHeaders) {
      if (header.textContent.includes('Pending Tasks')) {
        pendingTasksHeader = header.parentElement;
        break;
      }
    }

    if (!pendingTasksHeader) {
      console.warn('Pending Tasks section header not found, cannot insert calendar button');
      return;
    }

    // Create calendar button
    const button = document.createElement('button');
    button.id = 'calendar-view-btn';
    button.className = 'btn btn-icon';
    button.setAttribute('title', 'Calendar view');
    button.setAttribute('aria-label', 'Open calendar view');
    button.innerHTML = '<i class="fas fa-calendar-alt"></i>';

    // Insert button into the section header
    pendingTasksHeader.appendChild(button);
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
    prevBtn.setAttribute('tabindex', '0');
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
    nextBtn.setAttribute('tabindex', '0');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-icon calendar-close-btn';
    closeBtn.setAttribute('aria-label', 'Close calendar');
    closeBtn.setAttribute('tabindex', '0');
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
    grid.setAttribute('role', 'grid');
    grid.setAttribute('aria-label', 'Calendar grid');

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
      console.log('Calendar open() called');
      console.log('Modal exists:', !!this.modal);
      
      // Store the currently focused element to restore later
      this.previouslyFocusedElement = document.activeElement;

      // Set isOpen flag to true
      this.isOpen = true;

      // Show modal (display: flex)
      if (this.modal) {
        console.log('Setting modal display to flex');
        this.modal.style.display = 'flex';
      } else {
        console.error('Modal element not found!');
        return;
      }

      // Show loading indicator before rendering
      this.showLoading();

      // Call renderCalendar() to populate content
      try {
        this.renderCalendar();
        // Hide loading indicator when rendering is complete
        this.hideLoading();
      } catch (error) {
        // Handle errors gracefully - log warning and show error state
        console.warn('Error rendering calendar:', error);
        this.hideLoading();
        this.showError();
      }

      // Set focus to modal container for accessibility
      if (this.modal) {
        this.modal.focus();
      }

      // Add focus trap event listener
      document.addEventListener('keydown', this.handleFocusTrap);

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
    
    // Remove focus trap event listener
    document.removeEventListener('keydown', this.handleFocusTrap);
    
    // Restore focus to the calendar button
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
      this.previouslyFocusedElement = null;
    }
    
    // Restore background scrolling (body overflow: '')
    document.body.style.overflow = '';
  }

  /**
   * Trap focus within the modal
   * Prevents tabbing outside the modal while it's open
   * Requirements: 10.1
   */
  trapFocus(e) {
    // Only trap focus when modal is open
    if (!this.isOpen || !this.modal) return;
    
    // Only handle Tab key
    if (e.key !== 'Tab') return;
    
    // Get all focusable elements within the modal
    const focusableElements = this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // If Shift+Tab on first element, move to last element
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    }
    // If Tab on last element, move to first element
    else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
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
   * Handles invalid date formats gracefully and logs warnings for data integrity issues
   * Requirements: 4.1, 4.2, 3.5
   * @returns {Array} Filtered array of tasks with deadlines in the displayed month
   */
  getTasksForMonth() {
    // Check if App.currentTasks exists (support both window and global for testing)
    const App = (typeof window !== 'undefined' ? window.App : global.App);
    
    console.log('[CalendarView] getTasksForMonth called');
    console.log('[CalendarView] App exists:', !!App);
    console.log('[CalendarView] App.currentTasks exists:', !!App?.currentTasks);
    console.log('[CalendarView] App.currentTasks length:', App?.currentTasks?.length);
    console.log('[CalendarView] Displayed month:', this.displayedMonth, 'year:', this.displayedYear);
    
    if (!App || !Array.isArray(App.currentTasks)) {
      console.warn('[CalendarView] App.currentTasks not available');
      return [];
    }

    const filteredTasks = App.currentTasks.filter(task => {
      console.log('[CalendarView] Checking task:', task.id, 'deadline:', task.deadline);
      
      // Filter out tasks with null or undefined deadlines
      if (!task.deadline) {
        console.log('[CalendarView] Task has no deadline:', task.id);
        return false;
      }

      // Filter out tasks with "No official Time limit" deadline
      if (task.deadline === "No official Time limit") {
        console.log('[CalendarView] Task has no time limit:', task.id);
        return false;
      }

      // Handle both Firestore Timestamp and JavaScript Date formats
      let deadline;
      try {
        deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
        
        // Validate that the deadline is a valid date
        if (isNaN(deadline.getTime())) {
          console.warn('[CalendarView] Invalid deadline format for task:', task.id, 'deadline:', task.deadline);
          return false;
        }
        
        console.log('[CalendarView] Task deadline parsed:', task.id, 'date:', deadline, 'month:', deadline.getMonth(), 'year:', deadline.getFullYear());
      } catch (error) {
        console.warn('[CalendarView] Error parsing deadline for task:', task.id, 'error:', error.message);
        return false;
      }

      // Check if deadline is in the displayed month and year
      const matches = deadline.getMonth() === this.displayedMonth && 
             deadline.getFullYear() === this.displayedYear;
      
      console.log('[CalendarView] Task matches month/year:', task.id, matches);
      
      return matches;
    });
    
    console.log('[CalendarView] Filtered tasks count:', filteredTasks.length);
    return filteredTasks;
  }

  /**
   * Check if a task is overdue
   * A task is overdue if its deadline is in the past and it's not marked as completed
   * Handles invalid date formats gracefully
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
      
      // Validate that the deadline is a valid date
      if (isNaN(deadline.getTime())) {
        console.warn('Invalid deadline format for overdue check, task:', task.id);
        return false;
      }
    } catch (error) {
      console.warn('Error parsing deadline for overdue check, task:', task.id, 'error:', error.message);
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
        taskElement.setAttribute('tabindex', '0');
        taskElement.setAttribute('role', 'button');
        
        // Handle missing task data with placeholders
        const taskTitle = task.title || 'Untitled Task';
        const taskType = task.type || 'other';
        const taskCourse = task.course || 'Unknown course';
        
        // Log warning for missing critical data
        if (!task.title) {
          console.warn('Task missing title, task ID:', task.id);
        }
        if (!task.course) {
          console.warn('Task missing course, task ID:', task.id);
        }
        
        taskElement.setAttribute('aria-label', `${taskTitle}, ${taskType} for ${taskCourse}`);

        // Apply overdue styling if task is overdue
        if (this.isTaskOverdue(task)) {
          taskElement.classList.add('calendar-task-overdue');
        }

        // Add task type badge
        const badge = document.createElement('span');
        badge.className = `task-type-badge ${taskType}`;
        badge.setAttribute('aria-hidden', 'true');
        
        // Badge text based on task type
        const badgeText = {
          'assignment': 'A',
          'homework': 'H',
          'exam': 'E',
          'project': 'P',
          'presentation': 'Pr',
          'other': 'O'
        };
        badge.textContent = badgeText[taskType] || 'O';

        // Add task content container (course + title)
        const contentContainer = document.createElement('div');
        contentContainer.className = 'calendar-task-content';

        // Add course name
        const course = document.createElement('span');
        course.className = 'calendar-task-course';
        course.textContent = taskCourse;
        course.setAttribute('title', taskCourse); // Full text on hover

        // Add task title (if exists)
        if (taskTitle && taskTitle !== 'Untitled Task') {
          const title = document.createElement('span');
          title.className = 'calendar-task-title';
          title.textContent = taskTitle;
          title.setAttribute('title', taskTitle); // Full text on hover
          contentContainer.appendChild(course);
          contentContainer.appendChild(title);
        } else {
          // Only show course if no title
          contentContainer.appendChild(course);
        }

        taskElement.appendChild(badge);
        taskElement.appendChild(contentContainer);

        // Add click event listener to show task details
        // Requirements: 7.1
        taskElement.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent cell selection
          this.showTaskDetails(task.id);
        });

        // Add keyboard event listener for Enter and Space keys
        // Requirements: 10.2 - Keyboard accessibility
        taskElement.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            this.showTaskDetails(task.id);
          }
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
   * Check if current view is mobile
   * @returns {boolean} True if viewport width is less than 768px
   */
  isMobileView() {
    return window.innerWidth < 768;
  }

  /**
   * Render the calendar grid
   * Generates and displays the calendar cells for the current month
   * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.4, 9.4
   */
  renderCalendar() {
    // Check if mobile view and render weekly view instead
    if (this.isMobileView()) {
      this.renderWeeklyView();
      return;
    }
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
   * Check if current view is mobile
   * @returns {boolean} True if viewport width is less than 768px
   */
  isMobileView() {
    return window.innerWidth < 768;
  }

  /**
   * Render weekly view for mobile
   * Displays weeks horizontally with scroll-snap
   */
  renderWeeklyView() {
    const gridContainer = document.querySelector('.calendar-grid-container');
    if (!gridContainer) {
      console.error('Calendar grid container not found');
      return;
    }

    // Clear existing content
    gridContainer.innerHTML = '';

    // Create weekly container
    const weeklyContainer = document.createElement('div');
    weeklyContainer.className = 'calendar-weekly-container';

    // Create scrollable weeks
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'weeks-scroll-container';

    const weeksWrapper = document.createElement('div');
    weeksWrapper.className = 'weeks-wrapper';

    // Generate all weeks in the month
    const weeks = this.getWeeksInMonth();
    weeks.forEach((week, index) => {
      const weekView = this.createWeekView(week, index);
      weeksWrapper.appendChild(weekView);
    });

    scrollContainer.appendChild(weeksWrapper);
    weeklyContainer.appendChild(scrollContainer);

    // Replace grid with weekly view
    gridContainer.appendChild(weeklyContainer);

    // Setup scroll snap
    this.setupWeekScrolling(scrollContainer);

    // Update header
    this.updateHeader();

    // Handle empty state
    const tasks = this.getTasksForMonth();
    const emptyState = document.getElementById('calendar-empty-state');
    
    if (emptyState) {
      if (tasks.length === 0) {
        emptyState.style.display = 'flex';
        weeklyContainer.style.display = 'none';
      } else {
        emptyState.style.display = 'none';
        weeklyContainer.style.display = 'block';
      }
    }
  }

  /**
   * Get all weeks in the displayed month
   * @returns {Array} Array of weeks, each week is an array of 7 dates
   */
  getWeeksInMonth() {
    const weeks = [];
    const firstDay = new Date(this.displayedYear, this.displayedMonth, 1);
    const lastDay = new Date(this.displayedYear, this.displayedMonth + 1, 0);
    
    let currentWeekStart = new Date(firstDay);
    currentWeekStart.setDate(firstDay.getDate() - firstDay.getDay()); // Start on Sunday
    
    while (currentWeekStart <= lastDay) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(currentWeekStart);
        day.setDate(currentWeekStart.getDate() + i);
        week.push(day);
      }
      weeks.push(week);
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }
    
    return weeks;
  }

  /**
   * Create a week view element
   * @param {Array} week - Array of 7 dates
   * @param {number} weekIndex - Index of the week
   * @returns {HTMLElement} Week view element
   */
  createWeekView(week, weekIndex) {
    const weekView = document.createElement('div');
    weekView.className = 'week-view';
    weekView.dataset.week = weekIndex;
    
    // Day headers
    const header = document.createElement('div');
    header.className = 'week-days-header';
    
    week.forEach(date => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'day-header';
      if (isToday(date)) {
        dayHeader.classList.add('today');
      }
      
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      dayHeader.innerHTML = `${dayName}<br>${date.getDate()}`;
      header.appendChild(dayHeader);
    });
    
    weekView.appendChild(header);
    
    // Day columns with tasks
    const content = document.createElement('div');
    content.className = 'week-days-content';
    
    week.forEach(date => {
      const column = this.createDayColumn(date);
      content.appendChild(column);
    });
    
    weekView.appendChild(content);
    
    return weekView;
  }

  /**
   * Create a day column with tasks
   * @param {Date} date - The date for this column
   * @returns {HTMLElement} Day column element
   */
  createDayColumn(date) {
    const column = document.createElement('div');
    column.className = 'day-column';
    
    // Get tasks for this date
    const tasks = this.getTasksForDate(date);
    
    tasks.forEach(task => {
      const taskEl = document.createElement('div');
      taskEl.className = 'day-task';
      taskEl.setAttribute('data-task-id', task.id);
      taskEl.setAttribute('tabindex', '0');
      taskEl.setAttribute('role', 'button');
      
      if (this.isTaskOverdue(task)) {
        taskEl.classList.add('overdue');
      }
      
      const taskCourse = task.course || 'Unknown course';
      const taskTitle = task.title || '';
      const taskType = task.type || 'other';
      
      taskEl.setAttribute('aria-label', `${taskCourse}, ${taskType}`);
      
      // Add task type badge
      const badge = document.createElement('span');
      badge.className = `task-type-badge ${taskType}`;
      const badgeText = {
        'assignment': 'A',
        'homework': 'H',
        'exam': 'E',
        'project': 'P',
        'presentation': 'Pr',
        'other': 'O'
      };
      badge.textContent = badgeText[taskType] || 'O';
      
      // Add course name
      const course = document.createElement('div');
      course.className = 'day-task-course';
      course.textContent = taskCourse;
      
      taskEl.appendChild(badge);
      taskEl.appendChild(course);
      
      // Add click event listener
      taskEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showTaskDetails(task.id);
      });
      
      // Add keyboard event listener
      taskEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          this.showTaskDetails(task.id);
        }
      });
      
      column.appendChild(taskEl);
    });
    
    return column;
  }

  /**
   * Get tasks for a specific date
   * @param {Date} date - The date to get tasks for
   * @returns {Array} Array of tasks for the date
   */
  getTasksForDate(date) {
    const dateKey = this.formatDateKey(date);
    const allTasks = this.getTasksForMonth();
    
    return allTasks.filter(task => {
      if (!task.deadline) return false;
      try {
        const taskDate = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
        if (isNaN(taskDate.getTime())) return false;
        const taskDateKey = this.formatDateKey(taskDate);
        return taskDateKey === dateKey;
      } catch (error) {
        return false;
      }
    });
  }

  /**
   * Format date as YYYY-MM-DD
   * @param {Date} date - The date to format
   * @returns {string} Formatted date string
   */
  formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Setup scroll snap behavior for weekly view
   * @param {HTMLElement} scrollContainer - The scroll container element
   */
  setupWeekScrolling(scrollContainer) {
    let startX = 0;
    let scrollLeft = 0;
    
    scrollContainer.addEventListener('touchstart', (e) => {
      startX = e.touches[0].pageX;
      scrollLeft = scrollContainer.scrollLeft;
    });
    
    scrollContainer.addEventListener('touchmove', (e) => {
      const x = e.touches[0].pageX;
      const walk = (startX - x) * 2;
      scrollContainer.scrollLeft = scrollLeft + walk;
    });
    
    // Snap to nearest week on scroll end
    let scrollTimeout;
    scrollContainer.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.snapToNearestWeek(scrollContainer);
      }, 150);
    });
  }

  /**
   * Snap to the nearest week
   * @param {HTMLElement} scrollContainer - The scroll container element
   */
  snapToNearestWeek(scrollContainer) {
    const weekWidth = window.innerWidth;
    const currentScroll = scrollContainer.scrollLeft;
    const nearestWeek = Math.round(currentScroll / weekWidth);
    
    scrollContainer.scrollTo({
      left: nearestWeek * weekWidth,
      behavior: 'smooth'
    });
  }

  /**
   * Navigate to previous month
   * Decrements displayedMonth and handles year rollback
   * Prevents navigation beyond reasonable date ranges
   * Requirements: 3.2
   */
  previousMonth() {
    // Check if we're at the minimum date limit
    if (this.displayedYear <= this.minYear && this.displayedMonth === 0) {
      console.warn('Cannot navigate before minimum date range');
      return;
    }

    this.displayedMonth--;
    if (this.displayedMonth < 0) {
      this.displayedMonth = 11;
      this.displayedYear--;
    }
    
    // Show loading indicator before rendering
    this.showLoading();
    
    try {
      this.renderCalendar();
      // Hide loading indicator when rendering is complete
      this.hideLoading();
    } catch (error) {
      // Handle errors gracefully - log warning and show error state
      console.warn('Error rendering calendar:', error);
      this.hideLoading();
      this.showError();
    }
  }

  /**
   * Navigate to next month
   * Increments displayedMonth and handles year rollover
   * Prevents navigation beyond reasonable date ranges
   * Requirements: 3.3
   */
  nextMonth() {
    // Check if we're at the maximum date limit
    if (this.displayedYear >= this.maxYear && this.displayedMonth === 11) {
      console.warn('Cannot navigate beyond maximum date range');
      return;
    }

    this.displayedMonth++;
    if (this.displayedMonth > 11) {
      this.displayedMonth = 0;
      this.displayedYear++;
    }
    
    // Show loading indicator before rendering
    this.showLoading();
    
    try {
      this.renderCalendar();
      // Hide loading indicator when rendering is complete
      this.hideLoading();
    } catch (error) {
      // Handle errors gracefully - log warning and show error state
      console.warn('Error rendering calendar:', error);
      this.hideLoading();
      this.showError();
    }
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
   * Handles missing task data with placeholders
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

    // Handle missing task data with placeholders
    const taskTitle = task.title || 'Untitled Task';
    const taskCourse = task.course || 'No course specified';
    const taskType = task.type || 'other';
    const taskDescription = task.description || '';
    const taskDetails = task.details || '';
    const taskAddedByName = task.addedByName || '';
    const taskAddedByRole = task.addedByRole || '';

    // Log warnings for missing critical data
    if (!task.title) {
      console.warn('Task detail view: Task missing title, task ID:', task.id);
    }
    if (!task.course) {
      console.warn('Task detail view: Task missing course, task ID:', task.id);
    }

    // Format deadline
    let deadlineStr = 'No deadline';
    let isOverdue = false;
    if (task.deadline) {
      try {
        const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
        
        // Validate that the deadline is a valid date
        if (isNaN(deadline.getTime())) {
          console.warn('Task detail view: Invalid deadline format, task ID:', task.id);
          deadlineStr = 'Invalid deadline';
        } else {
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
      } catch (error) {
        console.warn('Task detail view: Error formatting deadline, task ID:', task.id, 'error:', error.message);
        deadlineStr = 'Invalid deadline';
      }
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
          <h2 id="task-detail-title" class="task-detail-title">${taskTitle}</h2>
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
            <div class="task-detail-value">${taskCourse}</div>
          </div>
          <div class="task-detail-field">
            <div class="task-detail-label">
              <i class="fas fa-tag"></i>
              <strong>Type</strong>
            </div>
            <div class="task-detail-value">
              <span class="task-type-badge ${taskType}">${badgeText[taskType] || 'Other'}</span>
            </div>
          </div>
          <div class="task-detail-field">
            <div class="task-detail-label">
              <i class="fas fa-clock"></i>
              <strong>Deadline</strong>
            </div>
            <div class="task-detail-value ${isOverdue ? 'task-detail-overdue' : ''}">${deadlineStr}${isOverdue ? ' <span class="overdue-label">(Overdue!)</span>' : ''}</div>
          </div>
          ${taskDescription ? `
          <div class="task-detail-field task-detail-description">
            <div class="task-detail-label">
              <i class="fas fa-align-left"></i>
              <strong>Description</strong>
            </div>
            <div class="task-detail-value">${taskDescription}</div>
          </div>
          ` : ''}
          ${taskDetails ? `
          <div class="task-detail-field task-detail-description">
            <div class="task-detail-label">
              <i class="fas fa-info-circle"></i>
              <strong>Details</strong>
            </div>
            <div class="task-detail-value">${taskDetails}</div>
          </div>
          ` : ''}
          ${taskAddedByName ? `
          <div class="task-detail-field task-detail-meta">
            <div class="task-detail-label">
              <i class="fas fa-user"></i>
              <strong>Added by</strong>
            </div>
            <div class="task-detail-value">
              ${taskAddedByName}${taskAddedByRole ? ` <span class="role-badge role-badge-${taskAddedByRole.toLowerCase()}">${taskAddedByRole}</span>` : ''}
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
   * Handle task updates
   * Refreshes the calendar display when App.currentTasks is updated
   * Requirements: 9.2
   */
  onTasksUpdated() {
    // Check if calendar is currently open
    if (this.isOpen) {
      // Show loading indicator before rendering
      this.showLoading();
      
      try {
        // If open, call renderCalendar() to refresh display
        // This handles task additions, edits, and deletions
        this.renderCalendar();
        // Hide loading indicator when rendering is complete
        this.hideLoading();
      } catch (error) {
        // Handle errors gracefully - log warning and show error state
        console.warn('Error rendering calendar:', error);
        this.hideLoading();
        this.showError();
      }
    }
  }

  /**
   * Show loading indicator
   * Displays the loading state while calendar is rendering
   * Requirements: 9.3
   */
  showLoading() {
    // Guard for test environments where document may not be defined
    if (typeof document === 'undefined') return;
    
    const loadingState = document.getElementById('calendar-loading');
    const gridContainer = document.querySelector('.calendar-grid-container');
    const emptyState = document.getElementById('calendar-empty-state');
    
    if (loadingState) {
      loadingState.style.display = 'flex';
    }
    if (gridContainer) {
      gridContainer.style.display = 'none';
    }
    if (emptyState) {
      emptyState.style.display = 'none';
    }
  }

  /**
   * Hide loading indicator
   * Hides the loading state when rendering is complete
   * Requirements: 9.3
   */
  hideLoading() {
    // Guard for test environments where document may not be defined
    if (typeof document === 'undefined') return;
    
    const loadingState = document.getElementById('calendar-loading');
    
    if (loadingState) {
      loadingState.style.display = 'none';
    }
  }

  /**
   * Show error state
   * Displays an error message when calendar rendering fails
   * Requirements: 9.3
   */
  showError() {
    // Guard for test environments where document may not be defined
    if (typeof document === 'undefined') return;
    
    const gridContainer = document.querySelector('.calendar-grid-container');
    const emptyState = document.getElementById('calendar-empty-state');
    const loadingState = document.getElementById('calendar-loading');
    
    // Hide other states
    if (gridContainer) {
      gridContainer.style.display = 'none';
    }
    if (loadingState) {
      loadingState.style.display = 'none';
    }
    
    // Show error in empty state container
    if (emptyState) {
      emptyState.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>Error loading calendar. Please try again.</p>';
      emptyState.style.display = 'flex';
    }
  }

  /**
   * Attach event listeners for modal interactions
   * Sets up listeners for calendar button, close button, overlay, escape key, and navigation
   * Requirements: 1.2, 1.4, 10.3, 10.2
   */
  attachEventListeners() {
    // Calendar button click → open()
    const calendarBtn = document.getElementById('calendar-view-btn');
    if (calendarBtn) {
      console.log('Calendar button found, attaching click listener');
      calendarBtn.addEventListener('click', () => {
        console.log('Calendar button clicked!');
        this.open();
      });
    } else {
      console.warn('Calendar button not found in DOM');
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

    // Keyboard event handler for modal
    // Requirements: 10.2 - Keyboard navigation support
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;

      // Escape key press → close()
      if (e.key === 'Escape') {
        this.close();
        return;
      }

      // Arrow key navigation for month navigation (optional but helpful)
      // Left arrow → previous month
      if (e.key === 'ArrowLeft' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.previousMonth();
        return;
      }

      // Right arrow → next month
      if (e.key === 'ArrowRight' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.nextMonth();
        return;
      }
    });

    // Previous month button click → previousMonth()
    const prevBtn = document.getElementById('calendar-prev-month');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousMonth());
      
      // Add keyboard support for Enter and Space keys
      prevBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.previousMonth();
        }
      });
    }

    // Next month button click → nextMonth()
    const nextBtn = document.getElementById('calendar-next-month');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextMonth());
      
      // Add keyboard support for Enter and Space keys
      nextBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.nextMonth();
        }
      });
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
 * Handles invalid date formats gracefully
 * @param {Array} tasks - Array of task objects with deadline property
 * @returns {Object} Object with date keys in format "YYYY-MM-DD" and task arrays as values
 */
function groupTasksByDate(tasks) {
  const grouped = {};
  
  tasks.forEach(task => {
    if (!task.deadline) return;
    
    try {
      // Handle both Firestore Timestamp and JavaScript Date
      const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
      
      // Validate that the deadline is a valid date
      if (isNaN(deadline.getTime())) {
        console.warn('Invalid deadline format in groupTasksByDate, task ID:', task.id);
        return;
      }
      
      // Format date as YYYY-MM-DD
      const year = deadline.getFullYear();
      const month = String(deadline.getMonth() + 1).padStart(2, '0');
      const day = String(deadline.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(task);
    } catch (error) {
      console.warn('Error grouping task by date, task ID:', task.id, 'error:', error.message);
    }
  });
  
  return grouped;
}

// Expose to global scope for browser environment
if (typeof window !== 'undefined') {
  window.CalendarView = CalendarView;
  window.getFirstDayOfMonth = getFirstDayOfMonth;
  window.getLastDayOfMonth = getLastDayOfMonth;
  window.getDaysInMonth = getDaysInMonth;
  window.isToday = isToday;
  window.groupTasksByDate = groupTasksByDate;
}
