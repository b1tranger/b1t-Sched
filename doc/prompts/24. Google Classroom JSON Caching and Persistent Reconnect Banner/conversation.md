# Walkthrough - Google Classroom JSON Caching & Persistent Reconnect Banner

We have implemented client-side JSON template caching and a persistent bottom Reconnect banner/button for Google Classroom in `b1t-Sched`.

## Changes Made

### 1. Persistent Bottom Footer Container Layout
#### [index.html](file:///c:/Users/.../Documents/GitHub/%5BoU1TS%5D/b1t-Sched/index.html)
- Added `<div id="classroom-footer-mobile" class="classroom-bottom-cached-footer" style="display: none;"></div>` to `#classroom-sidebar` (below `#classroom-content-mobile`).
- Added `<div id="classroom-footer-desktop" class="classroom-bottom-cached-footer" style="display: none;"></div>` to `#classroom-modal .classroom-modal-content` (below `#classroom-content-desktop`).

### 2. Styling & Theme Integration
#### [css/classroom.css](file:///c:/Users/.../Documents/GitHub/%5BoU1TS%5D/b1t-Sched/css/classroom.css)
- Added `.classroom-bottom-cached-footer` for the sticky bottom bar in the sidebar and modal layouts.
- Added `.classroom-bottom-banner-text` for the narrow banner stating `"Cached Content, login again to see new data"` (with time label support).
- Added `.classroom-reconnect-btn` for the persistent `"Reconnect Classroom"` button with full dark mode and light mode contrast styling.

### 3. JSON Template Cache & Footer Controller
#### [js/classroom.js](file:///c:/Users/.../Documents/GitHub/%5BoU1TS%5D/b1t-Sched/js/classroom.js)
- **JSON Cache Logic**:
  - `saveJsonCache(dataType, data)`: Serializes structured Classroom state (courses, assignments, announcements, materials, timestamp) into `localStorage` under `classroom_cached_json` (mirrored in `sessionStorage`).
  - `getJsonCache()`: Retrieves and parses the cached JSON bundle.
  - `clearJsonCache()`: Clears the JSON cache on explicit sign-out.
- **Bottom Footer Controller**:
  - `updateBottomCachedFooter(show, timeLabel)`: Renders and toggles `#classroom-footer-mobile` and `#classroom-footer-desktop`.
- **Cached View Integration**:
  - `showCachedDataWithBanner()`: Loads cached data (via `getJsonCache()` or `CacheManager`) and activates the bottom banner and persistent `"Reconnect Classroom"` button when the OAuth token is missing/expired.
  - Automatically hides the bottom footer when an active, valid token session is established or on logout.

---

## Verification Results

### Syntax Verification
- `node -c "c:\Users\...\Documents\GitHub\[oU1TS]\b1t-Sched\js\classroom.js"` executed cleanly with 0 errors.

### Manual Verification Flow
1. **JSON Cache Generation**: When fetching assignments, notices, or materials, a snapshot template is stored in `localStorage` & `sessionStorage` under `classroom_cached_json`.
2. **Expired Session Rendering**: When the Google token expires, the app falls back to the JSON cache and displays:
   - All cached items in the view container.
   - The narrow banner at the bottom: `"Cached Content, login again to see new data (X minutes/hours ago)"`.
   - The persistent `"Reconnect Classroom"` button pinned to the bottom of the sidebar/modal.
3. **Re-Authentication**: Clicking `"Reconnect Classroom"` triggers Google OAuth sign-in and hides the cached banner upon successful authentication.
