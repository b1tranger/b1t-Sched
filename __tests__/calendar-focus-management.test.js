/**
 * Calendar View - Focus Management Tests
 * Tests for Task 11.3: Implement focus management
 * Requirements: 10.1
 */

// Import the calendar view module
const { CalendarView } = await import('../js/calendar-view.js');

describe('Calendar View - Focus Management (Task 11.3)', () => {
  let calendar;
  let mockModal;
  let mockButton;
  let mockCloseButton;
  let mockPrevButton;
  let mockNextButton;
  let createdElements;
  let focusedElement;
  let eventListeners;

  beforeEach(() => {
    // Track created elements and event listeners
    createdElements = [];
    eventListeners = { keydown: [] };
    focusedElement = null;

    // Create mock buttons
    mockButton = {
      id: 'calendar-view-btn',
      tagName: 'BUTTON',
      className: 'btn btn-icon',
      focus: function() {
        focusedElement = this;
      },
      addEventListener: function() {}
    };

    mockCloseButton = {
      className: 'btn btn-icon calendar-close-btn',
      tagName: 'BUTTON',
      focus: function() {
        focusedElement = this;
      },
      addEventListener: function() {}
    };

    mockPrevButton = {
      id: 'calendar-prev-month',
      tagName: 'BUTTON',
      className: 'calendar-nav-btn',
      focus: function() {
        focusedElement = this;
      },
      addEventListener: function() {}
    };

    mockNextButton = {
      id: 'calendar-next-month',
      tagName: 'BUTTON',
      className: 'calendar-nav-btn',
      focus: function() {
        focusedElement = this;
      },
      addEventListener: function() {}
    };

    // Create mock modal
    mockModal = null;

    // Mock document
    global.document = {
      activeElement: mockButton,
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
              return mockCloseButton;
            }
            return null;
          },
          querySelectorAll: function(selector) {
            if (selector === 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') {
              return [mockPrevButton, mockNextButton, mockCloseButton];
            }
            return [];
          },
          addEventListener: function() {},
          focus: function() {
            focusedElement = this;
          }
        };
        createdElements.push(element);
        return element;
      },
      getElementById: (id) => {
        if (id === 'calendar-modal') {
          return mockModal;
        }
        if (id === 'calendar-view-btn') {
          return mockButton;
        }
        if (id === 'calendar-prev-month') {
          return mockPrevButton;
        }
        if (id === 'calendar-next-month') {
          return mockNextButton;
        }
        if (id === 'calendar-grid') {
          return {
            innerHTML: '',
            children: [],
            appendChild: function(child) {
              this.children.push(child);
            },
            querySelectorAll: function() {
              return [];
            }
          };
        }
        if (id === 'calendar-title') {
          return {
            textContent: '',
            setAttribute: function() {}
          };
        }
        return null;
      },
      querySelector: (selector) => {
        if (selector === '.calendar-close-btn') {
          return mockCloseButton;
        }
        if (selector === '.section-header h2') {
          return {
            parentElement: {
              appendChild: function() {}
            }
          };
        }
        return null;
      },
      querySelectorAll: (selector) => {
        if (selector === '.section-header h2') {
          return [{
            parentElement: {
              appendChild: function() {}
            }
          }];
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
        if (!eventListeners[event]) {
          eventListeners[event] = [];
        }
        eventListeners[event].push(handler);
      },
      removeEventListener: function(event, handler) {
        if (eventListeners[event]) {
          const index = eventListeners[event].indexOf(handler);
          if (index > -1) {
            eventListeners[event].splice(index, 1);
          }
        }
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

  describe('Focus on Modal Open', () => {
    it('should store the previously focused element when modal opens', () => {
      // Set active element to button
      global.document.activeElement = mockButton;
      
      // Open modal
      calendar.open();
      
      // Check that previouslyFocusedElement is stored
      expect(calendar.previouslyFocusedElement).toBe(mockButton);
    });

    it('should set focus to modal container when opened', () => {
      // Open modal
      calendar.open();
      
      // Check that modal was focused
      expect(focusedElement).toBe(mockModal);
    });

    it('should add focus trap event listener when modal opens', () => {
      const initialListenerCount = eventListeners.keydown.length;
      
      // Open modal
      calendar.open();
      
      // Check that a keydown listener was added
      expect(eventListeners.keydown.length).toBe(initialListenerCount + 1);
      expect(eventListeners.keydown).toContain(calendar.handleFocusTrap);
    });
  });

  describe('Focus Restoration on Modal Close', () => {
    it('should restore focus to calendar button when modal closes', () => {
      // Set active element to button
      global.document.activeElement = mockButton;
      
      // Open modal
      calendar.open();
      
      // Change focused element to simulate modal interaction
      focusedElement = mockCloseButton;
      
      // Close modal
      calendar.close();
      
      // Check that focus was restored to button
      expect(focusedElement).toBe(mockButton);
    });

    it('should clear previouslyFocusedElement after restoring focus', () => {
      // Set active element to button
      global.document.activeElement = mockButton;
      
      // Open modal
      calendar.open();
      expect(calendar.previouslyFocusedElement).toBe(mockButton);
      
      // Close modal
      calendar.close();
      
      // Check that previouslyFocusedElement is cleared
      expect(calendar.previouslyFocusedElement).toBeNull();
    });

    it('should remove focus trap event listener when modal closes', () => {
      // Open modal
      calendar.open();
      const listenerCount = eventListeners.keydown.length;
      
      // Close modal
      calendar.close();
      
      // Check that the listener was removed
      expect(eventListeners.keydown.length).toBe(listenerCount - 1);
      expect(eventListeners.keydown).not.toContain(calendar.handleFocusTrap);
    });
  });

  describe('Focus Trap Within Modal', () => {
    beforeEach(() => {
      // Open modal to enable focus trap
      calendar.open();
    });

    it('should trap Tab key on last element to first element', () => {
      // Set focus to last element (close button)
      global.document.activeElement = mockCloseButton;
      
      // Create Tab key event
      let preventDefaultCalled = false;
      const tabEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: function() {
          preventDefaultCalled = true;
        }
      };
      
      // Trigger focus trap
      calendar.trapFocus(tabEvent);
      
      // Check that preventDefault was called
      expect(preventDefaultCalled).toBe(true);
      
      // Check that focus moved to first element
      expect(focusedElement).toBe(mockPrevButton);
    });

    it('should trap Shift+Tab key on first element to last element', () => {
      // Set focus to first element (prev button)
      global.document.activeElement = mockPrevButton;
      
      // Create Shift+Tab key event
      let preventDefaultCalled = false;
      const shiftTabEvent = {
        key: 'Tab',
        shiftKey: true,
        preventDefault: function() {
          preventDefaultCalled = true;
        }
      };
      
      // Trigger focus trap
      calendar.trapFocus(shiftTabEvent);
      
      // Check that preventDefault was called
      expect(preventDefaultCalled).toBe(true);
      
      // Check that focus moved to last element
      expect(focusedElement).toBe(mockCloseButton);
    });

    it('should not trap focus for non-Tab keys', () => {
      // Set focus to last element
      global.document.activeElement = mockCloseButton;
      
      // Create Enter key event
      let preventDefaultCalled = false;
      const enterEvent = {
        key: 'Enter',
        shiftKey: false,
        preventDefault: function() {
          preventDefaultCalled = true;
        }
      };
      
      // Trigger focus trap
      calendar.trapFocus(enterEvent);
      
      // Check that preventDefault was NOT called
      expect(preventDefaultCalled).toBe(false);
    });

    it('should not trap focus when modal is closed', () => {
      // Close modal
      calendar.close();
      
      // Set focus to last element
      global.document.activeElement = mockCloseButton;
      
      // Create Tab key event
      let preventDefaultCalled = false;
      const tabEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: function() {
          preventDefaultCalled = true;
        }
      };
      
      // Trigger focus trap
      calendar.trapFocus(tabEvent);
      
      // Check that preventDefault was NOT called (focus trap inactive)
      expect(preventDefaultCalled).toBe(false);
    });

    it('should allow normal Tab navigation between middle elements', () => {
      // Set focus to middle element (next button)
      global.document.activeElement = mockNextButton;
      
      // Create Tab key event
      let preventDefaultCalled = false;
      const tabEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: function() {
          preventDefaultCalled = true;
        }
      };
      
      // Trigger focus trap
      calendar.trapFocus(tabEvent);
      
      // Check that preventDefault was NOT called (normal tab behavior)
      expect(preventDefaultCalled).toBe(false);
    });
  });

  describe('Complete Focus Management Flow', () => {
    it('should complete full focus management cycle: open → trap → close → restore', () => {
      // Initial state: button is focused
      global.document.activeElement = mockButton;
      expect(focusedElement).toBeNull();
      
      // Step 1: Open modal
      calendar.open();
      
      // Verify: previouslyFocusedElement stored
      expect(calendar.previouslyFocusedElement).toBe(mockButton);
      
      // Verify: modal is focused
      expect(focusedElement).toBe(mockModal);
      
      // Verify: focus trap listener added
      expect(eventListeners.keydown).toContain(calendar.handleFocusTrap);
      
      // Step 2: Simulate Tab on last element
      global.document.activeElement = mockCloseButton;
      let preventDefaultCalled = false;
      const tabEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: function() {
          preventDefaultCalled = true;
        }
      };
      calendar.trapFocus(tabEvent);
      
      // Verify: focus trapped to first element
      expect(preventDefaultCalled).toBe(true);
      expect(focusedElement).toBe(mockPrevButton);
      
      // Step 3: Close modal
      calendar.close();
      
      // Verify: focus restored to button
      expect(focusedElement).toBe(mockButton);
      
      // Verify: previouslyFocusedElement cleared
      expect(calendar.previouslyFocusedElement).toBeNull();
      
      // Verify: focus trap listener removed
      expect(eventListeners.keydown).not.toContain(calendar.handleFocusTrap);
    });
  });

  describe('Edge Cases', () => {
    it('should handle modal open when no element is focused', () => {
      // Set active element to null
      global.document.activeElement = null;
      
      // Open modal
      calendar.open();
      
      // Should not throw error
      expect(calendar.previouslyFocusedElement).toBeNull();
      expect(focusedElement).toBe(mockModal);
    });

    it('should handle modal close when previouslyFocusedElement is null', () => {
      // Open modal with no previously focused element
      global.document.activeElement = null;
      calendar.open();
      
      // Close modal
      expect(() => calendar.close()).not.toThrow();
    });

    it('should handle focus trap when modal has no focusable elements', () => {
      // Mock modal with no focusable elements
      mockModal.querySelectorAll = function() {
        return [];
      };
      
      calendar.open();
      
      // Create Tab key event
      let preventDefaultCalled = false;
      const tabEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: function() {
          preventDefaultCalled = true;
        }
      };
      
      // Should not throw error
      expect(() => calendar.trapFocus(tabEvent)).not.toThrow();
      expect(preventDefaultCalled).toBe(false);
    });
  });
});
