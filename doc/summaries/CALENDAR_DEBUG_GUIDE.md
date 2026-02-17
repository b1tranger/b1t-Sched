# Calendar View Debugging Guide

## Issue
Clicking on the calendar icon button doesn't open the calendar modal.

## Debugging Steps Added

I've added console logging to help identify the issue. When you click the calendar button, you should see these messages in the browser console:

1. On page load:
   - `"Calendar button found, attaching click listener"` - Confirms the button was found
   - OR `"Calendar button not found in DOM"` - Indicates the button doesn't exist

2. When clicking the button:
   - `"Calendar button clicked!"` - Confirms the click event fired
   - `"Calendar open() called"` - Confirms the open method was called
   - `"Modal exists: true/false"` - Shows if the modal was created
   - `"Setting modal display to flex"` - Confirms the modal is being shown
   - OR `"Modal element not found!"` - Indicates the modal wasn't created

## How to Debug

1. **Open your browser's Developer Tools**:
   - Chrome/Edge: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Firefox: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
   - Safari: Enable Developer menu in Preferences, then press `Cmd+Option+C`

2. **Go to the Console tab**

3. **Reload the page** and look for initialization messages

4. **Click the calendar button** (📅 icon next to "Pending Tasks")

5. **Check the console messages** to see where the process stops

## Common Issues and Solutions

### Issue 1: "Calendar button not found in DOM"
**Cause**: The button element doesn't exist or has a different ID

**Solution**: Check if the button exists in the HTML:
```html
<button id="calendar-view-btn" class="btn btn-icon" title="Calendar view">
```

### Issue 2: No console messages at all
**Cause**: JavaScript file not loaded or initialization not running

**Solutions**:
- Check if `calendar-view.js` is loaded in the Network tab
- Check if there are any JavaScript errors preventing initialization
- Verify `CalendarView` is defined: Type `typeof CalendarView` in console (should return "function")

### Issue 3: "Modal element not found!"
**Cause**: The modal wasn't created during initialization

**Solutions**:
- Check if `createModal()` was called
- Check if there are any errors during modal creation
- Verify the modal exists: Type `document.getElementById('calendar-modal')` in console

### Issue 4: Button clicks but nothing happens
**Cause**: Event listener not attached or modal display issue

**Solutions**:
- Check console for the "Calendar button clicked!" message
- If message appears, check if modal exists in DOM
- Check CSS: The modal should have `display: flex` when open
- Inspect the modal element: Right-click → Inspect Element

### Issue 5: Modal exists but not visible
**Cause**: CSS z-index or display issue

**Solutions**:
- Check if modal has `display: flex` style when open
- Check z-index: Modal should have `z-index: var(--z-modal)` or a high number like 1000
- Check if modal is behind other elements
- Try manually setting display: `document.getElementById('calendar-modal').style.display = 'flex'` in console

## Manual Testing Commands

You can test the calendar manually in the browser console:

```javascript
// Check if CalendarView is defined
typeof CalendarView

// Check if calendar instance exists
App.calendarView

// Manually open the calendar
App.calendarView.open()

// Check if modal exists
document.getElementById('calendar-modal')

// Check if button exists
document.getElementById('calendar-view-btn')

// Manually show modal
document.getElementById('calendar-modal').style.display = 'flex'
```

## Expected Behavior

When working correctly:
1. Page loads → Calendar button appears next to "Pending Tasks"
2. Click button → Modal appears with current month calendar
3. Calendar shows tasks on their deadline dates
4. Can navigate between months with arrow buttons
5. Can close with X button or Escape key

## Files Modified for Debugging

- `js/calendar-view.js`:
  - Added console.log in `attachEventListeners()` method
  - Added console.log in `open()` method

## Next Steps

After identifying the issue from console logs:

1. **If button not found**: Check HTML structure and button ID
2. **If modal not created**: Check `createModal()` method for errors
3. **If modal not visible**: Check CSS styles and z-index
4. **If event not firing**: Check if button is disabled or has conflicting handlers

## Removing Debug Logs

Once the issue is fixed, you can remove the console.log statements from:
- Line ~1067 in `js/calendar-view.js` (attachEventListeners method)
- Lines ~208-211 in `js/calendar-view.js` (open method)

## Contact

If the issue persists after checking all the above, please provide:
1. Console log output
2. Browser and version
3. Any error messages
4. Screenshots of the Developer Tools Console tab
