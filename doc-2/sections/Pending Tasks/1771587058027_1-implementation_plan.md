> Original Source: plan/open-link-new-tab/1-implementation_plan.md

# Open Links in New Tab Implementation Plan

## Goal Description
The user wants links in "Pending Tasks" and "Events" to open in a new tab. Currently, the code `js/utils.js` already adds `target="_blank"` to `http` and `https` links. However, it likely fails to recognize `www.` links or other common patterns without protocol, or the user might be experiencing issues with specific link formats.
I will enhance the `linkify` function to support `www.` links and ensure they also open in a new tab, and verifying that the existing `target="_blank"` is correctly applied.

## Proposed Changes

### [js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js)

#### [MODIFY] [utils.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/utils.js)
- Update `linkify` regex to capture `www.` links.
- Logic to prepend `https://` if missing in the `href` attribute (but keep display text as is).
- Ensure `target="_blank"` and `rel="noopener noreferrer"` are present for all generated links.

```javascript
  linkify(text) {
    if (!text) return '';
    // URL regex pattern (modified to support www.)
    const urlPattern = /((https?:\/\/|www\.)[^\s<>"'\)\]]+)/g;
    // Replace URLs with anchor tags, ensuring http:// for www. links
    return text.replace(urlPattern, (match) => {
        let href = match;
        if (!/^https?:\/\//i.test(href)) {
            href = 'https://' + href;
        }
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="description-link">${match}</a>`;
    });
  },
```

## Verification Plan

### Manual Verification
- Since I cannot run the app, I will create a small test script/HTML file locally (which I will inspect via `view_file` or `read_file`) to verify the regex works as expected on various inputs:
    - `https://google.com` -> `<a href="..." target="_blank">...`
    - `www.google.com` -> `<a href="https://www.google.com" target="_blank">www.google.com</a>`
    - `Text with link https://example.com/foo` -> `Text with link <a...`

### Automated Tests
- None available in the repository. The manual verification script will serve as a regression test for this specific feature.
