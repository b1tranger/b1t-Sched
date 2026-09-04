// ============================================
// UI MODULE
// ============================================

const UI = {
  // Show/hide loading screen
  showLoading(show = true) {
    const loadingScreen = document.getElementById('loading-screen');
    const appContainer = document.getElementById('app');
    const noteToggleMobile = document.getElementById('note-toggle');
    const noteButtonDesktop = document.getElementById('note-button-desktop');
    const approvalToggleMobile = document.getElementById('approval-toggle');
    const approvalButtonDesktop = document.getElementById('approval-button-desktop');

    if (show) {
      loadingScreen.style.display = 'flex';
      appContainer.style.display = 'none';
      document.body.style.overflow = 'hidden';
      // Hide buttons during loading (.hidden has !important to override .mobile-only/.desktop-only)
      if (noteToggleMobile) noteToggleMobile.classList.add('hidden');
      if (noteButtonDesktop) noteButtonDesktop.classList.add('hidden');
      if (approvalToggleMobile) approvalToggleMobile.classList.add('hidden');
      if (approvalButtonDesktop) approvalButtonDesktop.classList.add('hidden');
    } else {
      loadingScreen.style.display = 'none';
      appContainer.style.display = 'block';
      document.body.style.overflow = '';
      // Remove hidden class so CSS visibility classes can take over for notes
      if (noteToggleMobile) noteToggleMobile.classList.remove('hidden');
      if (noteButtonDesktop) noteButtonDesktop.classList.remove('hidden');
      // Update approval button visibility based on active role
      if (typeof ApprovalManager !== 'undefined' && ApprovalManager.updateVisibility) {
        const role = typeof App !== 'undefined' ? (App.previewRole || (App.isAdmin ? 'Admin' : (App.isDptCoor ? 'DptCoor' : (App.isFaculty ? 'Faculty' : (App.isCR ? 'CR' : 'Student'))))) : 'Student';
        const dept = typeof App !== 'undefined' && App.userProfile ? App.userProfile.department : null;
        const isCR = typeof App !== 'undefined' ? App.isCR : false;
        const isDptCoor = typeof App !== 'undefined' ? App.isDptCoor : false;
        const isAdmin = typeof App !== 'undefined' ? App.isAdmin : false;
        ApprovalManager.updateVisibility(role, dept, isCR, isDptCoor, isAdmin);
      }
    }
  },

  // Show message
  showMessage(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';

    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
      setTimeout(() => {
        element.style.display = 'none';
      }, 5000);
    }
  },

  hideMessage(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.display = 'none';
    }
  },

  // Show floating toast notification
  showToast(message, type = 'info', duration = 4000, position = null) {
    // Resolve position: default to bottom-right for Copied UID / user-management, else top-right
    let resolvedPosition = position;
    if (!resolvedPosition) {
      if (typeof message === 'string' && (message.includes('Copied UID') || message.toLowerCase().includes('uid'))) {
        resolvedPosition = 'bottom-right';
      } else if (typeof Router !== 'undefined' && Router.currentRoute === 'user-management') {
        resolvedPosition = 'bottom-right';
      } else {
        resolvedPosition = 'top-right';
      }
    }

    const isBottom = resolvedPosition === 'bottom-right';
    const containerId = isBottom ? 'toast-container-bottom-right' : 'toast-container';
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      if (isBottom) {
        container.style.cssText = `
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 10000;
          display: flex;
          flex-direction: column-reverse;
          gap: 10px;
          max-width: min(380px, calc(100vw - 48px));
          pointer-events: none;
        `;
      } else {
        container.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: min(380px, calc(100vw - 48px));
          pointer-events: none;
        `;
      }
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgColors = {
      success: '#2e7d32',
      error: '#d32f2f',
      warning: '#ed6c02',
      info: '#0288d1'
    };
    const bgColor = bgColors[type] || bgColors.info;
    const initialTranslate = isBottom ? 'translateY(10px)' : 'translateY(-10px)';

    toast.style.cssText = `
      background-color: ${bgColor};
      color: #ffffff;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.2);
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 10px;
      pointer-events: auto;
      transition: opacity 0.3s ease, transform 0.3s ease;
      opacity: 0;
      transform: ${initialTranslate};
    `;

    const iconClass = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${iconClass}" style="font-size: 16px;"></i><span>${message}</span>`;

    container.appendChild(toast);

    // Trigger reflow & animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = initialTranslate;
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  },

  // Update user details card
  updateUserDetailsCard(email, department, semester, section) {
    document.getElementById('user-email').textContent = email;
    document.getElementById('user-department').textContent = `${department} • ${semester} • ${section}`;
  },

  getResourceIcon(iconStr, url, title) {
    if (iconStr && (iconStr.includes('<i ') || iconStr.includes('<svg'))) {
      return iconStr;
    }

    const lowerTitle = (title || '').toLowerCase();
    const isPdf = /\.pdf(\?.*)?$/i.test(url);

    // Emoji to Font Awesome 6 (Latest) icon map
    const emojiMap = {
      '📚': 'fa-solid fa-book-open',
      '📖': 'fa-solid fa-book',
      '📑': 'fa-solid fa-file-lines',
      '📄': 'fa-solid fa-file-lines',
      '📜': 'fa-solid fa-scroll',
      '📝': 'fa-solid fa-pen-to-square',
      '📁': 'fa-solid fa-folder',
      '📂': 'fa-solid fa-folder-open',
      '🎓': 'fa-solid fa-graduation-cap',
      '🏫': 'fa-solid fa-school',
      '💻': 'fa-solid fa-laptop-code',
      '🖥️': 'fa-solid fa-desktop',
      '🔗': 'fa-solid fa-link',
      '🌐': 'fa-solid fa-globe',
      '📌': 'fa-solid fa-thumbtack',
      '🎥': 'fa-solid fa-video',
      '🎬': 'fa-solid fa-film',
      '📊': 'fa-solid fa-chart-column',
      '🗓️': 'fa-solid fa-calendar-days',
      '📅': 'fa-regular fa-calendar',
      '💡': 'fa-solid fa-lightbulb',
      '📢': 'fa-solid fa-bullhorn',
      '⭐': 'fa-solid fa-star',
      '🚀': 'fa-solid fa-rocket',
      '⚙️': 'fa-solid fa-gear',
      '🔧': 'fa-solid fa-wrench',
      '❓': 'fa-solid fa-circle-question'
    };

    const trimmedIcon = (iconStr || '').trim();
    if (trimmedIcon && emojiMap[trimmedIcon]) {
      return `<i class="${emojiMap[trimmedIcon]}"></i>`;
    }

    // Contextual fallbacks
    if (isPdf) return '<i class="fa-solid fa-file-pdf"></i>';
    if (lowerTitle.includes('routine') || lowerTitle.includes('schedule') || lowerTitle.includes('calendar')) return '<i class="fa-solid fa-calendar-days"></i>';
    if (lowerTitle.includes('syllabus') || lowerTitle.includes('curriculum') || lowerTitle.includes('book')) return '<i class="fa-solid fa-book-open"></i>';
    if (lowerTitle.includes('result') || lowerTitle.includes('grade')) return '<i class="fa-solid fa-square-poll-vertical"></i>';
    if (lowerTitle.includes('drive') || lowerTitle.includes('folder')) return '<i class="fa-solid fa-folder-open"></i>';
    if (lowerTitle.includes('notice') || lowerTitle.includes('announcement')) return '<i class="fa-solid fa-bullhorn"></i>';

    return '<i class="fa-solid fa-arrow-up-right-from-square"></i>';
  },

  // Init Quick Links Dropdown toggle and click outside listener
  initQuickLinksDropdown() {
    const btn = document.getElementById('quick-links-dropdown-btn');
    const menu = document.getElementById('resource-links-dropdown');
    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.style.display === 'block';
      menu.style.display = isOpen ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
      if (menu.style.display === 'block' && !menu.contains(e.target) && !btn.contains(e.target)) {
        menu.style.display = 'none';
      }
    });
  },

  // Render resource links as clean dropdown items without icons
  renderResourceLinks(links) {
    const container = document.getElementById('resource-links-container');
    if (!container) return;

    if (!links || links.length === 0) {
      container.innerHTML = '<p class="no-data-message" style="padding: 10px 16px; margin: 0; font-size: var(--font-xs);">No resource links available.</p>';
      return;
    }

    container.innerHTML = links.map(link => {
      const isPdf = /\.pdf(\?.*)?$/i.test(link.url);
      if (isPdf) {
        return `
      <a href="${link.url}" class="resource-dropdown-item" data-pdf-url="${link.url}" data-pdf-title="${link.title}">
        <span class="resource-item-title">${link.title}</span>
        ${link.description ? `<span class="resource-item-desc">${link.description}</span>` : ''}
      </a>
    `;
      }
      return `
      <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="resource-dropdown-item">
        <span class="resource-item-title">${link.title}</span>
        ${link.description ? `<span class="resource-item-desc">${link.description}</span>` : ''}
      </a>
    `;
    }).join('');

    // Intercept PDF link clicks
    container.querySelectorAll('.resource-dropdown-item[data-pdf-url]').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const pdfUrl = card.dataset.pdfUrl;
        const pdfTitle = card.dataset.pdfTitle || 'PDF Viewer';

        // Close dropdown menu
        const menu = document.getElementById('resource-links-dropdown');
        if (menu) menu.style.display = 'none';

        // Mobile: open via Google Docs Viewer in new tab
        if (window.innerWidth <= 768) {
          window.open(`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`, '_blank');
          return;
        }

        // Desktop: open in PDF viewer modal
        this.openPdfViewer(pdfUrl, pdfTitle);
      });
    });
  },

  // ──────────────────────────────────────────────
  // PDF VIEWER (for Quick Links)
  // ──────────────────────────────────────────────

  initPdfViewer() {
    const closeBtn = document.getElementById('close-pdf-viewer-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closePdfViewer());
    }

    const modal = document.getElementById('pdf-viewer-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closePdfViewer();
      });
    }
  },

  openPdfViewer(url, title) {
    const titleEl = document.getElementById('pdf-viewer-title');
    const openBtn = document.getElementById('pdf-viewer-open');
    const downloadBtn = document.getElementById('pdf-viewer-download');
    const frame = document.getElementById('pdf-viewer-frame');

    if (titleEl) titleEl.textContent = title;
    if (openBtn) openBtn.href = url;
    if (downloadBtn) {
      downloadBtn.href = url;
      // Extract filename from URL
      const filename = url.split('/').pop().split('?')[0] || 'document.pdf';
      downloadBtn.download = filename;
    }
    if (frame) {
      // Use Google Docs Viewer to render PDFs inline (avoids download prompts from external servers)
      frame.src = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
    }

    this.showModal('pdf-viewer-modal');
  },

  closePdfViewer() {
    const frame = document.getElementById('pdf-viewer-frame');
    if (frame) frame.src = '';
    this.hideModal('pdf-viewer-modal');
  },

  // Render tasks with checkboxes
  // isAdmin: user has admin privileges (can edit/delete any task, manage events)
  // isCR: user is a Class Representative (can delete any task, use reset)
  renderTasks(tasks, userCompletions = {}, isAdmin = false, isCR = false, currentUserId = null) {
    const container = document.getElementById('tasks-container');
    const noTasksMsg = document.getElementById('no-tasks-message');

    if (!container) return;

    if (tasks.length === 0) {
      container.innerHTML = '';
      noTasksMsg.style.display = 'block';
      return;
    }

    noTasksMsg.style.display = 'none';

    // Separate Faculty tasks from other tasks
    const facultyTasks = tasks.filter(task => task.addedByRole === 'Faculty');
    const otherTasks = tasks.filter(task => task.addedByRole !== 'Faculty');

    // Group Faculty tasks by department
    const facultyTasksByDept = {};
    facultyTasks.forEach(task => {
      const dept = task.department || 'Unknown';
      if (!facultyTasksByDept[dept]) {
        facultyTasksByDept[dept] = [];
      }
      facultyTasksByDept[dept].push(task);
    });

    // Sort tasks: incomplete first, then by deadline, completed at bottom
    const now = new Date();
    const sortTasks = (taskList) => {
      return [...taskList].sort((a, b) => {
        const aCompleted = userCompletions[a.id] || false;
        const bCompleted = userCompletions[b.id] || false;
        // Completed tasks go to bottom
        if (aCompleted !== bCompleted) {
          return aCompleted ? 1 : -1;
        }
        // Tasks with no deadline always go after all with a deadline (but before completed)
        const aHasDeadline = !!a.deadline;
        const bHasDeadline = !!b.deadline;
        if (aHasDeadline && !bHasDeadline) return -1;
        if (!aHasDeadline && bHasDeadline) return 1;
        if (!aHasDeadline && !bHasDeadline) return 0;
        // Both have deadlines, sort by soonest
        const aDeadline = a.deadline.toDate ? a.deadline.toDate() : new Date(a.deadline);
        const bDeadline = b.deadline.toDate ? b.deadline.toDate() : new Date(b.deadline);
        return aDeadline - bDeadline;
      });
    };

    const sortedOtherTasks = sortTasks(otherTasks);

    // Build HTML: Faculty tasks grouped by department first, then other tasks
    let html = '';

    // Render Faculty tasks grouped by department
    const deptNames = Object.keys(facultyTasksByDept).sort();
    deptNames.forEach(dept => {
      const deptTasks = sortTasks(facultyTasksByDept[dept]);
      if (deptTasks.length > 0) {
        html += `
          <div class="faculty-task-group">
            <div class="faculty-task-group-header">
              <i class="fas fa-chalkboard-teacher"></i>
              <span>Faculty Tasks - ${dept}</span>
            </div>
            ${deptTasks.map(task => this.renderTaskCard(task, userCompletions, isAdmin, isCR, currentUserId, now, true)).join('')}
          </div>
        `;
      }
    });

    // Render other tasks
    html += sortedOtherTasks.map(task => this.renderTaskCard(task, userCompletions, isAdmin, isCR, currentUserId, now, false)).join('');

    container.innerHTML = html;
  },

  // Helper function to render a single task card
  renderTaskCard(task, userCompletions, isAdmin, isCR, currentUserId, now, isFacultyTask) {
    let deadline = null;
    let daysUntil = null;
    let isUrgent = false;
    let isPastDeadline = false;
    if (task.deadline) {
      deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
      daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      isUrgent = daysUntil <= 3 && daysUntil > 0;
      isPastDeadline = deadline < now;
    }
    const isCompleted = userCompletions[task.id] || false;
    // Determine task status class
    let statusClass = '';
    if (isCompleted) {
      statusClass = 'completed';
    } else if (isPastDeadline) {
      statusClass = 'incomplete';
    }
    // Edit: Admin can edit any task, Faculty can edit their own tasks, users can only edit their own tasks
    const canEdit = isAdmin || (currentUserId && task.addedBy === currentUserId);
    const editButton = canEdit ? `
        <button class="task-edit-btn" data-task-id="${task.id}" title="Edit task">
          <i class="fas fa-edit"></i>
        </button>
      ` : '';
    // Delete: Admin/CR can delete any task, users can only delete their own tasks
    const canDelete = isAdmin || isCR || (currentUserId && task.addedBy === currentUserId);
    const deleteButton = canDelete ? `
        <button class="task-delete-btn" data-task-id="${task.id}" title="Delete task">
          <i class="fas fa-trash"></i>
        </button>
      ` : '';

    // Add Faculty badge if this is a Faculty task
    const facultyBadge = isFacultyTask ? `<span class="task-faculty-badge"><i class="fas fa-chalkboard-teacher"></i> Faculty</span>` : '';

    // Add Classroom badge if added from Classroom
    const classroomBadge = task.addedFrom === 'classroom' ? `<span class="task-type-badge assignment" style="background-color: #34a853; color: white; display: inline-flex; align-items: center; gap: 4px;"><i class="fas fa-chalkboard-teacher"></i> Classroom</span>` : '';

    return `
        <div class="task-card ${statusClass} ${isFacultyTask ? 'faculty-task' : ''}" data-task-id="${task.id}" data-type="${task.type || 'other'}">
          <div class="task-card-inner">
            <div class="task-checkbox-wrapper">
              <input type="checkbox" class="task-checkbox" 
                     data-task-id="${task.id}" 
                     ${isCompleted ? 'checked' : ''}
                     title="${isCompleted ? 'Mark as incomplete' : 'Mark as complete'}">
            </div>
            <div class="task-content">
              <div class="task-header">
                <div>
                  <p class="task-course">${task.course || 'No course specified'}</p>
                  <h3 class="task-title">${task.title || ''}</h3>
                </div>
                <div class="task-header-right">
                  <div class="task-header-actions-row">
                    ${facultyBadge}
                    <span class="task-type-badge ${task.type}">${task.type || 'task'}</span>
                    <button type="button" class="task-card-copy-btn" data-task-id="${task.id}" title="Copy task contents" aria-label="Copy task contents">
                      <i class="far fa-copy"></i>
                    </button>
                  </div>
                  <div class="task-actions-vertical">
                    ${editButton}
                    ${deleteButton}
                  </div>
                </div>
              </div>
              <div class="task-description">
                <div class="task-description-wrapper">
                  <div class="task-description-text">${Utils.escapeAndLinkify(task.description) || 'No description available.'}</div>
                  <div class="task-meta-footer task-added-by-hidden">
                    ${task.addedBy ? `<span class="task-added-by">Added by ${task.addedByName || 'User'}${task.addedByRole && (task.addedByRole === 'CR' || task.addedByRole === 'Faculty' || task.addedByRole === 'DptCoor' || task.addedByRole === 'DptHead') ? ` <span class="role-badge role-badge-${task.addedByRole.toLowerCase()}">${task.addedByRole}</span>` : ''}${task.section ? ` (${task.section})` : ''}${isFacultyTask && task.department ? ` - ${task.department}` : ''}</span>` : ''}
                    <button type="button" class="copy-task-id-btn" data-task-id="${task.id}" title="Copy Task ID" aria-label="Copy Task ID">
                      <i class="fas fa-fingerprint"></i>
                      <span class="task-id-btn-text">Copy ID</span>
                    </button>
                  </div>
                  <button type="button" class="task-description-toggle" aria-label="Toggle description">
                    <span class="toggle-text">Show more</span>
                    <i class="fas fa-chevron-down"></i>
                  </button>
                </div>
              </div>
              ${task.details ? `<div class="task-description"><div class="task-description-wrapper"><div class="task-description-text"><strong>Details:</strong> ${Utils.escapeAndLinkify(task.details)}</div><button type="button" class="task-description-toggle" aria-label="Toggle details"><span class="toggle-text">Show more</span><i class="fas fa-chevron-down"></i></button></div></div>` : ''}
              <div class="task-footer">
                <span class="task-deadline ${isUrgent ? 'urgent' : ''} ${isPastDeadline && !isCompleted ? 'urgent' : ''}">
                  <i class="fas fa-clock"></i>
                  ${task.deadline ? Utils.formatDate(deadline) : 'No official Time limit'}
                  ${isPastDeadline && !isCompleted ? '(Overdue!)' : ''}
                  ${isUrgent && !isPastDeadline ? `(${daysUntil} day${daysUntil !== 1 ? 's' : ''} left!)` : ''}
                </span>
                ${classroomBadge}
              </div>
            </div>
          </div>
        </div>
      `;
  },

  // Render old tasks (past deadline - compact view)
  renderOldTasks(tasks, isAdmin = false, currentUserId = null) {
    const container = document.getElementById('old-tasks-container');
    const noOldTasksMsg = document.getElementById('no-old-tasks-message');

    if (!container) return;

    if (tasks.length === 0) {
      container.innerHTML = '';
      noOldTasksMsg.style.display = 'block';
      return;
    }

    noOldTasksMsg.style.display = 'none';

    container.innerHTML = tasks.map(task => {
      const deadline = task.deadline ? (task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline)) : new Date();
      const isCompleted = task.isCompleted || false;
      const completedDate = task.completedAt ? (task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt)) : null;

      // Show different icon and style based on completion status
      const iconClass = isCompleted ? 'fa-check-circle completed-icon' : 'fa-clock overdue-icon';
      const statusClass = isCompleted ? 'completed' : 'overdue';

      // Edit: Admin can edit any task, users can edit their own tasks
      const canEdit = isAdmin || (currentUserId && task.addedBy === currentUserId);
      const editButton = canEdit ? `
        <div class="old-task-actions">
          <button class="task-edit-btn old-task-edit-btn" data-task-id="${task.id}" title="Edit task">
            <i class="fas fa-edit"></i>
          </button>
        </div>
      ` : '';

      return `
        <div class="old-task-item ${statusClass}" data-task-id="${task.id}">
          <i class="fas ${iconClass}"></i>
          <div class="task-info" style="cursor: pointer;">
            <div class="task-title">${task.title || 'Untitled Task'}</div>
            <div class="task-meta">
              ${task.course || ''} • Due: ${Utils.formatDateShort(deadline)}
              ${isCompleted && completedDate ? ` • Completed: ${Utils.formatDateShort(completedDate)}` : ''}
              ${!isCompleted ? ' • <span class="overdue-label">Not completed</span>' : ''}
            </div>
          </div>
          ${editButton}
        </div>
      `;
    }).join('');
  },

  // Render events
  // isAdmin: user has admin privileges (can edit/delete any event)
  // isCR: user is a Class Representative (can edit/delete own events)
  renderEvents(events, isAdmin = false, isCR = false, isFaculty = false, currentUserId = null) {
    const container = document.getElementById('events-container');
    const noEventsMsg = document.getElementById('no-events-message');
    const noEventsMsgMobile = document.getElementById('no-events-message-mobile');
    const mobileContainer = document.getElementById('events-container-mobile');

    if (!container) return;

    if (events.length === 0) {
      container.innerHTML = '';
      if (mobileContainer) mobileContainer.innerHTML = '';
      noEventsMsg.style.display = 'block';
      if (noEventsMsgMobile) noEventsMsgMobile.style.display = 'block';
      return;
    }

    noEventsMsg.style.display = 'none';
    if (noEventsMsgMobile) noEventsMsgMobile.style.display = 'none';
    const eventsHTML = events.map(event => {
      const eventDate = event.date ? event.date.toDate() : new Date();
      const day = eventDate.getDate();
      const month = eventDate.toLocaleDateString('en-US', { month: 'short' });

      // Edit/Delete: Admin can manage any event, CR can manage their own events, Faculty can manage their own events
      const canEdit = isAdmin || (isCR && currentUserId && event.createdBy === currentUserId) || (isFaculty && currentUserId && event.createdBy === currentUserId);
      const canDelete = isAdmin || (isCR && currentUserId && event.createdBy === currentUserId) || (isFaculty && currentUserId && event.createdBy === currentUserId);

      const editButton = canEdit ? `
        <button class="event-edit-btn" data-event-id="${event.id}" title="Edit event">
          <i class="fas fa-edit"></i>
        </button>
      ` : '';

      const deleteButton = canDelete ? `
        <button class="event-delete-btn" data-event-id="${event.id}" title="Delete event">
          <i class="fas fa-trash"></i>
        </button>
      ` : '';

      // Scope badge showing target department
      const scopeLabel = event.department || 'ALL';
      const scopeClass = scopeLabel === 'ALL' ? 'scope-all' : 'scope-dept';

      // "Added by" label
      const addedByLabel = event.createdByName || 'Admin';

      return `
        <div class="event-card" data-event-id="${event.id}">
          <div class="event-date">
            <div class="event-day">${day}</div>
            <div class="event-month">${month}</div>
          </div>
          <div class="event-content">
            <div class="event-header">
              <h3 class="event-title">${event.title || 'Untitled Event'}</h3>
              <span class="event-scope-badge ${scopeClass}">${scopeLabel}</span>
            </div>
            <div class="event-details">
              <div class="event-description">
                <div class="event-description-wrapper">
                  <div class="event-description-text">${Utils.escapeAndLinkify(event.description) || 'No description available.'}</div>
                  <p class="event-added-by event-added-by-hidden">Added by ${addedByLabel}</p>
                  <button type="button" class="event-description-toggle" aria-label="Toggle description">
                    <span class="toggle-text">Show more</span>
                    <i class="fas fa-chevron-down"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="event-actions">
            ${editButton}
            ${deleteButton}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = eventsHTML;

    // Also render to mobile container
    if (mobileContainer) {
      mobileContainer.innerHTML = eventsHTML;
    }
  },

  // Render UITS Event Raiders events
  renderRaiderEvents(events = []) {
    const container = document.getElementById('raider-events-container');
    const mobileContainer = document.getElementById('raider-events-container-mobile');
    const noEventsMsg = document.getElementById('no-raider-events-message');
    const noEventsMsgMobile = document.getElementById('no-raider-events-message-mobile');

    if (!container && !mobileContainer) return;

    if (!events || events.length === 0) {
      if (container) container.innerHTML = '';
      if (mobileContainer) mobileContainer.innerHTML = '';
      if (noEventsMsg) noEventsMsg.style.display = 'block';
      if (noEventsMsgMobile) noEventsMsgMobile.style.display = 'block';
      return;
    }

    if (noEventsMsg) noEventsMsg.style.display = 'none';
    if (noEventsMsgMobile) noEventsMsgMobile.style.display = 'none';

    const eventsHTML = events.map(event => {
      const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
      const day = isNaN(eventDate.getDate()) ? '!' : eventDate.getDate();
      const month = isNaN(eventDate.getTime()) ? 'EVENT' : eventDate.toLocaleDateString('en-US', { month: 'short' });

      // Badges
      const categoryBadge = event.category ? `
        <span class="raider-badge raider-badge-category">
          <i class="fas fa-trophy"></i> ${Utils.escapeHtml(event.category)}
        </span>
      ` : '';

      const deadlineBadge = event.regEndDate ? `
        <span class="raider-badge raider-badge-deadline" title="Registration deadline">
          <i class="fas fa-hourglass-half"></i> Reg: ${Utils.escapeHtml(event.regEndDate)}
        </span>
      ` : '';

      const feeBadge = event.fee ? `
        <span class="raider-badge raider-badge-fee" title="Registration fee">
          <i class="fas fa-tag"></i> ${Utils.escapeHtml(event.fee)}
        </span>
      ` : '';

      const venueBadge = event.venue ? `
        <span class="raider-badge ${event.isOnline ? 'raider-badge-online' : 'raider-badge-venue'}" title="Venue">
          <i class="fas ${event.isOnline ? 'fa-globe' : 'fa-map-marker-alt'}"></i> ${Utils.escapeHtml(event.venue)}
        </span>
      ` : '';

      // Sub-events summary
      const subEventsCount = Array.isArray(event.subEvents) ? event.subEvents.length : 0;
      const subEventsBadge = subEventsCount > 0 ? `
        <div class="raider-subevents-summary">
          <i class="fas fa-layer-group"></i> ${subEventsCount} Contest Segment${subEventsCount > 1 ? 's' : ''}
        </div>
      ` : '';

      // Primary action link
      const targetUrl = event.externalUrl || event.portalUrl || 'https://ou1ts.github.io/events/';

      return `
        <div class="event-card raider-card" data-raid-id="${event.id || ''}">
          <div class="event-date">
            <div class="event-day">${day}</div>
            <div class="event-month">${month}</div>
          </div>
          <div class="event-content">
            <div class="event-header">
              <h3 class="event-title">${Utils.escapeHtml(event.title)}</h3>
            </div>
            <div class="event-details">
              <div class="raider-badge-container">
                ${categoryBadge}
                ${deadlineBadge}
                ${feeBadge}
                ${venueBadge}
              </div>
              ${subEventsBadge}
              <div class="event-description">
                <div class="event-description-wrapper">
                  <div class="event-description-text">${Utils.escapeAndLinkify(event.description) || 'No details available.'}</div>
                  <button type="button" class="event-description-toggle" aria-label="Toggle description">
                    <span class="toggle-text">Show more</span>
                    <i class="fas fa-chevron-down"></i>
                  </button>
                </div>
              </div>
              <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="raider-external-btn" title="View details on UITS Event Raiders">
                <i class="fas fa-external-link-alt"></i> Details
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (container) {
      container.innerHTML = eventsHTML;
    }
    if (mobileContainer) {
      mobileContainer.innerHTML = eventsHTML;
    }
  },

  // Switch mobile events sidebar view between 'internal' and 'raiders'
  switchMobileEventsView(targetView) {
    const internalView = document.getElementById('events-view-internal');
    const raidersView = document.getElementById('events-view-raiders');
    const switchBtn = document.getElementById('events-view-switch-btn');
    const titleText = document.getElementById('events-sidebar-title-text');
    const titleIcon = document.getElementById('events-sidebar-icon');
    const tooltip = document.getElementById('events-sidebar-tooltip');

    if (!internalView || !raidersView || !switchBtn) return;

    try {
      localStorage.setItem('b1t_events_sidebar_view', targetView);
    } catch (e) {
      console.warn('Failed to save events sidebar view state to localStorage:', e);
    }

    const showRaiders = targetView === 'raiders';

    if (showRaiders) {
      internalView.style.display = 'none';
      internalView.classList.remove('active');
      raidersView.style.display = 'flex';
      raidersView.classList.add('active');

      if (titleText) titleText.textContent = 'Event Raiders';
      if (titleIcon) titleIcon.className = 'fas fa-shield-alt';
      if (tooltip) tooltip.setAttribute('data-tooltip', 'Live tech competitions, hackathons, and symposiums from UITS Event Raiders RSS feed.');

      switchBtn.classList.add('active-raiders');
      switchBtn.setAttribute('title', 'Switch to b1t-Sched Events');
      switchBtn.setAttribute('aria-label', 'Switch to b1t-Sched Events');
      const iconSpan = switchBtn.querySelector('.switch-btn-icon');
      if (iconSpan) iconSpan.innerHTML = '<i class="fas fa-chevron-left"></i>';
    } else {
      raidersView.style.display = 'none';
      raidersView.classList.remove('active');
      internalView.style.display = 'flex';
      internalView.classList.add('active');

      if (titleText) titleText.textContent = 'Events';
      if (titleIcon) titleIcon.className = 'fas fa-calendar-alt';
      if (tooltip) tooltip.setAttribute('data-tooltip', 'Official events created by Admin, CR, or Faculty. Check here for general announcements, holidays, and schedules.');

      switchBtn.classList.remove('active-raiders');
      switchBtn.setAttribute('title', 'Switch to UITS Event Raiders');
      switchBtn.setAttribute('aria-label', 'Switch to UITS Event Raiders');
      const iconSpan = switchBtn.querySelector('.switch-btn-icon');
      if (iconSpan) iconSpan.innerHTML = '<i class="fas fa-chevron-right"></i>';
    }
  },

  // Render old/past events
  renderOldEvents(events) {
    const container = document.getElementById('old-events-container');
    const noOldEventsMsg = document.getElementById('no-old-events-message');

    if (!container) return;

    if (events.length === 0) {
      container.innerHTML = '';
      noOldEventsMsg.style.display = 'block';
      return;
    }

    noOldEventsMsg.style.display = 'none';

    container.innerHTML = events.map(event => {
      const eventDate = event.date ? event.date.toDate() : new Date();

      return `
        <div class="old-event-item" data-event-id="${event.id}" style="cursor: pointer;">
          <i class="fas fa-calendar-check completed-icon"></i>
          <div class="event-info">
            <div class="event-title">${event.title || 'Untitled Event'}</div>
            <div class="event-meta">
              ${Utils.formatDateShort(eventDate)}
              ${event.department !== 'ALL' ? ` • ${event.department}` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // Toggle admin and CR controls visibility
  toggleAdminControls(isAdmin, isCR = false, isFaculty = false) {
    // Admin-only controls (events management)
    const adminControls = document.querySelectorAll('.admin-only');
    adminControls.forEach(control => {
      const parentDisplay = window.getComputedStyle(control.parentElement).display;
      if (isAdmin) {
        if (parentDisplay === 'flex' || control.classList.contains('btn')) {
          control.style.display = 'inline-flex';
        } else {
          control.style.display = 'block';
        }
      } else {
        control.style.display = 'none';
      }
    });

    // CR or Admin controls (reset tasks)
    const crOrAdminControls = document.querySelectorAll('.cr-or-admin');
    crOrAdminControls.forEach(control => {
      const parentDisplay = window.getComputedStyle(control.parentElement).display;
      if (isAdmin || isCR) {
        if (parentDisplay === 'flex' || control.classList.contains('btn')) {
          control.style.display = 'inline-flex';
        } else {
          control.style.display = 'block';
        }
      } else {
        control.style.display = 'none';
      }
    });

    // CR, Faculty, or Admin controls (add events)
    const crFacultyOrAdminControls = document.querySelectorAll('.cr-faculty-or-admin');
    crFacultyOrAdminControls.forEach(control => {
      const parentDisplay = window.getComputedStyle(control.parentElement).display;
      if (isAdmin || isCR || isFaculty) {
        if (parentDisplay === 'flex' || control.classList.contains('btn')) {
          control.style.display = 'inline-flex';
        } else {
          control.style.display = 'block';
        }
      } else {
        control.style.display = 'none';
      }
    });

    // Hide CR info message for non-CR/non-Admin/non-Faculty users
    const crInfoMessage = document.getElementById('cr-info-message');
    if (crInfoMessage) {
      crInfoMessage.style.display = (isAdmin || isCR || isFaculty) ? 'none' : 'block';
    }

    // Update Classroom create button visibility for Faculty / CR
    if (typeof Classroom !== 'undefined' && typeof Classroom.updateCreateButtonVisibility === 'function') {
      Classroom.updateCreateButtonVisibility();
    }
  },

  // Toggle blocked user mode (read-only mode)
  toggleBlockedUserMode(isBlocked) {
    const blockedBanner = document.getElementById('blocked-user-banner');
    const addTaskBtn = document.getElementById('add-task-btn');

    if (blockedBanner) {
      blockedBanner.style.display = isBlocked ? 'flex' : 'none';
    }

    // Disable add task button for blocked users
    if (addTaskBtn) {
      if (isBlocked) {
        addTaskBtn.disabled = true;
        addTaskBtn.title = 'Your account has been restricted';
      } else {
        addTaskBtn.disabled = false;
        addTaskBtn.title = '';
      }
    }

    // Add class to body for global styling
    if (isBlocked) {
      document.body.classList.add('user-blocked');
    } else {
      document.body.classList.remove('user-blocked');
    }
  },

  previewCollapseTimer: null,

  // Update admin preview banner and preview tags
  updatePreviewBanner(isPreview, previewRole = '') {
    const banner = document.getElementById('admin-preview-banner');
    const roleText = document.getElementById('admin-preview-role-text');
    const profileExitBtn = document.getElementById('exit-preview-profile-btn');
    const profilePreviewTag = document.getElementById('profile-role-preview-tag');
    const toggleBtn = document.getElementById('admin-preview-toggle-btn');

    if (this.previewCollapseTimer) {
      clearTimeout(this.previewCollapseTimer);
      this.previewCollapseTimer = null;
    }

    if (banner) {
      banner.style.display = isPreview ? 'flex' : 'none';
      if (roleText && isPreview) {
        roleText.textContent = previewRole;
      }

      if (isPreview) {
        // Show expanded initially
        this.minimizePreviewBanner(false);

        // Auto-minimize as just the eye icon after 3 seconds of expanded display
        this.previewCollapseTimer = setTimeout(() => {
          this.minimizePreviewBanner(true);
        }, 3000);
      } else {
        this.minimizePreviewBanner(false);
      }
    }

    if (profileExitBtn) {
      profileExitBtn.style.display = isPreview ? 'inline-flex' : 'none';
    }

    if (profilePreviewTag) {
      profilePreviewTag.style.display = isPreview ? 'inline-block' : 'none';
    }
  },

  // Minimize or expand admin preview banner
  minimizePreviewBanner(minimized = true) {
    const banner = document.getElementById('admin-preview-banner');
    const toggleBtn = document.getElementById('admin-preview-toggle-btn');
    const roleText = document.getElementById('admin-preview-role-text');
    if (!banner) return;

    if (this.previewCollapseTimer) {
      clearTimeout(this.previewCollapseTimer);
      this.previewCollapseTimer = null;
    }

    if (minimized) {
      banner.classList.add('is-minimized');
      if (toggleBtn) {
        const role = roleText ? roleText.textContent : 'Role';
        toggleBtn.setAttribute('title', `Previewing as ${role} (Click to expand)`);
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    } else {
      banner.classList.remove('is-minimized');
      if (toggleBtn) {
        const role = roleText ? roleText.textContent : 'Role';
        toggleBtn.setAttribute('title', `Previewing as ${role} (Click to minimize)`);
        toggleBtn.setAttribute('aria-expanded', 'true');
      }
      // Auto-minimize after 3 seconds of being expanded
      this.previewCollapseTimer = setTimeout(() => {
        this.minimizePreviewBanner(true);
      }, 3000);
    }
  },

  // Toggle admin preview banner expansion
  togglePreviewBanner() {
    const banner = document.getElementById('admin-preview-banner');
    if (!banner) return;
    const isCurrentlyMinimized = banner.classList.contains('is-minimized');

    if (this.previewCollapseTimer) {
      clearTimeout(this.previewCollapseTimer);
      this.previewCollapseTimer = null;
    }

    this.minimizePreviewBanner(!isCurrentlyMinimized);
  },

  // Populate dropdown
  async populateDropdown(elementId, items, selectedValue = null) {
    const dropdown = document.getElementById(elementId);
    if (!dropdown) return;

    // Keep placeholder option if any
    const placeholder = dropdown.querySelector('option[disabled]');
    dropdown.innerHTML = '';

    if (placeholder) {
      dropdown.appendChild(placeholder);
    }

    if (!Array.isArray(items)) {
      return;
    }

    const itemsToRender = [...items];
    if (selectedValue && !itemsToRender.includes(selectedValue) && selectedValue !== 'All' && selectedValue !== 'all' && selectedValue !== '') {
      itemsToRender.push(selectedValue);
    }

    itemsToRender.forEach(item => {
      const option = document.createElement('option');
      option.value = item;
      option.textContent = item;
      if (selectedValue && item === selectedValue) {
        option.selected = true;
      }
      dropdown.appendChild(option);
    });

    if (selectedValue) {
      dropdown.value = selectedValue;
    }
  },

  // Show modal
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  },

  // Hide modal
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  },

  // Show generic item details modal
  showItemDetailsModal(title, contentHTML) {
    const titleEl = document.getElementById('item-details-title');
    const bodyEl = document.getElementById('item-details-body');

    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = contentHTML;

    const closeBtn = document.getElementById('close-item-details-modal');
    if (closeBtn && !closeBtn.dataset.listener) {
      closeBtn.addEventListener('click', () => this.hideModal('item-details-modal'));
      closeBtn.dataset.listener = 'true';
    }
    const modal = document.getElementById('item-details-modal');
    if (modal && !modal.dataset.listener) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.hideModal('item-details-modal');
      });
      modal.dataset.listener = 'true';
    }

    this.showModal('item-details-modal');
  },

  // Toggle events sidebar (mobile)
  toggleEventsSidebar(open) {
    const sidebar = document.getElementById('events-sidebar');
    const overlay = document.getElementById('events-overlay');

    if (sidebar && overlay) {
      if (open) {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      } else {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  },

  // Update FAQ, Contribution, Task Export, User Counter, Note, and Approval Button section visibility based on route
  updateSectionVisibility(routeName, forceAuthStatus = null) {
    const faqSection = document.getElementById('faq-section');
    const contribSection = document.getElementById('contributions-section');
    const taskExportSection = document.getElementById('task-export-section');
    const userCounter = document.getElementById('total-user-counter');
    const noteToggleMobile = document.getElementById('note-toggle');
    const noteButtonDesktop = document.getElementById('note-button-desktop');
    const approvalToggleMobile = document.getElementById('approval-toggle');
    const approvalButtonDesktop = document.getElementById('approval-button-desktop');
    const appFooter = document.getElementById('app-footer');

    // Helper to safely toggle display
    // IMPORTANT: Note & Approval buttons use .mobile-only/.desktop-only classes which have !important
    // To hide them, we must use inline style with !important to override the CSS.
    // To show them, we remove the inline style so the CSS classes take over.
    const setElementVisibility = (el, show) => {
      if (!el) return;
      if (show) {
        el.style.removeProperty('display');
      } else {
        el.style.setProperty('display', 'none', 'important');
      }
    };
    if (routeName === 'dashboard') {
      if (faqSection) faqSection.style.display = 'block';
      if (contribSection) contribSection.style.display = 'block';
      if (taskExportSection) taskExportSection.style.display = 'block';
      if (userCounter) userCounter.style.display = 'block';

      // Show footer and set year only on dashboard
      if (appFooter) {
        appFooter.style.display = 'block';
        const yearSpan = document.getElementById('footer-year');
        if (yearSpan) {
          yearSpan.textContent = new Date().getFullYear();
        }
      }

      // Check auth state for Notes
      let isAuthenticated = false;

      if (forceAuthStatus !== null) {
        isAuthenticated = forceAuthStatus;
      } else {
        const currentUser = (typeof Auth !== 'undefined' ? Auth.getCurrentUser() : null) ||
          (window.auth && window.auth.currentUser) ||
          (window.firebase && firebase.auth().currentUser);
        isAuthenticated = !!currentUser;
      }

      if (isAuthenticated) {
        setElementVisibility(noteToggleMobile, true);
        setElementVisibility(noteButtonDesktop, true);
      } else {
        setElementVisibility(noteToggleMobile, false);
        setElementVisibility(noteButtonDesktop, false);
        setElementVisibility(approvalToggleMobile, false);
        setElementVisibility(approvalButtonDesktop, false);
      }

    } else {
      if (faqSection) faqSection.style.display = 'none';
      if (contribSection) contribSection.style.display = 'none';
      if (taskExportSection) taskExportSection.style.display = 'none';
      if (userCounter) userCounter.style.display = 'none';
      if (appFooter) appFooter.style.display = 'none';

      setElementVisibility(noteToggleMobile, false);
      setElementVisibility(noteButtonDesktop, false);
      setElementVisibility(approvalToggleMobile, false);
      setElementVisibility(approvalButtonDesktop, false);
    }
  }
};
