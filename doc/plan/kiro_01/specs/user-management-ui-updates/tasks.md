# Implementation Plan: User Management UI Updates

## Overview

This implementation plan breaks down the User Management UI updates into discrete, incremental tasks. The approach follows a bottom-up strategy: starting with backend infrastructure, then building UI components, and finally integrating everything together. Each task builds on previous work to ensure continuous validation.

## Tasks

- [x] 1. Set up Firebase Cloud Functions infrastructure
  - Create `functions/` directory structure
  - Initialize Firebase Functions with `firebase init functions`
  - Install required dependencies: `firebase-admin`, `firebase-functions`, `cors`
  - Configure `functions/index.js` as main entry point
  - _Requirements: 6.1, 6.3_

- [ ] 2. Implement backend API endpoints
  - [x] 2.1 Create password reset endpoint
    - Implement `functions/admin/sendPasswordReset.js`
    - Add admin authentication validation
    - Integrate Firebase Admin SDK for password reset link generation
    - Add audit logging to `adminLogs` collection
    - _Requirements: 1.2, 1.5, 6.2, 6.5, 6.7_
  
  - [ ]* 2.2 Write property test for password reset endpoint
    - **Property 2: Password reset API integration**
    - **Property 5: Admin action logging**
    - **Property 15: API authentication validation**
    - **Validates: Requirements 1.2, 1.5, 6.2, 6.5**
  
  - [x] 2.3 Create user deletion endpoint
    - Implement `functions/admin/deleteUser.js`
    - Add admin authentication validation
    - Prevent deletion of admin accounts
    - Integrate Firebase Admin SDK for user deletion
    - Add audit logging to `adminLogs` collection
    - _Requirements: 2.4, 2.7, 2.8, 6.4, 6.5, 6.7_
  
  - [ ]* 2.4 Write property test for user deletion endpoint
    - **Property 8: User deletion API integration**
    - **Property 9: Admin account deletion prevention**
    - **Property 15: API authentication validation**
    - **Validates: Requirements 2.4, 2.8, 6.4, 6.5**


  - [ ]* 2.5 Write unit tests for API error handling
    - Test 401 Unauthorized responses
    - Test 403 Forbidden responses for non-admin users
    - Test 404 Not Found for invalid user IDs
    - Test 500 Internal Server Error scenarios
    - _Requirements: 1.4, 2.6, 6.6_

- [x] 3. Deploy and test backend endpoints
  - Deploy Firebase Functions: `firebase deploy --only functions`
  - Test endpoints using Postman or curl
  - Verify admin authentication works correctly
  - Verify audit logs are created properly
  - _Requirements: 6.1, 6.3, 6.8_

- [ ] 4. Create frontend API client
  - [x] 4.1 Implement AdminAPI class in `js/admin-api.js`
    - Add `getAuthToken()` method
    - Add `sendPasswordReset(userId)` method
    - Add `deleteUser(userId)` method
    - Handle network errors and API responses
    - _Requirements: 1.2, 2.4_
  
  - [ ]* 4.2 Write property test for API client
    - **Property 17: API response format**
    - **Validates: Requirements 6.8**
  
  - [ ]* 4.3 Write unit tests for API client error handling
    - Test network error handling
    - Test authentication token retrieval
    - Test API response parsing
    - _Requirements: 1.4, 2.6_

- [ ] 5. Implement Filter Popup component
  - [x] 5.1 Create filter popup HTML structure
    - Add "Add Filter" button to replace visible filter section
    - Create filter popup modal with all filter controls
    - Move "Clear Filters" button inside popup
    - Add filter badge element to "Add Filter" button
    - Update `index.html` in user management section
    - _Requirements: 4.1, 4.2, 4.4, 4.5_
  
  - [x] 5.2 Add filter popup CSS styling
    - Style filter popup modal and content
    - Style filter badge with maroon theme
    - Add fade-in animation for popup
    - Ensure responsive design for mobile devices
    - Update `css/components.css` or create `css/filter-popup.css`
    - _Requirements: 4.1, 4.2_
  
  - [x] 5.3 Implement FilterPopup JavaScript class
    - Create `FilterPopup` class with open/close methods
    - Implement `updateBadge()` to show active filter count
    - Implement `getActiveFilters()` to count non-"All" filters
    - Implement `clearFilters()` to reset all dropdowns
    - Add to `js/app.js` or create `js/filter-popup.js`
    - _Requirements: 4.3, 4.6, 4.7, 5.2, 5.3, 5.4_


  - [x] 5.4 Wire up filter popup event listeners
    - Add click listener for "Add Filter" button to open popup
    - Add click listener for close button to close popup
    - Add click listener for "Apply" button to close popup and apply filters
    - Add click listener for "Clear Filters" button
    - Add click outside popup to close
    - Add escape key listener to close popup
    - Update filter badge when filters change
    - Update in `js/app.js` `setupUserManagementListeners()` method
    - _Requirements: 4.3, 4.6, 4.8, 5.1_
  
  - [ ]* 5.5 Write property test for filter popup
    - **Property 11: Filter popup open/close behavior**
    - **Property 12: Filter state persistence**
    - **Property 13: Active filter badge display**
    - **Property 14: Filter reset functionality**
    - **Validates: Requirements 4.3, 4.6, 4.7, 4.8, 5.2, 5.3, 5.4**
  
  - [ ]* 5.6 Write unit tests for filter popup
    - Test popup opens on button click
    - Test popup closes on outside click
    - Test popup closes on escape key
    - Test badge updates correctly
    - _Requirements: 4.3, 4.7, 4.8_

- [ ] 6. Checkpoint - Test filter popup functionality
  - Ensure filter popup opens and closes correctly
  - Verify filter badge shows correct count
  - Verify filters persist when popup is closed and reopened
  - Verify "Clear Filters" resets all filters
  - Ask the user if questions arise

- [ ] 7. Implement action button optimizations
  - [x] 7.1 Update action button CSS for consistent sizing
    - Modify `.btn-sm` class for reduced width
    - Add `.btn-action` class for consistent styling
    - Ensure buttons work on mobile, tablet, and desktop
    - Update `css/components.css`
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 7.2 Update user card actions layout
    - Modify `.user-card-actions` for better button spacing
    - Ensure proper flex wrapping on small screens
    - Update `css/dashboard.css` or `css/components.css`
    - _Requirements: 3.3_
  
  - [ ]* 7.3 Write property test for button sizing
    - **Property 10: Action button width consistency**
    - **Validates: Requirements 3.1, 3.2, 3.3**


- [ ] 8. Add password reset and delete buttons to user cards
  - [x] 8.1 Update renderUserList() to include new buttons
    - Add "Send Password Reset" button for non-admin users
    - Add "Delete User" button with danger styling for non-admin users
    - Apply `.btn-action` class to all action buttons
    - Update button HTML in `js/app.js` `renderUserList()` method
    - _Requirements: 1.1, 2.1, 2.2_
  
  - [ ]* 8.2 Write property test for button visibility
    - **Property 1: Admin-only button visibility**
    - **Property 6: Danger button styling**
    - **Validates: Requirements 1.1, 2.1, 2.2**
  
  - [ ]* 8.3 Write unit tests for button rendering
    - Test buttons appear for non-admin users
    - Test buttons don't appear for admin users
    - Test delete button has danger styling
    - _Requirements: 1.1, 2.1, 2.2_

- [ ] 9. Implement delete user confirmation dialog
  - [x] 9.1 Create confirmation dialog HTML
    - Add delete user modal with warning styling
    - Include user email display
    - Add cancel and confirm buttons
    - Update `index.html`
    - _Requirements: 2.3_
  
  - [x] 9.2 Add confirmation dialog CSS
    - Style modal with danger theme (red accents)
    - Style warning text and user email display
    - Update `css/components.css`
    - _Requirements: 2.3_
  
  - [x] 9.3 Implement DeleteUserDialog JavaScript class
    - Create class with open/close methods
    - Store current user ID and email
    - Add to `js/app.js` or create `js/delete-dialog.js`
    - _Requirements: 2.3_
  
  - [ ]* 9.4 Write property test for confirmation dialog
    - **Property 7: Deletion confirmation requirement**
    - **Validates: Requirements 2.3**

- [ ] 10. Wire up password reset functionality
  - [x] 10.1 Add event listener for password reset buttons
    - Use event delegation on user list container
    - Extract user ID from button data attribute
    - Call AdminAPI.sendPasswordReset()
    - Show loading state during API call
    - Update in `js/app.js` `setupUserManagementListeners()` method
    - _Requirements: 1.2_
  
  - [x] 10.2 Add success and error notifications
    - Show success notification on successful password reset
    - Show error notification on failure with error message
    - Use existing UI.showNotification() method
    - _Requirements: 1.3, 1.4_
  
  - [ ]* 10.3 Write property test for password reset flow
    - **Property 3: Success notification display**
    - **Property 4: Error notification display**
    - **Validates: Requirements 1.3, 1.4**


- [ ] 11. Wire up user deletion functionality
  - [x] 11.1 Add event listener for delete user buttons
    - Use event delegation on user list container
    - Extract user ID and email from button data attributes
    - Open DeleteUserDialog with user information
    - Update in `js/app.js` `setupUserManagementListeners()` method
    - _Requirements: 2.3_
  
  - [x] 11.2 Add confirmation dialog event listeners
    - Add click listener for cancel button to close dialog
    - Add click listener for confirm button to proceed with deletion
    - Add click listener for close button (X) to close dialog
    - Update in `js/app.js` `setupUserManagementListeners()` method
    - _Requirements: 2.3_
  
  - [x] 11.3 Implement user deletion logic
    - Call AdminAPI.deleteUser() on confirmation
    - Show loading state during API call
    - Remove user from UI on success
    - Show success notification
    - Show error notification on failure
    - Close confirmation dialog after operation
    - Update in `js/app.js`
    - _Requirements: 2.4, 2.5, 2.6_
  
  - [ ]* 11.4 Write property test for deletion flow
    - **Property 3: Success notification display**
    - **Property 4: Error notification display**
    - **Validates: Requirements 2.5, 2.6**
  
  - [ ]* 11.5 Write unit tests for deletion flow
    - Test confirmation dialog opens on delete button click
    - Test deletion proceeds only after confirmation
    - Test user is removed from UI after successful deletion
    - Test error handling for failed deletion
    - _Requirements: 2.3, 2.5, 2.6_

- [x] 12. Update Firestore security rules
  - Add security rules for `adminLogs` collection
  - Ensure only admins can read and write logs
  - Deploy rules: `firebase deploy --only firestore:rules`
  - _Requirements: 1.5, 2.7_

- [x] 13. Add admin logs collection initialization
  - Create `adminLogs` collection in Firestore (if not exists)
  - Add index for querying logs by timestamp
  - Document log entry structure in Firestore
  - _Requirements: 1.5, 2.7_

- [ ] 14. Final integration and testing
  - [x] 14.1 Test complete password reset flow
    - Test with valid user
    - Test with invalid user
    - Test with non-admin user attempting operation
    - Verify email is sent
    - Verify log entry is created
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 14.2 Test complete user deletion flow
    - Test with valid non-admin user
    - Test with admin user (should be prevented)
    - Test with non-admin user attempting operation
    - Verify user is deleted from Firebase Auth
    - Verify user document is deleted from Firestore
    - Verify log entry is created
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  
  - [x] 14.3 Test filter popup on all devices
    - Test on mobile (iOS Safari, Android Chrome)
    - Test on tablet
    - Test on desktop (Chrome, Firefox, Safari, Edge)
    - Verify animations complete within 300ms
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_
  
  - [x] 14.4 Test action button consistency
    - Verify button sizes are consistent across devices
    - Verify spacing and alignment is correct
    - Test with multiple buttons in user cards
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 15. Final checkpoint - Ensure all tests pass
  - Run all unit tests
  - Run all property-based tests
  - Verify all features work end-to-end
  - Check browser console for errors
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Backend tasks (1-3) should be completed before frontend tasks (4-14)
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Firebase Functions deployment requires Firebase CLI and proper project configuration
- All admin operations require server-side validation for security
