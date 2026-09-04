/**
 * Install Prompt Manager
 * Manages PWA install prompt and user preferences
 */

class InstallPromptManager {
  constructor() {
    this.promptEvent = null;
    this.eventFired = false;
    this.STORAGE_KEY = 'pwa-install-dismissed';
    this.autoDismissTimer = null;
  }

  /**
   * Initializes install prompt listeners
   */
  init() {
    console.log('[Install Prompt] Initializing...');
    window.installPromptManager = this;

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('[Install Prompt] beforeinstallprompt event fired');
      this.captureInstallPrompt(e);
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('[Install Prompt] App installed');
      this.hideInstallPrompt();
      localStorage.setItem('pwa-installed', 'true');
    });

    // Listen for route changes to show prompt after leaving login screen
    window.addEventListener('hashchange', () => {
      this.checkAndShowPostLogin();
    });

    // Check if already installed
    if (this.isAppInstalled()) {
      console.log('[Install Prompt] App is already installed');
      return;
    }

    // Set timeout to detect if event never fires
    setTimeout(() => {
      if (!this.eventFired) {
        console.log('[Install Prompt] Event not fired - checking for iOS or already installed');
        this.handleNoPromptEvent();
      }
    }, 5000);

    // Setup UI event listeners
    this.setupUIListeners();
  }

  /**
   * Setup UI event listeners for install prompt
   */
  setupUIListeners() {
    const prompt = document.getElementById('install-prompt');
    const installBtn = document.getElementById('install-btn');
    const dismissBtn = document.getElementById('dismiss-install-btn');

    if (prompt) {
      // Pause auto-dismiss timer on hover/focus/interaction
      prompt.addEventListener('mouseenter', () => {
        this.clearAutoDismissTimer();
      });

      // Resume auto-dismiss timer on mouse leave
      prompt.addEventListener('mouseleave', () => {
        this.startAutoDismissTimer();
      });

      prompt.addEventListener('touchstart', () => {
        this.clearAutoDismissTimer();
      }, { passive: true });
    }

    if (installBtn) {
      installBtn.addEventListener('click', () => {
        this.clearAutoDismissTimer();
        this.triggerInstall();
      });
    }

    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        this.saveUserDismissal();
        this.hideInstallPrompt();
      });
    }
  }

  /**
   * Checks if user is currently on the login or unauthenticated screen
   */
  isUserOnLoginScreen() {
    // Check if login view is currently visible
    const loginView = document.getElementById('login-view');
    if (loginView && loginView.style.display !== 'none') {
      return true;
    }

    // Check router route
    if (typeof Router !== 'undefined') {
      const route = Router.currentRoute || (typeof Router.getCurrentRoute === 'function' ? Router.getCurrentRoute() : '');
      if (route === 'login') return true;
    }

    // Check user authentication state
    if (typeof Auth !== 'undefined' && typeof Auth.getCurrentUser === 'function') {
      const user = Auth.getCurrentUser();
      if (!user) return true;
    }

    return false;
  }

  /**
   * Checks if prompt UI is currently visible
   */
  isPromptVisible() {
    const prompt = document.getElementById('install-prompt');
    return Boolean(prompt && prompt.style.display !== 'none');
  }

  /**
   * Triggers deferred prompt presentation once user has transitioned past login screen
   */
  checkAndShowPostLogin() {
    if (this.isAppInstalled() || this.hasUserDismissed()) {
      return;
    }

    if (this.isUserOnLoginScreen()) {
      return;
    }

    if (this.isPromptVisible()) {
      return;
    }

    if (this.promptEvent) {
      setTimeout(() => {
        if (!this.isUserOnLoginScreen() && !this.isPromptVisible()) {
          this.showInstallPrompt();
        }
      }, 1000);
    }
  }

  /**
   * Starts a 5-second auto-dismiss countdown if user does not interact with the prompt
   */
  startAutoDismissTimer() {
    this.clearAutoDismissTimer();
    this.autoDismissTimer = setTimeout(() => {
      console.log('[Install Prompt] Auto-dismissing after 5 seconds of no interaction');
      this.hideInstallPrompt();
    }, 5000);
  }

  /**
   * Clears active auto-dismiss timer
   */
  clearAutoDismissTimer() {
    if (this.autoDismissTimer) {
      clearTimeout(this.autoDismissTimer);
      this.autoDismissTimer = null;
    }
  }

  /**
   * Captures the beforeinstallprompt event
   * @param {Event} event - The beforeinstallprompt event
   */
  captureInstallPrompt(event) {
    // Prevent the default prompt
    event.preventDefault();
    
    this.promptEvent = event;
    this.eventFired = true;

    // Check if user has dismissed before
    if (!this.hasUserDismissed() && !this.isAppInstalled()) {
      if (!this.isUserOnLoginScreen()) {
        this.showInstallPrompt();
      } else {
        console.log('[Install Prompt] User is on login screen, deferring install prompt until after login');
      }
    }
  }

  /**
   * Shows the custom install prompt UI
   */
  showInstallPrompt() {
    if (this.isUserOnLoginScreen()) {
      console.log('[Install Prompt] Deferred: user is on login screen');
      return;
    }

    const prompt = document.getElementById('install-prompt');
    if (prompt) {
      prompt.style.display = 'block';
      console.log('[Install Prompt] Showing install prompt');
      this.startAutoDismissTimer();
    }
  }

  /**
   * Hides the install prompt UI
   */
  hideInstallPrompt() {
    this.clearAutoDismissTimer();
    const prompt = document.getElementById('install-prompt');
    if (prompt) {
      prompt.style.display = 'none';
      console.log('[Install Prompt] Hiding install prompt');
    }
  }

  /**
   * Triggers the native browser install prompt
   * @returns {Promise<{outcome: string}>}
   */
  async triggerInstall() {
    if (!this.promptEvent) {
      console.warn('[Install Prompt] No prompt event available');
      return { outcome: 'no-event' };
    }

    try {
      // Show the native install prompt
      this.promptEvent.prompt();

      // Wait for the user's response
      const choiceResult = await this.promptEvent.userChoice;
      
      console.log('[Install Prompt] User choice:', choiceResult.outcome);

      if (choiceResult.outcome === 'accepted') {
        console.log('[Install Prompt] User accepted the install prompt');
        this.hideInstallPrompt();
      } else {
        console.log('[Install Prompt] User dismissed the install prompt');
        this.saveUserDismissal();
        this.hideInstallPrompt();
      }

      // Clear the prompt event
      this.promptEvent = null;

      return { outcome: choiceResult.outcome };
    } catch (error) {
      console.error('[Install Prompt] Error triggering install:', error);
      return { outcome: 'error', error: error.message };
    }
  }

  /**
   * Checks if user has dismissed the prompt before
   * @returns {boolean}
   */
  hasUserDismissed() {
    const dismissed = localStorage.getItem(this.STORAGE_KEY);
    return dismissed === 'true';
  }

  /**
   * Saves user's dismiss preference
   */
  saveUserDismissal() {
    localStorage.setItem(this.STORAGE_KEY, 'true');
    console.log('[Install Prompt] User dismissal saved');
  }

  /**
   * Checks if app is already installed
   * @returns {boolean}
   */
  isAppInstalled() {
    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    // Check if previously installed
    if (localStorage.getItem('pwa-installed') === 'true') {
      return true;
    }

    // Check for iOS standalone mode
    if (window.navigator.standalone === true) {
      return true;
    }

    return false;
  }

  /**
   * Handle case when prompt event never fires
   */
  handleNoPromptEvent() {
    // Check if running as installed app
    if (this.isAppInstalled()) {
      console.log('[Install Prompt] App is already installed');
      return;
    }

    // Check if iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      console.log('[Install Prompt] iOS detected - showing manual instructions');
      this.showIOSInstructions();
    }
  }

  /**
   * Show iOS-specific installation instructions
   */
  showIOSInstructions() {
    // Only show if user hasn't dismissed
    if (this.hasUserDismissed()) {
      return;
    }

    const prompt = document.getElementById('install-prompt');
    if (prompt) {
      // Modify the prompt for iOS
      const content = prompt.querySelector('.install-text');
      if (content) {
        content.innerHTML = `
          <p class="install-desc">Tap <i class="fas fa-share"></i> then "Add to Home Screen"</p>
        `;
      }

      // Hide the install button, show only dismiss
      const installBtn = document.getElementById('install-btn');
      if (installBtn) {
        installBtn.style.display = 'none';
      }

      this.showInstallPrompt();
    }
  }

  /**
   * Reset dismissal (for testing or user preference)
   */
  resetDismissal() {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('[Install Prompt] Dismissal reset');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InstallPromptManager;
}
