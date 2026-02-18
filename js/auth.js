// ============================================
// AUTHENTICATION MODULE
// ============================================

const Auth = {
  currentUser: null,
  cacheManager: null,
  sessionTimer: null,
  SESSION_TIMEOUT: 60 * 60 * 1000, // 1 hour in milliseconds

  // Initialize cache manager
  initCacheManager() {
    if (!this.cacheManager && typeof CacheManager !== 'undefined') {
      this.cacheManager = new CacheManager();
      console.log('[Auth] Cache manager initialized');
    }
  },

  // Start session timeout timer
  startSessionTimer() {
    // Clear any existing timer
    this.clearSessionTimer();

    // Check if device is trusted
    const isTrusted = localStorage.getItem('trust_device') === 'true';
    if (isTrusted) {
      console.log('[Auth] Device is trusted, session will not expire automatically');
      return;
    }

    // Set new timer for 1 hour
    this.sessionTimer = setTimeout(async () => {
      console.log('[Auth] Session expired after 1 hour of inactivity');
      await this.logout();

      // Show message to user
      if (typeof UI !== 'undefined' && UI.showMessage) {
        UI.showMessage('Your session has expired for security. Please log in again.', 'info');
      }

      // Redirect to login
      if (typeof App !== 'undefined' && App.showView) {
        App.showView('login');
      }
    }, this.SESSION_TIMEOUT);

    console.log('[Auth] Session timer started (1 hour)');
  },

  // Clear session timeout timer
  clearSessionTimer() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
      console.log('[Auth] Session timer cleared');
    }
  },

  // Reset session timer on user activity
  resetSessionTimer() {
    if (this.currentUser) {
      this.startSessionTimer();
    }
  },

  // Sign up new user
  async signup(email, password) {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      this.currentUser = userCredential.user;

      // Send verification email
      await this.currentUser.sendEmailVerification();
      console.log('User signed up, verification email sent:', this.currentUser.uid);

      return { success: true, user: this.currentUser, message: 'Verification email sent! Please check your inbox.' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  },

  // Login user
  async login(email, password, rememberMe = false) {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      this.currentUser = userCredential.user;
      console.log('User logged in:', this.currentUser.uid);

      // Handle "Remember Me"
      if (rememberMe) {
        localStorage.setItem('trust_device', 'true');
        console.log('[Auth] Device marked as trusted');
      } else {
        localStorage.removeItem('trust_device');
      }

      // Start session timeout timer
      this.startSessionTimer();

      // Cache authentication state
      this.initCacheManager();
      if (this.cacheManager) {
        await this.cacheManager.cacheAuthState({
          uid: this.currentUser.uid,
          email: this.currentUser.email,
          emailVerified: this.currentUser.emailVerified
        });
      }

      return { success: true, user: this.currentUser };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  },

  // Logout user
  async logout() {
    try {
      // Clear session timer
      this.clearSessionTimer();

      // Clean up notification system
      if (window.FirestoreListenerManager) {
        FirestoreListenerManager.unsubscribeAll();
      }
      if (window.NotificationManager) {
        NotificationManager.reset();
      }

      // Clear cached data
      this.initCacheManager();
      if (this.cacheManager) {
        await this.cacheManager.clearUserCaches();
      }

      await auth.signOut();
      this.currentUser = null;
      localStorage.clear(); // Clear all stored data
      localStorage.removeItem('trust_device'); // Ensure this is cleared
      console.log('User logged out');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  // Load cached auth state on app initialization
  async loadCachedAuthState() {
    this.initCacheManager();
    if (!this.cacheManager) {
      return null;
    }

    try {
      const cachedAuth = await this.cacheManager.getCachedAuthState();
      if (cachedAuth) {
        console.log('[Auth] Loaded cached auth state');
        return cachedAuth;
      }
    } catch (error) {
      console.error('[Auth] Error loading cached auth state:', error);
    }

    return null;
  },

  // Check authentication state
  onAuthStateChanged(callback) {
    return auth.onAuthStateChanged((user) => {
      this.currentUser = user;

      // Start or clear session timer based on auth state
      if (user) {
        this.startSessionTimer();

        // Cache auth state when user is authenticated
        this.initCacheManager();
        if (this.cacheManager) {
          this.cacheManager.cacheAuthState({
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified
          });
        }
      } else {
        this.clearSessionTimer();
      }

      callback(user);
    });
  },

  // Get current user
  getCurrentUser() {
    return this.currentUser || auth.currentUser;
  },

  // Get user ID
  getUserId() {
    const user = this.getCurrentUser();
    return user ? user.uid : null;
  },

  // Get user email
  getUserEmail() {
    const user = this.getCurrentUser();
    return user ? user.email : null;
  },

  // Get error message
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/email-already-in-use': 'This email is already registered. If you haven\'t verified your email yet, please check your inbox (or spam folder) for the verification link, then login.',
      'auth/invalid-email': 'Invalid email address format.',
      'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/user-not-found': 'No account found with this email. Please sign up first.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password. Please try again. If you haven\'t verified your email yet, please check your inbox (or spam folder) for the verification link, then login.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your internet connection.'
    };

    return errorMessages[errorCode] || '-';
  },

  // Resend verification email
  async resendVerificationEmail() {
    try {
      const user = this.getCurrentUser();
      if (user && !user.emailVerified) {
        await user.sendEmailVerification();
        return { success: true, message: 'Verification email sent!' };
      }
      return { success: false, error: 'No user or already verified.' };
    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, error: error.message };
    }
  },

  // Send password reset email
  async sendPasswordResetEmail(email) {
    console.log('[Auth] Attempting to send password reset email to:', email);
    try {
      await auth.sendPasswordResetEmail(email);
      console.log('[Auth] Password reset email sent successfully to:', email);
      return { success: true, message: 'Password reset email sent! Please check your inbox.' };
    } catch (error) {
      console.error('[Auth] Password reset error:', error);
      console.error('[Auth] Error code:', error.code);
      console.error('[Auth] Error message:', error.message);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }
};


// Setup activity listeners to reset session timer
if (typeof document !== 'undefined') {
  const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

  activityEvents.forEach(event => {
    document.addEventListener(event, () => {
      if (Auth.currentUser) {
        Auth.resetSessionTimer();
      }
    }, { passive: true });
  });

  console.log('[Auth] Activity listeners initialized for session management');
}
