# Requirements Document

## Introduction

This specification addresses a bug in the Firebase Firestore security rules that prevents users with the "CR" (Class Representative) role from adding events. The fix will enable CR users to create, edit, and delete events for their own semester while maintaining appropriate security boundaries.

## Glossary

- **CR**: Class Representative - a user role with elevated permissions for managing events within their assigned semester
- **Event**: A Firestore document containing information about an event (title, description, date, department, semester, createdBy, etc.)
- **Firestore_Rules**: Firebase security rules that control read/write access to Firestore collections
- **Semester**: A time period identifier that groups events and associates them with specific CR users
- **Student**: A basic user role with read-only access to events
- **Admin**: A user role with full permissions across all events and semesters

## Requirements

### Requirement 1: CR Event Creation

**User Story:** As a CR user, I want to add events for my semester, so that I can manage events relevant to my class.

#### Acceptance Criteria

1. WHEN a CR user attempts to create an event, THE Firestore_Rules SHALL allow the creation if the event's semester matches the CR user's assigned semester
2. WHEN a CR user attempts to create an event with a semester different from their assigned semester, THE Firestore_Rules SHALL deny the creation
3. WHEN a CR user creates an event, THE Firestore_Rules SHALL require the createdBy field to be set to the CR user's ID
4. WHEN a CR user creates an event, THE Firestore_Rules SHALL require all mandatory event fields (title, description, date, department, semester, createdBy) to be present

### Requirement 2: CR Event Editing

**User Story:** As a CR user, I want to edit events that I created, so that I can update event information as needed.

#### Acceptance Criteria

1. WHEN a CR user attempts to edit an event, THE Firestore_Rules SHALL allow the edit if the event was created by that CR user
2. WHEN a CR user attempts to edit an event created by another user, THE Firestore_Rules SHALL deny the edit
3. WHEN a CR user edits an event, THE Firestore_Rules SHALL prevent modification of the createdBy field
4. WHEN a CR user edits an event, THE Firestore_Rules SHALL prevent modification of the semester field to a different semester than the CR user's assigned semester

### Requirement 3: CR Event Deletion

**User Story:** As a CR user, I want to delete events that I created, so that I can remove outdated or incorrect events.

#### Acceptance Criteria

1. WHEN a CR user attempts to delete an event, THE Firestore_Rules SHALL allow the deletion if the event was created by that CR user
2. WHEN a CR user attempts to delete an event created by another user, THE Firestore_Rules SHALL deny the deletion

### Requirement 4: Role-Based Access Control

**User Story:** As a system administrator, I want to maintain proper access control boundaries, so that users can only perform actions appropriate to their role.

#### Acceptance Criteria

1. WHEN a Student user attempts to create, edit, or delete an event, THE Firestore_Rules SHALL deny the operation
2. WHEN an Admin user attempts to create, edit, or delete any event, THE Firestore_Rules SHALL allow the operation regardless of semester or creator
3. WHEN an unauthenticated user attempts to create, edit, or delete an event, THE Firestore_Rules SHALL deny the operation
4. THE Firestore_Rules SHALL allow all authenticated users to read events

### Requirement 5: Data Integrity

**User Story:** As a system administrator, I want to ensure data integrity in event documents, so that the system remains consistent and secure.

#### Acceptance Criteria

1. WHEN any user creates or updates an event, THE Firestore_Rules SHALL validate that the semester field is a non-empty string
2. WHEN any user creates or updates an event, THE Firestore_Rules SHALL validate that the createdBy field matches a valid user ID format
3. WHEN any user creates an event, THE Firestore_Rules SHALL validate that required fields (title, description, date, department, semester, createdBy) are present and non-empty
4. WHEN any user updates an event, THE Firestore_Rules SHALL prevent the addition of unexpected or malicious fields beyond the defined schema
