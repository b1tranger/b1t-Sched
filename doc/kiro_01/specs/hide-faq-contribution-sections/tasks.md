# Implementation Plan: Hide FAQ and Contribution Sections

## Overview

This implementation will add conditional visibility logic for the FAQ and Contribution sections, ensuring they only appear on the dashboard view. The FAQ section will also be restructured with a nested dropdown for a more compact layout. The solution integrates with the existing Router module's callback mechanism.

## Tasks

- [x] 1. Restructure FAQ section HTML with nested dropdown
  - Wrap the three existing FAQ items inside a parent `<details>` element
  - Move the FAQ heading text into the parent `<summary>` element
  - Add appropriate CSS classes for styling consistency
  - Preserve all existing FAQ content and icons
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6_

- [ ]* 1.1 Write unit test for nested FAQ structure
  - Test that parent dropdown contains all three child FAQ items
  - Test that FAQ content is preserved after restructuring
  - _Requirements: 3.3, 3.5_

- [x] 2. Create visibility controller function
  - [x] 2.1 Implement `updateSectionVisibility(routeName)` function in a new or existing JavaScript file
    - Accept route name as parameter
    - Get references to FAQ and Contribution section DOM elements
    - Show both sections when route is 'dashboard'
    - Hide both sections for all other routes
    - Handle missing DOM elements gracefully with console warnings
    - _Requirements: 1.1, 1.2, 2.1, 2.2_

  - [ ]* 2.2 Write property test for dashboard visibility
    - **Property 1: Dashboard View Shows Sections**
    - **Validates: Requirements 1.1, 2.1**

  - [ ]* 2.3 Write property test for non-dashboard visibility
    - **Property 2: Non-Dashboard Views Hide Sections**
    - **Validates: Requirements 1.2, 2.2**

  - [ ]* 2.4 Write unit tests for edge cases
    - Test missing DOM elements handling
    - Test unknown route names default to hiding sections
    - _Requirements: 1.2, 2.2_

- [x] 3. Integrate visibility controller with Router
  - [x] 3.1 Add Router.onRouteChange callback in app initialization
    - Register the visibility controller as a callback
    - Ensure callback is registered after DOM is loaded
    - Place registration in appropriate initialization file (likely `js/app.js` or `js/routing.js`)
    - _Requirements: 1.3, 2.3, 4.1_

  - [ ]* 3.2 Write property test for route change triggering
    - **Property 3: Route Change Triggers Visibility Update**
    - **Validates: Requirements 1.3, 2.3, 4.1**

  - [ ]* 3.3 Write integration test for Router callback
    - Test that Router correctly invokes the visibility controller
    - Test that visibility updates occur on route changes
    - _Requirements: 4.1_

- [x] 4. Handle initial page load and refresh scenarios
  - [x] 4.1 Ensure visibility controller runs on initial page load
    - Call visibility controller after Router initialization
    - Verify correct visibility state on page refresh for all routes
    - _Requirements: 1.4, 2.4_

  - [ ]* 4.2 Write property test for browser navigation consistency
    - **Property 5: Browser Navigation Consistency**
    - **Validates: Requirements 1.4, 2.4, 4.2, 4.3**

  - [ ]* 4.3 Write integration tests for navigation scenarios
    - Test browser back/forward navigation
    - Test direct URL access with hash routes
    - Test page refresh on different routes
    - _Requirements: 4.2, 4.3_

- [x] 5. Verify existing functionality is not affected
  - [x] 5.1 Test that navbar, footer, and other UI elements continue to work correctly
    - Verify navbar visibility logic is unchanged
    - Verify footer visibility logic is unchanged
    - Verify user details card visibility is unchanged
    - _Requirements: 4.4_

  - [ ]* 5.2 Write integration tests for UI element independence
    - Test that FAQ/Contribution visibility changes don't affect other elements
    - Test that other element visibility changes don't affect FAQ/Contribution sections
    - _Requirements: 4.4_

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The visibility controller function can be added to an existing file like `js/ui.js` or `js/app.js` to avoid creating a new file
- The nested FAQ structure uses the same `<details>` and `<summary>` pattern as existing FAQ items for consistency
- Property tests validate universal correctness properties across all navigation scenarios
- Unit tests validate specific examples and edge cases
- Integration tests ensure the Router callback mechanism works correctly
