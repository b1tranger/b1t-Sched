/**
 * PWA Initialization Module
 * Orchestrates PWA setup and initialization
 */

const PWAInit = {
  detector: null,
  manifestGenerator: null,
  cacheManager: null,
  installPromptManager: null,
  offlineIndicator: null,
  offlineManager: null,
  swUpdateManager: null,

  /**
   * Initialize PWA functionality
   */
  async init() {
    console.log('[PWA Init] Starting PWA initialization...');

    try {
      // 1. Detect existing PWA configuration
      await this.detectPWAStatus();

      // 2. Register service worker
      await this.registerServiceWorker();

      // 3. Initialize cache manager
      this.initializeCacheManager();

      // 4. Initialize install prompt manager
      this.initializeInstallPrompt();

      // 5. Initialize offline indicator
      this.initializeOfflineIndicator();

      // 6. Initialize offline manager
      this.initializeOfflineManager();

      // 7. Initialize SW update manager
      this.initializeSWUpdateManager();

      console.log('[PWA Init] ✓ PWA initialization complete');
    } catch (error) {
      console.error('[PWA Init] Initialization error:', error);
      // Graceful degradation - app continues to work without PWA features
    }
  },

  /**
   * Detect PWA status
   */
  async detectPWAStatus() {
    if (typeof PWADetector === 'undefined') {
      console.warn('[PWA Init] PWADetector not available');
      return;
    }

    this.detector = new PWADetector();
    const report = await this.detector.detectPWAStatus();

    console.log('[PWA Init] PWA Status Report:', report);

    // Generate manifest if missing
    if (!report.manifest.exists || !report.manifest.valid) {
      await this.generateManifest();
    }
  },

  /**
   * Generate manifest if missing
   */
  async generateManifest() {
    if (typeof ManifestGenerator === 'undefined') {
      console.warn('[PWA Init] ManifestGenerator not available');
      return;
    }

    this.manifestGenerator = new ManifestGenerator();
    const manifest = this.manifestGenerator.generateManifest();
    
    // Link manifest in HTML
    this.manifestGenerator.linkManifestInHTML();

    console.log('[PWA Init] Manifest generated and linked');
  },

  /**
   * Register service worker
   */
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('[PWA Init] Service Workers not supported');
      return;
    }

    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      console.warn('[PWA Init] Service Workers require HTTPS');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[PWA Init] Service Worker registered:', registration.scope);

      // Pass registration to SW update manager
      if (this.swUpdateManager) {
        this.swUpdateManager.setRegistration(registration);
      }

      return registration;
    } catch (error) {
      console.error('[PWA Init] Service Worker registration failed:', error);
      throw error;
    }
  },

  /**
   * Initialize cache manager
   */
  initializeCacheManager() {
    if (typeof CacheManager === 'undefined') {
      console.warn('[PWA Init] CacheManager not available');
      return;
    }

    this.cacheManager = new CacheManager();
    console.log('[PWA Init] Cache manager initialized');

    // Make it globally available
    window.PWACacheManager = this.cacheManager;
  },

  /**
   * Initialize install prompt manager
   */
  initializeInstallPrompt() {
    if (typeof InstallPromptManager === 'undefined') {
      console.warn('[PWA Init] InstallPromptManager not available');
      return;
    }

    this.installPromptManager = new InstallPromptManager();
    this.installPromptManager.init();
    console.log('[PWA Init] Install prompt manager initialized');
  },

  /**
   * Initialize offline indicator
   */
  initializeOfflineIndicator() {
    if (typeof OfflineIndicator === 'undefined') {
      console.warn('[PWA Init] OfflineIndicator not available');
      return;
    }

    this.offlineIndicator = new OfflineIndicator();
    this.offlineIndicator.init();
    console.log('[PWA Init] Offline indicator initialized');
  },

  /**
   * Initialize offline manager
   */
  initializeOfflineManager() {
    if (typeof OfflineManager === 'undefined') {
      console.warn('[PWA Init] OfflineManager not available');
      return;
    }

    this.offlineManager = new OfflineManager();
    this.offlineManager.init();
    console.log('[PWA Init] Offline manager initialized');

    // Make it globally available
    window.PWAOfflineManager = this.offlineManager;
  },

  /**
   * Initialize SW update manager
   */
  initializeSWUpdateManager() {
    if (typeof SWUpdateManager === 'undefined') {
      console.warn('[PWA Init] SWUpdateManager not available');
      return;
    }

    this.swUpdateManager = new SWUpdateManager();
    this.swUpdateManager.init();
    console.log('[PWA Init] SW update manager initialized');
  },

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    if (!this.cacheManager) {
      console.warn('[PWA Init] Cache manager not initialized');
      return null;
    }

    return await this.cacheManager.getCacheStats();
  },

  /**
   * Clear all caches
   */
  async clearAllCaches() {
    if (!this.cacheManager) {
      console.warn('[PWA Init] Cache manager not initialized');
      return false;
    }

    return await this.cacheManager.clearAllCaches();
  },

  /**
   * Check for service worker updates
   */
  async checkForUpdates() {
    if (!this.swUpdateManager) {
      console.warn('[PWA Init] SW update manager not initialized');
      return;
    }

    await this.swUpdateManager.checkForUpdates();
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    PWAInit.init();
  });
} else {
  // DOM already loaded
  PWAInit.init();
}
