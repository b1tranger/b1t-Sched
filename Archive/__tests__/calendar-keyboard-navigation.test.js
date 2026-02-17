/**
 * Calendar View - Keyboard Navigation Tests
 * Tests for Task 11.2: Implement keyboard navigation
 * Requirements: 10.2
 */

import { jest } from '@jest/globals';

// Import the calendar view module
const { CalendarView } = await import('../js/calendar-view.js');

describe('Calendar View - Keyboard Navigation (Task 11.2)', () => {
  let calendar;
  let mockModal;
  let mockGridContainer;
  let mockHeaderElement;
  let createdElements;
  let mockSectionHeader;
  let eventListeners;

  beforeEach(() => {
    // Track created elements and event listeners
    createdElements = [];
    eventListeners = {
      document: [],
      elements: new Map()
    };

    // Create mock section header
    mockSectionHeader = {
      tagName: 'DIV',
      className: 'section-header',
      children: [
        {
          tagName: 'H2',
          textContent: 'Pending Tasks',
          parentElement: null
        }
      ],
      appendChild: function(child) {
        this.children.push(child);
        return child;
      }
    };
    mockSectionHeader.children[0].parentElement = mockSectionHeader;

    // Create mock grid container
    mockGridContainer = {
      id: 'calendar-grid',
      innerHTML: '',
      children: [],
      attributes: {},
      setAttribute: function(name, value) {
        this.attributes[name] = value;
      },
      getAttribute: function(name) {
        return this.attributes[name];
      },
      appendChild: function(child) {
        this.children.push(child);
        return child;
      },
      querySelectorAll: function(selector) {
        if (selector === '.calendar-cell') {
          return this.children.filter(c => c.className && c.className.includes('calendar-cell'));
        }
        return [];
      }
    };

    // Create mock header element
    mockHeaderElement = {
      id: 'calendar-title',
      textContent: '',
      attributes: {},
      setAttribute: function(name, value) {
        this.attributes[name] = value;
      },
      getAttribute: function(name) {
        return this.attributes[name];
      }
    };

    // Create mock modal
    mockModal = null;

    // Mock document
    global.document = {
      createElement: (tagName) => {
        const element = {
          tagName: tagName.toUpperCase(),
          className: '',
          id: '',
          innerHTML: '',
          textContent: '',
          style: {},
          attributes: {},
          children: [],
          eventListeners: [],
          classList: {
            add: function(...classes) {
              classes.forEach(cls => {
                if (!this.contains(cls)) {
                  element.className = element.className ? `${element.className} ${cls}` : cls;
                }
              });
            },
            contains: function(cls) {
              return element.className.split(' ').includes(cls);
            }
          },
          setAttribute: function(name, value) {
            this.attributes[name] = value;
          },
          getAttribute: function(name) {
            return this.attributes[name];
          },
          appendChild: function(child) {
            this.children.push(child);
            return child;
          },
          querySelector: function(selector) {
            if (selector === '.calendar-close-btn') {
              return this.children.find(c => c.className && c.className.includes('calendar-close-btn'));
            }
            return null;
          },
          querySelectorAll: function(selector) {
            if (selector === '.calendar-cell') {
              return this.children.filter(c => c.className && c.className.includes('calendar-cell'));
            }
            return [];
          },
          addEventListener: function(event, handler) {
            this.eventListeners.push({ event, handler });
            if (!eventListeners.elements.has(this)) {
              eventListeners.elements.set(this, []);
            }
            eventListeners.elements.get(this).push({ event, handler });
          },
          focus: function() {}
        };
        createdElements.push(element);
        return element;
      },
      getElementById: (id) => {
        if (id === 'calendar-grid') {
          return mockGridContainer;
        }
        if (id === 'calendar-title') {
          return mockHeaderElement;
        }
        if (id === 'calendar-modal') {
          return mockModal;
        }
        if (id === 'calendar-view-btn') {
          return createdElements.find(el => el.id === 'calendar-view-btn');
        }
        if (id === 'calendar-prev-month') {
          return createdElements.find(el => el.id === 'calendar-prev-month');
        }
        if (id === 'calendar-next-month') {
          return createdElements.find(el => el.id === 'calendar-next-month');
        }
        return null;
      },
      querySelector: (selector) => {
        if (selector === '.calendar-close-btn') {
          return createdElements.find(el => el.className && el.className.includes('calendar-close-btn'));
        }
        if (selector === '.calendar-grid-container') {
          return createdElements.find(el => el.className && el.className.includes('calendar-grid-container'));
        }
        return null;
      },
      querySelectorAll: (selector) => {
        if (selector === '.section-header h2') {
          return [mockSectionHeader.children[0]];
        }
        if (selector === '.calendar-cell') {
          return mockGridContainer.children.filter(c => c.className && c.className.includes('calendar-cell'));
        }
        return [];
      },
      body: {
        appendChild: function(child) {
          if (child.id === 'calendar-modal') {
            mockModal = child;
          }
          return child;
        },
        style: {}
      },
      addEventListener: function(event, handler) {
        eventListeners.document.push({ event, handler });
      }
    };

    // Set up global App
    global.App = {
      currentTasks: [],
      userCompletions: {}
    };

    // Create calendar instance
    calendar = new CalendarView();
    calendar.init();
  });

  afterEach(() => {
    // Clean up
    delete global.document;
    delete global.App;
  });

  describe('Tab Order and Tabindex', () => {
    it('should set tabindex="0" on previous month button', () => {
      const prevBtn = createdElements.find(el => el.id === 'calendar-prev-month');
      expect(prevBtn).toBeTruthy();
      expect(prevBtn.getAttribute('tabindex')).toBe('0');
    });

    it('should set tabindex="0" on next month button', () => {
      const nextBtn = createdElements.find(el => el.id === 'calendar-next-month');
      expect(nextBtn).toBeTruthy();
      expect(nextBtn.getAttribute('tabindex')).toBe('0');
    });

    it('should set tabindex="0" on close button', () => {
      const closeBtn = createdElements.find(el => 
        el.className && el.className.includes('calendar-close-btn')
      );
      expect(closeBtn).toBeTruthy();
      expect(closeBtn.getAttribute('tabindex')).toBe('0');
    });

    it('should set tabindex="-1" on modal container', () => {
      const modal = mockModal;
      expect(modal).toBeTruthy();
      expect(modal.getAttribute('tabindex')).toBe('-1');
    });

    it('should set role="grid" on calendar grid', () => {
      const grid = createdElements.find(el => el.id === 'calendar-grid');
      expect(grid).toBeTruthy();
      expect(grid.getAttribute('role')).toBe('grid');
    });

    it('should set aria-label on calendar grid', () => {
      const grid = createdElements.find(el => el.id === 'calendar-grid');
      expect(grid).toBeTruthy();
      expect(grid.getAttribute('aria-label')).toBe('Calendar grid');
    });
  });

  describe('Keyboard Event Handlers', () => {
    it('should register keydown event listener on document', () => {
      const keydownListeners = eventListeners.document.filter(l => l.event === 'keydown');
      expect(keydownListeners.length).toBeGreaterThan(0);
    });

    it('should close modal on Escape key when modal is open', () => {
      calendar.isOpen = true;
      calendar.modal = mockModal;
      calendar.close = jest.fn();

      // Find and trigger the keydown listener
      const keydownListener = eventListeners.document.find(l => l.event === 'keydown');
      expect(keydownListener).toBeTruthy();

      keydownListener.handler({ key: 'Escape' });
      expect(calendar.close).toHaveBeenCalled();
    });

    it('should not close modal on Escape key when modal is closed', () => {
      calendar.isOpen = false;
      calendar.close = jest.fn();

      // Find and trigger the keydown listener
      const keydownListener = eventListeners.document.find(l => l.event === 'keydown');
      expect(keydownListener).toBeTruthy();

      keydownListener.handler({ key: 'Escape' });
      expect(calendar.close).not.toHaveBeenCalled();
    });

    it('should navigate to previous month on Ctrl+ArrowLeft', () => {
      calendar.isOpen = true;
      calendar.previousMonth = jest.fn();

      // Find and trigger the keydown listener
      const keydownListener = eventListeners.document.find(l => l.event === 'keydown');
      expect(keydownListener).toBeTruthy();

      const event = { 
        key: 'ArrowLeft', 
        ctrlKey: true,
        preventDefault: jest.fn()
      };
      keydownListener.handler(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(calendar.previousMonth).toHaveBeenCalled();
    });

    it('should navigate to next month on Ctrl+ArrowRight', () => {
      calendar.isOpen = true;
      calendar.nextMonth = jest.fn();

      // Find and trigger the keydown listener
      const keydownListener = eventListeners.document.find(l => l.event === 'keydown');
      expect(keydownListener).toBeTruthy();

      const event = { 
        key: 'ArrowRight', 
        ctrlKey: true,
        preventDefault: jest.fn()
      };
      keydownListener.handler(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(calendar.nextMonth).toHaveBeenCalled();
    });

    it('should navigate to previous month on Cmd+ArrowLeft (Mac)', () => {
      calendar.isOpen = true;
      calendar.previousMonth = jest.fn();

      // Find and trigger the keydown listener
      const keydownListener = eventListeners.document.find(l => l.event === 'keydown');
      expect(keydownListener).toBeTruthy();

      const event = { 
        key: 'ArrowLeft', 
        metaKey: true,
        preventDefault: jest.fn()
      };
      keydownListener.handler(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(calendar.previousMonth).toHaveBeenCalled();
    });

    it('should navigate to next month on Cmd+ArrowRight (Mac)', () => {
      calendar.isOpen = true;
      calendar.nextMonth = jest.fn();

      // Find and trigger the keydown listener
      const keydownListener = eventListeners.document.find(l => l.event === 'keydown');
      expect(keydownListener).toBeTruthy();

      const event = { 
        key: 'ArrowRight', 
        metaKey: true,
        preventDefault: jest.fn()
      };
      keydownListener.handler(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(calendar.nextMonth).toHaveBeenCalled();
    });
  });

  describe('Navigation Button Keyboard Support', () => {
    it('should add keydown listener to previous month button', () => {
      const prevBtn = createdElements.find(el => el.id === 'calendar-prev-month');
      expect(prevBtn).toBeTruthy();
      
      const keydownListeners = prevBtn.eventListeners.filter(l => l.event === 'keydown');
      expect(keydownListeners.length).toBeGreaterThan(0);
    });

    it('should add keydown listener to next month button', () => {
      const nextBtn = createdElements.find(el => el.id === 'calendar-next-month');
      expect(nextBtn).toBeTruthy();
      
      const keydownListeners = nextBtn.eventListeners.filter(l => l.event === 'keydown');
      expect(keydownListeners.length).toBeGreaterThan(0);
    });

    it('should trigger previousMonth on Enter key press', () => {
      const prevBtn = createdElements.find(el => el.id === 'calendar-prev-month');
      calendar.previousMonth = jest.fn();

      const keydownListener = prevBtn.eventListeners.find(l => l.event === 'keydown');
      expect(keydownListener).toBeTruthy();

      const event = { 
        key: 'Enter',
        preventDefault: jest.fn()
      };
      keydownListener.handler(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(calendar.previousMonth).toHaveBeenCalled();
    });

    it('should trigger previousMonth on Space key press', () => {
      const prevBtn = createdElements.find(el => el.id === 'calendar-prev-month');
      calendar.previousMonth = jest.fn();

      const keydownListener = prevBtn.eventListeners.find(l => l.event === 'keydown');
      expect(keydownListener).toBeTruthy();

      const event = { 
        key: ' ',
        preventDefault: jest.fn()
      };
      keydownListener.handler(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(calendar.previousMonth).toHaveBeenCalled();
    });

    it('should trigger nextMonth on Enter key press', () => {
      const nextBtn = createdElements.find(el => el.id === 'calendar-next-month');
      calendar.nextMonth = jest.fn();

      const keydownListener = nextBtn.eventListeners.find(l => l.event === 'keydown');
      expect(keydownListener).toBeTruthy();

      const event = { 
        key: 'Enter',
        preventDefault: jest.fn()
      };
      keydownListener.handler(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(calendar.nextMonth).toHaveBeenCalled();
    });

    it('should trigger nextMonth on Space key press', () => {
      const nextBtn = createdElements.find(el => el.id === 'calendar-next-month');
      calendar.nextMonth = jest.fn();

      const keydownListener = nextBtn.eventListeners.find(l => l.event === 'keydown');
      expect(keydownListener).toBeTruthy();

      const event = { 
        key: ' ',
        preventDefault: jest.fn()
      };
      keydownListener.handler(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(calendar.nextMonth).toHaveBeenCalled();
    });
  });

  describe('Task Element Keyboard Accessibility', () => {
    beforeEach(() => {
      // Set up test data
      global.App.currentTasks = [
        {
          id: 'task-1',
          title: 'Test Task 1',
          course: 'Math',
          type: 'assignment',
          deadline: new Date(2024, 0, 15, 10, 0)
        }
      ];

      calendar.displayedYear = 2024;
      calendar.displayedMonth = 0;
      calendar.renderCalendar();
    });

    it('should set tabindex="0" on task elements', () => {
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      const jan15Cell = Array.from(cells).find(cell => 
        cell.getAttribute('data-date') === '2024-01-15'
      );

      expect(jan15Cell).toBeTruthy();
      
      // Find the tasks container
      const tasksContainer = jan15Cell.children.find(c => 
        c.className && c.className.includes('calendar-cell-tasks')
      );
      
      expect(tasksContainer).toBeTruthy();
      
      // Find task elements within the tasks container
      const taskElements = tasksContainer.children.filter(c => 
        c.className && c.className.includes('calendar-task') && !c.className.includes('calendar-task-more')
      );

      expect(taskElements.length).toBeGreaterThan(0);
      taskElements.forEach(taskEl => {
        expect(taskEl.getAttribute('tabindex')).toBe('0');
      });
    });

    it('should set role="button" on task elements', () => {
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      const jan15Cell = Array.from(cells).find(cell => 
        cell.getAttribute('data-date') === '2024-01-15'
      );

      expect(jan15Cell).toBeTruthy();
      
      const tasksContainer = jan15Cell.children.find(c => 
        c.className && c.className.includes('calendar-cell-tasks')
      );
      
      expect(tasksContainer).toBeTruthy();
      
      const taskElements = tasksContainer.children.filter(c => 
        c.className && c.className.includes('calendar-task') && !c.className.includes('calendar-task-more')
      );

      expect(taskElements.length).toBeGreaterThan(0);
      taskElements.forEach(taskEl => {
        expect(taskEl.getAttribute('role')).toBe('button');
      });
    });

    it('should set descriptive aria-label on task elements', () => {
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      const jan15Cell = Array.from(cells).find(cell => 
        cell.getAttribute('data-date') === '2024-01-15'
      );

      expect(jan15Cell).toBeTruthy();
      
      const tasksContainer = jan15Cell.children.find(c => 
        c.className && c.className.includes('calendar-cell-tasks')
      );
      
      expect(tasksContainer).toBeTruthy();
      
      const taskElements = tasksContainer.children.filter(c => 
        c.className && c.className.includes('calendar-task') && !c.className.includes('calendar-task-more')
      );

      expect(taskElements.length).toBeGreaterThan(0);
      const taskEl = taskElements[0];
      const ariaLabel = taskEl.getAttribute('aria-label');
      
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toContain('Test Task 1');
      expect(ariaLabel).toContain('assignment');
      expect(ariaLabel).toContain('Math');
    });

    it('should add keydown listener to task elements', () => {
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      const jan15Cell = Array.from(cells).find(cell => 
        cell.getAttribute('data-date') === '2024-01-15'
      );

      expect(jan15Cell).toBeTruthy();
      
      const tasksContainer = jan15Cell.children.find(c => 
        c.className && c.className.includes('calendar-cell-tasks')
      );
      
      expect(tasksContainer).toBeTruthy();
      
      const taskElements = tasksContainer.children.filter(c => 
        c.className && c.className.includes('calendar-task') && !c.className.includes('calendar-task-more')
      );

      expect(taskElements.length).toBeGreaterThan(0);
      const taskEl = taskElements[0];
      
      const keydownListeners = taskEl.eventListeners.filter(l => l.event === 'keydown');
      expect(keydownListeners.length).toBeGreaterThan(0);
    });

    it('should trigger showTaskDetails on Enter key press', () => {
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      const jan15Cell = Array.from(cells).find(cell => 
        cell.getAttribute('data-date') === '2024-01-15'
      );

      expect(jan15Cell).toBeTruthy();
      
      const tasksContainer = jan15Cell.children.find(c => 
        c.className && c.className.includes('calendar-cell-tasks')
      );
      
      expect(tasksContainer).toBeTruthy();
      
      const taskElements = tasksContainer.children.filter(c => 
        c.className && c.className.includes('calendar-task') && !c.className.includes('calendar-task-more')
      );

      expect(taskElements.length).toBeGreaterThan(0);
      const taskEl = taskElements[0];
      
      calendar.showTaskDetails = jest.fn();

      const keydownListener = taskEl.eventListeners.find(l => l.event === 'keydown');
      expect(keydownListener).toBeTruthy();

      const event = { 
        key: 'Enter',
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      };
      keydownListener.handler(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(calendar.showTaskDetails).toHaveBeenCalledWith('task-1');
    });

    it('should trigger showTaskDetails on Space key press', () => {
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      const jan15Cell = Array.from(cells).find(cell => 
        cell.getAttribute('data-date') === '2024-01-15'
      );

      expect(jan15Cell).toBeTruthy();
      
      const tasksContainer = jan15Cell.children.find(c => 
        c.className && c.className.includes('calendar-cell-tasks')
      );
      
      expect(tasksContainer).toBeTruthy();
      
      const taskElements = tasksContainer.children.filter(c => 
        c.className && c.className.includes('calendar-task') && !c.className.includes('calendar-task-more')
      );

      expect(taskElements.length).toBeGreaterThan(0);
      const taskEl = taskElements[0];
      
      calendar.showTaskDetails = jest.fn();

      const keydownListener = taskEl.eventListeners.find(l => l.event === 'keydown');
      expect(keydownListener).toBeTruthy();

      const event = { 
        key: ' ',
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      };
      keydownListener.handler(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(calendar.showTaskDetails).toHaveBeenCalledWith('task-1');
    });

    it('should set aria-hidden="true" on task type badge', () => {
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      const jan15Cell = Array.from(cells).find(cell => 
        cell.getAttribute('data-date') === '2024-01-15'
      );

      expect(jan15Cell).toBeTruthy();
      
      const tasksContainer = jan15Cell.children.find(c => 
        c.className && c.className.includes('calendar-cell-tasks')
      );
      
      expect(tasksContainer).toBeTruthy();
      
      const taskElements = tasksContainer.children.filter(c => 
        c.className && c.className.includes('calendar-task') && !c.className.includes('calendar-task-more')
      );

      expect(taskElements.length).toBeGreaterThan(0);
      const taskEl = taskElements[0];
      
      const badge = taskEl.children.find(c => 
        c.className && c.className.includes('task-type-badge')
      );
      
      expect(badge).toBeTruthy();
      expect(badge.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('Complete Keyboard Navigation Compliance', () => {
    it('should have all required keyboard navigation features for Requirement 10.2', () => {
      // Set up test data
      global.App.currentTasks = [
        {
          id: 'task-1',
          title: 'Test Task',
          course: 'Math',
          type: 'assignment',
          deadline: new Date(2024, 0, 15, 10, 0)
        }
      ];

      calendar.displayedYear = 2024;
      calendar.displayedMonth = 0;
      calendar.renderCalendar();

      // Check navigation buttons have tabindex
      const prevBtn = createdElements.find(el => el.id === 'calendar-prev-month');
      const nextBtn = createdElements.find(el => el.id === 'calendar-next-month');
      const closeBtn = createdElements.find(el => 
        el.className && el.className.includes('calendar-close-btn')
      );
      
      expect(prevBtn.getAttribute('tabindex')).toBe('0');
      expect(nextBtn.getAttribute('tabindex')).toBe('0');
      expect(closeBtn.getAttribute('tabindex')).toBe('0');

      // Check navigation buttons have keyboard event listeners
      expect(prevBtn.eventListeners.some(l => l.event === 'keydown')).toBe(true);
      expect(nextBtn.eventListeners.some(l => l.event === 'keydown')).toBe(true);

      // Check document has keydown listener for Escape and arrow keys
      expect(eventListeners.document.some(l => l.event === 'keydown')).toBe(true);

      // Check task elements are keyboard accessible
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      const jan15Cell = Array.from(cells).find(cell => 
        cell.getAttribute('data-date') === '2024-01-15'
      );

      const tasksContainer = jan15Cell.children.find(c => 
        c.className && c.className.includes('calendar-cell-tasks')
      );
      
      expect(tasksContainer).toBeTruthy();
      
      const taskElements = tasksContainer.children.filter(c => 
        c.className && c.className.includes('calendar-task') && !c.className.includes('calendar-task-more')
      );

      expect(taskElements.length).toBeGreaterThan(0);
      taskElements.forEach(taskEl => {
        expect(taskEl.getAttribute('tabindex')).toBe('0');
        expect(taskEl.getAttribute('role')).toBe('button');
        expect(taskEl.eventListeners.some(l => l.event === 'keydown')).toBe(true);
      });
    });
  });
});
