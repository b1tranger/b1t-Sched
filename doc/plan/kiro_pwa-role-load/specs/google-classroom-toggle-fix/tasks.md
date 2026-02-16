# Implementation Plan: Google Classroom Toggle Fix

## Overview

This implementation plan addresses the non-functional Google Classroom toggle buttons by:
1. Adding the missing Google Identity Services script to index.html
2. Improving the Classroom module initialization with retry logic and null checks
3. Adding comprehensive logging for debugging
4. Implementing proper error handling

The fix is minimal and focused on restoring functionality without breaking existing features.

## Tasks

- [x] 1. Add Google Identity Services script to index.html
  - Add the script tag before Firebase SDKs with async defer attributes
  - Verify script tag placement in the correct location
  - _Requirements: 1.1, 1.2_

- [ ] 2. Improve Classroom module initialization
  - [x] 2.1 Add retry logic for Google Identity Services loading
    - Implement retry counter (max 10 attempts)
    - Add 500ms delay between retries
    - Log each retry attempt
    - _Requirements: 1.4, 5.3_
  
  - [ ]* 2.2 Write property test for retry mechanism
    - **Property 1: Google Identity Services Retry Mechanism**
    - **Validates: Requirements 1.4, 5.3**
  
  - [x] 2.3 Add initialization success logging
    - Log when Google Identity Services is detected
    - Log when token client is initialized
    - Log when module initialization completes
    - _Requirements: 6.1, 6.3_

- [ ] 3. Add null checks to event listener setup
  - [x] 3.1 Add defensive checks for DOM elements
    - Check if classroom-toggle exists before attaching listener
    - Check if classroom-nav-btn exists before attaching listener
    - Check if close buttons and overlay exist
    - Log warnings for missing elements
    - _Requirements: 4.2, 4.3_
  
  - [ ]* 3.2 Write property test for null check behavior
    - **Property 5: Event Listener Attachment with Null Checks**
    - **Validates: Requirements 4.1, 4.2, 4.3**
  
  - [x] 3.3 Add click event logging
    - Log when mobile toggle is clicked
    - Log when desktop button is clicked
    - _Requirements: 6.4_
  
  - [ ]* 3.4 Write property test for event listener invocation
    - **Property 6: Event Listener Method Invocation**
    - **Validates: Requirements 3.5, 4.4**

- [ ] 4. Checkpoint - Verify initialization and event listeners
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Improve error handling and user feedback
  - [x] 5.1 Add error handling for initialization failures
    - Display user-friendly error message after all retries fail
    - Log detailed error information to console
    - Gracefully disable classroom functionality
    - _Requirements: 5.5, 6.5_
  
  - [ ]* 5.2 Write property test for error handling
    - **Property 8: Graceful Error Handling**
    - **Validates: Requirements 5.5, 6.5**
  
  - [x] 5.3 Ensure loading indicators are displayed
    - Verify renderLoading() is called during async operations
    - Verify loading indicator is removed after completion
    - _Requirements: 8.4_
  
  - [ ]* 5.4 Write property test for loading state indication
    - **Property 9: Loading State Indication**
    - **Validates: Requirements 8.4**

- [ ] 6. Add comprehensive logging throughout the module
  - [x] 6.1 Add logging for all significant operations
    - Log event listener attachments
    - Log DOM element lookups (success and failure)
    - Log Google Identity Services loading status
    - Log button clicks
    - Log initialization failures
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ]* 6.2 Write property test for comprehensive logging
    - **Property 7: Comprehensive Logging**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [ ] 7. Verify responsive behavior
  - [x] 7.1 Ensure openClassroomParams() checks window width at runtime
    - Verify window.innerWidth is checked when method is called
    - Verify correct interface opens based on current width
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 7.2 Write property test for responsive interface selection
    - **Property 2: Responsive Interface Selection**
    - **Validates: Requirements 2.1, 3.1, 7.1, 7.2, 7.4**
  
  - [ ]* 7.3 Write property test for responsive button visibility
    - **Property 3: Responsive Button Visibility**
    - **Validates: Requirements 2.2, 3.2**

- [ ] 8. Verify authentication state rendering
  - [ ]* 8.1 Write property test for authentication state conditional rendering
    - **Property 4: Authentication State Conditional Rendering**
    - **Validates: Requirements 2.3, 2.4, 3.3, 3.4**

- [ ] 9. Final checkpoint - Integration testing
  - [ ] 9.1 Test mobile toggle button functionality
    - Set viewport to mobile size (e.g., 375px)
    - Click mobile toggle button
    - Verify sidebar opens
    - Verify correct content displayed based on auth state
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 9.2 Test desktop navigation button functionality
    - Set viewport to desktop size (e.g., 1920px)
    - Click desktop navigation button
    - Verify modal opens
    - Verify correct content displayed based on auth state
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 9.3 Test responsive resize behavior
    - Start at mobile viewport
    - Click toggle and verify sidebar opens
    - Resize to desktop viewport
    - Click toggle and verify modal opens
    - _Requirements: 7.1, 7.2, 7.4_
  
  - [ ] 9.4 Test error handling
    - Block Google Identity Services script
    - Verify error message displayed
    - Verify system continues functioning
    - _Requirements: 5.5, 6.5_

- [ ] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The fix is minimal and focused on restoring functionality
- All changes maintain backward compatibility
- Property tests should use fast-check or similar JavaScript PBT library
- Each property test should run minimum 100 iterations
- Manual testing checklist is provided in the design document for UX verification
