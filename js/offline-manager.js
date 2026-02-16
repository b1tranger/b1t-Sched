/**
 * Offline Manager
 * Handles offline functionality, operation queueing, and background sync
 */

class OfflineManager {
  constructor() {
    this.QUEUE_KEY = 'offline-operation-queue';
    this.isOnline = navigator.onLine;
  }

  /**
   * Initialize offline manager
   */
  init() {
    console.log('[Offline Manager] Initializing...');

    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('[Offline Manager] Connection restored');
      this.isOnline = true;
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      console.log('[Offline Manager] Connection lost');
      this.isOnline = false;
    });

    // Process any queued operations on init
    if (this.isOnline) {
      this.processQueue();
    }

    console.log('[Offline Manager] Initialized');
  }

  /**
   * Queue an operation for later execution
   * @param {object} operation - Operation to queue
   * @returns {boolean}
   */
  queueOperation(operation) {
    try {
      const queue = this.getQueue();
      
      const queuedOp = {
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        ...operation
      };
      
      queue.push(queuedOp);
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
      
      console.log('[Offline Manager] Operation queued:', queuedOp);
      return true;
    } catch (error) {
      console.error('[Offline Manager] Error queueing operation:', error);
      return false;
    }
  }

  /**
   * Get the current operation queue
   * @returns {array}
   */
  getQueue() {
    try {
      const queueStr = localStorage.getItem(this.QUEUE_KEY);
      return queueStr ? JSON.parse(queueStr) : [];
    } catch (error) {
      console.error('[Offline Manager] Error reading queue:', error);
      return [];
    }
  }

  /**
   * Process queued operations
   * @returns {Promise<void>}
   */
  async processQueue() {
    if (!this.isOnline) {
      console.log('[Offline Manager] Cannot process queue - offline');
      return;
    }

    const queue = this.getQueue();
    
    if (queue.length === 0) {
      console.log('[Offline Manager] Queue is empty');
      return;
    }

    console.log(`[Offline Manager] Processing ${queue.length} queued operations`);

    const processed = [];
    const failed = [];

    for (const operation of queue) {
      try {
        await this.executeOperation(operation);
        processed.push(operation.id);
        console.log('[Offline Manager] Operation executed:', operation.id);
      } catch (error) {
        console.error('[Offline Manager] Operation failed:', operation.id, error);
        failed.push(operation.id);
      }
    }

    // Remove processed operations from queue
    const remainingQueue = queue.filter(op => !processed.includes(op.id));
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(remainingQueue));

    console.log(`[Offline Manager] Processed: ${processed.length}, Failed: ${failed.length}, Remaining: ${remainingQueue.length}`);
  }

  /**
   * Execute a queued operation
   * @param {object} operation - Operation to execute
   * @returns {Promise<void>}
   */
  async executeOperation(operation) {
    const { type, data } = operation;

    switch (type) {
      case 'create-task':
        return await this.executeCreateTask(data);
      
      case 'update-task':
        return await this.executeUpdateTask(data);
      
      case 'delete-task':
        return await this.executeDeleteTask(data);
      
      case 'create-event':
        return await this.executeCreateEvent(data);
      
      case 'update-event':
        return await this.executeUpdateEvent(data);
      
      case 'delete-event':
        return await this.executeDeleteEvent(data);
      
      default:
        console.warn('[Offline Manager] Unknown operation type:', type);
        throw new Error(`Unknown operation type: ${type}`);
    }
  }

  /**
   * Execute create task operation
   */
  async executeCreateTask(data) {
    if (typeof DB !== 'undefined' && DB.addTask) {
      await DB.addTask(data);
    } else {
      throw new Error('DB.addTask not available');
    }
  }

  /**
   * Execute update task operation
   */
  async executeUpdateTask(data) {
    if (typeof DB !== 'undefined' && DB.updateTask) {
      await DB.updateTask(data.id, data.updates);
    } else {
      throw new Error('DB.updateTask not available');
    }
  }

  /**
   * Execute delete task operation
   */
  async executeDeleteTask(data) {
    if (typeof DB !== 'undefined' && DB.deleteTask) {
      await DB.deleteTask(data.id);
    } else {
      throw new Error('DB.deleteTask not available');
    }
  }

  /**
   * Execute create event operation
   */
  async executeCreateEvent(data) {
    if (typeof DB !== 'undefined' && DB.addEvent) {
      await DB.addEvent(data);
    } else {
      throw new Error('DB.addEvent not available');
    }
  }

  /**
   * Execute update event operation
   */
  async executeUpdateEvent(data) {
    if (typeof DB !== 'undefined' && DB.updateEvent) {
      await DB.updateEvent(data.id, data.updates);
    } else {
      throw new Error('DB.updateEvent not available');
    }
  }

  /**
   * Execute delete event operation
   */
  async executeDeleteEvent(data) {
    if (typeof DB !== 'undefined' && DB.deleteEvent) {
      await DB.deleteEvent(data.id);
    } else {
      throw new Error('DB.deleteEvent not available');
    }
  }

  /**
   * Clear the operation queue
   */
  clearQueue() {
    localStorage.removeItem(this.QUEUE_KEY);
    console.log('[Offline Manager] Queue cleared');
  }

  /**
   * Get queue size
   * @returns {number}
   */
  getQueueSize() {
    return this.getQueue().length;
  }

  /**
   * Check if online
   * @returns {boolean}
   */
  checkOnlineStatus() {
    return navigator.onLine;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OfflineManager;
}
