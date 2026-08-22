# UITS Event Raiders RSS & b1t-Sched Sidebar Integration Guide

This guide details how to syndicate events from **UITS Event Raiders** (`events`) into **b1t-Sched**'s Upcoming Events sidebar, as well as external platforms (Discord, Telegram, RSS readers).

---

## 1. Overview of Endpoints & Assets

| Asset / Endpoint | URL | Purpose |
| :--- | :--- | :--- |
| **RSS 2.0 Feed** | `https://ou1ts.github.io/events/feed.xml` | Standard XML feed for external RSS aggregators, Discord bots, and automation. |
| **Native JSON Feed** | `https://ou1ts.github.io/events/raids.json` | Full-fidelity JSON with complete schemas (`fee`, `subEvents`, `RegEndDate`, `venue`). |
| **Sync Tracker** | `https://ou1ts.github.io/events/tracker.json` | Lightweight cache validation endpoint (`lastUpdated`, `eventsCount`). |

---

## 2. b1t-Sched Implementation (Recommended: Native JSON Feed)

Since both projects run in the browser, fetching `raids.json` directly avoids XML parsing overhead while preserving structured metadata (fees, sub-events, registration deadlines).

### Step 2.1: Create `js/raids-feed.js` in `b1t-Sched`

Create a new file `js/raids-feed.js` to manage remote fetching, local caching, and date filtering:

```javascript
/**
 * UITS Event Raiders Client Feed Service
 * Fetches active contests, hackathons, and symposiums from ou1ts/events
 */

const RAIDS_JSON_URL = 'https://ou1ts.github.io/events/raids.json';
const TRACKER_URL = 'https://ou1ts.github.io/events/tracker.json';
const CACHE_KEY = 'b1t_raider_events_cache';
const CACHE_EXPIRY_MS = 1000 * 60 * 30; // 30 minutes cache

export async function fetchActiveRaiderEvents() {
    // 1. Try returning cached data if fresh
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < CACHE_EXPIRY_MS && Array.isArray(parsed.events)) {
                return parsed.events;
            }
        }
    } catch (e) {
        console.warn('[RaidsFeed] Local cache read error:', e);
    }

    // 2. Fetch fresh data from GitHub Pages
    try {
        const response = await fetch(RAIDS_JSON_URL, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const raids = await response.json();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 3. Filter active / upcoming campaigns
        const activeEvents = raids.filter(raid => {
            if (raid.Status === 'Past') return false;
            if (raid.endDate) {
                const end = new Date(raid.endDate);
                end.setHours(0, 0, 0, 0);
                if (today > end) return false;
            }
            return true;
        }).map(raid => {
            const eventDate = raid.startDate ? new Date(raid.startDate) : new Date();
            return {
                id: `raid-${raid.Raid_Num}`,
                title: raid.title,
                description: raid.details || '',
                date: eventDate,
                dateRange: raid.dateRange || '',
                regEndDate: raid.RegEndDate || null,
                category: raid.Type || 'Event',
                venue: raid.venue || '',
                fee: raid.fee || 'Free / TBA',
                department: 'ALL',
                isRaiderEvent: true,
                externalUrl: `https://ou1ts.github.io/events/#raid-${raid.Raid_Num}`,
                subEvents: raid.subEvents || [],
                links: raid.links || {}
            };
        });

        // 4. Save to localStorage cache
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                events: activeEvents
            }));
        } catch (e) {
            // Storage quota exceeded or private mode
        }

        return activeEvents;
    } catch (err) {
        console.error('[RaidsFeed] Failed to fetch live raider events:', err);
        // Fallback to stale cache if available
        try {
            const stale = localStorage.getItem(CACHE_KEY);
            if (stale) return JSON.parse(stale).events || [];
        } catch (_) {}
        return [];
    }
}
```

---

### Step 2.2: Update `js/app.js` in `b1t-Sched`

Import and merge Raider events with Firestore academic events:

```javascript
// In b1t-Sched/js/app.js (inside loadEvents or loadDashboard)
import { fetchActiveRaiderEvents } from './raids-feed.js';

async function loadUpcomingEvents(department) {
    try {
        // Fetch internal academic events & external raider events concurrently
        const [internalResult, raiderEvents] = await Promise.all([
            DB.getEvents(department),
            fetchActiveRaiderEvents()
        ]);

        const internalEvents = (internalResult && internalResult.success) ? internalResult.data : [];
        
        // Merge and sort ascending by date
        const allEvents = [...internalEvents, ...raiderEvents].sort((a, b) => {
            const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
            const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
            return dateA - dateB;
        });

        UI.renderEvents(allEvents, this.isAdmin, this.isCR, this.isFaculty, this.currentUserId);
    } catch (err) {
        console.error('Error loading events sidebar:', err);
    }
}
```

---

### Step 2.3: Update `js/ui.js` in `b1t-Sched`

Enhance the event card renderer to display the custom **Raider Badge** and deep-link button:

```javascript
// Inside UI.renderEvents(events, ...) in js/ui.js
const eventsHTML = events.map(event => {
    const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);
    const day = eventDate.getDate();
    const month = eventDate.toLocaleDateString('en-US', { month: 'short' });

    // Custom badge for Raider events
    const badgeHtml = event.isRaiderEvent 
        ? `<span class="event-badge badge-raider"><i class="fas fa-shield-alt"></i> Event Raider</span>`
        : `<span class="event-badge badge-dept">${event.department || 'ALL'}</span>`;

    const actionLink = event.isRaiderEvent
        ? `<a href="${event.externalUrl}" target="_blank" rel="noopener" class="event-external-btn" title="View details on UITS Event Raiders">
             <i class="fas fa-external-link-alt"></i> Details
           </a>`
        : '';

    return `
      <div class="event-card ${event.isRaiderEvent ? 'raider-card' : ''}" data-event-id="${event.id}">
        <div class="event-date-box">
          <span class="event-day">${day}</span>
          <span class="event-month">${month}</span>
        </div>
        <div class="event-content">
          <div class="event-header-line">
            <h4 class="event-title">${escapeHTML(event.title)}</h4>
            ${badgeHtml}
          </div>
          <p class="event-desc">${escapeHTML(event.description)}</p>
          ${actionLink}
        </div>
      </div>
    `;
}).join('');
```

---

## 3. Alternative: Parsing via RSS Feed (`feed.xml`)

If you prefer to consume the XML feed directly via RSS in `b1t-Sched`:

```javascript
export async function fetchRaidsFromRSS() {
    const res = await fetch('https://ou1ts.github.io/events/feed.xml');
    const xmlText = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'text/xml');
    
    const items = xml.querySelectorAll('item');
    return Array.from(items).map(item => ({
        id: item.querySelector('guid')?.textContent || '',
        title: item.querySelector('title')?.textContent || '',
        link: item.querySelector('link')?.textContent || '',
        category: item.querySelector('category')?.textContent || 'Event',
        pubDate: item.querySelector('pubDate')?.textContent || '',
        description: item.querySelector('description')?.textContent || '',
        isRaiderEvent: true
    }));
}
```

---

## 4. Connecting the RSS Feed to 3rd Party Platforms

The live feed URL is:
```
https://ou1ts.github.io/events/feed.xml
```

### 1. Discord Webhooks (Automated Event Alerts)
- **Tool:** MonitoRSS (Discord Bot) or Zapier / IFTTT
- **Trigger:** New Item in RSS Feed (`https://ou1ts.github.io/events/feed.xml`)
- **Action:** Post message to Discord Channel with:
  - `Title`: `{title}`
  - `Link`: `{link}`
  - `Summary`: `{description}`

### 2. Telegram Channel Broadcasts
- Use **@FeedManBot** or **@ControllerBot** on Telegram.
- Add RSS feed `https://ou1ts.github.io/events/feed.xml` to broadcast instant alerts whenever a new raid is published.

### 3. RSS Reader Apps (Feedly, NetNewsWire, Inoreader)
- Search `https://ou1ts.github.io/events/` or enter `https://ou1ts.github.io/events/feed.xml` directly into any reader.

---

## 5. Automated Updates

Whenever a PR is merged or `raids.json` is updated in `events`, the GitHub Actions pipeline (`.github/workflows/notify.yml`) automatically:
1. Runs `node .github/scripts/generate-rss.js`
2. Generates updated `feed.xml`
3. Commits and deploys the feed to GitHub Pages.