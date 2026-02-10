// ============================================
// DATABASE MODULE
// ============================================

const DB = {
  // User operations
  async createUserProfile(userId, data) {
    try {
      await db.collection('users').doc(userId).set({
        email: data.email,
        studentId: data.studentId,
        department: data.department,
        semester: data.semester,
        section: data.section,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('User profile created');
      return { success: true };
    } catch (error) {
      console.error('Error creating user profile:', error);
      return { success: false, error: error.message };
    }
  },

  async getUserProfile(userId) {
    try {
      const doc = await db.collection('users').doc(userId).get();
      if (doc.exists) {
        return { success: true, data: doc.data() };
      } else {
        return { success: false, error: 'User profile not found' };
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      return { success: false, error: error.message };
    }
  },

  async updateUserProfile(userId, data) {
    try {
      await db.collection('users').doc(userId).update({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('User profile updated');
      return { success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }
  },

  // Task operations
  async getTasks(department, semester, section) {
    try {
      const snapshot = await db.collection('tasks')
        .where('department', '==', department)
        .where('semester', '==', semester)
        .where('section', '==', section)
        .where('status', '==', 'active')
        .get();
      
      const tasks = [];
      snapshot.forEach(doc => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`Found ${tasks.length} tasks`);
      return { success: true, data: tasks };
    } catch (error) {
      console.error('Error getting tasks:', error);
      return { success: false, error: error.message };
    }
  },

  // Create a new task (user-added)
  async createTask(userId, userEmail, data) {
    try {
      const docRef = await db.collection('tasks').add({
        title: data.title,
        course: data.course || '',
        type: data.type || 'assignment',
        description: data.description || '',
        department: data.department,
        semester: data.semester,
        section: data.section,
        deadline: firebase.firestore.Timestamp.fromDate(new Date(data.deadline)),
        status: 'active',
        addedBy: userId,
        addedByName: userEmail.split('@')[0],
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('Task created:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating task:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user's task completions
  async getUserTaskCompletions(userId) {
    try {
      const snapshot = await db.collection('users').doc(userId)
        .collection('completedTasks').get();
      
      const completions = {};
      snapshot.forEach(doc => {
        completions[doc.id] = doc.data();
      });
      
      return { success: true, data: completions };
    } catch (error) {
      console.error('Error getting task completions:', error);
      return { success: false, error: error.message };
    }
  },

  // Toggle task completion for a user
  async toggleTaskCompletion(userId, taskId, isCompleted) {
    try {
      const completionRef = db.collection('users').doc(userId)
        .collection('completedTasks').doc(taskId);
      
      if (isCompleted) {
        await completionRef.set({
          completedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } else {
        await completionRef.delete();
      }
      
      console.log(`Task ${taskId} completion toggled to ${isCompleted}`);
      return { success: true };
    } catch (error) {
      console.error('Error toggling task completion:', error);
      return { success: false, error: error.message };
    }
  },

  // Get old/completed tasks
  async getOldTasks(userId, department, semester, section) {
    try {
      // Get user's completed task IDs
      const completionsSnapshot = await db.collection('users').doc(userId)
        .collection('completedTasks').get();
      
      const completedTaskIds = [];
      const completionDates = {};
      completionsSnapshot.forEach(doc => {
        completedTaskIds.push(doc.id);
        completionDates[doc.id] = doc.data().completedAt;
      });

      if (completedTaskIds.length === 0) {
        return { success: true, data: [] };
      }

      // Get tasks that are either:
      // 1. Completed by user and past deadline
      // 2. Status changed to 'archived' by admin
      const now = new Date();
      const tasksSnapshot = await db.collection('tasks')
        .where('department', '==', department)
        .where('semester', '==', semester)
        .where('section', '==', section)
        .get();
      
      const oldTasks = [];
      tasksSnapshot.forEach(doc => {
        const data = doc.data();
        const deadline = data.deadline ? data.deadline.toDate() : new Date();
        const isCompleted = completedTaskIds.includes(doc.id);
        
        // Include if completed and past deadline
        if (isCompleted && deadline < now) {
          oldTasks.push({
            id: doc.id,
            ...data,
            completedAt: completionDates[doc.id]
          });
        }
      });
      
      // Sort by completion date (newest first)
      oldTasks.sort((a, b) => {
        const aDate = a.completedAt ? a.completedAt.toDate() : new Date(0);
        const bDate = b.completedAt ? b.completedAt.toDate() : new Date(0);
        return bDate - aDate;
      });
      
      console.log(`Found ${oldTasks.length} old tasks`);
      return { success: true, data: oldTasks };
    } catch (error) {
      console.error('Error getting old tasks:', error);
      return { success: false, error: error.message };
    }
  },

  // Event operations
  async getEvents(department = 'ALL') {
    try {
      const now = new Date();
      let query = db.collection('events')
        .where('date', '>=', firebase.firestore.Timestamp.fromDate(now))
        .orderBy('date', 'asc')
        .limit(10);
      
      const snapshot = await query.get();
      const events = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        // Show events for specific department or ALL departments
        if (data.department === 'ALL' || data.department === department) {
          events.push({ id: doc.id, ...data });
        }
      });
      
      console.log(`Found ${events.length} events`);
      return { success: true, data: events };
    } catch (error) {
      console.error('Error getting events:', error);
      return { success: false, error: error.message };
    }
  },

  // Resource links operations
  async getResourceLinks(department) {
    try {
      const doc = await db.collection('resourceLinks').doc(department).get();
      
      if (doc.exists) {
        const data = doc.data();
        return { success: true, data: data.resources || [] };
      } else {
        console.log('No resource links found for', department);
        return { success: true, data: [] };
      }
    } catch (error) {
      console.error('Error getting resource links:', error);
      return { success: false, error: error.message };
    }
  },

  // Metadata operations
  async getDepartments() {
    try {
      const doc = await db.collection('metadata').doc('departments').get();
      if (doc.exists) {
        return { success: true, data: doc.data().list || [] };
      }
      return { success: true, data: ['CSE', 'IT', 'CE', 'EEE', 'BBA'] };
    } catch (error) {
      console.error('Error getting departments:', error);
      return { success: false, error: error.message };
    }
  },

  async getSemesters() {
    try {
      const doc = await db.collection('metadata').doc('semesters').get();
      if (doc.exists) {
        return { success: true, data: doc.data().list || [] };
      }
      return { success: true, data: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'] };
    } catch (error) {
      console.error('Error getting semesters:', error);
      return { success: false, error: error.message };
    }
  },

  async getSections(department, semester) {
    try {
      const doc = await db.collection('metadata').doc('sections').get();
      const defaultSections = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      if (doc.exists) {
        const sections = doc.data();
        const key = `${department}-${semester}`;
        return { success: true, data: sections[key] || defaultSections };
      }
      return { success: true, data: defaultSections };
    } catch (error) {
      console.error('Error getting sections:', error);
      return { success: false, error: error.message };
    }
  },

  // ============================================
  // ADMIN OPERATIONS
  // ============================================

  // Check if user is an admin (admin flag set manually in Firestore)
  async isUserAdmin(userId) {
    try {
      const doc = await db.collection('users').doc(userId).get();
      if (doc.exists) {
        return { success: true, isAdmin: doc.data().isAdmin === true };
      }
      return { success: true, isAdmin: false };
    } catch (error) {
      console.error('Error checking admin status:', error);
      return { success: false, isAdmin: false, error: error.message };
    }
  },

  // Delete a single task (admin only)
  async deleteTask(taskId) {
    try {
      await db.collection('tasks').doc(taskId).delete();
      console.log('Task deleted:', taskId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { success: false, error: error.message };
    }
  },

  // Reset (delete) all old tasks for a department/semester/section (admin only)
  async resetOldTasks(department, semester, section) {
    try {
      const now = new Date();
      const snapshot = await db.collection('tasks')
        .where('department', '==', department)
        .where('semester', '==', semester)
        .where('section', '==', section)
        .get();
      
      const batch = db.batch();
      let deletedCount = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const deadline = data.deadline ? data.deadline.toDate() : new Date();
        // Delete tasks that are past their deadline
        if (deadline < now) {
          batch.delete(doc.ref);
          deletedCount++;
        }
      });
      
      await batch.commit();
      console.log(`Reset ${deletedCount} old tasks`);
      return { success: true, deletedCount };
    } catch (error) {
      console.error('Error resetting old tasks:', error);
      return { success: false, error: error.message };
    }
  },

  // Create a new event (admin only)
  async createEvent(data) {
    try {
      const docRef = await db.collection('events').add({
        title: data.title,
        description: data.description || '',
        date: firebase.firestore.Timestamp.fromDate(new Date(data.date)),
        department: data.department || 'ALL',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: data.createdBy
      });
      console.log('Event created:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating event:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete an event (admin only)
  async deleteEvent(eventId) {
    try {
      await db.collection('events').doc(eventId).delete();
      console.log('Event deleted:', eventId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting event:', error);
      return { success: false, error: error.message };
    }
  },

  // Get old/past events
  async getOldEvents(department = 'ALL') {
    try {
      const now = new Date();
      const snapshot = await db.collection('events')
        .where('date', '<', firebase.firestore.Timestamp.fromDate(now))
        .orderBy('date', 'desc')
        .limit(20)
        .get();
      
      const events = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Show events for specific department or ALL departments
        if (data.department === 'ALL' || data.department === department) {
          events.push({ id: doc.id, ...data });
        }
      });
      
      console.log(`Found ${events.length} old events`);
      return { success: true, data: events };
    } catch (error) {
      console.error('Error getting old events:', error);
      return { success: false, error: error.message };
    }
  }
};
