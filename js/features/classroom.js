// ============================================
// GOOGLE CLASSROOM MODULE
// ============================================

const Classroom = {
    // Configuration
    CLIENT_ID: '142195418679-0ripc2dn76otvkvfnk6kdk2aitdd29rm.apps.googleusercontent.com',
    SCOPES: 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly https://www.googleapis.com/auth/classroom.student-submissions.me.readonly https://www.googleapis.com/auth/classroom.student-submissions.students.readonly https://www.googleapis.com/auth/classroom.announcements.readonly https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly',
    SCOPE_VERSION: 'v2.46.0',

    // Date filter configuration (in months)
    DATE_FILTER_MONTHS: 6, // Only show items from the last 6 months

    // State
    tokenClient: null,
    accessToken: null,
    isInitialized: false,
    courses: [],
    currentCourseId: null,
    currentView: 'todo', // 'todo', 'notifications', or 'materials'
    showArchivedCourses: false, // Flag for toggling archived course cards
    refreshTimer: null,
    _authResolve: null, // Promise resolver for session check
    _sessionCheckTimeout: null,
    hasExpiredSession: false, // Flag for showing cached data with re-sign-in prompt
    hasScopePermissionIssue: false, // Flag when token lacks student-submissions scope
    createRedirectTimer: null,

    // Cache
    cache: {},
    inMemoryCache: {
        assignments: null,
        announcements: null,
        materials: null
    },
    cacheManager: null,
    JSON_CACHE_KEY: 'classroom_cached_json',

    isFacultyOrCR() {
        if (typeof App !== 'undefined') {
            if (App.isFaculty || App.isCR || App.isAdmin) return true;
            if (App.userProfile) {
                const role = App.userProfile.role;
                if (role === 'Faculty' || role === 'CR' || role === 'Admin' || App.userProfile.isFaculty === true || App.userProfile.isCR === true) {
                    return true;
                }
            }
        }
        if (typeof FacultyClassroom !== 'undefined' && typeof FacultyClassroom.isFacultyUser === 'function' && FacultyClassroom.isFacultyUser()) {
            return true;
        }
        return false;
    },

    updateCreateButtonVisibility() {
        const isConnected = localStorage.getItem('classroom_connected') === 'true';
        const isLoggedIn = Boolean(this.accessToken || isConnected);
        const isEligible = this.isFacultyOrCR();
        const showBtn = isLoggedIn && isEligible;

        const mobileBtn = document.getElementById('classroom-create-btn-mobile');
        const desktopBtn = document.getElementById('classroom-create-btn-desktop');
        if (mobileBtn) mobileBtn.style.display = showBtn ? 'flex' : 'none';
        if (desktopBtn) desktopBtn.style.display = showBtn ? 'flex' : 'none';
    },

    updateLogoutButtonVisibility() {
        const isConnected = localStorage.getItem('classroom_connected') === 'true';
        const isLoggedIn = Boolean(this.accessToken || isConnected);
        const sidebarLogout = document.getElementById('logout-classroom-sidebar');
        const modalLogout = document.getElementById('logout-classroom-modal');
        if (sidebarLogout) sidebarLogout.style.display = isLoggedIn ? 'inline-flex' : 'none';
        if (modalLogout) modalLogout.style.display = isLoggedIn ? 'inline-flex' : 'none';
        this.updateCreateButtonVisibility();
    },

    openCreateModal() {
        const modal = document.getElementById('classroom-create-modal');
        if (!modal) return;

        const countdownEl = document.getElementById('classroom-redirect-countdown');
        let countdown = 3;
        if (countdownEl) countdownEl.textContent = countdown;

        modal.style.display = 'flex';

        if (this.createRedirectTimer) {
            clearInterval(this.createRedirectTimer);
            this.createRedirectTimer = null;
        }

        this.createRedirectTimer = setInterval(() => {
            countdown--;
            if (countdownEl) countdownEl.textContent = countdown;
            if (countdown <= 0) {
                clearInterval(this.createRedirectTimer);
                this.createRedirectTimer = null;
                this.proceedToClassroomRedirect();
            }
        }, 1000);
    },

    closeCreateModal() {
        if (this.createRedirectTimer) {
            clearInterval(this.createRedirectTimer);
            this.createRedirectTimer = null;
        }
        const modal = document.getElementById('classroom-create-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    proceedToClassroomRedirect() {
        this.closeCreateModal();

        let targetUrl = 'https://classroom.google.com/';
        if (this.currentCourseId) {
            const course = this.courses.find(c => c.id === this.currentCourseId);
            if (course && course.alternateLink) {
                targetUrl = course.alternateLink;
            } else {
                targetUrl = `https://classroom.google.com/c/${this.currentCourseId}`;
            }
        }

        window.open(targetUrl, '_blank', 'noopener,noreferrer');
    },

    // Initialize cache manager
    initCacheManager() {
        if (!this.cacheManager && typeof CacheManager !== 'undefined') {
            this.cacheManager = new CacheManager();
            console.log('[Classroom] Cache manager initialized');
        }
    },

    // Save user's Classroom data as a structured JSON template cache
    saveJsonCache(dataType, data) {
        try {
            let jsonCache = this.getJsonCache() || {
                version: '1.0',
                timestamp: Date.now(),
                courses: [],
                assignments: [],
                announcements: [],
                materials: []
            };

            jsonCache.timestamp = Date.now();
            if (this.courses && this.courses.length > 0) {
                jsonCache.courses = this.courses;
            }

            if (dataType === 'courses') {
                jsonCache.courses = data || [];
            } else if (dataType === 'assignments') {
                jsonCache.assignments = data || [];
            } else if (dataType === 'announcements') {
                jsonCache.announcements = data || [];
            } else if (dataType === 'materials') {
                jsonCache.materials = data || [];
            }

            const jsonString = JSON.stringify(jsonCache);
            localStorage.setItem(this.JSON_CACHE_KEY, jsonString);
            sessionStorage.setItem(this.JSON_CACHE_KEY, jsonString);
            console.log(`[Classroom] Saved JSON cache template for ${dataType}`);
        } catch (e) {
            console.warn('[Classroom] Error saving JSON cache:', e);
        }
    },

    // Retrieve parsed JSON template cache
    getJsonCache() {
        try {
            const localData = localStorage.getItem(this.JSON_CACHE_KEY);
            const sessionData = sessionStorage.getItem(this.JSON_CACHE_KEY);
            const raw = localData || sessionData;
            if (raw) {
                return JSON.parse(raw);
            }
        } catch (e) {
            console.warn('[Classroom] Error parsing JSON cache:', e);
        }
        return null;
    },

    // Clear JSON template cache
    clearJsonCache() {
        try {
            localStorage.removeItem(this.JSON_CACHE_KEY);
            sessionStorage.removeItem(this.JSON_CACHE_KEY);
            console.log('[Classroom] Cleared JSON cache');
        } catch (e) {
            console.warn('[Classroom] Error clearing JSON cache:', e);
        }
    },

    // Merge newly fetched API items with existing cache, skipping unchanged items
    mergeAndSkipUnchanged(dataType, freshItems) {
        if (!freshItems || !Array.isArray(freshItems)) return [];

        let existingItems = [];
        if (this.inMemoryCache && this.inMemoryCache[dataType]) {
            existingItems = this.inMemoryCache[dataType];
        } else {
            const jsonCache = this.getJsonCache();
            if (jsonCache && jsonCache[dataType]) {
                existingItems = jsonCache[dataType];
            }
        }

        const existingMap = new Map();
        existingItems.forEach(item => {
            if (item && item.id) {
                existingMap.set(item.id, item);
            }
        });

        let skippedCount = 0;
        let updatedCount = 0;
        let newCount = 0;

        const mergedItems = freshItems.map(item => {
            if (!item || !item.id) return item;
            const existing = existingMap.get(item.id);
            if (existing) {
                const freshTime = item.updateTime || item.creationTime || (item.dueDate ? `${item.dueDate.year}-${item.dueDate.month}-${item.dueDate.day}` : '');
                const existingTime = existing.updateTime || existing.creationTime || (existing.dueDate ? `${existing.dueDate.year}-${existing.dueDate.month}-${existing.dueDate.day}` : '');

                if (freshTime && existingTime && freshTime === existingTime && existing.status === item.status) {
                    skippedCount++;
                    // Retain existing item but merge fresh submission/state attributes in case they were updated
                    return Object.assign({}, existing, item);
                } else {
                    updatedCount++;
                    return item;
                }
            } else {
                newCount++;
                return item;
            }
        });

        console.log(`[Classroom] Sync stats for ${dataType}: ${freshItems.length} items fetched (${skippedCount} unchanged/skipped, ${updatedCount} updated, ${newCount} new)`);

        if (!this.inMemoryCache) this.inMemoryCache = {};
        this.inMemoryCache[dataType] = mergedItems;
        return mergedItems;
    },

    // Helper to retrieve data from in-memory cache, CacheManager, or JSON template cache
    async getOrFetchData(type) {
        let result = [];
        if (this.inMemoryCache && this.inMemoryCache[type] && this.inMemoryCache[type].length > 0) {
            result = this.inMemoryCache[type];
        } else {
            this.initCacheManager();
            if (this.cacheManager) {
                const cached = await this.cacheManager.getCachedClassroomData(type);
                if (cached && cached.data && cached.data.length > 0) {
                    if (!this.inMemoryCache) this.inMemoryCache = {};
                    this.inMemoryCache[type] = cached.data;
                    result = cached.data;
                }
            }

            if (result.length === 0) {
                const jsonCache = this.getJsonCache();
                if (jsonCache && jsonCache[type]) {
                    if (!this.inMemoryCache) this.inMemoryCache = {};
                    this.inMemoryCache[type] = jsonCache[type];
                    result = jsonCache[type];
                }
            }
        }

        if (type === 'assignments' && Array.isArray(result)) {
            result = this.sortAssignments(result);
            if (this.inMemoryCache) this.inMemoryCache.assignments = result;
        }

        return result || [];
    },

    // Extract and parse Date from assignment dueDate / dueTime
    getAssignmentDueDate(item) {
        if (!item || !item.dueDate) return null;
        if (typeof item.dueDate === 'object' && 'year' in item.dueDate) {
            return new Date(
                item.dueDate.year,
                item.dueDate.month - 1,
                item.dueDate.day,
                item.dueTime?.hours !== undefined ? item.dueTime.hours : 23,
                item.dueTime?.minutes !== undefined ? item.dueTime.minutes : 59
            );
        }
        if (item.dueDate instanceof Date) return item.dueDate;
        if (typeof item.dueDate === 'string' || typeof item.dueDate === 'number') {
            const d = new Date(item.dueDate);
            if (!isNaN(d.getTime())) return d;
        }
        return null;
    },

    // Check if assignment has passed its due date
    isPastDue(item, now = new Date()) {
        const due = this.getAssignmentDueDate(item);
        if (!due) return false;
        return due < now;
    },

    // Check if assignment is actually submitted and turned in
    isSubmittedOrReturned(item) {
        if (!item) return false;
        if (item.wasActuallyTurnedIn !== undefined) {
            return Boolean(item.wasActuallyTurnedIn);
        }
        if (item.statusCode === 'turned_in') return true;
        if (item.submissionState === 'TURNED_IN') return true;
        if (item.status === 'Turned in' || item.status === 'Turned in (Late)') return true;
        if (item.submissionState === 'RETURNED') {
            if (item.sub && Array.isArray(item.sub.submissionHistory)) {
                return item.sub.submissionHistory.some(h => h.stateHistory && String(h.stateHistory.state).toUpperCase() === 'TURNED_IN');
            }
            if (typeof item.assignedGrade === 'number') return true;
        }
        return false;
    },

    // Determine assignment group: 0 = Due date yet to pass (upcoming deadlines), 1 = Assigned (no due date), 2 = Past deadline, 3 = Completed
    getAssignmentGroup(item, now = new Date()) {
        if (!item) return 1;
        if (this.isSubmittedOrReturned(item)) return 3;
        if (item.dueDate) {
            if (this.isPastDue(item, now)) return 2;
            return 0;
        }
        return 1;
    },

    // Sort assignments into vertical groups (+ completed):
    // 1. Tasks that have yet to pass due date (upcoming deadlines, ascending: earliest deadline first)
    // 2. "Assigned" tasks (no due date set)
    // 3. Tasks that have passed deadline (missing/overdue, ascending)
    // 4. Completed tasks — sorted: due date not yet passed first, then due date passed, each sub-group ascending
    sortAssignments(assignments) {
        if (!Array.isArray(assignments)) return [];
        const now = new Date();

        return [...assignments].sort((a, b) => {
            const groupA = this.getAssignmentGroup(a, now);
            const groupB = this.getAssignmentGroup(b, now);

            if (groupA !== groupB) {
                return groupA - groupB;
            }

            const dateA = this.getAssignmentDueDate(a);
            const dateB = this.getAssignmentDueDate(b);

            // Completed tasks (group 3): tasks whose deadline hasn't passed yet float above
            // those whose deadline has already passed, then ascending by date within each sub-group
            if (groupA === 3) {
                const aStillOpen = dateA && dateA >= now;
                const bStillOpen = dateB && dateB >= now;
                if (aStillOpen !== bStillOpen) return aStillOpen ? -1 : 1;
            }

            // All other groups: ascending due date order (earliest deadline first)
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return dateA - dateB;
        });
    },

    // Toggle and render persistent bottom cached content footer
    updateBottomCachedFooter(show, timeLabel = '') {
        const footers = [
            document.getElementById('classroom-footer-mobile'),
            document.getElementById('classroom-footer-desktop')
        ];

        footers.forEach(footer => {
            if (footer) {
                if (show) {
                    footer.style.display = 'flex';
                    footer.innerHTML = `
                        <div class="classroom-bottom-banner-text">
                            <i class="fas fa-info-circle"></i>
                            <span>Cached Content, login again to see new data${timeLabel ? ` (${timeLabel})` : ''}</span>
                        </div>
                        <button class="classroom-reconnect-btn" onclick="Classroom.login()">
                            <i class="fas fa-sync-alt"></i> Reconnect Classroom
                        </button>
                    `;
                } else {
                    footer.style.display = 'none';
                    footer.innerHTML = '';
                }
            }
        });
    },

    init() {
        console.log('Initializing Google Classroom module...');

        return new Promise((resolve) => {
            // Wait for Google Identity Services script to load
            if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
                console.warn('Google Identity Services not loaded yet. Retrying in 500ms...');

                // Retry up to 10 times
                if (!this.initRetryCount) this.initRetryCount = 0;
                this.initRetryCount++;

                if (this.initRetryCount <= 10) {
                    console.log(`Retry attempt ${this.initRetryCount}/10`);
                    setTimeout(() => this.init().then(resolve), 500);
                    return;
                } else {
                    console.error('Failed to load Google Identity Services after 10 retries');
                    this.renderError('Google Classroom is currently unavailable.');
                    resolve(false);
                    return;
                }
            }

            console.log('Google Identity Services detected successfully');

            // Initialize Token Client
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: this.CLIENT_ID,
                scope: this.SCOPES,
                callback: (tokenResponse) => {
                    if (tokenResponse.error) {
                        console.error('Error fetching access token:', tokenResponse);
                        this._handleAuthError(tokenResponse.error);
                        return;
                    }
                    this.accessToken = tokenResponse.access_token;
                    console.log('Access token received');
                    this.handleAuthSuccess(tokenResponse);
                },
            });

            console.log('Token client initialized successfully');

            this.setupEventListeners();
            this.isInitialized = true;
            this.renderInitialState();

            // Check for persisted connection - returns a promise
            this.checkPersistedSession().then(resolve);

            console.log('Google Classroom module setup complete');
        });
    },

    checkPersistedSession() {
        return new Promise((resolve) => {
            const token = localStorage.getItem('classroom_token');
            const expiryStr = localStorage.getItem('classroom_token_expiry');
            const isConnected = localStorage.getItem('classroom_connected') === 'true';
            const storedScopeVersion = localStorage.getItem('classroom_scope_version');

            // If stored token lacks latest scope version (v2.46.0 studentSubmissions scope), invalidate token
            if (storedScopeVersion !== this.SCOPE_VERSION) {
                console.log('[Classroom] Scope version mismatch (required: ' + this.SCOPE_VERSION + ', found: ' + storedScopeVersion + ') — invalidating old token to prompt for updated permissions');
                localStorage.removeItem('classroom_token');
                localStorage.removeItem('classroom_token_expiry');
            }

            // Store resolve context to be called when auth succeeds or fails
            this._authResolve = resolve;

            // Set a timeout to prevent blocking the app load if GIS is slow (5s)
            this._sessionCheckTimeout = setTimeout(() => {
                console.log('Classroom session check timed out');
                this._cleanupAuthPromise(false);
            }, 5000);

            const activeToken = localStorage.getItem('classroom_token');
            if (activeToken && expiryStr) {
                const expiryTime = parseInt(expiryStr);
                // Check if token is valid (with 5 min buffer)
                if (Date.now() < expiryTime - (5 * 60 * 1000)) {
                    console.log('Restoring valid Classroom session from storage...');
                    this.accessToken = activeToken;

                    // Schedule refresh
                    const timeUntilRefresh = Math.max(expiryTime - Date.now() - (5 * 60 * 1000), 0);

                    if (this.refreshTimer) clearTimeout(this.refreshTimer);

                    this.refreshTimer = setTimeout(() => {
                        console.log('Refreshing Classroom token...');
                        if (this.tokenClient) {
                            this.tokenClient.requestAccessToken({ prompt: 'none' });
                        }
                    }, timeUntilRefresh);

                    this.fetchCoursesAndLoadAll();
                    this.updateLogoutButtonVisibility();
                    this._cleanupAuthPromise(true);
                    return;
                } else {
                    console.log('Stored token expired — keeping connection state intact');
                }
            }

            // If no valid token but was connected, keep user connected
            // and mark as expired session to show cached data with reconnect option
            if (isConnected) {
                console.log('Classroom is connected, but token is expired. Preserving session state for cached access.');
                this.hasExpiredSession = true;
                localStorage.removeItem('classroom_token');
                localStorage.removeItem('classroom_token_expiry');
                this.showCachedDataWithBanner();
            } else {
                this.renderLoginState();
            }
            this.updateLogoutButtonVisibility();
            this._cleanupAuthPromise(false);
        });
    },

    _cleanupAuthPromise(result) {
        if (this._sessionCheckTimeout) {
            clearTimeout(this._sessionCheckTimeout);
            this._sessionCheckTimeout = null;
        }
        if (this._authResolve) {
            this._authResolve(result);
            this._authResolve = null;
        }
    },

    // Show cached data with a sticky re-connect banner
    async showCachedDataWithBanner() {
        this.updateBottomCachedFooter(true);
        await this.loadCachedItems(this.currentView === 'notifications' ? 'announcements' : (this.currentView === 'materials' ? 'materials' : 'assignments'));
    },

    // Setup UI event listeners
    setupEventListeners() {
        // Mobile Toggle Buttons (handle multiple possible IDs)
        const toggleMobile = document.getElementById('classroom-toggle') || document.getElementById('classroom-toggle-btn');
        if (toggleMobile) {
            toggleMobile.addEventListener('click', () => {
                this.openClassroomParams();
            });
            console.log('Attached listener to mobile classroom toggle');
        }

        // Desktop Navigation Buttons
        const navBtn = document.getElementById('classroom-nav-btn') || document.getElementById('classroom-toggle-btn-desktop');
        if (navBtn) {
            navBtn.addEventListener('click', (e) => {
                if (e) e.preventDefault();
                this.openClassroomParams();
            });
            console.log('Attached listener to desktop classroom nav button');
        }

        const closeMobile = document.getElementById('close-classroom-sidebar');
        const closeDesktop = document.getElementById('close-classroom-modal');
        const overlay = document.getElementById('classroom-overlay');

        if (closeMobile) {
            closeMobile.addEventListener('click', () => this.toggleSidebar(false));
            console.log('Attached listener to close-classroom-sidebar');
        }

        if (closeDesktop) {
            closeDesktop.addEventListener('click', () => this.toggleModal(false));
            console.log('Attached listener to close-classroom-modal');
        }

        if (overlay) {
            overlay.addEventListener('click', () => this.toggleSidebar(false));
            console.log('Attached listener to classroom-overlay');
        }

        const createModal = document.getElementById('classroom-create-modal');
        if (createModal) {
            createModal.addEventListener('click', (e) => {
                if (e.target === createModal) {
                    this.closeCreateModal();
                }
            });
        }

        console.log('Event listeners setup complete');
    },

    // =========================================
    // UI CONTROLS
    // =========================================

    openClassroomParams() {
        this.updateLogoutButtonVisibility();

        if (window.innerWidth <= 768) {
            this.toggleSidebar(true);
        } else {
            this.toggleModal(true);
        }

        const isConnected = localStorage.getItem('classroom_connected') === 'true';

        // 1. Valid token present -> fetch/load live courses
        if (this.accessToken) {
            if (this.courses.length === 0) {
                this.fetchCoursesAndLoadAll();
            } else {
                // Show current view immediately for instant response
                this.renderCurrentView();
                // Always trigger background refresh to update newly turned-in assignments
                this.fetchAllContentData().then(() => {
                    if (this.currentView === 'todo' || this.currentView === 'materials' || this.currentView === 'notifications') {
                        this.renderCurrentView();
                    }
                }).catch(err => {
                    console.warn('[Classroom] Background live sync warning:', err);
                });
            }
            return;
        }

        // 2. Connected but token expired -> show cached data with Reconnect banner
        if (isConnected) {
            console.log('[Classroom] Session expired or no valid token — showing cached data with Reconnect banner');
            this.hasExpiredSession = true;
            this.showCachedDataWithBanner();
            return;
        }

        // 3. Not connected -> show sign in prompt
        this.renderLoginState();
    },

    toggleSidebar(open) {
        const sidebar = document.getElementById('classroom-sidebar');
        const overlay = document.getElementById('classroom-overlay');

        if (open) {
            sidebar.classList.add('open');
            overlay.classList.add('visible');
            document.body.style.overflow = 'hidden';
        } else {
            sidebar.classList.remove('open');
            overlay.classList.remove('visible');
            document.body.style.overflow = '';
        }
    },

    toggleModal(open) {
        if (open) {
            UI.showModal('classroom-modal');
        } else {
            UI.hideModal('classroom-modal');
        }
    },

    // =========================================
    // AUTHENTICATION
    // =========================================

    login() {
        if (!this.tokenClient) return;
        // Request access token
        // prompt: 'consent' to force screen if needed, or '' for auto if already granted
        this.tokenClient.requestAccessToken({ prompt: '' });
    },

    handleAuthSuccess(tokenResponse) {
        // Auth successful, save state
        this.accessToken = tokenResponse.access_token;
        this.hasExpiredSession = false;
        localStorage.setItem('classroom_connected', 'true');

        // Save token to storage for persistence
        localStorage.setItem('classroom_token', this.accessToken);
        localStorage.setItem('classroom_scope_version', this.SCOPE_VERSION);
        this.hasScopePermissionIssue = false;

        // Calculate and save expiry
        if (tokenResponse.expires_in) {
            const expiresInMs = tokenResponse.expires_in * 1000;
            const expiryTime = Date.now() + expiresInMs;
            localStorage.setItem('classroom_token_expiry', expiryTime.toString());

            // Refresh 5 minutes before expiry
            const refreshTime = Math.max(expiresInMs - (5 * 60 * 1000), 0);

            if (this.refreshTimer) clearTimeout(this.refreshTimer);

            this.refreshTimer = setTimeout(() => {
                console.log('Refreshing Classroom token...');
                if (this.tokenClient) {
                    // Use 'none' prompt for silent refresh
                    this.tokenClient.requestAccessToken({ prompt: 'none' });
                }
            }, refreshTime);

            console.log(`Token refresh scheduled in ${Math.round(refreshTime / 60000)} minutes`);
        } else {
            // Default to 1 hour if not provided
            const expiryTime = Date.now() + (3600 * 1000);
            localStorage.setItem('classroom_token_expiry', expiryTime.toString());
        }

        // Fetch courses and load all assignments/notices/materials
        this.updateBottomCachedFooter(false);
        this.fetchCoursesAndLoadAll();
        this.updateLogoutButtonVisibility();

        // Resolve the init promise if it was waiting
        this._cleanupAuthPromise(true);
    },

    logout() {
        console.log('[Classroom] Explicit logout requested by user');
        if (this.accessToken && typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
            const token = this.accessToken;
            try {
                google.accounts.oauth2.revoke(token, () => {
                    console.log('[Classroom] Access token revoked');
                });
            } catch (e) {
                console.warn('[Classroom] Error revoking token:', e);
            }
        }
        this.cleanupSession();
    },

    cleanupSession() {
        console.log('[Classroom] Cleaning up session state and caches');
        this.accessToken = null;
        this.courses = [];
        this.currentCourseId = null;
        this.hasExpiredSession = false;
        this.hasScopePermissionIssue = false;

        // Clear cached classroom data
        this.initCacheManager();
        if (this.cacheManager) {
            this.cacheManager.clearUserCaches();
        }

        this.clearJsonCache();
        this.updateBottomCachedFooter(false);

        this.renderLoginState();
        this.updateLogoutButtonVisibility();
        localStorage.removeItem('classroom_connected');
        localStorage.removeItem('classroom_token');
        localStorage.removeItem('classroom_token_expiry');
        localStorage.removeItem('classroom_scope_version');

        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
    },

    // =========================================
    // API CALLS
    // =========================================

    async fetchCourses() {
        this.renderLoading('Loading courses...');

        try {
            const response = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE&courseStates=ARCHIVED', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch courses');

            const data = await response.json();
            this.courses = data.courses || [];

            this.renderCourseList();

        } catch (error) {
            console.error(error);
            this.renderError('Failed to load courses. Please try logging in again.');
            this.accessToken = null; // Reset token on failure
        }
    },

    async fetchCoursesAndLoadAll() {
        this.renderLoading('Loading courses and contents...');

        try {
            const response = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE&courseStates=ARCHIVED', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch courses');

            const data = await response.json();
            this.courses = data.courses || [];
            this.saveJsonCache('courses', this.courses);

            // Fetch assignments, announcements, and materials in parallel
            await this.fetchAllContentData();

            // Render current view or course details
            await this.renderCurrentView();

        } catch (error) {
            console.error(error);
            if (this.getJsonCache()) {
                console.log('[Classroom] Network error fetching live data, falling back to cached content');
                this.hasExpiredSession = true;
                await this.showCachedDataWithBanner();
            } else {
                this.renderError('Failed to load courses. Please try logging in again.');
                this.accessToken = null; // Reset token on failure
            }
        }
    },

    async fetchAllContentData() {
        this.initCacheManager();
        console.log('[Classroom] Batch pre-fetching assignments, announcements, and materials...');
        const results = await Promise.allSettled([
            this.fetchAssignmentsData(),
            this.fetchAnnouncementsData(),
            this.fetchMaterialsData()
        ]);
        console.log('[Classroom] All classroom contents pre-fetched and cached together');
        return results;
    },

    async fetchAssignmentsData() {
        try {
            let allAssignments = [];
            const cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - this.DATE_FILTER_MONTHS);

            for (const course of this.courses) {
                if (course.courseState !== 'ACTIVE') continue;

                try {
                    const [courseWorkRes, submissionsRes] = await Promise.all([
                        fetch(`https://classroom.googleapis.com/v1/courses/${course.id}/courseWork?orderBy=dueDate desc`, {
                            headers: { 'Authorization': `Bearer ${this.accessToken}` }
                        }),
                        fetch(`https://classroom.googleapis.com/v1/courses/${course.id}/courseWork/-/studentSubmissions?userId=me`, {
                            headers: { 'Authorization': `Bearer ${this.accessToken}` }
                        }).catch(err => {
                            console.warn(`Failed to fetch student submissions for course ${course.name}:`, err);
                            return null;
                        })
                    ]);

                    let submissionsMap = new Map();
                    if (submissionsRes && submissionsRes.ok) {
                        try {
                            const subData = await submissionsRes.json();
                            const submissions = subData.studentSubmissions || [];
                            submissions.forEach(sub => {
                                if (sub.courseWorkId) {
                                    submissionsMap.set(String(sub.courseWorkId), sub);
                                }
                            });
                            console.log(`[Classroom] Submissions for ${course.name}: ${submissions.length} loaded`);
                        } catch (subErr) {
                            console.warn(`Failed to parse submissions for course ${course.name}:`, subErr);
                        }
                    } else if (submissionsRes) {
                        console.warn(`[Classroom] studentSubmissions returned HTTP ${submissionsRes.status} for course ${course.name}`);
                        if (submissionsRes.status === 403 || submissionsRes.status === 401) {
                            this.hasScopePermissionIssue = true;
                        }
                    }

                    if (courseWorkRes && courseWorkRes.ok) {
                        const data = await courseWorkRes.json();
                        const courseWork = data.courseWork || [];

                        courseWork.forEach(work => {
                            let isPastDue = false;
                            if (work.dueDate) {
                                const dueDate = new Date(work.dueDate.year, work.dueDate.month - 1, work.dueDate.day, work.dueTime?.hours || 23, work.dueTime?.minutes || 59);
                                if (dueDate < cutoffDate) return;
                                if (dueDate < new Date()) {
                                    isPastDue = true;
                                }
                            } else if (work.creationTime) {
                                const creationDate = new Date(work.creationTime);
                                if (creationDate < cutoffDate) return;
                            }

                            work.courseName = course.name;
                            work.courseId = course.id;
                            work.courseState = course.courseState;

                            // Determine detailed submission status
                            const sub = submissionsMap.get(String(work.id));
                            const rawState = (sub && sub.state) ? String(sub.state).toUpperCase() : 'NEW';
                            const isLate = sub ? Boolean(sub.late) : false;
                            const assignedGrade = sub && typeof sub.assignedGrade === 'number' ? sub.assignedGrade : null;

                            // Determine if the student ACTUALLY submitted and turned in this assignment
                            let wasActuallyTurnedIn = false;
                            if (rawState === 'TURNED_IN') {
                                wasActuallyTurnedIn = true;
                            } else if (rawState === 'RETURNED') {
                                if (sub && Array.isArray(sub.submissionHistory)) {
                                    wasActuallyTurnedIn = sub.submissionHistory.some(h => h.stateHistory && String(h.stateHistory.state).toUpperCase() === 'TURNED_IN');
                                }
                                if (!wasActuallyTurnedIn && assignedGrade !== null) {
                                    wasActuallyTurnedIn = true;
                                }
                            }

                            work.submissionState = rawState;
                            work.isLate = isLate;
                            work.assignedGrade = assignedGrade;
                            work.wasActuallyTurnedIn = wasActuallyTurnedIn;
                            work.sub = sub || null;

                            if (rawState === 'RETURNED') {
                                if (assignedGrade !== null) {
                                    work.status = `Graded: ${assignedGrade}${work.maxPoints ? `/${work.maxPoints}` : ''}`;
                                    work.statusCode = 'graded';
                                } else {
                                    work.status = 'Returned';
                                    work.statusCode = 'returned';
                                }
                            } else if (rawState === 'TURNED_IN') {
                                work.status = isLate ? 'Turned in (Late)' : 'Turned in';
                                work.statusCode = 'turned_in';
                            } else if (isPastDue) {
                                work.status = 'Missing';
                                work.statusCode = 'missing';
                            } else {
                                work.status = 'Assigned';
                                work.statusCode = 'assigned';
                            }

                            allAssignments.push(work);
                        });
                    }
                } catch (err) {
                    console.warn(`Failed to load assignments for course ${course.name}:`, err);
                }
            }

            allAssignments = this.sortAssignments(allAssignments);

            // Incremental sync & merge
            const mergedAssignments = this.mergeAndSkipUnchanged('assignments', allAssignments);

            if (this.cacheManager) {
                await this.cacheManager.cacheClassroomData('assignments', mergedAssignments);
            }
            this.saveJsonCache('assignments', mergedAssignments);

            // NOTE: syncTurnedInAssignmentsToUserCompletions is intentionally NOT called here.
            // Task completion state is ONLY updated when the user explicitly clicks Refresh
            // (refreshData), NOT on Sync (which only imports tasks) or background loads.

            return mergedAssignments;

        } catch (error) {
            console.error('[Classroom] Error fetching assignments data:', error);
            return [];
        }
    },

    async fetchAnnouncementsData() {
        try {
            const allAnnouncements = [];
            const cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - this.DATE_FILTER_MONTHS);

            for (const course of this.courses) {
                if (course.courseState !== 'ACTIVE') continue;

                try {
                    const response = await fetch(`https://classroom.googleapis.com/v1/courses/${course.id}/announcements?orderBy=updateTime desc`, {
                        headers: { 'Authorization': `Bearer ${this.accessToken}` }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const announcements = data.announcements || [];

                        announcements.forEach(announcement => {
                            if (announcement.updateTime) {
                                const updateDate = new Date(announcement.updateTime);
                                if (updateDate < cutoffDate) return;
                            } else if (announcement.creationTime) {
                                const creationDate = new Date(announcement.creationTime);
                                if (creationDate < cutoffDate) return;
                            }

                            announcement.courseName = course.name;
                            announcement.courseId = course.id;
                            announcement.courseState = course.courseState;
                            allAnnouncements.push(announcement);
                        });
                    }
                } catch (err) {
                    console.warn(`Failed to load announcements for course ${course.name}:`, err);
                }
            }

            allAnnouncements.sort((a, b) => {
                return new Date(b.updateTime) - new Date(a.updateTime);
            });

            // Incremental sync & merge
            const mergedAnnouncements = this.mergeAndSkipUnchanged('announcements', allAnnouncements);

            if (this.cacheManager) {
                await this.cacheManager.cacheClassroomData('announcements', mergedAnnouncements);
            }
            this.saveJsonCache('announcements', mergedAnnouncements);
            return mergedAnnouncements;

        } catch (error) {
            console.error('[Classroom] Error fetching announcements data:', error);
            return [];
        }
    },

    async fetchMaterialsData() {
        try {
            const allMaterials = [];
            const cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - this.DATE_FILTER_MONTHS);

            for (const course of this.courses) {
                if (course.courseState !== 'ACTIVE') continue;

                try {
                    const response = await fetch(`https://classroom.googleapis.com/v1/courses/${course.id}/courseWorkMaterials`, {
                        headers: { 'Authorization': `Bearer ${this.accessToken}` }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const materialsList = data.courseWorkMaterial || [];

                        materialsList.forEach(mat => {
                            if (mat.updateTime) {
                                const updateDate = new Date(mat.updateTime);
                                if (updateDate < cutoffDate) return;
                            } else if (mat.creationTime) {
                                const creationDate = new Date(mat.creationTime);
                                if (creationDate < cutoffDate) return;
                            }

                            mat.courseName = course.name;
                            mat.courseId = course.id;
                            mat.courseState = course.courseState;
                            allMaterials.push(mat);
                        });
                    }
                } catch (err) {
                    console.warn(`Failed to load materials for course ${course.name}:`, err);
                }
            }

            allMaterials.sort((a, b) => {
                const timeA = new Date(a.updateTime || a.creationTime || 0);
                const timeB = new Date(b.updateTime || b.creationTime || 0);
                return timeB - timeA;
            });

            // Incremental sync & merge
            const mergedMaterials = this.mergeAndSkipUnchanged('materials', allMaterials);

            if (this.cacheManager) {
                await this.cacheManager.cacheClassroomData('materials', mergedMaterials);
            }
            this.saveJsonCache('materials', mergedMaterials);
            return mergedMaterials;

        } catch (error) {
            console.error('[Classroom] Error fetching materials data:', error);
            return [];
        }
    },

    async renderCurrentView() {
        const type = this.currentView === 'notifications' ? 'announcements' : (this.currentView === 'materials' ? 'materials' : 'assignments');
        const items = await this.getOrFetchData(type);

        if (this.accessToken && !this.hasExpiredSession) {
            this.updateBottomCachedFooter(false);
        }

        if (this.currentCourseId) {
            const courseItems = items.filter(item => item.courseId === this.currentCourseId);
            this.renderCourseDetails(this.currentCourseId, courseItems, this.currentView);
        } else {
            this.renderAllItems(items, this.currentView);
        }
    },

    async loadAllAssignments() {
        this.currentView = 'todo';
        await this.renderCurrentView();
    },

    async loadAllAnnouncements() {
        this.currentView = 'notifications';
        await this.renderCurrentView();
    },

    async loadAllMaterials() {
        this.currentView = 'materials';
        await this.renderCurrentView();
    },

    async fetchCourseWork(courseId) {
        this.currentCourseId = courseId;
        this.currentView = 'todo';
        await this.renderCurrentView();
    },

    async fetchAnnouncements(courseId) {
        this.currentCourseId = courseId;
        this.currentView = 'notifications';
        await this.renderCurrentView();
    },

    async fetchCourseMaterials(courseId) {
        this.currentCourseId = courseId;
        this.currentView = 'materials';
        await this.renderCurrentView();
    },

    // =========================================
    // RENDERING
    // =========================================

    getContainers() {
        // Return both mobile and desktop containers to update them simultaneously
        return [
            document.getElementById('classroom-content-mobile'),
            document.getElementById('classroom-content-desktop')
        ];
    },

    renderInitialState() {
        this.updateLogoutButtonVisibility();
        this.updateBottomCachedFooter(false);
        const containers = this.getContainers();
        containers.forEach(container => {
            if (container) {
                container.innerHTML = `
                    <div class="classroom-auth-container">
                        <i class="fas fa-chalkboard-teacher" style="font-size: 48px; color: var(--classroom-green); margin-bottom: 20px;"></i>
                        <p>Connect your Google Classroom account to view your tasks and notifications.</p>
                        <button class="classroom-login-btn" onclick="Classroom.login()">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="G">
                            Sign in with Google
                        </button>
                    </div>
                `;
            }
        });
    },

    renderLoginState() {
        this.renderInitialState();
    },

    renderLoading(message) {
        const containers = this.getContainers();
        containers.forEach(container => {
            if (container) {
                container.innerHTML = `
                    <div class="classroom-loading">
                        <div class="loader"></div>
                        <p>${message}</p>
                    </div>
                `;
            }
        });
    },

    renderError(message) {
        const containers = this.getContainers();
        containers.forEach(container => {
            if (container) {
                container.innerHTML = `
                    <div class="classroom-auth-container">
                        <i class="fas fa-exclamation-circle" style="font-size: 48px; color: var(--danger); margin-bottom: 20px;"></i>
                        <p>${message}</p>
                        <button class="btn btn-secondary" onclick="Classroom.login()">Try Again</button>
                    </div>
                `;
            }
        });
    },

    // Show cached classroom data with a persistent bottom banner and reconnect button
    async showCachedDataWithBanner() {
        this.initCacheManager();

        let cachedItems = null;
        let timestamp = Date.now();
        const type = this.currentView === 'notifications' ? 'announcements' : (this.currentView === 'materials' ? 'materials' : 'assignments');

        // 1. Try to load from CacheManager
        if (this.cacheManager) {
            const cachedData = await this.cacheManager.getCachedClassroomData(type);
            if (cachedData && cachedData.data && cachedData.data.length > 0) {
                cachedItems = cachedData.data;
                timestamp = cachedData.timestamp;
            }
        }

        // 2. Fall back to JSON template cache if CacheManager has no items
        if (!cachedItems || cachedItems.length === 0) {
            const jsonCache = this.getJsonCache();
            if (jsonCache) {
                timestamp = jsonCache.timestamp || Date.now();
                if (type === 'announcements') {
                    cachedItems = jsonCache.announcements;
                } else if (type === 'materials') {
                    cachedItems = jsonCache.materials;
                } else {
                    cachedItems = jsonCache.assignments;
                }
            }
        }

        if (cachedItems && cachedItems.length > 0) {
            console.log(`[Classroom] Showing cached ${type} with persistent bottom Reconnect banner`);

            if (type === 'assignments') {
                cachedItems = this.sortAssignments(cachedItems);
                // NOTE: syncTurnedInAssignmentsToUserCompletions is intentionally NOT called here.
                // Task completion state is ONLY updated when the user explicitly clicks Refresh.
            }

            // Calculate how long ago the data was cached
            const cachedAgo = Date.now() - timestamp;
            const hoursAgo = Math.floor(cachedAgo / (1000 * 60 * 60));
            const minsAgo = Math.floor(cachedAgo / (1000 * 60));
            let timeLabel;
            if (hoursAgo >= 24) {
                const daysAgo = Math.floor(hoursAgo / 24);
                timeLabel = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
            } else if (hoursAgo >= 1) {
                timeLabel = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
            } else {
                timeLabel = `${minsAgo} minute${minsAgo > 1 ? 's' : ''} ago`;
            }

            // Render cached items for current course or unified view
            if (this.currentCourseId) {
                const courseItems = cachedItems.filter(item => item.courseId === this.currentCourseId);
                this.renderCourseDetails(this.currentCourseId, courseItems, this.currentView);
            } else {
                this.renderAllItems(cachedItems, this.currentView);
            }

            // Activate persistent bottom footer banner & Reconnect button
            this.updateBottomCachedFooter(true, timeLabel);
        } else {
            // No cached data available, show login screen
            console.log('[Classroom] No cached data available, showing login screen');
            this.updateBottomCachedFooter(false);
            this.renderLoginState();
        }
    },

    renderExpiredSessionBanner(timeLabel) {
        return `
            <div class="classroom-expired-banner">
                <div class="expired-banner-content">
                    <i class="fas fa-info-circle"></i>
                    <span>Session expired · Last updated ${timeLabel}</span>
                </div>
                <button class="expired-banner-btn" onclick="Classroom.login()">
                    <i class="fas fa-sync-alt"></i> Reconnect
                </button>
            </div>
        `;
    },

    toggleArchivedCourses() {
        this.showArchivedCourses = !this.showArchivedCourses;
        this.renderCourseList();
    },

    openUnifiedView() {
        this.currentCourseId = null;
        this.switchView(this.currentView || 'todo');
    },

    renderCourseList() {
        if (this.courses.length === 0) {
            const jsonCache = this.getJsonCache();
            if (jsonCache && jsonCache.courses && jsonCache.courses.length > 0) {
                this.courses = jsonCache.courses;
            }
        }

        if (this.hasExpiredSession) {
            const jsonCache = this.getJsonCache();
            let timeLabel = '';
            if (jsonCache && jsonCache.timestamp) {
                const hoursAgo = Math.floor((Date.now() - jsonCache.timestamp) / (1000 * 60 * 60));
                const minsAgo = Math.floor((Date.now() - jsonCache.timestamp) / (1000 * 60));
                if (hoursAgo >= 24) {
                    const daysAgo = Math.floor(hoursAgo / 24);
                    timeLabel = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
                } else if (hoursAgo >= 1) {
                    timeLabel = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
                } else {
                    timeLabel = `${minsAgo} minute${minsAgo > 1 ? 's' : ''} ago`;
                }
            }
            this.updateBottomCachedFooter(true, timeLabel);
        }

        if (this.courses.length === 0) {
            const containers = this.getContainers();
            containers.forEach(container => {
                if (container) {
                    container.innerHTML = `
                        <div class="classroom-empty">
                            <i class="fas fa-chalkboard"></i>
                            <p>No courses found.</p>
                            <button class="btn btn-text" onclick="Classroom.logout()">Switch Account</button>
                        </div>
                    `;
                }
            });
            return;
        }

        const activeCourses = this.courses.filter(c => c.courseState === 'ACTIVE' || !c.courseState);
        const archivedCourses = this.courses.filter(c => c.courseState === 'ARCHIVED');

        const renderCard = (course) => `
            <div class="course-card ${course.courseState === 'ARCHIVED' ? 'archived-card' : ''}" onclick="Classroom.openCourse('${course.id}')">
                <div class="course-header" style="background-color: ${course.courseState === 'ARCHIVED' ? 'var(--classroom-text-secondary, #5f6368)' : 'var(--classroom-green)'};">
                    <div class="course-title">${course.name}${course.courseState === 'ARCHIVED' ? ' (Archived)' : ''}</div>
                    <div class="course-section">${course.section || ''}</div>
                </div>
                <div class="course-body">
                    <div class="course-work-preview">
                        ${course.descriptionHeading || 'Tap to view assignments and notices'}
                    </div>
                </div>
            </div>
        `;

        let activeCoursesHtml = activeCourses.map(renderCard).join('');
        if (activeCourses.length === 0) {
            activeCoursesHtml = '<p style="color: var(--classroom-text-secondary); padding: 10px 0;">No active courses.</p>';
        }

        let archivedCoursesHtml = '';
        if (archivedCourses.length > 0) {
            if (this.showArchivedCourses) {
                archivedCoursesHtml = `
                    <div class="archived-courses-section" style="margin-top: 24px; padding-top: 16px; border-top: 1px dashed var(--classroom-border);">
                        <h4 style="margin-bottom: 12px; color: var(--classroom-text-secondary); font-weight: 500; font-size: 0.95rem;">
                            Archived Classrooms (${archivedCourses.length})
                        </h4>
                        ${archivedCourses.map(renderCard).join('')}
                    </div>
                    <div style="text-align: center; margin-top: 16px; margin-bottom: 20px;">
                        <button class="btn btn-secondary btn-sm show-archived-btn" onclick="Classroom.toggleArchivedCourses()">
                            <i class="fas fa-eye-slash"></i> Hide archived classrooms
                        </button>
                    </div>
                `;
            } else {
                archivedCoursesHtml = `
                    <div style="text-align: center; margin-top: 20px; margin-bottom: 20px;">
                        <button class="btn btn-secondary btn-sm show-archived-btn" onclick="Classroom.toggleArchivedCourses()">
                            <i class="fas fa-archive"></i> Show archived classrooms (${archivedCourses.length})
                        </button>
                    </div>
                `;
            }
        }

        const html = `
            <div class="classroom-view-header">
                <div style="display: flex; align-items: center;">
                    <button class="classroom-back-btn" onclick="Classroom.openUnifiedView()" title="Unified View (All Courses)" style="margin-right: 8px;">
                        <i class="fa-solid fa-list-check"></i>
                    </button>
                    <span style="font-weight: 500; font-size: 1.1rem;">My Classes</span>
                </div>
            </div>
            <div class="classroom-courses-container">
                ${activeCoursesHtml}
                ${archivedCoursesHtml}
            </div>
        `;

        const containers = this.getContainers();
        containers.forEach(container => {
            if (container) {
                container.innerHTML = html;
                // Important: reset current course ID when viewing the course list
                this.currentCourseId = null;
            }
        });
    },

    /**
     * Compute line-by-line diff between two text strings using Longest Common Subsequence (LCS)
     * @param {string} oldText 
     * @param {string} newText 
     * @returns {Object} { lines, addCount, delCount, hasChanges }
     */
    computeLineDiff(oldText, newText) {
        const linesOld = (oldText || '').split(/\r?\n/);
        const linesNew = (newText || '').split(/\r?\n/);

        if (linesOld.length > 1 && linesOld[linesOld.length - 1] === '') linesOld.pop();
        if (linesNew.length > 1 && linesNew[linesNew.length - 1] === '') linesNew.pop();

        const n = linesOld.length;
        const m = linesNew.length;

        // DP table for LCS
        const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                if (linesOld[i] === linesNew[j]) {
                    dp[i + 1][j + 1] = dp[i][j] + 1;
                } else {
                    dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
                }
            }
        }

        // Backtrack to assemble diff stream
        let i = n, j = m;
        const diffStream = [];
        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && linesOld[i - 1] === linesNew[j - 1]) {
                diffStream.unshift({ type: 'same', oldLine: i, newLine: j, text: linesOld[i - 1] });
                i--;
                j--;
            } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
                diffStream.unshift({ type: 'add', oldLine: null, newLine: j, text: linesNew[j - 1] });
                j--;
            } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
                diffStream.unshift({ type: 'del', oldLine: i, newLine: null, text: linesOld[i - 1] });
                i--;
            }
        }

        const addCount = diffStream.filter(d => d.type === 'add').length;
        const delCount = diffStream.filter(d => d.type === 'del').length;

        return {
            lines: diffStream,
            addCount,
            delCount,
            hasChanges: addCount > 0 || delCount > 0
        };
    },

    /**
     * Extract structured materials list from Classroom item
     * @param {Array} materials 
     * @returns {Array} List of { title, url, icon, type }
     */
    extractMaterialsList(materials) {
        if (!materials || !Array.isArray(materials)) return [];
        return materials.map(mat => {
            let title = 'Attachment';
            let url = '#';
            let icon = 'fa-paperclip';
            let type = 'file';

            if (mat.driveFile && mat.driveFile.driveFile) {
                title = mat.driveFile.driveFile.title || 'Google Drive File';
                url = mat.driveFile.driveFile.alternateLink || '#';
                icon = 'fa-file';
                type = 'driveFile';
            } else if (mat.youtubeVideo) {
                title = mat.youtubeVideo.title || 'YouTube Video';
                url = mat.youtubeVideo.alternateLink || `https://www.youtube.com/watch?v=${mat.youtubeVideo.id}`;
                icon = 'fa-video';
                type = 'youtube';
            } else if (mat.link) {
                title = mat.link.title || mat.link.url || 'Web Link';
                url = mat.link.url || '#';
                icon = 'fa-link';
                type = 'link';
            } else if (mat.form) {
                title = mat.form.title || 'Google Form';
                url = mat.form.formUrl || '#';
                icon = 'fa-file-signature';
                type = 'form';
            }
            return { title, url, icon, type };
        });
    },

    /**
     * Compute full property and line diff between existing task and fresh classroom item
     * @param {Object|null} existingTask 
     * @param {Object} assignment 
     * @param {boolean} isNew 
     * @returns {Object} Detailed diff object
     */
    computeItemDiff(existingTask, assignment, isNew = false) {
        const linkLabel = assignment.alternateLink ? `[View in Classroom](${assignment.alternateLink})\n\n` : '';
        const newInstructions = assignment.description || '';

        let oldInstructions = '';
        let oldTitle = '';
        let oldDeadlineStr = 'No due date';

        if (existingTask) {
            const oldFullDesc = existingTask.description || '';
            oldInstructions = oldFullDesc.replace(/^\[View in Classroom\]\([^\)]+\)\n\n?/, '');
            oldTitle = existingTask.title || '';
            if (existingTask.deadline) {
                const oldDate = existingTask.deadline.toDate ? existingTask.deadline.toDate() : new Date(existingTask.deadline);
                oldDeadlineStr = Utils.formatDate(oldDate);
            }
        }

        const newMaterials = this.extractMaterialsList(assignment.materials);

        let newDeadlineStr = 'No due date';
        if (assignment.dueDate) {
            const due = new Date(assignment.dueDate.year, assignment.dueDate.month - 1, assignment.dueDate.day, assignment.dueTime?.hours || 23, assignment.dueTime?.minutes || 59);
            newDeadlineStr = Utils.formatDate(due);
        }

        const titleChanged = !isNew && Boolean(oldTitle && assignment.title && oldTitle !== assignment.title);
        const deadlineChanged = !isNew && oldDeadlineStr !== newDeadlineStr;

        // Line diff for instructions / caption
        const lineDiff = this.computeLineDiff(isNew ? '' : oldInstructions, newInstructions);

        return {
            isNew,
            titleChanged,
            oldTitle,
            newTitle: assignment.title,
            deadlineChanged,
            oldDeadlineStr,
            newDeadlineStr,
            materials: newMaterials,
            lineDiff,
            hasAnyChanges: isNew || titleChanged || deadlineChanged || lineDiff.hasChanges
        };
    },

    /**
     * Render Git commit history style diff container
     * @param {Object} diff 
     * @returns {string} HTML string
     */
    renderDiffViewer(diff) {
        if (!diff) return '';

        let html = '';

        // 1. Property Changes (Title & Deadline)
        if (diff.titleChanged || diff.deadlineChanged) {
            html += `
                <div class="git-diff-viewer">
                    <div class="git-diff-header">
                        <div class="git-diff-title">
                            <i class="fas fa-tag"></i> Property Changes
                        </div>
                    </div>
                    <div class="git-diff-meta-row">
                        ${diff.titleChanged ? `
                            <div class="git-diff-meta-item">
                                <span class="git-diff-meta-label">Title:</span>
                                <span class="git-diff-del-inline">${Utils.escapeHtml(diff.oldTitle)}</span>
                                <i class="fas fa-arrow-right" style="font-size: 0.75rem; color: #8b949e;"></i>
                                <span class="git-diff-add-inline">${Utils.escapeHtml(diff.newTitle)}</span>
                            </div>
                        ` : ''}
                        ${diff.deadlineChanged ? `
                            <div class="git-diff-meta-item">
                                <span class="git-diff-meta-label">Deadline:</span>
                                <span class="git-diff-del-inline">${Utils.escapeHtml(diff.oldDeadlineStr)}</span>
                                <i class="fas fa-arrow-right" style="font-size: 0.75rem; color: #8b949e;"></i>
                                <span class="git-diff-add-inline">${Utils.escapeHtml(diff.newDeadlineStr)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        // 2. Attachments & Files Diff
        if (diff.materials && diff.materials.length > 0) {
            const fileItems = diff.materials.map(mat => `
                <div class="git-diff-file-tag added">
                    <i class="fas ${mat.icon}"></i>
                    <span>+ <strong>${Utils.escapeHtml(mat.title)}</strong></span>
                    ${mat.url && mat.url !== '#' ? `<a href="${mat.url}" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link-alt"></i></a>` : ''}
                </div>
            `).join('');

            html += `
                <div class="git-diff-viewer">
                    <div class="git-diff-header">
                        <div class="git-diff-title">
                            <i class="fas fa-paperclip"></i> Files & Attachments (${diff.materials.length})
                        </div>
                        <div class="git-diff-stats">
                            <span class="git-diff-stat-add">+${diff.materials.length} attached</span>
                        </div>
                    </div>
                    <div class="git-diff-attachments-list">
                        ${fileItems}
                    </div>
                </div>
            `;
        }

        // 3. Line-by-Line Instructions / Description Diff
        const ld = diff.lineDiff;
        if (ld && ld.lines && ld.lines.length > 0) {
            const tableRows = ld.lines.map(l => {
                const rowClass = l.type === 'add' ? 'git-diff-row-add' : (l.type === 'del' ? 'git-diff-row-del' : 'git-diff-row-same');
                const sign = l.type === 'add' ? '+' : (l.type === 'del' ? '-' : ' ');
                const oldNum = l.oldLine !== null ? l.oldLine : '';
                const newNum = l.newLine !== null ? l.newLine : '';
                const escapedText = Utils.escapeHtml(l.text || ' ');

                return `
                    <tr class="${rowClass}">
                        <td class="git-diff-num">${oldNum}</td>
                        <td class="git-diff-num">${newNum}</td>
                        <td class="git-diff-sign">${sign}</td>
                        <td class="git-diff-code">${escapedText}</td>
                    </tr>
                `;
            }).join('');

            html += `
                <div class="git-diff-viewer">
                    <div class="git-diff-header">
                        <div class="git-diff-title">
                            <i class="fas fa-file-alt"></i> Instructions / Description Diff
                        </div>
                        <div class="git-diff-stats">
                            <span class="git-diff-stat-add">+${ld.addCount} lines</span>
                            <span class="git-diff-stat-del">-${ld.delCount} lines</span>
                        </div>
                    </div>
                    <div class="git-diff-table-wrapper">
                        <table class="git-diff-table">
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (!diff.titleChanged && !diff.deadlineChanged && (!diff.materials || diff.materials.length === 0)) {
            html += `
                <div class="git-diff-viewer">
                    <div class="git-diff-header">
                        <div class="git-diff-title"><i class="fas fa-check"></i> Details</div>
                    </div>
                    <div style="padding: 12px 14px; font-size: 0.82rem; color: #8b949e;">
                        No textual modifications found. Properties are up to date.
                    </div>
                </div>
            `;
        }

        return html;
    },

    /**
     * Show Sync Summary Modal with git-style version control briefing
     * @param {Object} summary 
     */
    showSyncSummaryModal(summary) {
        const modal = document.getElementById('classroom-sync-modal');
        if (!modal) return;

        const badgeEl = document.getElementById('classroom-sync-badge');
        const overviewEl = document.getElementById('classroom-sync-overview-bar');
        const itemsContainer = document.getElementById('classroom-sync-items-container');

        const added = summary.added || [];
        const updated = summary.updated || [];
        const unchanged = summary.unchanged || [];
        const totalChanges = added.length + updated.length;

        if (badgeEl) {
            badgeEl.textContent = `${totalChanges} Change${totalChanges === 1 ? '' : 's'}`;
        }

        if (overviewEl) {
            overviewEl.innerHTML = `
                <span class="sync-overview-stat added"><i class="fas fa-plus-circle"></i> ${added.length} Added</span>
                <span class="sync-overview-stat updated"><i class="fas fa-pen-nib"></i> ${updated.length} Updated</span>
                <span class="sync-overview-stat unchanged"><i class="fas fa-check-circle"></i> ${unchanged.length} Up to date</span>
            `;
        }

        if (itemsContainer) {
            if (totalChanges === 0 && unchanged.length === 0) {
                itemsContainer.innerHTML = `
                    <div class="sync-empty-state">
                        <i class="fas fa-clipboard-check"></i>
                        <h4>No assignments found</h4>
                        <p>There were no eligible assignments with due dates to sync from Google Classroom.</p>
                    </div>
                `;
            } else if (totalChanges === 0) {
                itemsContainer.innerHTML = `
                    <div class="sync-empty-state">
                        <i class="fas fa-check-double"></i>
                        <h4>All items are up to date</h4>
                        <p>No new assignments, deadline changes, or instruction updates detected.</p>
                    </div>
                `;
            } else {
                const allItems = [...added, ...updated];
                itemsContainer.innerHTML = allItems.map(item => {
                    const statusClass = item.status === 'added' ? 'status-added' : (item.status === 'updated' ? 'status-updated' : 'status-unchanged');
                    const badgeClass = item.status;
                    const badgeIcon = item.status === 'added' ? 'fa-plus' : (item.status === 'updated' ? 'fa-pen' : 'fa-check');
                    const badgeLabel = item.status === 'added' ? 'Added Task' : (item.status === 'updated' ? 'Updated' : 'Up to date');

                    const diffHtml = this.renderDiffViewer(item.diff);

                    return `
                        <div class="sync-card ${statusClass}">
                            <div class="sync-card-header">
                                <div class="sync-card-info">
                                    <div class="sync-card-badges">
                                        <span class="sync-action-badge ${badgeClass}">
                                            <i class="fas ${badgeIcon}"></i> ${badgeLabel}
                                        </span>
                                        <span class="sync-course-pill">${Utils.escapeHtml(item.courseName || 'Classroom')}</span>
                                    </div>
                                    <h4 class="sync-card-title">${Utils.escapeHtml(item.title)}</h4>
                                    <div class="sync-card-meta">
                                        <i class="far fa-clock"></i>
                                        <span>${Utils.escapeHtml(item.diff?.newDeadlineStr || 'No due date')}</span>
                                    </div>
                                </div>
                                <div class="sync-card-actions">
                                    ${item.link ? `
                                        <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="sync-view-post-btn" title="View original post in Google Classroom">
                                            <i class="fas fa-external-link-alt"></i> View in Classroom
                                        </a>
                                    ` : ''}
                                    <button class="sync-diff-toggle-btn" onclick="Classroom.toggleSyncDiff(event, '${item.id}')" title="Toggle version control diff view">
                                        <span>View Changes</span>
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                </div>
                            </div>
                            <div id="sync-diff-${item.id}" class="sync-diff-dropdown">
                                ${diffHtml}
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    },

    closeSyncSummaryModal() {
        const modal = document.getElementById('classroom-sync-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    },

    toggleSyncDiff(event, itemId) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const diffEl = document.getElementById(`sync-diff-${itemId}`);
        const btn = event ? event.currentTarget : null;
        if (!diffEl) return;

        const isOpen = diffEl.classList.toggle('is-open');
        if (btn) {
            btn.classList.toggle('is-active', isOpen);
            const labelSpan = btn.querySelector('span');
            if (labelSpan) {
                labelSpan.textContent = isOpen ? 'Hide Changes' : 'View Changes';
            }
        }
    },

    async syncAssignmentsToTasks() {
        if (typeof App === 'undefined' || (!App.isAdmin && !App.isCR)) return;

        const syncBtn = document.getElementById('sync-classroom-tasks-btn');
        const courseSyncBtn = document.getElementById('sync-classroom-tasks-btn-course');
        
        [syncBtn, courseSyncBtn].forEach(btn => {
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
            }
        });

        try {
            // Get assignments from cache
            let assignments = [];
            if (this.cacheManager) {
                const cachedData = await this.cacheManager.getCachedClassroomData('assignments');
                if (cachedData && cachedData.data) {
                    assignments = cachedData.data;
                }
            }

            if (assignments.length === 0) {
                this.showSyncSummaryModal({ added: [], updated: [], unchanged: [] });
                return;
            }

            // Get only assignments with a valid dueDate
            const syncableAssignments = assignments.filter(a => a.dueDate);

            if (syncableAssignments.length === 0) {
                this.showSyncSummaryModal({ added: [], updated: [], unchanged: [] });
                return;
            }

            const classroomWorkIds = syncableAssignments.map(a => a.id);
            const existingTasksResult = await DB.getTasksByClassroomIds(classroomWorkIds);
            const existingTasksMap = new Map();

            if (existingTasksResult.success && existingTasksResult.data) {
                existingTasksResult.data.forEach(task => {
                    if (task.classroomWorkId) {
                        existingTasksMap.set(task.classroomWorkId, task);
                    }
                });
            }

            const userId = Auth.getUserId();
            const userEmail = Auth.getUserEmail();
            const addedItems = [];
            const updatedItems = [];
            const unchangedItems = [];

            for (const assignment of syncableAssignments) {
                // Format due date to be compatible with DB structure
                const due = new Date(assignment.dueDate.year, assignment.dueDate.month - 1, assignment.dueDate.day, assignment.dueTime?.hours || 23, assignment.dueTime?.minutes || 59);

                // Add Markdown link to description
                const linkLabel = assignment.alternateLink ? `[View in Classroom](${assignment.alternateLink})\n\n` : '';
                const desc = linkLabel + (assignment.description || '');

                const taskData = {
                    title: assignment.title,
                    course: assignment.courseName || 'Classroom Assignment',
                    type: 'assignment',
                    description: desc,
                    department: App.userProfile ? App.userProfile.department : 'ALL',
                    semester: App.userProfile ? App.userProfile.semester : null,
                    section: App.userProfile ? App.userProfile.section : null,
                    deadline: due.toISOString(),
                    addedFrom: 'classroom',
                    classroomWorkId: assignment.id
                };

                const existingTask = existingTasksMap.get(assignment.id);

                if (existingTask) {
                    // Compute detailed property and line diff
                    const itemDiff = this.computeItemDiff(existingTask, assignment, false);

                    let existingDueIso = null;
                    if (existingTask.deadline) {
                        const existingDate = existingTask.deadline.toDate ? existingTask.deadline.toDate() : new Date(existingTask.deadline);
                        existingDueIso = existingDate.toISOString();
                    }

                    const hasChanges = existingTask.title !== taskData.title ||
                                       existingTask.course !== taskData.course ||
                                       existingTask.description !== taskData.description ||
                                       existingDueIso !== taskData.deadline;

                    if (hasChanges || itemDiff.hasAnyChanges) {
                        const updateRes = await DB.updateTask(existingTask.id, taskData);
                        if (updateRes && updateRes.success) {
                            updatedItems.push({
                                id: assignment.id,
                                title: assignment.title,
                                courseName: assignment.courseName || 'Classroom Assignment',
                                link: assignment.alternateLink || '#',
                                status: 'updated',
                                diff: itemDiff
                            });
                        }
                    } else {
                        unchangedItems.push({
                            id: assignment.id,
                            title: assignment.title,
                            courseName: assignment.courseName || 'Classroom Assignment',
                            link: assignment.alternateLink || '#',
                            status: 'unchanged',
                            diff: itemDiff
                        });
                    }
                } else {
                    // New Task Addition
                    const itemDiff = this.computeItemDiff(null, assignment, true);
                    const result = await DB.createTask(userId, userEmail, taskData);
                    if (result && result.success) {
                        addedItems.push({
                            id: assignment.id,
                            title: assignment.title,
                            courseName: assignment.courseName || 'Classroom Assignment',
                            link: assignment.alternateLink || '#',
                            status: 'added',
                            diff: itemDiff
                        });
                    }
                }
            }

            // Open the rich Git Diff Summary Modal
            this.showSyncSummaryModal({
                added: addedItems,
                updated: updatedItems,
                unchanged: unchangedItems
            });

            // Refresh dashboard tasks
            if (App && typeof App.loadDashboardData === 'function') {
                await App.loadDashboardData(false);
            }

            // NOTE: syncAssignmentsToTasks ONLY imports / updates assignments in the task database.
            // Task completion checking upon completion is handled exclusively by the refresh button (refreshData).

        } catch (error) {
            console.error('Error syncing assignments:', error);
            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                UI.showToast('An error occurred while syncing assignments.', 'error');
            }
        } finally {
            [syncBtn, courseSyncBtn].forEach(btn => {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-sync-alt"></i> Sync';
                }
            });
        }
    },

    /**
     * Automatically mark matching tasks in "Pending Tasks" as completed ONLY for turned-in assignments.
     * If an assignment has NOT been turned in (or was unsubmitted), ensures matching tasks are unchecked.
     * @param {Array} assignments 
     */
    async syncTurnedInAssignmentsToUserCompletions(assignments) {
        if (!Array.isArray(assignments) || assignments.length === 0) return;

        // Skip if user is restricted/blocked
        if (typeof App !== 'undefined' && App.isBlocked) return;

        try {
            const userId = (typeof Auth !== 'undefined' && Auth.getUserId) ? Auth.getUserId() : null;
            if (!userId) return;

            const userEmail = (typeof Auth !== 'undefined' && Auth.getUserEmail) ? Auth.getUserEmail() : null;
            let userRole = 'Student';
            if (typeof App !== 'undefined') {
                if (App.isAdmin) userRole = 'Admin';
                else if (App.isFaculty) userRole = 'Faculty';
                else if (App.isCR) userRole = 'CR';
            }

            // Get available tasks
            let tasks = (typeof App !== 'undefined' && Array.isArray(App.currentTasks)) ? App.currentTasks : [];
            if (tasks.length === 0 && typeof DB !== 'undefined' && typeof App !== 'undefined' && App.userProfile) {
                const tasksResult = await DB.getTasks(App.userProfile.department, App.userProfile.semester, App.userProfile.section);
                if (tasksResult && tasksResult.success && Array.isArray(tasksResult.data)) {
                    tasks = tasksResult.data;
                }
            }

            if (!tasks || tasks.length === 0) return;

            // Get current user completions
            let userCompletions = (typeof App !== 'undefined' && App.userCompletions) ? App.userCompletions : {};
            if (Object.keys(userCompletions).length === 0 && typeof DB !== 'undefined') {
                const compResult = await DB.getUserTaskCompletions(userId);
                if (compResult && compResult.success && compResult.data) {
                    userCompletions = compResult.data;
                    if (typeof App !== 'undefined') App.userCompletions = userCompletions;
                }
            }

            let completionsChanged = false;

            for (const assignment of assignments) {
                if (!assignment || !assignment.id) continue;

                // Check if the user has actually submitted and turned in this assignment
                const isTurnedIn = this.isSubmittedOrReturned(assignment);

                // Find matching task(s) in Pending Tasks
                const matchingTasks = tasks.filter(task => {
                    if (!task) return false;
                    // 1. Direct match by classroomWorkId (if task has classroomWorkId, it MUST match assignment.id)
                    if (task.classroomWorkId) {
                        return String(task.classroomWorkId) === String(assignment.id);
                    }
                    // 2. Match by alternateLink in description
                    if (assignment.alternateLink && task.description && task.description.includes(assignment.alternateLink)) {
                        return true;
                    }
                    // 3. Match by exact title & course (must match both title AND course; never match across different courses!)
                    if (task.title && assignment.title && task.title.trim().toLowerCase() === assignment.title.trim().toLowerCase()) {
                        if (task.course && assignment.courseName && task.course.trim().toLowerCase() === assignment.courseName.trim().toLowerCase()) {
                            return true;
                        }
                    }
                    return false;
                });

                for (const task of matchingTasks) {
                    const isCurrentlyCompleted = Boolean(userCompletions[task.id]);

                    if (isTurnedIn && !isCurrentlyCompleted) {
                        // Mark as completed ONLY when actually submitted / turned in
                        if (typeof DB !== 'undefined' && typeof DB.toggleTaskCompletion === 'function') {
                            console.log(`[Classroom] Auto-completing task "${task.title}" because assignment "${assignment.title}" is turned in`);
                            const toggleRes = await DB.toggleTaskCompletion(userId, task.id, true, userEmail, userRole);
                            if (toggleRes && toggleRes.success) {
                                userCompletions[task.id] = { completedAt: new Date() };
                                completionsChanged = true;
                            }
                        }
                    } else if (!isTurnedIn && isCurrentlyCompleted) {
                        // Uncheck if NOT turned in (or unsubmitted)
                        if (typeof DB !== 'undefined' && typeof DB.toggleTaskCompletion === 'function') {
                            console.log(`[Classroom] Unchecking task "${task.title}" because assignment "${assignment.title}" is NOT turned in`);
                            const toggleRes = await DB.toggleTaskCompletion(userId, task.id, false, userEmail, userRole);
                            if (toggleRes && toggleRes.success) {
                                delete userCompletions[task.id];
                                completionsChanged = true;
                            }
                        }
                    }
                }
            }

            if (completionsChanged && typeof App !== 'undefined') {
                App.userCompletions = userCompletions;

                // Re-render tasks UI if on dashboard
                if (typeof UI !== 'undefined' && typeof UI.renderTasks === 'function' && Array.isArray(App.currentTasks)) {
                    UI.renderTasks(App.currentTasks, App.userCompletions, App.isAdmin, App.isCR, userId);
                }

                if (typeof App.reapplyActiveTaskFilter === 'function') {
                    App.reapplyActiveTaskFilter();
                }

                if (App.calendarView && typeof App.calendarView.onTasksUpdated === 'function') {
                    App.calendarView.onTasksUpdated();
                }
            }
        } catch (err) {
            console.warn('[Classroom] Error auto-syncing task completions with Classroom assignments:', err);
        }
    },

    async refreshData() {
        if (!this.accessToken) {
            console.log('[Classroom] Cannot refresh without access token, showing login');
            this.renderLoginState();
            return;
        }

        // Snapshot previous cached data to calculate diffs upon refresh
        const prevAssignments = (this.inMemoryCache && this.inMemoryCache.assignments) || (this.getJsonCache() && this.getJsonCache().assignments) || [];
        const prevAnnouncements = (this.inMemoryCache && this.inMemoryCache.announcements) || (this.getJsonCache() && this.getJsonCache().announcements) || [];
        const prevAssignmentsMap = new Map();
        prevAssignments.forEach(a => { if (a && a.id) prevAssignmentsMap.set(String(a.id), a); });
        const prevAnnouncementsMap = new Map();
        prevAnnouncements.forEach(a => { if (a && a.id) prevAnnouncementsMap.set(String(a.id), a); });

        // Clear in-memory cache and CacheManager entries for a fresh sync
        this.inMemoryCache = { assignments: null, announcements: null, materials: null };
        this.initCacheManager();
        if (this.cacheManager) {
            const cache = await caches.open(this.cacheManager.CACHE_NAME);
            await cache.delete(this.cacheManager.KEYS.CLASSROOM_ASSIGNMENTS);
            await cache.delete(this.cacheManager.KEYS.CLASSROOM_ANNOUNCEMENTS);
            await cache.delete(this.cacheManager.KEYS.CLASSROOM_MATERIALS);
            console.log('[Classroom] Cleared cached classroom data for refresh');
        }

        // Re-fetch courses and reload all
        this.courses = [];
        await this.fetchCoursesAndLoadAll();

        // Compute changes across fresh assignments & announcements
        const freshAssignments = (this.inMemoryCache && this.inMemoryCache.assignments) || [];
        const freshAnnouncements = (this.inMemoryCache && this.inMemoryCache.announcements) || [];

        const addedItems = [];
        const updatedItems = [];
        const unchangedItems = [];

        // Check assignments
        for (const item of freshAssignments) {
            const prev = prevAssignmentsMap.get(String(item.id));
            if (!prev) {
                const diff = this.computeItemDiff(null, item, true);
                addedItems.push({
                    id: item.id,
                    title: item.title || 'Assignment',
                    courseName: item.courseName || 'Classroom Assignment',
                    link: item.alternateLink || '#',
                    status: 'added',
                    diff
                });
            } else {
                const diff = this.computeItemDiff({
                    title: prev.title,
                    description: prev.description,
                    deadline: prev.dueDate ? new Date(prev.dueDate.year, prev.dueDate.month - 1, prev.dueDate.day, prev.dueTime?.hours || 23, prev.dueTime?.minutes || 59) : null
                }, item, false);

                if (diff.hasAnyChanges) {
                    updatedItems.push({
                        id: item.id,
                        title: item.title || 'Assignment',
                        courseName: item.courseName || 'Classroom Assignment',
                        link: item.alternateLink || '#',
                        status: 'updated',
                        diff
                    });
                } else {
                    unchangedItems.push({
                        id: item.id,
                        title: item.title || 'Assignment',
                        courseName: item.courseName || 'Classroom Assignment',
                        link: item.alternateLink || '#',
                        status: 'unchanged',
                        diff
                    });
                }
            }
        }

        // Check announcements / notices
        for (const ann of freshAnnouncements) {
            const prev = prevAnnouncementsMap.get(String(ann.id));
            const annTitle = ann.text ? (ann.text.split('\n')[0].substring(0, 50) + (ann.text.length > 50 ? '...' : '')) : 'Notice / Announcement';
            if (!prev) {
                const diff = this.computeItemDiff(null, {
                    title: annTitle,
                    description: ann.text,
                    alternateLink: ann.alternateLink,
                    materials: ann.materials
                }, true);
                addedItems.push({
                    id: ann.id,
                    title: annTitle,
                    courseName: ann.courseName || 'Class Announcement',
                    link: ann.alternateLink || '#',
                    status: 'added',
                    diff
                });
            } else {
                const prevTitle = prev.text ? (prev.text.split('\n')[0].substring(0, 50) + (prev.text.length > 50 ? '...' : '')) : 'Notice / Announcement';
                const diff = this.computeItemDiff({
                    title: prevTitle,
                    description: prev.text
                }, {
                    title: annTitle,
                    description: ann.text,
                    alternateLink: ann.alternateLink,
                    materials: ann.materials
                }, false);

                if (diff.hasAnyChanges) {
                    updatedItems.push({
                        id: ann.id,
                        title: annTitle,
                        courseName: ann.courseName || 'Class Announcement',
                        link: ann.alternateLink || '#',
                        status: 'updated',
                        diff
                    });
                } else {
                    unchangedItems.push({
                        id: ann.id,
                        title: annTitle,
                        courseName: ann.courseName || 'Class Announcement',
                        link: ann.alternateLink || '#',
                        status: 'unchanged',
                        diff
                    });
                }
            }
        }

        // Refresh dashboard tasks so App.currentTasks is fresh before checking completions
        if (typeof App !== 'undefined' && typeof App.loadDashboardData === 'function') {
            await App.loadDashboardData(false);
        }

        // Auto-check completed/turned-in tasks in Pending Tasks upon refresh
        await this.syncTurnedInAssignmentsToUserCompletions(freshAssignments);

        // Present the Classroom Sync Summary modal briefing
        this.showSyncSummaryModal({
            added: addedItems,
            updated: updatedItems,
            unchanged: unchangedItems
        });
    },

    // Render To-Do items divided into 3 distinct groups (+ completed) with small-height divider banners
    renderTodoList(items, renderItemFn) {
        if (!Array.isArray(items) || items.length === 0) return '';
        const now = new Date();

        const upcomingDue = [];
        const assignedNoDue = [];
        const passedDue = [];
        const completed = [];

        items.forEach(item => {
            const group = this.getAssignmentGroup(item, now);
            if (group === 0) {
                upcomingDue.push(item);
            } else if (group === 1) {
                assignedNoDue.push(item);
            } else if (group === 2) {
                passedDue.push(item);
            } else {
                completed.push(item);
            }
        });

        let html = '';

        // Group 1: Tasks that have yet to pass the due date (upcoming deadlines)
        if (upcomingDue.length > 0) {
            html += upcomingDue.map(renderItemFn).join('');
        }

        // Group 2: Assigned tasks (no due date set)
        if (assignedNoDue.length > 0) {
            html += assignedNoDue.map(renderItemFn).join('');
        }

        // Group 3: Tasks that have passed the deadline (unsubmitted/missing)
        // Show the "Past deadline" banner only when there are also upcoming/assigned tasks above;
        // if ALL active tasks are past deadline (nothing above), no banner — just list them.
        if (passedDue.length > 0) {
            const hasActiveTasksAbove = upcomingDue.length > 0 || assignedNoDue.length > 0;
            if (hasActiveTasksAbove) {
                html += `
                <div class="classroom-group-divider passed-due-divider">
                    <div class="classroom-group-divider-line"></div>
                    <div class="classroom-group-divider-badge">
                        <i class="fa-solid fa-clock-rotate-left"></i>
                        <span>Past deadline</span>
                        <span class="classroom-group-count">${passedDue.length}</span>
                    </div>
                    <div class="classroom-group-divider-line"></div>
                </div>
            `;
            }
            html += passedDue.map(renderItemFn).join('');
        }

        // Group 4: Completed tasks (Turned In, Graded, Returned)
        // Sub-divided: completed tasks with remaining deadline first, then past-deadline completed tasks
        if (completed.length > 0) {
            html += `
                <div class="classroom-group-divider completed-divider">
                    <div class="classroom-group-divider-line"></div>
                    <div class="classroom-group-divider-badge">
                        <i class="fa-solid fa-circle-check"></i>
                        <span>Completed</span>
                        <span class="classroom-group-count">${completed.length}</span>
                    </div>
                    <div class="classroom-group-divider-line"></div>
                </div>
            `;

            // Split completed into: still within deadline vs past deadline
            const completedUpcoming = completed.filter(item => {
                const due = this.getAssignmentDueDate(item);
                return due && due >= now;
            });
            const completedPast = completed.filter(item => {
                const due = this.getAssignmentDueDate(item);
                return !due || due < now;
            });

            // Render sub-group 1: completed tasks whose deadline hasn't passed yet
            if (completedUpcoming.length > 0) {
                html += completedUpcoming.map(renderItemFn).join('');
            }

            // Render "Past deadline" sub-banner + sub-group 2 only when both sub-groups are non-empty
            if (completedPast.length > 0) {
                if (completedUpcoming.length > 0) {
                    html += `
                        <div class="classroom-group-divider passed-due-divider">
                            <div class="classroom-group-divider-line"></div>
                            <div class="classroom-group-divider-badge">
                                <i class="fa-solid fa-clock-rotate-left"></i>
                                <span>Past deadline</span>
                                <span class="classroom-group-count">${completedPast.length}</span>
                            </div>
                            <div class="classroom-group-divider-line"></div>
                        </div>
                    `;
                }
                html += completedPast.map(renderItemFn).join('');
            }
        }

        return html;
    },


    renderAllItems(items, viewType) {
        // Header with Toggle
        const headerHtml = `
            <div class="classroom-view-header" style="flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; align-items: center; flex: 1; justify-content: space-between;">
                    <div style="display: flex; align-items: center;">
                        <button class="classroom-back-btn" onclick="Classroom.renderCourseList()" title="Back to Classes" style="margin-right: 8px;">
                            <i class="fa-solid fa-house"></i>
                        </button>
                        <span style="font-weight: 500; font-size: 1.1rem;">
                            All Courses
                        </span>
                        <button class="classroom-back-btn" onclick="Classroom.refreshData()" title="Refresh" style="margin-left: 4px;">
                            <i class="fas fa-redo-alt"></i>
                        </button>
                    </div>
                    ${(viewType === 'todo' && typeof App !== 'undefined' && (App.isAdmin || App.isCR)) ? `
                    <button id="sync-classroom-tasks-btn" class="btn btn-sm btn-primary" onclick="Classroom.syncAssignmentsToTasks()" title="Sync Assignments to Tasks">
                        <i class="fas fa-sync-alt"></i> Sync
                    </button>
                    `
                : ''}
                </div>
                <div class="classroom-view-toggle">
                    <button class="view-toggle-btn ${viewType === 'todo' ? 'active' : ''}" onclick="Classroom.switchView('todo')">
                        To-Do
                    </button>
                    <button class="view-toggle-btn ${viewType === 'notifications' ? 'active' : ''}" onclick="Classroom.switchView('notifications')">
                        Notices
                    </button>
                    <button class="view-toggle-btn ${viewType === 'materials' ? 'active' : ''}" onclick="Classroom.switchView('materials')">
                        Materials
                    </button>
                </div>
            </div>
        `;

        let listHtml = '';
        if (items.length === 0) {
            const emptyIcon = viewType === 'todo' ? 'clipboard-check' : (viewType === 'materials' ? 'folder-open' : 'bullhorn');
            const emptyText = viewType === 'todo' ? 'assignments' : (viewType === 'materials' ? 'materials' : 'announcements');
            listHtml = `
                <div class="classroom-empty">
                    <i class="fas fa-${emptyIcon}"></i>
                    <p>No ${emptyText} found.</p>
                </div>
            `;
        } else if (viewType === 'todo') {
            listHtml = `
                <div class="classroom-list-container">
                    ${this.renderTodoList(items, (item) => this.renderUnifiedListItem(item, 'todo'))}
                </div>
            `;
        } else {
            listHtml = `
                <div class="classroom-list-container">
                    ${items.map(item => this.renderUnifiedListItem(item, viewType)).join('')}
                </div>
            `;
        }

        const scopeNoticeHtml = (this.hasScopePermissionIssue && viewType === 'todo') ? `
            <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 8px; padding: 10px 14px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #fca5a5;">
                    <i class="fa-solid fa-circle-exclamation" style="color: #ef4444; font-size: 1rem;"></i>
                    <span>Permission needed to display "Turned in" & "Graded" status badges.</span>
                </div>
                <button onclick="Classroom.login()" class="btn btn-sm btn-primary" style="padding: 4px 10px; font-size: 0.75rem; white-space: nowrap;">
                    <i class="fas fa-sync-alt"></i> Reconnect
                </button>
            </div>
        ` : '';

        const fullHtml = headerHtml + `<div style="flex: 1; overflow-y: auto;">${scopeNoticeHtml}${listHtml}</div>`;

        const containers = this.getContainers();
        containers.forEach(container => {
            if (container) container.innerHTML = fullHtml;
        });
    },

    handleItemClick(event, link) {
        if (event.target.closest('a, button, input, textarea')) return;
        if (link && link !== '#') {
            window.open(link, '_blank');
        }
    },

    renderItemAttachments(materials) {
        if (!materials || !Array.isArray(materials) || materials.length === 0) return '';

        const attachmentItems = materials.map(mat => {
            let title = 'Attachment';
            let url = '#';
            let icon = 'fa-paperclip';

            if (mat.driveFile && mat.driveFile.driveFile) {
                title = mat.driveFile.driveFile.title || 'Google Drive File';
                url = mat.driveFile.driveFile.alternateLink || '#';
                icon = 'fa-file';
            } else if (mat.youtubeVideo) {
                title = mat.youtubeVideo.title || 'YouTube Video';
                url = mat.youtubeVideo.alternateLink || `https://www.youtube.com/watch?v=${mat.youtubeVideo.id}`;
                icon = 'fa-video';
            } else if (mat.link) {
                title = mat.link.title || mat.link.url || 'Web Link';
                url = mat.link.url || '#';
                icon = 'fa-link';
            } else if (mat.form) {
                title = mat.form.title || 'Google Form';
                url = mat.form.formUrl || '#';
                icon = 'fa-file-signature';
            }

            return `
                <a href="${url}" target="_blank" rel="noopener noreferrer" class="classroom-attachment-link" onclick="event.stopPropagation();">
                    <i class="fas ${icon}"></i>
                    <span>${title}</span>
                </a>
            `;
        }).join('');

        return `
            <div class="item-attachments" style="margin-top: 10px; display: flex; flex-direction: column; gap: 6px;">
                <hr style="border: none; border-top: 1px dashed var(--classroom-border); margin: 6px 0 4px 0;">
                <div style="font-weight: 500; font-size: 0.8rem; color: var(--classroom-text-secondary);">Attachments:</div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${attachmentItems}
                </div>
            </div>
        `;
    },

    async copyItemText(event, btn) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const item = btn.closest('.classroom-item');
        if (!item) return;

        const textToCopy = item.getAttribute('data-copy-text') || '';
        if (!textToCopy) return;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(textToCopy);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = textToCopy;
                textArea.style.position = 'fixed';
                textArea.style.left = '-9999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }

            const icon = btn.querySelector('i');
            if (icon) {
                const originalClass = icon.className;
                icon.className = 'fas fa-check';
                btn.style.color = 'var(--classroom-green, #0f9d58)';
                setTimeout(() => {
                    icon.className = originalClass;
                    btn.style.color = '';
                }, 1800);
            }
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    },

    toggleItemExpand(event, btn) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const item = btn.closest('.classroom-item');
        if (!item) return;

        const isCurrentlyExpanded = item.classList.contains('expanded');

        // Auto-contract all other expanded items in the container
        const container = item.closest('.classroom-list-container') || item.parentElement;
        if (container) {
            const otherExpandedItems = container.querySelectorAll('.classroom-item.expanded');
            otherExpandedItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('expanded');
                    const otherTruncated = otherItem.querySelector('.snippet-truncated');
                    const otherFull = otherItem.querySelector('.snippet-full');
                    const otherBtn = otherItem.querySelector('.classroom-item-expand-btn');
                    if (otherTruncated && otherFull) {
                        otherTruncated.style.display = 'inline';
                        otherFull.style.display = 'none';
                    }
                    if (otherBtn) {
                        const icon = otherBtn.querySelector('i');
                        if (icon) icon.className = 'fas fa-chevron-down';
                        otherBtn.title = 'Show details';
                    }
                }
            });
        }

        // Toggle target item
        const isExpanded = item.classList.toggle('expanded', !isCurrentlyExpanded);
        const truncated = item.querySelector('.snippet-truncated');
        const full = item.querySelector('.snippet-full');
        const icon = btn.querySelector('i');

        if (truncated && full) {
            if (isExpanded) {
                truncated.style.display = 'none';
                full.style.display = 'inline';
            } else {
                truncated.style.display = 'inline';
                full.style.display = 'none';
            }
        }

        if (icon) {
            icon.className = isExpanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
        }
        btn.title = isExpanded ? 'Collapse details' : 'Show details';
    },

    getAssignmentStatusInfo(item) {
        let statusCode = item.statusCode;
        let statusLabel = item.status;
        const subState = item.submissionState;
        
        let isPastDue = false;
        if (item.dueDate) {
            const due = new Date(item.dueDate.year, item.dueDate.month - 1, item.dueDate.day, item.dueTime?.hours || 23, item.dueTime?.minutes || 59);
            if (due < new Date()) {
                isPastDue = true;
            }
        }

        if (!statusCode) {
            if (subState === 'RETURNED' || item.status === 'Returned' || (item.status && item.status.startsWith('Graded'))) {
                if (typeof item.assignedGrade === 'number') {
                    statusCode = 'graded';
                    statusLabel = `Graded: ${item.assignedGrade}${item.maxPoints ? `/${item.maxPoints}` : ''}`;
                } else {
                    statusCode = 'returned';
                    statusLabel = 'Returned';
                }
            } else if (subState === 'TURNED_IN' || item.status === 'Turned in' || item.status === 'Turned in (Late)') {
                statusCode = 'turned_in';
                statusLabel = item.isLate ? 'Turned in (Late)' : 'Turned in';
            } else if (isPastDue) {
                statusCode = 'missing';
                statusLabel = 'Missing';
            } else {
                statusCode = 'assigned';
                statusLabel = 'Assigned';
            }
        }

        let statusClass = 'status-assigned';
        let statusIcon = 'fa-clock';

        switch (statusCode) {
            case 'missing':
                statusClass = 'status-missing';
                statusIcon = 'fa-circle-exclamation';
                break;
            case 'turned_in':
                statusClass = 'status-turned-in';
                statusIcon = 'fa-circle-check';
                break;
            case 'returned':
            case 'graded':
                statusClass = 'status-returned';
                statusIcon = 'fa-award';
                break;
            case 'assigned':
            default:
                statusClass = 'status-assigned';
                statusIcon = 'fa-clock';
                break;
        }

        return {
            label: statusLabel || 'Assigned',
            className: statusClass,
            icon: statusIcon
        };
    },

    renderUnifiedListItem(item, type) {
        let title, date, link, icon, snippet, fullText, courseName;

        courseName = item.courseName || 'Unknown Course';

        if (type === 'todo') {
            title = item.title;
            // Format due date if exists
            if (item.dueDate) {
                const due = new Date(item.dueDate.year, item.dueDate.month - 1, item.dueDate.day, item.dueTime?.hours || 23, item.dueTime?.minutes || 59);
                date = `Due: ${Utils.formatDateShort(due)}`;
            } else {
                date = 'No due date';
            }
            link = item.alternateLink;
            icon = 'clipboard-list';
            fullText = item.description || '';
            snippet = fullText ? Utils.truncate(fullText, 60) : '';
        } else if (type === 'materials') {
            title = item.title || 'Posted Material';
            date = item.updateTime ? Utils.formatDateShort(new Date(item.updateTime)) : (item.creationTime ? Utils.formatDateShort(new Date(item.creationTime)) : '');
            link = item.alternateLink;
            icon = 'folder-open';
            fullText = item.description || '';
            snippet = fullText ? Utils.truncate(fullText, 80) : 'No description';
        } else {
            // Notice (Announcements): remove redundant "Announcement" title heading
            title = '';
            date = Utils.formatDateShort(new Date(item.updateTime));
            link = item.alternateLink;
            icon = 'bullhorn';
            fullText = item.text || '';
            snippet = fullText ? Utils.truncate(fullText, 80) : 'No content';
        }

        const iconClass = type === 'todo' ? 'assignment' : (type === 'materials' ? 'material' : 'announcement');
        const rawText = (fullText || '').trim();
        const hasMaterials = Boolean(item.materials && item.materials.length > 0);
        const hasMoreText = Boolean((rawText && (rawText.length > snippet.length || rawText.includes('\n'))) || hasMaterials);
        const formattedFullText = rawText ? Utils.escapeAndLinkify(rawText) : '';
        const attachmentsHtml = hasMaterials ? this.renderItemAttachments(item.materials) : '';

        const copyText = title ? (rawText ? `${title}\n\n${rawText}` : title) : rawText;
        const escapedCopyText = copyText.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        let statusBadgeHtml = '';
        if (type === 'todo') {
            const statusInfo = this.getAssignmentStatusInfo(item);
            statusBadgeHtml = `
                <div class="classroom-status-badge ${statusInfo.className}">
                    <i class="fa-solid ${statusInfo.icon}"></i>
                    <span>${statusInfo.label}</span>
                </div>
            `;
        }

        return `
            <div class="classroom-item ${type === 'todo' ? 'has-status' : ''}" onclick="Classroom.handleItemClick(event, '${link}')" data-copy-text="${escapedCopyText}">
                <div class="item-icon ${iconClass}">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="item-content">
                    <div class="item-course-badge">${courseName}</div>
                    ${title ? `<h4 class="item-title">${title}</h4>` : ''}
                    <div class="item-meta">
                        <span class="item-date">${date}</span>
                    </div>
                    ${(snippet || hasMaterials) ? `
                        <div class="item-snippet">
                            <span class="snippet-truncated">${snippet}</span>
                            ${hasMoreText ? `
                                <span class="snippet-full" style="display: none; white-space: pre-wrap; word-break: break-word;">${formattedFullText}${attachmentsHtml}</span>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
                <div class="classroom-item-actions">
                    ${copyText ? `
                        <button class="classroom-item-action-btn classroom-item-copy-btn" onclick="Classroom.copyItemText(event, this)" title="Copy text">
                            <i class="far fa-copy"></i>
                        </button>
                    ` : ''}
                    ${hasMoreText ? `
                        <button class="classroom-item-action-btn classroom-item-expand-btn" onclick="Classroom.toggleItemExpand(event, this)" title="Show details">
                            <i class="fas fa-chevron-down"></i>
                        </button>
                    ` : ''}
                </div>
                ${statusBadgeHtml}
            </div>
        `;
    },

    async openCourse(courseId) {
        this.currentCourseId = courseId;
        this.currentView = 'todo'; // Default view

        if (this.hasExpiredSession || !this.accessToken) {
            await this.showCachedDataWithBanner();
            return;
        }

        await this.renderCurrentView();
    },

    async switchView(view) {
        this.currentView = view;

        if (this.hasExpiredSession || !this.accessToken) {
            await this.showCachedDataWithBanner();
            return;
        }

        await this.renderCurrentView();
    },

    renderCourseDetails(courseId, items, viewType) {
        const course = this.courses.find(c => c.id === courseId);

        // Header with Back button and Toggle
        const headerHtml = `
            <div class="classroom-view-header" style="flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; align-items: center; flex: 1; justify-content: space-between;">
                    <div class="classroom-view-header-title">
                        <button class="classroom-back-btn" onclick="Classroom.renderCourseList()">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <span class="classroom-course-title-text">
                            ${course ? course.name : 'Course Details'}
                        </span>
                        <button class="classroom-back-btn" onclick="Classroom.refreshData()" title="Refresh" style="margin-left: 4px;">
                            <i class="fas fa-redo-alt"></i>
                        </button>
                    </div>
                    ${(viewType === 'todo' && typeof App !== 'undefined' && (App.isAdmin || App.isCR)) ? `
                    <button id="sync-classroom-tasks-btn-course" class="btn btn-sm btn-primary" onclick="Classroom.syncAssignmentsToTasks()" title="Sync Assignments to Tasks">
                        <i class="fas fa-sync-alt"></i> Sync
                    </button>
                    ` : ''}
                </div>
                <div class="classroom-view-toggle">
                    <button class="view-toggle-btn ${viewType === 'todo' ? 'active' : ''}" onclick="Classroom.switchView('todo')">
                        To-Do
                    </button>
                    <button class="view-toggle-btn ${viewType === 'notifications' ? 'active' : ''}" onclick="Classroom.switchView('notifications')">
                        Notices
                    </button>
                    <button class="view-toggle-btn ${viewType === 'materials' ? 'active' : ''}" onclick="Classroom.switchView('materials')">
                        Materials
                    </button>
                </div>
            </div>
        `;

        let listHtml = '';
        if (items.length === 0) {
            const emptyIcon = viewType === 'todo' ? 'clipboard-check' : (viewType === 'materials' ? 'folder-open' : 'bullhorn');
            const emptyText = viewType === 'todo' ? 'assignments' : (viewType === 'materials' ? 'materials' : 'announcements');
            listHtml = `
                <div class="classroom-empty">
                    <i class="fas fa-${emptyIcon}"></i>
                    <p>No ${emptyText} found.</p>
                </div>
            `;
        } else if (viewType === 'todo') {
            listHtml = `
                <div class="classroom-list-container">
                    ${this.renderTodoList(items, (item) => this.renderListItem(item, 'todo', course ? course.alternateLink : '#'))}
                </div>
            `;
        } else {
            listHtml = `
                <div class="classroom-list-container">
                    ${items.map(item => this.renderListItem(item, viewType, course ? course.alternateLink : '#')).join('')}
                </div>
            `;
        }

        const scopeNoticeHtml = (this.hasScopePermissionIssue && viewType === 'todo') ? `
            <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 8px; padding: 10px 14px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #fca5a5;">
                    <i class="fa-solid fa-circle-exclamation" style="color: #ef4444; font-size: 1rem;"></i>
                    <span>Permission needed to display "Turned in" & "Graded" status badges.</span>
                </div>
                <button onclick="Classroom.login()" class="btn btn-sm btn-primary" style="padding: 4px 10px; font-size: 0.75rem; white-space: nowrap;">
                    <i class="fas fa-sync-alt"></i> Reconnect
                </button>
            </div>
        ` : '';

        const fullHtml = headerHtml + `<div style="flex: 1; overflow-y: auto;">${scopeNoticeHtml}${listHtml}</div>`;

        const containers = this.getContainers();
        containers.forEach(container => {
            if (container) container.innerHTML = fullHtml;
        });
    },

    renderListItem(item, type, courseLink) {
        let title, date, link, icon, snippet, fullText;

        if (type === 'todo') {
            title = item.title;
            // Format due date if exists
            if (item.dueDate) {
                const due = new Date(item.dueDate.year, item.dueDate.month - 1, item.dueDate.day, item.dueTime?.hours || 23, item.dueTime?.minutes || 59);
                date = `Due: ${Utils.formatDateShort(due)}`;
            } else {
                date = 'No due date';
            }
            link = item.alternateLink;
            icon = 'clipboard-list';
            fullText = item.description || '';
            snippet = fullText ? Utils.truncate(fullText, 60) : '';
        } else if (type === 'materials') {
            title = item.title || 'Posted Material';
            date = item.updateTime ? Utils.formatDateShort(new Date(item.updateTime)) : (item.creationTime ? Utils.formatDateShort(new Date(item.creationTime)) : '');
            link = item.alternateLink;
            icon = 'folder-open';
            fullText = item.description || '';
            snippet = fullText ? Utils.truncate(fullText, 80) : 'No description';
        } else {
            // Notice (Announcements): remove redundant "Announcement" title heading
            title = '';
            date = Utils.formatDateShort(new Date(item.updateTime));
            link = item.alternateLink;
            icon = 'bullhorn';
            fullText = item.text || '';
            snippet = fullText ? Utils.truncate(fullText, 80) : 'No content';
        }

        const iconClass = type === 'todo' ? 'assignment' : (type === 'materials' ? 'material' : 'announcement');
        const rawText = (fullText || '').trim();
        const hasMaterials = Boolean(item.materials && item.materials.length > 0);
        const hasMoreText = Boolean((rawText && (rawText.length > snippet.length || rawText.includes('\n'))) || hasMaterials);
        const formattedFullText = rawText ? Utils.escapeAndLinkify(rawText) : '';
        const attachmentsHtml = hasMaterials ? this.renderItemAttachments(item.materials) : '';

        const copyText = title ? (rawText ? `${title}\n\n${rawText}` : title) : rawText;
        const escapedCopyText = copyText.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        let statusBadgeHtml = '';
        if (type === 'todo') {
            const statusInfo = this.getAssignmentStatusInfo(item);
            statusBadgeHtml = `
                <div class="classroom-status-badge ${statusInfo.className}">
                    <i class="fa-solid ${statusInfo.icon}"></i>
                    <span>${statusInfo.label}</span>
                </div>
            `;
        }

        return `
            <div class="classroom-item ${type === 'todo' ? 'has-status' : ''}" onclick="Classroom.handleItemClick(event, '${link}')" data-copy-text="${escapedCopyText}">
                <div class="item-icon ${iconClass}">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="item-content">
                    ${title ? `<h4 class="item-title">${title}</h4>` : ''}
                    <div class="item-meta">
                        <span class="item-date">${date}</span>
                    </div>
                    ${(snippet || hasMaterials) ? `
                        <div class="item-snippet">
                            <span class="snippet-truncated">${snippet}</span>
                            ${hasMoreText ? `
                                <span class="snippet-full" style="display: none; white-space: pre-wrap; word-break: break-word;">${formattedFullText}${attachmentsHtml}</span>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
                <div class="classroom-item-actions">
                    ${copyText ? `
                        <button class="classroom-item-action-btn classroom-item-copy-btn" onclick="Classroom.copyItemText(event, this)" title="Copy text">
                            <i class="far fa-copy"></i>
                        </button>
                    ` : ''}
                    ${hasMoreText ? `
                        <button class="classroom-item-action-btn classroom-item-expand-btn" onclick="Classroom.toggleItemExpand(event, this)" title="Show details">
                            <i class="fas fa-chevron-down"></i>
                        </button>
                    ` : ''}
                </div>
                ${statusBadgeHtml}
            </div>
        `;
    }
};
