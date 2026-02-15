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
  isBlocked: false,
  allUsers: [],
  isSigningUp: false, // Flag to prevent auth state handling during signup

  async init() {
    console.log('Initializing b1t-Sched...');

    // Initialize router
    Router.init();

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
    UI.initPdfViewer();
    this.setupAdminEventListeners();
    this.setupUserManagementListeners();

    // Initialize Profile module
    await Profile.init();

    // Handle route-specific data loading
    Router.onRouteChange(async (route) => {
      if (route === 'profile-settings') {
        await Profile.loadProfile();
      } else if (route === 'dashboard') {
        await this.loadDashboardData();
      } else if (route === 'user-management') {
        await this.loadUserManagement();
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

    // Event description toggle delegation (works for all users)
    const eventsContainers = [
      document.getElementById('events-container'),
      document.getElementById('events-container-mobile')
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

    // Set minimum date to now
    const deadlineInput = document.getElementById('task-deadline');
    const deadlineNone = document.getElementById('deadline-none');
    const deadlineDate = document.getElementById('deadline-date');
    if (deadlineInput) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      deadlineInput.min = now.toISOString().slice(0, 16);
      deadlineInput.value = '';
      deadlineInput.disabled = true;
    }
    if (deadlineNone) deadlineNone.checked = true;
    if (deadlineDate) deadlineDate.checked = false;
    // Add event listeners for radio buttons
    if (deadlineNone && deadlineDate && deadlineInput) {
      deadlineNone.onclick = () => { deadlineInput.disabled = true; deadlineInput.value = ''; };
      deadlineDate.onclick = () => { deadlineInput.disabled = false; };
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

  async openEditTaskModal(taskId) {
    // Check if user is blocked
    if (this.isBlocked) {
      alert('Your account has been restricted. You cannot edit tasks.');
      return;
    }

    // Find the task in currentTasks
    const task = this.currentTasks.find(t => t.id === taskId);
    if (!task) {
      alert('Task not found');
      return;
    }

    // Check if user can edit this task
    const userId = Auth.getUserId();
    const canEdit = this.isAdmin || (userId && task.addedBy === userId);
    if (!canEdit) {
      alert('You do not have permission to edit this task');
      return;
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
    const canEdit = this.isAdmin || (this.isCR && event.createdBy === userId);
    if (!canEdit) {
      alert('You do not have permission to edit this event');
      return;
    }

    // Populate the form
    document.getElementById('edit-event-id').value = eventId;
    document.getElementById('edit-event-title').value = event.title || '';
    document.getElementById('edit-event-description').value = event.description || '';

    // CR can only edit events for their own department
    const deptSelect = document.getElementById('edit-event-department');
    deptSelect.value = event.department || 'ALL';
    if (this.isCR && !this.isAdmin) {
      deptSelect.value = this.userProfile.department;
      deptSelect.disabled = true;
    } else {
      deptSelect.disabled = false;
    }

    // Format date for datetime-local input
    const eventDate = event.date ? event.date.toDate() : new Date();
    eventDate.setMinutes(eventDate.getMinutes() - eventDate.getTimezoneOffset());
    document.getElementById('edit-event-date').value = eventDate.toISOString().slice(0, 16);

    UI.showModal('edit-event-modal');
  },

  async handleEditEvent() {
    if (!this.isAdmin && !this.isCR) return;

    const eventId = document.getElementById('edit-event-id').value;
    const title = document.getElementById('edit-event-title').value.trim();
    const description = document.getElementById('edit-event-description').value.trim();
    const date = document.getElementById('edit-event-date').value;
    const department = document.getElementById('edit-event-department').value;

    if (!title || !date) {
      alert('Please fill in the required fields (Title and Date)');
      return;
    }

    // CR can only edit their own events
    if (this.isCR && !this.isAdmin) {
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
    // Admin can delete any event, CR can delete their own events
    if (!this.isAdmin && !this.isCR) {
      alert('You do not have permission to delete events');
      return;
    }

    // CR can only delete their own events
    if (this.isCR && !this.isAdmin) {
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

    const result = await DB.toggleTaskCompletion(userId, taskId, isCompleted);

    if (result.success) {
      // Update local state
      if (isCompleted) {
        this.userCompletions[taskId] = { completedAt: new Date() };
      } else {
        delete this.userCompletions[taskId];
      }

      // Re-render tasks with updated completions
      UI.renderTasks(this.currentTasks, this.userCompletions, this.isAdmin, this.isCR, Auth.getUserId());
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

    // Set flag to prevent auth state handling during signup
    this.isSigningUp = true;

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

      // Check if user is admin, CR, or blocked
      const rolesResult = await DB.getUserRoles(user.uid);
      this.isAdmin = rolesResult.isAdmin || false;
      this.isCR = rolesResult.isCR || false;
      this.isBlocked = rolesResult.isBlocked || false;

      // Save to localStorage
      Utils.storage.set('userProfile', this.userProfile);
      Utils.storage.set('isAdmin', this.isAdmin);
      Utils.storage.set('isCR', this.isCR);
      Utils.storage.set('isBlocked', this.isBlocked);

      // Update user details card
      UI.updateUserDetailsCard(
        this.userProfile.email,
        this.userProfile.department,
        this.userProfile.semester,
        this.userProfile.section
      );

      // Show/hide admin and CR controls
      UI.toggleAdminControls(this.isAdmin, this.isCR);

      // Show blocked user warning if applicable
      UI.toggleBlockedUserMode(this.isBlocked);

      // Show footer and contributions section
      const appFooter = document.getElementById('app-footer');
      const contribSection = document.getElementById('contributions-section');
      if (appFooter) appFooter.style.display = 'block';
      if (contribSection) contribSection.style.display = 'block';

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
    this.isBlocked = false;
    Utils.storage.clear();

    // Hide footer when not logged in
    const appFooter = document.getElementById('app-footer');
    const contribSection = document.getElementById('contributions-section');
    if (appFooter) {
      appFooter.style.display = 'none';
    }
    if (contribSection) {
      contribSection.style.display = 'none';
    }
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
      UI.renderTasks(this.currentTasks, this.userCompletions, this.isAdmin, this.isCR, userId);
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
      UI.renderEvents(this.currentEvents, this.isAdmin, this.isCR, userId);
    }

    // Setup new features listeners (safe to call multiple times as they replace old ones or we can check init)
    this.setupTaskFilterListeners();

    // Update total user count
    this.updateUserCount();

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
    // Task Filter Radio Buttons
    const filterRadios = document.querySelectorAll('input[name="task-filter"]');
    const clearFilterBtn = document.getElementById('clear-task-filter-btn');

    filterRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const type = e.target.value;
        this.filterTasksByType(type);
        if (clearFilterBtn) clearFilterBtn.style.display = 'inline-flex';
      });
    });

    if (clearFilterBtn) {
      clearFilterBtn.addEventListener('click', () => {
        // Uncheck all radios
        filterRadios.forEach(radio => radio.checked = false);
        // Show all tasks
        this.filterTasksByType('all');
        clearFilterBtn.style.display = 'none';
      });
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

  filterTasksByType(type) {
    const tasks = document.querySelectorAll('.task-card');
    let visibleCount = 0;

    tasks.forEach(task => {
      if (type === 'all' || task.dataset.type === type) {
        task.style.display = 'block';
        visibleCount++;
      } else {
        task.style.display = 'none';
      }
    });

    // Handle no tasks message
    const noTasksMsg = document.getElementById('no-tasks-message');
    if (noTasksMsg) {
      if (visibleCount === 0) {
        noTasksMsg.style.display = 'block';
        noTasksMsg.querySelector('p').textContent = type === 'all'
          ? "No pending tasks! You're all caught up."
          : `No pending ${type}s found.`;
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

    // Aggregate contributions
    const contributions = {};
    tasksToCount.forEach(task => {
      // Use addedByName (name part of email) or 'Unknown'
      const contributor = task.addedByName || 'Unknown';
      contributions[contributor] = (contributions[contributor] || 0) + 1;
    });

    // Convert to array and sort
    const sortedContributors = Object.entries(contributions)
      .map(([name, count]) => ({ name, count }))
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

    html += sortedContributors.map((c, index) => `
      <tr>
        <td class="rank-col">${index + 1}</td>
        <td>${c.name}</td>
        <td class="count-col">${c.count}</td>
      </tr>
    `).join('');

    html += `</tbody></table>`;
    container.innerHTML = html;
  },

  async updateUserCount() {
    const countEl = document.getElementById('total-user-count');
    const counterContainer = document.getElementById('total-user-counter');

    if (!countEl || !counterContainer) return;

    try {
      // Try to get all users to count them
      // Note: This might fail if user doesn't have permissions
      // If so, we just hide the counter
      const result = await DB.getAllUsers();
      if (result.success) {
        countEl.textContent = result.data.length;
        counterContainer.style.display = 'flex';
      } else {
        console.warn('Could not fetch user count (likely permission issue):', result.error);
        counterContainer.style.display = 'none';
      }
    } catch (e) {
      console.warn('Error fetching user count:', e);
      counterContainer.style.display = 'none';
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
      // Remove from local state and re-render
      this.currentTasks = this.currentTasks.filter(t => t.id !== taskId);
      UI.renderTasks(this.currentTasks, this.userCompletions, this.isAdmin, this.isCR, Auth.getUserId());
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

    // CR can only create events for their own department
    if (this.isCR && !this.isAdmin) {
      department = this.userProfile.department;
    }

    // Determine the "Added by" label
    const createdByName = this.isAdmin ? 'Admin' : 'CR';

    const result = await DB.createEvent({
      title,
      description,
      date,
      department,
      createdBy: userId,
      createdByName
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

    // User filter inputs
    const filterInputs = ['filter-department', 'filter-semester', 'filter-section', 'filter-role'];
    filterInputs.forEach(inputId => {
      const input = document.getElementById(inputId);
      if (input) {
        input.addEventListener('change', () => this.filterUsers());
      }
    });

    // Clear filters button
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => this.clearUserFilters());
    }

    // User list delegation for role toggles and edit buttons
    const userListContainer = document.getElementById('user-list-container');
    if (userListContainer) {
      userListContainer.addEventListener('click', async (e) => {
        if (e.target.closest('.toggle-cr-btn')) {
          const userId = e.target.closest('.toggle-cr-btn').dataset.userId;
          const currentValue = e.target.closest('.toggle-cr-btn').dataset.currentValue === 'true';
          await this.toggleUserRole(userId, 'isCR', !currentValue);
        }
        if (e.target.closest('.toggle-blocked-btn')) {
          const userId = e.target.closest('.toggle-blocked-btn').dataset.userId;
          const currentValue = e.target.closest('.toggle-blocked-btn').dataset.currentValue === 'true';
          await this.toggleUserRole(userId, 'isBlocked', !currentValue);
        }
        if (e.target.closest('.edit-user-btn')) {
          const userId = e.target.closest('.edit-user-btn').dataset.userId;
          await this.openEditUserModal(userId);
        }
      });
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
      const roles = [];
      if (user.isAdmin) roles.push('<span class="role-badge admin">Admin</span>');
      if (user.isCR) roles.push('<span class="role-badge cr">CR</span>');
      if (user.isBlocked) roles.push('<span class="role-badge blocked">Blocked</span>');

      return `
        <div class="user-card ${user.isBlocked ? 'blocked' : ''}" data-user-id="${user.id}">
          <div class="user-card-header">
            <div class="user-avatar-small">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="user-basic-info">
              <p class="user-card-email">${user.email || 'No email'}</p>
              <p class="user-card-details">${user.department || 'N/A'} • ${user.semester || 'N/A'} • ${user.section || 'N/A'}</p>
              <p class="user-card-student-id">ID: ${user.studentId || 'Not set'}</p>
            </div>
            <div class="user-roles">
              ${roles.join('') || '<span class="role-badge user">User</span>'}
            </div>
          </div>
          <div class="user-card-actions">
            ${!user.isAdmin ? `
              <button class="btn btn-sm toggle-cr-btn ${user.isCR ? 'active' : ''}" data-user-id="${user.id}" data-current-value="${user.isCR || false}" title="${user.isCR ? 'Remove CR role' : 'Make CR'}">
                <i class="fas fa-user-graduate"></i> ${user.isCR ? 'Remove CR' : 'Make CR'}
              </button>
              <button class="btn btn-sm toggle-blocked-btn ${user.isBlocked ? 'active danger' : ''}" data-user-id="${user.id}" data-current-value="${user.isBlocked || false}" title="${user.isBlocked ? 'Unblock user' : 'Block user'}">
                <i class="fas fa-${user.isBlocked ? 'unlock' : 'ban'}"></i> ${user.isBlocked ? 'Unblock' : 'Block'}
              </button>
            ` : '<span class="admin-protected">Admin account</span>'}
            <button class="btn btn-sm edit-user-btn" data-user-id="${user.id}" title="Edit user profile">
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

    let filtered = [...this.allUsers];

    if (department !== 'All') {
      filtered = filtered.filter(u => u.department === department);
    }
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
    if (role !== 'All') {
      switch (role) {
        case 'Admin':
          filtered = filtered.filter(u => u.isAdmin === true);
          break;
        case 'CR':
          filtered = filtered.filter(u => u.isCR === true);
          break;
        case 'Blocked':
          filtered = filtered.filter(u => u.isBlocked === true);
          break;
        case 'User':
          filtered = filtered.filter(u => !u.isAdmin && !u.isCR && !u.isBlocked);
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

    if (filterDept) filterDept.value = 'All';
    if (filterSem) filterSem.value = 'All';
    if (filterSection) filterSection.value = 'All';
    if (filterRole) filterRole.value = 'All';

    this.renderUserList(this.allUsers);
  },

  async toggleUserRole(userId, role, value) {
    if (!this.isAdmin) return;

    const roleNames = {
      'isCR': 'CR',
      'isBlocked': value ? 'Block' : 'Unblock'
    };

    const action = value ? 'add' : 'remove';
    const confirmed = confirm(`Are you sure you want to ${value ? 'assign' : 'remove'} ${roleNames[role]} ${value ? 'to' : 'from'} this user?`);
    if (!confirmed) return;

    const result = await DB.updateUserRole(userId, role, value);
    if (result.success) {
      // Update local state
      const userIndex = this.allUsers.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        this.allUsers[userIndex][role] = value;
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

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
