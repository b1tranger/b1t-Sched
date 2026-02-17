[Task-1]

# target: fix Pending Task adding form:

1. add task screen on mobile is zoomed is and overflow is scrollable. make it full screen width for mobile if necessary, but keep it fixed so the user is not able to swipe or scroll the window contents.

2. adding deadline date is buggy, I canmot add dates whem I first click in the calender input field. But I have to select the radio again to do so.



[Task-2] 

# target: Calendar view for mobile not showing contents





[Task-3]

# target: Notice section for CRs alongside University notices, similar to Events



# specification:

- for desktop display, make the Notice window 2 columned: one for Notice from CRs and another to load University notices. The university notices will be opened in another window with the same functionality the current PDF viewer has.

- for mobile display, make the Notice window consist of 2 equally divided rows. Top row will hold the CR notices and the bottom row will load the University notices like before




---


let's test 1 and 2 first. For now, prepare an instructions for 3 for Firebase database. I am willing to create more data tables for the notice. 



do you recall ".kiro/specs/activity-timeline-view"? prepare an instruction to create a data table for the timeline as well. the ideas is that, whenever a task is added, it will be stored in the timeline data table separately. for now, do not account for the deleted tasks. instead, consider a "status" for the tasks: "added" and "deleted"; so I can work on the deleted asks later. when the users (all users) delete a task, its status should change to "deleted" from "added" (status set when task is added).



also prepare a new Firestore rules for these changes