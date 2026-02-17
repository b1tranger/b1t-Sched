/**
 * Browser Testing Script for Calendar View
 * 
 * This script can be run in the browser console to perform basic
 * automated checks of the calendar view functionality.
 * 
 * Usage:
 * 1. Open the application in a browser
 * 2. Open browser DevTools (F12)
 * 3. Copy and paste this entire script into the console
 * 4. Press Enter to run
 * 5. Review the test results in the console
 */

(function() {
  console.log('=== Calendar View Browser Test Suite ===\n');
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: []
  };
  
  function test(name, fn) {
    try {
      const result = fn();
      if (result === true) {
        results.passed++;
        results.tests.push({ name, status: 'PASS' });
        console.log(`✅ PASS: ${name}`);
      } else if (result === 'warning') {
        results.warnings++;
        results.tests.push({ name, status: 'WARN' });
        console.warn(`⚠️  WARN: ${name}`);
      } else {
        results.failed++;
        results.tests.push({ name, status: 'FAIL', message: result });
        console.error(`❌ FAIL: ${name}`, result);
      }
    } catch (error) {
      results.failed++;
      results.tests.push({ name, status: 'ERROR', message: error.message });
      console.error(`❌ ERROR: ${name}`, error.message);
    }
  }
  
  // Browser Detection
  console.log('\n--- Browser Information ---');
  const userAgent = navigator.userAgent;
  const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent);
  const isFirefox = /Firefox/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isEdge = /Edg/.test(userAgent);
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
  
  console.log('User Agent:', userAgent);
  console.log('Browser:', isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : isEdge ? 'Edge' : 'Unknown');
  console.log('Platform:', isMobile ? 'Mobile' : 'Desktop');
  console.log('Viewport:', `${window.innerWidth}x${window.innerHeight}`);
  
  // Test 1: Calendar View Class Exists
  console.log('\n--- Testing Calendar View Class ---');
  test('CalendarView class is defined', () => {
    return typeof CalendarView !== 'undefined';
  });
  
  // Test 2: Calendar Button Exists
  console.log('\n--- Testing Calendar Button ---');
  test('Calendar button exists in DOM', () => {
    const btn = document.getElementById('calendar-view-btn');
    return btn !== null;
  });
  
  test('Calendar button has correct icon', () => {
    const btn = document.getElementById('calendar-view-btn');
    if (!btn) return 'Button not found';
    const icon = btn.querySelector('.fa-calendar-alt');
    return icon !== null;
  });
  
  test('Calendar button has accessibility attributes', () => {
    const btn = document.getElementById('calendar-view-btn');
    if (!btn) return 'Button not found';
    return btn.hasAttribute('aria-label') || btn.hasAttribute('title');
  });
  
  // Test 3: Calendar Modal Structure
  console.log('\n--- Testing Calendar Modal Structure ---');
  test('Calendar modal exists in DOM', () => {
    const modal = document.getElementById('calendar-modal');
    return modal !== null;
  });
  
  test('Calendar modal has ARIA attributes', () => {
    const modal = document.getElementById('calendar-modal');
    if (!modal) return 'Modal not found';
    return modal.getAttribute('role') === 'dialog' && 
           modal.getAttribute('aria-modal') === 'true';
  });
  
  test('Calendar grid container exists', () => {
    const grid = document.getElementById('calendar-grid');
    return grid !== null;
  });
  
  test('Calendar has day headers', () => {
    const headers = document.querySelector('.calendar-day-headers');
    if (!headers) return 'Day headers not found';
    const dayHeaders = headers.querySelectorAll('.calendar-day-header');
    return dayHeaders.length === 7;
  });
  
  test('Calendar has navigation buttons', () => {
    const prevBtn = document.getElementById('calendar-prev-month');
    const nextBtn = document.getElementById('calendar-next-month');
    return prevBtn !== null && nextBtn !== null;
  });
  
  test('Calendar has close button', () => {
    const closeBtn = document.querySelector('.calendar-close-btn');
    return closeBtn !== null;
  });
  
  // Test 4: CSS Support
  console.log('\n--- Testing CSS Feature Support ---');
  test('CSS Grid is supported', () => {
    return CSS.supports('display', 'grid');
  });
  
  test('CSS Flexbox is supported', () => {
    return CSS.supports('display', 'flex');
  });
  
  test('CSS Custom Properties are supported', () => {
    return CSS.supports('color', 'var(--test)');
  });
  
  test('CSS Animations are supported', () => {
    return CSS.supports('animation', '1s ease');
  });
  
  test('CSS Transforms are supported', () => {
    return CSS.supports('transform', 'translateY(0)');
  });
  
  // Test 5: JavaScript API Support
  console.log('\n--- Testing JavaScript API Support ---');
  test('ES6 Classes are supported', () => {
    try {
      eval('class Test {}');
      return true;
    } catch (e) {
      return false;
    }
  });
  
  test('Arrow functions are supported', () => {
    try {
      eval('() => {}');
      return true;
    } catch (e) {
      return false;
    }
  });
  
  test('Template literals are supported', () => {
    try {
      eval('`test`');
      return true;
    } catch (e) {
      return false;
    }
  });
  
  test('Array.prototype.filter is supported', () => {
    return typeof Array.prototype.filter === 'function';
  });
  
  test('String.prototype.padStart is supported', () => {
    return typeof String.prototype.padStart === 'function';
  });
  
  test('Date object is supported', () => {
    try {
      new Date();
      return true;
    } catch (e) {
      return false;
    }
  });
  
  // Test 6: DOM API Support
  console.log('\n--- Testing DOM API Support ---');
  test('querySelector is supported', () => {
    return typeof document.querySelector === 'function';
  });
  
  test('querySelectorAll is supported', () => {
    return typeof document.querySelectorAll === 'function';
  });
  
  test('addEventListener is supported', () => {
    return typeof document.addEventListener === 'function';
  });
  
  test('classList is supported', () => {
    const div = document.createElement('div');
    return typeof div.classList !== 'undefined';
  });
  
  test('setAttribute is supported', () => {
    const div = document.createElement('div');
    return typeof div.setAttribute === 'function';
  });
  
  // Test 7: Touch Support (Mobile)
  if (isMobile) {
    console.log('\n--- Testing Mobile/Touch Support ---');
    test('Touch events are supported', () => {
      return 'ontouchstart' in window;
    });
    
    test('Viewport is mobile-sized', () => {
      return window.innerWidth < 768 ? true : 'warning';
    });
    
    test('Touch targets are adequate size', () => {
      const btn = document.getElementById('calendar-view-btn');
      if (!btn) return 'Button not found';
      const rect = btn.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        return `Button size is ${rect.width}x${rect.height}, should be at least 44x44`;
      }
      return true;
    });
  }
  
  // Test 8: Responsive Design
  console.log('\n--- Testing Responsive Design ---');
  test('Viewport meta tag is present', () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    return viewport !== null;
  });
  
  test('Calendar CSS is loaded', () => {
    const styles = Array.from(document.styleSheets);
    return styles.some(sheet => {
      try {
        return sheet.href && sheet.href.includes('calendar.css');
      } catch (e) {
        return false;
      }
    });
  });
  
  // Test 9: Accessibility
  console.log('\n--- Testing Accessibility Features ---');
  test('ARIA roles are used', () => {
    const modal = document.getElementById('calendar-modal');
    if (!modal) return 'Modal not found';
    return modal.hasAttribute('role');
  });
  
  test('ARIA labels are present', () => {
    const modal = document.getElementById('calendar-modal');
    if (!modal) return 'Modal not found';
    return modal.hasAttribute('aria-labelledby') || modal.hasAttribute('aria-label');
  });
  
  test('Buttons have accessible names', () => {
    const btn = document.getElementById('calendar-view-btn');
    if (!btn) return 'Button not found';
    return btn.hasAttribute('aria-label') || 
           btn.hasAttribute('title') || 
           btn.textContent.trim().length > 0;
  });
  
  // Test 10: Functional Tests (if calendar is initialized)
  console.log('\n--- Testing Calendar Functionality ---');
  test('CalendarView can be instantiated', () => {
    try {
      const cal = new CalendarView();
      return cal !== null && typeof cal.init === 'function';
    } catch (e) {
      return e.message;
    }
  });
  
  test('Calendar utility functions exist', () => {
    return typeof isToday === 'function' && 
           typeof groupTasksByDate === 'function';
  });
  
  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`Total Tests: ${results.passed + results.failed + results.warnings}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! Calendar view is compatible with this browser.');
  } else {
    console.log('\n⚠️  Some tests failed. Review the failures above.');
  }
  
  // Return results for programmatic access
  return results;
})();
