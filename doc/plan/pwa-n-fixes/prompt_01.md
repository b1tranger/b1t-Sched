[Task-1]



# target: Checking PWA and adding mobile functionality



# specification:

- I am able to download an Web App version from my mobile browser in my website. I knew that this is not possible without setting up manifest and service worker.

- if PWA is not properly set up, please set it up

- the user should be prompted to download the web app if they have not already





[Task-2]



# target: notifications for new tasks and events



# specification:

- when new task or events are added, the user should be notified from their browser or the web app they install of the website



[Task-3]



# target: fixing permission issue for CR



#specification:

- please the the Firebase rules, since users with "CR" role cannot add events. they should be able to add events for their own semester (locked) and edit/delete their own added events





[Task-4]



# target: new role "Faculty" and their priviledges



# specification:

- add a new role "Faculty" that can be assigned only by the admin using User Management interface

- users with "Faculty" role will be grouped (their added Tasks) based on "Departments". Their Profile settings will be changed accordingsly by making the "Semester" and "Section" fields readonly or "Not Available For Faculty"

- users with "Faculty" role will have a different Google Classroom interface that will allow them to create posts/assignments within the website. Please guide me through the steps to impement it on Google Classroom API





[Task-5]

# target: User Management interface update for admins



# specification:

- I want to add options to "Send Password Reset Link" and "Delete User" (With intense visual caution) in the User list which could only be done from the Firebase dashboard.

- make the buttons inside the User List smaller (in width) like they are in Desktop display.

- make the "Filter Users" section compact and hide it behind a pop-up window, accessible after clicking on a "Add Filter" button. The "Clear Filters" button will be moved in that pop-up window as well.





[Task-6]

# target: hiding redundant "FAQ" and "Contribution" section



# specification:

- these sections should only be visible in the home page view. 



[Task-7]



# target: adding Note Taking feature



# specification:

- add a button with Note taking icon in the bottom-middle of the screen (bottom-right corner when in desktop display)

- pressing the button will pop-up a simple note taking interface (full-screen for mobile displays) where users can work on a single note.

- the text functionality will work similarly as adding tasks in "Pending Tasks" section and "Events". Meaning, it will support markdown and linkify features.

- all users can access this feature; "edit" and "clear" their notes.

- inside the Note taking interface, there will be a button "Upload Files" that will drop-down a list of temporary file upload sites: 



[general Task]

- prepare a new Firebase rule to copy and paste that addresses all the above changes and updates

- make the FAQ section compact by moving the 3 drop-down menu inside another drop-down menu



