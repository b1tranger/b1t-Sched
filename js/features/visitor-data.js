// ============================================
// VISITOR MODE DUMMY DATA (CLIENT-SIDE ONLY)
// ============================================
// Completely local static data for read-only preview mode.
// Zero Firebase / Firestore / Auth network operations.

const VisitorData = {
  getProfile(department = 'CSE', semester = '5th', section = '5A') {
    return {
      id: 'visitor-mock-user',
      name: 'Visitor Guest',
      email: 'visitor@b1tsched.local',
      role: 'Visitor',
      department: department,
      semester: semester,
      section: section,
      studentId: 'VISITOR-PREVIEW',
      theme: 'light',
      isVisitor: true
    };
  },

  getTasks(department = 'CSE', semester = '5th', section = '5A') {
    const now = Date.now();
    return [
      {
        id: 'mock-task-1',
        title: 'Database Systems Assignment 2 (Normalization & 3NF)',
        course: 'CSE301',
        type: 'assignment',
        description: 'Complete normalization problems up to BCNF and draw relational schema diagrams.',
        deadline: new Date(now + 2 * 24 * 60 * 60 * 1000),
        department: department,
        semester: semester,
        section: section,
        addedBy: 'faculty-mock-1',
        addedByRole: 'Faculty',
        createdAt: new Date(now - 86400000)
      },
      {
        id: 'mock-task-2',
        title: 'Operating Systems Lab: CPU Scheduling Algorithms',
        course: 'CSE302',
        type: 'lab',
        description: 'Implement FCFS, SJF, and Round Robin scheduling in C/C++ and generate Gantt charts.',
        deadline: new Date(now + 5 * 24 * 60 * 60 * 1000),
        department: department,
        semester: semester,
        section: section,
        addedBy: 'faculty-mock-1',
        addedByRole: 'Faculty',
        createdAt: new Date(now - 172800000)
      },
      {
        id: 'mock-task-3',
        title: 'Software Engineering Project Proposal Presentation',
        course: 'CSE305',
        type: 'presentation',
        description: 'Prepare a 10-slide deck covering project wireframes, tech stack, and milestone roadmap.',
        deadline: new Date(now + 8 * 24 * 60 * 60 * 1000),
        department: department,
        semester: semester,
        section: section,
        addedBy: 'cr-mock-1',
        addedByRole: 'CR',
        createdAt: new Date(now - 259200000)
      },
      {
        id: 'mock-task-4',
        title: 'Design & Analysis of Algorithms Problem Set (Graph Traversal)',
        course: 'CSE303',
        type: 'assignment',
        description: 'Self-study problems on BFS, DFS, and topological sort. Practice for upcoming midterms.',
        deadline: new Date(now + 45 * 24 * 60 * 60 * 1000), // Default semester end
        isNoDeadline: true,
        department: department,
        semester: semester,
        section: section,
        addedBy: 'cr-mock-1',
        addedByRole: 'CR',
        createdAt: new Date(now - 345600000)
      }
    ];
  },

  getEvents(department = 'CSE') {
    const now = Date.now();
    return [
      {
        id: 'mock-event-1',
        title: 'Semester Midterm Examination Week',
        description: 'Official schedule for midterm examinations across all departments.',
        date: { toDate: () => new Date(now + 12 * 24 * 60 * 60 * 1000) },
        department: 'ALL',
        semester: null
      },
      {
        id: 'mock-event-2',
        title: 'Tech Fest & Hackathon Registration',
        description: 'Annual competitive programming contest and software exhibition.',
        date: { toDate: () => new Date(now + 20 * 24 * 60 * 60 * 1000) },
        department: department,
        semester: null
      }
    ];
  },

  getNotices() {
    return [
      {
        id: 'mock-notice-1',
        title: 'Notice regarding Semester Midterm Examination Schedule and Admit Card Distribution',
        date: new Date().toLocaleDateString('en-GB'),
        link: 'https://uits.edu.bd',
        category: 'Academic'
      },
      {
        id: 'mock-notice-2',
        title: 'Central Campus Library extended hours for study and exam preparations',
        date: new Date().toLocaleDateString('en-GB'),
        link: 'https://uits.edu.bd',
        category: 'General'
      }
    ];
  }
};

