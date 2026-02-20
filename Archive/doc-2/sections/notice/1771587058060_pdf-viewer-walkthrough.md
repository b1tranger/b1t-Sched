> Original Source: plan/pdf-viewer/pdf-viewer-walkthrough.md

# Quick Links PDF Viewer — Walkthrough

PDF links in the Quick Links section now open in an in-page viewer modal (same UX as the Notice PDF viewer) instead of downloading.

## Changes Made

### [index.html](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/index.html) — New modal
Added a `#pdf-viewer-modal` with title, Open-in-Tab button, Download button, and an `<iframe>` for PDF rendering (lines 703–731).

render_diffs(file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/index.html)

---

### [ui.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/ui.js) — Core logic
- **`renderResourceLinks`** now detects `.pdf` URLs via regex, adds `data-pdf-url` attributes, and intercepts clicks
- **Desktop** → opens the PDF viewer modal with iframe
- **Mobile** (≤768px) → opens PDF in new tab (same as Notice PDFs)
- Added `initPdfViewer()`, `openPdfViewer(url, title)`, `closePdfViewer()`

render_diffs(file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/ui.js)

---

### [app.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/app.js) — Init wiring
Added `UI.initPdfViewer()` call alongside `NoticeViewer.init()`.

render_diffs(file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/app.js)

---

### [notice.css](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/css/notice.css) — Styles
Added `.pdf-viewer-modal-content`, `.pdf-viewer-modal-body`, `.pdf-viewer-toolbar`, `.pdf-viewer-actions`, and `.pdf-viewer-frame` styles mirroring the Notice viewer panel.

render_diffs(file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/css/notice.css)

## Verification

Manual testing required — deploy and check:
1. Quick Links with `.pdf` URLs open the modal viewer on desktop
2. "Open in Tab" and "Download" buttons work correctly
3. Close button and backdrop click dismiss the modal
4. On mobile, PDF links open in a new tab instead
5. Non-PDF links still open normally in a new tab
