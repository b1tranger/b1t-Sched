// ============================================
// ACTIVITY LOGGER MODULE
// ============================================

const ActivityLogger = {
  /**
   * Core method to log any activity to Firestore
   * @param {string} activityType - Type of activity (task_addition, task_completion, etc.)
   * @param {Object} metadata - Activity metadata
   * @returns {Promise<void>}
   */
  async logActivity(activityType, metadata) {
    try {
      // Extract user name from email (before @ symbol)
      const userName = metadata.userEmail ? metadata.userEmail.split('@')[0] : 'Unknown';

      // Prepare activity log document
      const activityLog = {
        activityType: activityType,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userId: metadata.userId || null,
        userName: userName,
        userRole: metadata.userRole || 'Student',
        department: metadata.department || null,
        semester: metadata.semester || null,
        section: metadata.section || null,
        taskId: metadata.taskId || null,
        eventId: metadata.eventId || null,
        taskType: metadata.taskType || null,
        metadata: metadata.additionalData || null
      };

      // Write to Firestore activity_logs collection
      await db.collection('activity_logs').add(activityLog);
      
      console.log(`Activity logged: ${activityType}`, activityLog);
    } catch (error) {
      // Silent failure - don't interrupt primary action
      console.error('Failed to log activity (non-critical):', error);
    }
  },

  /**
   * Log task addition activity
   * @param {string} taskId - Task document ID
   * @param {Object} taskData - Task data including department, semester, section
   * @param {string} userId - User who added the task
   * @param {string} userEmail - User's email
   * @param {string} userRole - User's role (Student, CR, Faculty, Admin)
   * @returns {Promise<void>}
   */
  async logTaskAddition(taskId, taskData, userId, userEmail, userRole) {
    await this.logActivity('task_addition', {
      userId: userId,
      userEmail: userEmail,
      userRole: userRole,
      department: taskData.department,
      semester: taskData.semester,
      section: taskData.section,
      taskId: taskId,
      taskType: taskData.type
    });
  },

  /**
   * Log task completion activity
   * @param {string} taskId - Task document ID
   * @param {string} userId - User who completed the task
   * @param {string} userEmail - User's email
   * @param {string} userRole - User's role
   * @returns {Promise<void>}
   */
  async logTaskCompletion(taskId, userId, userEmail, userRole) {
    await this.logActivity('task_completion', {
      userId: userId,
      userEmail: userEmail,
      userRole: userRole,
      taskId: taskId
    });
  },

  /**
   * Log event addition activity
   * @param {string} eventId - Event document ID
   * @param {Object} eventData - Event data
   * @param {string} userId - User who added the event
   * @param {string} userEmail - User's email
   * @param {string} userRole - User's role
   * @returns {Promise<void>}
   */
  async logEventAddition(eventId, eventData, userId, userEmail, userRole) {
    await this.logActivity('event_addition', {
      userId: userId,
      userEmail: userEmail,
      userRole: userRole,
      department: eventData.department,
      semester: eventData.semester,
      section: null, // Events don't have sections
      eventId: eventId
    });
  },

  /**
   * Log user registration activity
   * @param {string} userId - User ID
   * @param {Object} userProfile - User profile data
   * @param {string} userEmail - User's email
   * @returns {Promise<void>}
   */
  async logUserRegistration(userId, userProfile, userEmail) {
    await this.logActivity('user_registration', {
      userId: userId,
      userEmail: userEmail,
      userRole: 'Student', // New users are always students initially
      department: userProfile.department,
      semester: userProfile.semester,
      section: userProfile.section
    });
  },

  /**
   * Log task deletion activity
   * @param {string} taskId - Task document ID
   * @param {string} userId - User who deleted the task
   * @param {string} userEmail - User's email
   * @param {string} userRole - User's role
   * @returns {Promise<void>}
   */
  async logTaskDeletion(taskId, userId, userEmail, userRole) {
    await this.logActivity('task_deletion', {
      userId: userId,
      userEmail: userEmail,
      userRole: userRole,
      taskId: taskId
    });
  },

  /**
   * Log event deletion activity
   * @param {string} eventId - Event document ID
   * @param {string} userId - User who deleted the event
   * @param {string} userEmail - User's email
   * @param {string} userRole - User's role
   * @returns {Promise<void>}
   */
  async logEventDeletion(eventId, userId, userEmail, userRole) {
    await this.logActivity('event_deletion', {
      userId: userId,
      userEmail: userEmail,
      userRole: userRole,
      eventId: eventId
    });
  }
};
