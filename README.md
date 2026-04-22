# b1t-Sched - Academic Task Scheduler

A single-page application (SPA) that helps students manage academic tasks, assignments, exams, and events with personalized department-specific content.

<div align=center>
<img src="Social-Preview.webp" width=200px align=center>
   <h1>👉 <a href="https://github.com/b1tranger/b1t-Sched/blob/main/doc/DOCUMENTATION.md">Documentation</a> 👈</h1>
   </div>
<!-- ![b1t-Sched Preview]() -->

## ✨ Features

- 📱 **Single-Page Application** - Fast, seamless navigation
- 🔐 **Firebase Authentication** - Secure email/password login with password reset
- 👤 **User Profiles** - Set department, semester, and section once
- 📋 **Personalized Tasks** - View tasks filtered by your academic details, with clickable links and collapsible descriptions
- ✏️ **Edit Entries** - Users can edit their own tasks; admins can edit all tasks and events; CRs can create department events and manage their own
- 🔗 **Dynamic Resource Links** - Department-specific routine, calendar, and faculty contacts with built-in PDF viewer
- 📅 **Event Calendar** - Track upcoming academic events with collapsible descriptions, department scope badge, and clickable links
- 📆 **Calendar View** - Interactive monthly calendar with task visualization, date navigation, and responsive mobile layout (monthly/weekly toggle)
- 📣 **CR Notices** - Class Representatives can post, edit, and delete notices visible to their section group; supports priority levels and deadline tracking
- 📰 **University Notice Viewer** - View UCAM university notices with PDF preview, powered by Vercel serverless backend with local caching
- 🏫 **Google Classroom Integration** - View assignments and announcements from enrolled courses in a unified interface with OAuth session persistence
- 📝 **Note Taking** - Personal notes with markdown support, auto-save, and file upload via catbox.moe/tmpfiles.org
- 📊 **Activity Timeline** - Visual heatmap and bar chart tracking user activity (logins, tasks, events) for productivity insights
- 🔔 **Push Notifications** - Real-time browser notifications for new tasks and events (mobile-compatible)
- 🏆 **Contributions** - Leaderboard of top contributors (group-specific or global across all departments)
- ⚙️ **Profile Settings** - Update your details anytime (30-day cooldown)
- ❓ **FAQ Section** - Collapsible accordion explaining how the site works, user roles, and profile settings
- 🎨 **Maroon Theme** - Professional dark maroon and off-white color scheme
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- 📲 **Progressive Web App** - Installable app with offline support and service worker caching

> 📖 For complete documentation, see [`doc/DOCUMENTATION.md`](doc/DOCUMENTATION.md)

---

## Stack
<img align="center" width="488" height="346" alt="image" src="https://github.com/user-attachments/assets/34afedc6-2aba-4e80-a38f-0b4239e6556d" />

---

## Screenshots
<div align=center>
   
<img width="300" height="2000" alt="1" src="https://github.com/user-attachments/assets/0984e07f-04cf-446a-9044-9dd13c47bfe2" />
<img width="300" height="2000" alt="2" src="https://github.com/user-attachments/assets/2406add8-a7de-458b-a7c2-f4468f21dbc6" />
<img width="300" height="2000" alt="3" src="https://github.com/user-attachments/assets/0e4ece71-5106-4d86-a772-eea68037c9b0" />
<img width="300" height="2000" alt="4" src="https://github.com/user-attachments/assets/6e059928-8484-4fe3-82bf-43e3385c2aca" />
<img width="300" height="2000" alt="5" src="https://github.com/user-attachments/assets/91fe0f09-79f2-4d1c-b0d8-df2e32e289f5" />
<img width="300" height="2000" alt="6" src="https://github.com/user-attachments/assets/8927eb52-0d49-4d36-8511-06812861aee9" />
<img width="300" height="2000" alt="7" src="https://github.com/user-attachments/assets/4d2a5c94-bef9-46d1-bfbe-9065a6e26aa2" />
<img width="300" height="2000" alt="8" src="https://github.com/user-attachments/assets/53d8d429-966b-49f6-910d-b6923ad142b9" />


</div>


---

## 🚀 Quick Setup Guide

### Prerequisites

- A text editor (VS Code recommended)
- Modern web browser (Chrome, Firefox, Edge)
- Firebase account (free)

### Step 1: Firebase Backend Setup

1. **Follow the complete Firebase setup guide:**
   - Open [`FIREBASE_SETUP.md`](doc/FIREBASE_SETUP.md)
   - Complete all steps to set up Firebase project
   - Create Firestore collections with sample data
   - Copy your Firebase configuration

### Step 2: Configure Firebase in Project

1. Open `js/firebase-config.js`
2. Replace the placeholder values with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",              // Replace with your API key
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 3: Replace Old Index File

1. **Backup your current `index.html`:**
   ```bash
   mv index.html index-old-backup.html
   ```

2. **Rename the new file:**
   ```bash
   mv index-new.html index.html
   ```

### Step 4: Test Locally

1. **Open the project:**
   - Right-click `index.html` → Open with Live Server (VS Code extension)
   - OR use Python: `python -m http.server 8000`
   - OR simply open `index.html` in your browser

2. **Test the flow:**
   - ✅ Sign up with a new account
   - ✅ Set your department, semester, section
   - ✅ View personalized dashboard
   - ✅ Click resource links
   - ✅ Access profile settings
   - ✅ Update your details
   - ✅ Logout and login again

---

## 📁 Project Structure

```
b1t-Sched/
├── index.html                    # Main SPA entry point
├── manifest.json                 # PWA manifest
├── sw.js                         # Service worker
├── README.md                     # This file
│
├── css/                          # Stylesheets
│   ├── colors.css               # CSS variables (maroon theme)
│   ├── main.css                 # Core styles
│   ├── components.css           # Reusable components
│   ├── dashboard.css            # Dashboard layout, modals
│   ├── navbar.css               # Navigation bar
│   ├── notice.css               # Notice viewer & PDF viewer styles
│   ├── classroom.css            # Google Classroom styles
│   ├── calendar.css             # Calendar view styles
│   ├── timeline.css             # Activity timeline styles
│   ├── note.css                 # Note-taking styles
│   ├── responsive.css           # Mobile responsive styles
│   └── ...                      # Additional styles
│
├── js/                           # JavaScript modules
│   ├── firebase-config.js       # Firebase configuration (⚠️ UPDATE THIS)
│   ├── auth.js                  # Authentication logic
│   ├── db.js                    # Database operations
│   ├── routing.js               # SPA routing
│   ├── ui.js                    # UI rendering
│   ├── profile.js               # Profile management
│   ├── utils.js                 # Utility functions
│   ├── notice.js                # University notice viewer
│   ├── cr-notice.js             # CR notice management
│   ├── notes.js                 # Note-taking module
│   ├── classroom.js             # Google Classroom integration
│   ├── calendar-view.js         # Calendar view (monthly/weekly)
│   ├── activity-logger.js       # Activity tracking
│   ├── timeline-data.js         # Timeline data processing
│   ├── timeline-ui.js           # Timeline visualization
│   ├── notification-manager.js  # Push notifications
│   └── app.js                   # Main application logic
│
├── doc/                          # Documentation
│   ├── DOCUMENTATION.md         # Complete project documentation
│   ├── FIREBASE_SETUP.md        # Firebase setup guide
│   └── ...                      # Additional docs
│
├── functions/                    # Firebase Cloud Functions
│   └── index.js                 # Admin functions entry point
│
└── images/                       # Image assets
```

---

## 🎨 User Flow

```
1. User visits website
   ↓
2. Login/Signup
   ↓
3. First login? → Set Details (Department, Semester, Section)
   ↓
4. Dashboard
   ├─ Resource Links (3 cards: Routine, Calendar, Faculty)
   ├─ Pending Tasks (filtered by user settings)
   └─ Upcoming Events
   ↓
5. Click User Details Card (top-right)
   ↓
6. Profile Settings
   ├─ Edit Department
   ├─ Edit Semester
   ├─ Edit Section
   ├─ Save Changes
   └─ Logout
```

---

## 🔧 Configuration

### Adding Departments

Edit in Firebase Console → Firestore → `metadata` → `departments`:

```json
{
  "list": ["CSE", "IT", "CE", "EEE", "BBA", "YOUR_NEW_DEPT"]
}
```

### Adding Semesters

Edit in Firebase Console → Firestore → `metadata` → `semesters`:

```json
{
  "list": ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"]
}
```

### Adding Sections

Edit in Firebase Console → Firestore → `metadata` → `sections`:

```json
{
  "CSE-1st": ["A1", "A2"],
  "CSE-2nd": ["A1", "A2", "B1", "B2"],
  "IT-1st": ["A1", "A2"]
}
```

### Adding Resource Links

1. Go to Firebase Console → Firestore → `resourceLinks`
2. Create a document with Department ID (e.g., `CSE`)
3. Add array field `resources`:

```json
{
  "resources": [
    {
      "id": 1,
      "title": "CSE Routine",
      "description": "(Spring 2026)",
      "url": "https://docs.google.com/...",
      "icon": "📅",
      "type": "routine"
    },
    {
      "id": 2,
      "title": "Academic Calendar",
      "description": "(2026)",
      "url": "https://calendar.google.com/...",
      "icon": "📆",
      "type": "calendar"
    },
    {
      "id": 3,
      "title": "CSE Faculty List",
      "description": "(Spring 2026)",
      "url": "https://docs.google.com/...",
      "icon": "👥",
      "type": "faculty"
    }
  ]
}
```

### Adding Tasks

Firebase Console → Firestore → `tasks` → Add document:

```json
{
  "title": "Operating Systems Assignment 1",
  "course": "CSE-3101",
  "department": "CSE",
  "semester": "3rd",
  "section": "A1",
  "deadline": "2026-03-15T23:59:59Z",  // Use timestamp picker
  "type": "assignment",  // assignment, homework, exam, project
  "description": "Complete chapters 1-3 exercises",
  "details": "Submit via email to instructor",
  "status": "active",
  "createdAt": [current timestamp]
}
```

### Adding Events

Firebase Console → Firestore → `events` → Add document:

```json
{
  "title": "Spring Semester Final Exam",
  "date": "2026-05-20T09:00:00Z",
  "department": "ALL",  // or specific department
  "description": "Final examinations begin",
  "createdAt": [current timestamp]
}
```
---

## Update Timeline Manually

refer to: [activity-timeline--migration](https://github.com/b1tranger/b1t-Sched/blob/main/doc/DOCUMENTATION.md#11-activity-timeline--migration) and [firebase_timeline.md](https://github.com/b1tranger/b1t-Sched/blob/main/doc/notes/firebase_timeline.md)

run in browser console:
```
migrateActivityLogs()
```

---

## 🚀 Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow prompts:**
   - Link to your project
   - Deploy!

### Option 2: Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   netlify deploy
   ```

3. **For production:**
   ```bash
   netlify deploy --prod
   ```

### Option 3: GitHub Pages

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository settings
   - Scroll to "Pages"
   - Source: main branch
   - Save

### Option 4: Firebase Hosting

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login:**
   ```bash
   firebase login
   ```

3. **Initialize hosting:**
   ```bash
   firebase init hosting
   ```

4. **Deploy:**
   ```bash
   firebase deploy --only hosting
   ```

---

## 🛠️ Admin Operations

### Adding New Users (Manual)

Users can sign up themselves. No manual intervention needed.

### Managing Tasks (Manual Method)

1. Go to Firebase Console → Firestore
2. Navigate to `tasks` collection
3. Click "Add document"
4. Fill in fields and save

### Bulk Import (Advanced)

Create a script to import from Google Sheets:

```javascript
// Example: Import tasks from array
const tasks = [/* your tasks */];

tasks.forEach(async (task) => {
  await db.collection('tasks').add(task);
});
```

---

## 🔒 Security

### Firestore Security Rules

Already set up in `FIREBASE_SETUP.md`. Rules ensure:
- ✅ Only authenticated users can access data
- ✅ Users can only edit their own profile
- ✅ Users can create tasks and edit/delete their own
- ✅ Admins have full control over all tasks and events
- ✅ CRs can create department events and manage their own events
- ✅ Blocked users are restricted to read-only mode

### API Key Safety

- Firebase API keys are safe to include in client-side code
- Security is enforced through Firestore Security Rules
- Domain restrictions can be set in Firebase Console

---

## 🐛 Troubleshooting

### Issue: "Firebase not defined"

**Solution:** Check that Firebase CDN scripts are loaded before your app scripts in `index.html`

### Issue: "Permission denied" errors

**Solution:** 
1. Check Firestore Security Rules
2. Verify user is authenticated
3. Check browser console for detailed errors

### Issue: Tasks not showing

**Solution:**
1. Verify tasks exist in Firestore with matching department/semester/section
2. Check browser console for errors
3. Ensure `status` field is "active"
4. Check deadline is in the future

### Issue: Resource links not appearing

**Solution:**
1. Check `resourceLinks` collection has document for user's department
2. Verify `resources` array field exists
3. Check URLs are valid

---

## 📊 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Development

### Local Development

1. Make changes to HTML/CSS/JS files
2. Test using Live Server or local HTTP server
3. Check browser console for errors
4. Test on different screen sizes

### Adding New Features

1. Update UI components in respective files
2. Add new routes in `routing.js` if needed
3. Create new database operations in `db.js`
4. Update UI rendering in `ui.js`

---

## 🤝 Support

For issues or questions:
1. Check `FIREBASE_SETUP.md` for backend setup
2. Check `REDESIGN_PLAN.md` for architecture details
3. Review browser console for error messages

---

## 🎉 Getting Started Checklist

- [ ] Complete Firebase setup (see `FIREBASE_SETUP.md`)
- [ ] Update `js/firebase-config.js` with your credentials
- [ ] Replace `index.html` with `index-new.html`
- [ ] Add sample data to Firestore (tasks, events, resource links)
- [ ] Test signup/login flow
- [ ] Test setting details
- [ ] Test dashboard with personalized data
- [ ] Test profile settings
- [ ] Deploy to production
- [ ] Share with students!

---

## Feature Request:

from @S. M. Zafrul Islam (zafrul.islam@uits.edu.bd)
   - [ ] task cards divided into smaller cards for each detail (deadline in a card, title in another card) to make it easier to get innone look
   - [ ] promote to 59 batch juniors
   - [ ] click logo to go to home screen

from [@Helal Udding Patwary (Shakil) (0432410005101086)](https://github.com/Binary-Eclipse)
   - [ ] short faq explaining each section

from [@K. M. Jakaria (0432310005101037)](https://github.com/Reaper-X003)
   - [ ] dark theme [1d16168e1616d84040eeeeee](https://colorhunt.co/palette/1d16168e1616d84040eeeeee)
   - [ ] light theme [7d0a0abf3131ead196eeeeee](https://colorhunt.co/palette/7d0a0abf3131ead196eeeeee)
   - [x] Add Monthly Calender view for mobile Tasks.
   - [x] Add Classroom tasks atumatically adding to the tasks (Automation) (admin: added a button to "sync" the assignments and add them as tasks)



from [@MuhammadShishir](https://github.com/MuhammadShishir):
   - [x] Time tracking,
   - [x] Adding documents,
   - [ ] Adding AI support, 
   - [x] Add a timeline view and table view ....
```
I will need some elaboration:
1. Time Tracking: Timeline? like who posted what and when? Is it a different feature?
2. Document adding: I will be making a Qbank, Insha Allah. Will import that feature (adding questions) as other file upload here.
3. AI support: how about a model trained with my whole resources dump of all questions, notes, outlines collected?
```
   Install clickup and see, 
   - [ ] Time tracking is per task time tracking using a stop watch or timer button per task ( admin: added timeline, but no timer for each ask)
   - [ ] In a task many documents r generated or given to use, if we add them here it will be easy to maintain and later we can just share the link to people who need it ( admin: added temp uploads in notes )
   - [ ] AI support is for updating tasks, creating files and answering questions
   - [x] The two views I mentioned r the easiest, just call ur tasks into two tabs, one should look like a table of task and another will have calender view and tasks in them showing u ur work timeline, just go to clickup for reference ....

from [@foxxie911](https://github.com/foxxie911)
   - [ ] need to refine data/files (all digital versions; routines formatted)
   - [x] add PDF viewer: need to view resources inside the website/app (otherwise I am depending on outside sources --> not convincing)
   - [x] Faculty-side ( admin: have added the roles, they have separate space for tasks in theory)
   - [ ] add a feature, the semester of each student will update automatically at the end of semester, or with only one push of button by admin


---

**Ready to get started? Follow [`FIREBASE_SETUP.md`](doc/FIREBASE_SETUP.md) first!** 🚀

---

## 🙏 Appreciation

Thanks to these individuals who helped with testing, suggestions and support.

Faculties
- [S. M. Zafrul Islam (zafrul.islam@uits.edu.bd)](https://github.com/zafrul097)

Seniors
- [Md Kamruzzaman Shishir (1814355002)](https://github.com/MuhammadShishir)
- [Md. Sakibul Hakim (Sadab) (2114951038)](https://github.com/foxxie911)
- [Zobayer Hasan (2215151106)](https://github.com/zobayersq)
- [Mohammad Masud Chowdhury Mahir (2215151105)](https://github.com/mahirmasud)
- [Md Sakib Hosen (0432220005101058)](https://github.com/chatok-jnr)
- [Akib Reza (0432220005101061)](https://github.com/AkibReza)
- [Md. Safrid Bhueyan (0432310005101080)](https://github.com/safridbhueyan)
- [K. M. Jakaria (0432310005101037)](https://github.com/Reaper-X003)
- [Md. Robiul Hassan (Rabin) (0432310005101096)](https://github.com/Arriesgado47)
- [Md. Mahfuz (0432310005101057)](https://github.com/Mahfuz5634)
- [Md. Masud Rahman (0432320005101064)](https://github.com/shoytanbaba99)
- [Kazi Md. Azhar Uddin Abeer (0432320005101120)](https://github.com/4xrhd)
- [Md.Jihad Hossan (0432320005101017)](https://github.com/tofazmahmud)
- [Md. Muhaiminul Islam (0432320005101207)](https://github.com/Maheem0)
- [Rudro Antony Mrong (0432320005101059)](https://github.com/LackOfHP)

Classmates
- [Jannatul Ferdus (0432410005101058)](https://github.com/jannatulferdus182003)
- [Shalehin Ahmed (0432410005101083)](https://github.com/ORNOB-083)
- [Shamiur Hasan (0432410005101053)](https://github.com/shamiurhasan100)
- [Md. Jubair Ahammed (0432410005101112)](https://github.com/JubairAhammedJubu)
- [Saha Pradyumna Prasad (Ankur) (0432410005101159)](https://github.com/Saha-Pradyumna-Prasad)
- [Manik Halder (0432410005101113)](https://github.com/RayneAshe0)
- [@Helal Udding Patwary (Shakil) (0432410005101086)](https://github.com/Binary-Eclipse)

Juniors
- [Mamunur Rahman (04325205101031)](https://github.com/Zirconium001)
- [Kazi Rabit Jahir (04325205101006)](https://github.com/RabbitJahir)




