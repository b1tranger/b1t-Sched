/**
 * Unit Tests for Calendar Navigation Methods
 * Tests previousMonth() and nextMonth() methods
 */

import { jest } from '@jest/globals';

// Mock global objects before importing the module
global.App = {
  currentTasks: [],
  userCompletions: {}
};

// Import the calendar view module
const { CalendarView } = await import('../../js/calendar-view.js');

describe('Calendar View - Month Navigation', () => {
  describe('previousMonth', () => {
    it('should decrement month within the same year', () => {
      const calendar = new CalendarView();
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 5; // June
      
      // Mock renderCalendar to prevent DOM operations
      calendar.renderCalendar = jest.fn();
      
      calendar.previousMonth();
      
      expect(calendar.displayedMonth).toBe(4); // May
      expect(calendar.displayedYear).toBe(2024);
      expect(calendar.renderCalendar).toHaveBeenCalledTimes(1);
    });

    it('should handle year rollback when going from January to December', () => {
      const calendar = new CalendarView();
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 0; // January
      
      // Mock renderCalendar to prevent DOM operations
      calendar.renderCalendar = jest.fn();
      
      calendar.previousMonth();
      
      expect(calendar.displayedMonth).toBe(11); // December
      expect(calendar.displayedYear).toBe(2023);
      expect(calendar.renderCalendar).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple consecutive calls', () => {
      const calendar = new CalendarView();
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 2; // March
      
      // Mock renderCalendar to prevent DOM operations
      calendar.renderCalendar = jest.fn();
      
      calendar.previousMonth(); // February
      expect(calendar.displayedMonth).toBe(1);
      expect(calendar.displayedYear).toBe(2024);
      
      calendar.previousMonth(); // January
      expect(calendar.displayedMonth).toBe(0);
      expect(calendar.displayedYear).toBe(2024);
      
      calendar.previousMonth(); // December 2023
      expect(calendar.displayedMonth).toBe(11);
      expect(calendar.displayedYear).toBe(2023);
      
      expect(calendar.renderCalendar).toHaveBeenCalledTimes(3);
    });

    it('should call renderCalendar after updating month', () => {
      const calendar = new CalendarView();
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 5;
      
      // Mock renderCalendar to track calls
      calendar.renderCalendar = jest.fn();
      
      calendar.previousMonth();
      
      expect(calendar.renderCalendar).toHaveBeenCalled();
    });
  });

  describe('nextMonth', () => {
    it('should increment month within the same year', () => {
      const calendar = new CalendarView();
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 5; // June
      
      // Mock renderCalendar to prevent DOM operations
      calendar.renderCalendar = jest.fn();
      
      calendar.nextMonth();
      
      expect(calendar.displayedMonth).toBe(6); // July
      expect(calendar.displayedYear).toBe(2024);
      expect(calendar.renderCalendar).toHaveBeenCalledTimes(1);
    });

    it('should handle year rollover when going from December to January', () => {
      const calendar = new CalendarView();
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 11; // December
      
      // Mock renderCalendar to prevent DOM operations
      calendar.renderCalendar = jest.fn();
      
      calendar.nextMonth();
      
      expect(calendar.displayedMonth).toBe(0); // January
      expect(calendar.displayedYear).toBe(2025);
      expect(calendar.renderCalendar).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple consecutive calls', () => {
      const calendar = new CalendarView();
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 10; // November
      
      // Mock renderCalendar to prevent DOM operations
      calendar.renderCalendar = jest.fn();
      
      calendar.nextMonth(); // December
      expect(calendar.displayedMonth).toBe(11);
      expect(calendar.displayedYear).toBe(2024);
      
      calendar.nextMonth(); // January 2025
      expect(calendar.displayedMonth).toBe(0);
      expect(calendar.displayedYear).toBe(2025);
      
      calendar.nextMonth(); // February 2025
      expect(calendar.displayedMonth).toBe(1);
      expect(calendar.displayedYear).toBe(2025);
      
      expect(calendar.renderCalendar).toHaveBeenCalledTimes(3);
    });

    it('should call renderCalendar after updating month', () => {
      const calendar = new CalendarView();
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 5;
      
      // Mock renderCalendar to track calls
      calendar.renderCalendar = jest.fn();
      
      calendar.nextMonth();
      
      expect(calendar.renderCalendar).toHaveBeenCalled();
    });
  });

  describe('previousMonth and nextMonth together', () => {
    it('should be reversible operations', () => {
      const calendar = new CalendarView();
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 5; // June
      
      // Mock renderCalendar to prevent DOM operations
      calendar.renderCalendar = jest.fn();
      
      const originalMonth = calendar.displayedMonth;
      const originalYear = calendar.displayedYear;
      
      calendar.nextMonth();
      calendar.previousMonth();
      
      expect(calendar.displayedMonth).toBe(originalMonth);
      expect(calendar.displayedYear).toBe(originalYear);
    });

    it('should handle year boundaries correctly when alternating', () => {
      const calendar = new CalendarView();
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 0; // January
      
      // Mock renderCalendar to prevent DOM operations
      calendar.renderCalendar = jest.fn();
      
      calendar.previousMonth(); // December 2023
      expect(calendar.displayedMonth).toBe(11);
      expect(calendar.displayedYear).toBe(2023);
      
      calendar.nextMonth(); // January 2024
      expect(calendar.displayedMonth).toBe(0);
      expect(calendar.displayedYear).toBe(2024);
      
      calendar.nextMonth(); // February 2024
      expect(calendar.displayedMonth).toBe(1);
      expect(calendar.displayedYear).toBe(2024);
      
      calendar.previousMonth(); // January 2024
      expect(calendar.displayedMonth).toBe(0);
      expect(calendar.displayedYear).toBe(2024);
    });

    it('should navigate across multiple years', () => {
      const calendar = new CalendarView();
      calendar.displayedYear = 2024;
      calendar.displayedMonth = 0; // January 2024
      
      // Mock renderCalendar to prevent DOM operations
      calendar.renderCalendar = jest.fn();
      
      // Go back 13 months (to December 2022)
      for (let i = 0; i < 13; i++) {
        calendar.previousMonth();
      }
      
      expect(calendar.displayedMonth).toBe(11); // December
      expect(calendar.displayedYear).toBe(2022);
      
      // Go forward 13 months (back to January 2024)
      for (let i = 0; i < 13; i++) {
        calendar.nextMonth();
      }
      
      expect(calendar.displayedMonth).toBe(0); // January
      expect(calendar.displayedYear).toBe(2024);
    });
  });
});
