/**
 * PWA Detector Module
 * Detects and validates existing PWA configuration
 */

class PWADetector {
  constructor() {
    this.manifestPath = '/manifest.json';
  }

  /**
   * Checks if a web app manifest is present and valid
   * @returns {Promise<{exists: boolean, valid: boolean, errors: string[]}>}
   */
  async checkManifest() {
    const result = {
      exists: false,
      valid: false,
      errors: []
    };

    try {
      // Check if manifest link exists in HTML
      const manifestLink = document.querySelector('link[rel="manifest"]');
      
      if (!manifestLink) {
        result.errors.push('No manifest link found in HTML');
        console.warn('[PWA Detector] No manifest link found in HTML');
        return result;
      }

      result.exists = true;
      const manifestUrl = manifestLink.href;

      // Fetch and validate manifest
      const response = await fetch(manifestUrl);
      if (!response.ok) {
        result.errors.push(`Failed to fetch manifest: ${response.status}`);
        console.warn(`[PWA Detector] Failed to fetch manifest: ${response.status}`);
        return result;
      }

      const manifest = await response.json();
      const validation = this.validateManifestFields(manifest);
      
      result.valid = validation.valid;
      result.errors = validation.missingFields.map(field => `Missing required field: ${field}`);

      if (result.valid) {
        console.log('[PWA Detector] Manifest is valid');
      } else {
        console.warn('[PWA Detector] Manifest validation failed:', result.errors);
      }

    } catch (error) {
      result.errors.push(`Error checking manifest: ${error.message}`);
      console.error('[PWA Detector] Error checking manifest:', error);
    }

    return result;
  }

  /**
   * Checks if a service worker is registered
   * @returns {Promise<{registered: boolean, scope: string, state: string}>}
   */
  async checkServiceWorker() {
    const result = {
      registered: false,
      scope: '',
      state: ''
    };

    if (!('serviceWorker' in navigator)) {
      console.warn('[PWA Detector] Service Workers not supported in this browser');
      return result;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration) {
        result.registered = true;
        result.scope = registration.scope;
        result.state = registration.active ? registration.active.state : 'installing';
        console.log('[PWA Detector] Service Worker registered:', result);
      } else {
        console.warn('[PWA Detector] No Service Worker registered');
      }
    } catch (error) {
      console.error('[PWA Detector] Error checking Service Worker:', error);
    }

    return result;
  }

  /**
   * Validates manifest contains required fields
   * @param {object} manifest - The manifest object
   * @returns {{valid: boolean, missingFields: string[]}}
   */
  validateManifestFields(manifest) {
    const requiredFields = ['name', 'short_name', 'icons', 'start_url', 'display'];
    const missingFields = [];

    requiredFields.forEach(field => {
      if (!manifest[field]) {
        missingFields.push(field);
      }
    });

    return {
      valid: missingFields.length === 0,
      missingFields
    };
  }

  /**
   * Runs complete PWA detection and returns report
   * @returns {Promise<PWAReport>}
   */
  async detectPWAStatus() {
    console.log('[PWA Detector] Starting PWA detection...');

    const manifest = await this.checkManifest();
    const serviceWorker = await this.checkServiceWorker();

    const report = {
      manifest: {
        exists: manifest.exists,
        valid: manifest.valid,
        path: this.manifestPath,
        errors: manifest.errors
      },
      serviceWorker: {
        registered: serviceWorker.registered,
        scope: serviceWorker.scope,
        state: serviceWorker.state
      },
      installable: manifest.valid && serviceWorker.registered,
      recommendations: []
    };

    // Generate recommendations
    if (!manifest.exists) {
      report.recommendations.push('Create a web app manifest file');
      console.log('[PWA Detector] Missing component: Web App Manifest');
    } else if (!manifest.valid) {
      report.recommendations.push('Fix manifest validation errors');
      console.log('[PWA Detector] Invalid manifest:', manifest.errors);
    }

    if (!serviceWorker.registered) {
      report.recommendations.push('Register a service worker');
      console.log('[PWA Detector] Missing component: Service Worker');
    }

    if (report.installable) {
      console.log('[PWA Detector] ✓ PWA is properly configured');
    } else {
      console.log('[PWA Detector] PWA configuration incomplete. Recommendations:', report.recommendations);
    }

    return report;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PWADetector;
}
