// ============================================
// FILTER POPUP CLASS
// ============================================

class FilterPopup {
  constructor() {
    this.popup = document.getElementById('filter-popup');
    this.addFilterBtn = document.getElementById('add-filter-btn');
    this.closeBtn = document.getElementById('close-filter-popup');
    this.applyBtn = document.getElementById('apply-filters-btn');
    this.clearBtn = document.getElementById('clear-filters-btn');
    this.badge = document.getElementById('filter-badge');
    this.activeFilters = 0;
  }

  open() {
    if (this.popup) {
      this.popup.style.display = 'flex';
    }
  }

  close() {
    if (this.popup) {
      this.popup.style.display = 'none';
    }
  }

  // Hide semester and section filters for Faculty users
  hideSemesterSectionForFaculty(isFaculty) {
    const semesterGroup = document.querySelector('#filter-semester')?.closest('.form-group');
    const sectionGroup = document.querySelector('#filter-section')?.closest('.form-group');

    if (isFaculty) {
      if (semesterGroup) semesterGroup.style.display = 'none';
      if (sectionGroup) sectionGroup.style.display = 'none';
    } else {
      if (semesterGroup) semesterGroup.style.display = 'block';
      if (sectionGroup) sectionGroup.style.display = 'block';
    }
  }

  updateBadge() {
    const filters = this.getActiveFilters();
    this.activeFilters = filters.length;

    if (this.badge) {
      if (this.activeFilters > 0) {
        this.badge.textContent = this.activeFilters;
        this.badge.style.display = 'inline-flex';
      } else {
        this.badge.style.display = 'none';
      }
    }
  }

  getActiveFilters() {
    const filters = [];
    const dept = document.getElementById('filter-department')?.value;
    const sem = document.getElementById('filter-semester')?.value;
    const section = document.getElementById('filter-section')?.value;
    const role = document.getElementById('filter-role')?.value;

    if (dept && dept !== 'All') filters.push('department');
    // Skip semester and section for Faculty users (they're hidden)
    const semesterGroup = document.querySelector('#filter-semester')?.closest('.form-group');
    if (semesterGroup && semesterGroup.style.display !== 'none') {
      if (sem && sem !== 'All') filters.push('semester');
      if (section && section !== 'All') filters.push('section');
    }
    if (role && role !== 'All') filters.push('role');

    return filters;
  }

  clearFilters() {
    const filterDept = document.getElementById('filter-department');
    const filterSem = document.getElementById('filter-semester');
    const filterSection = document.getElementById('filter-section');
    const filterRole = document.getElementById('filter-role');

    if (filterDept) filterDept.value = 'All';
    // Only clear semester/section if they're visible (not Faculty user)
    const semesterGroup = document.querySelector('#filter-semester')?.closest('.form-group');
    if (semesterGroup && semesterGroup.style.display !== 'none') {
      if (filterSem) filterSem.value = 'All';
      if (filterSection) filterSection.value = 'All';
    }
    if (filterRole) filterRole.value = 'All';

    this.updateBadge();
  }
}

// ============================================
// DELETE USER DIALOG CLASS
// ============================================

class DeleteUserDialog {
  constructor() {
    this.modal = document.getElementById('delete-user-modal');
    this.emailDisplay = document.getElementById('delete-user-email');
    this.confirmBtn = document.getElementById('confirm-delete-user');
    this.cancelBtn = document.getElementById('cancel-delete-user');
    this.closeBtn = document.getElementById('close-delete-modal');
    this.currentUserId = null;
    this.currentUserEmail = null;
  }

  open(userId, userEmail) {
    this.currentUserId = userId;
    this.currentUserEmail = userEmail;
    if (this.emailDisplay) {
      this.emailDisplay.textContent = userEmail;
    }
    if (this.modal) {
      this.modal.style.display = 'flex';
    }
  }

  close() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
    this.currentUserId = null;
    this.currentUserEmail = null;
    if (this.emailDisplay) {
      this.emailDisplay.textContent = '';
    }
  }

  getUserId() {
    return this.currentUserId;
  }

  getUserEmail() {
    return this.currentUserEmail;
  }
}

// ============================================
// MAIN APPLICATION
// ============================================

const App = {
  userProfile: null,
  userCompletions: {},
  currentTasks: [],
  currentEvents: [],
  currentRaiderEvents: [],
  mobileEventsActiveView: localStorage.getItem('b1t_events_sidebar_view') || 'internal',
  isAdmin: false,
  isCR: false,
  isFaculty: false,
  isDptCoor: false,
  isBlocked: false,
  realRoles: null, // Stores actual authenticated DB roles { isAdmin, isCR, isFaculty, isDptCoor, isBlocked }
  previewRole: null, // Stores active preview role string ('Faculty', 'DptCoor', 'CR', 'Student', 'Blocked') or null
  filterPopup: null,
  allUsers: [],
  isSigningUp: false, // Flag to prevent auth state handling during signup
  currentFilter: 'all', // State to track active task filter
  classroomInitPromise: null, // Store init promise to await later
  isLoadingData: false, // Prevent duplicate data fetches during initialization

  async init() {
    console.log('Initializing b1t-Sched...');

    // Initialize router
    Router.init();

    // Initialize UI components
    this.filterPopup = new FilterPopup();
    this.deleteUserDialog = new DeleteUserDialog();

    // Setup mobile zoom
    this.adjustMobileZoom();
    window.addEventListener('resize', () => this.adjustMobileZoom());

    // Setup authentication state listener
    Auth.onAuthStateChanged(async (user) => {
      // Skip handling during signup process
      if (this.isSigningUp) {
        console.log('Skipping auth state change during signup');
        return;
      }
      if (user) {
        console.log('User is logged in:', user.email);
        await this.handleAuthenticatedUser(user);
      } else {
        console.log('User is not logged in');
        this.handleUnauthenticatedUser();
      }
    });

    // Setup event listeners
    this.setupEventListeners();
    this.setupTaskEventListeners();
    this.setupEventsSidebarListeners();
    NoticeViewer.init();
    CRNoticeViewer.init();
    UI.initPdfViewer();
    UI.initQuickLinksDropdown();
    this.setupAdminEventListeners();
    this.setupUserManagementListeners();

    // Initialize Google Classroom
    this.classroomInitPromise = Classroom.init();

    // Initialize Note Manager
    NoteManager.init();

    // Initialize Activity Timeline
    if (typeof TimelineUI !== 'undefined') {
      TimelineUI.init();
    }

    // Initialize Task Export
    if (typeof TaskExport !== 'undefined') {
      TaskExport.init();
    }

    // Logo click: scroll to top if on dashboard
    const logoLink = document.getElementById('nav-logo-link');
    if (logoLink) {
      logoLink.addEventListener('click', () => {
        if (Router.getCurrentRoute() === 'dashboard' || window.location.hash === '#/dashboard') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    // Initialize Calendar View
    console.log('Checking CalendarView:', typeof CalendarView);
    if (typeof CalendarView !== 'undefined') {
      console.log('CalendarView is defined, initializing...');
      this.calendarView = new CalendarView();
      this.calendarView.init();
      console.log('CalendarView initialized successfully');
    } else {
      console.error('CalendarView is undefined!');
    }

    // Initialize Profile module (with error handling to prevent blocking)
    try {
      await Profile.init();
    } catch (error) {
      console.error('Profile initialization failed:', error);
    }

    // Handle route-specific data loading
    Router.onRouteChange(async (route) => {
      // Update FAQ and Contribution section visibility
      UI.updateSectionVisibility(route);

      if (route === 'profile-settings') {
        await Profile.loadProfile();
      } else if (route === 'set-details') {
        await this.loadSetDetailsForm();
      } else if (route === 'dashboard') {
        await this.loadDashboardData();
      } else if (route === 'user-management') {
        await this.loadUserManagement();
      }
    });

    // Call visibility controller for current route on initial load
    const currentRoute = Router.getCurrentRoute();
    if (currentRoute) {
      UI.updateSectionVisibility(currentRoute);
    }
  },

  adjustMobileZoom() {
    // Only apply on mobile displays (<= 768px)
    if (window.innerWidth <= 768) {
      document.body.style.zoom = '95%';
    } else {
      document.body.style.zoom = '';
    }
  },

  setupEventListeners() {
    // Login role toggle (Student / Faculty)
    this.currentLoginRole = 'student';
    const loginRoleStudent = document.getElementById('login-role-student');
    const loginRoleFaculty = document.getElementById('login-role-faculty');
    const loginIdLabel = document.getElementById('login-id-label');
    const loginIdInput = document.getElementById('login-email');
    const loginIdHint = document.getElementById('login-id-hint');

    const setLoginRole = (role) => {
      this.currentLoginRole = role;
      if (loginRoleStudent) loginRoleStudent.classList.toggle('active', role === 'student');
      if (loginRoleFaculty) loginRoleFaculty.classList.toggle('active', role === 'faculty');

      if (role === 'student') {
        if (loginIdLabel) loginIdLabel.textContent = 'Student ID or Email';
        if (loginIdInput) loginIdInput.placeholder = 'Enter 10-16 digit ID or email';
        if (loginIdHint) loginIdHint.textContent = 'Log in with your 10-16 digit student ID or email';
      } else {
        if (loginIdLabel) loginIdLabel.textContent = 'Faculty Initial or Email';
        if (loginIdInput) loginIdInput.placeholder = 'Enter faculty initial (e.g. ABC) or email';
        if (loginIdHint) loginIdHint.textContent = 'Log in with your faculty initial or email';
      }
    };

    if (loginRoleStudent) {
      loginRoleStudent.addEventListener('click', () => setLoginRole('student'));
    }
    if (loginRoleFaculty) {
      loginRoleFaculty.addEventListener('click', () => setLoginRole('faculty'));
    }

    // Signup role toggle (Student / Faculty)
    this.currentSignupRole = 'student';
    const signupRoleStudent = document.getElementById('signup-role-student');
    const signupRoleFaculty = document.getElementById('signup-role-faculty');

    const setSignupRole = (role) => {
      this.currentSignupRole = role;
      sessionStorage.setItem('signup_role', role);
      if (signupRoleStudent) signupRoleStudent.classList.toggle('active', role === 'student');
      if (signupRoleFaculty) signupRoleFaculty.classList.toggle('active', role === 'faculty');
    };

    if (signupRoleStudent) {
      signupRoleStudent.addEventListener('click', () => setSignupRole('student'));
    }
    if (signupRoleFaculty) {
      signupRoleFaculty.addEventListener('click', () => setSignupRole('faculty'));
    }

    // Password visibility toggle buttons
    document.querySelectorAll('.password-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const wrapper = btn.closest('.password-input-wrapper');
        if (!wrapper) return;
        const input = wrapper.querySelector('input');
        const icon = btn.querySelector('i');
        if (!input) return;

        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        if (icon) {
          icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
        }
      });
    });

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleLogin();
      });
    }

    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleSignup();
      });
    }

    // Show signup button
    const showSignupBtn = document.getElementById('show-signup-btn');
    if (showSignupBtn) {
      showSignupBtn.addEventListener('click', () => {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
        UI.hideMessage('auth-message');
      });
    }

    // Show login button
    const showLoginBtn = document.getElementById('show-login-btn');
    if (showLoginBtn) {
      showLoginBtn.addEventListener('click', () => {
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
        UI.hideMessage('auth-message');
      });
    }

    // Set details form
    const setDetailsForm = document.getElementById('set-details-form');
    if (setDetailsForm) {
      setDetailsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleSetDetails();
      });

      // Listen for faculty account toggle
      const facultyToggle = document.getElementById('set-is-faculty-checkbox');
      if (facultyToggle) {
        facultyToggle.addEventListener('change', () => {
          this.toggleFacultySetDetails(facultyToggle.checked);
        });
      }

      // Listen for department/semester changes to update sections
      const deptSelect = document.getElementById('set-department');
      const semSelect = document.getElementById('set-semester');

      if (deptSelect && semSelect) {
        deptSelect.addEventListener('change', () => this.updateSetDetailsSections());
        semSelect.addEventListener('change', () => this.updateSetDetailsSections());
      }
    }

    // Refresh tasks button
    const refreshTasksBtn = document.getElementById('refresh-tasks-btn');
    if (refreshTasksBtn) {
      refreshTasksBtn.addEventListener('click', async () => {
        await this.loadDashboardData();
      });
    }
  },

  setupTaskEventListeners() {
    // Setup Task Type Filter Listeners
    this.setupTaskFilterListeners();

    // Add Task button
    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => {
        this.openAddTaskModal();
      });
    }

    // View Old Tasks button
    const viewOldTasksBtn = document.getElementById('view-old-tasks-btn');
    if (viewOldTasksBtn) {
      viewOldTasksBtn.addEventListener('click', async () => {
        await this.openOldTasksModal();
      });
    }

    // Toggle/Expand Admin Preview banner on clicking the eye icon / toggle button
    const previewToggleBtn = document.getElementById('admin-preview-toggle-btn');
    if (previewToggleBtn) {
      previewToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof UI !== 'undefined' && typeof UI.togglePreviewBanner === 'function') {
          UI.togglePreviewBanner();
        }
      });
    }

    // Clicking anywhere on the banner when minimized expands it
    const previewBanner = document.getElementById('admin-preview-banner');
    if (previewBanner) {
      previewBanner.addEventListener('click', () => {
        if (previewBanner.classList.contains('is-minimized')) {
          if (typeof UI !== 'undefined' && typeof UI.minimizePreviewBanner === 'function') {
            UI.minimizePreviewBanner(false);
          }
        }
      });
      // Pause auto-collapse timer on hover so user can interact
      previewBanner.addEventListener('mouseenter', () => {
        if (typeof UI !== 'undefined' && UI.previewCollapseTimer) {
          clearTimeout(UI.previewCollapseTimer);
          UI.previewCollapseTimer = null;
        }
      });
      // Restart 3-second auto-minimize timer on mouseleave if expanded
      previewBanner.addEventListener('mouseleave', () => {
        if (!previewBanner.classList.contains('is-minimized')) {
          if (typeof UI !== 'undefined') {
            if (UI.previewCollapseTimer) clearTimeout(UI.previewCollapseTimer);
            UI.previewCollapseTimer = setTimeout(() => {
              UI.minimizePreviewBanner(true);
            }, 3000);
          }
        }
      });
    }

    // Exit Admin Preview button on global banner (only clickable when expanded)
    const exitPreviewBannerBtn = document.getElementById('exit-preview-banner-btn');
    if (exitPreviewBannerBtn) {
      exitPreviewBannerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.exitPreview();
      });
    }

    // Add Task form
    const addTaskForm = document.getElementById('add-task-form');
    if (addTaskForm) {
      addTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleAddTask();
      });
    }

    // Modal close buttons
    const closeAddTaskModal = document.getElementById('close-add-task-modal');
    const cancelAddTask = document.getElementById('cancel-add-task');
    const closeOldTasksModal = document.getElementById('close-old-tasks-modal');
    const closePasswordResetModal = document.getElementById('close-password-reset-modal');
    const cancelPasswordReset = document.getElementById('cancel-password-reset');

    if (closeAddTaskModal) {
      closeAddTaskModal.addEventListener('click', () => UI.hideModal('add-task-modal'));
    }
    if (cancelAddTask) {
      cancelAddTask.addEventListener('click', () => UI.hideModal('add-task-modal'));
    }
    if (closeOldTasksModal) {
      closeOldTasksModal.addEventListener('click', () => UI.hideModal('old-tasks-modal'));
    }
    if (closePasswordResetModal) {
      closePasswordResetModal.addEventListener('click', () => UI.hideModal('password-reset-modal'));
    }
    if (cancelPasswordReset) {
      cancelPasswordReset.addEventListener('click', () => UI.hideModal('password-reset-modal'));
    }

    // Forgot password link
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        // Pre-fill email from login form if available
        const loginEmail = document.getElementById('login-email').value.trim();
        const resetEmailInput = document.getElementById('reset-email');
        if (resetEmailInput && loginEmail) {
          resetEmailInput.value = loginEmail;
        }
        UI.hideMessage('password-reset-message');
        UI.showModal('password-reset-modal');
      });
    }

    // Password reset form
    const passwordResetForm = document.getElementById('password-reset-form');
    if (passwordResetForm) {
      passwordResetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handlePasswordReset();
      });
    }

    // Close modals on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          UI.hideModal(modal.id);
        }
      });
    });

    // Task checkbox delegation (handles dynamically added checkboxes)
    // Using 'click' event instead of 'change' for more reliable event delegation
    const tasksContainer = document.getElementById('tasks-container');
    if (tasksContainer) {
      tasksContainer.addEventListener('click', async (e) => {
        // Handle task checkbox
        const checkbox = e.target.closest('.task-checkbox');
        if (checkbox && checkbox.type === 'checkbox') {
          const taskId = checkbox.dataset.taskId;
          const isCompleted = checkbox.checked;
          await this.handleTaskCompletion(taskId, isCompleted);
          return;
        }

        // Handle description toggle
        const toggleBtn = e.target.closest('.task-description-toggle');
        if (toggleBtn) {
          const wrapper = toggleBtn.closest('.task-description-wrapper');
          const textEl = wrapper.querySelector('.task-description-text');
          const toggleText = toggleBtn.querySelector('.toggle-text');

          const isExpanded = textEl.classList.toggle('expanded');
          toggleBtn.classList.toggle('expanded', isExpanded);
          toggleText.textContent = isExpanded ? 'Show less' : 'Show more';
        }
      });
    }

    // Setup delegation for old tasks modal clicks
    const oldTasksContainer = document.getElementById('old-tasks-container');
    if (oldTasksContainer) {
      oldTasksContainer.addEventListener('click', async (e) => {
        // Handle edit button
        const editBtn = e.target.closest('.old-task-edit-btn, .task-edit-btn');
        if (editBtn) {
          const taskId = editBtn.dataset.taskId;
          await this.openEditTaskModal(taskId);
          return;
        }

        const item = e.target.closest('.old-task-item');
        if (item && this.oldTasks) {
          const taskId = item.dataset.taskId;
          const task = this.oldTasks.find(t => t.id === taskId);
          if (task) {
            const deadline = task.deadline ? (task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline)) : new Date();
            const isCompleted = task.isCompleted || false;
            const completedDate = task.completedAt ? (task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt)) : null;
            const contentHTML = `
              <div style="margin-bottom: 15px;">
                <strong>Task ID:</strong> <code style="font-family: monospace; font-size: 0.9em; background-color: rgba(128, 128, 128, 0.12); padding: 2px 6px; border-radius: 4px; user-select: all;">${task.id}</code>
              </div>
              <div style="margin-bottom: 15px;">
                <strong>Course:</strong> <span style="background-color: var(--primary-maroon); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.9em;">${task.course || 'N/A'}</span>
              </div>
              <div style="margin-bottom: 15px;">
                <strong>Type:</strong> <span style="text-transform: capitalize;">${task.type || 'N/A'}</span>
              </div>
              <div style="margin-bottom: 15px;">
                <strong>Deadline:</strong> ${Utils.formatDateShort(deadline)}
              </div>
              ${isCompleted && completedDate ? `<div style="margin-bottom: 15px; color: var(--success);"><i class="fas fa-check-circle"></i> <strong>Completed:</strong> ${Utils.formatDateShort(completedDate)}</div>` : `<div style="margin-bottom: 15px; color: var(--danger);"><i class="fas fa-times-circle"></i> <strong>Status:</strong> Not completed</div>`}
              <div>
                <strong>Description:</strong>
                <div style="margin-top: 5px; padding: 10px; background-color: var(--bg-lighter); border-radius: 8px;">
                  ${Utils.escapeAndLinkify(task.description) || 'No description provided.'}
                </div>
              </div>
            `;
            UI.showItemDetailsModal(task.title || 'Task Details', contentHTML);
          }
        }
      });
    }

    // Setup delegation for old events modal clicks
    const oldEventsContainer = document.getElementById('old-events-container');
    if (oldEventsContainer) {
      oldEventsContainer.addEventListener('click', (e) => {
        const item = e.target.closest('.old-event-item');
        if (item && this.oldEvents) {
          const eventId = item.dataset.eventId;
          const event = this.oldEvents.find(ev => ev.id === eventId);
          if (event) {
            const eventDate = event.date ? event.date.toDate() : new Date();
            const contentHTML = `
              <div style="margin-bottom: 15px;">
                <strong>Target Dept:</strong> <span style="background-color: var(--primary-maroon); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.9em;">${event.department || 'ALL'}</span>
              </div>
              <div style="margin-bottom: 15px;">
                <strong>Date:</strong> ${Utils.formatDateShort(eventDate)}
              </div>
              <div>
                <strong>Description:</strong>
                <div style="margin-top: 5px; padding: 10px; background-color: var(--bg-lighter); border-radius: 8px;">
                  ${Utils.escapeAndLinkify(event.description) || 'No description provided.'}
                </div>
              </div>
            `;
            UI.showItemDetailsModal(event.title || 'Event Details', contentHTML);
          }
        }
      });
    }
  },

  setupEventsSidebarListeners() {
    // Events toggle (mobile)
    const eventsToggle = document.getElementById('events-toggle');
    if (eventsToggle) {
      eventsToggle.addEventListener('click', () => {
        UI.toggleEventsSidebar(true);
      });
    }

    // Close events sidebar
    const closeEventsSidebar = document.getElementById('close-events-sidebar');
    if (closeEventsSidebar) {
      closeEventsSidebar.addEventListener('click', () => {
        UI.toggleEventsSidebar(false);
      });
    }

    // Close on overlay click
    const eventsOverlay = document.getElementById('events-overlay');
    if (eventsOverlay) {
      eventsOverlay.addEventListener('click', () => {
        UI.toggleEventsSidebar(false);
      });
    }

    // Restore saved mobile events view from localStorage on startup
    const savedEventsView = localStorage.getItem('b1t_events_sidebar_view');
    if (savedEventsView && (savedEventsView === 'raiders' || savedEventsView === 'internal')) {
      this.mobileEventsActiveView = savedEventsView;
    }
    UI.switchMobileEventsView(this.mobileEventsActiveView);

    // Mobile events sidebar view switcher (between b1t-Sched and UITS Event Raiders)
    const switchBtn = document.getElementById('events-view-switch-btn');
    if (switchBtn) {
      switchBtn.addEventListener('click', () => {
        this.mobileEventsActiveView = (this.mobileEventsActiveView === 'raiders') ? 'internal' : 'raiders';
        try {
          localStorage.setItem('b1t_events_sidebar_view', this.mobileEventsActiveView);
        } catch (e) {
          console.warn('Failed to save events sidebar view state to localStorage:', e);
        }
        UI.switchMobileEventsView(this.mobileEventsActiveView);
      });
    }

    // Event description toggle delegation (works for both internal and raider events)
    const eventsContainers = [
      document.getElementById('events-container'),
      document.getElementById('events-container-mobile'),
      document.getElementById('raider-events-container'),
      document.getElementById('raider-events-container-mobile')
    ];
    eventsContainers.forEach(container => {
      if (container) {
        container.addEventListener('click', (e) => {
          const toggleBtn = e.target.closest('.event-description-toggle');
          if (toggleBtn) {
            const wrapper = toggleBtn.closest('.event-description-wrapper');
            const textEl = wrapper.querySelector('.event-description-text');
            const toggleText = toggleBtn.querySelector('.toggle-text');

            const isExpanded = textEl.classList.toggle('expanded');
            toggleBtn.classList.toggle('expanded', isExpanded);
            toggleText.textContent = isExpanded ? 'Show less' : 'Show more';
          }
        });
      }
    });
  },

  openAddTaskModal() {
    // Check if user is blocked
    if (this.isBlocked) {
      alert('Your account has been restricted. You cannot add tasks.');
      return;
    }

    // Clear form first
    document.getElementById('add-task-form').reset();

    // Faculty customization: Course / Designation label and placeholder
    const courseLabel = document.querySelector('label[for="task-course"]');
    const courseInput = document.getElementById('task-course');
    if (this.isFaculty) {
      if (courseLabel) courseLabel.textContent = 'Course / Designation';
      if (courseInput) courseInput.placeholder = 'Task for a Faculty / Course';
    } else {
      if (courseLabel) courseLabel.textContent = 'Course';
      if (courseInput) courseInput.placeholder = 'Course Title or Code';
    }

    // Set minimum date to now
    const deadlineInput = document.getElementById('task-deadline');
    const deadlineNone = document.getElementById('deadline-none');
    const deadlineDate = document.getElementById('deadline-date');

    if (deadlineInput) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      deadlineInput.min = now.toISOString().slice(0, 16);
      deadlineInput.value = '';
    }

    // Set up radio button handlers
    if (deadlineNone && deadlineDate && deadlineInput) {
      // Remove old listeners if any
      deadlineNone.onclick = null;
      deadlineDate.onclick = null;

      // Add new listeners
      deadlineNone.addEventListener('change', () => {
        deadlineInput.disabled = true;
        deadlineInput.value = '';
      });

      deadlineDate.addEventListener('change', () => {
        deadlineInput.disabled = false;
        deadlineInput.focus(); // Auto-focus the input when enabled
      });

      // Set initial state based on checked radio
      if (deadlineNone.checked) {
        deadlineInput.disabled = true;
        deadlineInput.value = '';
      } else if (deadlineDate.checked) {
        deadlineInput.disabled = false;
      }
    }

    UI.showModal('add-task-modal');
  },

  async openOldTasksModal() {
    UI.showModal('old-tasks-modal');

    if (!this.userProfile) return;

    const userId = Auth.getUserId();
    const { department, semester, section } = this.userProfile;

    const result = await DB.getOldTasks(userId, department, this.isFaculty ? null : semester, this.isFaculty ? null : section);
    if (result.success) {
      this.oldTasks = result.data;
      UI.renderOldTasks(result.data, this.isAdmin, userId);
    }
  },

  async handleAddTask() {
    // Check if user is blocked
    if (this.isBlocked) {
      alert('Your account has been restricted. You cannot add tasks.');
      return;
    }

    const title = document.getElementById('task-title').value.trim();
    const course = document.getElementById('task-course').value.trim();
    const type = document.getElementById('task-type').value;
    const description = document.getElementById('task-description').value.trim();
    const deadlineInput = document.getElementById('task-deadline');
    const deadlineNone = document.getElementById('deadline-none');
    let deadline = null;
    if (deadlineNone && deadlineNone.checked) {
      deadline = null;
    } else if (deadlineInput && deadlineInput.value) {
      deadline = deadlineInput.value;
    }
    if (!course || (deadline === null && (!deadlineNone || !deadlineNone.checked))) {
      alert('Please fill in the required fields (Course and Deadline)');
      return;
    }

    if (!this.userProfile) {
      alert('User profile not loaded');
      return;
    }

    const userId = Auth.getUserId();
    const userEmail = Auth.getUserEmail();
    const { department, semester, section } = this.userProfile;

    // Faculty users: semester and section are null
    const taskData = {
      title,
      course,
      type,
      description,
      deadline,
      department,
      semester: this.isFaculty ? null : semester,
      section: this.isFaculty ? null : section
    };

    const result = await DB.createTask(userId, userEmail, taskData);

    if (result.success) {
      UI.hideModal('add-task-modal');
      // Refresh tasks
      await this.loadDashboardData();

      // Log activity
      await ActivityLogger.logTaskAddition(result.id, taskData, this.userProfile);
    } else {
      alert('Failed to add task: ' + result.error);
    }
  },

  async openEditTaskModal(taskId) {
    // Check if user is blocked
    if (this.isBlocked) {
      alert('Your account has been restricted. You cannot edit tasks.');
      return;
    }

    // Find the task in currentTasks or oldTasks
    let task = this.currentTasks ? this.currentTasks.find(t => t.id === taskId) : null;
    if (!task && this.oldTasks) {
      task = this.oldTasks.find(t => t.id === taskId);
    }
    if (!task) {
      alert('Task not found');
      return;
    }

    // Check if user can edit this task
    // Admin can edit any task, Faculty can edit their own tasks, users can edit their own tasks
    const userId = Auth.getUserId();
    const canEdit = this.isAdmin || (userId && task.addedBy === userId);
    if (!canEdit) {
      alert('You do not have permission to edit this task');
      return;
    }

    // Faculty customization: Course / Designation label and placeholder
    const editCourseLabel = document.querySelector('label[for="edit-task-course"]');
    const editCourseInput = document.getElementById('edit-task-course');
    if (this.isFaculty) {
      if (editCourseLabel) editCourseLabel.textContent = 'Course / Designation';
      if (editCourseInput) editCourseInput.placeholder = 'Task for a Faculty / Course';
    } else {
      if (editCourseLabel) editCourseLabel.textContent = 'Course';
      if (editCourseInput) editCourseInput.placeholder = 'e.g., CSE301';
    }

    // Populate the form
    document.getElementById('edit-task-id').value = taskId;
    document.getElementById('edit-task-title').value = task.title || '';
    document.getElementById('edit-task-course').value = task.course || '';
    document.getElementById('edit-task-type').value = task.type || 'assignment';
    document.getElementById('edit-task-description').value = task.description || '';
    const deadlineInput = document.getElementById('edit-task-deadline');
    const deadlineNone = document.getElementById('edit-deadline-none');
    const deadlineDate = document.getElementById('edit-deadline-date');
    if (task.deadline) {
      // Set radio to date, enable input
      if (deadlineDate) deadlineDate.checked = true;
      if (deadlineNone) deadlineNone.checked = false;
      if (deadlineInput) {
        deadlineInput.disabled = false;
        const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
        deadline.setMinutes(deadline.getMinutes() - deadline.getTimezoneOffset());
        deadlineInput.value = deadline.toISOString().slice(0, 16);
      }
    } else {
      // No deadline
      if (deadlineNone) deadlineNone.checked = true;
      if (deadlineDate) deadlineDate.checked = false;
      if (deadlineInput) {
        deadlineInput.disabled = true;
        deadlineInput.value = '';
      }
    }
    // Add event listeners for radio buttons
    if (deadlineNone && deadlineDate && deadlineInput) {
      deadlineNone.onclick = () => { deadlineInput.disabled = true; deadlineInput.value = ''; };
      deadlineDate.onclick = () => { deadlineInput.disabled = false; };
    }
    UI.showModal('edit-task-modal');
  },

  async handleEditTask() {
    // Check if user is blocked
    if (this.isBlocked) {
      alert('Your account has been restricted. You cannot edit tasks.');
      return;
    }

    const taskId = document.getElementById('edit-task-id').value;
    const title = document.getElementById('edit-task-title').value.trim();
    const course = document.getElementById('edit-task-course').value.trim();
    const type = document.getElementById('edit-task-type').value;
    const description = document.getElementById('edit-task-description').value.trim();
    const deadlineInput = document.getElementById('edit-task-deadline');
    const deadlineNone = document.getElementById('edit-deadline-none');
    let deadline = null;
    if (deadlineNone && deadlineNone.checked) {
      deadline = null;
    } else if (deadlineInput && deadlineInput.value) {
      deadline = deadlineInput.value;
    }
    if (!course || (deadline === null && (!deadlineNone || !deadlineNone.checked))) {
      alert('Please fill in the required fields (Course and Deadline)');
      return;
    }

    const result = await DB.updateTask(taskId, {
      title,
      course,
      type,
      description,
      deadline
    });

    if (result.success) {
      UI.hideModal('edit-task-modal');
      // Refresh tasks
      await this.loadDashboardData();

      // If old tasks modal is open or old tasks were loaded, refresh old tasks list
      if (this.userProfile && (this.oldTasks || document.getElementById('old-tasks-modal')?.style.display === 'flex')) {
        const userId = Auth.getUserId();
        const { department, semester, section } = this.userProfile;
        const oldResult = await DB.getOldTasks(userId, department, this.isFaculty ? null : semester, this.isFaculty ? null : section);
        if (oldResult.success) {
          this.oldTasks = oldResult.data;
          UI.renderOldTasks(oldResult.data, this.isAdmin, userId);
        }
      }
    } else {
      alert('Failed to update task: ' + result.error);
    }
  },

  async openEditEventModal(eventId) {
    // Find the event in currentEvents
    const event = this.currentEvents.find(e => e.id === eventId);
    if (!event) {
      alert('Event not found');
      return;
    }

    const userId = Auth.getUserId();
    const canEdit = this.isAdmin || (this.isCR && event.createdBy === userId) || (this.isFaculty && event.createdBy === userId);
    if (!canEdit) {
      alert('You do not have permission to edit this event');
      return;
    }

    // Populate the form
    document.getElementById('edit-event-id').value = eventId;
    document.getElementById('edit-event-title').value = event.title || '';
    document.getElementById('edit-event-description').value = event.description || '';

    // Populate dynamic departments for event modal
    await this.populateEventDepartmentDropdown('edit-event-department', event.department || 'ALL');

    // CR and Faculty can only edit events for their own department
    const deptSelect = document.getElementById('edit-event-department');
    if ((this.isCR || this.isFaculty) && !this.isAdmin) {
      if (deptSelect) {
        deptSelect.value = this.userProfile.department;
        deptSelect.disabled = true;
      }
    } else if (deptSelect) {
      deptSelect.disabled = false;
    }

    // Format date for datetime-local input
    const eventDate = event.date ? event.date.toDate() : new Date();
    eventDate.setMinutes(eventDate.getMinutes() - eventDate.getTimezoneOffset());
    document.getElementById('edit-event-date').value = eventDate.toISOString().slice(0, 16);

    UI.showModal('edit-event-modal');
  },

  async handleEditEvent() {
    if (!this.isAdmin && !this.isCR && !this.isFaculty) return;

    const eventId = document.getElementById('edit-event-id').value;
    const title = document.getElementById('edit-event-title').value.trim();
    const description = document.getElementById('edit-event-description').value.trim();
    const date = document.getElementById('edit-event-date').value;
    const department = document.getElementById('edit-event-department').value;

    if (!title || !date) {
      alert('Please fill in the required fields (Title and Date)');
      return;
    }

    // CR and Faculty can only edit their own events
    if ((this.isCR || this.isFaculty) && !this.isAdmin) {
      const event = this.currentEvents.find(e => e.id === eventId);
      const userId = Auth.getUserId();
      if (!event || event.createdBy !== userId) {
        alert('You can only edit events you created');
        return;
      }
    }

    const result = await DB.updateEvent(eventId, {
      title,
      description,
      date,
      department
    });

    if (result.success) {
      UI.hideModal('edit-event-modal');
      // Refresh events
      await this.loadDashboardData();
    } else {
      alert('Failed to update event: ' + result.error);
    }
  },

  async handleDeleteEvent(eventId) {
    // Admin can delete any event, CR and Faculty can delete their own events
    if (!this.isAdmin && !this.isCR && !this.isFaculty) {
      alert('You do not have permission to delete events');
      return;
    }

    // CR and Faculty can only delete their own events
    if ((this.isCR || this.isFaculty) && !this.isAdmin) {
      const event = this.currentEvents.find(e => e.id === eventId);
      const userId = Auth.getUserId();
      if (!event || event.createdBy !== userId) {
        alert('You can only delete events you created');
        return;
      }
    }

    if (!confirm('Are you sure you want to delete this event?')) return;

    const result = await DB.deleteEvent(eventId);
    if (result.success) {
      // Log event deletion activity
      const event = this.currentEvents.find(e => e.id === eventId);
      if (event) {
        await ActivityLogger.logEventDeletion(eventId, event, userId, this.userProfile);
      }

      // Refresh events
      await this.loadDashboardData();
    } else {
      alert('Failed to delete event: ' + result.error);
    }
  },

  async handleTaskCompletion(taskId, isCompleted) {
    // Check if user is blocked
    if (this.isBlocked) {
      // Revert checkbox state
      const checkbox = document.querySelector(`.task-checkbox[data-task-id="${taskId}"]`);
      if (checkbox) {
        checkbox.checked = !isCompleted;
      }
      alert('Your account has been restricted. You cannot modify tasks.');
      return;
    }

    const userId = Auth.getUserId();
    if (!userId) return;

    // Get user email and role for activity logging
    const userEmail = Auth.getUserEmail();
    let userRole = 'Student'; // Default role
    if (this.isAdmin) userRole = 'Admin';
    else if (this.isFaculty) userRole = 'Faculty';
    else if (this.isCR) userRole = 'CR';

    const result = await DB.toggleTaskCompletion(userId, taskId, isCompleted, userEmail, userRole);

    if (result.success) {
      // Update local state
      if (isCompleted) {
        this.userCompletions[taskId] = { completedAt: new Date() };
      } else {
        delete this.userCompletions[taskId];
      }

      // Re-render tasks with updated completions
      UI.renderTasks(this.currentTasks, this.userCompletions, this.isAdmin, this.isCR, Auth.getUserId());

      // Re-apply active filter directly — must run AFTER renderTasks rebuilds the DOM
      const activeRadio = document.querySelector('input[name="task-filter"]:checked');
      const activeFilter = (activeRadio && activeRadio.value) || this.currentFilter;
      if (activeFilter && activeFilter !== 'all') {
        this.filterTasksByType(activeFilter);
      }

      // Notify calendar view if initialized
      if (this.calendarView) {
        this.calendarView.onTasksUpdated();
      }

      // Log activity
      const task = this.currentTasks.find(t => t.id === taskId);
      if (task) {
        await ActivityLogger.logTaskCompletion(taskId, task, userId, this.userProfile);
      }
    } else {
      // Revert checkbox state on error
      const checkbox = document.querySelector(`.task-checkbox[data-task-id="${taskId}"]`);
      if (checkbox) {
        checkbox.checked = !isCompleted;
      }
      alert('Failed to update task: ' + result.error);
    }
  },

  async handleLogin() {
    const rawInput = (document.getElementById('login-email')?.value || '').trim();
    const password = document.getElementById('login-password')?.value || '';

    if (!rawInput || !password) {
      UI.showMessage('auth-message', 'Please enter your login credential and password', 'error');
      return;
    }

    let targetEmail = rawInput;
    const isEmail = rawInput.includes('@');

    // If non-email, resolve email based on student ID or faculty initial
    if (!isEmail) {
      UI.showLoading(true);
      if (this.currentLoginRole === 'student') {
        // Enforce 10-16 numeric digit restriction for student ID
        if (!/^[0-9]{10,16}$/.test(rawInput)) {
          UI.showLoading(false);
          UI.showMessage('auth-message', 'Student ID must be 10-16 digits, or enter your full email address.', 'error');
          return;
        }

        const lookup = await DB.getEmailByStudentId(rawInput);
        if (!lookup.success || !lookup.email) {
          UI.showLoading(false);
          UI.showMessage('auth-message', `No student account found with ID "${rawInput}". Please check your ID or sign up first.`, 'error');
          return;
        }
        targetEmail = lookup.email;
      } else {
        // Faculty initial login
        const lookup = await DB.getEmailByFacultyInitial(rawInput);
        if (!lookup.success || !lookup.email) {
          UI.showLoading(false);
          UI.showMessage('auth-message', `No faculty account found with initial "${rawInput}". Please check your initial or sign up first.`, 'error');
          return;
        }
        targetEmail = lookup.email;
      }
    } else {
      if (!Utils.isValidEmail(targetEmail)) {
        UI.showMessage('auth-message', 'Please enter a valid email address.', 'error');
        return;
      }
      UI.showLoading(true);
    }

    const rememberMe = document.getElementById('trust-device')?.checked || false;
    const result = await Auth.login(targetEmail, password, rememberMe);

    if (result.success) {
      // Check email verification immediately
      const user = Auth.getCurrentUser();
      if (user && !user.emailVerified) {
        UI.showLoading(false);
        UI.showMessage('auth-message', 'Please verify your email before logging in. Check your inbox (or spam folder) for the verification link.', 'error');
        await Auth.logout();
        return;
      }
      // Auth state listener will handle navigation
      UI.hideMessage('auth-message');
      // Hide forgot password link on successful login
      const forgotPasswordContainer = document.getElementById('forgot-password-container');
      if (forgotPasswordContainer) {
        forgotPasswordContainer.classList.remove('visible');
      }
    } else {
      UI.showMessage('auth-message', result.error, 'error');
      // Show forgot password link after failed login attempt
      const forgotPasswordContainer = document.getElementById('forgot-password-container');
      if (forgotPasswordContainer) {
        forgotPasswordContainer.classList.add('visible');
      }
      UI.showLoading(false);
    }
  },

  async handlePasswordReset() {
    const email = document.getElementById('reset-email').value.trim();
    console.log('[App] Handling password reset for:', email);

    if (!email) {
      UI.showMessage('password-reset-message', 'Please enter your email address', 'error');
      return;
    }

    if (!Utils.isValidEmail(email)) {
      UI.showMessage('password-reset-message', 'Please enter a valid email address', 'error');
      return;
    }

    console.log('[App] Calling Auth.sendPasswordResetEmail...');
    const result = await Auth.sendPasswordResetEmail(email);
    console.log('[App] Reset result:', result);

    if (result.success) {
      UI.showMessage('password-reset-message', result.message, 'success');
      // Clear the form and close modal after a delay
      setTimeout(() => {
        document.getElementById('reset-email').value = '';
        UI.hideModal('password-reset-modal');
        UI.hideMessage('password-reset-message');
      }, 3000);
    } else {
      console.error('[App] Reset failed:', result.error);
      UI.showMessage('password-reset-message', result.error, 'error');
    }
  },

  async handleSignup() {
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (!email || !password || !confirmPassword) {
      UI.showMessage('auth-message', 'Please fill in all fields', 'error');
      return;
    }

    if (!Utils.isValidEmail(email)) {
      UI.showMessage('auth-message', 'Please enter a valid email address', 'error');
      return;
    }

    if (!Utils.isValidPassword(password)) {
      UI.showMessage('auth-message', 'Password must be at least 6 characters long', 'error');
      return;
    }

    if (password !== confirmPassword) {
      UI.showMessage('auth-message', 'Passwords do not match', 'error');
      return;
    }

    UI.showLoading(true);

    // Set flag to prevent auth state handling during signup
    this.isSigningUp = true;
    sessionStorage.setItem('signup_role', this.currentSignupRole || 'student');

    const result = await Auth.signup(email, password);

    if (result.success) {
      UI.hideMessage('auth-message');
      UI.showMessage('auth-message', 'Account created successfully! Please check your email inbox (or spam folder) for a verification link before logging in.', 'success');
      // Sign out - user must verify email first
      await Auth.logout();
      // Clear the signup flag after logout completes
      this.isSigningUp = false;
      // Show login form
      document.getElementById('signup-form').style.display = 'none';
      document.getElementById('login-form').style.display = 'block';
      UI.showLoading(false);
    } else {
      // Clear the signup flag on error
      this.isSigningUp = false;
      // Show error as info type if it's about email verification
      const msgType = result.error.includes('verify') || result.error.includes('verification') ? 'info' : 'error';
      UI.showMessage('auth-message', result.error, msgType);
      UI.showLoading(false);
    }
  },

  async handleAuthenticatedUser(user) {
    // Check if email is verified
    if (!user.emailVerified) {
      UI.showMessage('auth-message', 'Please verify your email before logging in. Check your inbox (or spam folder) for the verification link.', 'error');
      await Auth.logout();
      UI.showLoading(false);
      return;
    }

    // Check if user has profile
    const profileResult = await DB.getUserProfile(user.uid);

    // Fallback to localStorage if Firestore is unavailable (offline)
    let profileData = profileResult.success ? profileResult.data : null;
    if (!profileData) {
      const cachedProfile = Utils.storage.get('userProfile');
      if (cachedProfile) {
        console.log('[App] Using cached profile from localStorage (offline fallback)');
        profileData = cachedProfile;
      }
    }

    if (profileData) {
      // User has profile, load dashboard
      this.userProfile = profileData;

      // Check if user is admin, CR, Faculty, or blocked
      const rolesResult = await DB.getUserRoles(user.uid);

      // Use Firestore roles if available, otherwise fallback to localStorage
      if (rolesResult.success) {
        this.isAdmin = rolesResult.isAdmin;
        this.isCR = rolesResult.isCR;
        this.isFaculty = rolesResult.isFaculty;
        this.isDptCoor = rolesResult.isDptCoor || false;
        this.isBlocked = rolesResult.isBlocked;
      } else {
        console.log('[App] Using cached roles from localStorage (offline fallback)');
        this.isAdmin = Utils.storage.get('isAdmin') || false;
        this.isCR = Utils.storage.get('isCR') || false;
        this.isFaculty = Utils.storage.get('isFaculty') || false;
        this.isDptCoor = Utils.storage.get('isDptCoor') || false;
        this.isBlocked = Utils.storage.get('isBlocked') || false;
      }

      // Store authentic DB roles for reference
      this.realRoles = {
        isAdmin: this.isAdmin,
        isCR: this.isCR,
        isFaculty: this.isFaculty,
        isDptCoor: this.isDptCoor,
        isBlocked: this.isBlocked
      };

      // Check if Admin has a temporary session preview role active
      if (this.realRoles.isAdmin) {
        const savedPreview = sessionStorage.getItem('b1t_admin_preview_role');
        if (savedPreview && savedPreview !== 'none') {
          this.applyPreviewRole(savedPreview, false);
        } else {
          this.previewRole = null;
          UI.updatePreviewBanner(false);
        }
      } else {
        sessionStorage.removeItem('b1t_admin_preview_role');
        this.previewRole = null;
        UI.updatePreviewBanner(false);
      }

      // Update UI based on roles
      UI.toggleAdminControls(this.isAdmin, this.isCR, this.isFaculty);
      UI.toggleBlockedUserMode(this.isBlocked);

      // Force UI update for section visibility (Unit Note button)
      // This ensures buttons appear immediately after login/profile load
      UI.updateSectionVisibility(Router.getCurrentRoute(), true);

      // Update Approval Manager visibility
      if (typeof ApprovalManager !== 'undefined' && ApprovalManager.updateVisibility) {
        const activeRole = this.isAdmin ? 'Admin' : (this.isDptCoor ? 'DptCoor' : (this.isFaculty ? 'Faculty' : (this.isCR ? 'CR' : 'Student')));
        ApprovalManager.updateVisibility(activeRole, this.userProfile.department, this.isCR, this.isDptCoor, this.isAdmin);
      }

      // Initialize Note Manager with user ID
      if (typeof NoteManager !== 'undefined') {
        NoteManager.loadNote(user.uid);
      }

      // Auto-update semester if new semester cycle has started
      this.userProfile = await this.checkAndUpdateUserSemester(user.uid, this.userProfile);

      // Save to localStorage
      Utils.storage.set('userProfile', this.userProfile);
      Utils.storage.set('isAdmin', this.isAdmin);
      Utils.storage.set('isCR', this.isCR);
      Utils.storage.set('isFaculty', this.isFaculty);
      Utils.storage.set('isBlocked', this.isBlocked);

      // Update user details card
      UI.updateUserDetailsCard(
        this.userProfile.email,
        this.userProfile.department,
        this.userProfile.semester,
        this.userProfile.section
      );

      // Apply Dark Theme setting if it exists
      const userTheme = this.userProfile.theme || 'system';
      if (userTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('gray-mode');
      } else if (userTheme === 'light') {
        document.body.classList.remove('dark-mode');
        document.body.classList.remove('gray-mode');
      } else if (userTheme === 'gray') {
        document.body.classList.add('gray-mode');
        document.body.classList.remove('dark-mode');
      } else {
        // System default map
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.body.classList.add('dark-mode');
          document.body.classList.remove('gray-mode');
        } else {
          document.body.classList.remove('dark-mode');
          document.body.classList.remove('gray-mode');
        }
      }

      // Show/hide admin, CR, and Faculty controls
      UI.toggleAdminControls(this.isAdmin, this.isCR, this.isFaculty);

      // Show blocked user warning if applicable
      UI.toggleBlockedUserMode(this.isBlocked);

      // Initialize notification system
      await NotificationManager.init();

      // Set up Firestore listeners for notifications
      await FirestoreListenerManager.setupListeners(this.userProfile);

      // Initialize Faculty Classroom module if user is Faculty
      if (this.isFaculty) {
        await FacultyClassroom.init(user.uid);
      }

      // Navigate based on current route
      if (Router.getCurrentRoute() === 'profile-settings') {
        await Profile.loadProfile();
      } else {
        Router.navigate('dashboard');
        // Ensure data is loaded before we hide the loading screen
        await this.loadDashboardData(false);
        // Show semester auto-promotion notice if needed
        this.initHomeSemesterNotice();
      }
    } else if (profileResult.isNotFound) {
      // First-time login, show set details
      Router.navigate('set-details');
      await this.loadSetDetailsForm();
    } else {
      // Permission error or network failure
      console.error('[App] Failed to load user profile due to permission or network error:', profileResult.error);
      if (typeof UI !== 'undefined' && UI.showMessage) {
        UI.showMessage('auth-message', `Firebase error: ${profileResult.error || 'Permission denied'}. Please check authorized domains & rules in Firebase console.`, 'error');
      }
      Router.navigate('login');
    }

    // Wait for Google Classroom initialization (silent refresh) to complete
    // This hides the GIS flicker behind the loading screen
    if (this.classroomInitPromise) {
      console.log('[App] Waiting for Classroom initialization...');
      await this.classroomInitPromise;
    }

    UI.showLoading(false);
  },

  handleUnauthenticatedUser() {
    // If offline, check for cached profile before navigating to login
    if (!navigator.onLine) {
      const cachedProfile = Utils.storage.get('userProfile');
      if (cachedProfile) {
        console.log('[App] Offline with cached profile — loading dashboard from cache');
        this.userProfile = cachedProfile;
        this.isAdmin = Utils.storage.get('isAdmin') || false;
        this.isCR = Utils.storage.get('isCR') || false;
        this.isFaculty = Utils.storage.get('isFaculty') || false;
        this.isBlocked = Utils.storage.get('isBlocked') || false;

        // Update UI and navigate to dashboard
        UI.toggleAdminControls(this.isAdmin, this.isCR, this.isFaculty);
        UI.toggleBlockedUserMode(this.isBlocked);
        UI.updateUserDetailsCard(
          this.userProfile.email,
          this.userProfile.department,
          this.userProfile.semester,
          this.userProfile.section
        );
        Router.navigate('dashboard');
        this.loadDashboardData();
        UI.showLoading(false);
        return;
      }
    }

    Router.navigate('login');
    UI.showLoading(false);
    this.userProfile = null;
    this.isAdmin = false;
    this.isCR = false;
    this.isFaculty = false;
    this.isDptCoor = false;
    this.isBlocked = false;
    this.realRoles = null;
    this.previewRole = null;
    sessionStorage.removeItem('b1t_admin_preview_role');
    UI.updatePreviewBanner(false);
    Utils.storage.clear();

    // Hide dashboard-specific elements when not logged in
    const appFooter = document.getElementById('app-footer');
    const contribSection = document.getElementById('contributions-section');
    const taskExportSection = document.getElementById('task-export-section');
    const noteToggleMobile = document.getElementById('note-toggle');
    const noteButtonDesktop = document.getElementById('note-button-desktop');
    if (appFooter) appFooter.style.display = 'none';
    if (contribSection) contribSection.style.display = 'none';
    if (taskExportSection) taskExportSection.style.display = 'none';
    if (noteToggleMobile) noteToggleMobile.style.setProperty('display', 'none', 'important');
    if (noteButtonDesktop) noteButtonDesktop.style.setProperty('display', 'none', 'important');

    // Hide changelog modal if open
    if (typeof ChangelogModal !== 'undefined' && typeof ChangelogModal.close === 'function') {
      ChangelogModal.close();
    }
  },

  // Apply or exit Admin role preview simulation
  applyPreviewRole(role, reloadData = true) {
    if (!this.realRoles || !this.realRoles.isAdmin) return;

    if (!role || role === 'none' || role === 'Admin') {
      // Reset to default admin view
      this.previewRole = null;
      sessionStorage.removeItem('b1t_admin_preview_role');
      this.isAdmin = true;
      this.isCR = this.realRoles.isCR || false;
      this.isFaculty = this.realRoles.isFaculty || false;
      this.isDptCoor = this.realRoles.isDptCoor || false;
      this.isBlocked = this.realRoles.isBlocked || false;
      UI.updatePreviewBanner(false);
    } else {
      // Set preview role
      this.previewRole = role;
      sessionStorage.setItem('b1t_admin_preview_role', role);
      if (role === 'Faculty') {
        this.isAdmin = false;
        this.isCR = false;
        this.isFaculty = true;
        this.isDptCoor = false;
        this.isBlocked = false;
      } else if (role === 'DptCoor' || role === 'DptHead') {
        this.isAdmin = false;
        this.isCR = false;
        this.isFaculty = true;
        this.isDptCoor = true;
        this.isBlocked = false;
      } else if (role === 'CR') {
        this.isAdmin = false;
        this.isCR = true;
        this.isFaculty = false;
        this.isDptCoor = false;
        this.isBlocked = false;
      } else if (role === 'Student') {
        this.isAdmin = false;
        this.isCR = false;
        this.isFaculty = false;
        this.isDptCoor = false;
        this.isBlocked = false;
      } else if (role === 'Blocked') {
        this.isAdmin = false;
        this.isCR = false;
        this.isFaculty = false;
        this.isDptCoor = false;
        this.isBlocked = true;
      }
      UI.updatePreviewBanner(true, role);
    }

    // Update UI controls based on active preview roles
    UI.toggleAdminControls(this.isAdmin, this.isCR, this.isFaculty);
    UI.toggleBlockedUserMode(this.isBlocked);
    UI.updateSectionVisibility(Router.getCurrentRoute(), true);

    // Update Approval Manager visibility for preview
    if (typeof ApprovalManager !== 'undefined' && ApprovalManager.updateVisibility) {
      const activeRole = this.isAdmin ? 'Admin' : (this.isDptCoor ? 'DptCoor' : (this.isFaculty ? 'Faculty' : (this.isCR ? 'CR' : 'Student')));
      const dept = this.userProfile ? this.userProfile.department : 'CSE';
      ApprovalManager.updateVisibility(activeRole, dept, this.isCR, this.isDptCoor, this.isAdmin);
    }

    // Update Notice modal titles for faculty/DptCoor vs CR/Student
    const isFacultyOrDptCoor = this.isFaculty || this.isDptCoor;
    if (typeof NoticeViewer !== 'undefined' && typeof NoticeViewer.updateNoticeTitles === 'function') {
      NoticeViewer.updateNoticeTitles(isFacultyOrDptCoor);
    }
    if (typeof CRNoticeViewer !== 'undefined' && typeof CRNoticeViewer.updateNoticeTitles === 'function') {
      CRNoticeViewer.updateNoticeTitles(isFacultyOrDptCoor);
      CRNoticeViewer.checkCROrAdmin();
    }

    // Refresh profile UI if loaded
    if (typeof Profile !== 'undefined' && typeof Profile.updateRoleDisplay === 'function') {
      Profile.updateRoleDisplay();
    }

    // Reload dashboard data
    if (reloadData) {
      this.loadDashboardData();
    }
  },

  exitPreview() {
    this.applyPreviewRole('none', true);
  },

  async loadSetDetailsForm() {
    // Check if user pre-selected faculty or student during signup
    const signupRole = sessionStorage.getItem('signup_role');
    const facultyCheckbox = document.getElementById('set-is-faculty-checkbox');
    if (signupRole === 'faculty') {
      if (facultyCheckbox) facultyCheckbox.checked = true;
      this.toggleFacultySetDetails(true);
    } else if (signupRole === 'student') {
      if (facultyCheckbox) facultyCheckbox.checked = false;
      this.toggleFacultySetDetails(false);
    }

    // Load departments and semesters
    const deptResult = await DB.getDepartments();
    const semResult = await DB.getSemesters();

    if (deptResult.success) {
      await UI.populateDropdown('set-department', deptResult.data);
    }

    if (semResult.success) {
      await UI.populateDropdown('set-semester', semResult.data);
    }
  },

  async updateSetDetailsSections() {
    const department = document.getElementById('set-department').value;
    const semester = document.getElementById('set-semester').value;

    if (department && semester) {
      const result = await DB.getSections(department, semester);
      if (result.success) {
        await UI.populateDropdown('set-section', result.data);
      }
    }
  },

  toggleFacultySetDetails(isFaculty) {
    const idLabel = document.getElementById('set-id-label');
    const idInput = document.getElementById('set-student-id');
    const idHint = document.getElementById('set-id-hint');
    const semGroup = document.getElementById('set-semester-group');
    const secGroup = document.getElementById('set-section-group');
    const semSelect = document.getElementById('set-semester');
    const secSelect = document.getElementById('set-section');

    if (isFaculty) {
      if (idLabel) idLabel.textContent = 'Faculty Initial';
      if (idInput) {
        idInput.placeholder = 'Enter your faculty initial (e.g. ABC)';
        idInput.removeAttribute('pattern');
        idInput.removeAttribute('minlength');
        idInput.setAttribute('maxlength', '20');
      }
      if (idHint) idHint.textContent = 'Enter your official faculty initial / designation';
      if (semGroup) semGroup.style.display = 'none';
      if (secGroup) secGroup.style.display = 'none';
      if (semSelect) semSelect.removeAttribute('required');
      if (secSelect) secSelect.removeAttribute('required');
    } else {
      if (idLabel) idLabel.textContent = 'Student ID';
      if (idInput) {
        idInput.placeholder = 'Enter your 10-16 digit student ID';
        idInput.setAttribute('pattern', '[0-9]{10,16}');
        idInput.setAttribute('minlength', '10');
        idInput.setAttribute('maxlength', '16');
      }
      if (idHint) idHint.textContent = 'Your student ID must be 10-16 digits';
      if (semGroup) semGroup.style.display = 'block';
      if (secGroup) secGroup.style.display = 'block';
      if (semSelect) semSelect.setAttribute('required', 'required');
      if (secSelect) secSelect.setAttribute('required', 'required');
    }
  },

  async handleSetDetails() {
    const isFacultySignup = document.getElementById('set-is-faculty-checkbox')?.checked || false;
    const studentId = document.getElementById('set-student-id').value.trim();
    const department = document.getElementById('set-department').value;
    const semester = isFacultySignup ? null : document.getElementById('set-semester').value;
    const section = isFacultySignup ? null : document.getElementById('set-section').value;

    if (!studentId || !department || (!isFacultySignup && (!semester || !section))) {
      UI.showMessage('set-details-message', 'Please fill in all fields', 'error');
      return;
    }

    // Validate student ID only for regular students
    if (!isFacultySignup && !/^[0-9]{10,16}$/.test(studentId)) {
      UI.showMessage('set-details-message', 'Student ID must be 10-16 digits', 'error');
      return;
    }

    UI.showLoading(true);

    const userId = Auth.getUserId();
    const email = Auth.getUserEmail();

    const profilePayload = {
      email,
      studentId,
      department,
      semester,
      section,
      isFaculty: isFacultySignup,
      role: isFacultySignup ? 'Faculty' : 'Student',
      isApproved: isFacultySignup ? false : true,
      facultyInitial: isFacultySignup ? studentId : null
    };

    const result = await DB.createUserProfile(userId, profilePayload);

    if (result.success) {
      UI.showMessage('set-details-message', 'Details saved! Loading dashboard...', 'success');

      // Reload user profile
      const profileResult = await DB.getUserProfile(userId);
      if (profileResult.success) {
        this.userProfile = profileResult.data;
        Utils.storage.set('userProfile', this.userProfile);

        // Log user registration
        await ActivityLogger.logActivity('user_registered', {
          userId: userId,
          userName: this.userProfile.email.split('@')[0],
          userRole: ActivityLogger._determineRole(this.userProfile),
          department: this.userProfile.department,
          semester: this.userProfile.semester,
          section: this.userProfile.section
        });

        UI.updateUserDetailsCard(
          this.userProfile.email,
          this.userProfile.department,
          this.userProfile.semester,
          this.userProfile.section
        );

        setTimeout(() => {
          Router.navigate('dashboard');
          this.loadDashboardData();
        }, 1500);
      }
    } else {
      UI.showMessage('set-details-message', `Error: ${result.error}`, 'error');
    }
  },

  // Check and automatically update user semester if a new semester cycle has started
  async checkAndUpdateUserSemester(userId, profileData) {
    if (!profileData || this.isFaculty || profileData.role === 'Faculty' || !profileData.semester || profileData.semester === 'alumni / special') {
      return profileData;
    }

    // Skip auto-update if student updated profile manually within the last 30 days (cooldown active)
    if (!this.isAdmin && profileData.lastProfileChange) {
      const lastChange = profileData.lastProfileChange.toDate ?
        profileData.lastProfileChange.toDate() :
        new Date(profileData.lastProfileChange);
      if (!isNaN(lastChange.getTime())) {
        const daysSinceChange = (new Date() - lastChange) / (1000 * 60 * 60 * 24);
        if (daysSinceChange < 30) {
          console.log(`[Semester Auto-Update] Skipping auto-promotion for ${userId}: profile was updated manually ${Math.floor(daysSinceChange)} days ago (30-day cooldown active).`);
          return profileData;
        }
      }
    }

    try {
      const currentCycle = Utils.getSemesterCycle();
      const lastCycle = profileData.lastSemesterCycle;

      if (!lastCycle) {
        // If lastSemesterCycle was never set, initialize it to current cycle
        profileData.lastSemesterCycle = currentCycle;
        await DB.updateUserProfile(userId, { lastSemesterCycle: currentCycle });
        return profileData;
      }

      const elapsed = Utils.getElapsedSemesterCycles(lastCycle, currentCycle);
      if (elapsed > 0) {
        const oldSem = profileData.semester;
        const newSem = Utils.incrementSemester(oldSem, elapsed);
        if (newSem !== oldSem) {
          console.log(`[Semester Auto-Update] Advancing semester from ${oldSem} to ${newSem} for cycle ${currentCycle}`);
          profileData.semester = newSem;
          profileData.lastSemesterCycle = currentCycle;
          // Clear dismissed flag so user sees notice for the newly triggered semester update
          delete profileData.semesterNoticeDismissedCycle;
          localStorage.removeItem('semesterNoticeDismissedCycle');
          await DB.updateUserProfile(userId, {
            semester: newSem,
            lastSemesterCycle: currentCycle,
            semesterNoticeDismissedCycle: firebase.firestore.FieldValue.delete()
          });
          Utils.storage.set('userProfile', profileData);

          // Show auto-update popup instruction modal
          setTimeout(() => {
            this.showSemesterAutoUpdateModal(oldSem, newSem);
          }, 800);
        }
      }
    } catch (err) {
      console.error('[Semester Auto-Update] Error checking user semester update:', err);
    }
    return profileData;
  },

  // Display popup modal instructing user about automatic semester update
  showSemesterAutoUpdateModal(oldSem, newSem) {
    const modal = document.getElementById('semester-update-modal');
    if (!modal) return;

    const oldEl = document.getElementById('semester-old-val');
    const newEl = document.getElementById('semester-new-val');
    if (oldEl) oldEl.textContent = oldSem;
    if (newEl) newEl.textContent = newSem;

    modal.style.display = 'flex';

    const checkBtn = document.getElementById('semester-modal-check-btn');
    const closeBtn = document.getElementById('semester-modal-close-btn');

    if (checkBtn) {
      checkBtn.onclick = () => {
        modal.style.display = 'none';
        Router.navigate('profile-settings');
      };
    }

    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.style.display = 'none';
      };
    }
  },

  // Initialize homepage semester auto-promotion notice banner
  initHomeSemesterNotice() {
    // Only show for non-faculty, non-admin, non-blocked students
    if (this.isFaculty || !this.userProfile) return;

    const card = document.getElementById('home-semester-notice-card');
    if (!card) return;

    const currentCycle = typeof Utils !== 'undefined' && typeof Utils.getSemesterCycle === 'function' ?
      Utils.getSemesterCycle() : null;

    if (!currentCycle) return;

    // Dedicated database flag check:
    // Check if dismissed in the user's Firestore profile or fallback to localStorage
    const dismissedCycle = (this.userProfile && this.userProfile.semesterNoticeDismissedCycle) ||
      localStorage.getItem('semesterNoticeDismissedCycle');

    if (dismissedCycle === currentCycle) {
      card.style.display = 'none';
      return;
    } else {
      card.style.display = 'flex';
    }

    // Helper to persist dismiss state both in Firebase database and locally
    const dismissNotice = async () => {
      // 1. Update local storage
      localStorage.setItem('semesterNoticeDismissedCycle', currentCycle);

      // 2. Update in-memory user profile
      if (this.userProfile) {
        this.userProfile.semesterNoticeDismissedCycle = currentCycle;
        Utils.storage.set('userProfile', this.userProfile);
      }

      // 3. Persist dedicated flag to Firebase database for the user
      const userId = (this.currentUser && this.currentUser.uid) ||
        (typeof Auth !== 'undefined' && Auth.getUserId && Auth.getUserId());
      if (userId) {
        try {
          await DB.updateUserProfile(userId, {
            semesterNoticeDismissedCycle: currentCycle
          });
        } catch (err) {
          console.warn('[Semester Notice] Could not save dismiss flag to Firestore:', err);
        }
      }
    };

    // "Check Profile" button navigates to Profile Settings and dismisses notice for current cycle
    const checkBtn = document.getElementById('home-semester-notice-check-btn');
    if (checkBtn) {
      checkBtn.onclick = async () => {
        card.style.display = 'none';
        await dismissNotice();
        Router.navigate('profile-settings');
      };
    }

    // Dismiss button hides banner for current semester cycle
    const dismissBtn = document.getElementById('home-semester-notice-dismiss-btn');
    if (dismissBtn) {
      dismissBtn.onclick = () => {
        card.style.animation = 'semesterNoticeSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) reverse both';
        setTimeout(async () => {
          card.style.display = 'none';
          await dismissNotice();
        }, 230);
      };
    }
  },

  // Open admin bulk semester update confirmation modal
  async openAdminBulkSemesterModal() {
    const modal = document.getElementById('admin-bulk-semester-modal');
    if (!modal) return;

    // Reset status & clear any running 30s timer
    if (this.adminModalTimer) {
      clearInterval(this.adminModalTimer);
      this.adminModalTimer = null;
    }

    const statusArea = document.getElementById('admin-bulk-semester-status');
    const progressEl = document.getElementById('admin-bulk-semester-progress');
    const resultEl = document.getElementById('admin-bulk-semester-result');
    const confirmBtn = document.getElementById('confirm-admin-bulk-semester');
    const cancelBtn = document.getElementById('cancel-admin-bulk-semester');
    const closeBtn = document.getElementById('close-admin-bulk-semester-modal');
    const cooldownAlert = document.getElementById('admin-semester-cooldown-alert');
    const cooldownText = document.getElementById('admin-semester-cooldown-alert-text');

    if (statusArea) statusArea.style.display = 'none';
    if (progressEl) progressEl.style.display = 'none';
    if (resultEl) { resultEl.style.display = 'none'; resultEl.textContent = ''; resultEl.className = 'admin-bulk-semester-result'; }
    if (cancelBtn) { cancelBtn.disabled = false; cancelBtn.textContent = 'Cancel'; }
    if (closeBtn) closeBtn.disabled = false;

    // Check 6-month cooldown for admin bulk update (180 days)
    let isCooldownActive = false;
    let daysRemaining = 0;
    let daysSinceUpdate = 0;
    const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;

    try {
      const configRes = await DB.getSemesterConfig();
      if (configRes.success && configRes.data && configRes.data.lastBulkUpdate) {
        const lastUpdate = configRes.data.lastBulkUpdate.toDate ?
          configRes.data.lastBulkUpdate.toDate() :
          new Date(configRes.data.lastBulkUpdate);
        if (!isNaN(lastUpdate.getTime())) {
          const diffMs = new Date() - lastUpdate;
          if (diffMs < SIX_MONTHS_MS) {
            isCooldownActive = true;
            daysSinceUpdate = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            daysRemaining = Math.ceil((SIX_MONTHS_MS - diffMs) / (1000 * 60 * 60 * 24));
          }
        }
      }
    } catch (err) {
      console.warn('[Admin Bulk Semester] Could not check cooldown from DB:', err);
    }

    if (isCooldownActive) {
      if (cooldownAlert && cooldownText) {
        cooldownText.innerHTML = `<strong>6-Month Cooldown Active:</strong> Bulk semester auto-update was executed ${daysSinceUpdate} day${daysSinceUpdate !== 1 ? 's' : ''} ago. Cooldown expires in <strong>${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}</strong>.`;
        cooldownAlert.style.display = 'flex';
      }
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = `<i class="fas fa-lock"></i> Cooldown Active (${daysRemaining}d)`;
      }
    } else {
      if (cooldownAlert) cooldownAlert.style.display = 'none';

      // 30-second read-only verification delay for fail-safe check
      let timerSeconds = 30;
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = `<i class="fas fa-clock"></i> Verify auto-updates first (${timerSeconds}s)`;
      }

      this.adminModalTimer = setInterval(() => {
        timerSeconds--;
        if (timerSeconds > 0) {
          if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = `<i class="fas fa-clock"></i> Verify auto-updates first (${timerSeconds}s)`;
          }
        } else {
          clearInterval(this.adminModalTimer);
          this.adminModalTimer = null;
          if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="fas fa-bolt"></i> Confirm &amp; Update';
          }
        }
      }, 1000);
    }

    modal.style.display = 'flex';
  },

  // Execute admin bulk semester update
  async handleAdminBulkSemesterUpdate() {
    if (!this.isAdmin) return;

    const modal = document.getElementById('admin-bulk-semester-modal');
    const statusArea = document.getElementById('admin-bulk-semester-status');
    const progressEl = document.getElementById('admin-bulk-semester-progress');
    const resultEl = document.getElementById('admin-bulk-semester-result');
    const confirmBtn = document.getElementById('confirm-admin-bulk-semester');
    const cancelBtn = document.getElementById('cancel-admin-bulk-semester');
    const closeBtn = document.getElementById('close-admin-bulk-semester-modal');

    // Lock UI
    if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...'; }
    if (cancelBtn) cancelBtn.disabled = true;
    if (closeBtn) closeBtn.disabled = true;
    if (statusArea) statusArea.style.display = 'block';
    if (progressEl) progressEl.style.display = 'flex';
    if (resultEl) { resultEl.style.display = 'none'; }

    try {
      // updateAllUserSemesters is defined in js/update-user-semesters.js
      if (typeof window.updateAllUserSemesters !== 'function') {
        throw new Error('Migration script not loaded. Please refresh and try again.');
      }

      const result = await window.updateAllUserSemesters();

      if (progressEl) progressEl.style.display = 'none';

      if (result && result.success) {
        // Record bulk update timestamp in Firestore for 6-month cooldown
        await DB.recordAdminBulkSemesterUpdate(Utils.getSemesterCycle());

        if (resultEl) {
          resultEl.innerHTML = `
            <i class="fas fa-check-circle" style="color: #059669; margin-right: 6px;"></i>
            <strong>Update Complete!</strong><br>
            <span style="font-size:0.84rem;">
              Updated: <strong>${result.totalUpdated}</strong> users &nbsp;|&nbsp;
              Skipped: <strong>${result.totalSkipped}</strong> &nbsp;|&nbsp;
              Total: <strong>${result.totalProcessed}</strong>
            </span>`;
          resultEl.className = 'admin-bulk-semester-result success';
          resultEl.style.display = 'block';
        }
        // Refresh user list in the background
        setTimeout(() => this.loadUserManagement(), 1200);
      } else {
        throw new Error(result && result.error ? result.error : 'Unknown error during update.');
      }
    } catch (err) {
      console.error('[Admin Bulk Semester Update] Error:', err);
      if (progressEl) progressEl.style.display = 'none';
      if (resultEl) {
        resultEl.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: #dc2626; margin-right: 6px;"></i>
          <strong>Error:</strong> ${err.message}`;
        resultEl.className = 'admin-bulk-semester-result error';
        resultEl.style.display = 'block';
      }
    } finally {
      // Re-enable close buttons but keep confirm locked if success
      if (cancelBtn) { cancelBtn.disabled = false; cancelBtn.textContent = 'Close'; }
      if (closeBtn) closeBtn.disabled = false;
    }
  },

  async loadDashboardData(showLoader = true) {
    if (!this.userProfile || this.isLoadingData) return;
    this.isLoadingData = true;

    try {
      if (showLoader) UI.showLoading(true);

      const userId = Auth.getUserId();
      const { department, semester, section } = this.userProfile;

      // Load resource links
      const resourceResult = await DB.getResourceLinks(department);
      if (resourceResult.success) {
        UI.renderResourceLinks(resourceResult.data);
      }

      // Load user's task completions
      const completionsResult = await DB.getUserTaskCompletions(userId);
      if (completionsResult.success) {
        this.userCompletions = completionsResult.data;
      }

      // Load tasks
      let tasksResult;
      if (this.isFaculty) {
        tasksResult = await DB.getFacultyTasks(department);
      } else {
        tasksResult = await DB.getTasks(department, semester, section);
      }

      if (tasksResult.success) {
        this.currentTasks = tasksResult.data;
        UI.renderTasks(this.currentTasks, this.userCompletions, this.isAdmin, this.isCR, userId);
        if (this.calendarView) {
          this.calendarView.onTasksUpdated();
        }
      }

      // Concurrently fetch internal events & external raider events
      const [eventsResult, raiderEvents] = await Promise.all([
        DB.getEvents(department),
        (typeof RaidsFeed !== 'undefined') ? RaidsFeed.fetchActiveRaiderEvents() : Promise.resolve([])
      ]);

      if (eventsResult && eventsResult.success) {
        this.currentEvents = eventsResult.data;
        UI.renderEvents(this.currentEvents, this.isAdmin, this.isCR, this.isFaculty, userId);
      }

      this.currentRaiderEvents = raiderEvents || [];
      if (typeof UI.renderRaiderEvents === 'function') {
        UI.renderRaiderEvents(this.currentRaiderEvents);
      }

      this.setupTaskFilterListeners();

      // Re-apply current filter if set
      this.reapplyActiveTaskFilter();
      const activeRadio = document.querySelector('input[name="task-filter"]:checked');
      const clearBtn = document.getElementById('clear-task-filter-btn');
      if (clearBtn) {
        clearBtn.style.display = (activeRadio && activeRadio.value !== 'all') ? 'inline-flex' : 'none';
      }

      this.updateUserCount();
      this.initHomeSemesterNotice();

      // Check and show changelog modal if new version is available
      if (typeof ChangelogModal !== 'undefined' && typeof ChangelogModal.checkAndShowChangelog === 'function') {
        ChangelogModal.checkAndShowChangelog();
      }
    } catch (error) {
      console.error('[App] Error in loadDashboardData:', error);
    } finally {
      this.isLoadingData = false;
      if (showLoader) UI.showLoading(false);
    }
  },

  // ============================================
  // ADMIN FUNCTIONS
  // ============================================

  setupAdminEventListeners() {
    // Reset Tasks button (admin)
    const resetTasksBtn = document.getElementById('reset-tasks-btn');
    if (resetTasksBtn) {
      resetTasksBtn.addEventListener('click', async () => {
        await this.handleResetTasks();
      });
    }

    // Delete task delegation (handles dynamically added delete buttons)
    const tasksContainer = document.getElementById('tasks-container');
    if (tasksContainer) {
      tasksContainer.addEventListener('click', async (e) => {
        if (e.target.closest('.task-delete-btn')) {
          const taskId = e.target.closest('.task-delete-btn').dataset.taskId;
          await this.handleDeleteTask(taskId);
        }
        if (e.target.closest('.task-edit-btn')) {
          const taskId = e.target.closest('.task-edit-btn').dataset.taskId;
          await this.openEditTaskModal(taskId);
        }
      });
    }

    // Add Event button (admin) - Desktop
    const addEventBtn = document.getElementById('add-event-btn');
    if (addEventBtn) {
      addEventBtn.addEventListener('click', () => {
        this.openAddEventModal();
      });
    }

    // Add Event button (admin) - Mobile
    const addEventBtnMobile = document.getElementById('add-event-btn-mobile');
    if (addEventBtnMobile) {
      addEventBtnMobile.addEventListener('click', () => {
        UI.toggleEventsSidebar(false);
        this.openAddEventModal();
      });
    }

    // Add Event form
    const addEventForm = document.getElementById('add-event-form');
    if (addEventForm) {
      addEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleAddEvent();
      });
    }

    // Add Event modal close buttons
    const closeAddEventModal = document.getElementById('close-add-event-modal');
    const cancelAddEvent = document.getElementById('cancel-add-event');
    if (closeAddEventModal) {
      closeAddEventModal.addEventListener('click', () => UI.hideModal('add-event-modal'));
    }
    if (cancelAddEvent) {
      cancelAddEvent.addEventListener('click', () => UI.hideModal('add-event-modal'));
    }

    // View Old Events button - Desktop
    const viewOldEventsBtn = document.getElementById('view-old-events-btn');
    if (viewOldEventsBtn) {
      viewOldEventsBtn.addEventListener('click', async () => {
        await this.openOldEventsModal();
      });
    }

    // View Old Events button - Mobile
    const viewOldEventsBtnMobile = document.getElementById('view-old-events-btn-mobile');
    if (viewOldEventsBtnMobile) {
      viewOldEventsBtnMobile.addEventListener('click', async () => {
        UI.toggleEventsSidebar(false);
        await this.openOldEventsModal();
      });
    }

    // Old Events modal close
    const closeOldEventsModal = document.getElementById('close-old-events-modal');
    if (closeOldEventsModal) {
      closeOldEventsModal.addEventListener('click', () => UI.hideModal('old-events-modal'));
    }

    // Delete event delegation (for desktop and mobile containers)
    const eventsContainers = [
      document.getElementById('events-container'),
      document.getElementById('events-container-mobile')
    ];
    eventsContainers.forEach(container => {
      if (container) {
        container.addEventListener('click', async (e) => {
          if (e.target.closest('.event-delete-btn')) {
            const eventId = e.target.closest('.event-delete-btn').dataset.eventId;
            await this.handleDeleteEvent(eventId);
          }
          if (e.target.closest('.event-edit-btn')) {
            const eventId = e.target.closest('.event-edit-btn').dataset.eventId;
            await this.openEditEventModal(eventId);
          }
        });
      }
    });

    // Edit Task modal listeners
    const closeEditTaskModal = document.getElementById('close-edit-task-modal');
    const cancelEditTask = document.getElementById('cancel-edit-task');
    if (closeEditTaskModal) {
      closeEditTaskModal.addEventListener('click', () => UI.hideModal('edit-task-modal'));
    }
    if (cancelEditTask) {
      cancelEditTask.addEventListener('click', () => UI.hideModal('edit-task-modal'));
    }

    // Edit Task form
    const editTaskForm = document.getElementById('edit-task-form');
    if (editTaskForm) {
      editTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleEditTask();
      });
    }

    // Edit Event modal listeners
    const closeEditEventModal = document.getElementById('close-edit-event-modal');
    const cancelEditEvent = document.getElementById('cancel-edit-event');
    if (closeEditEventModal) {
      closeEditEventModal.addEventListener('click', () => UI.hideModal('edit-event-modal'));
    }
    if (cancelEditEvent) {
      cancelEditEvent.addEventListener('click', () => UI.hideModal('edit-event-modal'));
    }

    // Edit Event form
    const editEventForm = document.getElementById('edit-event-form');
    if (editEventForm) {
      editEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleEditEvent();
      });
    }
  },

  setupTaskFilterListeners() {
    const filterLabels = document.querySelectorAll('.task-filter-label');
    const filterRadios = document.querySelectorAll('input[name="task-filter"]');
    const clearFilterBtn = document.getElementById('clear-task-filter-btn');

    filterLabels.forEach(label => {
      label.onclick = (e) => {
        const radio = label.querySelector('input[name="task-filter"]');
        if (radio) {
          radio.checked = true;
          this.currentFilter = radio.value;
          this.filterTasksByType(radio.value);
          if (clearFilterBtn) clearFilterBtn.style.display = 'inline-flex';
        }
      };
    });

    filterRadios.forEach(radio => {
      radio.onchange = (e) => {
        this.currentFilter = e.target.value;
        this.filterTasksByType(e.target.value);
        if (clearFilterBtn) clearFilterBtn.style.display = 'inline-flex';
      };
    });

    if (clearFilterBtn) {
      clearFilterBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Uncheck all radios
        filterRadios.forEach(radio => radio.checked = false);
        // Show all tasks
        this.currentFilter = 'all';
        this.filterTasksByType('all');
        clearFilterBtn.style.display = 'none';
      };
    }

    // Faculty Department Filter
    if (this.isFaculty) {
      this.setupFacultyDepartmentFilter();
    }

    // Contributions Button
    const contributionsBtn = document.getElementById('contributions-btn');
    if (contributionsBtn) {
      contributionsBtn.addEventListener('click', () => {
        this.showContributionsModal(false); // Default to local
      });
    }

    // Contributions Toggle
    const contributionsToggle = document.getElementById('contributions-scope-toggle');
    if (contributionsToggle) {
      contributionsToggle.addEventListener('change', (e) => {
        this.showContributionsModal(e.target.checked);
      });
    }

    // Contributions Modal Close
    const closeContributionsModal = document.getElementById('close-contributions-modal');
    if (closeContributionsModal) {
      closeContributionsModal.addEventListener('click', () => UI.hideModal('contributions-modal'));
    }
  },

  reapplyActiveTaskFilter() {
    const activeRadio = document.querySelector('input[name="task-filter"]:checked');
    const filter = (activeRadio && activeRadio.value) || this.currentFilter || 'all';
    this.filterTasksByType(filter);
  },

  filterTasksByType(type) {
    const activeRadio = document.querySelector('input[name="task-filter"]:checked');
    if (!type || type === 'all') {
      if (activeRadio && activeRadio.value) {
        type = activeRadio.value;
      } else {
        type = 'all';
      }
    }
    this.currentFilter = type;
    const container = document.getElementById('tasks-container');
    if (!container) return;

    const tasks = container.querySelectorAll('.task-card');
    let visibleCount = 0;
    const normalizedTarget = (this.currentFilter || 'all').toLowerCase().trim();

    tasks.forEach(task => {
      const taskType = (task.dataset.type || 'other').toLowerCase().trim();
      if (normalizedTarget === 'all' || taskType === normalizedTarget) {
        task.style.setProperty('display', 'block', 'important');
        visibleCount++;
      } else {
        task.style.setProperty('display', 'none', 'important');
      }
    });

    // Handle faculty task groups: hide group container if all tasks within it are filtered out
    container.querySelectorAll('.faculty-task-group').forEach(group => {
      const groupVisibleTasks = Array.from(group.querySelectorAll('.task-card')).filter(card => card.style.display !== 'none');
      group.style.display = groupVisibleTasks.length > 0 ? '' : 'none';
    });

    // Handle clear button display
    const clearBtn = document.getElementById('clear-task-filter-btn');
    if (clearBtn) {
      clearBtn.style.display = (this.currentFilter && this.currentFilter !== 'all') ? 'inline-flex' : 'none';
    }

    // Handle no tasks message
    const noTasksMsg = document.getElementById('no-tasks-message');
    if (noTasksMsg) {
      if (visibleCount === 0) {
        noTasksMsg.style.display = 'block';
        const p = noTasksMsg.querySelector('p');
        if (p) {
          p.textContent = normalizedTarget === 'all'
            ? "No pending tasks! You're all caught up."
            : `No pending ${type} tasks found.`;
        }
      } else {
        noTasksMsg.style.display = 'none';
      }
    }
  },

  async setupFacultyDepartmentFilter() {
    const filterContainer = document.getElementById('faculty-department-filter');
    if (filterContainer) {
      filterContainer.style.display = 'none';
    }
  },

  filterTasksByDepartment(department) {
    const facultyGroups = document.querySelectorAll('.faculty-task-group');
    let visibleCount = 0;

    facultyGroups.forEach(group => {
      const header = group.querySelector('.faculty-task-group-header span');
      if (!header) return;

      const groupDept = header.textContent.replace('Faculty Tasks - ', '').trim();

      if (department === 'all' || groupDept === department) {
        group.style.display = 'block';
        // Count visible tasks in this group
        const tasks = group.querySelectorAll('.task-card');
        tasks.forEach(task => {
          if (task.style.display !== 'none') {
            visibleCount++;
          }
        });
      } else {
        group.style.display = 'none';
      }
    });

    // Handle no tasks message
    const noTasksMsg = document.getElementById('no-tasks-message');
    if (noTasksMsg && this.isFaculty) {
      if (visibleCount === 0) {
        noTasksMsg.style.display = 'block';
        noTasksMsg.querySelector('p').textContent = department === 'all'
          ? "No Faculty tasks found."
          : `No Faculty tasks found for ${department}.`;
      } else {
        noTasksMsg.style.display = 'none';
      }
    }
  },

  async showContributionsModal(isGlobal = false) {
    const container = document.getElementById('contributions-container');
    const noDataMsg = document.getElementById('no-contributions-message');
    const toggle = document.getElementById('contributions-scope-toggle');
    const subtitle = document.querySelector('.contributions-subtitle');

    // Sync toggle state if called from button click
    if (toggle && toggle.checked !== isGlobal) {
      toggle.checked = isGlobal;
    }

    container.innerHTML = '<div class="loading-spinner" style="margin: 20px auto;"></div>';
    UI.showModal('contributions-modal');

    // Update subtitle based on scope
    if (subtitle) {
      subtitle.textContent = isGlobal
        ? "Top contributors across all departments"
        : "People who have added tasks in your group";
    }

    let tasksToCount = [];

    if (isGlobal) {
      const result = await DB.getAllActiveTasks();
      if (result.success) {
        tasksToCount = result.data;
      } else {
        console.error('Failed to load global tasks');
        container.innerHTML = '<p class="text-danger">Failed to load global data.</p>';
        return;
      }
    } else {
      tasksToCount = this.currentTasks || [];
    }

    if (tasksToCount.length === 0) {
      container.innerHTML = '';
      noDataMsg.style.display = 'block';
      return;
    }

    noDataMsg.style.display = 'none';

    // Aggregate contributions with role information
    const contributions = {};
    tasksToCount.forEach(task => {
      // Use addedByName (name part of email) or 'Unknown'
      const contributor = task.addedByName || 'Unknown';
      const role = task.addedByRole || 'Student';

      if (!contributions[contributor]) {
        contributions[contributor] = { count: 0, role: role };
      }
      contributions[contributor].count += 1;
    });

    // Convert to array and sort
    const sortedContributors = Object.entries(contributions)
      .map(([name, data]) => ({ name, count: data.count, role: data.role }))
      .sort((a, b) => b.count - a.count);

    // Render table
    let html = `
      <table class="contributions-table">
        <thead>
          <tr>
            <th class="rank-col">#</th>
            <th>Contributor</th>
            <th class="count-col">Tasks</th>
          </tr>
        </thead>
        <tbody>
    `;

    html += sortedContributors.map((c, index) => {
      // Add role badge for CR and Faculty
      let roleBadge = '';
      if (c.role === 'CR') {
        roleBadge = '<span class="role-badge role-badge-cr">CR</span>';
      } else if (c.role === 'Faculty') {
        roleBadge = '<span class="role-badge role-badge-faculty">Faculty</span>';
      }

      return `
        <tr>
          <td class="rank-col">${index + 1}</td>
          <td>${c.name} ${roleBadge}</td>
          <td class="count-col">${c.count}</td>
        </tr>
      `;
    }).join('');

    html += `</tbody></table>`;
    container.innerHTML = html;
  },

  async updateUserCount() {
    const countElModal = document.getElementById('total-user-count-modal');
    const countElFooter = document.getElementById('total-user-count-footer');
    // Legacy fallback or checks
    const counterContainer = document.getElementById('total-user-counter');

    try {
      let count = 0;
      let usedCache = false;

      if (this.isAdmin) {
        // Admin: Fetch real count and update cache
        const result = await DB.getAllUsers();
        if (result.success) {
          count = result.data.length;
          // Update cache asynchronously
          DB.updateUserCountCache(count);
        } else {
          const cacheResult = await DB.getUserCountFromCache();
          if (cacheResult.success) {
            count = cacheResult.count;
            usedCache = true;
          }
        }
      } else {
        // Non-Admin: Read from cache
        const cacheResult = await DB.getUserCountFromCache();
        if (cacheResult.success) {
          count = cacheResult.count;
          usedCache = true;
        }
      }

      if (count > 0) {
        if (countElModal) countElModal.textContent = count;
        if (countElFooter) countElFooter.textContent = count;
      }
    } catch (e) {
      console.warn('Error fetching user count:', e);
    }
  },

  async handleResetTasks() {
    if (!this.isAdmin && !this.isCR) return;

    const confirmed = confirm('Are you sure you want to reset all old/past tasks? This action cannot be undone.');
    if (!confirmed) return;

    const { department, semester, section } = this.userProfile;
    const result = await DB.resetOldTasks(department, semester, section);

    if (result.success) {
      alert(`Successfully reset ${result.deletedCount} old tasks.`);
      await this.loadDashboardData();
    } else {
      alert('Failed to reset tasks: ' + result.error);
    }
  },

  async handleDeleteTask(taskId) {
    // Check if user is blocked
    if (this.isBlocked) {
      alert('Your account has been restricted. You cannot delete tasks.');
      return;
    }

    // Find the task to check ownership
    const task = this.currentTasks.find(t => t.id === taskId);
    if (!task) return;

    // Check permissions: Admin/CR can delete any, users can only delete their own
    const userId = Auth.getUserId();
    const canDelete = this.isAdmin || this.isCR || (userId && task.addedBy === userId);
    if (!canDelete) {
      alert('You do not have permission to delete this task');
      return;
    }

    const confirmed = confirm('Are you sure you want to delete this task?');
    if (!confirmed) return;

    const result = await DB.deleteTask(taskId);

    if (result.success) {
      // Log task deletion activity
      await ActivityLogger.logTaskDeletion(taskId, task, userId, this.userProfile);

      // Remove from local state and re-render
      this.currentTasks = this.currentTasks.filter(t => t.id !== taskId);
      UI.renderTasks(this.currentTasks, this.userCompletions, this.isAdmin, this.isCR, Auth.getUserId());

      // Re-apply active filter directly — must run AFTER renderTasks rebuilds the DOM
      const activeRadio = document.querySelector('input[name="task-filter"]:checked');
      const activeFilter = (activeRadio && activeRadio.value) || this.currentFilter;
      if (activeFilter && activeFilter !== 'all') {
        this.filterTasksByType(activeFilter);
      }

      // Notify calendar view of task updates
      if (this.calendarView) {
        this.calendarView.onTasksUpdated();
      }
    } else {
      alert('Failed to delete task: ' + result.error);
    }
  },

  async populateEventDepartmentDropdown(selectId, selectedValue = 'ALL') {
    const select = document.getElementById(selectId);
    if (!select) return;

    const deptResult = await DB.getDepartments();
    const depts = deptResult.success && deptResult.data.length > 0 ? deptResult.data : ['CSE', 'IT', 'CE', 'EEE', 'BBA', 'Pharmacy', 'Law', 'English', 'Social Work'];

    select.innerHTML = '<option value="ALL">All Departments</option>';
    depts.forEach(dept => {
      const option = document.createElement('option');
      option.value = dept;
      option.textContent = `${dept} Only`;
      if (selectedValue && (selectedValue === dept || selectedValue === `${dept} Only`)) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    if (selectedValue === 'ALL') {
      select.value = 'ALL';
    } else if (selectedValue) {
      select.value = selectedValue;
    }
  },

  async openAddEventModal() {
    // Set minimum date to now
    const dateInput = document.getElementById('event-date');
    if (dateInput) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      dateInput.min = now.toISOString().slice(0, 16);
    }

    // Clear form
    document.getElementById('add-event-form').reset();

    // Populate dynamic departments
    await this.populateEventDepartmentDropdown('event-department', 'ALL');

    // CR can only add events for their own department
    const deptSelect = document.getElementById('event-department');
    if (this.isCR && !this.isAdmin && deptSelect) {
      deptSelect.value = this.userProfile.department;
      deptSelect.disabled = true;
    } else if (deptSelect) {
      deptSelect.disabled = false;
    }

    UI.showModal('add-event-modal');
  },

  async handleAddEvent() {
    const title = document.getElementById('event-title').value.trim();
    const description = document.getElementById('event-description').value.trim();
    const date = document.getElementById('event-date').value;
    let department = document.getElementById('event-department').value;

    if (!title || !date) {
      alert('Please fill in the required fields (Title and Date)');
      return;
    }

    const userId = Auth.getUserId();

    // CR can only create events for their own semester, Faculty can only create events for their own department
    if ((this.isCR || this.isFaculty) && !this.isAdmin) {
      department = this.userProfile.department;
    }

    // Determine the "Added by" label
    let createdByName = 'Admin';
    if (this.isCR) createdByName = 'CR';
    else if (this.isFaculty) createdByName = 'Faculty';

    const result = await DB.createEvent({
      title,
      description,
      date,
      department,
      semester: this.userProfile.semester, // Include semester for CR validation
      createdBy: userId,
      createdByName
    });

    if (result.success) {
      // Log event addition activity
      await ActivityLogger.logEventAddition(
        result.id,
        {
          title,
          date,
          department,
          semester: this.userProfile.semester
        },
        this.userProfile
      );

      UI.hideModal('add-event-modal');
      // Refresh events
      await this.loadDashboardData();
    } else {
      alert('Failed to add event: ' + result.error);
    }
  },

  async openOldEventsModal() {
    UI.showModal('old-events-modal');

    if (!this.userProfile) return;

    const { department } = this.userProfile;

    const result = await DB.getOldEvents(department);
    if (result.success) {
      this.oldEvents = result.data;
      UI.renderOldEvents(result.data);
    }
  },

  // ============================================
  // USER MANAGEMENT (Admin Only)
  // ============================================

  setupUserManagementListeners() {
    // Manage Users button
    const manageUsersBtn = document.getElementById('manage-users-btn');
    if (manageUsersBtn) {
      manageUsersBtn.addEventListener('click', () => {
        Router.navigate('user-management');
      });
    }

    // Back to Profile from User Management
    const backToProfileBtn = document.getElementById('back-to-profile-btn');
    if (backToProfileBtn) {
      backToProfileBtn.addEventListener('click', () => {
        Router.navigate('profile-settings');
      });
    }

    // Admin Bulk Semester Update button
    const adminBulkSemBtn = document.getElementById('admin-bulk-semester-btn');
    if (adminBulkSemBtn) {
      adminBulkSemBtn.addEventListener('click', () => {
        this.openAdminBulkSemesterModal();
      });
    }

    // Admin Bulk Semester modal — close/cancel
    const closeAdminBulkModal = document.getElementById('close-admin-bulk-semester-modal');
    const cancelAdminBulkSem = document.getElementById('cancel-admin-bulk-semester');
    [closeAdminBulkModal, cancelAdminBulkSem].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          if (this.adminModalTimer) {
            clearInterval(this.adminModalTimer);
            this.adminModalTimer = null;
          }
          const modal = document.getElementById('admin-bulk-semester-modal');
          if (modal) modal.style.display = 'none';
        });
      }
    });

    // Admin Bulk Semester modal — confirm
    const confirmAdminBulkSem = document.getElementById('confirm-admin-bulk-semester');
    if (confirmAdminBulkSem) {
      confirmAdminBulkSem.addEventListener('click', () => {
        this.handleAdminBulkSemesterUpdate();
      });
    }

    // User Search input & clear button
    const userSearchInput = document.getElementById('user-search-input');
    const clearUserSearchBtn = document.getElementById('clear-user-search-btn');

    if (userSearchInput) {
      userSearchInput.addEventListener('input', () => {
        if (clearUserSearchBtn) {
          clearUserSearchBtn.style.display = userSearchInput.value.trim() ? 'flex' : 'none';
        }
        this.filterUsers();
      });
    }

    if (clearUserSearchBtn) {
      clearUserSearchBtn.addEventListener('click', () => {
        if (userSearchInput) {
          userSearchInput.value = '';
        }
        clearUserSearchBtn.style.display = 'none';
        this.filterUsers();
      });
    }

    // User filter inputs
    const filterInputs = ['filter-department', 'filter-semester', 'filter-section', 'filter-role'];
    filterInputs.forEach(inputId => {
      const input = document.getElementById(inputId);
      if (input) {
        input.addEventListener('change', () => {
          this.filterUsers();
          if (this.filterPopup) {
            this.filterPopup.updateBadge();
          }
        });
      }
    });

    // Filter popup event listeners
    if (this.filterPopup) {
      // Add Filter button - open popup
      if (this.filterPopup.addFilterBtn) {
        this.filterPopup.addFilterBtn.addEventListener('click', () => {
          this.filterPopup.open();
          this.filterPopup.hideSemesterSectionForFaculty(this.isFaculty);
        });
      }

      // Close button - close popup
      if (this.filterPopup.closeBtn) {
        this.filterPopup.closeBtn.addEventListener('click', () => {
          this.filterPopup.close();
        });
      }

      // Apply button - close popup and apply filters
      if (this.filterPopup.applyBtn) {
        this.filterPopup.applyBtn.addEventListener('click', () => {
          this.filterPopup.close();
          this.filterUsers();
        });
      }

      // Clear Filters button
      if (this.filterPopup.clearBtn) {
        this.filterPopup.clearBtn.addEventListener('click', () => {
          this.filterPopup.clearFilters();
          this.clearUserFilters();
        });
      }

      // Click outside popup to close
      if (this.filterPopup.popup) {
        this.filterPopup.popup.addEventListener('click', (e) => {
          if (e.target === this.filterPopup.popup) {
            this.filterPopup.close();
          }
        });
      }

      // Escape key to close popup
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.filterPopup.popup && this.filterPopup.popup.style.display === 'flex') {
          this.filterPopup.close();
        }
      });
    }

    // Clear filters button (legacy - now in popup)
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        if (this.filterPopup) {
          this.filterPopup.clearFilters();
        }
        this.clearUserFilters();
      });
    }

    // User list delegation for role toggles and edit buttons
    const userListContainer = document.getElementById('user-list-container');
    if (userListContainer) {
      userListContainer.addEventListener('click', async (e) => {
        // Password reset button
        if (e.target.closest('.send-reset-btn')) {
          const btn = e.target.closest('.send-reset-btn');
          const userId = btn.dataset.userId;
          const userEmail = btn.dataset.userEmail;
          await this.handleAdminPasswordReset(userId, userEmail);
        }
        // Delete user button
        if (e.target.closest('.delete-user-btn')) {
          const btn = e.target.closest('.delete-user-btn');
          const userId = btn.dataset.userId;
          const userEmail = btn.dataset.userEmail;
          this.openDeleteUserDialog(userId, userEmail);
        }
        // Toggle CR button
        if (e.target.closest('.toggle-cr-btn')) {
          const userId = e.target.closest('.toggle-cr-btn').dataset.userId;
          const currentValue = e.target.closest('.toggle-cr-btn').dataset.currentValue === 'true';
          await this.toggleUserRole(userId, 'isCR', !currentValue);
        }
        // Toggle Faculty button
        if (e.target.closest('.toggle-faculty-btn')) {
          const userId = e.target.closest('.toggle-faculty-btn').dataset.userId;
          const currentValue = e.target.closest('.toggle-faculty-btn').dataset.currentValue === 'true';
          await this.toggleUserRole(userId, 'isFaculty', !currentValue);
        }
        // Toggle DptCoor button (Department Coordinator for faculty)
        if (e.target.closest('.toggle-dptcoor-btn')) {
          const userId = e.target.closest('.toggle-dptcoor-btn').dataset.userId;
          const currentValue = e.target.closest('.toggle-dptcoor-btn').dataset.currentValue === 'true';
          await this.toggleUserRole(userId, 'isDptCoor', !currentValue);
        }
        // Toggle blocked button
        if (e.target.closest('.toggle-blocked-btn')) {
          const userId = e.target.closest('.toggle-blocked-btn').dataset.userId;
          const currentValue = e.target.closest('.toggle-blocked-btn').dataset.currentValue === 'true';
          await this.toggleUserRole(userId, 'isBlocked', !currentValue);
        }
        // Edit user button
        if (e.target.closest('.edit-user-btn')) {
          const userId = e.target.closest('.edit-user-btn').dataset.userId;
          await this.openEditUserModal(userId);
        }
        // Copy user UID button
        if (e.target.closest('.copy-user-uid-btn')) {
          const btn = e.target.closest('.copy-user-uid-btn');
          const uid = btn.dataset.uid;
          if (uid) {
            await this.copyUserUid(uid, btn);
          }
        }
      });
    }

    // Delete User confirmation dialog listeners
    if (this.deleteUserDialog) {
      if (this.deleteUserDialog.cancelBtn) {
        this.deleteUserDialog.cancelBtn.addEventListener('click', () => {
          this.deleteUserDialog.close();
        });
      }
      if (this.deleteUserDialog.closeBtn) {
        this.deleteUserDialog.closeBtn.addEventListener('click', () => {
          this.deleteUserDialog.close();
        });
      }
      if (this.deleteUserDialog.confirmBtn) {
        this.deleteUserDialog.confirmBtn.addEventListener('click', async () => {
          await this.handleDeleteUser();
        });
      }
    }

    // Edit User modal listeners
    const closeEditUserModal = document.getElementById('close-edit-user-modal');
    const cancelEditUser = document.getElementById('cancel-edit-user');
    if (closeEditUserModal) {
      closeEditUserModal.addEventListener('click', () => UI.hideModal('edit-user-modal'));
    }
    if (cancelEditUser) {
      cancelEditUser.addEventListener('click', () => UI.hideModal('edit-user-modal'));
    }

    // Edit user copy UID button listener
    const editUserCopyUidBtn = document.getElementById('edit-user-copy-uid-btn');
    if (editUserCopyUidBtn) {
      editUserCopyUidBtn.addEventListener('click', async () => {
        const uid = editUserCopyUidBtn.dataset.uid;
        if (uid) {
          await this.copyUserUid(uid, editUserCopyUidBtn);
        }
      });
    }

    // Edit User form
    const editUserForm = document.getElementById('edit-user-form');
    if (editUserForm) {
      editUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleEditUser();
      });
    }

    // Listen for department/semester changes in edit user modal
    const editUserDept = document.getElementById('edit-user-department');
    const editUserSem = document.getElementById('edit-user-semester');
    if (editUserDept && editUserSem) {
      editUserDept.addEventListener('change', () => this.updateEditUserSections());
      editUserSem.addEventListener('change', () => this.updateEditUserSections());
    }
  },

  async loadUserManagement() {
    if (!this.isAdmin) {
      alert('Access denied. Admin only.');
      Router.navigate('dashboard');
      return;
    }

    UI.showLoading(true);

    // Load all users
    const result = await DB.getAllUsers();
    if (result.success) {
      this.allUsers = result.data;
      this.renderUserList(this.allUsers);
    } else {
      alert('Failed to load users: ' + result.error);
    }

    // Load filter dropdowns
    const deptResult = await DB.getDepartments();
    const semResult = await DB.getSemesters();

    if (deptResult.success) {
      await UI.populateDropdown('filter-department', ['All', ...deptResult.data], 'All');
    }
    if (semResult.success) {
      await UI.populateDropdown('filter-semester', ['All', ...semResult.data], 'All');
    }

    // Initialize filter badge
    if (this.filterPopup) {
      this.filterPopup.updateBadge();
    }

    UI.showLoading(false);
  },

  renderUserList(users) {
    const container = document.getElementById('user-list-container');
    const countEl = document.getElementById('user-count');

    if (!container) return;

    if (countEl) {
      countEl.textContent = `${users.length} user${users.length !== 1 ? 's' : ''}`;
    }

    if (users.length === 0) {
      container.innerHTML = '<div class="no-data-message"><i class="fas fa-users-slash"></i><p>No users found matching the criteria.</p></div>';
      return;
    }

    container.innerHTML = users.map(user => {
      const isDptCoor = user.isDptCoor === true || user.role === 'DptCoor' || user.isDptHead === true || user.role === 'DptHead';
      const isFaculty = user.isFaculty === true || user.role === 'Faculty' || isDptCoor;
      const isCR = user.isCR === true || user.role === 'CR';

      const roles = [];
      if (user.isAdmin) roles.push('<span class="role-badge admin">Admin</span>');
      if (isDptCoor) roles.push('<span class="role-badge dptcoor">DptCoor</span>');
      else if (isFaculty) roles.push('<span class="role-badge faculty">Faculty</span>');
      if (isCR) roles.push('<span class="role-badge cr">CR</span>');
      if (user.isBlocked) roles.push('<span class="role-badge blocked">Blocked</span>');

      return `
        <div class="user-card ${user.isBlocked ? 'blocked' : ''}" data-user-id="${user.id}">
          <div class="user-card-header">
            <div class="user-avatar-small">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="user-basic-info">
              <div class="user-card-email-row">
                <p class="user-card-email">${user.email || 'No email'}</p>
                <button type="button" class="copy-user-uid-btn" data-uid="${user.id}" title="Copy Firebase UID: ${user.id}">
                  <i class="far fa-copy"></i>
                  <span class="copy-uid-label">UID</span>
                </button>
              </div>
              <p class="user-card-details">${user.department || 'N/A'}${isFaculty ? '' : ` • ${user.semester || 'N/A'} • ${user.section || 'N/A'}`}</p>
              <p class="user-card-student-id">ID: ${user.studentId || 'Not set'}</p>
            </div>
            <div class="user-roles">
              ${roles.join('') || '<span class="role-badge user">User</span>'}
            </div>
          </div>
          <div class="user-card-actions">
            ${!user.isAdmin ? `
              <button class="btn btn-sm btn-action send-reset-btn" 
                      data-user-id="${user.id}" 
                      data-user-email="${user.email || ''}"
                      title="Send password reset link">
                <i class="fas fa-key"></i> Reset Password
              </button>
              <button class="btn btn-sm btn-action btn-danger delete-user-btn" 
                      data-user-id="${user.id}" 
                      data-user-email="${user.email || ''}"
                      title="Delete user account">
                <i class="fas fa-trash-alt"></i> Delete
              </button>
              <button class="btn btn-sm btn-action toggle-cr-btn ${isCR ? 'active' : ''}" 
                      data-user-id="${user.id}" 
                      data-current-value="${isCR}" 
                      title="${isCR ? 'Remove CR role' : 'Make CR'}">
                <i class="fas fa-user-graduate"></i> ${isCR ? 'Remove CR' : 'Make CR'}
              </button>
              <button class="btn btn-sm btn-action toggle-faculty-btn ${isFaculty ? 'active' : ''}" 
                      data-user-id="${user.id}" 
                      data-current-value="${isFaculty}" 
                      title="${isFaculty ? 'Remove Faculty role' : 'Make Faculty'}">
                <i class="fas fa-chalkboard-teacher"></i> ${isFaculty ? 'Remove Faculty' : 'Make Faculty'}
              </button>
              ${isFaculty ? `
                <button class="btn btn-sm btn-action toggle-dptcoor-btn ${isDptCoor ? 'active' : ''}" 
                        data-user-id="${user.id}" 
                        data-current-value="${isDptCoor}" 
                        title="${isDptCoor ? 'Remove DptCoor role' : 'Make DptCoor'}">
                  <i class="fas fa-user-tie"></i> ${isDptCoor ? 'Remove DptCoor' : 'Make DptCoor'}
                </button>
              ` : ''}
              <button class="btn btn-sm btn-action toggle-blocked-btn ${user.isBlocked ? 'active danger' : ''}" 
                      data-user-id="${user.id}" 
                      data-current-value="${user.isBlocked || false}" 
                      title="${user.isBlocked ? 'Unblock user' : 'Block user'}">
                <i class="fas fa-${user.isBlocked ? 'unlock' : 'ban'}"></i> ${user.isBlocked ? 'Unblock' : 'Block'}
              </button>
            ` : '<span class="admin-protected">Admin account</span>'}
            <button class="btn btn-sm btn-action edit-user-btn" 
                    data-user-id="${user.id}" 
                    title="Edit user profile">
              <i class="fas fa-edit"></i> Edit
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  filterUsers() {
    const department = document.getElementById('filter-department')?.value || 'All';
    const semester = document.getElementById('filter-semester')?.value || 'All';
    const section = document.getElementById('filter-section')?.value || 'All';
    const role = document.getElementById('filter-role')?.value || 'All';
    const searchQuery = (document.getElementById('user-search-input')?.value || '').trim().toLowerCase();

    let filtered = [...this.allUsers];

    // Filter by text search query (email, student ID, department, semester, section, or UID)
    if (searchQuery) {
      filtered = filtered.filter(u => {
        const email = (u.email || '').toLowerCase();
        const uid = (u.id || '').toLowerCase();
        const studentId = (u.studentId || '').toLowerCase();
        const dept = (u.department || '').toLowerCase();
        const sem = (u.semester || '').toLowerCase();
        const sec = (u.section || '').toLowerCase();
        return email.includes(searchQuery) ||
               uid.includes(searchQuery) ||
               studentId.includes(searchQuery) ||
               dept.includes(searchQuery) ||
               sem.includes(searchQuery) ||
               sec.includes(searchQuery);
      });
    }

    if (department !== 'All') {
      filtered = filtered.filter(u => u.department === department);
    }

    // Only apply semester/section filters if they're visible (not Faculty user)
    const semesterGroup = document.querySelector('#filter-semester')?.closest('.form-group');
    if (semesterGroup && semesterGroup.style.display !== 'none') {
      if (semester !== 'All') {
        filtered = filtered.filter(u => u.semester === semester);
      }
      if (section !== 'All') {
        // Handle section groups: A matches A1, A2; B matches B1, B2, etc.
        filtered = filtered.filter(u => {
          if (!u.section) return false;
          // If filter is a group (single letter like A, B, C)
          if (section.length === 1) {
            return u.section.startsWith(section);
          }
          // Otherwise exact match
          return u.section === section;
        });
      }
    }

    if (role !== 'All') {
      switch (role) {
        case 'Admin':
          filtered = filtered.filter(u => u.isAdmin === true || u.role === 'Admin');
          break;
        case 'DptCoor':
          filtered = filtered.filter(u => u.isDptCoor === true || u.role === 'DptCoor' || u.isDptHead === true || u.role === 'DptHead');
          break;
        case 'Faculty':
          filtered = filtered.filter(u => (u.isFaculty === true || u.role === 'Faculty') && !(u.isDptCoor === true || u.role === 'DptCoor' || u.isDptHead === true || u.role === 'DptHead'));
          break;
        case 'CR':
          filtered = filtered.filter(u => u.isCR === true || u.role === 'CR');
          break;
        case 'Blocked':
          filtered = filtered.filter(u => u.isBlocked === true || u.role === 'Blocked');
          break;
        case 'User':
          filtered = filtered.filter(u => !u.isAdmin && !u.isCR && !u.isFaculty && !u.isDptCoor && !u.isBlocked);
          break;
      }
    }

    this.renderUserList(filtered);
  },

  clearUserFilters() {
    const filterDept = document.getElementById('filter-department');
    const filterSem = document.getElementById('filter-semester');
    const filterSection = document.getElementById('filter-section');
    const filterRole = document.getElementById('filter-role');
    const userSearchInput = document.getElementById('user-search-input');
    const clearUserSearchBtn = document.getElementById('clear-user-search-btn');

    if (filterDept) filterDept.value = 'All';
    if (filterSem) filterSem.value = 'All';
    if (filterSection) filterSection.value = 'All';
    if (filterRole) filterRole.value = 'All';
    if (userSearchInput) userSearchInput.value = '';
    if (clearUserSearchBtn) clearUserSearchBtn.style.display = 'none';

    this.renderUserList(this.allUsers);
  },

  async copyUserUid(uid, btn) {
    if (!uid) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(uid);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = uid;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      if (btn) {
        btn.classList.add('copied');
        const icon = btn.querySelector('i');
        const label = btn.querySelector('.copy-uid-label');
        const originalIconClass = icon ? icon.className : '';
        const originalLabelText = label ? label.textContent : '';

        if (icon) icon.className = 'fas fa-check';
        if (label) label.textContent = 'Copied!';

        setTimeout(() => {
          btn.classList.remove('copied');
          if (icon) icon.className = originalIconClass;
          if (label) label.textContent = originalLabelText;
        }, 1500);
      }

      if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
        UI.showToast(`Copied UID: ${uid}`, 'success');
      }
    } catch (err) {
      console.error('Failed to copy UID:', err);
      if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
        UI.showToast('Failed to copy UID to clipboard', 'error');
      }
    }
  },

  async handleAdminPasswordReset(userId, userEmail) {
    if (!this.isAdmin) return;

    const confirmed = confirm(`Send password reset link to ${userEmail}?`);
    if (!confirmed) return;

    UI.showLoading(true);

    try {
      // Use Client SDK to send standard password reset email (bypasses CORS/backend issues)
      const result = await Auth.sendPasswordResetEmail(userEmail);

      if (result.success) {
        UI.showMessage('user-management-message', result.message || 'Password reset link sent successfully', 'success');
      } else {
        throw new Error(result.error || 'Failed to send password reset link');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      if (error.message.includes('network')) {
        UI.showMessage('user-management-message', 'Network error. Please check your connection.', 'error');
      } else {
        UI.showMessage('user-management-message', error.message || 'Failed to send password reset link', 'error');
      }
    } finally {
      UI.showLoading(false);
    }
  },

  openDeleteUserDialog(userId, userEmail) {
    if (!this.isAdmin) return;
    if (this.deleteUserDialog) {
      this.deleteUserDialog.open(userId, userEmail);
    }
  },

  async handleDeleteUser() {
    if (!this.isAdmin || !this.deleteUserDialog) return;

    const userId = this.deleteUserDialog.getUserId();
    const userEmail = this.deleteUserDialog.getUserEmail();

    if (!userId) return;

    UI.showLoading(true);

    try {
      const result = await adminAPI.deleteUser(userId);

      // Close dialog
      this.deleteUserDialog.close();

      // Remove user from local state
      this.allUsers = this.allUsers.filter(u => u.id !== userId);

      // Re-render user list
      this.renderUserList(this.allUsers);

      // Show success message
      UI.showMessage('user-management-message', result.message || 'User deleted successfully', 'success');
    } catch (error) {
      console.error('Delete user error:', error);

      // Close dialog
      this.deleteUserDialog.close();

      if (error.message.includes('network')) {
        UI.showMessage('user-management-message', 'Network error. Please check your connection.', 'error');
      } else if (error.message.includes('permission')) {
        UI.showMessage('user-management-message', 'You do not have permission to perform this action.', 'error');
      } else {
        UI.showMessage('user-management-message', error.message || 'Failed to delete user', 'error');
      }
    } finally {
      UI.showLoading(false);
    }
  },

  async toggleUserRole(userId, role, value) {
    if (!this.isAdmin) return;

    const roleNames = {
      'isCR': 'CR',
      'isFaculty': 'Faculty',
      'isDptCoor': 'Department Coordinator (DptCoor)',
      'isBlocked': value ? 'Block' : 'Unblock'
    };

    const confirmed = confirm(`Are you sure you want to ${value ? 'assign' : 'remove'} ${roleNames[role]} ${value ? 'to' : 'from'} this user?`);
    if (!confirmed) return;

    const result = await DB.updateUserRole(userId, role, value);
    if (result.success) {
      // Update local state
      const userIndex = this.allUsers.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        this.allUsers[userIndex][role] = value;
        if (role === 'isDptCoor') {
          if (value) {
            this.allUsers[userIndex].isFaculty = true;
            this.allUsers[userIndex].role = 'DptCoor';
            this.allUsers[userIndex].semester = null;
            this.allUsers[userIndex].section = null;
          } else {
            this.allUsers[userIndex].isDptCoor = false;
            this.allUsers[userIndex].role = 'Faculty';
          }
        } else if (role === 'isFaculty') {
          if (!value) {
            this.allUsers[userIndex].isDptCoor = false;
            this.allUsers[userIndex].role = 'Student';
          } else {
            this.allUsers[userIndex].role = 'Faculty';
          }
        }
      }
      this.filterUsers(); // Re-render with current filters
    } else {
      alert('Failed to update role: ' + result.error);
    }
  },

  async openEditUserModal(userId) {
    if (!this.isAdmin) return;

    const user = this.allUsers.find(u => u.id === userId);
    if (!user) {
      alert('User not found');
      return;
    }

    // Store current editing user
    this.editingUserId = userId;

    // Populate form
    document.getElementById('edit-user-id').value = userId;
    document.getElementById('edit-user-email').textContent = user.email || 'No email';
    document.getElementById('edit-user-student-id').textContent = user.studentId || 'Not set';
    const copyUidBtn = document.getElementById('edit-user-copy-uid-btn');
    if (copyUidBtn) {
      copyUidBtn.dataset.uid = userId;
      copyUidBtn.title = `Copy Firebase UID: ${userId}`;
    }

    // Load dropdowns
    const deptResult = await DB.getDepartments();
    const semResult = await DB.getSemesters();

    if (deptResult.success) {
      await UI.populateDropdown('edit-user-department', deptResult.data, user.department);
    }
    if (semResult.success) {
      await UI.populateDropdown('edit-user-semester', semResult.data, user.semester);
    }

    // Load sections
    await this.updateEditUserSections(user.section);

    UI.showModal('edit-user-modal');
  },

  async updateEditUserSections(selectedValue = null) {
    const department = document.getElementById('edit-user-department')?.value;
    const semester = document.getElementById('edit-user-semester')?.value;

    if (department && semester) {
      const result = await DB.getSections(department, semester);
      if (result.success) {
        await UI.populateDropdown('edit-user-section', result.data, selectedValue);
      }
    }
  },

  async handleEditUser() {
    if (!this.isAdmin) return;

    const userId = document.getElementById('edit-user-id').value;
    const department = document.getElementById('edit-user-department').value;
    const semester = document.getElementById('edit-user-semester').value;
    const section = document.getElementById('edit-user-section').value;

    if (!department || !semester || !section) {
      alert('Please select all fields');
      return;
    }

    const result = await DB.adminUpdateUserProfile(userId, {
      department,
      semester,
      section
    });

    if (result.success) {
      // Update local state
      const userIndex = this.allUsers.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        this.allUsers[userIndex].department = department;
        this.allUsers[userIndex].semester = semester;
        this.allUsers[userIndex].section = section;
      }

      UI.hideModal('edit-user-modal');
      this.filterUsers(); // Re-render
      alert('User profile updated successfully!');
    } else {
      alert('Failed to update user: ' + result.error);
    }
  }
};

// Expose App to global scope for CalendarView and other modules
window.App = App;

// Initialize app when DOM is ready
console.log('DOMContentLoaded event listener registered');
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded fired!');
  console.log('About to call App.init()');
  App.init();
  console.log('App.init() completed');
});
