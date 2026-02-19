// ============================================
// CR NOTICE MODULE
// ============================================

const CRNoticeViewer = {
    // State
    notices: [],
    listeners: [],
    unsubscribe: null,

    init() {
        console.log('Initializing CR Notice Viewer...');
        this.setupEventListeners();

        // Listen for auth state changes to show/hide Add button
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.checkCROrAdmin();
            } else {
                this.hideCROnlyElements();
            }
        });
    },

    setupEventListeners() {
        // Add Notice Buttons (Desktop & Mobile)
        const addBtnDesktop = document.getElementById('add-cr-notice-btn-desktop');
        const addBtnMobile = document.getElementById('add-cr-notice-btn-mobile');

        if (addBtnDesktop) addBtnDesktop.addEventListener('click', () => this.openAddModal());
        if (addBtnMobile) addBtnMobile.addEventListener('click', () => this.openAddModal());

        // Close Modal
        const closeBtn = document.getElementById('close-add-cr-notice-modal');
        const cancelBtn = document.getElementById('cancel-add-cr-notice');

        if (closeBtn) closeBtn.addEventListener('click', () => UI.hideModal('add-cr-notice-modal'));
        if (cancelBtn) cancelBtn.addEventListener('click', () => UI.hideModal('add-cr-notice-modal'));

        // Form Submit
        const form = document.getElementById('add-cr-notice-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitNotice();
            });
        }
    },

    async checkCROrAdmin() {
        const user = firebase.auth().currentUser;
        if (!user) return;

        try {
            const roles = await DB.getUserRoles(user.uid);

            if (roles.isCR || roles.isAdmin) {
                this.showCROnlyElements();
            } else {
                this.hideCROnlyElements();
            }
        } catch (error) {
            console.error('Error checking roles:', error);
            this.hideCROnlyElements();
        }

        // Start listening for notices regardless of role (everyone in section sees them)
        this.subscribeToNotices();
    },

    showCROnlyElements() {
        document.querySelectorAll('.cr-only-notice').forEach(el => el.style.display = 'inline-flex');
    },

    hideCROnlyElements() {
        document.querySelectorAll('.cr-only-notice').forEach(el => el.style.display = 'none');
    },

    subscribeToNotices() {
        // Unsubscribe previous listener if exists
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }

        const userDept = localStorage.getItem('userDepartment');
        const userSem = localStorage.getItem('userSemester');
        const userSec = localStorage.getItem('userSection');

        if (!userDept || !userSem || !userSec) {
            console.log('User profile incomplete, skipping CR notices');
            this.renderProfileMissing();
            return;
        }

        console.log(`Subscribing to CR notices for ${userDept} ${userSem}-${userSec}`);

        // Query: Department + Semester + Section
        // Note: This requires a composite index in Firestore.
        // If index is missing, it will throw an error with a link to create it.
        this.unsubscribe = db.collection('cr_notices')
            .where('department', '==', userDept)
            .where('semester', '==', userSem)
            .where('section', '==', userSec)
            .orderBy('timestamp', 'desc')
            .limit(20)
            .onSnapshot(snapshot => {
                const notices = [];
                snapshot.forEach(doc => {
                    notices.push({ id: doc.id, ...doc.data() });
                });
                this.notices = notices;
                this.renderAllNotices();
            }, error => {
                console.error("Error fetching CR notices:", error);
                this.renderError(error.message);
            });
    },

    renderProfileMissing() {
        const msg = `
            <div class="notice-empty-state">
                <i class="fas fa-bullhorn" style="font-size: 2em; color: #ccc; margin-bottom: 10px;"></i>
                <p style="color: #666;">No Class Notices yet</p>
            </div>
        `;

        const desktop = document.getElementById('cr-notice-list-desktop');
        const mobile = document.getElementById('cr-notice-list-mobile');

        if (desktop) desktop.innerHTML = msg;
        if (mobile) mobile.innerHTML = msg;
    },

    renderError(msg) {
        // Friendly error for missing index
        if (msg.includes('requires an index')) {
            msg = 'System is optimizing database. Please try again later.';
        }

        const html = `
            <div class="notice-empty-state">
                <i class="fas fa-exclamation-circle" style="color: var(--danger-color, red);"></i>
                <p>Error: ${msg}</p>
            </div>
        `;

        const desktop = document.getElementById('cr-notice-list-desktop');
        const mobile = document.getElementById('cr-notice-list-mobile');
        if (desktop) desktop.innerHTML = html;
        if (mobile) mobile.innerHTML = html;
    },

    renderAllNotices() {
        this.renderDesktopList();
        this.renderMobileList();
    },

    renderDesktopList() {
        const container = document.getElementById('cr-notice-list-desktop');
        if (!container) return;

        if (this.notices.length === 0) {
            container.innerHTML = `
                <div class="notice-empty-state">
                    <i class="fas fa-clipboard"></i>
                    <p>No notices from CR yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.notices.map(notice => this.createNoticeCard(notice)).join('');
        this.addDeleteListeners(container);
    },

    renderMobileList() {
        const container = document.getElementById('cr-notice-list-mobile');
        if (!container) return;

        if (this.notices.length === 0) {
            container.innerHTML = `
                <div class="notice-empty-state">
                    <i class="fas fa-clipboard"></i>
                    <p>No notices from CR yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.notices.map(notice => this.createNoticeCard(notice)).join('');
        this.addDeleteListeners(container);
    },

    createNoticeCard(notice) {
        const date = notice.timestamp ? new Date(notice.timestamp.toDate()).toLocaleDateString() : 'Just now';

        let priorityClass = '';
        let priorityIcon = '';

        if (notice.priority === 'urgent') {
            priorityClass = 'priority-urgent';
            priorityIcon = '<i class="fas fa-exclamation-circle text-danger" title="Urgent"></i>';
        } else if (notice.priority === 'important') {
            priorityClass = 'priority-important';
            priorityIcon = '<i class="fas fa-info-circle text-warning" title="Important"></i>';
        } else {
            priorityIcon = '<i class="fas fa-bullhorn text-maroon" title="Notice"></i>';
        }

        // Check if current user is the creator or admin to show delete button
        const currentUid = firebase.auth().currentUser ? firebase.auth().currentUser.uid : null;
        // Optimization: We check role in checkCROrAdmin, but here we just need to know if we CAN delete.
        // Ideally, we re-check DB.isAdmin() or DB.isCR() but that's async. 
        // For UI simplicity, we use the 'cr-only-notice' class which is toggled by checkCROrAdmin.
        // BUT, for specific robustness, we can also check if createdBy matches (if we want to restrict CRs to delete ONLY their own, but requirements say "CRs should be able to add and remove notices for their own section", implying any CR of that section can delete).

        const deleteBtn = `
            <button class="btn-icon delete-notice-btn cr-only-notice" data-id="${notice.id}" title="Delete Notice" style="display: none;">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;

        return `
            <div class="cr-notice-card ${priorityClass}">
                <div class="cr-notice-header">
                    <div class="cr-notice-title-row">
                         <span class="cr-notice-icon">${priorityIcon}</span>
                         <span class="cr-notice-title">${UI.escapeHtml(notice.title)}</span>
                    </div>
                   ${deleteBtn}
                </div>
                <div class="cr-notice-body">
                    ${UI.escapeHtml(notice.description).replace(/\n/g, '<br>')}
                </div>
                <div class="cr-notice-footer">
                    <small>${date}</small>
                </div>
            </div>
    `;
    },

    addDeleteListeners(container) {
        // Re-apply visibility based on current state
        // We need to call show/hide because innerHTML replacement wipes styles
        // But we can't easily sync with the async check.
        // Instead, we just assume checkCROrAdmin has run or will run.
        // To fix the "flicker" or "hidden by default", we re-run the visibility check if we know we are permitted.
        // A simple way is to check the global state if we stored it, or just let the observer handle it?
        // Let's rely on the fact that checkCROrAdmin runs on auth state change. 
        // Use a slight delay or check a flag if needed. 
        // Better: trigger the check again or check a global flag.

        // Hack: Check if add button is visible to determine if we should show delete buttons
        const addBtn = document.getElementById('add-cr-notice-btn-desktop');
        if (addBtn && addBtn.style.display !== 'none') {
            container.querySelectorAll('.cr-only-notice').forEach(el => el.style.display = 'inline-flex');
        }

        container.querySelectorAll('.delete-notice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this notice?')) {
                    this.deleteNotice(btn.dataset.id);
                }
            });
        });
    },

    async openAddModal() {
        const form = document.getElementById('add-cr-notice-form');
        if (form) form.reset();

        // Get dropdown elements
        const deptSelect = document.getElementById('cr-notice-department');
        const semSelect = document.getElementById('cr-notice-semester');
        const secSelect = document.getElementById('cr-notice-section');

        // Check if user is Admin
        const user = firebase.auth().currentUser;
        if (user) {
            const roles = await DB.getUserRoles(user.uid);

            if (roles.isAdmin) {
                // Admin: Enable fields and load options
                if (deptSelect) deptSelect.disabled = false;
                if (semSelect) semSelect.disabled = false;
                if (secSelect) secSelect.disabled = false;

                // Load departments
                const deptResult = await DB.getDepartments();
                if (deptResult.success && deptSelect) {
                    await UI.populateDropdown('cr-notice-department', deptResult.data);
                }

                // Load semesters (assuming standard list or fetch)
                const semResult = await DB.getSemesters();
                if (semResult.success && semSelect) {
                    await UI.populateDropdown('cr-notice-semester', semResult.data);
                }

                // Add listeners update sections
                if (deptSelect && semSelect) {
                    const updateSections = async () => {
                        const dept = deptSelect.value;
                        const sem = semSelect.value;
                        if (dept && sem) {
                            const secResult = await DB.getSections(dept, sem);
                            if (secResult.success && secSelect) {
                                await UI.populateDropdown('cr-notice-section', secResult.data);
                            }
                        }
                    };
                    deptSelect.onchange = updateSections;
                    semSelect.onchange = updateSections;
                    // Remove old listeners to avoid duplicates if any (basic approach here)
                }

            } else {
                // CR or Regular User: Pre-fill from profile and disable
                const userDept = localStorage.getItem('userDepartment');
                const userSem = localStorage.getItem('userSemester');
                const userSec = localStorage.getItem('userSection');

                if (deptSelect) {
                    deptSelect.innerHTML = `<option value="${userDept}" selected>${userDept}</option>`;
                    deptSelect.disabled = true;
                }
                if (semSelect) {
                    semSelect.innerHTML = `<option value="${userSem}" selected>${userSem}</option>`;
                    semSelect.disabled = true;
                }
                if (secSelect) {
                    secSelect.innerHTML = `<option value="${userSec}" selected>${userSec}</option>`;
                    secSelect.disabled = true;
                }
            }
        }

        UI.showModal('add-cr-notice-modal');
    },

    async submitNotice() {
        const title = document.getElementById('cr-notice-title').value;
        const description = document.getElementById('cr-notice-description').value;
        const priority = document.getElementById('cr-notice-priority').value;

        // Get values from dropdowns (or localStorage as fallback if logic fails, but dropdowns should be ensuring this)
        let targetDept = document.getElementById('cr-notice-department').value;
        let targetSem = document.getElementById('cr-notice-semester').value;
        let targetSec = document.getElementById('cr-notice-section').value;

        const user = firebase.auth().currentUser;

        if (!user) {
            alert('You must be logged in to post a notice.');
            return;
        }

        if (!targetDept || !targetSem || !targetSec) {
            // Fallback to localStorage if dropdowns are empty (e.g. somehow bypassed)
            // But valid for Admin is to select them.
            alert('Please select Target Department, Semester and Section.');
            return;
        }


        if (!title || !description) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const btn = document.querySelector('#add-cr-notice-form button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';

            await db.collection('cr_notices').add({
                title,
                description,
                priority,
                department: targetDept,
                semester: targetSem,
                section: targetSec,
                createdBy: user.uid,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            UI.hideModal('add-cr-notice-modal');
            alert('Notice posted successfully');

            btn.disabled = false;
            btn.innerHTML = originalText;

        } catch (error) {
            console.error("Error posting notice:", error);
            alert('Failed to post notice: ' + error.message);
            const btn = document.querySelector('#add-cr-notice-form button[type="submit"]');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Post Notice';
        }
    },

    async deleteNotice(id) {
        try {
            await db.collection('cr_notices').doc(id).delete();
            alert('Notice deleted');
            // UI.showToast('Notice deleted', 'success');
        } catch (error) {
            console.error("Error deleting notice:", error);
            alert('Failed to delete: ' + error.message);
        }
    }
};