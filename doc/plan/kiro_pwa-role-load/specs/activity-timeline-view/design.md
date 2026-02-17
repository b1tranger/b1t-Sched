# Design Document: Activity Timeline View

## Overview

The Activity Timeline View feature provides a comprehensive visualization system for tracking and analyzing website activity over time. The system consists of three main components: an Activity Logger that captures user actions, a Data Aggregation layer that processes and filters activity data, and a Visualization layer that renders interactive charts using Chart.js.

The feature integrates seamlessly with the existing UI by adding a Timeline button beside the Contributions button. When clicked, it opens a modal displaying a GitHub-style heatmap showing activity intensity over the past year, with interactive filtering and detailed drill-down capabilities.

## Architecture

### Component Structure

```
Activity Timeline System
├── Activity Logger (activity-logger.js)
│   ├── Log capture functions
│   ├── Metadata extraction
│   └── Firestore write operations
├── Timeline UI Controller (timeline-ui.js)
│   ├── Modal management
│   ├── Filter controls
│   ├── View toggle (heatmap/bar chart)
│   └── Event handlers
├── Data Aggregation Service (timeline-data.js)
│   ├── Firestore queries
│   ├── Role-based filtering
│   ├── Date range processing
│   └── Activity grouping
└── Visualization Renderer (timeline-viz.js)
    ├── Chart.js heatmap
    ├── Chart.js bar chart
    ├── Tooltip management
    └── Interactive click handlers
```

### Data Flow

1. **Activity Capture**: User performs action → Activity Logger captures event → Writes to Firestore `activity_logs` collection
2. **Data Retrieval**: User opens timeline → Data Aggregation Service queries Firestore with filters → Returns aggregated data
3. **Visualization**: Aggregated data → Visualization Renderer creates Chart.js instance → Renders in modal
4. **Interaction**: User clicks cell → Detail panel fetches specific date activities → Displays in overlay

## Components and Interfaces

### 1. Activity Logger Module (`js/activity-logger.js`)

**Purpose**: Capture and persist user activities with metadata

**Interface**:
```javascript
class ActivityLogger {
  /**
   * Log a user activity
   * @param {string} activityType - Type of activity (task_addition, task_completion, etc.)
   * @param {Object} metadata - Activity metadata
   * @param {string} metadata.userId - User ID
   * @param {string} metadata.userRole - User role (Student, CR, Faculty, Admin)
   * @param {string} [metadata.department] - Department
   * @param {string} [metadata.semester] - Semester
   * @param {string} [metadata.section] - Section
   * @param {string} [metadata.taskId] - Related task ID
   * @param {string} [metadata.eventId] - Related event ID
   * @param {string} [metadata.taskType] - Type of task (assignment, homework, etc.)
   * @returns {Promise<void>}
   */
  static async logActivity(activityType, metadata) {}
  
  /**
   * Log task addition activity
   * @param {string} taskId - Task document ID
   * @param {Object} taskData - Task data including department, semester, section
   * @returns {Promise<void>}
   */
  static async logTaskAddition(taskId, taskData) {}
  
  /**
   * Log task completion activity
   * @param {string} taskId - Task document ID
   * @param {string} userId - User who completed the task
   * @returns {Promise<void>}
   */
  static async logTaskCompletion(taskId, userId) {}
  
  /**
   * Log event addition activity
   * @param {string} eventId - Event document ID
   * @param {Object} eventData - Event data
   * @returns {Promise<void>}
   */
  static async logEventAddition(eventId, eventData) {}
  
  /**
   * Log user registration activity
   * @param {string} userId - User ID
   * @param {Object} userProfile - User profile data
   * @returns {Promise<void>}
   */
  static async logUserRegistration(userId, userProfile) {}
  
  /**
   * Log task deletion activity
   * @param {string} taskId - Task document ID
   * @param {string} userId - User who deleted the task
   * @returns {Promise<void>}
   */
  static async logTaskDeletion(taskId, userId) {}
  
  /**
   * Log event deletion activity
   * @param {string} eventId - Event document ID
   * @param {string} userId - User who deleted the event
   * @returns {Promise<void>}
   */
  static async logEventDeletion(eventId, userId) {}
}
```

**Integration Points**:
- Called from `js/app.js` after task operations
- Called from `js/app.js` after event operations
- Called from `js/profile.js` after user registration
- Writes to Firestore collection `activity_logs`

### 2. Timeline UI Controller (`js/timeline-ui.js`)

**Purpose**: Manage timeline modal, filters, and user interactions

**Interface**:
```javascript
class TimelineUI {
  constructor() {
    this.modal = null;
    this.currentView = 'heatmap'; // or 'bar'
    this.filters = {
      department: null,
      semester: null,
      section: null
    };
    this.chartInstance = null;
  }
  
  /**
   * Initialize timeline UI and event listeners
   */
  init() {}
  
  /**
   * Open the timeline modal
   */
  async openModal() {}
  
  /**
   * Close the timeline modal
   */
  closeModal() {}
  
  /**
   * Render filter controls
   */
  renderFilters() {}
  
  /**
   * Handle filter change
   * @param {string} filterType - 'department', 'semester', or 'section'
   * @param {string} value - Selected value
   */
  async onFilterChange(filterType, value) {}
  
  /**
   * Clear all filters
   */
  async clearFilters() {}
  
  /**
   * Toggle between heatmap and bar chart view
   */
  async toggleView() {}
  
  /**
   * Show detail panel for a specific date
   * @param {Date} date - Selected date
   */
  async showDetailPanel(date) {}
  
  /**
   * Hide detail panel
   */
  hideDetailPanel() {}
}
```

### 3. Data Aggregation Service (`js/timeline-data.js`)

**Purpose**: Query and aggregate activity data from Firestore

**Interface**:
```javascript
class TimelineDataService {
  /**
   * Get activity data for timeline
   * @param {Object} options - Query options
   * @param {Date} options.startDate - Start date for query
   * @param {Date} options.endDate - End date for query
   * @param {string} [options.department] - Filter by department
   * @param {string} [options.semester] - Filter by semester
   * @param {string} [options.section] - Filter by section
   * @param {string} options.userRole - Current user's role
   * @param {Object} options.userProfile - Current user's profile
   * @returns {Promise<Array<Object>>} Array of activity records
   */
  static async getActivityData(options) {}
  
  /**
   * Aggregate activities by date
   * @param {Array<Object>} activities - Raw activity records
   * @returns {Map<string, number>} Map of date string to activity count
   */
  static aggregateByDate(activities) {}
  
  /**
   * Aggregate activities by type
   * @param {Array<Object>} activities - Raw activity records
   * @returns {Map<string, number>} Map of activity type to count
   */
  static aggregateByType(activities) {}
  
  /**
   * Get activities for a specific date
   * @param {Date} date - Target date
   * @param {Object} filters - Current filter state
   * @returns {Promise<Array<Object>>} Activities for that date
   */
  static async getActivitiesForDate(date, filters) {}
  
  /**
   * Apply role-based filtering to query
   * @param {firebase.firestore.Query} query - Base query
   * @param {string} userRole - User's role
   * @param {Object} userProfile - User's profile
   * @returns {firebase.firestore.Query} Filtered query
   */
  static applyRoleFilters(query, userRole, userProfile) {}
}
```

### 4. Visualization Renderer (`js/timeline-viz.js`)

**Purpose**: Render Chart.js visualizations

**Interface**:
```javascript
class TimelineVisualizer {
  /**
   * Render heatmap chart
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {Map<string, number>} data - Date to count mapping
   * @param {Function} onCellClick - Click handler
   * @returns {Chart} Chart.js instance
   */
  static renderHeatmap(canvas, data, onCellClick) {}
  
  /**
   * Render bar chart
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {Map<string, number>} data - Activity type to count mapping
   * @returns {Chart} Chart.js instance
   */
  static renderBarChart(canvas, data) {}
  
  /**
   * Generate color for heatmap cell based on activity count
   * @param {number} count - Activity count
   * @param {number} maxCount - Maximum count in dataset
   * @returns {string} CSS color string
   */
  static getHeatmapColor(count, maxCount) {}
  
  /**
   * Format tooltip content
   * @param {Object} context - Chart.js tooltip context
   * @returns {string} Formatted tooltip text
   */
  static formatTooltip(context) {}
  
  /**
   * Destroy chart instance
   * @param {Chart} chartInstance - Chart to destroy
   */
  static destroyChart(chartInstance) {}
}
```

## Data Models

### Activity Log Document (Firestore: `activity_logs` collection)

```javascript
{
  id: string,                    // Auto-generated document ID
  activityType: string,          // 'task_addition', 'task_completion', 'event_addition', 
                                 // 'user_registration', 'task_deletion', 'event_deletion'
  timestamp: Timestamp,          // Server timestamp
  userId: string,                // User ID who performed the action
  userName: string,              // User name (extracted from email)
  userRole: string,              // 'Student', 'CR', 'Faculty', 'Admin'
  department: string | null,     // Department (if applicable)
  semester: string | null,       // Semester (if applicable)
  section: string | null,        // Section (if applicable)
  taskId: string | null,         // Related task ID (if applicable)
  eventId: string | null,        // Related event ID (if applicable)
  taskType: string | null,       // 'assignment', 'homework', 'exam', etc. (if applicable)
  metadata: Object | null        // Additional metadata
}
```

### Firestore Indexes Required

```
Collection: activity_logs
Indexes:
1. timestamp (DESC), department (ASC), semester (ASC), section (ASC)
2. timestamp (DESC), userRole (ASC)
3. timestamp (DESC), activityType (ASC)
4. department (ASC), semester (ASC), section (ASC), timestamp (DESC)
```

### Filter State (Session Storage)

```javascript
{
  department: string | null,
  semester: string | null,
  section: string | null,
  view: 'heatmap' | 'bar'
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Activity logging preserves action success
*For any* user action (task addition, event addition, etc.), if the activity logging fails, the primary action should still complete successfully
**Validates: Requirements 1.9**

### Property 2: Role-based filtering correctness
*For any* user with role R and profile P, the activities returned by the timeline should only include activities that match the role's permission scope
**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

### Property 3: Filter combination correctness
*For any* combination of department, semester, and section filters, the displayed activities should match all applied filter criteria simultaneously
**Validates: Requirements 5.5, 5.6**

### Property 4: Date aggregation accuracy
*For any* set of activities, the sum of daily activity counts in the heatmap should equal the total number of activities in the dataset
**Validates: Requirements 7.2**

### Property 5: Activity type aggregation accuracy
*For any* set of activities, the sum of activity counts by type in the bar chart should equal the total number of activities in the dataset
**Validates: Requirements 6.2, 7.2**

### Property 6: Timestamp preservation
*For any* activity logged, the timestamp in the activity_logs collection should match the timestamp of the original action within 1 second
**Validates: Requirements 10.4**

### Property 7: Filter state persistence
*For any* filter state set during a session, reloading the timeline modal within the same session should restore the same filter state
**Validates: Requirements 5.9**

### Property 8: Metadata completeness
*For any* activity logged, all required metadata fields (userId, userRole, timestamp, activityType) should be present and non-null
**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8**

### Property 9: Privacy enforcement
*For any* activity displayed in the timeline, the user's email address should not be visible, only the userName (extracted from email)
**Validates: Requirements 8.5, 8.6**

### Property 10: Heatmap cell click consistency
*For any* heatmap cell clicked, the detail panel should display only activities from that specific date
**Validates: Requirements 4.1, 4.2**

## Error Handling

### Activity Logging Errors
- **Scenario**: Firestore write fails during activity logging
- **Handling**: Log error to console, do not throw exception, allow primary action to complete
- **User Impact**: None (silent failure)

### Data Retrieval Errors
- **Scenario**: Firestore query fails when loading timeline
- **Handling**: Display error message in modal: "Failed to load activity data. Please try again."
- **User Impact**: Timeline not displayed, user can retry

### Chart Rendering Errors
- **Scenario**: Chart.js fails to render visualization
- **Handling**: Display fallback message: "Unable to render chart. Please refresh the page."
- **User Impact**: No visualization, user must refresh

### Filter Query Errors
- **Scenario**: Invalid filter combination or query timeout
- **Handling**: Reset filters to default, display warning: "Filter query failed. Showing all activities."
- **User Impact**: Filters reset, all data shown

### Missing Metadata Errors
- **Scenario**: Activity log missing required fields
- **Handling**: Skip invalid records during aggregation, log warning to console
- **User Impact**: Some activities may not appear in timeline

### Permission Errors
- **Scenario**: User attempts to access activities outside their permission scope
- **Handling**: Apply role-based filters automatically, no error shown
- **User Impact**: Only permitted activities displayed

## Testing Strategy

### Unit Tests
- Test activity logger functions with various activity types
- Test role-based filter logic with different user roles
- Test date aggregation with edge cases (empty data, single day, leap years)
- Test filter state persistence in session storage
- Test metadata extraction from existing documents

### Property-Based Tests
- Property tests should run with minimum 100 iterations
- Each test must reference its design document property using the tag format:
  **Feature: activity-timeline-view, Property {number}: {property_text}**

**Property Test 1**: Activity logging failure isolation
- Generate random user actions
- Simulate Firestore write failures
- Verify primary action completes successfully
- **Feature: activity-timeline-view, Property 1: Activity logging preserves action success**

**Property Test 2**: Role-based filtering
- Generate random activities with various metadata
- Generate random user profiles with different roles
- Verify returned activities match role permissions
- **Feature: activity-timeline-view, Property 2: Role-based filtering correctness**

**Property Test 3**: Filter combinations
- Generate random activities
- Apply random filter combinations
- Verify all returned activities match all filter criteria
- **Feature: activity-timeline-view, Property 3: Filter combination correctness**

**Property Test 4**: Date aggregation
- Generate random activities across date range
- Aggregate by date
- Verify sum of daily counts equals total activities
- **Feature: activity-timeline-view, Property 4: Date aggregation accuracy**

**Property Test 5**: Type aggregation
- Generate random activities with various types
- Aggregate by type
- Verify sum of type counts equals total activities
- **Feature: activity-timeline-view, Property 5: Activity type aggregation accuracy**

**Property Test 6**: Metadata completeness
- Generate random activities
- Verify all required fields are present and non-null
- **Feature: activity-timeline-view, Property 8: Metadata completeness**

**Property Test 7**: Privacy enforcement
- Generate random activities with user emails
- Verify displayed data contains userName only, not full email
- **Feature: activity-timeline-view, Property 9: Privacy enforcement**

### Integration Tests
- Test end-to-end flow: log activity → open timeline → verify display
- Test filter interaction: apply filters → verify chart updates
- Test view toggle: switch between heatmap and bar chart
- Test detail panel: click cell → verify correct activities shown
- Test migration script with sample legacy data

### UI Tests
- Test modal open/close behavior
- Test responsive layout on mobile and desktop
- Test button placement beside Contributions button
- Test loading indicators during data fetch
- Test error message display

### Performance Tests
- Test timeline load time with 10,000 activity records
- Test timeline load time with 50,000 activity records
- Test filter query performance with various filter combinations
- Test chart rendering performance with 365 days of data

## Implementation Notes

### Chart.js Configuration
- Use Chart.js v3.x or later
- Use Matrix controller for heatmap visualization
- Configure responsive: true for mobile support
- Use custom tooltip callbacks for formatted display

### Firestore Query Optimization
- Use composite indexes for filtered queries
- Limit queries to date ranges (past 365 days by default)
- Use pagination for large result sets (>10,000 records)
- Cache aggregated data in memory during session

### Migration Script
- Run as one-time Cloud Function or local script
- Process tasks and events collections in batches of 500
- Use Firestore batch writes for efficiency
- Log migration progress and errors
- Make script idempotent (safe to run multiple times)

### Session Storage Keys
- `timeline_filters`: JSON string of filter state
- `timeline_view`: Current view type ('heatmap' or 'bar')
- `timeline_cache`: Cached aggregated data (expires on page reload)

### CSS Classes
- `.timeline-btn`: Timeline button styling
- `.timeline-modal`: Modal container
- `.timeline-filters`: Filter controls container
- `.timeline-chart-container`: Chart canvas wrapper
- `.timeline-detail-panel`: Detail panel overlay
- `.timeline-loading`: Loading indicator

### Accessibility
- Add ARIA labels to all interactive elements
- Ensure keyboard navigation for modal and filters
- Provide text alternatives for chart data
- Use sufficient color contrast for heatmap colors
- Support screen reader announcements for data updates
