// ============================================
// FIRESTORE LISTENER MANAGER
// ============================================

/**
 * Sets up and manages real-time listeners on Firestore collections
 */
const FirestoreListenerManager = {
  tasksUnsubscribe: null,
  eventsUnsubscribe: null,
  isInitialized: false,
  initTimestamp: null,

  /**
   * Initializes listeners for tasks and events
   * @param {object} userProfile - User's department, semester, section
   * @returns {Promise<{success: boolean}>}
   */
  async setupListeners(userProfile) {
    if (this.isInitialized) {
      console.log('Listeners already initialized');
      return { success: true };
    }

    const { department, semester, section } = userProfile;

    // Set up task listener
    this.tasksUnsubscribe = this.listenForNewTasks(
      department,
      semester,
      section,
      async (task) => {
        console.log('New task detected:', task.id);
        await NotificationManager.showTaskNotification(task);
      }
    );

    // Set up event listener
    this.eventsUnsubscribe = this.listenForNewEvents(
      department,
      async (event) => {
        console.log('New event detected:', event.id);
        await NotificationManager.showEventNotification(event);
      }
    );

    this.isInitialized = true;
    console.log('Firestore listeners initialized');
    
    return { success: true };
  },

  /**
   * Sets up listener for new tasks
   * @param {string} department
   * @param {string} semester
   * @param {string} section
   * @param {function} callback - Called when new task is detected
   * @returns {function} Unsubscribe function
   */
  listenForNewTasks(department, semester, section, callback) {
    let isFirstSnapshot = true;
    const sectionsInGroup = Utils.getSectionsInGroup(section);

    return db.collection('tasks')
      .where('department', '==', department)
      .where('semester', '==', semester)
      .where('section', 'in', sectionsInGroup)
      .where('status', '==', 'active')
      .onSnapshot((snapshot) => {
        if (isFirstSnapshot) {
          // Skip initial load - don't trigger notifications for existing tasks
          isFirstSnapshot = false;
          this.initTimestamp = Date.now();
          console.log('Task listener initialized, monitoring for new tasks');
          return;
        }

        // Process only added documents
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const task = { id: change.doc.id, ...change.doc.data() };
            callback(task);
          }
        });
      }, (error) => {
        console.error('Task listener error:', error);
        if (error.code === 'unavailable') {
          console.log('Firestore temporarily unavailable, will auto-reconnect');
        }
      });
  },

  /**
   * Sets up listener for new events
   * @param {string} department
   * @param {function} callback - Called when new event is detected
   * @returns {function} Unsubscribe function
   */
  listenForNewEvents(department, callback) {
    let isFirstSnapshot = true;

    return db.collection('events')
      .where('department', 'in', [department, 'ALL'])
      .orderBy('date', 'desc')
      .onSnapshot((snapshot) => {
        if (isFirstSnapshot) {
          // Skip initial load - don't trigger notifications for existing events
          isFirstSnapshot = false;
          console.log('Event listener initialized, monitoring for new events');
          return;
        }

        // Process only added documents
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const event = { id: change.doc.id, ...change.doc.data() };
            callback(event);
          }
        });
      }, (error) => {
        console.error('Event listener error:', error);
        if (error.code === 'unavailable') {
          console.log('Firestore temporarily unavailable, will auto-reconnect');
        }
      });
  },

  /**
   * Removes all active listeners
   */
  unsubscribeAll() {
    if (this.tasksUnsubscribe) {
      this.tasksUnsubscribe();
      this.tasksUnsubscribe = null;
      console.log('Task listener unsubscribed');
    }

    if (this.eventsUnsubscribe) {
      this.eventsUnsubscribe();
      this.eventsUnsubscribe = null;
      console.log('Event listener unsubscribed');
    }

    this.isInitialized = false;
    this.initTimestamp = null;
    console.log('All Firestore listeners unsubscribed');
  }
};
