> Original Source: plan/notice_implementation_plan.md

# Notice Viewer Feature

Add a Notice Viewer that loads UCAM notices on-demand (via a "Load Notices" button) and displays them as a list with PDF viewing capability. The viewer appears as a **popup/modal on desktop** and a **slide-in sidebar on mobile**, following existing patterns from the Events feature.

## User Review Required

> [!IMPORTANT]
> **localStorage Caching** — Notices will be cached in `localStorage` after the first load so they persist across page navigations within the same session. The cache will include a timestamp and auto-expire after **1 hour** (configurable). This avoids re-fetching every time the user opens the notice panel. Does this TTL sound appropriate, or would you prefer a different duration?

> [!IMPORTANT]
> **PDF Viewer** — On desktop, clicking a notice opens the PDF in an embedded iframe within the modal. On mobile, since screen space is limited, clicking a notice will open the PDF in a **new browser tab** instead. Is this acceptable?

---

## Proposed Changes

### Notice CSS

#### [NEW] [notice.css](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/css/notice.css)

New stylesheet for both the desktop notice modal and mobile notice sidebar:

- **Desktop Notice Modal** (`.notice-modal`): Uses existing `.modal` pattern from `dashboard.css` but with a wider `max-width: 900px` to accommodate a two-column layout (notice list + PDF viewer). Contains a notice list panel on the left (300px) and a PDF iframe on the right.
- **Mobile Notice Sidebar** (`.notice-sidebar`): Mirrors the `.events-sidebar` pattern — fixed position, slide-in from right, with header, scrollable content, and overlay.
- **Notice List Items**: Styled similarly to the reference `notice.html` list items with hover effects and active state.
- **Load Button**: A centered button with the maroon theme color, shown before notices are loaded.
- **Loading Spinner**: Reuses the spinner animation from the reference.

---

### Navbar Button (Desktop)

#### [MODIFY] [navbar.css](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/css/navbar.css)

Add styles for the `.nav-notice-btn` — a styled button in the navbar center area between "Resources" and the user card, matching the reference image (hand-drawn "Notice" text style replaced with a clean button).

#### [MODIFY] [index.html](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/index.html)

**Navbar changes (line ~48):** Add a "Notice" `<li>` link after "Resources" in `nav-links`:
```html
<li><a href="#" id="notice-nav-btn" class="nav-link">Notice</a></li>
```

**Mobile Notice Sidebar (after line ~369):** Add a notice toggle tab and sidebar, mirroring the events sidebar pattern:
```html
<!-- Mobile Notice Sidebar Toggle -->
<div id="notice-toggle" class="notice-toggle mobile-only">
    <i class="fas fa-bullhorn"></i>
    <span>Notices</span>
</div>

<!-- Mobile Notice Sidebar -->
<div id="notice-sidebar" class="notice-sidebar mobile-only">
    <div class="notice-sidebar-header">
        <h3><i class="fas fa-bullhorn"></i> Notices</h3>
        <button id="close-notice-sidebar" class="btn btn-icon">
            <i class="fas fa-times"></i>
        </button>
    </div>
    <div id="notice-sidebar-content" class="notice-sidebar-content">
        <!-- Initial state: Load button -->
        <div id="notice-load-prompt" class="notice-load-prompt">
            <i class="fas fa-bullhorn"></i>
            <p>Tap below to load university notices</p>
            <button id="load-notices-btn-mobile" class="btn btn-primary notice-load-btn">
                <i class="fas fa-download"></i> Load Notices
            </button>
        </div>
        <!-- Notice list (hidden initially) -->
        <div id="notice-list-mobile" class="notice-list-container" style="display: none;"></div>
    </div>
</div>
<div id="notice-overlay" class="notice-overlay mobile-only"></div>
```

**Desktop Notice Modal (after old events modal, ~line 616):** Add a full notice viewer modal:
```html
<!-- Notice Viewer Modal (Desktop) -->
<div id="notice-modal" class="modal" style="display: none;">
    <div class="modal-content notice-modal-content">
        <div class="modal-header">
            <h2 class="modal-title"><i class="fas fa-bullhorn"></i> University Notices</h2>
            <button id="close-notice-modal" class="btn btn-icon">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body notice-modal-body">
            <!-- Load prompt (shown initially) -->
            <div id="notice-load-prompt-desktop" class="notice-load-prompt">
                <i class="fas fa-bullhorn"></i>
                <p>Click below to load university notices from UCAM</p>
                <button id="load-notices-btn-desktop" class="btn btn-primary notice-load-btn">
                    <i class="fas fa-download"></i> Load Notices
                </button>
            </div>
            <!-- Notice layout (hidden initially) -->
            <div id="notice-layout-desktop" class="notice-layout" style="display: none;">
                <div class="notice-list-panel">
                    <div class="notice-list-panel-title">
                        <i class="fas fa-list"></i> Recent Notices
                    </div>
                    <ul id="notice-list-desktop" class="notice-list"></ul>
                </div>
                <div class="notice-pdf-panel">
                    <div class="notice-pdf-toolbar">
                        <span class="notice-pdf-title">
                            <i class="fas fa-file-pdf"></i>
                            <span id="notice-pdf-title-text">Select a notice</span>
                        </span>
                        <div id="notice-pdf-actions" class="notice-pdf-actions" style="display: none;">
                            <a id="notice-pdf-open" class="btn btn-secondary btn-sm" href="#" target="_blank">
                                <i class="fas fa-external-link-alt"></i> Open
                            </a>
                            <a id="notice-pdf-download" class="btn btn-primary btn-sm" href="#" download>
                                <i class="fas fa-download"></i> Download
                            </a>
                        </div>
                    </div>
                    <div id="notice-pdf-placeholder" class="notice-pdf-placeholder">
                        <i class="fas fa-file-pdf"></i>
                        <p>Select a notice from the list to view its PDF</p>
                    </div>
                    <iframe id="notice-pdf-frame" class="notice-pdf-frame" style="display: none;" title="PDF Viewer"></iframe>
                </div>
            </div>
        </div>
    </div>
</div>
```

---

### Notice JavaScript

#### [NEW] [notice.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/notice.js)

New module `NoticeViewer` with the following responsibilities:

- **`API_BASE`**: `'https://b1t-acad-backend.vercel.app'`
- **`CACHE_KEY`**: `'b1tSched_notices'` — localStorage key
- **`CACHE_TTL`**: `3600000` (1 hour in ms)
- **`noticesLoaded`**: In-memory flag to avoid re-rendering
- **`init()`**: Sets up all event listeners (load buttons, sidebar toggle, modal close, overlay click)
- **`loadNotices()`**: Checks localStorage cache first → if valid, renders cached data. If expired or missing, fetches from `/api/notices`, saves to localStorage with timestamp, then renders.
- **`renderNoticeList(notices, containerId)`**: Populates the notice list in both mobile sidebar and desktop modal.
- **`selectNotice(id)`**: Sets the active notice, loads PDF URL into iframe (desktop) or opens new tab (mobile).
- **`toggleNoticeSidebar(open)`**: Mirrors `UI.toggleEventsSidebar()` for mobile sidebar.
- **`openNoticeModal()`**: Shows the desktop modal. If notices already loaded, shows them directly.
- **`closeNoticeModal()`**: Hides the desktop modal.

#### [MODIFY] [app.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/app.js)

- In `init()`, call `NoticeViewer.init()` after existing setup calls (~line 43).
- In `setupEventsSidebarListeners()`, add notice toggle/close listeners, OR let `NoticeViewer.init()` handle its own listeners.

#### [MODIFY] [index.html](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/index.html)

- Add `<link rel="stylesheet" href="css/notice.css">` after existing CSS links (~line 20).
- Add `<script src="js/notice.js"></script>` before `app.js` (~line 910).

---

## Verification Plan

### Manual Verification (Browser Testing)

1. **Open the app in a browser** at the project's `index.html` (or deployed URL).
2. **Log in** with an existing account.
3. **Desktop test (≥992px width)**:
   - Verify the "Notice" button appears in the navbar between "Resources" and the user card.
   - Click "Notice" → the notice modal opens with a "Load Notices" button.
   - Click "Load Notices" → spinner appears → notices load into the list panel.
   - Click a notice → PDF loads in the right iframe panel, with "Open" and "Download" buttons.
   - Close and re-open the modal → notices should still be visible (no re-fetch needed).
   - Refresh the page, re-open the modal → notices should load from localStorage cache without pressing "Load" again.
4. **Mobile test (≤991px width)**:
   - Verify a "Notices" toggle tab appears on the right side (below the Events toggle).
   - Tap the toggle → notice sidebar slides in with a "Load Notices" button.
   - Tap "Load Notices" → notices load into the list.
   - Tap a notice → PDF opens in a new browser tab.
   - Close and re-open the sidebar → notices still visible.
5. **Cache expiry**: Open DevTools → Application → localStorage → modify the `b1tSched_notices` timestamp to be >1 hour old → reopen panel → should show "Load Notices" button again.
