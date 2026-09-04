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
            // Show loading screen immediately to hide all dashboard elements
            UI.showLoading(true);
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

    // Admin preview role selector
    const previewSelect = document.getElementById('admin-preview-select');
    if (previewSelect) {
      previewSelect.addEventListener('change', (e) => {
        const selectedRole = e.target.value;
        if (typeof App !== 'undefined' && typeof App.applyPreviewRole === 'function') {
          App.applyPreviewRole(selectedRole, true);
        }
      });
    }

    // Exit preview button in profile
    const exitProfileBtn = document.getElementById('exit-preview-profile-btn');
    if (exitProfileBtn) {
      exitProfileBtn.addEventListener('click', () => {
        if (typeof App !== 'undefined' && typeof App.exitPreview === 'function') {
          App.exitPreview();
        }
      });
    }

    // Live preview for theme changes
    const profileTheme = document.getElementById('profile-theme');
    if (profileTheme) {
      profileTheme.addEventListener('change', async (e) => {
        const selectedTheme = e.target.value;
        if (selectedTheme === 'dark' || selectedTheme === 'high-contrast') {
          // High Contrast mode
          document.body.classList.add('dark-mode');
          document.body.classList.remove('gray-mode');
        } else if (selectedTheme === 'light') {
          // Light Mode
          document.body.classList.remove('dark-mode');
          document.body.classList.remove('gray-mode');
        } else if (selectedTheme === 'gray') {
          // Dark Mode
          document.body.classList.add('gray-mode');
          document.body.classList.remove('dark-mode');
        } else {
          // system default
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('gray-mode');
          } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.remove('gray-mode');
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

      // Check if user is Faculty or DptCoor
      const isFaculty = (typeof App !== 'undefined' && (App.isFaculty || App.isDptCoor)) || (this.currentProfile && (this.currentProfile.isFaculty === true || this.currentProfile.isDptCoor === true || this.currentProfile.isDptHead === true || this.currentProfile.role === 'Faculty' || this.currentProfile.role === 'DptCoor' || this.currentProfile.role === 'DptHead'));

      // Populate form fields
      document.getElementById('profile-email').textContent = this.currentProfile.email;
      const idLabel = isFaculty ? 'Faculty ID' : 'Student ID';
      const idValue = (isFaculty ? (this.currentProfile.facultyInitial || this.currentProfile.studentId) : (this.currentProfile.studentId || this.currentProfile.facultyInitial)) || 'Not set';
      const studentIdEl = document.getElementById('profile-student-id');
      if (studentIdEl) {
        studentIdEl.textContent = `${idLabel}: ${idValue}`;
      }

      // Update Role display & Admin preview selector
      this.updateRoleDisplay();

      // Show cooldown status if applicable
      this.updateCooldownMessage();

      // Load dropdown options
      const deptResult = await DB.getDepartments();

      if (deptResult.success) {
        await UI.populateDropdown('profile-department', deptResult.data, this.currentProfile.department);
      }

      const semesterGroup = document.getElementById('profile-semester-group') || document.getElementById('profile-semester')?.closest('.form-group');
      const sectionGroup = document.getElementById('profile-section-group') || document.getElementById('profile-section')?.closest('.form-group');
      const semesterSelect = document.getElementById('profile-semester');
      const sectionSelect = document.getElementById('profile-section');

      if (isFaculty) {
        // Faculty and DptCoor users: semester and section dropdowns are hidden
        this.renderFacultyProfileUI();
      } else {
        if (semesterGroup) semesterGroup.style.display = 'block';
        if (sectionGroup) sectionGroup.style.display = 'block';
        if (semesterSelect) semesterSelect.setAttribute('required', '');
        if (sectionSelect) sectionSelect.setAttribute('required', '');

        // Regular users: load semester and section normally
        const semResult = await DB.getSemesters();

        if (semResult.success) {
          const isCurrentlyAlumni = this.currentProfile.semester === 'alumni / special';
          // Filter out 'alumni / special' so users cannot see or select it in profile page
          let semesterOptions = (semResult.data || []).filter(s => {
            const sNorm = (typeof s === 'string' ? s.toLowerCase().trim() : '');
            return sNorm !== 'alumni / special' && sNorm !== 'alumni/special' && !sNorm.startsWith('alumni');
          });

          // If the user is already alumni / special (set via auto-promotion or admin), include it so current status displays
          if (isCurrentlyAlumni) {
            semesterOptions.push('alumni / special');
          }

          await UI.populateDropdown('profile-semester', semesterOptions, this.currentProfile.semester);
        }

        // If user is alumni / special, make semester dropdown disabled/readonly so it cannot be changed further
        if (semesterSelect && this.currentProfile.semester === 'alumni / special') {
          semesterSelect.disabled = true;
          semesterSelect.title = 'Alumni / Special semester status cannot be changed further.';
        }

        // Load sections
        await this.updateSectionDropdown('profile-section', this.currentProfile.department, this.currentProfile.semester, this.currentProfile.section);
      }
    }

    // Load theme setting
    const themeSelect = document.getElementById('profile-theme');
    if (themeSelect) {
      themeSelect.innerHTML = `
        <option value="system">System Default</option>
        <option value="light">Light Mode</option>
        <option value="gray">Dark Mode</option>
        <option value="dark">High Contrast</option>
      `;
      const savedTheme = this.currentProfile.theme || 'system';
      themeSelect.value = (savedTheme === 'high-contrast') ? 'dark' : savedTheme;
    }

    // Update notification status
    this.updateNotificationStatus();

    UI.showLoading(false);
  },

  // Update role badge, preview tag, and admin preview dropdown
  updateRoleDisplay() {
    const roleBadge = document.getElementById('profile-role-badge');
    const previewTag = document.getElementById('profile-role-preview-tag');
    const previewControl = document.getElementById('admin-preview-control');
    const previewSelect = document.getElementById('admin-preview-select');
    const exitProfileBtn = document.getElementById('exit-preview-profile-btn');

    if (!roleBadge) return;

    // Determine current effective role
    let effectiveRole = 'Student';
    if (typeof App !== 'undefined') {
      if (App.isAdmin) effectiveRole = 'Admin';
      else if (App.isDptCoor) effectiveRole = 'DptCoor';
      else if (App.isFaculty) effectiveRole = 'Faculty';
      else if (App.isCR) effectiveRole = 'CR';
      else if (App.isBlocked) effectiveRole = 'Blocked';
    } else if (this.currentProfile) {
      if (this.currentProfile.isAdmin) effectiveRole = 'Admin';
      else if (this.currentProfile.isDptCoor || this.currentProfile.role === 'DptCoor' || this.currentProfile.isDptHead || this.currentProfile.role === 'DptHead') effectiveRole = 'DptCoor';
      else if (this.currentProfile.isFaculty || this.currentProfile.role === 'Faculty') effectiveRole = 'Faculty';
      else if (this.currentProfile.isCR || this.currentProfile.role === 'CR') effectiveRole = 'CR';
      else if (this.currentProfile.isBlocked) effectiveRole = 'Blocked';
    }

    // Set role badge text and class
    roleBadge.textContent = effectiveRole;
    roleBadge.className = `role-badge ${effectiveRole.toLowerCase()}`;

    // Toggle faculty profile UI if previewing or real faculty / DptCoor
    const isEffectiveFaculty = effectiveRole === 'Faculty' || effectiveRole === 'DptCoor';
    if (isEffectiveFaculty) {
      this.renderFacultyProfileUI();
    } else {
      const semesterGroup = document.getElementById('profile-semester-group') || document.getElementById('profile-semester')?.closest('.form-group');
      const sectionGroup = document.getElementById('profile-section-group') || document.getElementById('profile-section')?.closest('.form-group');
      const semesterSelect = document.getElementById('profile-semester');
      const sectionSelect = document.getElementById('profile-section');
      if (semesterGroup) semesterGroup.style.display = 'block';
      if (sectionGroup) sectionGroup.style.display = 'block';
      if (semesterSelect) semesterSelect.setAttribute('required', '');
      if (sectionSelect) sectionSelect.setAttribute('required', '');
    }

    // Update ID label (Faculty ID vs Student ID) based on effective role
    const studentIdEl = document.getElementById('profile-student-id');
    if (studentIdEl && this.currentProfile) {
      const idLabel = isEffectiveFaculty ? 'Faculty ID' : 'Student ID';
      const idValue = (isEffectiveFaculty ? (this.currentProfile.facultyInitial || this.currentProfile.studentId) : (this.currentProfile.studentId || this.currentProfile.facultyInitial)) || 'Not set';
      studentIdEl.textContent = `${idLabel}: ${idValue}`;
    }

    // Is preview mode active?
    const isPreview = typeof App !== 'undefined' && !!(App.realRoles?.isAdmin && App.previewRole);
    if (previewTag) {
      previewTag.style.display = isPreview ? 'inline-block' : 'none';
    }
    if (exitProfileBtn) {
      exitProfileBtn.style.display = isPreview ? 'inline-flex' : 'none';
    }

    // Unapproved state tag for faculty accounts
    const approvalTag = document.getElementById('profile-role-approval-tag');
    const isUnapprovedFaculty = this.currentProfile && 
      (this.currentProfile.isFaculty || this.currentProfile.role === 'Faculty') && 
      (this.currentProfile.isApproved === false || this.currentProfile.approved === false);

    if (approvalTag) {
      approvalTag.style.display = (isUnapprovedFaculty && !isPreview) ? 'inline-block' : 'none';
    }

    // Is the real user an Admin? If so, show the "Preview as" dropdown
    const isRealAdmin = typeof App !== 'undefined' && !!(App.realRoles?.isAdmin || (App.isAdmin && !App.previewRole));
    if (previewControl) {
      if (isRealAdmin) {
        previewControl.style.display = 'flex';
        if (previewSelect) {
          previewSelect.value = App.previewRole || 'none';
        }
      } else {
        previewControl.style.display = 'none';
      }
    }
  },

  // Render Faculty-specific profile UI by hiding semester and section dropdowns
  renderFacultyProfileUI() {
    const semesterGroup = document.getElementById('profile-semester-group') || document.getElementById('profile-semester')?.closest('.form-group');
    const sectionGroup = document.getElementById('profile-section-group') || document.getElementById('profile-section')?.closest('.form-group');
    const semesterSelect = document.getElementById('profile-semester');
    const sectionSelect = document.getElementById('profile-section');

    if (semesterGroup) semesterGroup.style.display = 'none';
    if (sectionGroup) sectionGroup.style.display = 'none';
    if (semesterSelect) semesterSelect.removeAttribute('required');
    if (sectionSelect) sectionSelect.removeAttribute('required');
  },

  async updateSectionDropdown(elementId, department, semester, selectedValue = null) {
    const result = await DB.getSections(department, semester);
    if (result.success) {
      await UI.populateDropdown(elementId, result.data, selectedValue);
    }
  },

  updateCooldownMessage() {
    const cooldownMsg = document.getElementById('profile-cooldown-message');
    const pausedNote = document.getElementById('semester-cooldown-paused-note');
    if (!cooldownMsg || !this.currentProfile) return;

    // Admins bypass cooldown
    if (App.isAdmin) {
      cooldownMsg.style.display = 'none';
      if (pausedNote) pausedNote.style.display = 'none';
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
        if (pausedNote) pausedNote.style.display = 'block';
      } else {
        cooldownMsg.style.display = 'none';
        if (pausedNote) pausedNote.style.display = 'none';
      }
    } else {
      cooldownMsg.style.display = 'none';
      if (pausedNote) pausedNote.style.display = 'none';
    }
  },

  async handleSaveProfile() {
    try {
      // Check if user is blocked
      if (App.isBlocked) {
        UI.showMessage('profile-message', 'Your account has been restricted. You cannot change profile settings.', 'error');
        return;
      }

      // Check if user is Faculty or DptCoor
      const isFaculty = (typeof App !== 'undefined' && (App.isFaculty || App.isDptCoor)) || (this.currentProfile && (this.currentProfile.isFaculty === true || this.currentProfile.isDptCoor === true || this.currentProfile.isDptHead === true || this.currentProfile.role === 'Faculty' || this.currentProfile.role === 'DptCoor' || this.currentProfile.role === 'DptHead'));

      const department = document.getElementById('profile-department').value;
      let semester, section;

      if (isFaculty) {
        // Faculty / DptCoor users: skip semester/section validation
        semester = null;
        section = null;
      } else {
        // Regular users: validate semester and section
        semester = document.getElementById('profile-semester').value;
        section = document.getElementById('profile-section').value;

        // If user is already alumni / special, keep their semester locked to alumni / special
        if (this.currentProfile?.semester === 'alumni / special') {
          semester = 'alumni / special';
        } else if (semester === 'alumni / special') {
          UI.showMessage('profile-message', 'Alumni / Special semester cannot be selected manually. It is set by auto-promotion logic or by an administrator.', 'error');
          return;
        }

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
