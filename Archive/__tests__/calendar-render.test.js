/**
 * Unit Tests for CalendarView.renderCalendar() method
 * Tests the rendering of calendar cells with proper styling and attributes
 */

// Import the calendar view module
const { CalendarView } = await import('../../js/calendar-view.js');

describe('Calendar View - renderCalendar() Method', () => {
  let calendar;
  let mockGridContainer;
  let mockHeaderElement;
  let createdElements;

  beforeEach(() => {
    // Track created elements
    createdElements = [];

    // Mock document.createElement
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
            if (selector === '.calendar-date-number') {
              return this.children.find(c => c.className === 'calendar-date-number');
            }
            return null;
          },
          querySelectorAll: function(selector) {
            if (selector === '.calendar-cell') {
              return this.children.filter(c => c.className.includes('calendar-cell'));
            }
            if (selector === '.calendar-cell-today') {
              return this.children.filter(c => c.className.includes('calendar-cell-today'));
            }
            if (selector === '.calendar-cell-adjacent') {
              return this.children.filter(c => c.className.includes('calendar-cell-adjacent'));
            }
            if (selector === '.calendar-date-number') {
              return this.children.filter(c => c.className === 'calendar-date-number');
            }
            return [];
          },
          remove: function() {
            // Mock remove
          }
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
        if (id === 'calendar-empty-state') {
          return {
            style: { display: 'none' }
          };
        }
        return null;
      },
      querySelector: (selector) => {
        if (selector === '.calendar-grid-container') {
          return {
            style: { display: 'block' }
          };
        }
        return null;
      },
      querySelectorAll: (selector) => {
        if (selector === '.calendar-cell') {
          return mockGridContainer.querySelectorAll('.calendar-cell');
        }
        return [];
      },
      body: {
        appendChild: () => {}
      }
    };

    // Create mock grid container
    mockGridContainer = {
      id: 'calendar-grid',
      innerHTML: '',
      children: [],
      appendChild: function(child) {
        this.children.push(child);
      },
      querySelectorAll: function(selector) {
        if (selector === '.calendar-cell') {
          return this.children.filter(c => c.className && c.className.includes('calendar-cell'));
        }
        if (selector === '.calendar-cell-today') {
          return this.children.filter(c => c.className && c.className.includes('calendar-cell-today'));
        }
        if (selector === '.calendar-cell-adjacent') {
          return this.children.filter(c => c.className && c.className.includes('calendar-cell-adjacent'));
        }
        return [];
      },
      set innerHTML(value) {
        // When innerHTML is set, clear the children array
        if (value === '') {
          this.children = [];
        }
        this._innerHTML = value;
      },
      get innerHTML() {
        return this._innerHTML || '';
      }
    };

    // Create mock header element
    mockHeaderElement = {
      id: 'calendar-title',
      textContent: '',
      setAttribute: function(name, value) {
        this[name] = value;
      }
    };

    // Create calendar instance
    calendar = new CalendarView();
  });

  afterEach(() => {
    // Clean up
    delete global.document;
    createdElements = [];
  });

  describe('Basic Rendering', () => {
    it('should clear existing calendar grid content before rendering', () => {
      // Add some dummy content
      mockGridContainer.innerHTML = '<div>Old content</div>';
      
      // Render calendar
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 0; // January
      calendar.renderCalendar();
      
      // innerHTML should be cleared (set to empty string)
      expect(mockGridContainer.innerHTML).toBe('');
    });

    it('should create calendar cell elements for each date', () => {
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 0; // January
      calendar.renderCalendar();
      
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      
      // Should have cells (at least 31 for January + adjacent month dates)
      expect(cells.length).toBeGreaterThanOrEqual(31);
      
      // Should be a multiple of 7 (complete weeks)
      expect(cells.length % 7).toBe(0);
    });

    it('should add date number to each cell', () => {
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 0; // January
      calendar.renderCalendar();
      
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      
      // Each cell should have a date number element
      cells.forEach(cell => {
        const dateNumber = cell.querySelector('.calendar-date-number');
        expect(dateNumber).toBeTruthy();
        expect(dateNumber.textContent).toBeTruthy();
        expect(parseInt(dateNumber.textContent)).toBeGreaterThan(0);
      });
    });

    it('should set data-date attribute on each cell', () => {
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 0; // January
      calendar.renderCalendar();
      
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      
      // Each cell should have a data-date attribute in YYYY-MM-DD format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      cells.forEach(cell => {
        const dataDate = cell.getAttribute('data-date');
        expect(dataDate).toBeTruthy();
        expect(dataDate).toMatch(dateRegex);
      });
    });

    it('should set role="gridcell" on each cell for accessibility', () => {
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 0; // January
      calendar.renderCalendar();
      
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      
      cells.forEach(cell => {
        expect(cell.getAttribute('role')).toBe('gridcell');
      });
    });

    it('should set aria-label on each cell with readable date', () => {
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 0; // January
      calendar.renderCalendar();
      
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      
      cells.forEach(cell => {
        const ariaLabel = cell.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
        // Should contain month name, day, and year
        expect(ariaLabel).toMatch(/\w+ \d+, \d{4}/);
      });
    });
  });

  describe('Today Highlighting - Requirement 2.4', () => {
    it('should apply "calendar-cell-today" class to current date', () => {
      const today = new Date();
      calendar.displayedYear = today.getFullYear();
      calendar.displayedMonth = today.getMonth();
      calendar.renderCalendar();
      
      const todayCells = mockGridContainer.querySelectorAll('.calendar-cell-today');
      
      // Should have exactly one today cell
      expect(todayCells.length).toBe(1);
      
      // The today cell should have the correct date number
      const dateNumber = todayCells[0].querySelector('.calendar-date-number');
      expect(parseInt(dateNumber.textContent)).toBe(today.getDate());
    });

    it('should not apply today class when viewing different month', () => {
      const today = new Date();
      calendar.displayedYear = today.getFullYear();
      calendar.displayedMonth = (today.getMonth() + 1) % 12; // Next month
      calendar.renderCalendar();
      
      const todayCells = mockGridContainer.querySelectorAll('.calendar-cell-today');
      
      // Should have no today cells
      expect(todayCells.length).toBe(0);
    });

    it('should not apply today class when viewing different year', () => {
      const today = new Date();
      calendar.displayedYear = today.getFullYear() + 1; // Next year
      calendar.displayedMonth = today.getMonth();
      calendar.renderCalendar();
      
      const todayCells = mockGridContainer.querySelectorAll('.calendar-cell-today');
      
      // Should have no today cells
      expect(todayCells.length).toBe(0);
    });
  });

  describe('Adjacent Month Styling - Requirement 2.5', () => {
    it('should apply "calendar-cell-adjacent" class to adjacent month dates', () => {
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 0; // January
      calendar.renderCalendar();
      
      const adjacentCells = mockGridContainer.querySelectorAll('.calendar-cell-adjacent');
      
      // Should have some adjacent month cells
      expect(adjacentCells.length).toBeGreaterThan(0);
    });

    it('should not apply adjacent class to current month dates', () => {
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 0; // January
      calendar.renderCalendar();
      
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      
      // Find cells with date numbers 1-31 (current month)
      const currentMonthCells = Array.from(cells).filter(cell => {
        const dateNumber = parseInt(cell.querySelector('.calendar-date-number').textContent);
        const dataDate = cell.getAttribute('data-date');
        return dateNumber >= 1 && dateNumber <= 31 && dataDate.startsWith('2024-01');
      });
      
      // None of the current month cells should have adjacent class
      currentMonthCells.forEach(cell => {
        expect(cell.classList.contains('calendar-cell-adjacent')).toBe(false);
      });
    });

    it('should have adjacent cells at the beginning (previous month)', () => {
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 0; // January (starts on Monday)
      calendar.renderCalendar();
      
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      
      // First cell should be from previous month (December 31, 2023)
      const firstCell = cells[0];
      expect(firstCell.classList.contains('calendar-cell-adjacent')).toBe(true);
      expect(firstCell.getAttribute('data-date')).toBe('2023-12-31');
    });

    it('should have adjacent cells at the end (next month)', () => {
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 0; // January
      calendar.renderCalendar();
      
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      
      // Last cells should be from next month (February 2024)
      const lastCell = cells[cells.length - 1];
      expect(lastCell.classList.contains('calendar-cell-adjacent')).toBe(true);
      expect(lastCell.getAttribute('data-date')).toMatch(/^2024-02/);
    });
  });

  describe('Header Update - Requirement 2.1', () => {
    it('should call updateHeader() to show current month/year', () => {
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 3; // April
      calendar.renderCalendar();
      
      expect(mockHeaderElement.textContent).toBe('April 2024');
    });

    it('should update header when rendering different months', () => {
      // Render January
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 0;
      calendar.renderCalendar();
      
      expect(mockHeaderElement.textContent).toBe('January 2024');
      
      // Render June
      calendar.displayedMonth = 5;
      calendar.renderCalendar();
      
      expect(mockHeaderElement.textContent).toBe('June 2024');
    });
  });

  describe('Grid Structure - Requirement 2.2, 2.3', () => {
    it('should display all dates from 1 to last day of month', () => {
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 0; // January (31 days)
      calendar.renderCalendar();
      
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      
      // Check that all dates 1-31 are present
      for (let day = 1; day <= 31; day++) {
        const found = Array.from(cells).some(cell => {
          const dateNumber = parseInt(cell.querySelector('.calendar-date-number').textContent);
          const dataDate = cell.getAttribute('data-date');
          return dateNumber === day && dataDate === `2024-01-${String(day).padStart(2, '0')}`;
        });
        expect(found).toBe(true);
      }
    });

    it('should render correct number of days for February in leap year', () => {
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 1; // February (29 days in 2024)
      calendar.renderCalendar();
      
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      
      // Check that dates 1-29 are present
      for (let day = 1; day <= 29; day++) {
        const found = Array.from(cells).some(cell => {
          const dateNumber = parseInt(cell.querySelector('.calendar-date-number').textContent);
          const dataDate = cell.getAttribute('data-date');
          return dateNumber === day && dataDate === `2024-02-${String(day).padStart(2, '0')}`;
        });
        expect(found).toBe(true);
      }
      
      // Day 30 should not exist for February
      const day30Found = Array.from(cells).some(cell => {
        const dateNumber = parseInt(cell.querySelector('.calendar-date-number').textContent);
        const dataDate = cell.getAttribute('data-date');
        return dateNumber === 30 && dataDate.startsWith('2024-02');
      });
      expect(day30Found).toBe(false);
    });

    it('should render correct number of days for February in non-leap year', () => {
      calendar.displayedYear = 2023;
      calendar.displayedMonth = 1; // February (28 days in 2023)
      calendar.renderCalendar();
      
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      
      // Check that dates 1-28 are present
      for (let day = 1; day <= 28; day++) {
        const found = Array.from(cells).some(cell => {
          const dateNumber = parseInt(cell.querySelector('.calendar-date-number').textContent);
          const dataDate = cell.getAttribute('data-date');
          return dateNumber === day && dataDate === `2023-02-${String(day).padStart(2, '0')}`;
        });
        expect(found).toBe(true);
      }
      
      // Day 29 should not exist for February 2023
      const day29Found = Array.from(cells).some(cell => {
        const dateNumber = parseInt(cell.querySelector('.calendar-date-number').textContent);
        const dataDate = cell.getAttribute('data-date');
        return dateNumber === 29 && dataDate.startsWith('2023-02');
      });
      expect(day29Found).toBe(false);
    });

    it('should render cells in complete weeks (multiple of 7)', () => {
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 0; // January
      calendar.renderCalendar();
      
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      
      // Total cells should be a multiple of 7
      expect(cells.length % 7).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing calendar grid container gracefully', () => {
      // Set grid container to null
      mockGridContainer = null;
      
      // Should not throw error
      expect(() => {
        calendar.displayedYear = 2024;
        calendar.displayedMonth = 0;
        calendar.renderCalendar();
      }).not.toThrow();
    });

    it('should log error when grid container is missing', () => {
      // Mock console.error
      const originalError = console.error;
      const errorCalls = [];
      console.error = (...args) => errorCalls.push(args);
      
      // Set grid container to null
      mockGridContainer = null;
      
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 0;
      calendar.renderCalendar();
      
      expect(errorCalls.length).toBeGreaterThan(0);
      expect(errorCalls[0][0]).toBe('Calendar grid container not found');
      
      // Restore console.error
      console.error = originalError;
    });
  });

  describe('Re-rendering', () => {
    it('should clear previous cells when re-rendering', () => {
      // Render January
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 0;
      calendar.renderCalendar();
      
      const januaryCellCount = mockGridContainer.querySelectorAll('.calendar-cell').length;
      
      // Render February
      calendar.displayedMonth = 1;
      calendar.renderCalendar();
      
      const februaryCellCount = mockGridContainer.querySelectorAll('.calendar-cell').length;
      
      // Cell counts might be different, but both should be valid
      expect(januaryCellCount % 7).toBe(0);
      expect(februaryCellCount % 7).toBe(0);
      
      // Should not have duplicate cells
      const cells = mockGridContainer.querySelectorAll('.calendar-cell');
      expect(cells.length).toBe(februaryCellCount);
    });

    it('should update all cell attributes when re-rendering', () => {
      // Render January 2024
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 0;
      calendar.renderCalendar();
      
      const cells2024 = mockGridContainer.querySelectorAll('.calendar-cell');
      const firstDate2024 = cells2024[0].getAttribute('data-date');
      
      // First cell in January 2024 should be from December 2023
      expect(firstDate2024).toMatch(/^2023-12/);
      
      // Render January 2025
      calendar.displayedYear = 2025;
      calendar.renderCalendar();
      
      const cells2025 = mockGridContainer.querySelectorAll('.calendar-cell');
      const firstDate2025 = cells2025[0].getAttribute('data-date');
      
      // First cell in January 2025 should be from December 2024
      expect(firstDate2025).toMatch(/^2024-12/);
      
      // All cells should have correct year context
      cells2025.forEach(cell => {
        const dataDate = cell.getAttribute('data-date');
        // Should be either December 2024, January 2025, or February 2025
        expect(dataDate).toMatch(/^(2024-12|2025-01|2025-02)/);
      });
    });
  });
});
