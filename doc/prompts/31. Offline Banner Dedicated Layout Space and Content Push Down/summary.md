<!--
tags: [offline-indicator, layout-shift, content-pushdown, responsive-design, resize-observer, css-variables, navbar-offset, sidebar-offset, mobile-drawer, accessibility, v2.52.2]
-->

# Session Summary - 31. Offline Banner Dedicated Layout Space and Content Push Down

## Metadata
- **Session Index**: 31
- **Session Title**: Offline Banner Dedicated Layout Space and Content Push Down
- **Current Version**: `v2.52.2`
- **Date**: August 2026

---

## User Goals & Directives
1. **Dedicated Layout Space for Offline Banner**: Convert `#offline-indicator` from a floating overlay that obscured top-level content (login headers, navbar titles, mobile drawer toggles) into a dedicated layout element that dynamically pushes the page content down.
2. **Dynamic Height Adjustment**: Calculate the height of the offline indicator dynamically across all responsive screen sizes and text wrapping states.
3. **Smooth View Transitions**: Ensure all top-level elements (navbars, main content area, auth containers, drawer sidebars) adapt smoothly without clipping or jarring layout jumps.

---

## Key Technical Decisions & Architecture
1. **Dynamic CSS Custom Property (`--offline-banner-height`)**:
   - Managed `--offline-banner-height` dynamically on `document.documentElement` via a `ResizeObserver` in `js/offline-indicator.js`.
   - Automatically recalibrates when text wraps or the viewport dimensions change, resetting to `0px` when connection is restored.
2. **Dedicated Layout Offsets in CSS (`css/components.css`)**:
   - Updated `body.offline-active .navbar` to position at `top: var(--offline-banner-height, 42px)`.
   - Updated `body.offline-active .main-content` padding-top across desktop, tablet, and mobile viewports.
   - Offset mobile navigation drawer and drawer sidebars (`.events-sidebar`, `.notice-sidebar`, `.classroom-sidebar`).
3. **Accessibility**:
   - Added `role="status"` and `aria-live="polite"` to `#offline-indicator` for screen readers.

---

## Files Modified & Created
- `js/offline-indicator.js` (ResizeObserver height measurement and CSS variable updates)
- `css/components.css` (Offline active layout offsets and drawer positioning)
- `css/navbar.css` & `css/main.css` (Smooth transitions for top and padding-top)
- `index.html` (Static placement of offline indicator with accessibility attributes)

---

## Verification
- Verified offline mode activation: content pushes down smoothly without any overlay clipping.
- Verified responsive text wrapping on mobile devices dynamically updates banner offset.
- Verified drawer sidebars and mobile nav menus open cleanly below the banner.
