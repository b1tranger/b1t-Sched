// ============================================
// AUTHENTICATION MODULE
// ============================================

const Auth = {
  currentUser: null,

  // Sign up new user
  async signup(email, password) {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      this.currentUser = userCredential.user;
      console.log('User signed up:', this.currentUser.uid);
      return { success: true, user: this.currentUser };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  },

  // Login user
  async login(email, password) {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      this.currentUser = userCredential.user;
      console.log('User logged in:', this.currentUser.uid);
      return { success: true, user: this.currentUser };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  },

  // Logout user
  async logout() {
    try {
      await auth.signOut();
      this.currentUser = null;
      localStorage.clear(); // Clear all stored data
      console.log('User logged out');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  // Check authentication state
  onAuthStateChanged(callback) {
    return auth.onAuthStateChanged((user) => {
      this.currentUser = user;
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
      'auth/email-already-in-use': 'This email is already registered. Please login instead.',
      'auth/invalid-email': 'Invalid email address format.',
      'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/user-not-found': 'No account found with this email. Please sign up first.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password. Please try again.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your internet connection.'
    };

    return errorMessages[errorCode] || 'An error occurred. Please try again.';
  }
};
