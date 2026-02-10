# Firebase Backend Setup Guide

## Overview
This guide will walk you through setting up Firebase Authentication and Firestore Database for b1t-Sched.

---

## Step 1: Create Firebase Project

### 1.1 Go to Firebase Console
1. Visit: https://console.firebase.google.com
2. Click **"Add project"** or **"Create a project"**

### 1.2 Project Setup
1. **Project name:** `b1t-sched` (or your preferred name)
2. **Google Analytics:** Optional (recommended: disable for simplicity)
3. Click **"Create project"**
4. Wait for project creation (~30 seconds)

---

## Step 2: Enable Firebase Authentication

### 2.1 Navigate to Authentication
1. In Firebase Console, click **"Authentication"** in left sidebar
2. Click **"Get started"**

### 2.2 Enable Email/Password Authentication
1. Click **"Sign-in method"** tab
2. Find **"Email/Password"** provider
3. Click on it to enable
4. Toggle **"Enable"** switch to ON
5. **Optional:** Keep "Email link (passwordless sign-in)" disabled for now
6. Click **"Save"**

✅ Authentication is now ready!

---

## Step 3: Enable Firestore Database

### 3.1 Navigate to Firestore
1. In Firebase Console, click **"Firestore Database"** in left sidebar
2. Click **"Create database"**

### 3.2 Security Rules Setup
1. Choose **"Start in test mode"** (for development)
   - ⚠️ **Note:** Test mode allows all read/write access for 30 days
   - We'll update security rules later
2. Click **"Next"**

### 3.3 Choose Location
1. Select **Cloud Firestore location:** 
   - Recommended for Bangladesh: `asia-south1` (Mumbai) or `asia-southeast1` (Singapore)
2. Click **"Enable"**
3. Wait for database creation (~30 seconds)

✅ Firestore Database is now ready!

---

## Step 4: Get Firebase Configuration

### 4.1 Register Your Web App
1. In Firebase Console, go to **Project Overview** (top left)
2. Click the **"Web"** icon (`</>` symbol) to add a web app
3. **App nickname:** `b1t-sched-web`
4. **Optional:** Check "Also set up Firebase Hosting" if you want (not required)
5. Click **"Register app"**

### 4.2 Copy Configuration Code
You'll see a code snippet like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "b1t-sched.firebaseapp.com",
  projectId: "b1t-sched",
  storageBucket: "b1t-sched.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### 4.3 Save Configuration
**⚠️ IMPORTANT:** 
1. Copy this configuration
2. Create a file: `js/firebase-config.js` in your project
3. Paste the configuration there (we'll set this up in the next steps)

> **Note:** The API key is safe to expose in client-side code. Firebase security is handled by Firestore Security Rules and Authentication, not by hiding the API key.

---

## Step 5: Create Firestore Collections

### 5.1 Create `users` Collection
1. In Firestore Database, click **"Start collection"**
2. **Collection ID:** `users`
3. Click **"Next"**
4. **Create first document (example):**
   - **Document ID:** `testUser123` (or click "Auto-ID")
   - **Fields:**
     ```
     email: "test@example.com" (string)
     department: "CSE" (string)
     semester: "1st" (string)
     section: "A1" (string)
     createdAt: [Click "timestamp" and select "timestamp"]
     updatedAt: [Click "timestamp" and select "timestamp"]
     ```
5. Click **"Save"**

### 5.2 Create `tasks` Collection
1. Click **"Start collection"** again
2. **Collection ID:** `tasks`
3. Click **"Next"**
4. **Create example task:**
   - **Document ID:** Auto-ID
   - **Fields:**
     ```
     title: "OS Assignment 1" (string)
     course: "CSE-3101" (string)
     department: "CSE" (string)
     semester: "1st" (string)
     section: "A1" (string)
     deadline: [timestamp: 2026-03-15 23:59:59]
     type: "assignment" (string)
     description: "Complete chapters 1-3" (string)
     details: "Submit via email" (string)
     status: "active" (string)
     createdAt: [timestamp: current time]
     ```
5. Click **"Save"**

### 5.3 Create `events` Collection
1. Click **"Start collection"**
2. **Collection ID:** `events`
3. **Create example event:**
   - **Document ID:** Auto-ID
   - **Fields:**
     ```
     title: "Spring Semester Begins" (string)
     date: [timestamp: 2026-02-15]
     department: "ALL" (string)
     semester: "ALL" (string)
     description: "Official start date" (string)
     createdAt: [timestamp: current time]
     ```
4. Click **"Save"**

### 5.4 Create `resourceLinks` Collection
1. Click **"Start collection"**
2. **Collection ID:** `resourceLinks`
3. **Create CSE resources:**
   - **Document ID:** `CSE`
   - **Field type:** Click **"Add field"** → Select **"Array"**
   - **Field name:** `resources`
   - **Array items:** Click **"Add item"** → Select **"Map"**
   - **Map fields:**
     ```
     id: 1 (number)
     title: "CSE Routine" (string)
     description: "(tmp Spring-2026)" (string)
     url: "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID" (string)
     icon: "📅" (string)
     type: "routine" (string)
     ```
   - Click **"Add item"** again for Calendar and Faculty links
4. Click **"Save"**

### 5.5 Create `metadata` Collection
1. Click **"Start collection"**
2. **Collection ID:** `metadata`
3. **Create departments document:**
   - **Document ID:** `departments`
   - **Field:**
     ```
     list: ["CSE", "IT", "CE", "EEE", "BBA"] (array)
     ```
4. **Create semesters document:**
   - **Document ID:** `semesters`
   - **Field:**
     ```
     list: ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"] (array)
     ```
5. **Create sections document:**
   - **Document ID:** `sections`
   - **Field (map):**
     ```
     CSE-1st: ["A1", "A2"] (array)
     CSE-2nd: ["A1", "A2", "B1", "B2"] (array)
     IT-1st: ["A1", "A2"] (array)
     ... (add more as needed)
     ```

---

## Step 6: Update Firestore Security Rules (Production-Ready)

### 6.1 Navigate to Rules Tab
1. In Firestore Database, click **"Rules"** tab

### 6.2 Replace with Production Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow update: if isOwner(userId);
      allow delete: if false; // Prevent deletion
    }
    
    // Tasks collection - read only, filtered by department/semester/section
    match /tasks/{taskId} {
      allow read: if isSignedIn();
      allow write: if false; // Only admins can write (implement admin logic later)
    }
    
    // Events collection - read only
    match /events/{eventId} {
      allow read: if isSignedIn();
      allow write: if false; // Only admins can write
    }
    
    // Resource links - read only
    match /resourceLinks/{department} {
      allow read: if isSignedIn();
      allow write: if false; // Only admins can write
    }
    
    // Metadata - read only
    match /metadata/{document=**} {
      allow read: if isSignedIn();
      allow write: if false; // Only admins can write
    }
  }
}
```

### 6.3 Publish Rules
1. Click **"Publish"**
2. Confirm the update

✅ **Security:** Now only authenticated users can access data, and users can only modify their own profiles.

---

## Step 7: Firebase SDK Installation

You have two options:

### Option A: CDN (Recommended for simplicity)
Add these scripts to your `index.html` (we'll do this in implementation):

```html
<!-- Firebase SDK v9+ (Modular) -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
```

### Option B: npm (if using build tools)
```bash
npm install firebase
```

**For this project, we'll use Option A (CDN)** since we're using vanilla JavaScript.

---

## Step 8: Test Connection (After Code Implementation)

After implementing the frontend code, test Firebase connection:

1. Open browser console (F12)
2. You should see: `"Firebase initialized successfully"`
3. Try to sign up a new user
4. Check Firebase Console → Authentication → Users to see if user was created
5. Check Firestore → users collection for user document

---

## Admin Panel Setup (Optional - Future)

For managing tasks, events, and resource links, you can:

### Option 1: Manual Entry
- Add data directly in Firebase Console (Firestore Database)

### Option 2: Build Admin Web Interface
- Create separate admin page with protected routes
- Use Firebase Admin SDK for server-side operations
- Deploy as Cloud Function or separate app

### Option 3: Use Google Sheets Integration
- Create Google Apps Script to sync Sheets → Firestore
- Useful if you already have data in Google Sheets

---

## Important Notes

### 🔒 Security Best Practices
1. **Never commit Firebase config to public repos** if it contains sensitive data
   - For public repos: Use environment variables or separate config file
   - Firebase config API keys are safe to expose (they're restricted by domain)
   
2. **Always use Firestore Security Rules** to protect data
   - The rules we set up ensure users can only access their own data
   
3. **Enable App Check** (optional) to prevent abuse:
   - Firebase Console → App Check → Register app

### 💰 Pricing (Free Tier Limits)
- **Authentication:** 50,000 monthly active users (free)
- **Firestore:** 
  - 50,000 reads/day
  - 20,000 writes/day
  - 1 GB storage
- **More than enough for a college/university app!**

### 📊 Monitoring
- Firebase Console → Usage tab to monitor quota
- Set up billing alerts (optional)

---

## Next Steps

Once you complete this setup:

1. ✅ Firebase project created
2. ✅ Authentication enabled
3. ✅ Firestore database created
4. ✅ Collections set up
5. ✅ Security rules configured
6. ✅ Configuration copied

**You're ready for frontend implementation!**

---

## Troubleshooting

### Issue: "Permission Denied" errors
- **Solution:** Check Firestore Security Rules
- Make sure user is authenticated before accessing data

### Issue: Configuration not working
- **Solution:** Verify `firebaseConfig` values are correct
- Check browser console for detailed error messages

### Issue: Users can't sign up
- **Solution:** 
  - Verify Email/Password authentication is enabled
  - Check if email format is valid
  - Password must be at least 6 characters

### Issue: Data not appearing
- **Solution:**
  - Check Firestore collections exist
  - Verify document structure matches expected schema
  - Check browser Network tab for failed requests

---

## Support Resources

- **Firebase Documentation:** https://firebase.google.com/docs
- **Firestore Guide:** https://firebase.google.com/docs/firestore
- **Authentication Guide:** https://firebase.google.com/docs/auth
- **Stack Overflow:** Tag questions with `firebase` and `google-cloud-firestore`

---

**🎉 Backend setup complete! Ready to proceed with frontend implementation.**
