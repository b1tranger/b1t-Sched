/**
 * Offline Indicator
 * Displays visual feedback when the user is offline
 */

class OfflineIndicator {
  constructor() {
    this.indicator = null;
    this.boundUpdateHeight = this.updateHeight.bind(this);
    this.resizeObserver = null;
  }

  /**
   * Initializes online/offline event listeners
   */
  init() {
    console.log('[Offline Indicator] Initializing...');

    // Create indicator element if it doesn't exist
    this.createIndicator();

    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('[Offline Indicator] Online');
      this.hideOfflineIndicator();
    });

    window.addEventListener('offline', () => {
      console.log('[Offline Indicator] Offline');
      this.showOfflineIndicator();
    });

    // Check initial state
    if (!this.isOnline()) {
      this.showOfflineIndicator();
    }

    console.log('[Offline Indicator] Initialized');
  }

  /**
   * Create the offline indicator element
   */
  createIndicator() {
    // Check if indicator already exists
    this.indicator = document.getElementById('offline-indicator');

    if (!this.indicator) {
      // Create indicator
      this.indicator = document.createElement('div');
      this.indicator.id = 'offline-indicator';
      this.indicator.className = 'offline-indicator';
      this.indicator.style.display = 'none';
      this.indicator.setAttribute('role', 'status');
      this.indicator.setAttribute('aria-live', 'polite');
      this.indicator.innerHTML = `
        <i class="fas fa-wifi-slash"></i>
        <span>You're offline. Showing cached content.</span>
      `;

      if (document.body.firstChild) {
        document.body.insertBefore(this.indicator, document.body.firstChild);
      } else {
        document.body.appendChild(this.indicator);
      }
      console.log('[Offline Indicator] Indicator element created');
    }
  }

  /**
   * Updates CSS variable for banner height
   */
  updateHeight() {
    if (this.indicator && this.indicator.style.display !== 'none') {
      const height = this.indicator.offsetHeight || 0;
      document.documentElement.style.setProperty('--offline-banner-height', `${height}px`);
    }
  }

  /**
   * Shows offline indicator
   */
  showOfflineIndicator() {
    if (!this.indicator) {
      this.createIndicator();
    }

    if (this.indicator) {
      this.indicator.style.display = 'flex';
      document.body.classList.add('offline-active');
      this.updateHeight();
      requestAnimationFrame(() => this.updateHeight());

      window.addEventListener('resize', this.boundUpdateHeight);

      if (window.ResizeObserver && !this.resizeObserver) {
        this.resizeObserver = new ResizeObserver(() => {
          this.updateHeight();
        });
        this.resizeObserver.observe(this.indicator);
      }

      console.log('[Offline Indicator] Showing indicator');
    }
  }

  /**
   * Hides offline indicator
   */
  hideOfflineIndicator() {
    if (this.indicator) {
      this.indicator.style.display = 'none';
      document.body.classList.remove('offline-active');
      document.documentElement.style.setProperty('--offline-banner-height', '0px');

      window.removeEventListener('resize', this.boundUpdateHeight);

      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }

      console.log('[Offline Indicator] Hiding indicator');
    }
  }

  /**
   * Checks current online status
   * @returns {boolean}
   */
  isOnline() {
    return navigator.onLine;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OfflineIndicator;
}
