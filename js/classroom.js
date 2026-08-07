// ============================================
// GOOGLE CLASSROOM MODULE
// ============================================

const Classroom = {
    // Configuration
    CLIENT_ID: '142195418679-0ripc2dn76otvkvfnk6kdk2aitdd29rm.apps.googleusercontent.com',
    SCOPES: 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly https://www.googleapis.com/auth/classroom.announcements.readonly https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly',

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

    // Cache
    cache: {},
    inMemoryCache: {
        assignments: null,
        announcements: null,
        materials: null
    },
    cacheManager: null,
    JSON_CACHE_KEY: 'classroom_cached_json',

    updateLogoutButtonVisibility() {
        const isConnected = localStorage.getItem('classroom_connected') === 'true';
        const isLoggedIn = Boolean(this.accessToken || isConnected);
        const sidebarLogout = document.getElementById('logout-classroom-sidebar');
        const modalLogout = document.getElementById('logout-classroom-modal');
        if (sidebarLogout) sidebarLogout.style.display = isLoggedIn ? 'inline-flex' : 'none';
        if (modalLogout) modalLogout.style.display = isLoggedIn ? 'inline-flex' : 'none';
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

                if (freshTime && existingTime && freshTime === existingTime) {
                    skippedCount++;
                    return existing; // Skip updating, retain existing loaded object
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
        if (this.inMemoryCache && this.inMemoryCache[type] && this.inMemoryCache[type].length > 0) {
            return this.inMemoryCache[type];
        }

        this.initCacheManager();
        if (this.cacheManager) {
            const cached = await this.cacheManager.getCachedClassroomData(type);
            if (cached && cached.data && cached.data.length > 0) {
                if (!this.inMemoryCache) this.inMemoryCache = {};
                this.inMemoryCache[type] = cached.data;
                return cached.data;
            }
        }

        const jsonCache = this.getJsonCache();
        if (jsonCache && jsonCache[type]) {
            if (!this.inMemoryCache) this.inMemoryCache = {};
            this.inMemoryCache[type] = jsonCache[type];
            return jsonCache[type];
        }

        return [];
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

            // Store resolve context to be called when auth succeeds or fails
            this._authResolve = resolve;

            // Set a timeout to prevent blocking the app load if GIS is slow (5s)
            this._sessionCheckTimeout = setTimeout(() => {
                console.log('Classroom session check timed out');
                this._cleanupAuthPromise(false);
            }, 5000);

            if (token && expiryStr) {
                const expiryTime = parseInt(expiryStr);
                // Check if token is valid (with 5 min buffer)
                if (Date.now() < expiryTime - (5 * 60 * 1000)) {
                    console.log('Restoring valid Classroom session from storage...');
                    this.accessToken = token;

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

    _handleAuthError(error) {
        console.log('Auth error:', error);
        const errObj = error || {};
        const errType = typeof errObj === 'string' ? errObj : (errObj.error || errObj.error_subtype || '');

        // If error is silent refresh requiring interaction, preserve connection and use cached session mode
        if (errType === 'interaction_required' || errType === 'access_denied' || errType === 'user_closed_popup') {
            console.log('[Classroom] Silent refresh requires interaction, keeping user connected with cached data');
            this.hasExpiredSession = true;
            this.showCachedDataWithBanner();
            this._cleanupAuthPromise(false);
            return;
        }

        // Hard failure or explicit rejection - clean up session state
        localStorage.removeItem('classroom_connected');
        localStorage.removeItem('classroom_token');
        localStorage.removeItem('classroom_token_expiry');
        this.accessToken = null;
        this.renderLoginState();
        this._cleanupAuthPromise(false);
    },

    setupEventListeners() {
        console.log('Setting up Classroom event listeners...');

        // Mobile Toggle Button
        const toggleBtn = document.getElementById('classroom-toggle');
        if (toggleBtn) {
            console.log('Attaching click listener to mobile toggle button');
            toggleBtn.addEventListener('click', () => {
                console.log('Mobile toggle clicked');
                this.openClassroomParams();
            });
        } else {
            console.warn('Mobile toggle button (classroom-toggle) not found in DOM');
        }

        // Desktop Navigation Button
        const navBtn = document.getElementById('classroom-nav-btn');
        if (navBtn) {
            console.log('Attaching click listener to desktop nav button');
            navBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Desktop nav button clicked');
                this.openClassroomParams();
            });
        } else {
            console.warn('Desktop nav button (classroom-nav-btn) not found in DOM');
        }

        // Close Buttons
        const closeMobile = document.getElementById('close-classroom-sidebar');
        const closeDesktop = document.getElementById('close-classroom-modal');
        const overlay = document.getElementById('classroom-overlay');

        if (closeMobile) {
            closeMobile.addEventListener('click', () => this.toggleSidebar(false));
            console.log('Attached listener to close-classroom-sidebar');
        } else {
            console.warn('close-classroom-sidebar not found in DOM');
        }

        if (closeDesktop) {
            closeDesktop.addEventListener('click', () => this.toggleModal(false));
            console.log('Attached listener to close-classroom-modal');
        } else {
            console.warn('close-classroom-modal not found in DOM');
        }

        if (overlay) {
            overlay.addEventListener('click', () => this.toggleSidebar(false));
            console.log('Attached listener to classroom-overlay');
        } else {
            console.warn('classroom-overlay not found in DOM');
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
                this.loadAllAssignments();
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
            const allAssignments = [];
            const cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - this.DATE_FILTER_MONTHS);

            for (const course of this.courses) {
                if (course.courseState !== 'ACTIVE') continue;

                try {
                    const response = await fetch(`https://classroom.googleapis.com/v1/courses/${course.id}/courseWork?orderBy=dueDate desc`, {
                        headers: { 'Authorization': `Bearer ${this.accessToken}` }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const courseWork = data.courseWork || [];

                        courseWork.forEach(work => {
                            if (work.dueDate) {
                                const dueDate = new Date(work.dueDate.year, work.dueDate.month - 1, work.dueDate.day);
                                if (dueDate < cutoffDate) return;
                            } else if (work.creationTime) {
                                const creationDate = new Date(work.creationTime);
                                if (creationDate < cutoffDate) return;
                            }

                            work.courseName = course.name;
                            work.courseId = course.id;
                            work.courseState = course.courseState;
                            allAssignments.push(work);
                        });
                    }
                } catch (err) {
                    console.warn(`Failed to load assignments for course ${course.name}:`, err);
                }
            }

            allAssignments.sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                const dateA = new Date(a.dueDate.year, a.dueDate.month - 1, a.dueDate.day);
                const dateB = new Date(b.dueDate.year, b.dueDate.month - 1, b.dueDate.day);
                return dateA - dateB;
            });

            // Incremental sync & merge
            const mergedAssignments = this.mergeAndSkipUnchanged('assignments', allAssignments);

            if (this.cacheManager) {
                await this.cacheManager.cacheClassroomData('assignments', mergedAssignments);
            }
            this.saveJsonCache('assignments', mergedAssignments);
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

    async syncAssignmentsToTasks() {
        if (typeof App === 'undefined' || (!App.isAdmin && !App.isCR)) return;

        const syncBtn = document.getElementById('sync-classroom-tasks-btn');
        if (syncBtn) {
            syncBtn.disabled = true;
            syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
        }

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
                alert('No assignments found to sync.');
                return;
            }

            // Get only assignments (with a valid dueDate)
            const syncableAssignments = assignments.filter(a => a.dueDate);

            if (syncableAssignments.length === 0) {
                alert('No assignments with due dates found to sync.');
                return;
            }

            const classroomWorkIds = syncableAssignments.map(a => a.id);
            const existingTasksResult = await DB.getTasksByClassroomIds(classroomWorkIds);
            const existingIds = new Set();

            if (existingTasksResult.success && existingTasksResult.data) {
                existingTasksResult.data.forEach(task => {
                    if (task.classroomWorkId) {
                        existingIds.add(task.classroomWorkId);
                    }
                });
            }

            const userId = Auth.getUserId();
            const userEmail = Auth.getUserEmail();
            let addedCount = 0;

            for (const assignment of syncableAssignments) {
                if (existingIds.has(assignment.id)) continue;

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

                const result = await DB.createTask(userId, userEmail, taskData);
                if (result.success) {
                    addedCount++;
                }
            }

            alert(`Successfully synced ${addedCount} new assignment(s) to Tasks!`);

            // Refresh dashboard tasks
            if (App && typeof App.loadDashboardData === 'function') {
                await App.loadDashboardData();
            }

        } catch (error) {
            console.error('Error syncing assignments:', error);
            alert('An error occurred while syncing assignments.');
        } finally {
            if (syncBtn) {
                syncBtn.disabled = false;
                syncBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Sync';
            }
        }
    },

    async refreshData() {
        if (!this.accessToken) {
            console.log('[Classroom] Cannot refresh without access token, showing login');
            this.renderLoginState();
            return;
        }

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
        } else {
            listHtml = `
                <div class="classroom-list-container">
                    ${items.map(item => this.renderUnifiedListItem(item, viewType)).join('')}
                </div>
            `;
        }

        const fullHtml = headerHtml + `<div style="flex: 1; overflow-y: auto;">${listHtml}</div>`;

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

        return `
            <div class="classroom-item" onclick="Classroom.handleItemClick(event, '${link}')" data-copy-text="${escapedCopyText}">
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
            <div class="classroom-view-header">
                <div class="classroom-view-header-title">
                    <button class="classroom-back-btn" onclick="Classroom.renderCourseList()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <span class="classroom-course-title-text">
                        ${course ? course.name : 'Course Details'}
                    </span>
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
        } else {
            listHtml = `
                <div class="classroom-list-container">
                    ${items.map(item => this.renderListItem(item, viewType, course.alternateLink)).join('')}
                </div>
            `;
        }

        const fullHtml = headerHtml + `<div style="flex: 1; overflow-y: auto;">${listHtml}</div>`;

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

        return `
            <div class="classroom-item" onclick="Classroom.handleItemClick(event, '${link}')" data-copy-text="${escapedCopyText}">
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
            </div>
        `;
    }
};
