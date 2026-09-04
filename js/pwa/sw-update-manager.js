/**
 * Service Worker Update Manager
 * Handles service worker updates and cache invalidation
 */

class SWUpdateManager {
  constructor() {
    this.registration = null;
    this.updateAvailable = false;
  }

  /**
   * Initialize update manager
   */
  init() {
    console.log('[SW Update Manager] Initializing...');

    if (!('serviceWorker' in navigator)) {
      console.warn('[SW Update Manager] Service Workers not supported');
      return;
    }

    // Listen for service worker updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW Update Manager] Controller changed - reloading page');
      window.location.reload();
    });

    // Check for updates periodically (every hour)
    setInterval(() => {
      this.checkForUpdates();
    }, 60 * 60 * 1000);

    console.log('[SW Update Manager] Initialized');
  }

  /**
   * Set the service worker registration
   * @param {ServiceWorkerRegistration} registration
   */
  setRegistration(registration) {
    this.registration = registration;

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('[SW Update Manager] Update found');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker installed, but old one still controlling
          console.log('[SW Update Manager] New service worker installed');
          this.updateAvailable = true;
          this.notifyUpdateAvailable();
        }
      });
    });
  }

  /**
   * Check for service worker updates
   */
  async checkForUpdates() {
    if (!this.registration) {
      console.warn('[SW Update Manager] No registration available');
      return;
    }

    try {
      await this.registration.update();
      console.log('[SW Update Manager] Update check completed');
    } catch (error) {
      console.error('[SW Update Manager] Update check failed:', error);
    }
  }

  /**
   * Notify user that an update is available
   */
  notifyUpdateAvailable() {
    console.log('[SW Update Manager] Notifying user of available update');

    // Create update notification
    const notification = document.createElement('div');
    notification.id = 'sw-update-notification';
    notification.className = 'sw-update-notification';
    notification.innerHTML = `
      <div class="sw-update-content">
        <i class="fas fa-sync-alt"></i>
        <span>A new version is available!</span>
        <button id="sw-update-btn" class="btn btn-sm btn-primary">Update</button>
        <button id="sw-update-dismiss" class="btn btn-sm btn-text">Later</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Setup event listeners
    document.getElementById('sw-update-btn').addEventListener('click', () => {
      this.acceptUpdate();
    });

    document.getElementById('sw-update-dismiss').addEventListener('click', () => {
      notification.remove();
    });
  }

  /**
   * Accept the update and reload
   */
  acceptUpdate() {
    if (!this.registration || !this.registration.waiting) {
      console.warn('[SW Update Manager] No waiting service worker');
      return;
    }

    console.log('[SW Update Manager] Accepting update');

    // Tell the waiting service worker to activate
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  /**
   * Force refresh to get latest content
   */
  async forceRefresh() {
    console.log('[SW Update Manager] Force refreshing content');

    try {
      // Clear caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );

      console.log('[SW Update Manager] Caches cleared');

      // Reload page
      window.location.reload();
    } catch (error) {
      console.error('[SW Update Manager] Force refresh failed:', error);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SWUpdateManager;
}
