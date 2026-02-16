// ============================================
// NOTIFICATION TYPES AND INTERFACES
// ============================================

/**
 * @typedef {Object} NotificationData
 * @property {string} title - Notification title
 * @property {string} body - Notification body text
 * @property {string} icon - Icon URL
 * @property {string} [badge] - Badge icon URL (optional)
 * @property {string} tag - Unique tag to prevent duplicates
 * @property {boolean} requireInteraction - Keep notification visible
 * @property {NotificationMetadata} data - Additional metadata
 */

/**
 * @typedef {Object} NotificationMetadata
 * @property {string} type - 'task' or 'event'
 * @property {string} id - Document ID
 * @property {number} timestamp - Creation timestamp
 */

/**
 * @typedef {Object} PermissionState
 * @property {string} state - 'granted', 'denied', or 'default'
 * @property {number} [requestedAt] - Timestamp of last request
 * @property {number} [grantedAt] - Timestamp when granted
 * @property {number} [deniedAt] - Timestamp when denied
 */

/**
 * @typedef {Object} ListenerState
 * @property {Function} [tasksUnsubscribe] - Unsubscribe function for tasks listener
 * @property {Function} [eventsUnsubscribe] - Unsubscribe function for events listener
 * @property {boolean} isActive - Whether listeners are active
 * @property {number} [lastTaskTimestamp] - Timestamp of last processed task
 * @property {number} [lastEventTimestamp] - Timestamp of last processed event
 */

/**
 * @typedef {Object} TaskDocument
 * @property {string} id - Task document ID
 * @property {string} title - Task title
 * @property {string} course - Course name
 * @property {string} type - Task type (assignment, quiz, exam, etc.)
 * @property {string} [description] - Task description
 * @property {Date|firebase.firestore.Timestamp} [deadline] - Task deadline
 * @property {string} department - Department
 * @property {string} [semester] - Semester
 * @property {string} [section] - Section
 * @property {string} addedBy - User ID who added the task
 * @property {Date|firebase.firestore.Timestamp} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} EventDocument
 * @property {string} id - Event document ID
 * @property {string} title - Event title
 * @property {string} [description] - Event description
 * @property {Date|firebase.firestore.Timestamp} date - Event date/time
 * @property {string} department - Department ('ALL' for all departments)
 * @property {string} createdBy - User ID who created the event
 * @property {Date|firebase.firestore.Timestamp} createdAt - Creation timestamp
 */

// Export empty object to make this a module
export {};
