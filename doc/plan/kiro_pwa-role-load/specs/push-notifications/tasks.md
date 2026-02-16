# Implementation Plan: Push Notifications System

## Overview

This implementation plan breaks down the push notifications system into discrete, incremental tasks. The system will be built using TypeScript and will integrate with the existing Firebase/Firestore infrastructure. Each task builds on previous work, with testing integrated throughout to catch issues early.

## Tasks

- [ ] 1. Set up TypeScript configuration and notification types
  - Create TypeScript configuration file (tsconfig.json) for the notifications module
  - Define TypeScript interfaces for notification data, permission state, and listener state
  - Define types for task and event documents from Firestore
  - Set up build process to compile TypeScript to JavaScript
  - _Requirements: All requirements (foundation)_

- [ ] 2. Implement Permission Manager
  - [ ] 2.1 Create PermissionManager class with permission checking and requesting
    - Implement getPermissionState() to check current browser permission
    - Implement requestPermission() to request notification permission
    - Implement isGranted() helper method
    - Implement savePermissionState() to persist state in localStorage
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 2.2 Write property test for permission state persistence
    - **Property 4: Permission State Persistence**
    - **Validates: Requirements 4.2, 4.3**
  
  - [ ] 2.3 Implement permission prompt UI and browser-specific instructions
    - Create showPermissionPrompt() and hidePermissionPrompt() methods
    - Implement getEnableInstructions() with browser detection
    - Add UI elements for permission prompt
    - _Requirements: 4.1, 8.4_
  
  - [ ]* 2.4 Write unit tests for permission manager
    - Test permission request flow
    - Test permission denied scenario with instructions
    - Test localStorage persistence
    - _Requirements: 4.1, 4.2, 4.3, 8.4_

- [ ] 3. Implement Notification Content Formatter
  - [ ] 3.1 Create NotificationContentFormatter class
    - Implement formatTaskNotification() to format task data
    - Implement formatEventNotification() to format event data
    - Implement formatDateTime() for date/time formatting
    - Implement getIcon() to return appropriate icon URLs
    - _Requirements: 1.2, 2.2, 5.1, 5.2, 5.3, 5.4_
  
  - [ ] 3.2 Implement content truncation logic
    - Implement truncate() method with word boundary preservation
    - Define maximum lengths (title: 50 chars, body: 150 chars)
    - Ensure ellipsis is added for truncated content
    - _Requirements: 5.5, 8.5_
  
  - [ ]* 3.3 Write property test for task notification content completeness
    - **Property 1: Task Notification Content Completeness**
    - **Validates: Requirements 1.2, 1.4, 1.5**
  
  - [ ]* 3.4 Write property test for event notification content completeness
    - **Property 2: Event Notification Content Completeness**
    - **Validates: Requirements 2.2, 2.4, 2.5**
  
  - [ ]* 3.5 Write property test for content truncation
    - **Property 5: Content Truncation with Ellipsis**
    - **Validates: Requirements 5.5, 8.5**

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 5. Implement Notification Manager
  - [ ] 5.1 Create NotificationManager class with browser API support check
    - Implement isSupported() to check for Web Notifications API
    - Implement init() to initialize the notification system
    - Add error handling for unsupported browsers
    - _Requirements: 8.1_
  
  - [ ] 5.2 Implement notification display methods
    - Implement showTaskNotification() to display task notifications
    - Implement showEventNotification() to display event notifications
    - Integrate with PermissionManager to check permission before display
    - Integrate with NotificationContentFormatter for content generation
    - Add error handling for display failures
    - _Requirements: 1.2, 1.3, 2.2, 2.3, 8.2_
  
  - [ ]* 5.3 Write property test for permission-based notification display
    - **Property 3: Permission-Based Notification Display**
    - **Validates: Requirements 1.3, 4.4**
  
  - [ ]* 5.4 Write property test for error logging on display failure
    - **Property 9: Error Logging on Display Failure**
    - **Validates: Requirements 8.2**
  
  - [ ] 5.3 Implement notification click handling
    - Implement handleNotificationClick() for navigation
    - Add window focus/open logic
    - Integrate with application router for task/event navigation
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ]* 5.6 Write property test for task notification click navigation
    - **Property 6: Task Notification Click Navigation**
    - **Validates: Requirements 6.1, 6.3**
  
  - [ ]* 5.7 Write property test for event notification click navigation
    - **Property 7: Event Notification Click Navigation**
    - **Validates: Requirements 6.2, 6.3**
  
  - [ ]* 5.8 Write unit tests for notification manager
    - Test browser API support detection
    - Test notification display with granted permission
    - Test notification not displayed with denied permission
    - Test click handling and navigation
    - Test notification dismissal (no action)
    - _Requirements: 1.3, 6.1, 6.2, 6.3, 6.4, 8.1_

- [ ] 6. Implement Firestore Listener Manager
  - [ ] 6.1 Create FirestoreListenerManager class
    - Implement setupListeners() to initialize task and event listeners
    - Implement listenForNewTasks() with Firestore query
    - Implement listenForNewEvents() with Firestore query
    - Implement unsubscribeAll() for cleanup
    - _Requirements: 7.1, 7.2, 7.5_
  
  - [ ] 6.2 Implement initial load detection logic
    - Add isFirstSnapshot flag to distinguish initial load from new documents
    - Use docChanges() to detect only 'added' type changes
    - Set initialization timestamp after first snapshot
    - _Requirements: 1.1, 2.1_
  
  - [ ] 6.3 Integrate listener callbacks with NotificationManager
    - Connect task listener callback to showTaskNotification()
    - Connect event listener callback to showEventNotification()
    - Add error handling for callback failures
    - _Requirements: 7.3, 7.4_
  
  - [ ]* 6.4 Write property test for Firestore listener responsiveness
    - **Property 8: Firestore Listener Responsiveness**
    - **Validates: Requirements 7.3, 7.4**
  
  - [ ]* 6.5 Write unit tests for listener manager
    - Test listener setup on initialization
    - Test initial snapshot is ignored (no notifications)
    - Test subsequent document additions trigger callbacks
    - Test unsubscribeAll() cleans up listeners
    - Test listener behavior with user's department/semester/section
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 8. Integrate notification system with application
  - [ ] 8.1 Initialize notification system on user login
    - Add initialization call in auth.js after successful login
    - Pass user profile (department, semester, section) to setupListeners()
    - Request notification permission on first login
    - _Requirements: 4.1, 7.1, 7.2_
  
  - [ ] 8.2 Clean up notification system on user logout
    - Add cleanup call in auth.js logout function
    - Unsubscribe all Firestore listeners
    - Clear notification state from localStorage
    - _Requirements: 7.5_
  
  - [ ] 8.3 Add notification permission UI to settings or dashboard
    - Create UI element to show current permission state
    - Add button to request permission if not granted
    - Display browser-specific instructions if permission denied
    - _Requirements: 4.1, 8.4_
  
  - [ ]* 8.4 Write integration tests
    - Test full flow: login → listener setup → new task → notification displayed
    - Test full flow: login → listener setup → new event → notification displayed
    - Test logout cleanup
    - Test permission request on first login
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 4.1, 7.1, 7.2_

- [ ] 9. Implement PWA context support
  - [ ] 9.1 Test notification system in PWA context
    - Verify notifications work when app is installed as PWA
    - Verify notification content is identical in browser and PWA
    - Test notification click handling in PWA context
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 9.2 Write property test for cross-context notification consistency
    - **Property 10: Cross-Context Notification Consistency**
    - **Validates: Requirements 3.3**
  
  - [ ]* 9.3 Write unit tests for PWA context
    - Test notification display in standalone mode
    - Test window focus in PWA context
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 10. Add error handling and edge cases
  - [ ] 10.1 Implement browser API not supported handling
    - Add check for Notification API availability
    - Log warning with browser information
    - Display one-time message to user
    - Ensure app continues to function
    - _Requirements: 8.1_
  
  - [ ] 10.2 Implement Firestore connection loss handling
    - Add connection state monitoring
    - Log connection state changes
    - Rely on Firestore SDK auto-reconnection
    - Display offline indicator (reuse PWA offline indicator)
    - _Requirements: 8.3_
  
  - [ ]* 10.3 Write unit tests for error scenarios
    - Test browser API not supported
    - Test permission denied with instructions
    - Test notification display failure
    - Test content exceeding size limits
    - Test Firestore connection loss
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 11. Final checkpoint and documentation
  - [ ] 11.1 Ensure all tests pass
    - Run all unit tests
    - Run all property-based tests (minimum 100 iterations each)
    - Verify test coverage meets goals (80%+ unit coverage)
    - _Requirements: All_
  
  - [ ] 11.2 Update documentation
    - Add JSDoc comments to all public methods
    - Document TypeScript interfaces and types
    - Add usage examples in code comments
    - Update README with notification system setup instructions
    - _Requirements: All_
  
  - [ ] 11.3 Manual testing
    - Test in Chrome, Firefox, Safari, Edge
    - Test in browser and PWA contexts
    - Test permission request flow
    - Test notification display for tasks and events
    - Test notification click navigation
    - Test error scenarios (permission denied, API not supported)
    - _Requirements: All_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples and edge cases
- TypeScript provides type safety and better IDE support
- Integration with existing Firebase/Firestore infrastructure is seamless
- PWA context support ensures notifications work in installed apps
