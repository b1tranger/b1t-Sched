/**
 * UITS Event Raiders Feed Service
 * Fetches active contests, hackathons, olympiads, and symposiums from ou1ts/events
 * Supports native JSON feed with fallback to RSS XML feed and localStorage caching.
 */

const RaidsFeed = {
  RAIDS_JSON_URL: 'https://ou1ts.github.io/events/raids.json',
  RSS_XML_URL: 'https://ou1ts.github.io/events/feed.xml',
  TRACKER_URL: 'https://ou1ts.github.io/events/tracker.json',
  CACHE_KEY: 'b1t_raider_events_cache',
  CACHE_EXPIRY_MS: 1000 * 60 * 30, // 30 minutes cache

  /**
   * Fetch active & upcoming Raider events
   * @param {boolean} forceRefresh - If true, bypasses the local cache
   * @returns {Promise<Array>} List of active raider events
   */
  async fetchActiveRaiderEvents(forceRefresh = false) {
    // 1. Try returning cached data if fresh and not forced
    if (!forceRefresh) {
      const cachedEvents = this.getCachedEvents();
      if (cachedEvents) {
        return cachedEvents;
      }
    }

    // 2. Fetch fresh data from Native JSON Feed
    try {
      const response = await fetch(this.RAIDS_JSON_URL, { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const raids = await response.json();
      const activeEvents = this.processRaids(raids);

      // Save to localStorage cache
      this.saveToCache(activeEvents);
      return activeEvents;
    } catch (err) {
      console.warn('[RaidsFeed] Failed to fetch JSON feed, attempting RSS XML fallback:', err);
      
      // Fallback to RSS XML feed
      try {
        const rssEvents = await this.fetchRaidsFromRSS();
        if (rssEvents && rssEvents.length > 0) {
          this.saveToCache(rssEvents);
          return rssEvents;
        }
      } catch (rssErr) {
        console.error('[RaidsFeed] Failed to fetch RSS XML feed:', rssErr);
      }

      // Fallback to stale cache if available
      const staleCache = this.getStaleCache();
      if (staleCache && staleCache.length > 0) {
        console.info('[RaidsFeed] Returning stale cache fallback');
        return staleCache;
      }

      return [];
    }
  },

  /**
   * Process raw raids array into normalized event objects
   * @param {Array} raids 
   * @returns {Array} Filtered and normalized events
   */
  processRaids(raids) {
    if (!Array.isArray(raids)) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return raids.filter(raid => {
      // Filter out past events
      if (raid.Status === 'Past') return false;
      if (raid.endDate) {
        const end = new Date(raid.endDate);
        end.setHours(23, 59, 59, 999);
        if (today > end) return false;
      }
      return true;
    }).map(raid => {
      const eventDate = raid.startDate ? new Date(raid.startDate) : new Date();
      const raidId = raid.Raid_Num !== undefined ? `raid-${raid.Raid_Num}` : `raid-${Date.now()}`;
      
      // Determine primary action link
      let primaryUrl = `https://ou1ts.github.io/events/#${raidId}`;
      if (raid.links && typeof raid.links === 'object') {
        const linkKeys = Object.keys(raid.links);
        if (linkKeys.length > 0) {
          primaryUrl = raid.links[linkKeys[0]] || primaryUrl;
        }
      }

      return {
        id: raidId,
        raidNum: raid.Raid_Num,
        title: raid.title || 'Untitled Raider Event',
        description: raid.details || '',
        date: eventDate,
        startDate: raid.startDate || '',
        endDate: raid.endDate || '',
        dateRange: raid.dateRange || (raid.startDate ? new Date(raid.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''),
        regEndDate: raid.RegEndDate || null,
        category: raid.Type || 'Competition',
        venue: raid.venue || (raid.IsOnline ? 'Online' : 'TBA'),
        fee: raid.fee || 'Free / TBA',
        isOnline: Boolean(raid.IsOnline),
        outsideDhaka: Boolean(raid.OutsideDhaka),
        city: raid.city || '',
        subEvents: Array.isArray(raid.subEvents) ? raid.subEvents : [],
        links: raid.links || {},
        externalUrl: `https://ou1ts.github.io/events/#${raidId}`,
        portalUrl: primaryUrl,
        isRaiderEvent: true
      };
    }).sort((a, b) => a.date - b.date);
  },

  /**
   * Fallback parser for standard RSS XML feed
   * @returns {Promise<Array>}
   */
  async fetchRaidsFromRSS() {
    const res = await fetch(this.RSS_XML_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const xmlText = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'text/xml');

    const items = xml.querySelectorAll('item');
    return Array.from(items).map((item, index) => {
      const title = item.querySelector('title')?.textContent || 'Untitled Raider Event';
      const link = item.querySelector('link')?.textContent || 'https://ou1ts.github.io/events/';
      const description = item.querySelector('description')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      const category = item.querySelector('category')?.textContent || 'Event';
      const guid = item.querySelector('guid')?.textContent || `rss-raid-${index}`;

      return {
        id: guid,
        title: title,
        description: description,
        date: pubDate ? new Date(pubDate) : new Date(),
        dateRange: pubDate ? new Date(pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
        regEndDate: null,
        category: category,
        venue: 'See Details',
        fee: 'TBA',
        subEvents: [],
        links: { 'Event Link': link },
        externalUrl: link,
        portalUrl: link,
        isRaiderEvent: true
      };
    });
  },

  /**
   * Read fresh events from localStorage
   */
  getCachedEvents() {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < this.CACHE_EXPIRY_MS && Array.isArray(parsed.events)) {
          // Re-hydrate Date objects
          return parsed.events.map(ev => ({
            ...ev,
            date: new Date(ev.date)
          }));
        }
      }
    } catch (e) {
      console.warn('[RaidsFeed] Local cache read error:', e);
    }
    return null;
  },

  /**
   * Read stale cache regardless of expiry
   */
  getStaleCache() {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.events)) {
          return parsed.events.map(ev => ({
            ...ev,
            date: new Date(ev.date)
          }));
        }
      }
    } catch (e) {
      console.warn('[RaidsFeed] Stale cache read error:', e);
    }
    return null;
  },

  /**
   * Save events to localStorage cache
   */
  saveToCache(events) {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        events: events
      }));
    } catch (e) {
      // Storage quota or private browsing mode
    }
  },

  /**
   * Clear cache
   */
  clearCache() {
    try {
      localStorage.removeItem(this.CACHE_KEY);
    } catch (_) {}
  }
};

// Export to window object for global availability
if (typeof window !== 'undefined') {
  window.RaidsFeed = RaidsFeed;
}
