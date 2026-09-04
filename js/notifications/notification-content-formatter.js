// ============================================
// NOTIFICATION CONTENT FORMATTER
// ============================================

/**
 * Formats task and event data into notification-friendly content
 */
const NotificationContentFormatter = {
  /**
   * Maximum lengths for notification content
   */
  MAX_TITLE_LENGTH: 50,
  MAX_BODY_LENGTH: 150,

  /**
   * Formats task data for notification
   * @param {TaskDocument} task - Task document from Firestore
   * @returns {{title: string, body: string, icon: string, data: object}}
   */
  formatTaskNotification(task) {
    const title = this.truncate(task.title || 'New Task', this.MAX_TITLE_LENGTH);

    // Build body with course and description
    let body = '';
    if (task.course) {
      body += `${task.course}`;
    }
    if (task.description) {
      body += body ? ` - ${task.description}` : task.description;
    }
    if (task.deadline) {
      const deadlineStr = this.formatDateTime(task.deadline);
      body += body ? ` | Due: ${deadlineStr}` : `Due: ${deadlineStr}`;
    }

    body = this.truncate(body || 'A new task has been added', this.MAX_BODY_LENGTH);

    return {
      title,
      body,
      icon: this.getIcon('task'),
      tag: `task-${task.id}`,
      requireInteraction: false,
      data: {
        type: 'task',
        id: task.id,
        timestamp: Date.now()
      }
    };
  },

  /**
   * Formats event data for notification
   * @param {EventDocument} event - Event document from Firestore
   * @returns {{title: string, body: string, icon: string, data: object}}
   */
  formatEventNotification(event) {
    const title = this.truncate(event.title || 'New Event', this.MAX_TITLE_LENGTH);

    // Build body with date/time and description
    let body = '';
    if (event.date) {
      body = this.formatDateTime(event.date);
    }
    if (event.description) {
      body += body ? ` - ${event.description}` : event.description;
    }

    body = this.truncate(body || 'A new event has been added', this.MAX_BODY_LENGTH);

    return {
      title,
      body,
      icon: this.getIcon('event'),
      tag: `event-${event.id}`,
      requireInteraction: false,
      data: {
        type: 'event',
        id: event.id,
        timestamp: Date.now()
      }
    };
  },

  /**
   * Formats notice data for notification
   * @param {Object} notice - CR Notice document from Firestore
   * @returns {{title: string, body: string, icon: string, data: object}}
   */
  formatNoticeNotification(notice) {
    const title = this.truncate(notice.title || 'New Notice', this.MAX_TITLE_LENGTH);

    // Build body with priority and description
    let body = '';
    if (notice.priority === 'urgent') {
      body += '🔴 Urgent: ';
    } else if (notice.priority === 'important') {
      body += '⚠️ Important: ';
    }
    if (notice.description) {
      body += notice.description;
    }
    if (notice.deadline) {
      const deadlineStr = this.formatDateTime(notice.deadline);
      body += body ? ` | Deadline: ${deadlineStr}` : `Deadline: ${deadlineStr}`;
    }

    body = this.truncate(body || 'A new notice has been posted', this.MAX_BODY_LENGTH);

    return {
      title,
      body,
      icon: this.getIcon('notice'),
      tag: `notice-${notice.id}`,
      requireInteraction: notice.priority === 'urgent',
      data: {
        type: 'notice',
        id: notice.id,
        timestamp: Date.now()
      }
    };
  },

  /**
   * Truncates text with ellipsis, preserving word boundaries when possible
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum character length
   * @returns {string}
   */
  truncate(text, maxLength) {
    if (!text || text.length <= maxLength) {
      return text || '';
    }

    // Try to truncate at word boundary
    const truncated = text.substring(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');

    // If we can preserve most of the content (>80%), break at word
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    }

    // Otherwise, hard truncate
    return truncated + '...';
  },

  /**
   * Formats date/time for display in notifications
   * @param {Date|firebase.firestore.Timestamp} date - Date to format
   * @returns {string}
   */
  formatDateTime(date) {
    if (!date) return '';

    // Convert Firestore Timestamp to Date if needed
    const d = date.toDate ? date.toDate() : new Date(date);

    const now = new Date();
    const diffMs = d - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Format based on proximity
    if (diffDays === 0) {
      // Today - show time
      return `Today at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      // Tomorrow
      return `Tomorrow at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays > 1 && diffDays < 7) {
      // This week - show day name
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } else {
      // Further out - show full date
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  },

  /**
   * Gets appropriate icon for notification type
   * @param {string} type - 'task', 'event', or 'notice'
   * @returns {string} Icon URL
   */
  getIcon(type) {
    // Use the app logo as the icon
    // In a production app, you might have different icons for tasks vs events
    return '/Social-Preview.webp';
  }
};
