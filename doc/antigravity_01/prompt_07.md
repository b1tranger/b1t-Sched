[Task-1]
#issue: offline banner hides Events toggle in mobile display

#fix-plan:
- for mobile displays, please make the offline announcement banner "You're offline. Showing cached content." have less height space (less top and down padding)
- the banner should move the whole page, instead of just the top bar. So the Events Toggle shifts downward instead of hiding behind the top bar.

[Task-2]
#issue: note link download still works only with open in new tab

#fix-plan:
- the file links that the temporary file upload api generate after uploading a file, does not start downling the file immediately after clicking on it. Even "Click here" in  <!-- Download helper (shown when a file link is clicked) --> section does not work
- the file should start downloading in the current tab. otherwise, the website should show the message to "click, hold, and open in new tab" (for mobile displays) or "right-click and open in a new tab" (for desktop display) to download the file.

[Task-3]
#issue: line break for title name overflow in Old Tasks

#fix-plan:
- The Old Tasks section should show the title name in the same line as the course name. If the title name is too long, it should wrap to the next line.
- The same logic should be applied for Old Events, and Old Notice window.

[Task-4]
#issue: The tasks title is hidden behind the task type is it's too long

#fix-plan:
- make the title name always appear under the course name if it is not possible to avoid the task type element.

[Task-5]
#issue: timeline view close button is buggy, especially on mobile display

#fix-plan:
- make the timeline view close button work properly, especially on mobile display
- make all the close buttons (Events sidebar, Notices Sidebar+window, Google Classroom sidebar+window,  Notes window, Contribution and Timeline window) similar to the Tasks Calendar View 

[Task-6]
#issue: google login screen while loading, does not log into classroom automatically. 

#fix-plan:
- The Google Login window (after loading animation, when starting the website) should actually keep the Google Classroom logged it. Otherwise remove the login screen while a website starts loading.
