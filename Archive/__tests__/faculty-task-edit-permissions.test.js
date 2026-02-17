import { 
  setupTestEnvironment, 
  teardownTestEnvironment, 
  clearFirestoreData,
  getAuthenticatedContext,
  createTestUser,
  generateUserId
} from './helpers/test-utils.js';
import fc from 'fast-check';

/**
 * Tests for Faculty Task Edit Permissions
 * Feature: faculty-role-privileges
 * Property 11: Faculty Task Edit Authorization
 * 
 * Validates: Requirements 9.1
 * 
 * For any task edit operation, if the task was created by a Faculty user,
 * only that Faculty user or an admin should be able to edit the task.
 */

describe('Faculty Task Edit Permissions', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  beforeEach(async () => {
    await clearFirestoreData();
  });

  /**
   * Helper function to create a test task
   */
  async function createTestTask(taskId, taskData) {
    const adminContext = getAuthenticatedContext('admin', {});
    const db = adminContext.firestore();
    
    await db.collection('tasks').doc(taskId).set({
      title: 'Test Task',
      course: 'Test Course',
      type: 'assignment',
      description: 'Test Description',
      department: 'CSE',
      semester: null,
      section: null,
      deadline: null,
      status: 'active',
      addedBy: 'faculty-user',
      addedByName: 'Faculty User',
      addedByRole: 'Faculty',
      createdAt: new Date(),
      ...taskData
    });
  }

  // Unit Tests

  test('Faculty user can edit their own task', async () => {
    const facultyUserId = 'faculty-user-1';
    const taskId = 'task-1';

    // Create Faculty user
    await createTestUser(facultyUserId, {
      role: 'Faculty',
      isFaculty: true,
      department: 'CSE',
      semester: null,
      section: null
    });

    // Create task by Faculty user
    await createTestTask(taskId, {
      addedBy: facultyUserId,
      addedByRole: 'Faculty'
    });

    // Faculty user should be able to update their own task
    const facultyContext = getAuthenticatedContext(facultyUserId, {});
    const db = facultyContext.firestore();
    
    await expect(
      db.collection('tasks').doc(taskId).update({
        title: 'Updated Task Title'
      })
    ).resolves.not.toThrow();
  });

  test('Admin can edit Faculty task', async () => {
    const adminUserId = 'admin-user-1';
    const facultyUserId = 'faculty-user-1';
    const taskId = 'task-2';

    // Create Admin user
    await createTestUser(adminUserId, {
      role: 'Admin',
      isAdmin: true,
      department: 'CSE',
      semester: '1st',
      section: 'A1'
    });

    // Create Faculty user
    await createTestUser(facultyUserId, {
      role: 'Faculty',
      isFaculty: true,
      department: 'CSE',
      semester: null,
      section: null
    });

    // Create task by Faculty user
    await createTestTask(taskId, {
      addedBy: facultyUserId,
      addedByRole: 'Faculty'
    });

    // Admin should be able to update Faculty task
    const adminContext = getAuthenticatedContext(adminUserId, {});
    const db = adminContext.firestore();
    
    await expect(
      db.collection('tasks').doc(taskId).update({
        title: 'Updated by Admin'
      })
    ).resolves.not.toThrow();
  });

  test('Student cannot edit Faculty task', async () => {
    const studentUserId = 'student-user-1';
    const facultyUserId = 'faculty-user-1';
    const taskId = 'task-3';

    // Create Student user
    await createTestUser(studentUserId, {
      role: 'Student',
      department: 'CSE',
      semester: '1st',
      section: 'A1'
    });

    // Create Faculty user
    await createTestUser(facultyUserId, {
      role: 'Faculty',
      isFaculty: true,
      department: 'CSE',
      semester: null,
      section: null
    });

    // Create task by Faculty user
    await createTestTask(taskId, {
      addedBy: facultyUserId,
      addedByRole: 'Faculty'
    });

    // Student should NOT be able to update Faculty task
    const studentContext = getAuthenticatedContext(studentUserId, {});
    const db = studentContext.firestore();
    
    await expect(
      db.collection('tasks').doc(taskId).update({
        title: 'Attempted Update by Student'
      })
    ).rejects.toThrow();
  });

  test('CR cannot edit Faculty task created by another Faculty user', async () => {
    const crUserId = 'cr-user-1';
    const facultyUserId = 'faculty-user-1';
    const taskId = 'task-4';

    // Create CR user
    await createTestUser(crUserId, {
      role: 'CR',
      isCR: true,
      department: 'CSE',
      semester: '1st',
      section: 'A1'
    });

    // Create Faculty user
    await createTestUser(facultyUserId, {
      role: 'Faculty',
      isFaculty: true,
      department: 'CSE',
      semester: null,
      section: null
    });

    // Create task by Faculty user
    await createTestTask(taskId, {
      addedBy: facultyUserId,
      addedByRole: 'Faculty'
    });

    // CR should NOT be able to update Faculty task
    const crContext = getAuthenticatedContext(crUserId, {});
    const db = crContext.firestore();
    
    await expect(
      db.collection('tasks').doc(taskId).update({
        title: 'Attempted Update by CR'
      })
    ).rejects.toThrow();
  });

  test('Faculty user cannot edit another Faculty user\'s task', async () => {
    const facultyUserId1 = 'faculty-user-1';
    const facultyUserId2 = 'faculty-user-2';
    const taskId = 'task-5';

    // Create first Faculty user
    await createTestUser(facultyUserId1, {
      role: 'Faculty',
      isFaculty: true,
      department: 'CSE',
      semester: null,
      section: null
    });

    // Create second Faculty user
    await createTestUser(facultyUserId2, {
      role: 'Faculty',
      isFaculty: true,
      department: 'EEE',
      semester: null,
      section: null
    });

    // Create task by first Faculty user
    await createTestTask(taskId, {
      addedBy: facultyUserId1,
      addedByRole: 'Faculty',
      department: 'CSE'
    });

    // Second Faculty user should NOT be able to update first Faculty user's task
    const faculty2Context = getAuthenticatedContext(facultyUserId2, {});
    const db = faculty2Context.firestore();
    
    await expect(
      db.collection('tasks').doc(taskId).update({
        title: 'Attempted Update by Another Faculty'
      })
    ).rejects.toThrow();
  });

  // Property-Based Tests

  /**
   * **Feature: faculty-role-privileges, Property 11: Faculty Task Edit Authorization**
   * 
   * For any task created by a Faculty user, only that Faculty user or an admin
   * should be able to edit the task. Other users (Students, CRs, other Faculty)
   * should be denied.
   */
  test('Property: Only Faculty task creator or admin can edit Faculty tasks', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random user roles
        fc.constantFrom('Student', 'CR', 'Faculty', 'Admin'),
        // Generate random departments
        fc.constantFrom('CSE', 'EEE', 'BBA', 'CE'),
        async (userRole, userDepartment) => {
          // Clear data for each iteration
          await clearFirestoreData();

          const facultyUserId = generateUserId();
          const testUserId = generateUserId();
          const taskId = `task-${Date.now()}-${Math.random()}`;

          // Create Faculty user who creates the task
          await createTestUser(facultyUserId, {
            role: 'Faculty',
            isFaculty: true,
            department: 'CSE',
            semester: null,
            section: null
          });

          // Create test user with random role
          const testUserData = {
            role: userRole,
            department: userDepartment,
            semester: userRole !== 'Faculty' ? '1st' : null,
            section: userRole !== 'Faculty' ? 'A1' : null
          };

          if (userRole === 'Admin') testUserData.isAdmin = true;
          if (userRole === 'CR') testUserData.isCR = true;
          if (userRole === 'Faculty') testUserData.isFaculty = true;

          await createTestUser(testUserId, testUserData);

          // Create task by Faculty user
          await createTestTask(taskId, {
            addedBy: facultyUserId,
            addedByRole: 'Faculty',
            department: 'CSE'
          });

          // Try to update the task as the test user
          const testUserContext = getAuthenticatedContext(testUserId, {});
          const db = testUserContext.firestore();

          try {
            await db.collection('tasks').doc(taskId).update({
              title: 'Updated Title'
            });

            // If update succeeded, verify it was allowed
            // Only Admin or the Faculty creator should succeed
            const shouldSucceed = userRole === 'Admin' || testUserId === facultyUserId;
            expect(shouldSucceed).toBe(true);
          } catch (error) {
            // If update failed, verify it was correctly denied
            // Students, CRs, and other Faculty should be denied
            const shouldFail = userRole !== 'Admin' && testUserId !== facultyUserId;
            expect(shouldFail).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
