[Task-1]

#target: add "Refresh Notices" button in University Notices section

#specificaiton:
- after loading the university notices, there is not way to update them. I need a button that will check for new notices and fetch only the new ones

#additional:
- please explain me the conditions set for fetching notice updates (it was 10 ID serial numbers ahead, so I would get up to 10 future notices) and update it to 10  future IDs from 727 (that is the latest ID)
- please explain if there is a way to fetch and download the PDF notices in the backend to reduce the loading time

[Task-2]

#target: fix screen zoom issue for diferent devices. only mobile displays are to be targeted

#specification:
- make the default zoom level 95% for mobile displays
- for varying device screen sizes, I previously implemented varying html zoom css properties for different screen sizes. but it broke the TImeline View (made the Bar diagram click off-target (clicking right on the diagram would not open the detailed list, and it was to be clicked a bit to the right)
- suggest me if there are any js alternatives, so the screen sizes get zoomed out depending on the visibility of the website elements. currently, the main issue is that the website is really zoomed in it the victim device screens. I only need to zoom out without breaking the Timeline view

[Task-3]
#taget: adding short guide in each section

#specification:
- add a small font texts (semi-transparent) to every section (Pending Tasks, Calendar view button, Events, Notice, Classroom, Notes,) similar to profile settings but shorter, to explain briefly about what those sections do.
- make it a tooltip button so users can tap on it to view the short guide
- try to keep the tooltip button (?) right aligned in the screen

[Task-4]
#target: improving Note section

#specification:
- I want to merge the Text editing section with the preview section inside the Note taking interface
- without user interaction (clicking inside the test field to write something), or clicking outside the text field after editing, or saving the note will show the preview 
- when the use interacts with the text field, the preview will turn into the Text writable field
- the temporary file upload feature needs some changes. 
    - sometimes it takes longer to try the first option (catbox.moe)  and it fails eventually before falling back to the backup option (tmpfiles.org). I want to reduce that delay before failure (make it wait around 20s before trying other options.)
    - if the upload fails after trying all options, the website should suggest users to manually go to file.io (alternative option) and get a share link after uploading the files there. but it should show it only after the initial options fail. otherwise, it should remain hidden.

- make the text input field bigger by default
- clicking on the uploaded file links do not immediately start downloading, nor they open in a new tab. I need to manually copy the links and paste them in a new tab to download them. and even them it shows a warning before downloading. please fix it so clicking on the link immediately starts downloading, and show the user a message "click here if the link does not start download" and clicking on it will take the clicked link and open it in a new tab

- automation: add a "shorten" button that converts all user added texts in the note interface into one .md file (considering links) and turns them into download links after uploading them using the temporary upload feature. so the long text converts into one downloadable link.

<instruction>
prioritize [Task-4] before other tasks. let me view the implementation plan before executing. and after each changes, update the documentation at "doc\DOCUMENTATION.md" with updates like automation, issues and fixes.
</instruction>

---

[Task-1]
- in mobile display, in Events sidebar, when there are no Events added in the Events section, the sidebar is kept blank, unlike the desktop screen size window that shows "No upcoming events". please add it for mobile displays as well

[Task-2]
#target: Note interface improvement issues

#specification:
- the preview section takes up more height than the text editing section (refer to the attached images). make the preview scrollable instead of showing the overflow and moving the Upload FIles button with it.

