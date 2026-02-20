[Task-1] 

#target: for the Class Notice section, plesae add a deadline option similar to Pending Tasks (with grace period)

[Task-2]

#target: in Mobile display size, for the Pending Tasks "Add Task" form, make the two options (radio buttons) for setting deadlines appear vertically, unlike horizontally like in Desktop display size.

[Task-3] 

#target: update some CSS
- the status bar background in web app version is green. Please match it with the website theme (maroon/white)
- in lines 211-218 of @note.css there seems to be some incorrect CSS. Please fix it

[Task-4]

#target: update the @README.md with the recent changes, and major updates. refer to  @DOCUMENTATION.md as reference. Add an "Appreciation" section after "## Feature Request:" and add a paragraph saying "Thanks to these individuals who helped with testing, suggestions and support

[Task-5]

#target: monthly view for mobile display Calendar View

#specification:
- refer to the attached image and add a toggle to switch between two view modes: "Monthly view" (default) and "Weekly View"
- the current one is weekly view
- in "monthly view", the calendar interface will be similar to the 2nd image I attached (dark background). The whole month will be shown together with compact date cells. The dates with Task deadlines will be highlighted with a dot on top of the date numbers. 
- clicking on the date cells will show the tasks for that date (if there is any tasks created with deadline of that date) under the calendar (as the reference image shows).
- if there are no tasks set, it will also be shown that "No tasks today. Yay!"