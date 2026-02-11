// ============================================
// UTILITY FUNCTIONS
// ============================================

const Utils = {
  // Format date to readable string
  formatDate(date) {
    if (!date) return 'No date';
    
    const d = date instanceof Date ? date : new Date(date);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return d.toLocaleDateString('en-US', options);
  },

  // Format date to short form
  formatDateShort(date) {
    if (!date) return 'No date';
    
    const d = date instanceof Date ? date : new Date(date);
    const options = { 
      month: 'short', 
      day: 'numeric'
    };
    
    return d.toLocaleDateString('en-US', options);
  },

  // Calculate days until date
  daysUntil(date) {
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diff = d - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password strength
  isValidPassword(password) {
    return password && password.length >= 6;
  },

  // Truncate text
  truncate(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  },

  // Debounce function
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Local storage helpers
  storage: {
    get(key) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error('Error writing to localStorage:', error);
        return false;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
      }
    },

    clear() {
      try {
        localStorage.clear();
        return true;
      } catch (error) {
        console.error('Error clearing localStorage:', error);
        return false;
      }
    }
  },

  // Section grouping helpers (A1+A2 = Section A, B1+B2 = Section B, etc.)
  getSectionGroup(section) {
    if (!section) return '';
    // Extract the letter part (e.g., 'A' from 'A1' or 'A2')
    return section.replace(/[0-9]/g, '');
  },

  getSectionsInGroup(section) {
    if (!section) return [section];
    const group = this.getSectionGroup(section);
    // Return both sections in the group (e.g., ['A1', 'A2'] for 'A1')
    return [`${group}1`, `${group}2`];
  },

  // Convert URLs in text to clickable links
  linkify(text) {
    if (!text) return '';
    // URL regex pattern
    const urlPattern = /(https?:\/\/[^\s<>"'\)\]]+)/g;
    // Replace URLs with anchor tags
    return text.replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer" class="description-link">$1</a>');
  },

  // Apply basic markdown formatting
  // Supports: **bold**, *italic*, `code`
  applyBasicMarkdown(text) {
    if (!text) return '';
    return text
      // Bold: **text**
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic: *text* (single asterisks only, after bold is processed)
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Inline code: `text`
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  },

  // Escape HTML to prevent XSS, apply markdown, then linkify
  escapeAndLinkify(text) {
    if (!text) return '';
    // First escape HTML special characters
    let result = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    // Apply basic markdown formatting
    result = this.applyBasicMarkdown(result);
    // Convert URLs to clickable links
    result = this.linkify(result);
    // Convert line breaks to <br>
    result = result.replace(/\n/g, '<br>');
    return result;
  }
};
