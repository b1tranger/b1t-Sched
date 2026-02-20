# Firebase Database Setup Instructions

## Overview

This document provides instructions for setting up two new Firestore collections:
1. **CR Notices** - For Class Representatives to post notices to their sections
2. **Activity Timeline** - For tracking all user activities (task additions, deletions, completions, etc.)

## Table of Contents

1. [CR Notices Collection](#cr-notices-collection)
2. [Activity Timeline Collection](#activity-timeline-collection)
3. [Updated Firestore Security Rules](#updated-firestore-security-rules)
4. [Firestore Indexes](#firestore-indexes)
5. [Data Migration](#data-migration)

---

## CR Notices Collection

### Collection Name: `cr_notices`

### Document Structure

```javascript
{
  id: string,                    // Auto-generated document ID
  title: string,                 // Notice title (required, max 200 chars)
  description: string,           // Notice description (required, max 2000 chars)
  createdAt: Timestamp,          // Server timestamp when created
  updatedAt: Timestamp,          // Server timestamp when last updated
  createdBy: string,             // User ID of CR who created the notice
  createdByName: string,         // Name of CR (extracted from email)
  department: string,            // Department (e.g., "CSE", "EEE")
  semester: string,              // Semester (e.g., "Spring 2026", "Fall 2025")
  section: string,               // Section (e.g., "A", "B", "C")
  isActive: boolean,             // Whether notice is active (default: true)
  priority: string,              // Priority level: "normal", "important", "urgent"
  attachmentUrl: string | null,  // Optional file attachment URL (Firebase Storage)
  attachmentName: string | null, // Original filename of attachment
  viewCount: number              // Number of times viewed (default: 0)
}
```

### Example Document

```javascript
{
  id: "notice_001",
  title: "Class Test on February 25",
  description: "There will be a class test on CSE301 covering chapters 1-5. Please prepare accordingly.",
  createdAt: Timestamp(2026-02-18 10:30:00),
  updatedAt: Timestamp(2026-02-18 10:30:00),
  createdBy: "user123",
  createdByName: "John Doe",
  department: "CSE",
  semester: "Spring 2026",
  section: "A",
  isActive: true,
  priority: "important",
  attachmentUrl: null,
  attachmentName: null,
  viewCount: 15
}
```

### Permissions

- **Read**: All authenticated users can read notices for their department/semester/section
- **Create**: Only CRs can create notices for their own section
- **Update**: Only the CR who created the notice can update it
- **Delete**: Only the CR who created the notice OR admins can delete it

### Validation Rules

1. Title must be 1-200 characters
2. Description must be 1-2000 characters
3. Department, semester, and section must match CR's profile
4. Priority must be one of: "normal", "important", "urgent"
5. CreatedBy must match authenticated user's UID

---

## Activity Timeline Collection

### Collection Name: `activity_timeline`

### Document Structure

```javascript
{
  id: string,                    // Auto-generated document ID
  activityType: string,          // Type of activity (see types below)
  timestamp: Timestamp,          // Server timestamp when activity occurred
  userId: string,                // User ID who performed the action
  userName: string,              // User name (extracted from email)
  userRole: string,              // User role: "Student", "CR", "Faculty", "Admin"
  
  // Context metadata
  department: string | null,     // Department (if applicable)
  semester: string | null,       // Semester (if applicable)
  section: string | null,        // Section (if applicable)
  
  // Related entity IDs
  taskId: string | null,         // Related task ID (for task activities)
  eventId: string | null,        // Related event ID (for event activities)
  noticeId: string | null,       // Related notice ID (for notice activities)
  
  // Task-specific metadata
  taskTitle: string | null,      // Task title (for task activities)
  taskType: string | null,       // Task type: "assignment", "homework", "exam", etc.
  taskCourse: string | null,     // Course name (for task activities)
  taskStatus: string | null,     // Task status: "added", "deleted"
  
  // Additional metadata
  metadata: Object | null        // Flexible field for additional data
}
```

### Activity Types

```javascript
const ACTIVITY_TYPES = {
  // Task activities
  TASK_ADDED: 'task_added',
  TASK_DELETED: 'task_deleted',
  TASK_COMPLETED: 'task_completed',
  TASK_UNCOMPLETED: 'task_uncompleted',
  
  // Event activities
  EVENT_ADDED: 'event_added',
  EVENT_DELETED: 'event_deleted',
  
  // Notice activities
  NOTICE_ADDED: 'notice_added',
  NOTICE_DELETED: 'notice_deleted',
  
  // User activities
  USER_REGISTERED: 'user_registered',
  USER_LOGIN: 'user_login'
};
```

### Example Documents

#### Task Added Activity
```javascript
{
  id: "activity_001",
  activityType: "task_added",
  timestamp: Timestamp(2026-02-18 10:30:00),
  userId: "user123",
  userName: "John Doe",
  userRole: "Student",
  department: "CSE",
  semester: "Spring 2026",
  section: "A",
  taskId: "task_456",
  taskTitle: "Assignment 1",
  taskType: "assignment",
  taskCourse: "CSE301",
  taskStatus: "added",
  eventId: null,
  noticeId: null,
  metadata: {
    deadline: "2026-02-25T23:59:00Z"
  }
}
```

#### Task Deleted Activity
```javascript
{
  id: "activity_002",
  activityType: "task_deleted",
  timestamp: Timestamp(2026-02-19 14:20:00),
  userId: "user123",
  userName: "John Doe",
  userRole: "Student",
  department: "CSE",
  semester: "Spring 2026",
  section: "A",
  taskId: "task_456",
  taskTitle: "Assignment 1",
  taskType: "assignment",
  taskCourse: "CSE301",
  taskStatus: "deleted",
  eventId: null,
  noticeId: null,
  metadata: {
    deletedReason: "user_action"
  }
}
```

#### Task Completed Activity
```javascript
{
  id: "activity_003",
  activityType: "task_completed",
  timestamp: Timestamp(2026-02-20 09:15:00),
  userId: "user789",
  userName: "Jane Smith",
  userRole: "Student",
  department: "CSE",
  semester: "Spring 2026",
  section: "A",
  taskId: "task_456",
  taskTitle: "Assignment 1",
  taskType: "assignment",
  taskCourse: "CSE301",
  taskStatus: "added",
  eventId: null,
  noticeId: null,
  metadata: {
    completedAt: "2026-02-20T09:15:00Z"
  }
}
```

### Permissions

- **Read**: 
  - Students: Only activities from their department/semester/section
  - CRs: Only activities from their department/semester/section
  - Faculty: All activities from their department
  - Admins: All activities
- **Create**: All authenticated users can create activity records
- **Update**: Not allowed (activity logs are immutable)
- **Delete**: Not allowed (activity logs are permanent)

### Task Status Field

The `taskStatus` field tracks the current state of a task:
- **"added"**: Task exists and is active
- **"deleted"**: Task has been deleted

When a task is deleted, a new activity record is created with `activityType: "task_deleted"` and `taskStatus: "deleted"`. The original task document in the `tasks` collection can be deleted, but the activity timeline preserves the history.

---

## Updated Firestore Security Rules

### Complete `firestore.rules` File

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isSignedIn() && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    function isCR() {
      return isSignedIn() && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isCR == true;
    }
    
    function isFaculty() {
      return isSignedIn() && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isFaculty == true;
    }
    
    function getUserDepartment() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.department;
    }
    
    function getUserSemester() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.semester;
    }
    
    function getUserSection() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.section;
    }
    
    // ============================================
    // USERS COLLECTION
    // ============================================
    
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow update: if (isOwner(userId) || isAdmin()) && (
        !request.resource.data.keys().hasAny(['noteContent']) ||
        (request.resource.data.noteContent is string && 
         request.resource.data.noteContent.size() <= 1000000)
      );
      allow delete: if false;
      
      match /completedTasks/{taskId} {
        allow read, write: if isOwner(userId);
      }
    }
    
    // ============================================
    // TASKS COLLECTION
    // ============================================
    
    match /tasks/{taskId} {
      allow read: if isSignedIn();
      
      allow create: if isSignedIn() && 
        request.resource.data.addedBy == request.auth.uid;
      
      allow update: if isSignedIn() && (
        isAdmin() || 
        isFaculty() && resource.data.addedBy == request.auth.uid ||
        resource.data.addedBy == request.auth.uid
      );
      
      allow delete: if isSignedIn() && (
        isAdmin() || 
        isCR() ||
        isFaculty() && resource.data.addedBy == request.auth.uid ||
        resource.data.addedBy == request.auth.uid
      );
    }
    
    // ============================================
    // EVENTS COLLECTION
    // ============================================
    
    function hasRequiredEventFields() {
      return request.resource.data.keys().hasAll(['title', 'description', 'date', 'department', 'semester', 'createdBy']) &&
        request.resource.data.title is string && request.resource.data.title.size() > 0 &&
        request.resource.data.description is string && request.resource.data.description.size() > 0 &&
        request.resource.data.department is string && request.resource.data.department.size() > 0 &&
        request.resource.data.semester is string && request.resource.data.semester.size() > 0 &&
        request.resource.data.createdBy is string && request.resource.data.createdBy.size() > 0;
    }
    
    match /events/{eventId} {
      allow read: if isSignedIn();
      
      allow create: if isAdmin() || (
        isCR() && 
        request.resource.data.createdBy == request.auth.uid &&
        request.resource.data.semester == getUserSemester() &&
        hasRequiredEventFields()
      ) || (
        isFaculty() &&
        request.resource.data.createdBy == request.auth.uid &&
        request.resource.data.department == getUserDepartment() &&
        hasRequiredEventFields()
      );
      
      allow update: if isAdmin() || (
        isCR() && 
        resource.data.createdBy == request.auth.uid &&
        request.resource.data.createdBy == resource.data.createdBy &&
        (!request.resource.data.keys().hasAny(['semester']) || request.resource.data.semester == getUserSemester())
      ) || (
        isFaculty() &&
        resource.data.createdBy == request.auth.uid &&
        request.resource.data.createdBy == resource.data.createdBy
      );
      
      allow delete: if isAdmin() || (
        isCR() && 
        resource.data.createdBy == request.auth.uid
      ) || (
        isFaculty() &&
        resource.data.createdBy == request.auth.uid
      );
    }
    
    // ============================================
    // CR NOTICES COLLECTION (NEW)
    // ============================================
    
    function hasRequiredNoticeFields() {
      return request.resource.data.keys().hasAll(['title', 'description', 'department', 'semester', 'section', 'createdBy', 'priority']) &&
        request.resource.data.title is string && 
        request.resource.data.title.size() > 0 && 
        request.resource.data.title.size() <= 200 &&
        request.resource.data.description is string && 
        request.resource.data.description.size() > 0 && 
        request.resource.data.description.size() <= 2000 &&
        request.resource.data.department is string && request.resource.data.department.size() > 0 &&
        request.resource.data.semester is string && request.resource.data.semester.size() > 0 &&
        request.resource.data.section is string && request.resource.data.section.size() > 0 &&
        request.resource.data.createdBy is string && request.resource.data.createdBy.size() > 0 &&
        request.resource.data.priority in ['normal', 'important', 'urgent'];
    }
    
    match /cr_notices/{noticeId} {
      // Read: All authenticated users can read notices for their department/semester/section
      allow read: if isSignedIn() && (
        isAdmin() ||
        (resource.data.department == getUserDepartment() &&
         resource.data.semester == getUserSemester() &&
         resource.data.section == getUserSection())
      );
      
      // Create: Only CRs can create notices for their own section
      allow create: if isCR() && 
        request.resource.data.createdBy == request.auth.uid &&
        request.resource.data.department == getUserDepartment() &&
        request.resource.data.semester == getUserSemester() &&
        request.resource.data.section == getUserSection() &&
        hasRequiredNoticeFields();
      
      // Update: Only the CR who created the notice can update it
      allow update: if isCR() && 
        resource.data.createdBy == request.auth.uid &&
        request.resource.data.createdBy == resource.data.createdBy &&
        request.resource.data.department == resource.data.department &&
        request.resource.data.semester == resource.data.semester &&
        request.resource.data.section == resource.data.section;
      
      // Delete: Only the CR who created the notice OR admins can delete it
      allow delete: if isAdmin() || (
        isCR() && 
        resource.data.createdBy == request.auth.uid
      );
    }
    
    // ============================================
    // ACTIVITY TIMELINE COLLECTION (NEW)
    // ============================================
    
    match /activity_timeline/{activityId} {
      // Read: Role-based access
      allow read: if isSignedIn() && (
        isAdmin() ||
        (isFaculty() && resource.data.department == getUserDepartment()) ||
        (isCR() && 
         resource.data.department == getUserDepartment() &&
         resource.data.semester == getUserSemester() &&
         resource.data.section == getUserSection()) ||
        (resource.data.department == getUserDepartment() &&
         resource.data.semester == getUserSemester() &&
         resource.data.section == getUserSection())
      );
      
      // Create: All authenticated users can create activity records
      allow create: if isSignedIn() && 
        request.resource.data.userId == request.auth.uid &&
        request.resource.data.keys().hasAll(['activityType', 'timestamp', 'userId', 'userName', 'userRole']);
      
      // Update & Delete: Not allowed (activity logs are immutable)
      allow update: if false;
      allow delete: if false;
    }
    
    // ============================================
    // OTHER COLLECTIONS
    // ============================================
    
    match /resourceLinks/{department} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
    
    match /metadata/{document=**} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
    
    match /facultyTokens/{facultyId} {
      allow read: if isOwner(facultyId) || isAdmin();
      allow write: if isOwner(facultyId) || isAdmin();
      allow delete: if isOwner(facultyId) || isAdmin();
    }
    
    match /adminLogs/{logId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // Legacy activity_logs collection (keep for backward compatibility)
    match /activity_logs/{logId} {
      allow read: if isAdmin();
      allow create: if isSignedIn();
      allow update, delete: if false;
    }
  }
}
```

---

## Firestore Indexes

### Required Composite Indexes

Add these indexes in Firebase Console → Firestore → Indexes:

#### CR Notices Indexes

```
Collection: cr_notices
Fields:
1. department (Ascending), semester (Ascending), section (Ascending), createdAt (Descending)
2. department (Ascending), semester (Ascending), section (Ascending), priority (Ascending), createdAt (Descending)
3. createdBy (Ascending), createdAt (Descending)
4. isActive (Ascending), department (Ascending), semester (Ascending), section (Ascending), createdAt (Descending)
```

#### Activity Timeline Indexes

```
Collection: activity_timeline
Fields:
1. timestamp (Descending), department (Ascending), semester (Ascending), section (Ascending)
2. timestamp (Descending), activityType (Ascending)
3. timestamp (Descending), userRole (Ascending)
4. department (Ascending), semester (Ascending), section (Ascending), timestamp (Descending)
5. userId (Ascending), timestamp (Descending)
6. taskId (Ascending), timestamp (Descending)
7. activityType (Ascending), timestamp (Descending), department (Ascending)
```

### Creating Indexes via Firebase Console

1. Go to Firebase Console → Your Project
2. Navigate to Firestore Database → Indexes tab
3. Click "Add Index"
4. Select collection name
5. Add fields with their sort order (Ascending/Descending)
6. Click "Create Index"
7. Wait for index to build (can take several minutes)

### Creating Indexes via Firebase CLI

Create a file `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "cr_notices",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "department", "order": "ASCENDING" },
        { "fieldPath": "semester", "order": "ASCENDING" },
        { "fieldPath": "section", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "cr_notices",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "department", "order": "ASCENDING" },
        { "fieldPath": "semester", "order": "ASCENDING" },
        { "fieldPath": "section", "order": "ASCENDING" },
        { "fieldPath": "priority", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "activity_timeline",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "timestamp", "order": "DESCENDING" },
        { "fieldPath": "department", "order": "ASCENDING" },
        { "fieldPath": "semester", "order": "ASCENDING" },
        { "fieldPath": "section", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "activity_timeline",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "timestamp", "order": "DESCENDING" },
        { "fieldPath": "activityType", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "activity_timeline",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "department", "order": "ASCENDING" },
        { "fieldPath": "semester", "order": "ASCENDING" },
        { "fieldPath": "section", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

---

## Data Migration

### Migrating Existing Tasks to Activity Timeline

Since you want to track task additions and deletions in the activity timeline, you'll need to create activity records for existing tasks.

#### Migration Script (Run Once)

Create a file `migrate-tasks-to-timeline.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateTasksToTimeline() {
  console.log('Starting migration...');
  
  const tasksSnapshot = await db.collection('tasks').get();
  const batch = db.batch();
  let count = 0;
  
  for (const taskDoc of tasksSnapshot.docs) {
    const task = taskDoc.data();
    
    // Create activity record for task addition
    const activityRef = db.collection('activity_timeline').doc();
    batch.set(activityRef, {
      activityType: 'task_added',
      timestamp: task.createdAt || admin.firestore.FieldValue.serverTimestamp(),
      userId: task.addedBy || 'unknown',
      userName: task.addedByName || 'Unknown User',
      userRole: task.addedByRole || 'Student',
      department: task.department || null,
      semester: task.semester || null,
      section: task.section || null,
      taskId: taskDoc.id,
      taskTitle: task.title || 'Untitled Task',
      taskType: task.type || 'other',
      taskCourse: task.course || 'Unknown Course',
      taskStatus: 'added',
      eventId: null,
      noticeId: null,
      metadata: {
        deadline: task.deadline ? task.deadline.toDate().toISOString() : null,
        migratedFrom: 'tasks_collection'
      }
    });
    
    count++;
    
    // Commit batch every 500 documents
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`Migrated ${count} tasks...`);
    }
  }
  
  // Commit remaining documents
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`Migration complete! Migrated ${count} tasks.`);
}

migrateTasksToTimeline()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
```

#### Running the Migration

1. Install Firebase Admin SDK:
```bash
npm install firebase-admin
```

2. Download service account key from Firebase Console:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `serviceAccountKey.json`

3. Run migration script:
```bash
node migrate-tasks-to-timeline.js
```

---

## Testing the Setup

### Test CR Notices

1. **Create a test CR user**:
   - Set `isCR: true` in user document
   - Set department, semester, section

2. **Test creating a notice**:
```javascript
const notice = {
  title: "Test Notice",
  description: "This is a test notice",
  department: "CSE",
  semester: "Spring 2026",
  section: "A",
  createdBy: "user123",
  createdByName: "John Doe",
  priority: "normal",
  isActive: true,
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  attachmentUrl: null,
  attachmentName: null,
  viewCount: 0
};

await db.collection('cr_notices').add(notice);
```

3. **Test reading notices**:
```javascript
const notices = await db.collection('cr_notices')
  .where('department', '==', 'CSE')
  .where('semester', '==', 'Spring 2026')
  .where('section', '==', 'A')
  .orderBy('createdAt', 'desc')
  .get();
```

### Test Activity Timeline

1. **Create a test activity**:
```javascript
const activity = {
  activityType: 'task_added',
  timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  userId: 'user123',
  userName: 'John Doe',
  userRole: 'Student',
  department: 'CSE',
  semester: 'Spring 2026',
  section: 'A',
  taskId: 'task_456',
  taskTitle: 'Assignment 1',
  taskType: 'assignment',
  taskCourse: 'CSE301',
  taskStatus: 'added',
  eventId: null,
  noticeId: null,
  metadata: {}
};

await db.collection('activity_timeline').add(activity);
```

2. **Test reading activities**:
```javascript
const activities = await db.collection('activity_timeline')
  .where('department', '==', 'CSE')
  .where('semester', '==', 'Spring 2026')
  .where('section', '==', 'A')
  .orderBy('timestamp', 'desc')
  .limit(50)
  .get();
```

---

## Summary

### What You Need to Do

1. **Update Firestore Rules**:
   - Copy the complete rules from this document
   - Paste into Firebase Console → Firestore → Rules
   - Publish the rules

2. **Create Indexes**:
   - Either manually in Firebase Console
   - Or use `firestore.indexes.json` and deploy via CLI

3. **Run Migration** (Optional):
   - If you want to populate activity timeline with existing tasks
   - Run the migration script once

4. **Test**:
   - Create test documents in both collections
   - Verify permissions work correctly
   - Test queries with different user roles

### Next Steps

After setting up the database:
1. Implement CR Notices UI (Task 3)
2. Implement Activity Timeline UI (from spec)
3. Add activity logging to all user actions
4. Test end-to-end functionality

---

## Date: February 18, 2026
