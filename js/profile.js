// ============================================
// PROFILE MODULE
// ============================================

const Profile = {
  currentProfile: null,

  async init() {
    this.setupEventListeners();
    this.setupNotificationSettingsListeners();
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
      logoutBtn.addEventListener('click', async function (e) {
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
      profileForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        e.stopPropagation();
        await self.handleSaveProfile();
      });
    }



    // Reset Password button
    const resetPasswordBtn = document.getElementById('profile-reset-password-btn');
    if (resetPasswordBtn) {
      resetPasswordBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await self.handleProfilePasswordReset();
      });
    }

    // Listen for department/semester changes to update sections
    const profileDept = document.getElementById('profile-department');
    const profileSem = document.getElementById('profile-semester');

    if (profileDept && profileSem) {
      profileDept.addEventListener('change', () => this.updateSectionDropdown('profile-section', profileDept.value, profileSem.value));
      profileSem.addEventListener('change', () => this.updateSectionDropdown('profile-section', profileDept.value, profileSem.value));
    }

    // Live preview for theme changes
    const profileTheme = document.getElementById('profile-theme');
    if (profileTheme) {
      profileTheme.addEventListener('change', async (e) => {
        const selectedTheme = e.target.value;
        if (selectedTheme === 'dark') {
          document.body.classList.add('dark-mode');
        } else if (selectedTheme === 'light') {
          document.body.classList.remove('dark-mode');
        } else {
          // system default
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
          } else {
            document.body.classList.remove('dark-mode');
          }
        }

        // Auto-save theme
        const userId = Auth.getUserId();
        if (userId && self.currentProfile) {
          try {
            self.currentProfile.theme = selectedTheme;
            if (window.App && App.userProfile) {
              App.userProfile.theme = selectedTheme;
            }

            // Update localStorage
            const storedProfile = localStorage.getItem('userProfile');
            if (storedProfile) {
              const profileData = JSON.parse(storedProfile);
              profileData.theme = selectedTheme;
              localStorage.setItem('userProfile', JSON.stringify(profileData));
            }

            // Save to DB
            const result = await DB.updateUserProfile(userId, {
              theme: selectedTheme,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            if (result.success) {
              UI.showMessage('profile-message', 'Theme saved!', 'success');
              setTimeout(() => {
                const msg = document.getElementById('profile-message');
                if (msg && msg.innerText === 'Theme saved!') msg.style.display = 'none';
              }, 2000);
            } else {
              UI.showMessage('profile-message', 'Failed to save theme online', 'error');
            }
          } catch (err) {
            console.error('Error auto-saving theme:', err);
          }
        }
      });
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

      // Check if user is Faculty
      const isFaculty = this.currentProfile.isFaculty === true || this.currentProfile.role === 'Faculty';

      // Populate form fields
      document.getElementById('profile-email').textContent = this.currentProfile.email;
      document.getElementById('profile-student-id').textContent = `Student ID: ${this.currentProfile.studentId || 'Not set'}`;

      // Show cooldown status if applicable
      this.updateCooldownMessage();

      // Load dropdown options
      const deptResult = await DB.getDepartments();

      if (deptResult.success) {
        await UI.populateDropdown('profile-department', deptResult.data, this.currentProfile.department);
      }

      if (isFaculty) {
        // Faculty users: semester and section are readonly
        await this.renderFacultyProfileUI();
      } else {
        // Regular users: load semester and section normally
        const semResult = await DB.getSemesters();

        if (semResult.success) {
          await UI.populateDropdown('profile-semester', semResult.data, this.currentProfile.semester);
        }

        // Load sections
        await this.updateSectionDropdown('profile-section', this.currentProfile.department, this.currentProfile.semester, this.currentProfile.section);
      }
    }

    // Load theme setting
    const themeSelect = document.getElementById('profile-theme');
    if (themeSelect) {
      themeSelect.value = this.currentProfile.theme || 'system';
    }

    // Update notification status
    this.updateNotificationStatus();

    UI.showLoading(false);
  },

  // Render Faculty-specific profile UI with readonly semester/section
  async renderFacultyProfileUI() {
    const semesterSelect = document.getElementById('profile-semester');
    const sectionSelect = document.getElementById('profile-section');

    if (semesterSelect) {
      // Replace semester dropdown with readonly text
      const semesterContainer = semesterSelect.parentElement;
      semesterContainer.innerHTML = `
        <label for="profile-semester">Semester</label>
        <input type="text" id="profile-semester" value="Not Available For Faculty" readonly class="readonly-field" />
      `;
    }

    if (sectionSelect) {
      // Replace section dropdown with readonly text
      const sectionContainer = sectionSelect.parentElement;
      sectionContainer.innerHTML = `
        <label for="profile-section">Section</label>
        <input type="text" id="profile-section" value="Not Available For Faculty" readonly class="readonly-field" />
      `;
    }
  },

  async updateSectionDropdown(elementId, department, semester, selectedValue = null) {
    const result = await DB.getSections(department, semester);
    if (result.success) {
      await UI.populateDropdown(elementId, result.data, selectedValue);
    }
  },

  updateCooldownMessage() {
    const cooldownMsg = document.getElementById('profile-cooldown-message');
    if (!cooldownMsg || !this.currentProfile) return;

    // Admins bypass cooldown
    if (App.isAdmin) {
      cooldownMsg.style.display = 'none';
      return;
    }

    if (this.currentProfile.lastProfileChange) {
      const lastChange = this.currentProfile.lastProfileChange.toDate ?
        this.currentProfile.lastProfileChange.toDate() :
        new Date(this.currentProfile.lastProfileChange);
      const now = new Date();
      const daysSinceChange = Math.floor((now - lastChange) / (1000 * 60 * 60 * 24));
      const daysRemaining = 30 - daysSinceChange;

      if (daysRemaining > 0) {
        cooldownMsg.innerHTML = `<i class="fas fa-clock"></i> You last changed your profile ${daysSinceChange} day${daysSinceChange !== 1 ? 's' : ''} ago. You can change again in <strong>${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}</strong>.`;
        cooldownMsg.style.display = 'block';
      } else {
        cooldownMsg.style.display = 'none';
      }
    } else {
      cooldownMsg.style.display = 'none';
    }
  },

  async handleSaveProfile() {
    try {
      // Check if user is blocked
      if (App.isBlocked) {
        UI.showMessage('profile-message', 'Your account has been restricted. You cannot change profile settings.', 'error');
        return;
      }

      // Check if user is Faculty
      const isFaculty = this.currentProfile && (this.currentProfile.isFaculty === true || this.currentProfile.role === 'Faculty');

      const department = document.getElementById('profile-department').value;
      let semester, section;

      if (isFaculty) {
        // Faculty users: skip semester/section validation
        semester = null;
        section = null;
      } else {
        // Regular users: validate semester and section
        semester = document.getElementById('profile-semester').value;
        section = document.getElementById('profile-section').value;

        if (!semester || !section) {
          UI.showMessage('profile-message', 'Please select all fields', 'error');
          return;
        }
      }

      if (!department) {
        UI.showMessage('profile-message', 'Please select department', 'error');
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
      if (isFaculty) {
        // For Faculty, only check department
        if (department === this.currentProfile.department) {
          UI.showMessage('profile-message', 'No changes detected', 'info');
          return;
        }
      } else {
        // For regular users, check all fields
        if (department === this.currentProfile.department &&
          semester === this.currentProfile.semester &&
          section === this.currentProfile.section) {
          UI.showMessage('profile-message', 'No changes detected', 'info');
          return;
        }
      }

      // Check profile change cooldown (30 days) - skip for admins and Faculty
      const isAdmin = App.isAdmin || false;
      if (!isAdmin && !isFaculty && this.currentProfile.lastProfileChange) {
        const lastChange = this.currentProfile.lastProfileChange.toDate ?
          this.currentProfile.lastProfileChange.toDate() :
          new Date(this.currentProfile.lastProfileChange);
        const now = new Date();
        const daysSinceChange = Math.floor((now - lastChange) / (1000 * 60 * 60 * 24));
        const daysRemaining = 30 - daysSinceChange;

        if (daysRemaining > 0) {
          UI.showMessage('profile-message',
            `You can only change your profile once every 30 days. Please wait ${daysRemaining} more day${daysRemaining !== 1 ? 's' : ''}, or contact Admin at t.me/oUITS_res`,
            'error');
          return;
        }
      }

      // Confirm changes
      let confirmMessage;
      if (isFaculty) {
        confirmMessage = `Are you sure you want to change your details to:\n\nDepartment: ${department}\n\nThis will update your dashboard.`;
      } else {
        confirmMessage = `Are you sure you want to change your settings to:\n\nDepartment: ${department}\nSemester: ${semester}\nSection: ${section}\n\nThis will update your personalized dashboard.\n\nNote: You won't be able to change academic details again for 30 days.`;
      }

      const confirmed = confirm(confirmMessage);

      if (!confirmed) return;

      UI.showLoading(true);

      const userId = Auth.getUserId();
      const updateData = {
        department,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      if (!isFaculty) {
        updateData.semester = semester;
        updateData.section = section;
        updateData.lastProfileChange = firebase.firestore.FieldValue.serverTimestamp();
      }

      const result = await DB.updateUserProfile(userId, updateData);

      if (result.success) {
        // Update current profile
        this.currentProfile.department = department;
        if (!isFaculty) {
          this.currentProfile.semester = semester;
          this.currentProfile.section = section;
          this.currentProfile.lastProfileChange = new Date();
        }

        // Update localStorage
        const profileData = {
          department,
          email: this.currentProfile.email,
          theme: this.currentProfile.theme || 'system'
        };
        if (!isFaculty) {
          profileData.semester = semester;
          profileData.section = section;
        }
        localStorage.setItem('userProfile', JSON.stringify(profileData));

        // Update App's userProfile so dashboard reloads correctly
        if (App.userProfile) {
          App.userProfile.department = department;
          if (!isFaculty) {
            App.userProfile.semester = semester;
            App.userProfile.section = section;
          }
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
  },

  /**
   * Updates notification status display in profile settings
   */
  updateNotificationStatus() {
    const statusText = document.getElementById('notification-status-text');
    const enableBtn = document.getElementById('enable-notifications-settings-btn');
    const instructions = document.getElementById('notification-settings-instructions');
    const instructionsText = document.getElementById('notification-settings-instructions-text');

    if (!statusText || !enableBtn) return;

    // Check if notifications are supported
    if (!('Notification' in window)) {
      statusText.textContent = 'Not supported in this browser';
      statusText.style.color = 'var(--text-secondary)';
      enableBtn.style.display = 'none';
      return;
    }

    const permission = Notification.permission;

    if (permission === 'granted') {
      statusText.textContent = 'Enabled - You will receive notifications';
      statusText.style.color = 'var(--success-color)';
      enableBtn.style.display = 'none';
      if (instructions) instructions.style.display = 'none';
    } else if (permission === 'denied') {
      statusText.textContent = 'Blocked - Enable in browser settings';
      statusText.style.color = 'var(--danger-color)';
      enableBtn.style.display = 'none';

      // Show instructions
      if (instructions && instructionsText && PermissionManager) {
        instructionsText.textContent = PermissionManager.getEnableInstructions();
        instructions.style.display = 'flex';
      }
    } else {
      statusText.textContent = 'Not enabled';
      statusText.style.color = 'var(--text-secondary)';
      enableBtn.style.display = 'inline-block';
      if (instructions) instructions.style.display = 'none';
    }
  },

  /**
   * Sets up notification settings event listeners
   */
  setupNotificationSettingsListeners() {
    const enableBtn = document.getElementById('enable-notifications-settings-btn');

    if (enableBtn) {
      enableBtn.addEventListener('click', async () => {
        if (PermissionManager) {
          const result = await PermissionManager.requestPermission();
          this.updateNotificationStatus();

          if (result.granted && NotificationManager) {
            await NotificationManager.init();
          }
        }
      });
    }
  },


  async handleProfilePasswordReset() {
    if (!this.currentProfile || !this.currentProfile.email) {
      UI.showMessage('profile-message', 'Error: User profile not loaded or email missing.', 'error');
      return;
    }

    const confirmed = confirm(`Send password reset email to ${this.currentProfile.email}?`);
    if (!confirmed) return;

    UI.showLoading(true);
    UI.showMessage('profile-message', 'Sending password reset email...', 'info');

    try {
      const result = await Auth.sendPasswordResetEmail(this.currentProfile.email);

      if (result.success) {
        UI.showMessage('profile-message', 'Password reset email sent! Check your inbox.', 'success');
      } else {
        UI.showMessage('profile-message', result.error, 'error');
      }
    } catch (error) {
      console.error('Profile password reset error:', error);
      UI.showMessage('profile-message', 'An error occurred. Please try again.', 'error');
    } finally {
      UI.showLoading(false);
    }
  }
};
