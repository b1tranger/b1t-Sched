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
    // URL regex pattern (modified to support www.)
    const urlPattern = /((https?:\/\/|www\.)[^\s<>"'\)\]]+)/g;

    // Replace URLs with anchor tags, ensuring http:// for www. links
    return text.replace(urlPattern, (match) => {
      let href = match;
      if (!/^https?:\/\//i.test(href)) {
        href = 'https://' + href;
      }
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="description-link">${match}</a>`;
    });
  },

  // Apply basic markdown formatting
  // Supports: **bold**, *italic*, `code`, [text](url)
  applyBasicMarkdown(text) {
    if (!text) return '';
    return text
      // Markdown links: [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
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

    // Extract markdown links first and replace with placeholders
    const markdownLinks = [];
    let result = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
      const placeholder = `__MD_LINK_${markdownLinks.length}__`;
      markdownLinks.push({ text: linkText, url: url });
      return placeholder;
    });

    // Escape HTML special characters
    result = result
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Apply basic markdown formatting (bold, italic, code - not links)
    result = result
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Convert plain URLs to clickable links
    result = this.linkify(result);

    // Restore markdown links as anchor tags
    markdownLinks.forEach((link, index) => {
      const escapedText = link.text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      // Check if it's a tmpfiles.org download link
      const isTmpFilesLink = link.url.includes('tmpfiles.org/dl/');
      const downloadAttr = isTmpFilesLink ? ' download' : '';
      
      result = result.replace(
        `__MD_LINK_${index}__`,
        `<a href="${link.url}" target="_blank" rel="noopener noreferrer"${downloadAttr}>${escapedText}</a>`
      );
    });

    // Convert line breaks to <br>
    result = result.replace(/\n/g, '<br>');
    return result;
  }
};
