/**
 * ActivityLogger Module
 * 
 * Handles logging of user activities to Firestore for the Timeline View.
 * Captures task operations, event operations, and user registration w/ metadata.
 */

class ActivityLogger {
  static COLLECTION_NAME = 'activity_logs'; // Using 'activity_logs' as per user request
  static COLLECTION = 'activity_logs';

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
   * Log CR notice addition
   * @param {string} noticeId 
   * @param {Object} noticeData 
   * @param {Object} userProfile 
   */
  static async logNoticeAddition(noticeId, noticeData, userProfile) {
    await this.logActivity('notice_added', {
      userId: noticeData.createdBy,
      userRole: this._determineRole(userProfile),
      department: noticeData.department,
      semester: noticeData.semester,
      section: noticeData.section,
      noticeId: noticeId,
      extras: {
        title: noticeData.title,
        priority: noticeData.priority
      }
    });
  }

  /**
   * Log CR notice deletion
   * @param {string} noticeId 
   * @param {Object} noticeData 
   * @param {string} userId 
   * @param {Object} userProfile 
   */
  static async logNoticeDeletion(noticeId, noticeData, userId, userProfile) {
    await this.logActivity('notice_deleted', {
      userId: userId,
      userRole: this._determineRole(userProfile),
      department: noticeData.department,
      semester: noticeData.semester,
      section: noticeData.section,
      noticeId: noticeId,
      extras: {
        title: noticeData.title
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

  /**
   * Backpopulate activity logs from existing tasks
   * RUN THIS ONCE from console: await ActivityLogger.backpopulateTasks()
   */
  static async backpopulateTasks() {
    console.log('[ActivityLogger] Starting backpopulation...');
    const db = firebase.firestore();

    try {
      const snapshot = await db.collection('tasks').get();
      console.log(`[ActivityLogger] Found ${snapshot.size} tasks to process.`);

      let count = 0;
      const batchSize = 50;
      let batch = db.batch();

      for (const doc of snapshot.docs) {
        const task = doc.data();

        // Use createdAt or fallback to deadline - 1 day, or now
        let timestamp;
        if (task.createdAt) {
          timestamp = task.createdAt;
        } else if (task.deadline) {
          // Attempt to parse deadline
          try {
            // If deadline is a string "YYYY-MM-DD", convert to date and subtract 1 day
            const d = new Date(task.deadline);
            if (!isNaN(d.getTime())) {
              d.setDate(d.getDate() - 1);
              timestamp = firebase.firestore.Timestamp.fromDate(d);
            } else {
              timestamp = firebase.firestore.FieldValue.serverTimestamp();
            }
          } catch (e) {
            timestamp = firebase.firestore.FieldValue.serverTimestamp();
          }
        } else {
          timestamp = firebase.firestore.FieldValue.serverTimestamp();
        }

        const logRef = db.collection(this.COLLECTION).doc(); // Auto-ID
        const activityData = {
          activityType: 'task_added',
          timestamp: timestamp,
          userId: task.addedBy || 'system',
          userName: task.addedByName || 'System',
          userRole: 'Student', // Default/Unknown
          department: task.department || null,
          semester: task.semester || null,
          section: task.section || null,
          taskId: doc.id,
          taskTitle: task.title || 'Untitled Task',
          taskType: task.type || 'Other',
          taskCourse: task.course || 'General',
          taskStatus: 'added',
          metadata: {
            migrated: true,
            deadline: task.deadline
          }
        };

        batch.set(logRef, activityData);
        count++;

        // Commit batches of 50
        if (count % batchSize === 0) {
          await batch.commit();
          console.log(`[ActivityLogger] Processed ${count} tasks...`);
          batch = db.batch();
        }
      }

      // Commit remaining
      if (count % batchSize !== 0) {
        await batch.commit();
      }

      console.log(`[ActivityLogger] Backpopulation complete. Processed ${count} tasks.`);
      alert(`Backpopulation complete! Processed ${count} tasks.`);

    } catch (error) {
      console.error('[ActivityLogger] Backpopulation failed:', error);
      alert('Backpopulation failed. Check console for details.');
    }
  }
}
