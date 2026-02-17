# Requirements Document

## Introduction

The Activity Timeline View feature provides a visual representation of website activity over time, similar to GitHub's contribution graph. This feature enables users to track and analyze various activities (task additions, completions, event additions, user registrations) through an interactive timeline with filtering capabilities by department, semester, and section.

## Glossary

- **Activity_Timeline_System**: The complete system responsible for tracking, aggregating, and displaying activity data
- **Activity_Logger**: Component that captures and stores user actions with metadata
- **Timeline_Visualizer**: Component that renders the activity graph using Chart.js
- **Activity_Event**: A recorded user action with associated metadata (type, timestamp, user, department, semester, section)
- **Activity_Type**: Category of user action (task_addition, task_completion, event_addition, user_registration, task_deletion, event_deletion)
- **Heatmap_Cell**: Individual data point on the timeline representing activity for a specific time period
- **Filter_State**: Current selection of department, semester, and section filters
- **Aggregation_Period**: Time granularity for grouping activities (daily, weekly, monthly)
- **Activity_Metadata**: Contextual information about an activity (department, semester, section, batch, user role)
- **Timeline_Button**: UI button that opens the activity timeline view, located beside the Contributions button
- **Bar_Chart_View**: Alternative visualization showing activity counts by category with applied filters

## Requirements

### Requirement 1: Activity Logging System

**User Story:** As a system administrator, I want all user activities to be automatically logged with metadata, so that I can track and analyze website usage patterns.

#### Acceptance Criteria

1. WHEN a user adds a task, THE Activity_Logger SHALL record an activity_event with type "task_addition", timestamp, user_id, department, semester, section, and task_type
2. WHEN a user marks a task as complete, THE Activity_Logger SHALL record an activity_event with type "task_completion", timestamp, user_id, and task_id
3. WHEN a user adds an event, THE Activity_Logger SHALL record an activity_event with type "event_addition", timestamp, user_id, department, semester, and section
4. WHEN a new user registers and sets their details, THE Activity_Logger SHALL record an activity_event with type "user_registration", timestamp, user_id, department, semester, and section
5. WHEN a user deletes a task, THE Activity_Logger SHALL record an activity_event with type "task_deletion", timestamp, user_id, and task_id
6. WHEN a user deletes an event, THE Activity_Logger SHALL record an activity_event with type "event_deletion", timestamp, user_id, and event_id
7. THE Activity_Logger SHALL store all activity_events in a Firestore collection named "activity_logs"
8. THE Activity_Logger SHALL include user_role (Student, CR, Faculty, Admin) in all activity_events
9. IF an activity_event fails to log, THEN THE Activity_Logger SHALL not interrupt the primary user action

### Requirement 2: Timeline Button UI

**User Story:** As a user, I want to access the activity timeline through a button beside the Contributions button, so that I can easily view website activity.

#### Acceptance Criteria

1. THE Activity_Timeline_System SHALL display a timeline_button in the contributions-section div beside the existing contributions-btn
2. THE Timeline_Button SHALL use the class "btn btn-secondary" to match the contributions button styling
3. THE Timeline_Button SHALL display an icon (fa-chart-line) and text "Activity Timeline"
4. WHEN the Timeline_Button is clicked, THE Activity_Timeline_System SHALL open a modal displaying the timeline view
5. WHERE the user is on mobile, THE Timeline_Button SHALL be responsive and maintain proper spacing
6. THE Timeline_Button SHALL only be visible to authenticated users
7. WHERE the contributions-section is hidden, THE Timeline_Button SHALL also be hidden

### Requirement 3: Timeline Visualization

**User Story:** As a user, I want to see a visual graph of activity over time, so that I can understand activity patterns at a glance.

#### Acceptance Criteria

1. THE Timeline_Visualizer SHALL render a heatmap-style graph showing activity intensity over the past 365 days
2. THE Timeline_Visualizer SHALL use Chart.js library for rendering the visualization
3. WHEN displaying the timeline, THE Timeline_Visualizer SHALL group activities by day
4. THE Timeline_Visualizer SHALL use color intensity to represent activity volume (lighter for less activity, darker for more activity)
5. THE Timeline_Visualizer SHALL display day labels on the x-axis and activity count ranges in the legend
6. WHEN a heatmap_cell is hovered, THE Timeline_Visualizer SHALL display a tooltip showing the date and activity count
7. THE Timeline_Visualizer SHALL be responsive and adjust to different screen sizes
8. WHERE no activity data exists for a date, THE Timeline_Visualizer SHALL display an empty or neutral-colored cell

### Requirement 4: Interactive Data Points

**User Story:** As a user, I want to click on data points in the timeline, so that I can see detailed information about activities on that date.

#### Acceptance Criteria

1. WHEN a user clicks a heatmap_cell, THE Activity_Timeline_System SHALL display a detail panel showing all activities for that date
2. THE detail panel SHALL show activity_type, timestamp, user_name, department, semester, and section for each activity
3. THE detail panel SHALL group activities by activity_type
4. THE detail panel SHALL display activities in reverse chronological order (newest first)
5. WHEN the detail panel is open, THE Activity_Timeline_System SHALL highlight the selected heatmap_cell
6. WHEN a user clicks outside the detail panel or presses escape, THE Activity_Timeline_System SHALL close the detail panel
7. WHERE there are more than 50 activities for a date, THE detail panel SHALL implement pagination or scrolling

### Requirement 5: Filter System

**User Story:** As a user, I want to filter the timeline by department, semester, and section, so that I can focus on specific groups' activities.

#### Acceptance Criteria

1. THE Activity_Timeline_System SHALL display filter dropdowns for Department, Semester, and Section above the timeline graph
2. THE Department filter SHALL populate options from the departments collection in Firestore
3. THE Semester filter SHALL populate options from the semesters collection in Firestore
4. THE Section filter SHALL populate options dynamically based on selected department and semester
5. WHEN a user selects a filter value, THE Timeline_Visualizer SHALL update the graph to show only matching activities
6. THE Activity_Timeline_System SHALL allow multiple filters to be applied simultaneously
7. THE Activity_Timeline_System SHALL display a "Clear Filters" button when any filter is active
8. WHEN the "Clear Filters" button is clicked, THE Activity_Timeline_System SHALL reset all filters and display all activities
9. THE Activity_Timeline_System SHALL persist filter_state in session storage during the user session

### Requirement 6: Bar Chart Visualization

**User Story:** As a user, I want to view activity data as a bar chart, so that I can compare activity counts across different categories.

#### Acceptance Criteria

1. THE Activity_Timeline_System SHALL provide a toggle to switch between heatmap view and bar_chart_view
2. THE Bar_Chart_View SHALL display activity counts grouped by activity_type
3. THE Bar_Chart_View SHALL use different colors for each activity_type
4. THE Bar_Chart_View SHALL respect the current filter_state when displaying data
5. WHEN a user hovers over a bar, THE Bar_Chart_View SHALL display a tooltip showing the activity_type and count
6. THE Bar_Chart_View SHALL display activity_type labels on the x-axis and count on the y-axis
7. THE Bar_Chart_View SHALL be responsive and adjust to different screen sizes

### Requirement 7: Data Aggregation and Performance

**User Story:** As a system administrator, I want activity data to be efficiently aggregated, so that the timeline loads quickly even with large datasets.

#### Acceptance Criteria

1. THE Activity_Timeline_System SHALL query activity_logs with date range filters to limit data retrieval
2. THE Activity_Timeline_System SHALL aggregate activity counts on the client side after retrieval
3. WHERE the user has applied filters, THE Activity_Timeline_System SHALL only query matching activity_logs
4. THE Activity_Timeline_System SHALL implement pagination when retrieving more than 10,000 activity_events
5. THE Activity_Timeline_System SHALL display a loading indicator while fetching and processing data
6. THE Activity_Timeline_System SHALL cache aggregated data for the current session to avoid redundant queries
7. WHEN the timeline modal is opened, THE Activity_Timeline_System SHALL load data within 3 seconds for datasets under 50,000 records

### Requirement 8: Privacy and Permissions

**User Story:** As a user, I want to see activity data appropriate to my role, so that sensitive information is protected.

#### Acceptance Criteria

1. WHERE the user is a Student, THE Activity_Timeline_System SHALL display activities only from their department, semester, and section
2. WHERE the user is a CR, THE Activity_Timeline_System SHALL display activities from their department, semester, and section
3. WHERE the user is Faculty, THE Activity_Timeline_System SHALL display activities from all sections within their department
4. WHERE the user is Admin, THE Activity_Timeline_System SHALL display all activities across all departments
5. THE Activity_Timeline_System SHALL not display user_id or email addresses in the detail panel
6. THE Activity_Timeline_System SHALL display user_name (extracted from email) instead of full email addresses
7. THE Activity_Timeline_System SHALL apply role-based filtering automatically based on the authenticated user's role

### Requirement 9: Modal UI and Responsiveness

**User Story:** As a user, I want the timeline view to be displayed in a well-designed modal, so that I can focus on the data without leaving the current page.

#### Acceptance Criteria

1. THE Activity_Timeline_System SHALL display the timeline in a modal with class "modal-content-lg" for large width
2. THE modal SHALL include a header with title "Activity Timeline" and a close button
3. THE modal SHALL include the filter controls in the modal body above the visualization
4. THE modal SHALL include a view toggle (heatmap/bar chart) in the modal header
5. WHEN the close button is clicked or escape is pressed, THE Activity_Timeline_System SHALL close the modal
6. THE modal SHALL be scrollable when content exceeds viewport height
7. WHERE the user is on mobile, THE modal SHALL occupy full screen width with appropriate padding
8. THE modal SHALL prevent body scrolling when open

### Requirement 10: Backward Compatibility

**User Story:** As a developer, I want the activity logging system to work with existing data, so that historical activities are included in the timeline.

#### Acceptance Criteria

1. THE Activity_Timeline_System SHALL create activity_events from existing task documents that have createdAt timestamps
2. THE Activity_Timeline_System SHALL create activity_events from existing event documents that have createdAt timestamps
3. THE Activity_Timeline_System SHALL run a one-time migration script to populate activity_logs from existing data
4. THE migration script SHALL preserve original timestamps from createdAt fields
5. THE migration script SHALL extract metadata (department, semester, section) from existing task and event documents
6. WHERE existing documents lack required metadata, THE migration script SHALL use default values or skip those records
7. THE Activity_Timeline_System SHALL handle both legacy data (from migration) and new data (from Activity_Logger) seamlessly
