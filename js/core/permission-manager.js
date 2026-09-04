// ============================================
// PERMISSION MANAGER
// ============================================

/**
 * Manages notification permission state and user interactions
 */
const PermissionManager = {
  /**
   * Gets current notification permission state
   * @returns {string} 'granted', 'denied', or 'default'
   */
  getPermissionState() {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  },

  /**
   * Checks if notification permission is granted
   * @returns {boolean}
   */
  isGranted() {
    return this.getPermissionState() === 'granted';
  },

  /**
   * Requests notification permission from the user
   * @returns {Promise<{granted: boolean, state: string}>}
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported in this browser');
      return { granted: false, state: 'denied' };
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      
      this.savePermissionState(permission);
      
      return { granted, state: permission };
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return { granted: false, state: 'denied' };
    }
  },

  /**
   * Saves user's permission decision to localStorage
   * @param {string} state - Permission state ('granted', 'denied', or 'default')
   */
  savePermissionState(state) {
    const timestamp = Date.now();
    const permissionData = {
      state,
      requestedAt: timestamp
    };

    if (state === 'granted') {
      permissionData.grantedAt = timestamp;
    } else if (state === 'denied') {
      permissionData.deniedAt = timestamp;
    }

    Utils.storage.set('notificationPermission', permissionData);
  },

  /**
   * Shows permission prompt UI
   */
  showPermissionPrompt() {
    const promptEl = document.getElementById('notification-permission-prompt');
    if (promptEl) {
      promptEl.style.display = 'block';
    }
  },

  /**
   * Hides permission prompt UI
   */
  hidePermissionPrompt() {
    const promptEl = document.getElementById('notification-permission-prompt');
    if (promptEl) {
      promptEl.style.display = 'none';
    }
  },

  /**
   * Shows browser-specific instructions for enabling notifications
   */
  showInstructions() {
    const instructionsEl = document.getElementById('notification-instructions');
    const instructionsTextEl = document.getElementById('notification-instructions-text');
    
    if (instructionsEl && instructionsTextEl) {
      instructionsTextEl.textContent = this.getEnableInstructions();
      instructionsEl.style.display = 'flex';
    }
  },

  /**
   * Hides browser-specific instructions
   */
  hideInstructions() {
    const instructionsEl = document.getElementById('notification-instructions');
    if (instructionsEl) {
      instructionsEl.style.display = 'none';
    }
  },

  /**
   * Initializes permission prompt event listeners
   */
  initPromptListeners() {
    const enableBtn = document.getElementById('enable-notifications-btn');
    const dismissBtn = document.getElementById('dismiss-notifications-btn');

    if (enableBtn) {
      enableBtn.addEventListener('click', async () => {
        const result = await this.requestPermission();
        
        if (result.granted) {
          this.hidePermissionPrompt();
          // Trigger notification system initialization
          if (window.NotificationManager) {
            await NotificationManager.init();
          }
        } else if (result.state === 'denied') {
          this.showInstructions();
        }
      });
    }

    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        this.hidePermissionPrompt();
        // Save dismissal to avoid showing again immediately
        Utils.storage.set('notificationPromptDismissed', Date.now());
      });
    }
  },

  /**
   * Checks if prompt should be shown
   * @returns {boolean}
   */
  shouldShowPrompt() {
    const state = this.getPermissionState();
    
    // Don't show if already granted or denied
    if (state !== 'default') {
      return false;
    }

    // Don't show if recently dismissed (within 7 days)
    const dismissed = Utils.storage.get('notificationPromptDismissed');
    if (dismissed) {
      const daysSinceDismissed = (Date.now() - dismissed) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return false;
      }
    }

    return true;
  },

  /**
   * Provides instructions for enabling notifications in browser settings
   * @returns {string} Browser-specific instructions
   */
  getEnableInstructions() {
    const userAgent = navigator.userAgent;
    const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isEdge = /Edg/.test(userAgent);

    if (isChrome) {
      return 'To enable notifications: Click the lock icon in the address bar → Site settings → Notifications → Allow';
    } else if (isFirefox) {
      return 'To enable notifications: Click the lock icon in the address bar → Permissions → Notifications → Allow';
    } else if (isSafari) {
      return 'To enable notifications: Safari → Preferences → Websites → Notifications → Allow for this site';
    } else if (isEdge) {
      return 'To enable notifications: Click the lock icon in the address bar → Site permissions → Notifications → Allow';
    }
    
    return 'To enable notifications: Check your browser settings → Site permissions → Notifications';
  }
};
