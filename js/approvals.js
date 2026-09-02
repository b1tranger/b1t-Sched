// ============================================
// ACCOUNT APPROVALS MANAGER MODULE
// ============================================

const ApprovalManager = {
  currentRole: null,
  currentDept: null,
  isAdmin: false,
  isDptCoor: false,
  isCR: false,
  pendingList: [],

  init() {
    console.log('Initializing ApprovalManager...');
    this.setupEventListeners();
  },

  setupEventListeners() {
    // Desktop Button
    const desktopBtn = document.getElementById('approval-button-desktop');
    if (desktopBtn) {
      desktopBtn.addEventListener('click', () => this.openApprovalModal());
    }

    // Mobile Toggle
    const mobileToggle = document.getElementById('approval-toggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => this.openApprovalSidebar());
    }

    // Close Modal Button
    const closeModalBtn = document.getElementById('close-approval-modal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => this.closeApprovalModal());
    }

    // Close Sidebar Button
    const closeSidebarBtn = document.getElementById('close-approval-sidebar');
    if (closeSidebarBtn) {
      closeSidebarBtn.addEventListener('click', () => this.closeApprovalSidebar());
    }

    // Mobile Overlay
    const overlay = document.getElementById('approval-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => this.closeApprovalSidebar());
    }

    // Delegate Approve / Reject actions in both modal and sidebar
    ['approval-modal-body', 'approval-sidebar-content'].forEach(containerId => {
      const container = document.getElementById(containerId);
      if (container) {
        container.addEventListener('click', async (e) => {
          const approveBtn = e.target.closest('.approve-faculty-btn');
          if (approveBtn) {
            const userId = approveBtn.dataset.userId;
            await this.handleApprove(userId);
            return;
          }

          const rejectBtn = e.target.closest('.reject-faculty-btn');
          if (rejectBtn) {
            const userId = rejectBtn.dataset.userId;
            await this.handleReject(userId);
            return;
          }
        });
      }
    });

    // Close modal on click outside
    const modal = document.getElementById('approval-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeApprovalModal();
        }
      });
    }
  },

  updateVisibility(role, dept = null, isCR = false, isDptCoor = false, isAdmin = false) {
    this.currentRole = role;
    this.currentDept = dept;
    this.isCR = isCR || role === 'CR';
    this.isDptCoor = isDptCoor || role === 'DptCoor' || role === 'DptHead';
    this.isAdmin = isAdmin || role === 'Admin';

    // Strictly CR, DptCoor, or Admin can see approvals
    // Faculty (regular) and Student must NEVER see approvals
    const canSeeApprovals = this.isAdmin || this.isDptCoor || this.isCR;
    const isDashboard = typeof Router !== 'undefined' ? Router.getCurrentRoute() === 'dashboard' : true;

    const desktopBtn = document.getElementById('approval-button-desktop');
    const mobileToggle = document.getElementById('approval-toggle');

    if (canSeeApprovals && isDashboard) {
      if (desktopBtn) {
        desktopBtn.style.removeProperty('display');
        desktopBtn.style.display = 'flex';
        desktopBtn.classList.remove('hidden');
      }
      if (mobileToggle) {
        mobileToggle.style.removeProperty('display');
        mobileToggle.style.display = 'flex';
        mobileToggle.classList.remove('hidden');
      }

      // Refresh pending count for Admin / DptCoor
      if (this.isAdmin || this.isDptCoor) {
        this.fetchPendingCount();
      } else {
        this.updateBadgeCount(0);
      }
    } else {
      if (desktopBtn) {
        desktopBtn.style.setProperty('display', 'none', 'important');
        desktopBtn.classList.add('hidden');
      }
      if (mobileToggle) {
        mobileToggle.style.setProperty('display', 'none', 'important');
        mobileToggle.classList.add('hidden');
      }
    }
  },

  async fetchPendingCount() {
    if (!this.isAdmin && !this.isDptCoor) return;
    const dept = this.isAdmin ? null : this.currentDept;
    const result = await DB.getPendingFacultyApprovals(dept);
    if (result.success) {
      this.pendingList = result.data || [];
      this.updateBadgeCount(this.pendingList.length);
    }
  },

  updateBadgeCount(count) {
    const desktopBadge = document.getElementById('approval-badge-count-desktop');
    const mobileBadge = document.getElementById('approval-badge-count-mobile');

    [desktopBadge, mobileBadge].forEach(badge => {
      if (badge) {
        if (count > 0) {
          badge.textContent = count > 99 ? '99+' : count;
          badge.style.display = 'inline-block';
        } else {
          badge.style.display = 'none';
        }
      }
    });
  },

  openApprovalModal() {
    const modal = document.getElementById('approval-modal');
    if (modal) {
      modal.style.display = 'flex';
      this.renderApprovalsContent('approval-modal-body');
    }
  },

  closeApprovalModal() {
    const modal = document.getElementById('approval-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  },

  openApprovalSidebar() {
    const sidebar = document.getElementById('approval-sidebar');
    const overlay = document.getElementById('approval-overlay');
    if (sidebar) {
      sidebar.classList.add('open');
      this.renderApprovalsContent('approval-sidebar-content');
    }
    if (overlay) {
      overlay.classList.add('active');
    }
  },

  closeApprovalSidebar() {
    const sidebar = document.getElementById('approval-sidebar');
    const overlay = document.getElementById('approval-overlay');
    if (sidebar) {
      sidebar.classList.remove('open');
    }
    if (overlay) {
      overlay.classList.remove('active');
    }
  },

  async renderApprovalsContent(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // If user is CR (and not Admin/DptCoor)
    if (this.isCR && !this.isAdmin && !this.isDptCoor) {
      container.innerHTML = `
        <div class="approvals-cr-notice">
          <div class="approvals-notice-icon">
            <i class="fas fa-user-graduate"></i>
          </div>
          <h3>Student Approvals</h3>
          <p class="approvals-notice-text">
            Approvals for student accounts will arrive soon.
          </p>
          <small class="approvals-notice-hint">
            Account approvals are strictly available for Faculty registrations at this time.
          </small>
        </div>
      `;
      return;
    }

    // Loading State
    container.innerHTML = `
      <div class="approvals-loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading pending approvals...</p>
      </div>
    `;

    const dept = this.isAdmin ? null : this.currentDept;
    const result = await DB.getPendingFacultyApprovals(dept);

    if (!result.success) {
      container.innerHTML = `
        <div class="no-data-message error">
          <i class="fas fa-exclamation-circle"></i>
          <p>Failed to load approvals: ${result.error}</p>
        </div>
      `;
      return;
    }

    this.pendingList = result.data || [];
    this.updateBadgeCount(this.pendingList.length);

    if (this.pendingList.length === 0) {
      container.innerHTML = `
        <div class="no-data-message" style="padding: var(--spacing-xl) var(--spacing-md); text-align: center;">
          <i class="fas fa-check-circle" style="font-size: 2.5rem; color: #10b981; margin-bottom: 12px; display: block;"></i>
          <h4 style="margin: 0 0 6px 0; font-size: 1.1rem; color: var(--text-dark);">All Caught Up!</h4>
          <p style="color: var(--text-medium); font-size: 0.9rem; margin: 0;">No pending faculty registration requests at this time.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="approvals-header-info">
        <span class="approvals-count-badge"><i class="fas fa-clock"></i> ${this.pendingList.length} Pending Request${this.pendingList.length > 1 ? 's' : ''}</span>
        ${this.isAdmin ? '<span class="approvals-dept-scope"><i class="fas fa-globe"></i> All Departments</span>' : `<span class="approvals-dept-scope"><i class="fas fa-building"></i> Dept: ${this.currentDept || 'N/A'}</span>`}
      </div>
      <div class="approvals-list">
        ${this.pendingList.map(item => {
          const initial = item.facultyInitial || item.studentId || 'N/A';
          const email = item.email || 'No email';
          const deptName = item.department || 'N/A';
          const createdStr = item.createdAt && item.createdAt.toDate 
            ? item.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Recently';

          return `
            <div class="approval-card" data-user-id="${item.id}">
              <div class="approval-card-header">
                <div class="approval-user-avatar">
                  <i class="fas fa-chalkboard-teacher"></i>
                </div>
                <div class="approval-user-info">
                  <div class="approval-user-title">
                    <strong class="approval-faculty-initial">${initial}</strong>
                    <span class="role-badge faculty" style="font-size: 0.72rem; padding: 2px 6px;">Faculty</span>
                  </div>
                  <p class="approval-user-email">${email}</p>
                  <p class="approval-user-meta">
                    <span><i class="fas fa-building"></i> ${deptName}</span> • 
                    <span><i class="fas fa-calendar-plus"></i> ${createdStr}</span>
                  </p>
                </div>
              </div>
              <div class="approval-card-actions">
                <button class="btn btn-sm btn-primary approve-faculty-btn" data-user-id="${item.id}" title="Approve Faculty Account">
                  <i class="fas fa-check"></i> Approve
                </button>
                <button class="btn btn-sm btn-danger reject-faculty-btn" data-user-id="${item.id}" title="Reject Request">
                  <i class="fas fa-times"></i> Reject
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  async handleApprove(userId) {
    const target = this.pendingList.find(u => u.id === userId);
    const initial = target ? (target.facultyInitial || target.studentId || target.email) : 'this faculty';
    const confirmed = confirm(`Approve ${initial} as an active Faculty member?`);
    if (!confirmed) return;

    UI.showLoading(true);
    const currentUid = typeof Auth !== 'undefined' ? Auth.getUserId() : 'admin';
    const result = await DB.approveFacultyUser(userId, currentUid);
    UI.showLoading(false);

    if (result.success) {
      alert(`Faculty account for ${initial} has been approved successfully!`);
      // Refresh current views
      if (document.getElementById('approval-modal')?.style.display === 'flex') {
        this.renderApprovalsContent('approval-modal-body');
      }
      if (document.getElementById('approval-sidebar')?.classList.contains('open')) {
        this.renderApprovalsContent('approval-sidebar-content');
      }
      this.fetchPendingCount();
    } else {
      alert(`Failed to approve user: ${result.error}`);
    }
  },

  async handleReject(userId) {
    const target = this.pendingList.find(u => u.id === userId);
    const initial = target ? (target.facultyInitial || target.studentId || target.email) : 'this user';
    const confirmed = confirm(`Reject faculty request for ${initial}? The account will be reverted to regular Student access.`);
    if (!confirmed) return;

    UI.showLoading(true);
    const currentUid = typeof Auth !== 'undefined' ? Auth.getUserId() : 'admin';
    const result = await DB.rejectFacultyUser(userId, currentUid);
    UI.showLoading(false);

    if (result.success) {
      alert(`Faculty registration request for ${initial} was rejected.`);
      // Refresh current views
      if (document.getElementById('approval-modal')?.style.display === 'flex') {
        this.renderApprovalsContent('approval-modal-body');
      }
      if (document.getElementById('approval-sidebar')?.classList.contains('open')) {
        this.renderApprovalsContent('approval-sidebar-content');
      }
      this.fetchPendingCount();
    } else {
      alert(`Failed to reject user: ${result.error}`);
    }
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  ApprovalManager.init();
});
