// ============================================
// MAIN APPLICATION
// ============================================

const App = {
  userProfile: null,

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

    // Initialize Profile module
    await Profile.init();
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
      // Auth state listener will handle navigation
      UI.hideMessage('auth-message');
    } else {
      UI.showMessage('auth-message', result.error, 'error');
      UI.showLoading(false);
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
      // Auth state listener will handle navigation
    } else {
      UI.showMessage('auth-message', result.error, 'error');
      UI.showLoading(false);
    }
  },

  async handleAuthenticatedUser(user) {
    // Check if user has profile
    const profileResult = await DB.getUserProfile(user.uid);

    if (profileResult.success) {
      // User has profile, load dashboard
      this.userProfile = profileResult.data;
      
      // Save to localStorage
      Utils.storage.set('userProfile', this.userProfile);
      
      // Update user details card
      UI.updateUserDetailsCard(
        this.userProfile.email,
        this.userProfile.department,
        this.userProfile.semester,
        this.userProfile.section
      );

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
    const department = document.getElementById('set-department').value;
    const semester = document.getElementById('set-semester').value;
    const section = document.getElementById('set-section').value;

    if (!department || !semester || !section) {
      UI.showMessage('set-details-message', 'Please select all fields', 'error');
      return;
    }

    UI.showLoading(true);

    const userId = Auth.getUserId();
    const email = Auth.getUserEmail();

    const result = await DB.createUserProfile(userId, {
      email,
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

    const { department, semester, section } = this.userProfile;

    // Load resource links
    const resourceResult = await DB.getResourceLinks(department);
    if (resourceResult.success) {
      UI.renderResourceLinks(resourceResult.data);
    }

    // Load tasks
    const tasksResult = await DB.getTasks(department, semester, section);
    if (tasksResult.success) {
      UI.renderTasks(tasksResult.data);
    }

    // Load events
    const eventsResult = await DB.getEvents(department);
    if (eventsResult.success) {
      UI.renderEvents(eventsResult.data);
    }

    UI.showLoading(false);
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
