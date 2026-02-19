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


---


alright, next, let's try to implement the CR notice section
refer to "firestore.rules" where there is a section called "CR NOTICES COLLECTION (NEW)"; we need to implement that

# target: Notice section for CRs alongside University notices, similar to Events


# specification:

- for desktop display, make the Notice window 2 columned: one for Notice from CRs and another to load University notices. The university notices will be opened in another window with the same functionality the current PDF viewer has.

- for mobile display, make the Notice window consist of 2 equally divided rows. Top row will hold the CR notices and the bottom row will load the University notices like before

- if there is any Firebase database changes required, let me know

---

issues regarding the Notices sidebar:
1. the sidebar appears darkened and unclickable. the Google Classroom sidebar toggle is showing over the sidebar
2. university notices should load vertically

and for the Notice pop-up:
1. "CR Notices" section keeps showing "loading"
2. "University Notices" is not the heading for the other section but rather the heading for the whole window. there is also no "load" button for the university notices

general concern:
- I don't see any "add notice" button
- where does the "add notice" button ad the entries to? is it a new Database collection on Firebase?
