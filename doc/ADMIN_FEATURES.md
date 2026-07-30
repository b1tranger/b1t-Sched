# Admin Features Documentation

## Overview

The admin functionality allows designated users to manage tasks and events for all users. Admin users can only be set manually through the Firebase Firestore console.

## Setting Up an Admin User

To make a user an admin, manually add the `isAdmin: true` field to their user document in Firestore:

1. Go to Firebase Console → Firestore Database
2. Navigate to `users` collection
3. Select the user document
4. Add field: `isAdmin` (boolean) = `true`

## Admin Capabilities

### User Management & System Operations

| Feature | Description |
|---------|-------------|
| **Manage Users** | Access User Management view to filter, assign roles, edit profiles, send password resets, or delete users |
| **Student Search Bar** | Real-time search by email, student ID, department, semester, or section with instant filtering and clear button |
| **Bulk Semester Auto-Update** | Fail-safe action to bulk advance all eligible student semesters ($1\text{st} \rightarrow 2\text{nd}, \dots, 8\text{th} \rightarrow \text{alumni}$) for a new term cycle |
| **Reset Tasks** | Deletes all tasks past 12h grace period for the current department/semester/section |
| **Delete Task** | Remove individual tasks with click of a trash icon |

### Event Management

| Feature | Description |
|---------|-------------|
| **Add Event** | Create new events for all departments or specific ones |
| **Delete Event** | Remove individual events before they become "old" |
| **View Old Events** | Available to all users - shows past events |

## Database Schema

### Admin Flag (users collection)

```javascript
{
  email: "admin@university.edu",
  studentId: "1234567890",
  department: "CSE",
  semester: "5th",
  section: "A1",
  isAdmin: true,  // Only this field makes them admin
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Events Collection

```javascript
// Collection: events
{
  title: "Mid-term Exams",
  description: "Exam schedule details...",
  date: Timestamp,
  department: "ALL" | "CSE" | "IT" | "CE" | "EEE" | "BBA",
  createdBy: "userId",
  createdAt: Timestamp
}
```javascript
// Document: /metadata/semesterConfig
{
  lastBulkUpdate: Timestamp,  // Server timestamp of last admin bulk update execution
  lastCycle: "2026-07",       // Semester cycle tag ("YYYY-01" or "YYYY-07")
  updatedBy: "adminUserId"    // User ID of the admin who executed the update
}
```

## Security Rules (Recommended)

Add these rules to your Firestore Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check admin status
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Users can read/write their own profile and completedTasks subcollection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /completedTasks/{taskId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Tasks - any authenticated user can read and create; only admin can delete
    match /tasks/{taskId} {
      allow read, create: if request.auth != null;
      allow delete: if isAdmin();
    }
    
    // Events - all can read; only admin can create/delete
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow create, delete: if isAdmin();
    }
    
    // Resource links and metadata - read for signed-in users; write for admins
    match /resourceLinks/{department} {
      allow read: if request.auth != null;
    }
    
    match /metadata/{document=**} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
  }
}
```

## UI Elements

### Admin-Only Buttons

- **Manage Users** - Appears in Profile Settings (opens User Management view)
- **Auto-Update Semesters** - Appears in User Management view header. Fail-safe bulk update tool with a 30-second read-only verification countdown and a 6-month ($180\text{ days}$) execution cooldown.
- **Firebase Dashboard** - Appears in Profile Settings (link to Firebase Console)
- **Reset Tasks** - Appears in tasks section (danger button)
- **Add Event** - Appears in events sidebar (desktop and mobile)
- **Delete buttons** - Appear on each task card and event card

### All Users

- **View Old Events** - Button to view past events
- **Add Tasks** - Regular users can still add tasks
- **View Old Tasks** - View tasks past 12h grace period (with completion status)

## Implementation Details

### Files Modified

| File | Changes |
|------|---------|
| `js/db.js` | Added `isUserAdmin()`, `deleteTask()`, `resetOldTasks()`, `createEvent()`, `deleteEvent()`, `getOldEvents()` |
| `js/app.js` | Added `isAdmin` state, admin event listeners, handler functions |
| `js/ui.js` | Added `toggleAdminControls()`, `renderOldEvents()`, updated `renderTasks()` and `renderEvents()` for delete buttons |
| `index.html` | Added admin buttons, Add Event modal, Old Events modal |
| `css/dashboard.css` | Styled admin controls, delete buttons, events actions |

### Admin Check Flow

1. User logs in
2. `handleAuthenticatedUser()` calls `DB.isUserAdmin(userId)`
3. `isAdmin` flag stored in `App.isAdmin`
4. `UI.toggleAdminControls(isAdmin)` shows/hides admin buttons
5. All admin actions verify `isAdmin` before executing

## Notes

- Admin status is cached in `localStorage` for quick UI rendering
- Delete operations require confirmation dialogs
- Reset Tasks only deletes tasks past their deadline date
- Events can be targeted to all departments or specific ones
