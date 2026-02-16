/**
 * Cache Manager Module
 * Manages caching of authentication state and Google Classroom data
 */

class CacheManager {
  constructor() {
    this.CACHE_NAME = 'b1t-sched-data-cache';
    this.CACHE_VERSION = 'v1.0.0';
    
    // Cache keys
    this.KEYS = {
      AUTH_STATE: 'auth-state',
      CLASSROOM_ASSIGNMENTS: 'classroom-assignments',
      CLASSROOM_ANNOUNCEMENTS: 'classroom-announcements'
    };
    
    // Cache expiration times (in milliseconds)
    this.MAX_AGE = {
      AUTH: 24 * 60 * 60 * 1000,      // 24 hours
      CLASSROOM: 60 * 60 * 1000        // 1 hour
    };
    
    this.MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  }

  /**
   * Caches authentication state
   * @param {object} authData - Authentication data
   * @returns {Promise<boolean>}
   */
  async cacheAuthState(authData) {
    try {
      const cacheEntry = {
        key: this.KEYS.AUTH_STATE,
        data: authData,
        timestamp: Date.now(),
        version: this.CACHE_VERSION
      };
      
      const cache = await caches.open(this.CACHE_NAME);
      const response = new Response(JSON.stringify(cacheEntry));
      await cache.put(this.KEYS.AUTH_STATE, response);
      
      console.log('[Cache Manager] Authentication state cached');
      return true;
    } catch (error) {
      console.error('[Cache Manager] Error caching auth state:', error);
      return false;
    }
  }

  /**
   * Retrieves cached authentication state
   * @returns {Promise<object|null>}
   */
  async getCachedAuthState() {
    try {
      const cache = await caches.open(this.CACHE_NAME);
      const response = await cache.match(this.KEYS.AUTH_STATE);
      
      if (!response) {
        console.log('[Cache Manager] No cached auth state found');
        return null;
      }
      
      const cacheEntry = await response.json();
      
      // Check if cache is fresh
      if (!this.isFresh(cacheEntry.timestamp, this.MAX_AGE.AUTH)) {
        console.log('[Cache Manager] Cached auth state is stale');
        await cache.delete(this.KEYS.AUTH_STATE);
        return null;
      }
      
      console.log('[Cache Manager] Retrieved cached auth state');
      return cacheEntry.data;
    } catch (error) {
      console.error('[Cache Manager] Error retrieving cached auth state:', error);
      return null;
    }
  }

  /**
   * Caches Google Classroom data
   * @param {string} type - 'assignments' or 'announcements'
   * @param {array} data - Classroom data
   * @returns {Promise<boolean>}
   */
  async cacheClassroomData(type, data) {
    try {
      const key = type === 'assignments' 
        ? this.KEYS.CLASSROOM_ASSIGNMENTS 
        : this.KEYS.CLASSROOM_ANNOUNCEMENTS;
      
      const cacheEntry = {
        key,
        data,
        timestamp: Date.now(),
        version: this.CACHE_VERSION
      };
      
      const cache = await caches.open(this.CACHE_NAME);
      const response = new Response(JSON.stringify(cacheEntry));
      await cache.put(key, response);
      
      console.log(`[Cache Manager] Classroom ${type} cached`);
      return true;
    } catch (error) {
      console.error(`[Cache Manager] Error caching classroom ${type}:`, error);
      
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        console.warn('[Cache Manager] Quota exceeded, pruning old caches');
        await this.pruneOldCaches();
        
        // Retry once after pruning
        try {
          const cache = await caches.open(this.CACHE_NAME);
          const key = type === 'assignments' 
            ? this.KEYS.CLASSROOM_ASSIGNMENTS 
            : this.KEYS.CLASSROOM_ANNOUNCEMENTS;
          const cacheEntry = {
            key,
            data,
            timestamp: Date.now(),
            version: this.CACHE_VERSION
          };
          const response = new Response(JSON.stringify(cacheEntry));
          await cache.put(key, response);
          return true;
        } catch (retryError) {
          console.error('[Cache Manager] Retry failed after pruning:', retryError);
          return false;
        }
      }
      
      return false;
    }
  }

  /**
   * Retrieves cached Classroom data
   * @param {string} type - 'assignments' or 'announcements'
   * @returns {Promise<{data: array, timestamp: number, fresh: boolean}|null>}
   */
  async getCachedClassroomData(type) {
    try {
      const key = type === 'assignments' 
        ? this.KEYS.CLASSROOM_ASSIGNMENTS 
        : this.KEYS.CLASSROOM_ANNOUNCEMENTS;
      
      const cache = await caches.open(this.CACHE_NAME);
      const response = await cache.match(key);
      
      if (!response) {
        console.log(`[Cache Manager] No cached classroom ${type} found`);
        return null;
      }
      
      const cacheEntry = await response.json();
      const fresh = this.isFresh(cacheEntry.timestamp, this.MAX_AGE.CLASSROOM);
      
      console.log(`[Cache Manager] Retrieved cached classroom ${type} (fresh: ${fresh})`);
      
      return {
        data: cacheEntry.data,
        timestamp: cacheEntry.timestamp,
        fresh
      };
    } catch (error) {
      console.error(`[Cache Manager] Error retrieving cached classroom ${type}:`, error);
      return null;
    }
  }

  /**
   * Checks if cached data is fresh (less than maxAge)
   * @param {number} timestamp - Cache timestamp
   * @param {number} maxAge - Maximum age in milliseconds
   * @returns {boolean}
   */
  isFresh(timestamp, maxAge) {
    const age = Date.now() - timestamp;
    return age < maxAge;
  }

  /**
   * Clears all user-specific caches
   * @returns {Promise<boolean>}
   */
  async clearUserCaches() {
    try {
      const cache = await caches.open(this.CACHE_NAME);
      
      await Promise.all([
        cache.delete(this.KEYS.AUTH_STATE),
        cache.delete(this.KEYS.CLASSROOM_ASSIGNMENTS),
        cache.delete(this.KEYS.CLASSROOM_ANNOUNCEMENTS)
      ]);
      
      console.log('[Cache Manager] User caches cleared');
      return true;
    } catch (error) {
      console.error('[Cache Manager] Error clearing user caches:', error);
      return false;
    }
  }

  /**
   * Gets cache size and usage statistics
   * @returns {Promise<{size: number, quota: number, usage: number}>}
   */
  async getCacheStats() {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        
        const stats = {
          size: estimate.usage || 0,
          quota: estimate.quota || 0,
          usage: estimate.usage && estimate.quota 
            ? (estimate.usage / estimate.quota) * 100 
            : 0
        };
        
        console.log('[Cache Manager] Cache stats:', stats);
        return stats;
      } else {
        console.warn('[Cache Manager] Storage API not available');
        return { size: 0, quota: 0, usage: 0 };
      }
    } catch (error) {
      console.error('[Cache Manager] Error getting cache stats:', error);
      return { size: 0, quota: 0, usage: 0 };
    }
  }

  /**
   * Clears old cache entries when storage limit is approached
   * @returns {Promise<boolean>}
   */
  async pruneOldCaches() {
    try {
      console.log('[Cache Manager] Pruning old caches...');
      
      const stats = await this.getCacheStats();
      
      // If usage is over 80%, clear non-critical caches
      if (stats.usage > 80) {
        const cache = await caches.open(this.CACHE_NAME);
        
        // Clear classroom data (non-critical)
        await cache.delete(this.KEYS.CLASSROOM_ASSIGNMENTS);
        await cache.delete(this.KEYS.CLASSROOM_ANNOUNCEMENTS);
        
        console.log('[Cache Manager] Cleared non-critical caches');
      }
      
      // Get all cache names and remove old versions
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => 
        name.includes('b1t-sched') && !name.includes(this.CACHE_VERSION)
      );
      
      await Promise.all(oldCaches.map(name => caches.delete(name)));
      
      console.log('[Cache Manager] Old caches pruned');
      return true;
    } catch (error) {
      console.error('[Cache Manager] Error pruning caches:', error);
      return false;
    }
  }

  /**
   * Manually clears all caches
   * @returns {Promise<boolean>}
   */
  async clearAllCaches() {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      
      console.log('[Cache Manager] All caches cleared');
      return true;
    } catch (error) {
      console.error('[Cache Manager] Error clearing all caches:', error);
      return false;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CacheManager;
}
