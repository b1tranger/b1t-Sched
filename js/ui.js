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
      <a href="${link.url}" target="_blank" class="resource-link-card">
        <div class="resource-icon">${link.icon}</div>
        <h3>${link.title}</h3>
        <p>${link.description}</p>
      </a>
    `).join('');
  },

  // Render tasks
  renderTasks(tasks) {
    const container = document.getElementById('tasks-container');
    const noTasksMsg = document.getElementById('no-tasks-message');
    
    if (!container) return;

    if (tasks.length === 0) {
      container.innerHTML = '';
      noTasksMsg.style.display = 'block';
      return;
    }

    noTasksMsg.style.display = 'none';
    container.innerHTML = tasks.map(task => {
      const deadline = task.deadline ? task.deadline.toDate() : new Date();
      const now = new Date();
      const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      const isUrgent = daysUntil <= 3;

      return `
        <div class="task-card">
          <div class="task-header">
            <div>
              <h3 class="task-title">${task.title || 'Untitled Task'}</h3>
              <p class="task-course">${task.course || 'No course specified'}</p>
            </div>
            <span class="task-type-badge ${task.type}">${task.type || 'task'}</span>
          </div>
          <p class="task-description">${task.description || 'No description available.'}</p>
          ${task.details ? `<p class="task-description"><strong>Details:</strong> ${task.details}</p>` : ''}
          <div class="task-footer">
            <span class="task-deadline ${isUrgent ? 'urgent' : ''}">
              <i class="fas fa-clock"></i>
              ${Utils.formatDate(deadline)}
              ${isUrgent ? `(${daysUntil} day${daysUntil !== 1 ? 's' : ''} left!)` : ''}
            </span>
          </div>
        </div>
      `;
    }).join('');
  },

  // Render events
  renderEvents(events) {
    const container = document.getElementById('events-container');
    const noEventsMsg = document.getElementById('no-events-message');
    
    if (!container) return;

    if (events.length === 0) {
      container.innerHTML = '';
      noEventsMsg.style.display = 'block';
      return;
    }

    noEventsMsg.style.display = 'none';
    container.innerHTML = events.map(event => {
      const eventDate = event.date ? event.date.toDate() : new Date();
      const day = eventDate.getDate();
      const month = eventDate.toLocaleDateString('en-US', { month: 'short' });

      return `
        <div class="event-card">
          <div class="event-date">
            <div class="event-day">${day}</div>
            <div class="event-month">${month}</div>
          </div>
          <div class="event-content">
            <h3 class="event-title">${event.title || 'Untitled Event'}</h3>
            <p class="event-description">${event.description || 'No description available.'}</p>
          </div>
        </div>
      `;
    }).join('');
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
  }
};
