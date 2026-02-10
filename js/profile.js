// ============================================
// PROFILE MODULE
// ============================================

const Profile = {
  currentProfile: null,

  async init() {
    await this.setupEventListeners();
  },

  async setupEventListeners() {
    // User details card click
    const userDetailsCard = document.getElementById('user-details-card');
    if (userDetailsCard) {
      userDetailsCard.addEventListener('click', () => {
        Router.navigate('profile-settings');
      });
    }

    // Back to dashboard button
    const backBtn = document.getElementById('back-to-dashboard-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        Router.navigate('dashboard');
      });
    }

    // Cancel settings button
    const cancelBtn = document.getElementById('cancel-settings-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        Router.navigate('dashboard');
      });
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        const confirmed = confirm('Are you sure you want to logout?');
        if (confirmed) {
          const result = await Auth.logout();
          if (result.success) {
            Router.navigate('login');
          }
        }
      });
    }

    // Profile settings form
    const profileForm = document.getElementById('profile-settings-form');
    if (profileForm) {
      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleSaveProfile();
      });
    }

    // Listen for department/semester changes to update sections
    const profileDept = document.getElementById('profile-department');
    const profileSem = document.getElementById('profile-semester');
    
    if (profileDept && profileSem) {
      profileDept.addEventListener('change', () => this.updateSectionDropdown('profile-section', profileDept.value, profileSem.value));
      profileSem.addEventListener('change', () => this.updateSectionDropdown('profile-section', profileDept.value, profileSem.value));
    }
  },

  async loadProfile() {
    const userId = Auth.getUserId();
    if (!userId) return;

    UI.showLoading(true);

    // Get user profile
    const result = await DB.getUserProfile(userId);
    
    if (result.success) {
      this.currentProfile = result.data;
      
      // Populate form fields
      document.getElementById('profile-email').textContent = this.currentProfile.email;
      document.getElementById('profile-id').textContent = `ID: ${userId.slice(0, 8)}`;
      
      // Load dropdown options
      const deptResult = await DB.getDepartments();
      const semResult = await DB.getSemesters();
      
      if (deptResult.success) {
        await UI.populateDropdown('profile-department', deptResult.data, this.currentProfile.department);
      }
      
      if (semResult.success) {
        await UI.populateDropdown('profile-semester', semResult.data, this.currentProfile.semester);
      }
      
      // Load sections
      await this.updateSectionDropdown('profile-section', this.currentProfile.department, this.currentProfile.semester, this.currentProfile.section);
    }

    UI.showLoading(false);
  },

  async updateSectionDropdown(elementId, department, semester, selectedValue = null) {
    const result = await DB.getSections(department, semester);
    if (result.success) {
      await UI.populateDropdown(elementId, result.data, selectedValue);
    }
  },

  async handleSaveProfile() {
    const department = document.getElementById('profile-department').value;
    const semester = document.getElementById('profile-semester').value;
    const section = document.getElementById('profile-section').value;

    if (!department || !semester || !section) {
      UI.showMessage('profile-message', 'Please select all fields', 'error');
      return;
    }

    // Check if anything changed
    if (department === this.currentProfile.department && 
        semester === this.currentProfile.semester && 
        section === this.currentProfile.section) {
      UI.showMessage('profile-message', 'No changes detected', 'info');
      return;
    }

    // Confirm changes
    const confirmed = confirm(`Are you sure you want to change your settings to:\n\nDepartment: ${department}\nSemester: ${semester}\nSection: ${section}\n\nThis will update your personalized dashboard.`);
    
    if (!confirmed) return;

    UI.showLoading(true);

    const userId = Auth.getUserId();
    const result = await DB.updateUserProfile(userId, {
      department,
      semester,
      section
    });

    if (result.success) {
      // Update localStorage
      localStorage.setItem('userProfile', JSON.stringify({
        department,
        semester,
        section,
        email: this.currentProfile.email
      }));

      UI.showMessage('profile-message', 'Profile updated successfully! Redirecting...', 'success');
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        Router.navigate('dashboard');
      }, 1000);
    } else {
      UI.showMessage('profile-message', result.error, 'error');
    }

    UI.showLoading(false);
  }
};
