// ============================================
// MAIN APPLICATION
// ============================================

const App = {
  userProfile: null,
  userCompletions: {},
  currentTasks: [],
  currentEvents: [],
  isAdmin: false,
  isCR: false,

  async init() {
    console.log('Initializing b1t-Sched...');
    
    // Initialize router
    Router.init();

    // Setup authentication state listener
    Auth.onAuthStateChanged(async (user) => {
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
    this.setupAdminEventListeners();

    // Initialize Profile module
    await Profile.init();

    // Handle route-specific data loading
    Router.onRouteChange(async (route) => {
      if (route === 'profile-settings') {
        await Profile.loadProfile();
      } else if (route === 'dashboard') {
        await this.loadDashboardData();
      }
    });
  },

  setupEventListeners() {
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
    const tasksContainer = document.getElementById('tasks-container');
    if (tasksContainer) {
      tasksContainer.addEventListener('change', async (e) => {
        if (e.target.classList.contains('task-checkbox')) {
          const taskId = e.target.dataset.taskId;
          const isCompleted = e.target.checked;
          await this.handleTaskCompletion(taskId, isCompleted);
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
  },

  openAddTaskModal() {
    // Set minimum date to now
    const deadlineInput = document.getElementById('task-deadline');
    if (deadlineInput) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      deadlineInput.min = now.toISOString().slice(0, 16);
    }
    
    // Clear form
    document.getElementById('add-task-form').reset();
    
    UI.showModal('add-task-modal');
  },

  async openOldTasksModal() {
    UI.showModal('old-tasks-modal');
    
    if (!this.userProfile) return;
    
    const userId = Auth.getUserId();
    const { department, semester, section } = this.userProfile;
    
    const result = await DB.getOldTasks(userId, department, semester, section);
    if (result.success) {
      UI.renderOldTasks(result.data);
    }
  },

  async handleAddTask() {
    const title = document.getElementById('task-title').value.trim();
    const course = document.getElementById('task-course').value.trim();
    const type = document.getElementById('task-type').value;
    const description = document.getElementById('task-description').value.trim();
    const deadline = document.getElementById('task-deadline').value;

    if (!title || !deadline) {
      alert('Please fill in the required fields (Title and Deadline)');
      return;
    }

    if (!this.userProfile) {
      alert('User profile not loaded');
      return;
    }

    const userId = Auth.getUserId();
    const userEmail = Auth.getUserEmail();
    const { department, semester, section } = this.userProfile;

    const result = await DB.createTask(userId, userEmail, {
      title,
      course,
      type,
      description,
      deadline,
      department,
      semester,
      section
    });

    if (result.success) {
      UI.hideModal('add-task-modal');
      // Refresh tasks
      await this.loadDashboardData();
    } else {
      alert('Failed to add task: ' + result.error);
    }
  },

  async handleTaskCompletion(taskId, isCompleted) {
    const userId = Auth.getUserId();
    if (!userId) return;

    const result = await DB.toggleTaskCompletion(userId, taskId, isCompleted);
    
    if (result.success) {
      // Update local state
      if (isCompleted) {
        this.userCompletions[taskId] = { completedAt: new Date() };
      } else {
        delete this.userCompletions[taskId];
      }
      
      // Re-render tasks with updated completions
      UI.renderTasks(this.currentTasks, this.userCompletions, this.isAdmin || this.isCR);
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
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      UI.showMessage('auth-message', 'Please enter both email and password', 'error');
      return;
    }

    if (!Utils.isValidEmail(email)) {
      UI.showMessage('auth-message', 'Please enter a valid email address', 'error');
      return;
    }

    UI.showLoading(true);

    const result = await Auth.login(email, password);

    if (result.success) {
      // Check email verification immediately
      const user = Auth.getCurrentUser();
      if (user && !user.emailVerified) {
        UI.showLoading(false);
        UI.showMessage('auth-message', 'Please verify your email before logging in. Check your inbox for the verification link.', 'error');
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

    if (!email) {
      UI.showMessage('password-reset-message', 'Please enter your email address', 'error');
      return;
    }

    if (!Utils.isValidEmail(email)) {
      UI.showMessage('password-reset-message', 'Please enter a valid email address', 'error');
      return;
    }

    const result = await Auth.sendPasswordResetEmail(email);

    if (result.success) {
      UI.showMessage('password-reset-message', result.message, 'success');
      // Clear the form and close modal after a delay
      setTimeout(() => {
        document.getElementById('reset-email').value = '';
        UI.hideModal('password-reset-modal');
        UI.hideMessage('password-reset-message');
      }, 3000);
    } else {
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

    const result = await Auth.signup(email, password);

    if (result.success) {
      UI.hideMessage('auth-message');
      UI.showMessage('auth-message', 'Account created successfully! Please check your email inbox (or spam folder) for a verification link before logging in.', 'success');
      // Sign out - user must verify email first
      await Auth.logout();
      // Show login form
      document.getElementById('signup-form').style.display = 'none';
      document.getElementById('login-form').style.display = 'block';
      UI.showLoading(false);
    } else {
      // Show error as info type if it's about email verification
      const msgType = result.error.includes('verify') || result.error.includes('verification') ? 'info' : 'error';
      UI.showMessage('auth-message', result.error, msgType);
      UI.showLoading(false);
    }
  },

  async handleAuthenticatedUser(user) {
    // Check if email is verified
    if (!user.emailVerified) {
      UI.showMessage('auth-message', 'Please verify your email before logging in. Check your inbox for the verification link.', 'error');
      await Auth.logout();
      UI.showLoading(false);
      return;
    }

    // Check if user has profile
    const profileResult = await DB.getUserProfile(user.uid);

    if (profileResult.success) {
      // User has profile, load dashboard
      this.userProfile = profileResult.data;
      
      // Check if user is admin or CR
      const rolesResult = await DB.getUserRoles(user.uid);
      this.isAdmin = rolesResult.isAdmin || false;
      this.isCR = rolesResult.isCR || false;
      
      // Save to localStorage
      Utils.storage.set('userProfile', this.userProfile);
      Utils.storage.set('isAdmin', this.isAdmin);
      Utils.storage.set('isCR', this.isCR);
      
      // Update user details card
      UI.updateUserDetailsCard(
        this.userProfile.email,
        this.userProfile.department,
        this.userProfile.semester,
        this.userProfile.section
      );
      
      // Show/hide admin and CR controls
      UI.toggleAdminControls(this.isAdmin, this.isCR);

      // Navigate based on current route
      if (Router.getCurrentRoute() === 'profile-settings') {
        await Profile.loadProfile();
      } else {
        Router.navigate('dashboard');
        await this.loadDashboardData();
      }
    } else {
      // First-time login, show set details
      Router.navigate('set-details');
      await this.loadSetDetailsForm();
    }

    UI.showLoading(false);
  },

  handleUnauthenticatedUser() {
    UI.showLoading(false);
    Router.navigate('login');
    this.userProfile = null;
    this.isAdmin = false;
    this.isCR = false;
    Utils.storage.clear();
  },

  async loadSetDetailsForm() {
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

  async handleSetDetails() {
    const studentId = document.getElementById('set-student-id').value.trim();
    const department = document.getElementById('set-department').value;
    const semester = document.getElementById('set-semester').value;
    const section = document.getElementById('set-section').value;

    if (!studentId || !department || !semester || !section) {
      UI.showMessage('set-details-message', 'Please fill in all fields', 'error');
      return;
    }

    // Validate student ID (10-16 digits)
    if (!/^[0-9]{10,16}$/.test(studentId)) {
      UI.showMessage('set-details-message', 'Student ID must be 10-16 digits', 'error');
      return;
    }

    UI.showLoading(true);

    const userId = Auth.getUserId();
    const email = Auth.getUserEmail();

    const result = await DB.createUserProfile(userId, {
      email,
      studentId,
      department,
      semester,
      section
    });

    if (result.success) {
      UI.showMessage('set-details-message', 'Details saved! Loading dashboard...', 'success');
      
      // Reload user profile
      const profileResult = await DB.getUserProfile(userId);
      if (profileResult.success) {
        this.userProfile = profileResult.data;
        Utils.storage.set('userProfile', this.userProfile);
        
        UI.updateUserDetailsCard(
          this.userProfile.email,
          this.userProfile.department,
          this.userProfile.semester,
          this.userProfile.section
        );

        setTimeout(() => {
          Router.navigate('dashboard');
          this.loadDashboardData();
        }, 1000);
      }
    } else {
      UI.showMessage('set-details-message', result.error, 'error');
      UI.showLoading(false);
    }
  },

  async loadDashboardData() {
    if (!this.userProfile) return;

    UI.showLoading(true);

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
    const tasksResult = await DB.getTasks(department, semester, section);
    if (tasksResult.success) {
      this.currentTasks = tasksResult.data;
      UI.renderTasks(this.currentTasks, this.userCompletions, this.isAdmin || this.isCR);
    } else {
      console.error('Failed to load tasks:', tasksResult.error);
      // Check if it's an index error
      if (tasksResult.error && tasksResult.error.includes('index')) {
        alert('Firestore index required. Check browser console for the index creation link.');
      }
    }

    // Load events
    const eventsResult = await DB.getEvents(department);
    if (eventsResult.success) {
      this.currentEvents = eventsResult.data;
      UI.renderEvents(this.currentEvents, this.isAdmin);
    }

    UI.showLoading(false);
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
        });
      }
    });
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
    if (!this.isAdmin && !this.isCR) return;
    
    const confirmed = confirm('Are you sure you want to delete this task?');
    if (!confirmed) return;

    const result = await DB.deleteTask(taskId);
    
    if (result.success) {
      // Remove from local state and re-render
      this.currentTasks = this.currentTasks.filter(t => t.id !== taskId);
      UI.renderTasks(this.currentTasks, this.userCompletions, this.isAdmin || this.isCR);
    } else {
      alert('Failed to delete task: ' + result.error);
    }
  },

  openAddEventModal() {
    // Set minimum date to now
    const dateInput = document.getElementById('event-date');
    if (dateInput) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      dateInput.min = now.toISOString().slice(0, 16);
    }
    
    // Clear form
    document.getElementById('add-event-form').reset();
    
    UI.showModal('add-event-modal');
  },

  async handleAddEvent() {
    const title = document.getElementById('event-title').value.trim();
    const description = document.getElementById('event-description').value.trim();
    const date = document.getElementById('event-date').value;
    const department = document.getElementById('event-department').value;

    if (!title || !date) {
      alert('Please fill in the required fields (Title and Date)');
      return;
    }

    const userId = Auth.getUserId();

    const result = await DB.createEvent({
      title,
      description,
      date,
      department,
      createdBy: userId
    });

    if (result.success) {
      UI.hideModal('add-event-modal');
      // Refresh events
      await this.loadDashboardData();
    } else {
      alert('Failed to add event: ' + result.error);
    }
  },

  async handleDeleteEvent(eventId) {
    if (!this.isAdmin) return;
    
    const confirmed = confirm('Are you sure you want to delete this event?');
    if (!confirmed) return;

    const result = await DB.deleteEvent(eventId);
    
    if (result.success) {
      // Remove from local state and re-render
      this.currentEvents = this.currentEvents.filter(e => e.id !== eventId);
      UI.renderEvents(this.currentEvents, this.isAdmin);
    } else {
      alert('Failed to delete event: ' + result.error);
    }
  },

  async openOldEventsModal() {
    UI.showModal('old-events-modal');
    
    if (!this.userProfile) return;
    
    const { department } = this.userProfile;
    
    const result = await DB.getOldEvents(department);
    if (result.success) {
      UI.renderOldEvents(result.data);
    }
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
