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

    container.innerHTML = links.map(link => `
      <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="resource-link-card">
        <div class="resource-icon">${link.icon}</div>
        <h3>${link.title}</h3>
        <p>${link.description}</p>
      </a>
    `).join('');
  },

  // Render tasks with checkboxes
  renderTasks(tasks, userCompletions = {}, isAdmin = false, currentUserId = null) {
    const container = document.getElementById('tasks-container');
    const noTasksMsg = document.getElementById('no-tasks-message');
    
    if (!container) return;

    if (tasks.length === 0) {
      container.innerHTML = '';
      noTasksMsg.style.display = 'block';
      return;
    }

    noTasksMsg.style.display = 'none';
    
    // Sort tasks: incomplete first, then by deadline, completed at bottom
    const now = new Date();
    const sortedTasks = [...tasks].sort((a, b) => {
      const aCompleted = userCompletions[a.id] || false;
      const bCompleted = userCompletions[b.id] || false;
      
      // Completed tasks go to bottom
      if (aCompleted !== bCompleted) {
        return aCompleted ? 1 : -1;
      }
      
      // Sort by deadline
      const aDeadline = a.deadline ? a.deadline.toDate() : new Date();
      const bDeadline = b.deadline ? b.deadline.toDate() : new Date();
      return aDeadline - bDeadline;
    });
    
    container.innerHTML = sortedTasks.map(task => {
      const deadline = task.deadline ? task.deadline.toDate() : new Date();
      const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      const isUrgent = daysUntil <= 3 && daysUntil > 0;
      const isPastDeadline = deadline < now;
      const isCompleted = userCompletions[task.id] || false;
      
      // Determine task status class
      let statusClass = '';
      if (isCompleted) {
        statusClass = 'completed';
      } else if (isPastDeadline) {
        statusClass = 'incomplete';
      }

      // User can edit their own tasks, admin can edit all
      const canEdit = isAdmin || (currentUserId && task.addedBy === currentUserId);
      const editButton = canEdit ? `
        <button class="task-edit-btn" data-task-id="${task.id}" title="Edit task">
          <i class="fas fa-edit"></i>
        </button>
      ` : '';

      const deleteButton = isAdmin ? `
        <button class="task-delete-btn" data-task-id="${task.id}" title="Delete task">
          <i class="fas fa-trash"></i>
        </button>
      ` : '';

      return `
        <div class="task-card ${statusClass}" data-task-id="${task.id}">
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
                  <h3 class="task-title">${task.title || 'Untitled Task'}</h3>
                  <p class="task-course">${task.course || 'No course specified'}</p>
                </div>
                <span class="task-type-badge ${task.type}">${task.type || 'task'}</span>
              </div>
              <p class="task-description">${Utils.escapeAndLinkify(task.description) || 'No description available.'}</p>
              ${task.details ? `<p class="task-description"><strong>Details:</strong> ${Utils.escapeAndLinkify(task.details)}</p>` : ''}
              <div class="task-footer">
                <span class="task-deadline ${isUrgent ? 'urgent' : ''} ${isPastDeadline && !isCompleted ? 'urgent' : ''}">
                  <i class="fas fa-clock"></i>
                  ${Utils.formatDate(deadline)}
                  ${isPastDeadline && !isCompleted ? '(Overdue!)' : ''}
                  ${isUrgent && !isPastDeadline ? `(${daysUntil} day${daysUntil !== 1 ? 's' : ''} left!)` : ''}
                </span>
                <div class="task-actions">
                  ${editButton}
                  ${deleteButton}
                </div>
              </div>
              ${task.addedBy ? `<p class="task-added-by">Added by ${task.addedByName || 'User'}${task.section ? ` (${task.section})` : ''}</p>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // Render old/completed tasks (compact view)
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
      const completedDate = task.completedAt ? task.completedAt.toDate() : null;
      
      return `
        <div class="old-task-item">
          <i class="fas fa-check-circle completed-icon"></i>
          <div class="task-info">
            <div class="task-title">${task.title || 'Untitled Task'}</div>
            <div class="task-meta">
              ${task.course || ''} • Due: ${Utils.formatDateShort(deadline)}
              ${completedDate ? ` • Completed: ${Utils.formatDateShort(completedDate)}` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // Render events
  renderEvents(events, isAdmin = false) {
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

      const editButton = isAdmin ? `
        <button class="event-edit-btn" data-event-id="${event.id}" title="Edit event">
          <i class="fas fa-edit"></i>
        </button>
      ` : '';

      const deleteButton = isAdmin ? `
        <button class="event-delete-btn" data-event-id="${event.id}" title="Delete event">
          <i class="fas fa-trash"></i>
        </button>
      ` : '';

      return `
        <div class="event-card" data-event-id="${event.id}">
          <div class="event-date">
            <div class="event-day">${day}</div>
            <div class="event-month">${month}</div>
          </div>
          <div class="event-content">
            <h3 class="event-title">${event.title || 'Untitled Event'}</h3>
            <p class="event-description">${Utils.escapeAndLinkify(event.description) || 'No description available.'}</p>
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
  toggleAdminControls(isAdmin, isCR = false) {
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
  }
};
