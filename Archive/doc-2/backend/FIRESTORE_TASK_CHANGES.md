# Firestore Database Changes - Task Management Update

## Overview

This document describes the Firestore database schema changes required to support the new task management features:
- User task completion tracking
- User-added tasks
- Old/completed tasks viewing

---

## New Schema Additions

### 1. User Task Completions (Subcollection)

Each user now has a subcollection to track their completed tasks:

```
users/{userId}/completedTasks/{taskId}
```

**Document Structure:**
```javascript
{
  completedAt: Timestamp  // When the user marked the task as complete
}
```

**Purpose:**
- Tracks which tasks each user has marked as complete
- Allows per-user completion status (different users can have different completion states)
- Enables "Old Tasks" feature to show completed tasks past their deadline

---

### 2. Updated Task Document

Tasks can now be added by users. The task document has new optional fields:

```
tasks/{taskId}
```

**Updated Structure:**
```javascript
{
  // Existing fields
  title: string,
  course: string,
  type: string,              // "assignment" | "homework" | "exam" | "project"
  description: string,
  details: string,           // Optional
  department: string,
  semester: string,
  section: string,
  deadline: Timestamp,
  status: string,            // "active" | "archived"
  
  // NEW fields for user-added tasks
  addedBy: string,           // User ID who created the task (optional)
  addedByName: string,       // Display name/email prefix (optional)
  createdAt: Timestamp       // When the task was created
}
```

---

## Task Status Logic

### Pending Tasks
Tasks shown in the main dashboard:
- `status == 'active'`
- Filtered by user's department, semester, section

### Completed Tasks (Checked)
- User has a document in `completedTasks` subcollection
- Shown at bottom of Pending Tasks list
- If `deadline < now` → moved to "Old Tasks"

### Incomplete Tasks (Overdue)
- `deadline < now` AND no completion record
- Shown with red border and "Overdue!" badge
- Remains in Pending Tasks until admin removes or user completes

### Old Tasks
- `deadline < now` AND user has completion record
- Shown in "View Old" modal
- Sorted by completion date (newest first)

---

## Firestore Security Rules (Update)

Add these rules to allow users to manage their completions:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Existing user profile rules
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // NEW: Allow users to manage their own task completions
      match /completedTasks/{taskId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Tasks - allow authenticated users to read, and create their own
    match /tasks/{taskId} {
      allow read: if request.auth != null;
      // Allow create if user sets themselves as addedBy
      allow create: if request.auth != null 
                    && request.resource.data.addedBy == request.auth.uid;
      // Only admins can update/delete (configure separately)
    }
    
    // ... rest of rules
  }
}
```

---

## Firestore Indexes Required

### Composite Index for Tasks Query

The existing tasks query requires this index:

```
Collection: tasks
Fields:
  - department (Ascending)
  - semester (Ascending)
  - section (Ascending)
  - status (Ascending)
  - deadline (Ascending)
```

---

## Migration Notes

### For Existing Data

1. **No migration required** - new fields are optional
2. Existing tasks without `addedBy` will display normally
3. Users' completion states start empty (no tasks checked)

### For New Deployments

1. Create the composite index for tasks query
2. Update security rules to allow completedTasks subcollection access
3. Tasks collection requires `status` field on all documents

---

## API Changes Summary

### New DB Methods

| Method | Description |
|--------|-------------|
| `DB.createTask(userId, userEmail, data)` | Create a user-added task |
| `DB.getUserTaskCompletions(userId)` | Get user's completion records |
| `DB.toggleTaskCompletion(userId, taskId, isCompleted)` | Mark/unmark task as complete |
| `DB.getOldTasks(userId, department, semester, section)` | Get completed tasks past deadline |

---

## Example Queries

### Get user's completed task IDs
```javascript
const snapshot = await db.collection('users').doc(userId)
  .collection('completedTasks').get();
```

### Mark task as complete
```javascript
await db.collection('users').doc(userId)
  .collection('completedTasks').doc(taskId)
  .set({ completedAt: firebase.firestore.FieldValue.serverTimestamp() });
```

### Create user task
```javascript
await db.collection('tasks').add({
  title: 'Assignment 1',
  course: 'CSE301',
  type: 'assignment',
  description: 'Complete chapters 1-3',
  department: 'CSE',
  semester: '5th',
  section: 'A1',
  deadline: firebase.firestore.Timestamp.fromDate(new Date('2026-02-20')),
  status: 'active',
  addedBy: userId,
  addedByName: 'john',
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
});
```

---

*Last updated: February 11, 2026*
