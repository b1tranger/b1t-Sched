// ============================================
// UI MODULE
// ============================================

const UI = {
  // Show/hide loading screen
  showLoading(show = true) {
    const loadingScreen = document.getElementById('loading-screen');
    const appContainer = document.getElementById('app');

    if (show) {
      loadingScreen.style.display = 'flex';
      appContainer.style.display = 'none';
    } else {
      loadingScreen.style.display = 'none';
      appContainer.style.display = 'block';
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

  // Update user details card
  updateUserDetailsCard(email, department, semester, section) {
    document.getElementById('user-email').textContent = email;
    document.getElementById('user-department').textContent = `${department} • ${semester} • ${section}`;
  },

  // Render resource links
  renderResourceLinks(links) {
    const container = document.getElementById('resource-links-container');
    if (!container) return;

    if (links.length === 0) {
      container.innerHTML = '<p class="no-data-message">No resource links available for your department.</p>';
      return;
    }

    container.innerHTML = links.map(link => {
      const isPdf = /\.pdf(\?.*)?$/i.test(link.url);
      if (isPdf) {
        return `
      <a href="${link.url}" class="resource-link-card" data-pdf-url="${link.url}" data-pdf-title="${link.title}">
        <div class="resource-icon">${link.icon}</div>
        <h3>${link.title}</h3>
        <p>${link.description}</p>
      </a>
    `;
      }
      return `
      <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="resource-link-card">
        <div class="resource-icon">${link.icon}</div>
        <h3>${link.title}</h3>
        <p>${link.description}</p>
      </a>
    `;
    }).join('');

    // Intercept PDF link clicks
    container.querySelectorAll('.resource-link-card[data-pdf-url]').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const pdfUrl = card.dataset.pdfUrl;
        const pdfTitle = card.dataset.pdfTitle || 'PDF Viewer';

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
                  ${facultyBadge}
                  <span class="task-type-badge ${task.type}">${task.type || 'task'}</span>
                  <div class="task-actions-vertical">
                    ${editButton}
                    ${deleteButton}
                  </div>
                </div>
              </div>
              <div class="task-description">
                <div class="task-description-wrapper">
                  <div class="task-description-text">${Utils.escapeAndLinkify(task.description) || 'No description available.'}</div>
                  ${task.addedBy ? `<p class="task-added-by task-added-by-hidden">Added by ${task.addedByName || 'User'}${task.addedByRole && (task.addedByRole === 'CR' || task.addedByRole === 'Faculty') ? ` <span class="role-badge role-badge-${task.addedByRole.toLowerCase()}">${task.addedByRole}</span>` : ''}${task.section ? ` (${task.section})` : ''}${isFacultyTask && task.department ? ` - ${task.department}` : ''}</p>` : ''}
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
              </div>
            </div>
          </div>
        </div>
      `;
  },

  // Render old tasks (past deadline - compact view)
  renderOldTasks(tasks) {
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
      const deadline = task.deadline ? task.deadline.toDate() : new Date();
      const isCompleted = task.isCompleted || false;
      const completedDate = task.completedAt ? task.completedAt.toDate() : null;

      // Show different icon and style based on completion status
      const iconClass = isCompleted ? 'fa-check-circle completed-icon' : 'fa-clock overdue-icon';
      const statusClass = isCompleted ? 'completed' : 'overdue';

      return `
        <div class="old-task-item ${statusClass}">
          <i class="fas ${iconClass}"></i>
          <div class="task-info">
            <div class="task-title">${task.title || 'Untitled Task'}</div>
            <div class="task-meta">
              ${task.course || ''} • Due: ${Utils.formatDateShort(deadline)}
              ${isCompleted && completedDate ? ` • Completed: ${Utils.formatDateShort(completedDate)}` : ''}
              ${!isCompleted ? ' • <span class="overdue-label">Not completed</span>' : ''}
            </div>
          </div>
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
    const mobileContainer = document.getElementById('events-container-mobile');

    if (!container) return;

    if (events.length === 0) {
      container.innerHTML = '';
      if (mobileContainer) mobileContainer.innerHTML = '';
      noEventsMsg.style.display = 'block';
      return;
    }

    noEventsMsg.style.display = 'none';
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
        <div class="old-event-item">
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

    // Show CR info message for non-CR/non-Admin/non-Faculty users
    const crInfoMessage = document.getElementById('cr-info-message');
    if (crInfoMessage) {
      crInfoMessage.style.display = (isAdmin || isCR || isFaculty) ? 'none' : 'block';
    }

    // Show footer when logged in
    const appFooter = document.getElementById('app-footer');
    if (appFooter) {
      appFooter.style.display = 'block';
      // Set current year
      const yearSpan = document.getElementById('footer-year');
      if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
      }
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

  // Populate dropdown
  async populateDropdown(elementId, items, selectedValue = null) {
    const dropdown = document.getElementById(elementId);
    if (!dropdown) return;

    // Keep placeholder option
    const placeholder = dropdown.querySelector('option[disabled]');
    dropdown.innerHTML = '';

    if (placeholder) {
      dropdown.appendChild(placeholder);
    }

    items.forEach(item => {
      const option = document.createElement('option');
      option.value = item;
      option.textContent = item;
      if (selectedValue && item === selectedValue) {
        option.selected = true;
      }
      dropdown.appendChild(option);
    });
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

  // Update FAQ, Contribution, User Counter, and Note Button section visibility based on route
  updateSectionVisibility(routeName, forceAuthStatus = null) {
    const faqSection = document.getElementById('faq-section');
    const contribSection = document.getElementById('contributions-section');
    const userCounter = document.getElementById('total-user-counter');
    const noteToggleMobile = document.getElementById('note-toggle');
    const noteButtonDesktop = document.getElementById('note-button-desktop');

    // Helper to safely toggle display
    // IMPORTANT: Note buttons use .mobile-only/.desktop-only classes which have !important
    // To hide them, we must use inline style with !important to override the CSS.
    // To show them, we remove the inline style so the CSS classes take over.
    const setNoteVisibility = (el, show) => {
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
      if (userCounter) userCounter.style.display = 'block';

      // Check auth state for Notes
      // 1. Use forceAuthStatus if provided (boolean)
      // 2. Check Auth module (js/auth.js)
      // 3. Check generic window/firebase auth
      let isAuthenticated = false;

      if (forceAuthStatus !== null) {
        isAuthenticated = forceAuthStatus;
        console.log('[UI] Using forced auth status:', isAuthenticated);
      } else {
        // Try to get current user from Auth module or global objects
        const currentUser = (typeof Auth !== 'undefined' ? Auth.getCurrentUser() : null) ||
          (window.auth && window.auth.currentUser) ||
          (window.firebase && firebase.auth().currentUser);
        isAuthenticated = !!currentUser;
        console.log('[UI] Detected auth status:', isAuthenticated);
      }

      if (isAuthenticated) {
        setNoteVisibility(noteToggleMobile, true);
        setNoteVisibility(noteButtonDesktop, true);
      } else {
        setNoteVisibility(noteToggleMobile, false);
        setNoteVisibility(noteButtonDesktop, false);
      }

    } else {
      if (faqSection) faqSection.style.display = 'none';
      if (contribSection) contribSection.style.display = 'none';
      if (userCounter) userCounter.style.display = 'none';

      setNoteVisibility(noteToggleMobile, false);
      setNoteVisibility(noteButtonDesktop, false);
    }
  }
};
