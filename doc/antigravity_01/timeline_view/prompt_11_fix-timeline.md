 refer to
   "doc/kiro_01/specs/activity-timeline-view"
   and work on "js/timeline-data.js" and
   "js/timeline-ui.js" to implement the Timeline
   interface as intended.
   
   when the timeline button is clicked, the browser console shows:
   "
   installHook.js:1  [TimelineDataService] Failed to fetch data: FirebaseError: The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/b1t-sched/firestore/indexes?create_composite=Ck9wcm9qZWN0cy9iMXQtc2NoZWQvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2FjdGl2aXR5X2xvZ3MvaW5kZXhlcy9fEAEaDgoKZGVwYXJ0bWVudBABGg0KCXRpbWVzdGFtcBACGgwKCF9fbmFtZV9fEAI
overrideMethod @ installHook.js:1
getActivityData @ timeline-data.js:78
await in getActivityData
loadData @ timeline-ui.js:178
open @ timeline-ui.js:135
(anonymous) @ timeline-ui.js:105
installHook.js:1  Failed to load timeline data
overrideMethod @ installHook.js:1
loadData @ timeline-ui.js:189
await in loadData
open @ timeline-ui.js:135
(anonymous) @ timeline-ui.js:105
auth.js:48 [Auth] Session timer cleared
auth.js:40 [Auth] Session timer started (1 hour)
auth.js:48 [Auth] Session timer cleared
auth.js:40 [Auth] Session timer started (1 hour)
auth.js:48 [Auth] Session timer cleared
auth.js:40 [Auth] Session timer started (1 hour)
"

but no content is shown.

I have also deployed "firestore.indexes.json" as instructed by other Agentic Models. and as you will see from the images I attached [@Image](zed:///agent/pasted-image) [@Image](zed:///agent/pasted-image) , they are already in the Firetore database.

I only want to see a graphical visualization of all of my tasks according to their dates


---


#target: updating and adding additional details to charts in timeline

#specification:

No student information will be shown here. But the data will show information from all departments, semesters, and sections

For the Activity Breakdown:
- the bar chart should show "Task add count" in y-axis and "Task add date" in x-axis.
- the chart should allow users to change the month using left and right arrow buttons and date selector (for month and year) 
- chart should show different visual graph for each month (since the data will be different when changing the month)
- a filter will allow and overlay, or secondary chart to be drawn based on counts of tasks from specific departments, semesters, sections, course title, or task type on the y-axis besides the primary chart ( "Task add count" in y-axis and "Task add date" in x-axis)

For the activity heatmap:
- refer to the attached image and make the heatmap more like the GitHub activity
- it should show yearly activity and a year selector
- the boxes should reflect the days of each month and the yearly activity should be marked as monthly sections, as depicted in the attached image

For both views:
- clicking on boxes (activity heatmap) or bars (activity breakdown) should popup further details; much like how the Calendar view for tasks work. But the detail will show grouped count with "Course Title", and show details about which department, semester and section the tasks are from. Except showing any student details.


---

# target: Fixing Timeline view and Total User Count visibility for all users

# specification:
- currently, the Timeline View and Total User Count is not shown to any logged in user who is not admin.
- the timeline view for non-admin users show:
" Failed to load activity data. Please try again later. "

and the browser console show:
"
timeline-data.js:83  [TimelineDataService] Failed to fetch data: FirebaseError: Missing or insufficient permissions.
getActivityData @ timeline-data.js:83
await in getActivityData
loadData @ timeline-ui.js:281
(anonymous) @ timeline-ui.js:208
timeline-ui.js:293  [TimelineUI] Failed to load timeline data: Missing or insufficient permissions.
"
- the data regarding the timeline "activity_logs" is meant to be viewed by the public. just do not let the users see any personal data (name, ID) of the students. the goal of the timeline view is to assess the performance of the students and the activity inside the website
- the Total User Count supposedly poses a security threat since it needs to load all user data to count them. Is it possible to implement it like a duplicate feature of the user count shown in User management page?