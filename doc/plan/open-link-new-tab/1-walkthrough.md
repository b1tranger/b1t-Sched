# Walkthrough - Open Links in New Tab

I have updated the link handling logic to ensure all links in "Pending Tasks" and "Events" open in a new tab.

## Changes

### [js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js)

#### [utils.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/utils.js)
-   Updated `linkify` function to:
    -   Detect links starting with `www.` (previously only `http`/`https`).
    -   Automatically prepend `https://` to `www.` links in the `href` attribute.
    -   Ensure all generated links have `target="_blank"` and `rel="noopener noreferrer"`.

## Verification Results

### Automated Tests
I created a temporary test script `test_linkify.js` and ran it to verify the regex logic:

```javascript
Original: "Check this out: https://google.com"
Linkified: "Check this out: <a href="https://google.com" target="_blank" rel="noopener noreferrer" class="description-link">https://google.com</a>"
---
Original: "Go to www.example.com for more info"
Linkified: "Go to <a href="https://www.example.com" target="_blank" rel="noopener noreferrer" class="description-link">www.example.com</a> for more info"
```

The output confirms that both standard and `www.` links are correctly converted to new-tab links.
