/**
 * Changelog / What's New Modal Module
 * Displays the latest changes from changes.json when the Service Worker CACHE_VERSION updates
 */

const ChangelogModal = {
  data: null,
  storageKey: 'b1t_last_seen_version',
  docUrl: 'https://b1tranger.netlify.app/render.html?file=https%3A%2F%2Fgithub.com%2Fb1tranger%2Fb1t-Sched%2Fblob%2Fmain%2Fdoc%2FDOCUMENTATION.md',

  /**
   * Initialize Changelog Modal
   */
  async init() {
    console.log('[ChangelogModal] Initializing...');
    this.setupEventListeners();
    await this.checkAndShowChangelog();
  },

  /**
   * Fetch changes.json
   */
  async fetchChanges() {
    if (this.data) return this.data;
    try {
      // Add timestamp query parameter to bypass HTTP caching when checking updates
      const response = await fetch('/changes.json?t=' + Date.now());
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      this.data = await response.json();
      return this.data;
    } catch (error) {
      console.warn('[ChangelogModal] Could not fetch changes.json:', error);
      return null;
    }
  },

  /**
   * Check if current version is newer than last seen version and show modal
   */
  async checkAndShowChangelog(forceOpen = false) {
    const data = await this.fetchChanges();
    if (!data || !data.currentVersion) return;

    const lastSeenVersion = localStorage.getItem(this.storageKey);
    const currentVersion = data.currentVersion;

    if (forceOpen || !lastSeenVersion || lastSeenVersion !== currentVersion) {
      this.render(data);
      this.open();
    }
  },

  /**
   * Render changelog data into modal DOM
   */
  render(data) {
    const titleBadge = document.getElementById('changelog-version-badge');
    const bodyEl = document.getElementById('changelog-modal-body');

    if (titleBadge) {
      titleBadge.textContent = data.currentVersion || 'Latest';
    }

    if (!bodyEl) return;

    const history = data.history || [];
    if (history.length === 0) {
      bodyEl.innerHTML = '<p>No changelog details available.</p>';
      return;
    }

    const latest = history[0];
    const olderVersions = history.slice(1);

    let html = `
      <div class="changelog-version-section">
        <div class="changelog-version-header">
          <div class="changelog-version-title">
            <span>Version ${latest.version}</span>
            <span class="changelog-tag ${this.getTagClass(latest.badge || 'Latest')}">${latest.badge || 'Latest'}</span>
          </div>
          <span class="changelog-date">${latest.date || ''}</span>
        </div>
        <div class="changelog-items-list">
          ${(latest.changes || []).map(change => `
            <div class="changelog-item">
              <div class="changelog-item-title-row">
                <span class="changelog-tag ${this.getTagClass(change.type)}">${change.type || 'Update'}</span>
                <span class="changelog-item-title">${change.title || ''}</span>
              </div>
              <p class="changelog-item-desc">${change.description || ''}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Render older versions accordion if available
    if (olderVersions.length > 0) {
      html += `
        <button id="changelog-history-toggle" class="changelog-history-toggle" type="button">
          <span><i class="fas fa-history"></i> View Earlier Updates (${olderVersions.length} versions)</span>
          <i class="fas fa-chevron-down"></i>
        </button>
        <div id="changelog-history-list" class="changelog-history-list">
          ${olderVersions.map(ver => `
            <div class="changelog-history-item">
              <div class="changelog-history-header">
                <div class="changelog-history-version">
                  <span>${ver.version}</span>
                  ${ver.badge ? `<span class="changelog-tag ${this.getTagClass(ver.badge)}">${ver.badge}</span>` : ''}
                </div>
                <span class="changelog-date">${ver.date || ''}</span>
              </div>
              <div class="changelog-items-list">
                ${(ver.changes || []).map(change => `
                  <div class="changelog-item">
                    <div class="changelog-item-title-row">
                      <span class="changelog-tag ${this.getTagClass(change.type)}">${change.type || 'Update'}</span>
                      <span class="changelog-item-title">${change.title || ''}</span>
                    </div>
                    <p class="changelog-item-desc">${change.description || ''}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    bodyEl.innerHTML = html;

    // Attach accordion toggle listener
    const historyToggle = document.getElementById('changelog-history-toggle');
    const historyList = document.getElementById('changelog-history-list');
    if (historyToggle && historyList) {
      historyToggle.addEventListener('click', () => {
        const isOpen = historyList.classList.toggle('open');
        historyToggle.classList.toggle('active', isOpen);
      });
    }
  },

  /**
   * Helper to get CSS class for a change badge/tag
   */
  getTagClass(type) {
    if (!type) return 'enhancement';
    const lower = type.toLowerCase();
    if (lower.includes('feature')) return 'new-feature';
    if (lower.includes('fix') || lower.includes('bug')) return 'fix';
    if (lower.includes('security')) return 'security';
    if (lower.includes('major')) return 'major';
    return 'enhancement';
  },

  /**
   * Setup modal event listeners
   */
  setupEventListeners() {
    const modal = document.getElementById('changelog-modal');
    const closeBtn = document.getElementById('close-changelog-modal');
    const gotItBtn = document.getElementById('changelog-modal-got-it-btn');

    const handleDismiss = () => {
      this.close();
      if (this.data && this.data.currentVersion) {
        localStorage.setItem(this.storageKey, this.data.currentVersion);
      }
    };

    if (closeBtn) {
      closeBtn.onclick = handleDismiss;
    }

    if (gotItBtn) {
      gotItBtn.onclick = handleDismiss;
    }

    // Manual triggers from profile settings and footer
    const profileChangelogBtn = document.getElementById('profile-view-changelog-btn');
    if (profileChangelogBtn) {
      profileChangelogBtn.onclick = () => this.checkAndShowChangelog(true);
    }

    const footerChangelogLink = document.getElementById('footer-changelog-link');
    if (footerChangelogLink) {
      footerChangelogLink.onclick = (e) => {
        e.preventDefault();
        this.checkAndShowChangelog(true);
      };
    }

    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) {
          handleDismiss();
        }
      };
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
        handleDismiss();
      }
    });
  },

  /**
   * Open the Changelog Modal
   */
  open() {
    const modal = document.getElementById('changelog-modal');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  },

  /**
   * Close the Changelog Modal
   */
  close() {
    const modal = document.getElementById('changelog-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }
};

// Export to window for access in app.js and HTML
window.ChangelogModal = ChangelogModal;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ChangelogModal.init();
  });
} else {
  ChangelogModal.init();
}
