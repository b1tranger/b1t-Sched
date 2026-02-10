# 🚀 Quick Start Guide - b1t-Sched

## Overview
This guide will get your b1t-Sched website up and running in **30 minutes**.

---

## 📋 Step-by-Step Backend Setup

### STEP 1: Create Firebase Project (5 minutes)

1. Go to https://console.firebase.google.com
2. Click "**Add project**"
3. Name it: `b1t-sched`
4. Disable Google Analytics (optional)
5. Click "**Create project**"

### STEP 2: Enable Authentication (2 minutes)

1. In Firebase Console, click "**Authentication**" (left sidebar)
2. Click "**Get started**"
3. Click "**Sign-in method**" tab
4. Enable "**Email/Password**"
5. Click "**Save**"

✅ Authentication ready!

### STEP 3: Create Firestore Database (3 minutes)

1. Click "**Firestore Database**" (left sidebar)
2. Click "**Create database**"
3. Choose "**Start in test mode**"
4. Select location: `asia-south1` (Mumbai) or `asia-southeast1` (Singapore)
5. Click "**Enable**"

✅ Database ready!

### STEP 4: Get Firebase Config (2 minutes)

1. Click "**Project Overview**" (top left)
2. Click the **Web icon** (`</>`)
3. Nickname: `b1t-sched-web`
4. Click "**Register app**"
5. **COPY the configuration code** that appears

Example:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "b1t-sched.firebaseapp.com",
  projectId: "b1t-sched",
  storageBucket: "b1t-sched.appspot.com",
  messagingSenderId: "123...",
  appId: "1:123..."
};
```

### STEP 5: Configure Your Project (2 minutes)

1. Open `js/firebase-config.js` in your text editor
2. **Replace** the placeholder values with YOUR configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",              // Paste your values here
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

3. **Save** the file

### STEP 6: Create Firestore Collections (10 minutes)

**A. Create `users` collection:**
1. In Firestore, click "**Start collection**"
2. Collection ID: `users`
3. Click "**Next**" → "**Save**" (we'll skip the first document)

**B. Create `tasks` collection with sample data:**
1. Click "**Start collection**"
2. Collection ID: `tasks`
3. Click "**Next**"
4. Create sample task:
   - Document ID: Auto-ID
   - Add fields:
     ```
     title: "OS Assignment 1" (string)
     course: "CSE-3101" (string)
     department: "CSE" (string)
     semester: "1st" (string)
     section: "A1" (string)
     deadline: Select timestamp → 2026-03-15 23:59:59
     type: "assignment" (string)
     description: "Complete chapters 1-3" (string)
     details: "Submit via email" (string)
     status: "active" (string)
     createdAt: Current timestamp
     ```
5. Click "**Save**"

**C. Create `events` collection:**
1. Click "**Start collection**"
2. Collection ID: `events`
3. Sample event:
   ```
   title: "Spring Semester Begins" (string)
   date: Select timestamp → 2026-02-15
   department: "ALL" (string)
   description: "Official start date" (string)
   createdAt: Current timestamp
   ```
4. Click "**Save**"

**D. Create `metadata` collection:**
1. Click "**Start collection**"
2. Collection ID: `metadata`
3. Create 3 documents:

   **Document 1:** ID = `departments`
   ```
   Field: list (array)
   Values: ["CSE", "IT", "CE", "EEE", "BBA"]
   ```

   **Document 2:** ID = `semesters`
   ```
   Field: list (array)
   Values: ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"]
   ```

   **Document 3:** ID = `sections`
   ```
   Field type: map
   CSE-1st: ["A1", "A2"] (array)
   CSE-2nd: ["A1", "A2", "B1", "B2"] (array)
   IT-1st: ["A1", "A2"] (array)
   ```

**E. Create `resourceLinks` collection:**
1. Click "**Start collection**"
2. Collection ID: `resourceLinks`
3. Create document with ID = `CSE`
4. Click "**Add field**" → Type: "**array**" → Name: `resources`
5. Click "**Add item**" → Type: "**Map**"
6. Add these fields to the map:
   ```
   id: 1 (number)
   title: "CSE Routine" (string)
   description: "(Spring 2026)" (string)
   url: "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID" (string)
   icon: "📅" (string)
   type: "routine" (string)
   ```
7. Click "**Add item**" again for Calendar and Faculty links
8. Click "**Save**"

### STEP 7: Update Security Rules (3 minutes)

1. In Firestore, click "**Rules**" tab
2. **Replace all text** with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow update: if isOwner(userId);
      allow delete: if false;
    }
    
    match /tasks/{taskId} {
      allow read: if isSignedIn();
      allow write: if false;
    }
    
    match /events/{eventId} {
      allow read: if isSignedIn();
      allow write: if false;
    }
    
    match /resourceLinks/{department} {
      allow read: if isSignedIn();
      allow write: if false;
    }
    
    match /metadata/{document=**} {
      allow read: if isSignedIn();
      allow write: if false;
    }
  }
}
```

3. Click "**Publish**"

✅ Backend setup complete!

---

## 💻 Frontend Setup

### STEP 8: Update Your Project Files (2 minutes)

**Option A: Manual Rename**
```bash
# In your project folder:
mv index.html index-old-backup.html
mv index-new.html index.html
```

**Option B: In Windows Explorer**
1. Rename `index.html` to `index-old-backup.html`
2. Rename `index-new.html` to `index.html`

---

## 🧪 Testing (3 minutes)

### STEP 9: Test Locally

1. **Open the project:**
   - Right-click `index.html` → Open with browser
   - OR use VS Code Live Server extension
   - OR run: `python -m http.server 8000`

2. **Test the flow:**
   - ✅ Click "**Create Account**"
   - ✅ Sign up with test email: `test@example.com` / password: `test123`
   - ✅ Set details: Department = CSE, Semester = 1st, Section = A1
   - ✅ See dashboard with your sample task
   - ✅ Click the 3 resource link cards (should open in new tab)
   - ✅ Click user card (top-right) → Opens Profile Settings
   - ✅ Change details → Click "Save Changes"
   - ✅ Logout → Login again

### Expected Results:
- ✅ Maroon color theme visible
- ✅ User details card shows your email and settings
- ✅ Tasks filtered by department/semester/section
- ✅ Resource links change when you update department

---

## 🚀 Deployment (5 minutes)

### STEP 10: Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd "e:\Git_WIP\2. Personal Repositories\b1t-Sched"
   vercel
   ```

3. **Follow prompts:**
   - Login to Vercel
   - Link to new project
   - Deploy!

4. **Get your live URL:**
   - Example: `https://b1t-sched.vercel.app`

### Alternative: Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## ✅ Post-Deployment Checklist

- [ ] Firebase backend configured
- [ ] All 5 Firestore collections created
- [ ] Sample data added (tasks, events, metadata, resource links)
- [ ] Firebase config updated in `js/firebase-config.js`
- [ ] `index-new.html` renamed to `index.html`
- [ ] Tested locally (signup, login, dashboard, profile)
- [ ] Deployed to production
- [ ] Live URL works

---

## 🎯 Next Steps

### Add More Data

**Add more tasks:**
1. Firebase Console → Firestore → `tasks` → Add document
2. Fill in: title, course, department, semester, section, deadline, type, description, status
3. Set `status: "active"` and deadline in the future

**Add more resource links:**
1. Create documents for other departments (IT, CE, EEE, BBA)
2. Each document ID = department name
3. Add `resources` array field with 3 items

**Add more events:**
1. Firestore → `events` → Add document
2. Set date in the future
3. Set department = "ALL" or specific department

### Share with Students

1. Share your live URL
2. Students sign up with their email
3. They set their department/semester/section
4. They see personalized content

---

## 🆘 Quick Troubleshooting

**Problem:** Blank page
- **Fix:** Check browser console (F12) for errors
- **Fix:** Verify Firebase config in `js/firebase-config.js`

**Problem:** Can't login
- **Fix:** Check Firebase Console → Authentication → Make sure Email/Password is enabled

**Problem:** No tasks showing
- **Fix:** Verify tasks in Firestore have matching department/semester/section
- **Fix:** Check `status: "active"`

**Problem:** "Permission denied" errors
- **Fix:** Make sure Security Rules are published
- **Fix:** User must be logged in

---

## 📚 Documentation

- **Complete Setup:** See [`FIREBASE_SETUP.md`](FIREBASE_SETUP.md)
- **Full README:** See [`README-NEW.md`](README-NEW.md)
- **Architecture Details:** See [`REDESIGN_PLAN.md`](REDESIGN_PLAN.md)

---

## 🎉 You're Done!

Your b1t-Sched website is now live with:
- ✅ Secure authentication
- ✅ Personalized dashboards
- ✅ Department-specific resources
- ✅ Task management
- ✅ Event calendar
- ✅ Profile settings
- ✅ Beautiful maroon theme

**Share with your classmates and enjoy! 🚀**
