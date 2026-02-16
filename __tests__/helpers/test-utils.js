import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';

let testEnv;

/**
 * Initialize the Firebase test environment
 */
export async function setupTestEnvironment() {
  if (testEnv) {
    return testEnv;
  }

  testEnv = await initializeTestEnvironment({
    projectId: 'test-project',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: 'localhost',
      port: 8080
    }
  });

  return testEnv;
}

/**
 * Clean up test environment
 */
export async function teardownTestEnvironment() {
  if (testEnv) {
    await testEnv.cleanup();
    testEnv = null;
  }
}

/**
 * Clear all Firestore data
 */
export async function clearFirestoreData() {
  if (testEnv) {
    await testEnv.clearFirestore();
  }
}

/**
 * Create an authenticated context for a user
 */
export function getAuthenticatedContext(userId, customClaims = {}) {
  if (!testEnv) {
    throw new Error('Test environment not initialized');
  }
  return testEnv.authenticatedContext(userId, customClaims);
}

/**
 * Create an unauthenticated context
 */
export function getUnauthenticatedContext() {
  if (!testEnv) {
    throw new Error('Test environment not initialized');
  }
  return testEnv.unauthenticatedContext();
}

/**
 * Create a test user document
 */
export async function createTestUser(userId, userData) {
  if (!testEnv) {
    throw new Error('Test environment not initialized');
  }
  
  const adminContext = testEnv.authenticatedContext('admin', {});
  const db = adminContext.firestore();
  
  await db.collection('users').doc(userId).set({
    uid: userId,
    email: `${userId}@test.com`,
    name: `Test User ${userId}`,
    ...userData
  });
}

/**
 * Create a test event document
 */
export async function createTestEvent(eventId, eventData) {
  if (!testEnv) {
    throw new Error('Test environment not initialized');
  }
  
  const adminContext = testEnv.authenticatedContext('admin', {});
  const db = adminContext.firestore();
  
  await db.collection('events').doc(eventId).set({
    title: 'Test Event',
    description: 'Test Description',
    date: new Date(),
    department: 'CSE',
    semester: 'Fall2024',
    createdBy: 'test-user',
    ...eventData
  });
}

/**
 * Generate a random user ID
 */
export function generateUserId() {
  return `user-${Math.random().toString(36).substring(7)}`;
}

/**
 * Generate a random event ID
 */
export function generateEventId() {
  return `event-${Math.random().toString(36).substring(7)}`;
}
