// ============================================
// NOTICE VIEWER MODULE
// ============================================

const NoticeViewer = {
    // Configuration
    API_BASE: 'https://b1t-acad-backend.vercel.app',
    CACHE_KEY: 'b1tSched_notices',
    CACHE_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    REFRESH_COOLDOWN_MS: 60 * 1000, // 60 seconds cooldown between manual refreshes

    // State
    noticesLoaded: false,
    notices: [],
    lastRefreshTime: 0,
    isRefreshing: false,
    autoRetryTimer: null,
    retryCountdownInterval: null,
    retrySecondsRemaining: 0,

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

        // Check for cached notices on init; if none cached, auto-load from Vercel Blob storage
        this.checkCache();
        if (!this.noticesLoaded || this.notices.length === 0) {
            this.loadNotices(false);
        }
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
            let noticesToSave = Array.isArray(notices) ? [...notices] : [];
            const cachedStr = localStorage.getItem(this.CACHE_KEY);
            if (cachedStr) {
                const cachedData = JSON.parse(cachedStr);
                if (Array.isArray(cachedData.notices)) {
                    const noticeMap = new Map();
                    cachedData.notices.forEach(n => {
                        if (n && n.id !== undefined && n.id !== null) noticeMap.set(String(n.id), n);
                    });
                    noticesToSave.forEach(n => {
                        if (n && n.id !== undefined && n.id !== null) noticeMap.set(String(n.id), n);
                    });
                    noticesToSave = Array.from(noticeMap.values()).sort((a, b) => (parseInt(b.id, 10) || 0) - (parseInt(a.id, 10) || 0));
                }
            }
            const data = {
                timestamp: Date.now(),
                notices: noticesToSave
            };
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Notice cache write error:', e);
        }
    },

    // ──────────────────────────────────────────────
    // FETCH NOTICES
    // ──────────────────────────────────────────────

    clearAutoRetryTimers() {
        if (this.autoRetryTimer) {
            clearTimeout(this.autoRetryTimer);
            this.autoRetryTimer = null;
        }
        if (this.retryCountdownInterval) {
            clearInterval(this.retryCountdownInterval);
            this.retryCountdownInterval = null;
        }
        this.retrySecondsRemaining = 0;
    },

    scheduleAutoRetry(seconds = 60) {
        this.clearAutoRetryTimers();
        this.retrySecondsRemaining = seconds;
        this.updateErrorCountdownUI();

        this.retryCountdownInterval = setInterval(() => {
            this.retrySecondsRemaining--;
            if (this.retrySecondsRemaining > 0) {
                this.updateErrorCountdownUI();
            } else {
                this.clearAutoRetryTimers();
            }
        }, 1000);

        this.autoRetryTimer = setTimeout(() => {
            console.log('[NoticeViewer] 1-minute cooldown elapsed, auto-retrying notice fetch...');
            this.clearAutoRetryTimers();
            this.loadNotices(false);
        }, seconds * 1000);
    },

    manualRetry() {
        this.clearAutoRetryTimers();
        this.loadNotices(false);
    },

    updateErrorCountdownUI() {
        const countdownElemDesktop = document.getElementById('notice-retry-countdown-desktop');
        const countdownElemMobile = document.getElementById('notice-retry-countdown-mobile');

        const text = this.retrySecondsRemaining > 0
            ? `<div style="margin-top: 8px; font-size: 13px; color: #856404;"><i class="fas fa-clock"></i> Server is starting up. Retrying automatically in <strong>${this.retrySecondsRemaining}s</strong>...</div>`
            : '';

        if (countdownElemDesktop) countdownElemDesktop.innerHTML = text;
        if (countdownElemMobile) countdownElemMobile.innerHTML = text;
    },

    async loadNotices(forceRefresh = false) {
        this.clearAutoRetryTimers();

        // If already loaded in this session, just render
        if (!forceRefresh && this.noticesLoaded && this.notices.length > 0) {
            this.renderAllNotices();
            return;
        }

        const now = Date.now();

        // If force refresh requested, enforce cooldown & prevent duplicate requests
        if (forceRefresh) {
            if (this.isRefreshing) {
                if (typeof UI !== 'undefined' && UI.showToast) {
                    UI.showToast('Notice refresh is already in progress. Please wait...', 'warning');
                }
                return;
            }

            if (this.lastRefreshTime > 0 && (now - this.lastRefreshTime) < this.REFRESH_COOLDOWN_MS) {
                const remainingSec = Math.ceil((this.REFRESH_COOLDOWN_MS - (now - this.lastRefreshTime)) / 1000);
                const cooldownMsg = `Please wait ${remainingSec}s before refreshing notices again.`;
                if (typeof UI !== 'undefined' && UI.showToast) {
                    UI.showToast(cooldownMsg, 'error');
                } else {
                    this.showErrorState(cooldownMsg);
                }
                return;
            }
        }

        // Show loading state
        this.showLoadingState(forceRefresh);
        if (forceRefresh) this.isRefreshing = true;

        try {
            const url = forceRefresh ? `${this.API_BASE}/api/notices?refresh=true` : `${this.API_BASE}/api/notices`;
            const response = await fetch(url);

            // Handle 503 waking up specifically
            if (response.status === 503) {
                const errorData = await response.json();
                if (errorData.error === 'waking_up') {
                    throw new Error(errorData.message);
                }
            }

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const data = await response.json();

            if (!data.notices || data.notices.length === 0) {
                this.showErrorState('No notices found.');
                return;
            }

            // Merge new notices with existing notices state so old notices are kept
            const noticeMap = new Map();
            (this.notices || []).forEach(n => {
                if (n && n.id !== undefined && n.id !== null) noticeMap.set(String(n.id), n);
            });
            data.notices.forEach(n => {
                if (n && n.id !== undefined && n.id !== null) noticeMap.set(String(n.id), n);
            });

            this.notices = Array.from(noticeMap.values()).sort((a, b) => (parseInt(b.id, 10) || 0) - (parseInt(a.id, 10) || 0));
            this.noticesLoaded = true;

            if (forceRefresh) {
                this.lastRefreshTime = Date.now();
                const totalLoaded = this.notices.length;
                const successMsg = `Notices updated from backend server! ${totalLoaded} notice(s) available.`;
                if (typeof UI !== 'undefined' && UI.showToast) {
                    UI.showToast(successMsg, 'success');
                }
            } else {
                console.log(`[NoticeViewer] Loaded ${this.notices.length} notices from Vercel Blob storage`);
            }

            if (data.source) {
                console.log(`[NoticeViewer] Notices loaded via ${data.source} (${data.cached ? 'cached' : 'fresh'}, total: ${this.notices.length})`);
            }

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
                this.scheduleAutoRetry(60);
                this.showErrorState(`Server unavailable (${error.message}). The server may be starting up.`);
            }
        } finally {
            if (forceRefresh) this.isRefreshing = false;
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

        if (listDesktop) listDesktop.style.display = 'grid';
        if (listMobile) listMobile.style.display = 'grid';

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

    showLoadingState(isCheckUpdates = false) {
        const loadingHTML = `
            <div class="notice-status">
                <div class="notice-spinner"></div>
                <span>${isCheckUpdates ? 'Checking for new notices from server...' : 'Loading notices from Vercel Blob storage...'}</span>
            </div>
        `;

        // Desktop
        const loadPromptDesktop = document.getElementById('notice-load-prompt-desktop');
        if (loadPromptDesktop) {
            loadPromptDesktop.style.display = 'flex';
            loadPromptDesktop.innerHTML = loadingHTML;
        }

        // Mobile
        const loadPromptMobile = document.getElementById('notice-load-prompt-mobile');
        if (loadPromptMobile) {
            loadPromptMobile.style.display = 'flex';
            loadPromptMobile.innerHTML = loadingHTML;
        }
    },

    showErrorState(message) {
        const countdownHTML = this.retrySecondsRemaining > 0
            ? `<div id="notice-retry-countdown-desktop" style="margin-top: 8px; font-size: 13px; color: #856404;"><i class="fas fa-clock"></i> Server is starting up. Retrying automatically in <strong>${this.retrySecondsRemaining}s</strong>...</div>`
            : '<div id="notice-retry-countdown-desktop"></div>';

        const countdownHTMLMobile = this.retrySecondsRemaining > 0
            ? `<div id="notice-retry-countdown-mobile" style="margin-top: 8px; font-size: 13px; color: #856404;"><i class="fas fa-clock"></i> Server is starting up. Retrying automatically in <strong>${this.retrySecondsRemaining}s</strong>...</div>`
            : '<div id="notice-retry-countdown-mobile"></div>';

        const errorHTML = `
            <div class="notice-status">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
                ${countdownHTML}
                <button class="notice-retry-btn" onclick="NoticeViewer.manualRetry()" style="margin-top: 8px;">
                    <i class="fas fa-redo"></i> Retry Now
                </button>
            </div>
        `;

        const errorHTMLMobile = `
            <div class="notice-status">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
                ${countdownHTMLMobile}
                <button class="notice-retry-btn" onclick="NoticeViewer.manualRetry()" style="margin-top: 8px;">
                    <i class="fas fa-redo"></i> Retry Now
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
            loadPromptMobile.innerHTML = errorHTMLMobile;
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
                const isFacultyOrDptCoor = (typeof App !== 'undefined' && (App.isFaculty || App.isDptCoor)) || (Utils.storage.get('userProfile')?.isFaculty || Utils.storage.get('userProfile')?.isDptCoor || Utils.storage.get('userProfile')?.isDptHead);
                this.updateNoticeTitles(isFacultyOrDptCoor);

                sidebar.classList.add('open');
                overlay.classList.add('active');
                if (toggle) toggle.style.display = 'none'; // Hide toggle when open
                document.body.style.overflow = 'hidden';

                if (!this.noticesLoaded || this.notices.length === 0) {
                    this.loadNotices(false);
                }
            } else {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
                if (toggle) toggle.style.display = 'flex'; // Show toggle when closed
                document.body.style.overflow = '';
            }
        }
    },

    openNoticeModal() {
        const isFacultyOrDptCoor = (typeof App !== 'undefined' && (App.isFaculty || App.isDptCoor)) || (Utils.storage.get('userProfile')?.isFaculty || Utils.storage.get('userProfile')?.isDptCoor || Utils.storage.get('userProfile')?.isDptHead);
        this.updateNoticeTitles(isFacultyOrDptCoor);

        UI.showModal('notice-modal');
        if (!this.noticesLoaded || this.notices.length === 0) {
            this.loadNotices(false);
        }
    },

    closeNoticeModal() {
        UI.hideModal('notice-modal');
    },

    // Update Notice modal/sidebar titles for Faculty/DptCoor vs CR/Student
    updateNoticeTitles(isFacultyOrDptCoor = false) {
        const desktopColTitle = document.getElementById('cr-notice-modal-col-title');
        const mobileSecTitle = document.getElementById('cr-notice-sidebar-section-title');
        const addModalTitle = document.getElementById('add-cr-notice-modal-title');
        const addModalTitle2 = document.getElementById('add-cr-notice-modal-title-2');
        const editModalTitle = document.getElementById('edit-cr-notice-modal-title');
        const oldModalTitle = document.getElementById('old-cr-notices-modal-title');

        if (isFacultyOrDptCoor) {
            if (desktopColTitle) desktopColTitle.innerHTML = '<i class="fas fa-building"></i> Department Notices';
            if (mobileSecTitle) mobileSecTitle.innerHTML = '<i class="fas fa-building"></i> Department Notices';
            if (addModalTitle) addModalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Add Department Notice';
            if (addModalTitle2) addModalTitle2.innerHTML = '<i class="fas fa-plus-circle"></i> Add Department Notice';
            if (editModalTitle) editModalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Department Notice';
            if (oldModalTitle) oldModalTitle.innerHTML = '<i class="fas fa-history"></i> Past Department Notices';
        } else {
            if (desktopColTitle) desktopColTitle.innerHTML = '<i class="fas fa-chalkboard-teacher"></i> CR Notices';
            if (mobileSecTitle) mobileSecTitle.innerHTML = '<i class="fas fa-chalkboard-teacher"></i> Class Notices';
            if (addModalTitle) addModalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Add Class Notice';
            if (addModalTitle2) addModalTitle2.innerHTML = '<i class="fas fa-plus-circle"></i> Add Class Notice';
            if (editModalTitle) editModalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Notice';
            if (oldModalTitle) oldModalTitle.innerHTML = '<i class="fas fa-history"></i> Past Class Notices';
        }
    }
};
