/**
 * ActivityLogger Module
 * 
 * Handles logging of user activities to Firestore for the Timeline View.
 * Captures task operations, event operations, and user registration w/ metadata.
 */

class ActivityLogger {
  static COLLECTION_NAME = 'activity_lines'; // Using 'activity_lines' as per user request/convention, or 'activity_logs'? 
  // Spec says 'activity_logs' or 'activity_timeline'. 
  // FIREBASE_DATABASE_SETUP_INSTRUCTIONS.md says 'activity_timeline'.
  // Requirements.md says 'activity_logs'.
  // I will use 'activity_timeline' to match the setup instructions I just followed for indexes.

  static COLLECTION = 'activity_timeline';

  /**
   * Log a generic activity
   * @param {string} activityType - Type of activity
   * @param {Object} metadata - Activity metadata
   */
  static async logActivity(activityType, metadata) {
    try {
      if (!firebase || !firebase.firestore) {
        console.error('ActivityLogger: Firebase not initialized');
        return;
      }

      const db = firebase.firestore();
      const timestamp = firebase.firestore.FieldValue.serverTimestamp();

      // Ensure we have a valid userId
      const user = firebase.auth().currentUser;
      const userId = metadata.userId || (user ? user.uid : 'unknown');
      const userEmail = user ? user.email : 'unknown';

      // Extract display name from email if not provided
      const userName = metadata.userName || (userEmail.split('@')[0]);

      const activityData = {
        activityType,
        timestamp,
        userId,
        userName,
        userRole: metadata.userRole || 'Student',

        // Context metadata
        department: metadata.department || null,
        semester: metadata.semester || null,
        section: metadata.section || null,

        // Related entity IDs
        taskId: metadata.taskId || null,
        eventId: metadata.eventId || null,
        noticeId: metadata.noticeId || null,

        // Task specific
        taskTitle: metadata.taskTitle || null,
        taskType: metadata.taskType || null,
        taskCourse: metadata.taskCourse || null,
        taskStatus: metadata.taskStatus || null, // 'added', 'deleted', 'completed'

        // Generic metadata map for extras
        metadata: metadata.extras || {}
      };

      // Remove undefined/null keys to keep it clean? No, keep nulls for structure consistency if needed
      // But Firestore handles missing fields fine.

      await db.collection(this.COLLECTION).add(activityData);
      console.log(`[ActivityLogger] Logged ${activityType}:`, activityData);

    } catch (error) {
      // deeply silent catch to not disrupt main flow, but log to console
      console.error('[ActivityLogger] Failed to log activity:', error);
    }
  }

  /**
   * Log task addition
   * @param {string} taskId 
   * @param {Object} taskData 
   * @param {Object} userProfile 
   */
  static async logTaskAddition(taskId, taskData, userProfile) {
    // userProfile is needed to get Role/Department if not in taskData
    await this.logActivity('task_added', {
      userId: taskData.addedBy,
      userName: taskData.addedByName, // or extract from email
      userRole: this._determineRole(userProfile),
      department: taskData.department,
      semester: taskData.semester,
      section: taskData.section,
      taskId: taskId,
      taskTitle: taskData.title,
      taskType: taskData.type,
      taskCourse: taskData.course,
      taskStatus: 'added',
      extras: {
        deadline: taskData.deadline
      }
    });
  }

  /**
   * Log task completion
   * @param {string} taskId 
   * @param {Object} taskData - We usually need to fetch this or pass it in
   * @param {string} userId 
   * @param {Object} userProfile 
   */
  static async logTaskCompletion(taskId, taskData, userId, userProfile) {
    await this.logActivity('task_completed', {
      userId: userId,
      userRole: this._determineRole(userProfile),
      // We typically want the task's context (dept/sem) or the USER's context?
      // For completion, it's the user's interaction.
      department: userProfile.department,
      semester: userProfile.semester,
      section: userProfile.section,
      taskId: taskId,
      taskTitle: taskData.title,
      taskType: taskData.type,
      taskCourse: taskData.course
    });
  }

  /**
   * Log task deletion
  * @param {string} taskId 
   * @param {Object} taskData 
   * @param {string} userId 
   * @param {Object} userProfile 
   */
  static async logTaskDeletion(taskId, taskData, userId, userProfile) {
    await this.logActivity('task_deleted', {
      userId: userId,
      userRole: this._determineRole(userProfile),
      department: taskData.department,
      semester: taskData.semester,
      section: taskData.section,
      taskId: taskId,
      taskTitle: taskData.title,
      taskType: taskData.type,
      taskCourse: taskData.course,
      taskStatus: 'deleted'
    });
  }

  /**
   * Log event addition
   * @param {string} eventId 
   * @param {Object} eventData 
   * @param {Object} userProfile 
   */
  static async logEventAddition(eventId, eventData, userProfile) {
    await this.logActivity('event_added', {
      userId: eventData.createdBy,
      userRole: this._determineRole(userProfile),
      department: eventData.department,
      semester: eventData.semester, // Event might not have semester if Dept wide
      section: null, // Events are usually dept/sem wide
      eventId: eventId,
      extras: {
        title: eventData.title,
        date: eventData.date
      }
    });
  }

  /**
   * Log event deletion
   * @param {string} eventId 
   * @param {Object} eventData 
   * @param {string} userId 
   * @param {Object} userProfile 
   */
  static async logEventDeletion(eventId, eventData, userId, userProfile) {
    await this.logActivity('event_deleted', {
      userId: userId,
      userRole: this._determineRole(userProfile),
      department: eventData.department,
      semester: eventData.semester,
      eventId: eventId,
      extras: {
        title: eventData.title
      }
    });
  }

  /**
   * Helper to determine role from profile
   * @param {Object} profile 
   */
  static _determineRole(profile) {
    if (!profile) return 'Student'; // Default
    if (profile.isAdmin) return 'Admin';
    if (profile.isFaculty) return 'Faculty';
    if (profile.isCR) return 'CR';
    return 'Student';
  }
}
