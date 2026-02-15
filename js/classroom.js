// ============================================
// GOOGLE CLASSROOM MODULE
// ============================================

const Classroom = {
    // Configuration
    CLIENT_ID: '142195418679-0ripc2dn76otvkvfnk6kdk2aitdd29rm.apps.googleusercontent.com',
    SCOPES: 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly https://www.googleapis.com/auth/classroom.announcements.readonly',

    // State
    tokenClient: null,
    accessToken: null,
    isInitialized: false,
    courses: [],
    currentCourseId: null,
    currentView: 'todo', // 'todo' or 'notifications'

    // Cache
    cache: {},

    init() {
        console.log('Initializing Google Classroom module...');

        // Wait for Google Identity Services script to load
        if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
            console.warn('Google Identity Services not loaded yet. Retrying in 500ms...');
            setTimeout(() => this.init(), 500);
            return;
        }

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

        this.setupEventListeners();
        this.isInitialized = true;
        this.renderInitialState();
    },

    setupEventListeners() {
        // Toggle Buttons (Desktop & Mobile)
        // Toggle Buttons (Desktop & Mobile)
        const toggleBtn = document.getElementById('classroom-toggle');
        const navBtn = document.getElementById('classroom-nav-btn');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.openClassroomParams();
            });
        }

        if (navBtn) {
            navBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openClassroomParams();
            });
        }

        // Close Buttons
        const closeMobile = document.getElementById('close-classroom-sidebar');
        const closeDesktop = document.getElementById('close-classroom-modal');
        const overlay = document.getElementById('classroom-overlay');

        if (closeMobile) closeMobile.addEventListener('click', () => this.toggleSidebar(false));
        if (closeDesktop) closeDesktop.addEventListener('click', () => this.toggleModal(false));
        if (overlay) overlay.addEventListener('click', () => this.toggleSidebar(false));
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
            // Check if we have courses loaded, if not load them
            if (this.courses.length === 0) {
                this.fetchCourses();
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
        // Auth successful, fetch courses
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
                this.renderLoginState();
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

    openCourse(courseId) {
        this.currentCourseId = courseId;
        this.currentView = 'todo'; // Default view
        this.fetchCourseWork(courseId);
    },

    switchView(view) {
        this.currentView = view;
        if (view === 'todo') {
            this.fetchCourseWork(this.currentCourseId);
        } else {
            this.fetchAnnouncements(this.currentCourseId);
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
