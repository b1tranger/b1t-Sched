// ============================================
// GOOGLE CLASSROOM MODULE
// ============================================

const Classroom = {
    // Configuration
    CLIENT_ID: '142195418679-0ripc2dn76otvkvfnk6kdk2aitdd29rm.apps.googleusercontent.com',
    SCOPES: 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly https://www.googleapis.com/auth/classroom.announcements.readonly',

    // Date filter configuration (in months)
    DATE_FILTER_MONTHS: 6, // Only show items from the last 6 months

    // State
    tokenClient: null,
    accessToken: null,
    isInitialized: false,
    courses: [],
    currentCourseId: null,
    currentView: 'todo', // 'todo' or 'notifications'

    // Cache
    cache: {},
    cacheManager: null,

    // Initialize cache manager
    initCacheManager() {
        if (!this.cacheManager && typeof CacheManager !== 'undefined') {
            this.cacheManager = new CacheManager();
            console.log('[Classroom] Cache manager initialized');
        }
    },

    init() {
        console.log('Initializing Google Classroom module...');

        // Wait for Google Identity Services script to load
        if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
            console.warn('Google Identity Services not loaded yet. Retrying in 500ms...');

            // Retry up to 10 times
            if (!this.initRetryCount) this.initRetryCount = 0;
            this.initRetryCount++;

            if (this.initRetryCount <= 10) {
                console.log(`Retry attempt ${this.initRetryCount}/10`);
                setTimeout(() => this.init(), 500);
                return;
            } else {
                console.error('Failed to load Google Identity Services after 10 retries');
                this.renderError('Google Classroom is currently unavailable. Please check your internet connection and refresh the page.');
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
                    this.renderError('Failed to authenticate with Google.');
                    return;
                }
                this.accessToken = tokenResponse.access_token;
                console.log('Access token received');
                this.handleAuthSuccess();
            },
        });

        console.log('Token client initialized successfully');

        this.setupEventListeners();
        this.isInitialized = true;
        this.renderInitialState();

        // Check for persisted connection
        const isConnected = localStorage.getItem('classroom_connected') === 'true';
        if (isConnected) {
            console.log('Restoring Classroom session...');
            // Wait a moment for token client to be ready
            setTimeout(() => {
                if (this.tokenClient) {
                    // silent prompt to restore session if possible
                    this.tokenClient.requestAccessToken({ prompt: '' });
                }
            }, 1000);
        }

        console.log('Google Classroom module initialized successfully');
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
        if (window.innerWidth <= 768) {
            this.toggleSidebar(true);
        } else {
            this.toggleModal(true);
        }

        // If not authenticated, show login button
        if (!this.accessToken) {
            this.renderLoginState();
        } else {
            // Load all assignments from all courses
            if (this.courses.length === 0) {
                this.fetchCoursesAndLoadAll();
            } else {
                // Already have courses, load all assignments
                this.loadAllAssignments();
            }
        }
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

    handleAuthSuccess() {
        // Auth successful, save state
        localStorage.setItem('classroom_connected', 'true');
        // Fetch courses
        this.fetchCourses();
    },

    logout() {
        if (this.accessToken) {
            const token = this.accessToken;
            google.accounts.oauth2.revoke(token, () => {
                console.log('Access token revoked');
                this.accessToken = null;
                this.courses = [];
                this.currentCourseId = null;

                // Clear cached classroom data
                this.initCacheManager();
                if (this.cacheManager) {
                    this.cacheManager.clearUserCaches();
                }

                this.renderLoginState();
                localStorage.removeItem('classroom_connected');
            });
        }
    },

    // =========================================
    // API CALLS
    // =========================================

    async fetchCourses() {
        this.renderLoading('Loading courses...');

        try {
            const response = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
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
        this.renderLoading('Loading courses...');

        try {
            const response = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch courses');

            const data = await response.json();
            this.courses = data.courses || [];

            // After loading courses, load all assignments
            await this.loadAllAssignments();

        } catch (error) {
            console.error(error);
            this.renderError('Failed to load courses. Please try logging in again.');
            this.accessToken = null; // Reset token on failure
        }
    },

    async loadAllAssignments() {
        this.currentView = 'todo';

        // Initialize cache manager
        this.initCacheManager();

        // Check for cached data first
        if (this.cacheManager) {
            const cachedData = await this.cacheManager.getCachedClassroomData('assignments');
            if (cachedData && cachedData.fresh) {
                console.log('[Classroom] Using cached assignments data');
                this.renderAllItems(cachedData.data, 'todo');
                return;
            }
        }

        this.renderLoading('Loading assignments from all courses...');

        try {
            const allAssignments = [];

            // Set cutoff date based on configuration
            const cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - this.DATE_FILTER_MONTHS);
            console.log(`Filtering assignments from the last ${this.DATE_FILTER_MONTHS} months (since ${cutoffDate.toLocaleDateString()})`);

            // Fetch assignments from all ACTIVE courses only
            for (const course of this.courses) {
                // Skip if course is not ACTIVE
                if (course.courseState !== 'ACTIVE') {
                    console.log(`Skipping non-active course: ${course.name} (${course.courseState})`);
                    continue;
                }

                try {
                    const response = await fetch(`https://classroom.googleapis.com/v1/courses/${course.id}/courseWork?orderBy=dueDate desc`, {
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const courseWork = data.courseWork || [];

                        // Filter by date and add course info to each assignment
                        courseWork.forEach(work => {
                            // Check if assignment has a due date
                            if (work.dueDate) {
                                const dueDate = new Date(work.dueDate.year, work.dueDate.month - 1, work.dueDate.day);
                                // Skip assignments older than cutoff date
                                if (dueDate < cutoffDate) {
                                    return;
                                }
                            } else if (work.creationTime) {
                                // If no due date, check creation time
                                const creationDate = new Date(work.creationTime);
                                if (creationDate < cutoffDate) {
                                    return;
                                }
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

            // Sort by due date (most recent first)
            allAssignments.sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                const dateA = new Date(a.dueDate.year, a.dueDate.month - 1, a.dueDate.day);
                const dateB = new Date(b.dueDate.year, b.dueDate.month - 1, b.dueDate.day);
                return dateA - dateB;
            });

            console.log(`Loaded ${allAssignments.length} assignments from ${this.courses.filter(c => c.courseState === 'ACTIVE').length} active courses`);

            // Cache the data
            if (this.cacheManager) {
                await this.cacheManager.cacheClassroomData('assignments', allAssignments);
            }

            this.renderAllItems(allAssignments, 'todo');

        } catch (error) {
            console.error(error);
            this.renderError('Failed to load assignments.');
        }
    },

    async loadAllAnnouncements() {
        this.currentView = 'notifications';

        // Initialize cache manager
        this.initCacheManager();

        // Check for cached data first
        if (this.cacheManager) {
            const cachedData = await this.cacheManager.getCachedClassroomData('announcements');
            if (cachedData && cachedData.fresh) {
                console.log('[Classroom] Using cached announcements data');
                this.renderAllItems(cachedData.data, 'notifications');
                return;
            }
        }

        this.renderLoading('Loading announcements from all courses...');

        try {
            const allAnnouncements = [];

            // Set cutoff date based on configuration
            const cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - this.DATE_FILTER_MONTHS);
            console.log(`Filtering announcements from the last ${this.DATE_FILTER_MONTHS} months (since ${cutoffDate.toLocaleDateString()})`);

            // Fetch announcements from all ACTIVE courses only
            for (const course of this.courses) {
                // Skip if course is not ACTIVE
                if (course.courseState !== 'ACTIVE') {
                    console.log(`Skipping non-active course: ${course.name} (${course.courseState})`);
                    continue;
                }

                try {
                    const response = await fetch(`https://classroom.googleapis.com/v1/courses/${course.id}/announcements?orderBy=updateTime desc`, {
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const announcements = data.announcements || [];

                        // Filter by date and add course info to each announcement
                        announcements.forEach(announcement => {
                            // Check update time
                            if (announcement.updateTime) {
                                const updateDate = new Date(announcement.updateTime);
                                // Skip announcements older than cutoff date
                                if (updateDate < cutoffDate) {
                                    return;
                                }
                            } else if (announcement.creationTime) {
                                // Fallback to creation time
                                const creationDate = new Date(announcement.creationTime);
                                if (creationDate < cutoffDate) {
                                    return;
                                }
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

            // Sort by update time (most recent first)
            allAnnouncements.sort((a, b) => {
                return new Date(b.updateTime) - new Date(a.updateTime);
            });

            console.log(`Loaded ${allAnnouncements.length} announcements from ${this.courses.filter(c => c.courseState === 'ACTIVE').length} active courses`);

            // Cache the data
            if (this.cacheManager) {
                await this.cacheManager.cacheClassroomData('announcements', allAnnouncements);
            }

            this.renderAllItems(allAnnouncements, 'notifications');

        } catch (error) {
            console.error(error);
            this.renderError('Failed to load announcements.');
        }
    },

    async fetchCourseWork(courseId) {
        this.renderLoading('Loading assignments...');

        try {
            const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork?orderBy=dueDate desc`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch course work');

            const data = await response.json();
            const courseWork = data.courseWork || [];

            this.renderCourseDetails(courseId, courseWork, 'todo');

        } catch (error) {
            console.error(error);
            this.renderError('Failed to load assignments.');
        }
    },

    async fetchAnnouncements(courseId) {
        this.renderLoading('Loading announcements...');

        try {
            const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/announcements?orderBy=updateTime desc`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch announcements');

            const data = await response.json();
            const announcements = data.announcements || [];

            this.renderCourseDetails(courseId, announcements, 'notifications');

        } catch (error) {
            console.error(error);
            this.renderError('Failed to load announcements.');
        }
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

    renderCourseList() {
        if (this.courses.length === 0) {
            const containers = this.getContainers();
            containers.forEach(container => {
                if (container) {
                    container.innerHTML = `
                        <div class="classroom-empty">
                            <i class="fas fa-chalkboard"></i>
                            <p>No active courses found.</p>
                            <button class="btn btn-text" onclick="Classroom.logout()">Switch Account</button>
                        </div>
                    `;
                }
            });
            return;
        }

        const html = `
            <div class="classroom-view-header">
                <h3>My Classes</h3>
                <button class="btn btn-sm btn-text" onclick="Classroom.logout()">Sign Out</button>
            </div>
            <div class="classroom-courses-container">
                ${this.courses.map(course => `
                    <div class="course-card" onclick="Classroom.openCourse('${course.id}')">
                        <div class="course-header" style="background-color: var(--classroom-green);">
                            <div class="course-title">${course.name}</div>
                            <div class="course-section">${course.section || ''}</div>
                        </div>
                        <div class="course-body">
                            <div class="course-work-preview">
                                ${course.descriptionHeading || 'Tap to view assignments and notices'}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        const containers = this.getContainers();
        containers.forEach(container => {
            if (container) container.innerHTML = html;
        });
    },

    renderAllItems(items, viewType) {
        // Header with Toggle
        const headerHtml = `
            <div class="classroom-view-header">
                <div style="display: flex; align-items: center;">
                    <span style="font-weight: 500; font-size: 1.1rem;">
                        All Courses
                    </span>
                </div>
                <div class="classroom-view-toggle">
                    <button class="view-toggle-btn ${viewType === 'todo' ? 'active' : ''}" onclick="Classroom.switchView('todo')">
                        To-Do
                    </button>
                    <button class="view-toggle-btn ${viewType === 'notifications' ? 'active' : ''}" onclick="Classroom.switchView('notifications')">
                        Notices
                    </button>
                </div>
            </div>
        `;

        let listHtml = '';
        if (items.length === 0) {
            listHtml = `
                <div class="classroom-empty">
                    <i class="fas fa-${viewType === 'todo' ? 'clipboard-check' : 'bullhorn'}"></i>
                    <p>No ${viewType === 'todo' ? 'assignments' : 'announcements'} found.</p>
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

    renderUnifiedListItem(item, type) {
        let title, date, link, icon, snippet, courseName;

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
            snippet = item.description ? Utils.truncate(item.description, 60) : '';
        } else {
            title = 'Announcement';
            date = Utils.formatDateShort(new Date(item.updateTime));
            link = item.alternateLink;
            icon = 'bullhorn';
            snippet = item.text ? Utils.truncate(item.text, 80) : 'No content';
        }

        return `
            <a href="${link}" target="_blank" class="classroom-item">
                <div class="item-icon ${type === 'todo' ? 'assignment' : 'announcement'}">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="item-content">
                    <div class="item-course-badge">${courseName}</div>
                    <h4 class="item-title">${title}</h4>
                    <div class="item-meta">
                        <span class="item-date">${date}</span>
                    </div>
                    ${snippet ? `<div class="item-snippet">${snippet}</div>` : ''}
                </div>
            </a>
        `;
    },

    openCourse(courseId) {
        this.currentCourseId = courseId;
        this.currentView = 'todo'; // Default view
        this.fetchCourseWork(courseId);
    },

    switchView(view) {
        this.currentView = view;
        if (view === 'todo') {
            this.loadAllAssignments();
        } else {
            this.loadAllAnnouncements();
        }
    },

    renderCourseDetails(courseId, items, viewType) {
        const course = this.courses.find(c => c.id === courseId);

        // Header with Back button and Toggle
        const headerHtml = `
            <div class="classroom-view-header">
                <div style="display: flex; align-items: center;">
                    <button class="classroom-back-btn" onclick="Classroom.renderCourseList()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <span style="font-weight: 500; font-size: 1.1rem; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
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
                </div>
            </div>
        `;

        let listHtml = '';
        if (items.length === 0) {
            listHtml = `
                <div class="classroom-empty">
                    <i class="fas fa-${viewType === 'todo' ? 'clipboard-check' : 'bullhorn'}"></i>
                    <p>No ${viewType === 'todo' ? 'assignments' : 'announcements'} found.</p>
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
        let title, date, link, icon, snippet;

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
            snippet = item.description ? Utils.truncate(item.description, 60) : '';
        } else {
            title = 'Announcement'; // Announcements often don't have titles, just text
            date = Utils.formatDateShort(new Date(item.updateTime));
            link = item.alternateLink;
            icon = 'bullhorn';
            snippet = item.text ? Utils.truncate(item.text, 80) : 'No content';
        }

        return `
            <a href="${link}" target="_blank" class="classroom-item">
                <div class="item-icon ${type === 'todo' ? 'assignment' : 'announcement'}">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="item-content">
                    <h4 class="item-title">${title}</h4>
                    <div class="item-meta">
                        <span class="item-date">${date}</span>
                    </div>
                    ${snippet ? `<div class="item-snippet">${snippet}</div>` : ''}
                </div>
            </a>
        `;
    }
};
