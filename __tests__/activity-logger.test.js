/**
 * Unit tests for ActivityLogger module
 * Tests activity logging functionality with error handling
 */

// Mock the global db and firebase objects
let mockDb;
let mockCollection;
let mockAdd;
let mockFirebase;

// Import ActivityLogger after setting up mocks
const setupMocks = () => {
  mockAdd = {
    fn: null,
    mockResolvedValue: function(value) {
      this.fn = async () => value;
      return this;
    },
    mockRejectedValue: function(error) {
      this.fn = async () => { throw error; };
      return this;
    }
  };
  mockAdd.fn = async () => ({ id: 'mock-log-id' });

  mockCollection = {
    fn: null,
    mockReturnValue: function(value) {
      this.fn = () => value;
      return this;
    }
  };
  mockCollection.fn = () => ({ add: mockAdd.fn });

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

// Load ActivityLogger module
setupMocks();
const ActivityLoggerModule = await import('../js/activity-logger.js');
const ActivityLogger = ActivityLoggerModule.default || global.ActivityLogger;

describe('ActivityLogger', () => {
  beforeEach(() => {
    setupMocks();
  });

  describe('logActivity', () => {
    it('should log activity with all required fields', async () => {
      const activityType = 'task_addition';
      const metadata = {
        userId: 'user123',
        userEmail: 'student@example.com',
        userRole: 'Student',
        department: 'CSE',
        semester: '3rd',
        section: 'A1',
        taskId: 'task123',
        taskType: 'assignment'
      };

      let capturedData = null;
      mockAdd.fn = async (data) => {
        capturedData = data;
        return { id: 'mock-log-id' };
      };

      await ActivityLogger.logActivity(activityType, metadata);

      expect(capturedData).toBeDefined();
      expect(capturedData.activityType).toBe('task_addition');
      expect(capturedData.userId).toBe('user123');
      expect(capturedData.userName).toBe('student');
      expect(capturedData.userRole).toBe('Student');
      expect(capturedData.department).toBe('CSE');
      expect(capturedData.semester).toBe('3rd');
      expect(capturedData.section).toBe('A1');
      expect(capturedData.taskId).toBe('task123');
      expect(capturedData.taskType).toBe('assignment');
    });

    it('should extract userName from email correctly', async () => {
      const metadata = {
        userId: 'user123',
        userEmail: 'john.doe@university.edu',
        userRole: 'Student'
      };

      let capturedData = null;
      mockAdd.fn = async (data) => {
        capturedData = data;
        return { id: 'mock-log-id' };
      };

      await ActivityLogger.logActivity('test_activity', metadata);

      expect(capturedData.userName).toBe('john.doe');
    });

    it('should handle missing optional fields with null values', async () => {
      const metadata = {
        userId: 'user123',
        userEmail: 'student@example.com',
        userRole: 'Student'
      };

      let capturedData = null;
      mockAdd.fn = async (data) => {
        capturedData = data;
        return { id: 'mock-log-id' };
      };

      await ActivityLogger.logActivity('user_registration', metadata);

      expect(capturedData.department).toBeNull();
      expect(capturedData.semester).toBeNull();
      expect(capturedData.section).toBeNull();
      expect(capturedData.taskId).toBeNull();
      expect(capturedData.eventId).toBeNull();
      expect(capturedData.taskType).toBeNull();
    });

    it('should not throw error when Firestore write fails', async () => {
      mockAdd.fn = async () => {
        throw new Error('Firestore error');
      };

      const metadata = {
        userId: 'user123',
        userEmail: 'student@example.com',
        userRole: 'Student'
      };

      // Should not throw - error is caught and logged
      await expect(
        ActivityLogger.logActivity('task_addition', metadata)
      ).resolves.not.toThrow();
    });

    it('should handle missing userEmail gracefully', async () => {
      const metadata = {
        userId: 'user123',
        userRole: 'Student'
      };

      let capturedData = null;
      mockAdd.fn = async (data) => {
        capturedData = data;
        return { id: 'mock-log-id' };
      };

      await ActivityLogger.logActivity('test_activity', metadata);

      expect(capturedData.userName).toBe('Unknown');
    });
  });

  describe('logTaskAddition', () => {
    it('should log task addition with correct metadata', async () => {
      const taskId = 'task123';
      const taskData = {
        department: 'CSE',
        semester: '3rd',
        section: 'A1',
        type: 'assignment'
      };
      const userId = 'user123';
      const userEmail = 'student@example.com';
      const userRole = 'Student';

      let capturedData = null;
      mockAdd.fn = async (data) => {
        capturedData = data;
        return { id: 'mock-log-id' };
      };

      await ActivityLogger.logTaskAddition(taskId, taskData, userId, userEmail, userRole);

      expect(capturedData.activityType).toBe('task_addition');
      expect(capturedData.taskId).toBe('task123');
      expect(capturedData.taskType).toBe('assignment');
      expect(capturedData.department).toBe('CSE');
    });
  });

  describe('logTaskCompletion', () => {
    it('should log task completion with taskId', async () => {
      const taskId = 'task123';
      const userId = 'user123';
      const userEmail = 'student@example.com';
      const userRole = 'Student';

      let capturedData = null;
      mockAdd.fn = async (data) => {
        capturedData = data;
        return { id: 'mock-log-id' };
      };

      await ActivityLogger.logTaskCompletion(taskId, userId, userEmail, userRole);

      expect(capturedData.activityType).toBe('task_completion');
      expect(capturedData.taskId).toBe('task123');
      expect(capturedData.userId).toBe('user123');
    });
  });

  describe('logEventAddition', () => {
    it('should log event addition with correct metadata', async () => {
      const eventId = 'event123';
      const eventData = {
        department: 'CSE',
        semester: '3rd'
      };
      const userId = 'user123';
      const userEmail = 'cr@example.com';
      const userRole = 'CR';

      let capturedData = null;
      mockAdd.fn = async (data) => {
        capturedData = data;
        return { id: 'mock-log-id' };
      };

      await ActivityLogger.logEventAddition(eventId, eventData, userId, userEmail, userRole);

      expect(capturedData.activityType).toBe('event_addition');
      expect(capturedData.eventId).toBe('event123');
      expect(capturedData.department).toBe('CSE');
      expect(capturedData.section).toBeNull(); // Events don't have sections
    });
  });

  describe('logUserRegistration', () => {
    it('should log user registration with Student role', async () => {
      const userId = 'user123';
      const userProfile = {
        department: 'CSE',
        semester: '1st',
        section: 'A1'
      };
      const userEmail = 'newstudent@example.com';

      let capturedData = null;
      mockAdd.fn = async (data) => {
        capturedData = data;
        return { id: 'mock-log-id' };
      };

      await ActivityLogger.logUserRegistration(userId, userProfile, userEmail);

      expect(capturedData.activityType).toBe('user_registration');
      expect(capturedData.userRole).toBe('Student');
      expect(capturedData.department).toBe('CSE');
    });
  });

  describe('logTaskDeletion', () => {
    it('should log task deletion', async () => {
      const taskId = 'task123';
      const userId = 'admin123';
      const userEmail = 'admin@example.com';
      const userRole = 'Admin';

      let capturedData = null;
      mockAdd.fn = async (data) => {
        capturedData = data;
        return { id: 'mock-log-id' };
      };

      await ActivityLogger.logTaskDeletion(taskId, userId, userEmail, userRole);

      expect(capturedData.activityType).toBe('task_deletion');
      expect(capturedData.taskId).toBe('task123');
      expect(capturedData.userRole).toBe('Admin');
    });
  });

  describe('logEventDeletion', () => {
    it('should log event deletion', async () => {
      const eventId = 'event123';
      const userId = 'admin123';
      const userEmail = 'admin@example.com';
      const userRole = 'Admin';

      let capturedData = null;
      mockAdd.fn = async (data) => {
        capturedData = data;
        return { id: 'mock-log-id' };
      };

      await ActivityLogger.logEventDeletion(eventId, userId, userEmail, userRole);

      expect(capturedData.activityType).toBe('event_deletion');
      expect(capturedData.eventId).toBe('event123');
    });
  });

  describe('Error handling', () => {
    it('should not interrupt primary action when logging fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      mockAdd.fn = async () => {
        throw new Error('Network error');
      };

      const metadata = {
        userId: 'user123',
        userEmail: 'student@example.com',
        userRole: 'Student'
      };

      // Should complete without throwing
      await ActivityLogger.logActivity('task_addition', metadata);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to log activity (non-critical):',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
