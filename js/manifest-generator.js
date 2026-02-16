/**
 * Manifest Generator Module
 * Creates and manages web app manifest for PWA functionality
 */

class ManifestGenerator {
  constructor() {
    this.defaultConfig = {
      name: 'b1t-Sched - Academic Task Scheduler',
      short_name: 'b1t-Sched',
      description: 'A web-based academic task scheduler designed for university students',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#4CAF50',
      orientation: 'portrait-primary',
      icons: [
        {
          src: '/images/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/images/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    };
  }

  /**
   * Generates a complete manifest object
   * @param {object} config - Application configuration (optional)
   * @returns {object} Manifest object
   */
  generateManifest(config = {}) {
    const manifest = {
      ...this.defaultConfig,
      ...config
    };

    console.log('[Manifest Generator] Generated manifest:', manifest);
    return manifest;
  }

  /**
   * Creates manifest.json file content
   * @param {object} manifest - Manifest object
   * @returns {{success: boolean, content: string, path: string}}
   */
  createManifestContent(manifest) {
    try {
      const content = JSON.stringify(manifest, null, 2);
      console.log('[Manifest Generator] Created manifest content');
      
      return {
        success: true,
        content,
        path: '/manifest.json'
      };
    } catch (error) {
      console.error('[Manifest Generator] Error creating manifest content:', error);
      return {
        success: false,
        content: '',
        path: '/manifest.json',
        error: error.message
      };
    }
  }

  /**
   * Adds manifest link to HTML head if not present
   * @returns {boolean} Success status
   */
  linkManifestInHTML() {
    try {
      // Check if manifest link already exists
      const existingLink = document.querySelector('link[rel="manifest"]');
      
      if (existingLink) {
        console.log('[Manifest Generator] Manifest link already exists in HTML');
        return true;
      }

      // Create and add manifest link
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest.json';
      document.head.appendChild(link);

      console.log('[Manifest Generator] Added manifest link to HTML head');
      return true;
    } catch (error) {
      console.error('[Manifest Generator] Error linking manifest in HTML:', error);
      return false;
    }
  }

  /**
   * Validates that generated manifest has all required fields
   * @param {object} manifest - Manifest object to validate
   * @returns {{valid: boolean, missingFields: string[]}}
   */
  validateGeneratedManifest(manifest) {
    const requiredFields = ['name', 'short_name', 'icons', 'start_url', 'display'];
    const missingFields = [];

    requiredFields.forEach(field => {
      if (!manifest[field]) {
        missingFields.push(field);
      }
    });

    // Additional validation for icons
    if (manifest.icons && Array.isArray(manifest.icons)) {
      const has192 = manifest.icons.some(icon => icon.sizes === '192x192');
      const has512 = manifest.icons.some(icon => icon.sizes === '512x512');
      
      if (!has192) {
        missingFields.push('icons[192x192]');
      }
      if (!has512) {
        missingFields.push('icons[512x512]');
      }
    }

    const valid = missingFields.length === 0;
    
    if (valid) {
      console.log('[Manifest Generator] Manifest validation passed');
    } else {
      console.warn('[Manifest Generator] Manifest validation failed:', missingFields);
    }

    return {
      valid,
      missingFields
    };
  }

  /**
   * Gets the default manifest configuration
   * @returns {object} Default manifest config
   */
  getDefaultConfig() {
    return { ...this.defaultConfig };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ManifestGenerator;
}
