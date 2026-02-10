// ============================================
// DATABASE MODULE
// ============================================

const DB = {
  // User operations
  async createUserProfile(userId, data) {
    try {
      await db.collection('users').doc(userId).set({
        email: data.email,
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
        .orderBy('deadline', 'asc')
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
      if (doc.exists) {
        const sections = doc.data();
        const key = `${department}-${semester}`;
        return { success: true, data: sections[key] || ['A1', 'A2'] };
      }
      return { success: true, data: ['A1', 'A2'] };
    } catch (error) {
      console.error('Error getting sections:', error);
      return { success: false, error: error.message };
    }
  }
};
