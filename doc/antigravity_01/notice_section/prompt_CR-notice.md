# target files: @cr-notice.js @notice.js @firestore.rules 

# target: debugging users (CR/Admin) not being able to add Notices for their section

# explanation:
- please explain what are the conditions for a user to be able to add notices in the notice section
- check how Events section works and how Events are added. 
- check if it is possible to add Notices like adding Events by the CR (CR can add Events for their own Departments, and the fomr field is filled by default and unchangeable)
- CR should be able to add notice for their own Section. Meaning, Notices added by the CR should be visible by the students that are in the same Department, Semester and Section as the CR. 
- The CR need not select the Department, Semester, Section manually. The website should fetch those info from the CR user data/ profile information. Do not keep those fields at all in the Add Notice form interface, and make sure that they are needed while  using "Post Notice" button as well.