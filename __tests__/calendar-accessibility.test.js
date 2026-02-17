/**
 * Calendar View - Accessibility Tests
 * Tests for Task 11.1: Add ARIA labels and roles
 * Requirements: 10.4, 10.5
 */

// Import the calendar view module
const { CalendarView } = await import('../js/calendar-view.js');

describe('Calendar View - Accessibility (Task 11.1)', () => {
  let calendar;
  let mockModal;
  let mockGridContainer;
  let mockHeaderElement;
  let createdElements;
  let mockSectionHeader;

  beforeEach(() => {
    // Track created elements
    createdElements = [];

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
          addEventListener: function() {},
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
          // Find the button in created elements
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
      addEventListener: function() {}
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

  describe('Modal ARIA Attributes', () => {
    it('should have role="dialog" on modal', () => {
      const modal = mockModal;
      expect(modal).toBeTruthy();
      expect(modal.getAttribute('role')).toBe('dialog');
    });

    it('should have aria-modal="true" on modal', () => {
      const modal = mockModal;
      expect(modal).toBeTruthy();
      expect(modal.getAttribute('aria-modal')).toBe('true');
    });

    it('should have aria-labelledby pointing to modal title', () => {
      const modal = mockModal;
      expect(modal).toBeTruthy();
      expect(modal.getAttribute('aria-labelledby')).toBe('calendar-title');
    });

    it('should have modal title element with correct id', () => {
      const title = mockHeaderElement;
      expect(title).toBeTruthy();
      expect(title.id).toBe('calendar-title');
    });
  });

  describe('Navigation Button ARIA Labels', () => {
    it('should have aria-label="Previous month" on previous month button', () => {
      const prevBtn = createdElements.find(el => el.id === 'calendar-prev-month');
      expect(prevBtn).toBeTruthy();
      expect(prevBtn.getAttribute('aria-label')).toBe('Previous month');
    });

    it('should have aria-label="Next month" on next month button', () => {
      const nextBtn = createdElements.find(el => el.id === 'calendar-next-month');
      expect(nextBtn).toBeTruthy();
      expect(nextBtn.getAttribute('aria-label')).toBe('Next month');
    });

    it('should have aria-label="Close calendar" on close button', () => {
      const closeBtn = createdElements.find(el => 
        el.className && el.className.includes('calendar-close-btn')
      );
      expect(closeBtn).toBeTruthy();
      expect(closeBtn.getAttribute('aria-label')).toBe('Close calendar');
    });
  });

  describe('Calendar Cell ARIA Attributes', () => {
    beforeEach(() => {
      // Set up test data
      global.App.currentTasks = [
        {
          id: 'task-1',
          title: 'Test Task 1',
          course: 'Math',
          type: 'assignment',
          deadline: new Date(2024, 0, 15, 10, 0) // January 15, 2024
        },
        {
          id: 'task-2',
          title: 'Test Task 2',
          course: 'Science',
          type: 'exam',
          deadline: new Date(2024, 0, 15, 14, 0) // January 15, 2024
        }
      ];

      calendar.displayedYear = 2024;
      calendar.displayedMonth = 0; // January
      calendar.renderCalendar();
    });

    it('should have role="gridcell" on all calendar cells', () => {
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      expect(cells.length).toBeGreaterThan(0);

      cells.forEach(cell => {
        expect(cell.getAttribute('role')).toBe('gridcell');
      });
    });

    it('should have aria-label with date on all calendar cells', () => {
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      expect(cells.length).toBeGreaterThan(0);

      cells.forEach(cell => {
        const ariaLabel = cell.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
        // Should match format: "Month Day, Year"
        expect(ariaLabel).toMatch(/\w+ \d+, \d{4}/);
      });
    });

    it('should include task count in aria-label for cells with tasks', () => {
      // Find the cell for January 15, 2024 (which has 2 tasks)
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      const jan15Cell = Array.from(cells).find(cell => 
        cell.getAttribute('data-date') === '2024-01-15'
      );

      expect(jan15Cell).toBeTruthy();
      const ariaLabel = jan15Cell.getAttribute('aria-label');
      expect(ariaLabel).toContain('2 tasks');
    });

    it('should use singular "task" in aria-label for cells with one task', () => {
      // Set up test data with only one task
      global.App.currentTasks = [
        {
          id: 'task-1',
          title: 'Single Task',
          course: 'Math',
          type: 'assignment',
          deadline: new Date(2024, 0, 20, 10, 0) // January 20, 2024
        }
      ];

      calendar.renderCalendar();

      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      const jan20Cell = Array.from(cells).find(cell => 
        cell.getAttribute('data-date') === '2024-01-20'
      );

      expect(jan20Cell).toBeTruthy();
      const ariaLabel = jan20Cell.getAttribute('aria-label');
      expect(ariaLabel).toContain('1 task');
      expect(ariaLabel).not.toContain('1 tasks');
    });

    it('should not include task count in aria-label for cells without tasks', () => {
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      const jan10Cell = Array.from(cells).find(cell => 
        cell.getAttribute('data-date') === '2024-01-10'
      );

      expect(jan10Cell).toBeTruthy();
      const ariaLabel = jan10Cell.getAttribute('aria-label');
      expect(ariaLabel).not.toContain('task');
    });
  });

  describe('Calendar View Button ARIA Label', () => {
    it('should have aria-label on calendar view button', () => {
      const calendarBtn = createdElements.find(el => el.id === 'calendar-view-btn');
      expect(calendarBtn).toBeTruthy();
      expect(calendarBtn.getAttribute('aria-label')).toBe('Open calendar view');
    });

    it('should have title attribute on calendar view button', () => {
      const calendarBtn = createdElements.find(el => el.id === 'calendar-view-btn');
      expect(calendarBtn).toBeTruthy();
      expect(calendarBtn.getAttribute('title')).toBe('Calendar view');
    });
  });

  describe('Header ARIA Label Updates', () => {
    it('should update aria-label on header when month changes', () => {
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 3; // April
      calendar.updateHeader();

      const header = document.getElementById('calendar-title');
      expect(header).toBeTruthy();
      expect(header.getAttribute('aria-label')).toBe('Calendar showing April 2024');
    });

    it('should update aria-label for all months', () => {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      monthNames.forEach((monthName, index) => {
        calendar.displayedYear = 2024;
        calendar.displayedMonth = index;
        calendar.updateHeader();

        const header = document.getElementById('calendar-title');
        expect(header.getAttribute('aria-label')).toBe(`Calendar showing ${monthName} 2024`);
      });
    });
  });

  describe('Complete Accessibility Compliance', () => {
    it('should have all required ARIA attributes for Requirements 10.4 and 10.5', () => {
      // Render calendar with tasks
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

      // Check modal attributes
      const modal = mockModal;
      expect(modal.getAttribute('role')).toBe('dialog');
      expect(modal.getAttribute('aria-modal')).toBe('true');
      expect(modal.getAttribute('aria-labelledby')).toBe('calendar-title');

      // Check navigation buttons
      const prevBtn = createdElements.find(el => el.id === 'calendar-prev-month');
      const nextBtn = createdElements.find(el => el.id === 'calendar-next-month');
      const closeBtn = createdElements.find(el => 
        el.className && el.className.includes('calendar-close-btn')
      );
      
      expect(prevBtn.getAttribute('aria-label')).toBe('Previous month');
      expect(nextBtn.getAttribute('aria-label')).toBe('Next month');
      expect(closeBtn.getAttribute('aria-label')).toBe('Close calendar');

      // Check calendar cells
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      cells.forEach(cell => {
        expect(cell.getAttribute('role')).toBe('gridcell');
        expect(cell.getAttribute('aria-label')).toBeTruthy();
      });

      // Check cell with tasks has task count in aria-label
      const jan15Cell = Array.from(cells).find(cell => 
        cell.getAttribute('data-date') === '2024-01-15'
      );
      expect(jan15Cell.getAttribute('aria-label')).toContain('task');
    });
  });
});
