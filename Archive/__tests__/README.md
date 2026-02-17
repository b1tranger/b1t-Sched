# Firebase Security Rules Tests

This directory contains tests for the Firebase Firestore security rules, specifically for the CR (Class Representative) permissions fix.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. The Firebase emulator will be used automatically during tests. No manual emulator startup is required.

## Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test:watch
```

## Test Structure

- `helpers/test-utils.js` - Utility functions for setting up test environments, creating test users and events
- Tests follow the naming pattern `*.test.js`

## Test Environment

- Uses `@firebase/rules-unit-testing` for Firebase Rules testing
- Uses `fast-check` for property-based testing
- Uses Jest as the test runner
- Tests run against the Firebase emulator (no real Firebase project needed)

## Writing Tests

Example test structure:

```javascript
import { setupTestEnvironment, teardownTestEnvironment, clearFirestoreData } from './helpers/test-utils.js';

describe('Event Creation Tests', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  beforeEach(async () => {
    await clearFirestoreData();
  });

  test('CR user can create event for their semester', async () => {
    // Test implementation
  });
});
```

## Property-Based Tests

Property-based tests use `fast-check` to generate random test data and verify properties hold across many iterations (minimum 100).

Each property test should:
1. Reference the design property it validates
2. Generate random test data
3. Execute operations against the rules
4. Verify expected behavior
5. Run for at least 100 iterations
