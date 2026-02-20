// ============================================
// CR NOTICE MODULE
// ============================================

const CRNoticeViewer = {
    // State
    notices: [],
    listeners: [],
    unsubscribe: null,
    _isAdmin: false,
    _isCR: false,

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

        // Close Add Modal
        const closeBtn = document.getElementById('close-add-cr-notice-modal');
        const cancelBtn = document.getElementById('cancel-add-cr-notice');

        if (closeBtn) closeBtn.addEventListener('click', () => UI.hideModal('add-cr-notice-modal'));
        if (cancelBtn) cancelBtn.addEventListener('click', () => UI.hideModal('add-cr-notice-modal'));

        // Add Form Submit
        const form = document.getElementById('add-cr-notice-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitNotice();
            });
        }

        // Close Edit Modal
        const closeEditBtn = document.getElementById('close-edit-cr-notice-modal');
        const cancelEditBtn = document.getElementById('cancel-edit-cr-notice');

        if (closeEditBtn) closeEditBtn.addEventListener('click', () => UI.hideModal('edit-cr-notice-modal'));
        if (cancelEditBtn) cancelEditBtn.addEventListener('click', () => UI.hideModal('edit-cr-notice-modal'));

        // Edit Form Submit
        const editForm = document.getElementById('edit-cr-notice-form');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitEditNotice();
            });
        }
    },

    async checkCROrAdmin() {
        const user = firebase.auth().currentUser;
        if (!user) return;

        try {
            const roles = await DB.getUserRoles(user.uid);
            this._isAdmin = roles.isAdmin || false;
            this._isCR = roles.isCR || false;

            if (this._isCR || this._isAdmin) {
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

        const profile = Utils.storage.get('userProfile');
        const userDept = profile && profile.department;
        const userSem = profile && profile.semester;
        const userSec = profile && profile.section;

        if (!userDept || !userSem || !userSec) {
            console.log('User profile incomplete, skipping CR notices');
            this.renderProfileMissing();
            return;
        }

        // Merge sections: B1+B2 → B (use section group letter)
        const sectionGroup = Utils.getSectionGroup(userSec);
        console.log(`Subscribing to CR notices for ${userDept} ${userSem}-${sectionGroup} (from ${userSec})`);

        // Query: Department + Semester + Section Group
        // Note: This requires a composite index in Firestore.
        // If index is missing, it will throw an error with a link to create it.
        this.unsubscribe = db.collection('cr_notices')
            .where('department', '==', userDept)
            .where('semester', '==', userSem)
            .where('section', '==', sectionGroup)
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
        this.addActionListeners(container);
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
        this.addActionListeners(container);
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

        const currentUid = firebase.auth().currentUser ? firebase.auth().currentUser.uid : null;
        const isOwner = currentUid && notice.createdBy === currentUid;

        // Edit: visible to owner (CR editing own) + Admins (can edit any)
        const canEdit = isOwner || this._isAdmin;
        const editBtn = canEdit ? `
            <button class="btn-icon edit-notice-btn cr-only-notice" data-id="${notice.id}" title="Edit Notice" style="display: none;">
                <i class="fas fa-edit"></i>
            </button>
        ` : '';

        // Delete: visible to all CRs + Admins
        const deleteBtn = `
            <button class="btn-icon delete-notice-btn cr-only-notice" data-id="${notice.id}" title="Delete Notice" style="display: none;">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;

        // "Added by" info
        const addedBy = notice.createdByEmail ? notice.createdByEmail.split('@')[0] : 'Unknown';
        const roleBadge = isOwner ? '' : '';

        // Check if description needs truncation (more than ~80 chars or has newlines)
        const descHtml = Utils.escapeAndLinkify(notice.description);
        const needsTruncation = notice.description && (notice.description.length > 80 || notice.description.includes('\n'));

        const toggleBtn = needsTruncation ? `
            <button class="cr-notice-description-toggle" data-id="${notice.id}">
                <span>See more</span> <i class="fas fa-chevron-down"></i>
            </button>
        ` : '';

        return `
            <div class="cr-notice-card ${priorityClass}">
                <div class="cr-notice-header">
                    <div class="cr-notice-title-row">
                         <span class="cr-notice-icon">${priorityIcon}</span>
                         <span class="cr-notice-title">${Utils.escapeAndLinkify(notice.title)}</span>
                    </div>
                    <div class="cr-notice-actions">
                        ${editBtn}
                        ${deleteBtn}
                    </div>
                </div>
                <div class="cr-notice-body">
                    <div class="cr-notice-description-text${needsTruncation ? '' : ' no-clamp'}">${descHtml}</div>
                    ${toggleBtn}
                </div>
                <div class="cr-notice-footer">
                    <small class="cr-notice-author"><i class="fas fa-user-circle"></i> ${addedBy}</small>
                    <small>${date}</small>
                </div>
            </div>
    `;
    },

    addActionListeners(container) {
        // Re-apply visibility for cr-only elements after innerHTML replacement
        if (this._isCR || this._isAdmin) {
            container.querySelectorAll('.cr-only-notice').forEach(el => el.style.display = 'inline-flex');
        }

        // Delete listeners
        container.querySelectorAll('.delete-notice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this notice?')) {
                    this.deleteNotice(btn.dataset.id);
                }
            });
        });

        // Edit listeners
        container.querySelectorAll('.edit-notice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openEditModal(btn.dataset.id);
            });
        });

        // See More toggle listeners
        container.querySelectorAll('.cr-notice-description-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.cr-notice-card');
                const textEl = card.querySelector('.cr-notice-description-text');
                const isExpanded = textEl.classList.toggle('expanded');
                btn.classList.toggle('expanded', isExpanded);
                btn.querySelector('span').textContent = isExpanded ? 'See less' : 'See more';
            });
        });
    },

    openAddModal() {
        const form = document.getElementById('add-cr-notice-form');
        if (form) form.reset();

        // No dropdown logic needed — dept/sem/sec are auto-read from user profile on submit
        UI.showModal('add-cr-notice-modal');
    },

    async submitNotice() {
        const title = document.getElementById('cr-notice-title').value;
        const description = document.getElementById('cr-notice-description').value;
        const priority = document.getElementById('cr-notice-priority').value;

        const user = firebase.auth().currentUser;

        if (!user) {
            alert('You must be logged in to post a notice.');
            return;
        }

        if (!title || !description) {
            alert('Please fill in all fields');
            return;
        }

        // Read dept/sem/sec from stored user profile (same source as Events flow)
        const profile = Utils.storage.get('userProfile');
        const targetDept = profile && profile.department;
        const targetSem = profile && profile.semester;
        const targetSecRaw = profile && profile.section;
        // Store section group (B1/B2 → B) so both sub-sections see the notice
        const targetSec = Utils.getSectionGroup(targetSecRaw);

        if (!targetDept || !targetSem || !targetSec) {
            alert('Your profile is incomplete. Please set your Department, Semester, and Section in Profile Settings first.');
            return;
        }

        try {
            const btn = document.querySelector('#add-cr-notice-form button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';

            const noticeData = {
                title,
                description,
                priority,
                department: targetDept,
                semester: targetSem,
                section: targetSec,
                createdBy: user.uid,
                createdByEmail: user.email || 'Unknown',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await db.collection('cr_notices').add(noticeData);

            // Log to Activity Timeline
            ActivityLogger.logNoticeAddition(docRef.id, noticeData, profile);

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
            // Find the notice data before deleting (for timeline logging)
            const notice = this.notices.find(n => n.id === id);
            const user = firebase.auth().currentUser;
            const profile = Utils.storage.get('userProfile');

            await db.collection('cr_notices').doc(id).delete();

            // Log to Activity Timeline
            if (notice && user) {
                ActivityLogger.logNoticeDeletion(id, notice, user.uid, profile);
            }

            alert('Notice deleted');
        } catch (error) {
            console.error("Error deleting notice:", error);
            alert('Failed to delete: ' + error.message);
        }
    },

    openEditModal(noticeId) {
        const notice = this.notices.find(n => n.id === noticeId);
        if (!notice) {
            alert('Notice not found');
            return;
        }

        document.getElementById('edit-cr-notice-id').value = notice.id;
        document.getElementById('edit-cr-notice-title').value = notice.title || '';
        document.getElementById('edit-cr-notice-description').value = notice.description || '';
        document.getElementById('edit-cr-notice-priority').value = notice.priority || 'normal';

        UI.showModal('edit-cr-notice-modal');
    },

    async submitEditNotice() {
        const noticeId = document.getElementById('edit-cr-notice-id').value;
        const title = document.getElementById('edit-cr-notice-title').value;
        const description = document.getElementById('edit-cr-notice-description').value;
        const priority = document.getElementById('edit-cr-notice-priority').value;

        if (!title || !description) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const btn = document.querySelector('#edit-cr-notice-form button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            await db.collection('cr_notices').doc(noticeId).update({
                title,
                description,
                priority
            });

            UI.hideModal('edit-cr-notice-modal');
            alert('Notice updated successfully');

            btn.disabled = false;
            btn.innerHTML = originalText;
        } catch (error) {
            console.error('Error updating notice:', error);
            alert('Failed to update notice: ' + error.message);
            const btn = document.querySelector('#edit-cr-notice-form button[type="submit"]');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
            }
        }
    }
};