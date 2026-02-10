// ============================================
// PROFILE MODULE
// ============================================

const Profile = {
  currentProfile: null,

  async init() {
    this.setupEventListeners();
  },

  setupEventListeners() {
    const self = this;
    
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
      logoutBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        try {
          const confirmed = confirm('Are you sure you want to logout?');
          if (confirmed) {
            self.currentProfile = null;
            await Auth.logout();
            // Navigate to login
            window.location.hash = '';
            window.location.reload();
          }
        } catch (error) {
          console.error('Logout error:', error);
          window.location.hash = '';
          window.location.reload();
        }
      });
    }

    // Profile settings form submission
    const profileForm = document.getElementById('profile-settings-form');
    if (profileForm) {
      profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        await self.handleSaveProfile();
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
      document.getElementById('profile-student-id').textContent = `Student ID: ${this.currentProfile.studentId || 'Not set'}`;
      
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
    try {
      const department = document.getElementById('profile-department').value;
      const semester = document.getElementById('profile-semester').value;
      const section = document.getElementById('profile-section').value;

      if (!department || !semester || !section) {
        UI.showMessage('profile-message', 'Please select all fields', 'error');
        return;
      }

      // Ensure profile is loaded
      if (!this.currentProfile) {
        UI.showMessage('profile-message', 'Loading profile data, please wait...', 'info');
        await this.loadProfile();
        if (!this.currentProfile) {
          UI.showMessage('profile-message', 'Could not load profile. Please try again.', 'error');
          return;
        }
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
        // Update current profile
        this.currentProfile.department = department;
        this.currentProfile.semester = semester;
        this.currentProfile.section = section;

        // Update localStorage
        localStorage.setItem('userProfile', JSON.stringify({
          department,
          semester,
          section,
          email: this.currentProfile.email
        }));

        // Update App's userProfile so dashboard reloads correctly
        if (App.userProfile) {
          App.userProfile.department = department;
          App.userProfile.semester = semester;
          App.userProfile.section = section;
        }

        UI.showMessage('profile-message', 'Profile updated successfully! Redirecting...', 'success');
        
        // Redirect to dashboard after 1 second
        setTimeout(() => {
          Router.navigate('dashboard');
        }, 1000);
      } else {
        UI.showMessage('profile-message', result.error || 'Failed to save changes', 'error');
      }

      UI.showLoading(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      UI.showMessage('profile-message', 'An error occurred. Please try again.', 'error');
      UI.showLoading(false);
    }
  }
};
