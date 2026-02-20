# Quick Links PDF Viewer Integration

Make PDF links in the "Quick Links" section open in an in-page PDF viewer modal (same UX as the Notice PDF viewer) instead of downloading or navigating away.

## Proposed Changes

### HTML — `index.html`

#### [NEW] PDF Viewer Modal

Add a new **generic PDF viewer modal** after the Notice modal (around line 701). This reuses the same visual pattern as the Notice viewer's PDF panel — toolbar with title + Open/Download buttons, and an iframe for the PDF.

```html
<!-- PDF Viewer Modal (for Quick Links) -->
<div id="pdf-viewer-modal" class="modal" style="display: none;">
    <div class="modal-content pdf-viewer-modal-content">
        <div class="modal-header">
            <h2 class="modal-title">
                <i class="fas fa-file-pdf"></i>
                <span id="pdf-viewer-title">PDF Viewer</span>
            </h2>
            <button id="close-pdf-viewer-modal" class="btn btn-icon">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body pdf-viewer-modal-body">
            <div class="pdf-viewer-toolbar">
                <div class="pdf-viewer-actions">
                    <a id="pdf-viewer-open" class="btn btn-secondary btn-sm" href="#" target="_blank">
                        <i class="fas fa-external-link-alt"></i> Open in Tab
                    </a>
                    <a id="pdf-viewer-download" class="btn btn-primary btn-sm" href="#" download>
                        <i class="fas fa-download"></i> Download
                    </a>
                </div>
            </div>
            <iframe id="pdf-viewer-frame" class="pdf-viewer-frame" title="PDF Viewer"></iframe>
        </div>
    </div>
</div>
```

---

### JavaScript — `js/ui.js`

#### [MODIFY] [ui.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/ui.js)

1. **Update `renderResourceLinks`** — detect if a link URL ends with `.pdf` (case-insensitive). For PDF links, prevent the default `<a>` navigation and instead call a new `openPdfViewer()` function.

   - Change from `<a href="..." target="_blank">` to `<a href="..." class="resource-link-card" data-pdf-url="...">`
   - Add click handler that intercepts PDF links and opens the viewer modal

2. **Add `openPdfViewer(url, title)`** method to the `UI` object:
   - Sets the iframe `src` to the PDF URL
   - Sets the title, Open href, Download href
   - Shows the modal using `UI.showModal('pdf-viewer-modal')`

3. **Add `closePdfViewer()` and init for the close button** — wire up the close button and backdrop click on the modal.

4. **Add `initPdfViewer()`** — called from the main `init` to wire up close button and backdrop click.

---

### CSS — `css/notice.css`

#### [MODIFY] [notice.css](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/css/notice.css)

Add styles for the new PDF viewer modal at the end of the file. These mirror the notice PDF panel styles:

- `.pdf-viewer-modal-content` — max-width/height similar to notice modal
- `.pdf-viewer-modal-body` — padding and flex layout
- `.pdf-viewer-toolbar` — same as `.notice-pdf-toolbar`
- `.pdf-viewer-frame` — same as `.notice-pdf-frame`

---

## How It Works

- When resource links are rendered, any link whose `url` ends in `.pdf` will be intercepted
- **Desktop**: Clicking opens the PDF viewer modal with the PDF in an iframe, plus Open-in-Tab and Download buttons
- **Mobile**: Opens the PDF in a new tab (identical to how mobile Notice PDFs work), since mobile browsers handle PDF iframes poorly

## Verification Plan

### Manual Verification

Since there are no automated tests in this project, verification is manual:

1. Open the app in a browser and log in to reach the dashboard
2. Look at the Quick Links section — any link whose URL ends in `.pdf` should now open in an in-page modal viewer instead of downloading
3. Verify the modal shows the PDF in an iframe, with working "Open in Tab" and "Download" buttons
4. Verify the close button and backdrop click both close the modal
5. On mobile (or narrow viewport), verify PDF links open in a new tab instead of the modal
6. Verify non-PDF links still work normally (open in new tab)
