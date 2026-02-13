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
- 🔗 **Dynamic Resource Links** - Department-specific routine, calendar, and faculty contacts
- 📅 **Event Calendar** - Track upcoming academic events with collapsible descriptions, department scope badge, and clickable links
- ⚙️ **Profile Settings** - Update your details anytime (30-day cooldown)
- ❓ **FAQ Section** - Collapsible accordion explaining how the site works, user roles, and profile settings
- 🎨 **Maroon Theme** - Professional dark maroon and off-white color scheme
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile

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
├── FIREBASE_SETUP.md            # Firebase backend setup guide
├── REDESIGN_PLAN.md             # Complete redesign documentation
├── README.md                    # This file
│
├── css/
│   ├── colors.css               # Color variables (maroon theme)
│   ├── main.css                 # Main styles
│   ├── components.css           # Reusable components
│   ├── navbar.css               # Navigation bar
│   ├── user-details-card.css    # User profile card
│   └── responsive.css           # Mobile responsive styles
│
├── js/
│   ├── firebase-config.js       # Firebase configuration (⚠️ UPDATE THIS)
│   ├── auth.js                  # Authentication logic
│   ├── db.js                    # Database operations
│   ├── routing.js               # SPA routing
│   ├── ui.js                    # UI rendering
│   ├── profile.js               # Profile management
│   ├── utils.js                 # Utility functions
│   └── app.js                   # Main application logic
│
├── images/                      # Logos and images
└── D1/                          # Old structure (can be archived)
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
from [@MuhammadShishir](https://github.com/MuhammadShishir):
   1. Time tracking,
   2. Adding documents,
   3. Adding AI support, 
   4. Add a timeline view and table view ....

from [@foxxie911](https://github.com/foxxie911)
   1. need to refine data/files 
   2. add PDF viewer: need to view resources inside the website/app (otherwise I am depending on outside sources --> not convincing)
   3. Faculty-side


---

**Ready to get started? Follow [`FIREBASE_SETUP.md`](doc/FIREBASE_SETUP.md) first!** 🚀
