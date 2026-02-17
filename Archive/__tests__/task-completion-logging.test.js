/**
 * Integration test for task completion logging
 * Tests that task completion triggers activity logging
 */

// Mock the global db and firebase objects
let mockDb;
let mockCollection;
let mockAdd;
let mockSet;
let mockDelete;
let mockFirebase;
let mockDoc;
let mockCompletionRef;

const setupMocks = () => {
  // Mock for activity log add
  mockAdd = {
    fn: null,
    mockResolvedValue: function(value) {
      this.fn = async () => value;
      return this;
    }
  };
  mockAdd.fn = async () => ({ id: 'mock-log-id' });

  // Mock for completion set
  mockSet = {
    fn: null,
    mockResolvedValue: function(value) {
      this.fn = async () => value;
      return this;
    }
  };
  mockSet.fn = async () => {};

  // Mock for completion delete
  mockDelete = {
    fn: null,
    mockResolvedValue: function(value) {
      this.fn = async () => value;
      return this;
    }
  };
  mockDelete.fn = async () => {};

  // Mock completion ref
  mockCompletionRef = {
    set: (data) => mockSet.fn(data),
    delete: () => mockDelete.fn()
  };

  // Mock doc
  mockDoc = {
    fn: null,
    mockReturnValue: function(value) {
      this.fn = () => value;
      return this;
    }
  };
  mockDoc.fn = (docId) => {
    if (docId === 'completedTasks') {
      return {
        doc: (taskId) => mockCompletionRef
      };
    }
    return {
      collection: (collectionName) => mockDoc.fn(collectionName)
    };
  };

  // Mock collection
  mockCollection = {
    fn: null,
    mockReturnValue: function(value) {
      this.fn = () => value;
      return this;
    }
  };
  mockCollection.fn = (name) => {
    if (name === 'activity_logs') {
      return { add: mockAdd.fn };
    }
    if (name === 'users') {
      return { doc: (userId) => ({ collection: mockDoc.fn }) };
    }
    return { add: mockAdd.fn };
  };

  mockDb = {
    collection: (name) => mockCollection.fn(name)
  };

  mockFirebase = {
    firestore: {
      FieldValue: {
        serverTimestamp: () => 'MOCK_TIMESTAMP'
      }
    }
  };

  global.db = mockDb;
  global.firebase = mockFirebase;
};

// Load modules
setupMocks();
const ActivityLoggerModule = await import('../js/activity-logger.js');
const ActivityLogger = ActivityLoggerModule.default || global.ActivityLogger;

// Mock DB module
const DB = {
  async toggleTaskCompletion(userId, taskId, isCompleted, userEmail = null, userRole = null) {
    try {
      const completionRef = mockCompletionRef;

      if (isCompleted) {
        await completionRef.set({
          completedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Log task completion activity
        if (userEmail && userRole) {
          await ActivityLogger.logTaskCompletion(taskId, userId, userEmail, userRole);
        }
      } else {
        await completionRef.delete();
      }

      console.log(`Task ${taskId} completion toggled to ${isCompleted}`);
      return { success: true };
    } catch (error) {
      console.error('Error toggling task completion:', error);
      return { success: false, error: error.message };
    }
  }
};

describe('Task Completion Logging Integration', () => {
  beforeEach(() => {
    setupMocks();
  });

  it('should log activity when task is marked as complete', async () => {
    const taskId = 'task123';
    const userId = 'user456';
    const userEmail = 'student@example.com';
    const userRole = 'Student';

    let activityLogData = null;
    let completionData = null;

    // Capture activity log
    mockAdd.fn = async (data) => {
      activityLogData = data;
      return { id: 'mock-log-id' };
    };

    // Capture completion data
    mockSet.fn = async (data) => {
      completionData = data;
    };

    const result = await DB.toggleTaskCompletion(userId, taskId, true, userEmail, userRole);

    expect(result.success).toBe(true);
    expect(completionData).toBeDefined();
    expect(completionData.completedAt).toBe('MOCK_TIMESTAMP');
    
    // Verify activity log was created
    expect(activityLogData).toBeDefined();
    expect(activityLogData.activityType).toBe('task_completion');
    expect(activityLogData.taskId).toBe(taskId);
    expect(activityLogData.userId).toBe(userId);
    expect(activityLogData.userName).toBe('student');
    expect(activityLogData.userRole).toBe(userRole);
  });

  it('should not log activity when task is unmarked (uncompleted)', async () => {
    const taskId = 'task123';
    const userId = 'user456';
    const userEmail = 'student@example.com';
    const userRole = 'Student';

    let activityLogCalled = false;
    let deleteCalled = false;

    mockAdd.fn = async (data) => {
      activityLogCalled = true;
      return { id: 'mock-log-id' };
    };

    mockDelete.fn = async () => {
      deleteCalled = true;
    };

    const result = await DB.toggleTaskCompletion(userId, taskId, false, userEmail, userRole);

    expect(result.success).toBe(true);
    expect(deleteCalled).toBe(true);
    expect(activityLogCalled).toBe(false); // Should not log when uncompleting
  });

  it('should work without userEmail and userRole (backward compatibility)', async () => {
    const taskId = 'task123';
    const userId = 'user456';

    let activityLogCalled = false;
    let completionData = null;

    mockAdd.fn = async (data) => {
      activityLogCalled = true;
      return { id: 'mock-log-id' };
    };

    mockSet.fn = async (data) => {
      completionData = data;
    };

    const result = await DB.toggleTaskCompletion(userId, taskId, true);

    expect(result.success).toBe(true);
    expect(completionData).toBeDefined();
    expect(activityLogCalled).toBe(false); // Should not log without email/role
  });

  it('should handle different user roles correctly', async () => {
    const testCases = [
      { role: 'Student', expected: 'Student' },
      { role: 'CR', expected: 'CR' },
      { role: 'Faculty', expected: 'Faculty' },
      { role: 'Admin', expected: 'Admin' }
    ];

    for (const testCase of testCases) {
      let activityLogData = null;

      mockAdd.fn = async (data) => {
        activityLogData = data;
        return { id: 'mock-log-id' };
      };

      mockSet.fn = async () => {};

      await DB.toggleTaskCompletion('user123', 'task123', true, 'user@example.com', testCase.role);

      expect(activityLogData.userRole).toBe(testCase.expected);
    }
  });

  it('should not fail if activity logging fails', async () => {
    const taskId = 'task123';
    const userId = 'user456';
    const userEmail = 'student@example.com';
    const userRole = 'Student';

    let completionData = null;

    // Make activity logging fail
    mockAdd.fn = async () => {
      throw new Error('Firestore error');
    };

    mockSet.fn = async (data) => {
      completionData = data;
    };

    // Should still succeed even if logging fails
    const result = await DB.toggleTaskCompletion(userId, taskId, true, userEmail, userRole);

    expect(result.success).toBe(true);
    expect(completionData).toBeDefined();
  });
});
