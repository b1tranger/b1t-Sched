// ============================================
// NOTIFICATION MANAGER
// ============================================

/**
 * Core component that manages notification lifecycle, content generation, and user interactions
 */
const NotificationManager = {
  isInitialized: false,

  /**
   * Checks if notifications are supported in the browser
   * @returns {boolean}
   */
  isSupported() {
    return ('Notification' in window) || ('serviceWorker' in navigator && 'PushManager' in window);
  },

  /**
   * Initializes the notification system
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async init() {
    if (this.isInitialized) {
      return { success: true };
    }

    // Check browser support
    if (!this.isSupported()) {
      console.warn('Web Notifications API not supported in this browser');
      console.warn('Browser:', navigator.userAgent);
      return {
        success: false,
        error: 'Notifications not supported in this browser'
      };
    }

    // Initialize permission manager listeners
    PermissionManager.initPromptListeners();

    // Check if we should show permission prompt
    if (PermissionManager.shouldShowPrompt()) {
      PermissionManager.showPermissionPrompt();
    }

    this.isInitialized = true;
    console.log('Notification system initialized');

    return { success: true };
  },

  /**
   * Shows a notification for a new task
   * @param {TaskDocument} task - Task data from Firestore
   * @returns {Promise<Notification|null>}
   */
  async showTaskNotification(task) {
    // Check permission
    if (!PermissionManager.isGranted()) {
      console.log('Notification permission not granted, skipping task notification');
      return null;
    }

    try {
      // Format notification content
      const notificationData = NotificationContentFormatter.formatTaskNotification(task);

      // Prioritize Service Worker showNotification (required for mobile browsers, works on modern desktop)
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if (registration && typeof registration.showNotification === 'function') {
            await registration.showNotification(notificationData.title, {
              body: notificationData.body,
              icon: notificationData.icon || '/images/icon-192x192.png',
              tag: notificationData.tag,
              requireInteraction: notificationData.requireInteraction,
              data: notificationData.data,
              badge: '/Social-Preview.webp',
              vibrate: [200, 100, 200]
            });
            console.log('Task notification displayed via Service Worker:', task.id);
            return null; // Service Worker notifications don't return a Notification object
          }
        } catch (swError) {
          console.warn('Service Worker notification failed, falling back:', swError);
        }
      }

      // Fallback to regular Notification API (desktop browsers where supported)
      if (typeof Notification !== 'undefined') {
        const notification = new Notification(notificationData.title, {
          body: notificationData.body,
          icon: notificationData.icon,
          tag: notificationData.tag,
          requireInteraction: notificationData.requireInteraction,
          data: notificationData.data
        });

        // Handle click event
        notification.onclick = () => {
          this.handleNotificationClick('task', task.id);
          notification.close();
        };

        console.log('Task notification displayed:', task.id);
        return notification;
      }
      return null;
    } catch (error) {
      console.error('Failed to display task notification:', error);
      console.error('Task ID:', task.id);
      console.error('Task title:', task.title);
      return null;
    }
  },

  /**
   * Shows a notification for a new event
   * @param {EventDocument} event - Event data from Firestore
   * @returns {Promise<Notification|null>}
   */
  async showEventNotification(event) {
    // Check permission
    if (!PermissionManager.isGranted()) {
      console.log('Notification permission not granted, skipping event notification');
      return null;
    }

    try {
      // Format notification content
      const notificationData = NotificationContentFormatter.formatEventNotification(event);

      // Prioritize Service Worker showNotification (required for mobile browsers, works on modern desktop)
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if (registration && typeof registration.showNotification === 'function') {
            await registration.showNotification(notificationData.title, {
              body: notificationData.body,
              icon: notificationData.icon || '/images/icon-192x192.png',
              tag: notificationData.tag,
              requireInteraction: notificationData.requireInteraction,
              data: notificationData.data,
              badge: '/Social-Preview.webp',
              vibrate: [200, 100, 200]
            });
            console.log('Event notification displayed via Service Worker:', event.id);
            return null; // Service Worker notifications don't return a Notification object
          }
        } catch (swError) {
          console.warn('Service Worker event notification failed, falling back:', swError);
        }
      }

      // Fallback to regular Notification API (desktop browsers)
      if (typeof Notification !== 'undefined') {
        const notification = new Notification(notificationData.title, {
          body: notificationData.body,
          icon: notificationData.icon,
          tag: notificationData.tag,
          requireInteraction: notificationData.requireInteraction,
          data: notificationData.data
        });

        // Handle click event
        notification.onclick = () => {
          this.handleNotificationClick('event', event.id);
          notification.close();
        };

        console.log('Event notification displayed:', event.id);
        return notification;
      }
      return null;
    } catch (error) {
      console.error('Failed to display event notification:', error);
      console.error('Event ID:', event.id);
      console.error('Event title:', event.title);
      return null;
    }
  },

  /**
   * Shows a notification for a new CR notice
   * @param {Object} notice - Notice data from Firestore
   * @returns {Promise<Notification|null>}
   */
  async showNoticeNotification(notice) {
    // Check permission
    if (!PermissionManager.isGranted()) {
      console.log('Notification permission not granted, skipping notice notification');
      return null;
    }

    try {
      // Format notification content
      const notificationData = NotificationContentFormatter.formatNoticeNotification(notice);

      // Prioritize Service Worker showNotification (required for mobile browsers, works on modern desktop)
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if (registration && typeof registration.showNotification === 'function') {
            await registration.showNotification(notificationData.title, {
              body: notificationData.body,
              icon: notificationData.icon || '/images/icon-192x192.png',
              tag: notificationData.tag,
              requireInteraction: notificationData.requireInteraction,
              data: notificationData.data,
              badge: '/Social-Preview.webp',
              vibrate: [200, 100, 200]
            });
            console.log('Notice notification displayed via Service Worker:', notice.id);
            return null;
          }
        } catch (swError) {
          console.warn('Service Worker notice notification failed, falling back:', swError);
        }
      }

      // Fallback to regular Notification API (desktop browsers)
      if (typeof Notification !== 'undefined') {
        const notification = new Notification(notificationData.title, {
          body: notificationData.body,
          icon: notificationData.icon,
          tag: notificationData.tag,
          requireInteraction: notificationData.requireInteraction,
          data: notificationData.data
        });

        // Handle click event
        notification.onclick = () => {
          this.handleNotificationClick('notice', notice.id);
          notification.close();
        };

        console.log('Notice notification displayed:', notice.id);
        return notification;
      }
      return null;
    } catch (error) {
      console.error('Failed to display notice notification:', error);
      console.error('Notice ID:', notice.id);
      console.error('Notice title:', notice.title);
      return null;
    }
  },

  /**
   * Handles notification click events
   * @param {string} type - 'task', 'event', or 'notice'
   * @param {string} id - Document ID
   */
  handleNotificationClick(type, id) {
    // Focus or open the application window
    if (window.focus) {
      window.focus();
    }

    // Navigate to dashboard (tasks, events, and notices are all displayed there)
    if (window.Router) {
      Router.navigate('dashboard');
    } else {
      window.location.hash = '#/dashboard';
    }

    console.log(`Notification clicked: ${type} ${id}`);
  },

  /**
   * Resets the notification system (called on logout)
   */
  reset() {
    this.isInitialized = false;
    console.log('Notification system reset');
  }
};
