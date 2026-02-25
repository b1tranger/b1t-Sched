// ============================================
// NOTICE VIEWER MODULE
// ============================================

const NoticeViewer = {
    // Configuration
    API_BASE: 'https://b1t-acad-backend.vercel.app',
    CACHE_KEY: 'b1tSched_notices',
    CACHE_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds

    // State
    noticesLoaded: false,
    notices: [],

    // ──────────────────────────────────────────────
    // INITIALIZATION
    // ──────────────────────────────────────────────

    init() {
        // Desktop: Notice nav button opens modal
        const noticeNavBtn = document.getElementById('notice-nav-btn');
        if (noticeNavBtn) {
            noticeNavBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openNoticeModal();
            });
        }

        // Desktop modal close
        const closeNoticeModal = document.getElementById('close-notice-modal');
        if (closeNoticeModal) {
            closeNoticeModal.addEventListener('click', () => this.closeNoticeModal());
        }

        // Desktop modal backdrop click
        const noticeModal = document.getElementById('notice-modal');
        if (noticeModal) {
            noticeModal.addEventListener('click', (e) => {
                if (e.target === noticeModal) this.closeNoticeModal();
            });
        }

        // Desktop load button
        const loadBtnDesktop = document.getElementById('load-notices-btn-desktop');
        if (loadBtnDesktop) {
            loadBtnDesktop.addEventListener('click', () => this.loadNotices());
        }

        // Mobile: Notice sidebar toggle
        const noticeToggle = document.getElementById('notice-toggle');
        if (noticeToggle) {
            noticeToggle.addEventListener('click', () => this.toggleNoticeSidebar(true));
        }

        // Mobile: Close sidebar
        const closeNoticeSidebar = document.getElementById('close-notice-sidebar');
        if (closeNoticeSidebar) {
            closeNoticeSidebar.addEventListener('click', () => this.toggleNoticeSidebar(false));
        }

        // Mobile: Overlay click
        const noticeOverlay = document.getElementById('notice-overlay');
        if (noticeOverlay) {
            noticeOverlay.addEventListener('click', () => this.toggleNoticeSidebar(false));
        }

        // Mobile: Load button
        const loadBtnMobile = document.getElementById('load-notices-btn-mobile');
        if (loadBtnMobile) {
            loadBtnMobile.addEventListener('click', () => this.loadNotices());
        }

        // Add refresh button listeners
        const refreshBtnDesktop = document.getElementById('refresh-notices-btn-desktop');
        if (refreshBtnDesktop) {
            refreshBtnDesktop.addEventListener('click', () => this.loadNotices(true));
        }
        const refreshBtnMobile = document.getElementById('refresh-notices-btn-mobile');
        if (refreshBtnMobile) {
            refreshBtnMobile.addEventListener('click', () => this.loadNotices(true));
        }

        // Dashboard: Load Notices button
        const loadBtnDashboard = document.getElementById('load-notices-btn-dashboard');
        if (loadBtnDashboard) {
            loadBtnDashboard.addEventListener('click', (e) => {
                e.preventDefault();
                // Check if mobile or desktop based on window width or display style
                if (window.innerWidth <= 992) {
                    this.toggleNoticeSidebar(true);
                } else {
                    this.openNoticeModal();
                }
                // Ensure notices are loaded
                this.loadNotices();
            });
        }

        // Check for cached notices on init
        this.checkCache();
    },

    // ──────────────────────────────────────────────
    // CACHE MANAGEMENT
    // ──────────────────────────────────────────────

    checkCache() {
        try {
            const cached = localStorage.getItem(this.CACHE_KEY);
            if (!cached) return;

            const data = JSON.parse(cached);
            const now = Date.now();

            if (data.timestamp && (now - data.timestamp) < this.CACHE_TTL && data.notices && data.notices.length > 0) {
                // Cache is valid — load from it
                this.notices = data.notices;
                this.noticesLoaded = true;
                this.renderAllNotices();
            } else {
                // Cache expired — clear it
                localStorage.removeItem(this.CACHE_KEY);
            }
        } catch (e) {
            console.error('Notice cache read error:', e);
            localStorage.removeItem(this.CACHE_KEY);
        }
    },

    saveToCache(notices) {
        try {
            const data = {
                timestamp: Date.now(),
                notices: notices
            };
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Notice cache write error:', e);
        }
    },

    // ──────────────────────────────────────────────
    // FETCH NOTICES
    // ──────────────────────────────────────────────

    async loadNotices(forceRefresh = false) {
        // If already loaded in this session, just render
        if (!forceRefresh && this.noticesLoaded && this.notices.length > 0) {
            this.renderAllNotices();
            return;
        }

        // Show loading state
        this.showLoadingState();

        try {
            const url = forceRefresh ? `${this.API_BASE}/api/notices?refresh=true` : `${this.API_BASE}/api/notices`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const data = await response.json();

            if (!data.notices || data.notices.length === 0) {
                this.showErrorState('No notices found.');
                return;
            }

            this.notices = data.notices;
            this.noticesLoaded = true;

            // Save to localStorage
            this.saveToCache(this.notices);

            // Render in all containers
            this.renderAllNotices();

        } catch (error) {
            console.error('Fetch notices error:', error);

            // Try to load from cache if server is unavailable
            const cached = this.checkCache();
            if (cached) {
                console.log('Server unavailable, loading from cache');
                this.notices = cached;
                this.noticesLoaded = true;
                this.renderAllNotices();

                // Show a warning that data might be stale
                const containers = [
                    document.getElementById('notice-list-desktop'),
                    document.getElementById('notice-list-mobile')
                ];
                containers.forEach(container => {
                    if (container) {
                        const warning = document.createElement('div');
                        warning.style.cssText = 'padding: 10px; background: #fff3cd; color: #856404; border-radius: 4px; margin-bottom: 10px; font-size: 14px;';
                        warning.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Server unavailable. Showing cached notices.';
                        container.insertBefore(warning, container.firstChild);
                    }
                });
            } else {
                this.showErrorState(`Failed to load notices: ${error.message}. Please try again later.`);
            }
        }
    },

    // ──────────────────────────────────────────────
    // RENDERING
    // ──────────────────────────────────────────────

    // ──────────────────────────────────────────────
    // RENDERING
    // ──────────────────────────────────────────────

    renderAllNotices() {
        // Hide load prompts, show updated containers
        const loadPromptDesktop = document.getElementById('notice-load-prompt-desktop');
        const loadPromptMobile = document.getElementById('notice-load-prompt-mobile');

        const listDesktop = document.getElementById('notice-list-desktop');
        const listMobile = document.getElementById('notice-list-mobile');

        const refreshBtnDesktop = document.getElementById('refresh-notices-btn-desktop');
        const refreshBtnMobile = document.getElementById('refresh-notices-btn-mobile');

        if (loadPromptDesktop) loadPromptDesktop.style.display = 'none';
        if (loadPromptMobile) loadPromptMobile.style.display = 'none';

        if (refreshBtnDesktop) refreshBtnDesktop.style.display = 'block';
        if (refreshBtnMobile) refreshBtnMobile.style.display = 'block';

        if (listDesktop) listDesktop.style.display = 'block';
        if (listMobile) listMobile.style.display = 'flex';

        // Render desktop list
        this.renderNoticeList('notice-list-desktop');

        // Render mobile list
        this.renderNoticeList('notice-list-mobile');
    },

    renderNoticeList(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.notices.length === 0) {
            container.innerHTML = '<div class="notice-empty-state"><p>No notices found.</p></div>';
            return;
        }

        container.innerHTML = this.notices.map((notice, index) => {
            const date = notice.date || '';
            return `
            <li class="notice-item-wrapper">
                <button class="notice-item" data-notice-id="${notice.id}" data-notice-index="${index}">
                    <i class="fas fa-file-pdf"></i>
                    <div class="notice-item-content">
                        <span>Notice #${notice.id}</span>
                        <small>${date}</small>
                    </div>
                </button>
            </li>
            `;
        }).join('');

        // Click handlers
        container.querySelectorAll('.notice-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const noticeId = item.dataset.noticeId;
                this.openPdfViewer(noticeId);
            });
        });
    },

    // ──────────────────────────────────────────────
    // PDF VIEWING
    // ──────────────────────────────────────────────

    openPdfViewer(id) {
        const pdfUrl = `${this.API_BASE}/api/pdf?id=${id}`;

        // Mobile optimization: Open in new tab directly
        if (window.innerWidth <= 768) {
            window.open(pdfUrl, '_blank');
            return;
        }

        // Try to find the generic PDF viewer modal first
        const modal = document.getElementById('pdf-viewer-modal');
        if (modal) {
            const frame = document.getElementById('pdf-viewer-frame');
            const title = document.getElementById('pdf-viewer-title');
            const downloadBtn = document.getElementById('pdf-viewer-download');

            if (title) title.textContent = `Notice #${id}`;
            if (downloadBtn) {
                downloadBtn.href = pdfUrl;
                downloadBtn.download = `notice-${id}.pdf`;
            }

            if (frame) {
                frame.src = pdfUrl;
            }

            UI.showModal('pdf-viewer-modal');
        } else {
            // Fallback: Open in new tab
            window.open(pdfUrl, '_blank');
        }
    },

    // ──────────────────────────────────────────────
    // LOADING & ERROR STATES
    // ──────────────────────────────────────────────

    showLoadingState() {
        const loadingHTML = `
            <div class="notice-status">
                <div class="notice-spinner"></div>
                <span>Loading notices...</span>
            </div>
        `;

        // Desktop
        const loadPromptDesktop = document.getElementById('notice-load-prompt-desktop');
        if (loadPromptDesktop) loadPromptDesktop.innerHTML = loadingHTML;

        // Mobile
        const loadPromptMobile = document.getElementById('notice-load-prompt-mobile');
        if (loadPromptMobile) loadPromptMobile.innerHTML = loadingHTML;
    },

    showErrorState(message) {
        const errorHTML = `
            <div class="notice-status">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
                <button class="notice-retry-btn" onclick="NoticeViewer.loadNotices()">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;

        // Desktop
        const loadPromptDesktop = document.getElementById('notice-load-prompt-desktop');
        if (loadPromptDesktop) {
            loadPromptDesktop.style.display = 'flex';
            loadPromptDesktop.innerHTML = errorHTML;
        }

        // Mobile
        const loadPromptMobile = document.getElementById('notice-load-prompt-mobile');
        if (loadPromptMobile) {
            loadPromptMobile.style.display = 'flex';
            loadPromptMobile.innerHTML = errorHTML;
            // Also ensure list is hidden so error is visible
            const listMobile = document.getElementById('notice-list-mobile');
            if (listMobile) listMobile.style.display = 'none';
        }
    },

    // ──────────────────────────────────────────────
    // SIDEBAR & MODAL TOGGLE
    // ──────────────────────────────────────────────

    toggleNoticeSidebar(open) {
        const sidebar = document.getElementById('notice-sidebar');
        const overlay = document.getElementById('notice-overlay');
        const toggle = document.getElementById('notice-toggle');

        if (sidebar && overlay) {
            if (open) {
                sidebar.classList.add('open');
                overlay.classList.add('active');
                if (toggle) toggle.style.display = 'none'; // Hide toggle when open
                document.body.style.overflow = 'hidden';
            } else {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
                if (toggle) toggle.style.display = 'flex'; // Show toggle when closed
                document.body.style.overflow = '';
            }
        }
    },

    openNoticeModal() {
        UI.showModal('notice-modal');
    },

    closeNoticeModal() {
        UI.hideModal('notice-modal');
    }
};
