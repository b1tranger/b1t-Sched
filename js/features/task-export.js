// ============================================
// TASK EXPORT MODULE
// ============================================

const TaskExport = {
  selectedFormat: 'txt',
  isExporting: false,

  init() {
    this.setupEventListeners();
  },

  setupEventListeners() {
    // Open Export Tasks modal button
    const openBtn = document.getElementById('open-task-export-btn');
    if (openBtn) {
      openBtn.addEventListener('click', () => this.openModal());
    }

    // Close modal buttons
    const closeBtn = document.getElementById('close-task-export-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    const cancelBtn = document.getElementById('cancel-task-export-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.closeModal());
    }

    // Export Scope Buttons
    const exportCurrentBtn = document.getElementById('export-current-tasks-btn');
    if (exportCurrentBtn) {
      exportCurrentBtn.addEventListener('click', () => this.handleExport('current'));
    }

    const exportAllBtn = document.getElementById('export-all-tasks-btn');
    if (exportAllBtn) {
      exportAllBtn.addEventListener('click', () => this.handleExport('all'));
    }

    // Format radio pills
    const formatRadios = document.querySelectorAll('input[name="export-format"]');
    formatRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.selectedFormat = e.target.value;
      });
    });
  },

  openModal() {
    this.clearStatus();
    // Default format
    const activeRadio = document.querySelector('input[name="export-format"]:checked');
    if (activeRadio) {
      this.selectedFormat = activeRadio.value;
    }

    // Update modal subtitle with active filter info
    const activeFilter = this.getActiveTaskFilter();
    const subtitleEl = document.querySelector('.export-modal-subtitle');
    if (subtitleEl) {
      if (activeFilter !== 'all') {
        const filterCap = activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1);
        subtitleEl.innerHTML = `Filter Active: <strong style="color: var(--primary-maroon, #800000);">${filterCap} Tasks</strong>. Only <strong>${filterCap}</strong> tasks will be exported.`;
      } else {
        subtitleEl.textContent = 'Choose whether to export your current pending tasks or complete task history, and select your preferred file format.';
      }
    }

    UI.showModal('task-export-modal');
  },

  closeModal() {
    UI.hideModal('task-export-modal');
  },

  /**
   * Retrieves active task filter from dashboard
   */
  getActiveTaskFilter() {
    const checkedRadio = document.querySelector('input[name="task-filter"]:checked');
    if (checkedRadio && checkedRadio.value && checkedRadio.value !== 'all') {
      return checkedRadio.value.toLowerCase().trim();
    }
    if (typeof App !== 'undefined' && App.currentFilter && App.currentFilter !== 'all') {
      return App.currentFilter.toLowerCase().trim();
    }
    return 'all';
  },

  showStatus(message, type = 'info') {
    const statusEl = document.getElementById('task-export-status');
    if (!statusEl) return;

    statusEl.className = `export-status-message ${type}`;
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'loading') icon = 'spinner fa-spin';

    statusEl.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
    statusEl.style.display = 'block';
  },

  clearStatus() {
    const statusEl = document.getElementById('task-export-status');
    if (statusEl) {
      statusEl.style.display = 'none';
      statusEl.textContent = '';
    }
  },

  /**
   * Extracts URLs and markdown links from text
   * Returns array of { title, url }
   */
  extractLinks(text) {
    if (!text) return [];
    const links = [];
    const seenUrls = new Set();

    // 1. Markdown links: [Title](URL)
    const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/gi;
    let match;
    while ((match = mdLinkRegex.exec(text)) !== null) {
      const title = match[1].trim();
      const url = match[2].trim();
      if (!seenUrls.has(url)) {
        seenUrls.add(url);
        links.push({ title: title || url, url });
      }
    }

    // 2. Raw URLs: https://... or http://...
    const rawUrlRegex = /(https?:\/\/[^\s<>"'\)\]]+)/gi;
    while ((match = rawUrlRegex.exec(text)) !== null) {
      const url = match[1].trim();
      if (!seenUrls.has(url)) {
        seenUrls.add(url);
        let title = url;
        try {
          const parsed = new URL(url);
          title = parsed.hostname.replace(/^www\./, '') + (parsed.pathname.length > 1 ? parsed.pathname : '');
        } catch (e) {
          title = url;
        }
        links.push({ title, url });
      }
    }

    return links;
  },

  /**
   * Helper to escape HTML characters in dynamic strings
   */
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Helper to format markdown text into plain text for TXT export
   */
  markdownToPlainText(text) {
    if (!text) return '';
    return text
      // Replace [title](url) with "title (url)"
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, '$1 ($2)')
      // Remove bold: **text** -> text
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      // Remove inline italics: *text* -> text
      .replace(/(^|[^\*])\*([^*\n]+)\*(?!\*)/g, '$1$2')
      // Remove inline code ticks
      .replace(/`([^`]+)`/g, '$1')
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      .trim();
  },

  /**
   * Helper to format markdown text into HTML for PDF rendering with embedded links
   */
  markdownToHtmlWithLinks(text) {
    if (!text) return 'No description available.';

    // First escape raw HTML entities
    let html = this.escapeHtml(text);

    // Replace markdown links with styled anchor tags
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, '<a href="$2" target="_blank" style="color: #0b5ed7; text-decoration: underline;">$1</a>');

    // Linkify remaining raw URLs that are not inside href=""
    const rawUrlRegex = /(?<!href=")(https?:\/\/[^\s<>"'\)\]]+)/g;
    html = html.replace(rawUrlRegex, '<a href="$1" target="_blank" style="color: #0b5ed7; text-decoration: underline;">$1</a>');

    // Bold formatting
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic formatting
    html = html.replace(/(^|[^\*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    return html;
  },

  /**
   * Fetch tasks based on scope ('current' or 'all') and filter by active task type
   */
  async getTasksForExport(scope) {
    const userProfile = (typeof App !== 'undefined' && App.userProfile) ? App.userProfile : Utils.storage.get('userProfile') || {};
    const userId = (typeof Auth !== 'undefined') ? Auth.getUserId() : null;
    const { department, semester, section } = userProfile;
    const isFaculty = (typeof App !== 'undefined' && App.isFaculty) || userProfile.isFaculty || userProfile.role === 'Faculty';

    let userCompletions = (typeof App !== 'undefined' && App.userCompletions) ? App.userCompletions : {};
    if (userId && Object.keys(userCompletions).length === 0 && typeof DB !== 'undefined') {
      try {
        const compRes = await DB.getUserTaskCompletions(userId);
        if (compRes.success) {
          userCompletions = compRes.data || {};
        }
      } catch (e) {
        console.warn('Could not fetch completions:', e);
      }
    }

    let tasks = [];

    if (scope === 'current') {
      // Current pending/active tasks
      if (typeof App !== 'undefined' && Array.isArray(App.currentTasks) && App.currentTasks.length > 0) {
        tasks = App.currentTasks.map(t => ({ ...t, isOldTask: false }));
      } else if (typeof DB !== 'undefined') {
        if (isFaculty && department) {
          const res = await DB.getFacultyTasks(department);
          if (res.success) tasks = (res.data || []).map(t => ({ ...t, isOldTask: false }));
        } else if (department && semester && section) {
          const res = await DB.getTasks(department, semester, section);
          if (res.success) tasks = (res.data || []).map(t => ({ ...t, isOldTask: false }));
        }
      }
    } else {
      // 'all' scope: current + past/old tasks
      const taskMap = new Map();

      // 1. Fetch current active tasks
      let currentList = [];
      if (typeof App !== 'undefined' && Array.isArray(App.currentTasks) && App.currentTasks.length > 0) {
        currentList = App.currentTasks;
      } else if (typeof DB !== 'undefined') {
        if (isFaculty && department) {
          const res = await DB.getFacultyTasks(department);
          if (res.success) currentList = res.data || [];
        } else if (department && semester && section) {
          const res = await DB.getTasks(department, semester, section);
          if (res.success) currentList = res.data || [];
        }
      }
      const currentIds = new Set(currentList.map(t => t.id));
      currentList.forEach(t => {
        if (t && t.id) taskMap.set(t.id, { ...t, isOldTask: false });
      });

      // 2. Fetch old tasks
      if (typeof DB !== 'undefined' && userId && department) {
        try {
          const oldRes = await DB.getOldTasks(userId, department, semester || '', section || '');
          if (oldRes.success && Array.isArray(oldRes.data)) {
            oldRes.data.forEach(t => {
              if (t && t.id) {
                const isAlreadyCurrent = currentIds.has(t.id);
                if (taskMap.has(t.id)) {
                  taskMap.set(t.id, { ...taskMap.get(t.id), ...t, isOldTask: !isAlreadyCurrent });
                } else {
                  taskMap.set(t.id, { ...t, isOldTask: true });
                }
              }
            });
          }
        } catch (e) {
          console.warn('Error fetching old tasks for export:', e);
        }
      }

      tasks = Array.from(taskMap.values());
    }

    // Process tasks to compute status, deadlines, and completion flags
    const now = new Date();
    const processedTasks = tasks.map(task => {
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

      const isCompleted = !!(task.isCompleted || userCompletions[task.id]);

      let status = 'Pending';
      if (isCompleted) {
        status = 'Completed';
      } else if (isPastDeadline) {
        status = 'Overdue';
      }

      return {
        ...task,
        isOldTask: !!task.isOldTask,
        deadlineDate: deadline,
        formattedDeadline: deadline ? Utils.formatDate(deadline) : 'No official Time limit',
        daysUntil,
        isUrgent,
        isPastDeadline,
        isCompleted,
        status,
        extractedLinks: this.extractLinks(`${task.description || ''} ${task.details || ''}`)
      };
    });

    // Apply Active Task Type Filter (e.g. 'exam', 'assignment', 'homework', 'project', 'presentation', 'other')
    const activeFilter = this.getActiveTaskFilter();
    let filteredTasks = processedTasks;
    if (activeFilter !== 'all') {
      filteredTasks = processedTasks.filter(task => (task.type || 'other').toLowerCase() === activeFilter);
    }

    // Sort: Current tasks first, Old tasks second.
    // Within each group, Pending/Overdue tasks first (by deadline ascending), then Completed tasks
    filteredTasks.sort((a, b) => {
      if (!!a.isOldTask !== !!b.isOldTask) {
        return a.isOldTask ? 1 : -1;
      }
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      const aTime = a.deadlineDate ? a.deadlineDate.getTime() : 8640000000000000;
      const bTime = b.deadlineDate ? b.deadlineDate.getTime() : 8640000000000000;
      return aTime - bTime;
    });

    const filterName = activeFilter === 'all'
      ? (scope === 'current' ? 'All Current Tasks' : 'All Task Types')
      : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Tasks`;

    let filterHeading = '';
    if (activeFilter === 'all') {
      filterHeading = scope === 'current' ? 'ALL CURRENT TASKS' : 'ALL ACADEMIC TASKS';
    } else {
      const capFilter = activeFilter.toUpperCase();
      filterHeading = scope === 'current' ? `CURRENT ${capFilter} TASKS` : `ALL ${capFilter} TASKS`;
    }

    return {
      tasks: filteredTasks,
      meta: {
        scope: scope === 'current' ? 'Current Tasks' : 'All Tasks',
        filter: activeFilter,
        filterName: filterName,
        filterHeading: filterHeading,
        totalCount: filteredTasks.length,
        currentCount: filteredTasks.filter(t => !t.isOldTask).length,
        oldCount: filteredTasks.filter(t => t.isOldTask).length,
        department: department || 'All Departments',
        semester: semester || (isFaculty ? 'Faculty' : 'All Semesters'),
        section: section || 'All Sections',
        exportDate: Utils.formatDate(new Date()),
        isFaculty
      }
    };
  },

  /**
   * Main export handler
   */
  async handleExport(scope) {
    if (this.isExporting) return;
    this.isExporting = true;
    this.showStatus(`Fetching ${scope === 'current' ? 'current' : 'all'} tasks...`, 'loading');

    try {
      const { tasks, meta } = await this.getTasksForExport(scope);

      if (tasks.length === 0) {
        const typeNote = meta.filter !== 'all' ? ` matching filter "${meta.filterName}"` : '';
        this.showStatus(`No ${scope === 'current' ? 'current pending' : ''} tasks${typeNote} found to export.`, 'error');
        this.isExporting = false;
        return;
      }

      const fileTimestamp = new Date().toISOString().slice(0, 10);
      const safeDept = (meta.department || 'Tasks').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeScope = scope === 'current' ? 'Current_Tasks' : 'All_Tasks';
      const safeFilter = meta.filter === 'all' ? '' : `_${meta.filter.charAt(0).toUpperCase() + meta.filter.slice(1)}`;

      if (this.selectedFormat === 'txt') {
        this.showStatus('Generating TXT export...', 'loading');
        const txtContent = this.generateTxt(tasks, meta);
        this.downloadFile(`b1t-Sched_${safeDept}_${safeScope}${safeFilter}_${fileTimestamp}.txt`, txtContent, 'text/plain;charset=utf-8');
        this.showStatus('TXT export downloaded successfully!', 'success');
      } else if (this.selectedFormat === 'md') {
        this.showStatus('Generating Markdown export...', 'loading');
        const mdContent = this.generateMd(tasks, meta);
        this.downloadFile(`b1t-Sched_${safeDept}_${safeScope}${safeFilter}_${fileTimestamp}.md`, mdContent, 'text/markdown;charset=utf-8');
        this.showStatus('Markdown export downloaded successfully!', 'success');
      } else if (this.selectedFormat === 'pdf') {
        const filename = `b1t-Sched_${safeDept}_${safeScope}${safeFilter}_${fileTimestamp}.pdf`;
        this.showStatus('Prompting print window (select "Save as PDF" to save selectable vector PDF)...', 'loading');
        await this.printPdf(tasks, meta, filename);
        this.showStatus(`
          <span>Print window opened! In the printer destination, select <strong>Save as PDF</strong> for selectable text.</span>
          <br>
          <span style="font-size: 11.5px; margin-top: 5px; display: inline-block;">
            Need a direct file? <a href="#" id="direct-pdf-download-link" style="color: #0b5ed7; text-decoration: underline; font-weight: 600;">Download Direct PDF (Image-based)</a>
          </span>
        `, 'success');

        const directLink = document.getElementById('direct-pdf-download-link');
        if (directLink) {
          directLink.addEventListener('click', async (e) => {
            e.preventDefault();
            this.showStatus('Generating direct PDF download...', 'loading');
            await this.generatePdf(tasks, meta, filename);
            this.showStatus('Direct PDF export downloaded successfully!', 'success');
          });
        }
      }

      setTimeout(() => {
        if (this.selectedFormat !== 'pdf') {
          // Keep message visible briefly
        }
      }, 2000);
    } catch (error) {
      console.error('Task export error:', error);
      this.showStatus(`Export failed: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      this.isExporting = false;
    }
  },

  /**
   * Generates Plain Text export string
   * Divides tasks with "/////   /////   /////"
   */
  generateTxt(tasks, meta) {
    const header = [
      '======================================================================',
      '                        b1t-Sched Task Export                         ',
      '======================================================================',
      `Export Scope : ${meta.scope}`,
      `Task Filter  : ${meta.filterName}`,
      `Generated on : ${meta.exportDate}`,
      `Department   : ${meta.department}`,
      `Semester     : ${meta.semester}`,
      `Section      : ${meta.section}`,
      `Total Tasks  : ${meta.totalCount}`,
      '======================================================================',
      '',
      `                          ${meta.filterHeading}`,
      '----------------------------------------------------------------------',
      ''
    ].join('\n');

    let hasAddedOldTxtHeader = false;
    const taskBlocks = [];

    tasks.forEach((task, index) => {
      if (task.isOldTask && !hasAddedOldTxtHeader) {
        hasAddedOldTxtHeader = true;
        taskBlocks.push([
          '======================================================================',
          '                              OLD TASKS                               ',
          '======================================================================'
        ].join('\n'));
      }

      const typeUpper = (task.type || 'TASK').toUpperCase();
      let statusStr = task.status;
      if (task.status === 'Pending' && task.isUrgent) {
        statusStr = `Pending (${task.daysUntil} day${task.daysUntil !== 1 ? 's' : ''} left!)`;
      } else if (task.status === 'Overdue') {
        statusStr = 'Overdue / Past Deadline';
      }

      const tagOld = task.isOldTask ? ' [ARCHIVED/OLD]' : '';
      const lines = [
        `[#${index + 1}] [${typeUpper}] ${task.title || 'Untitled Task'}${tagOld}`,
        `Course       : ${task.course || 'No course specified'}`,
        `Status       : ${statusStr}`,
        `Deadline     : ${task.formattedDeadline}`,
        `Academic Info: ${task.department || meta.department} | ${task.semester || meta.semester} | Section ${task.section || meta.section}`,
        `Added By     : ${task.addedByName || 'User'}${task.addedByRole ? ` (${task.addedByRole})` : ''}`
      ];

      if (task.description) {
        lines.push('');
        lines.push('Description:');
        lines.push(this.markdownToPlainText(task.description));
      }

      if (task.details) {
        lines.push('');
        lines.push('Details:');
        lines.push(this.markdownToPlainText(task.details));
      }

      if (task.extractedLinks && task.extractedLinks.length > 0) {
        lines.push('');
        lines.push('Attached Links:');
        task.extractedLinks.forEach(link => {
          lines.push(`  - Link: ${link.title}: ${link.url}`);
        });
      }

      taskBlocks.push(lines.join('\n'));
    });

    // Join tasks with the exact specified separator
    return header + taskBlocks.join('\n\n/////   /////   /////\n\n') + '\n\n======================================================================\n';
  },

  /**
   * Formats a single task card's contents matching the full export format
   */
  formatSingleTask(task) {
    if (!task) return '';
    const typeUpper = (task.type || 'TASK').toUpperCase();
    const now = new Date();
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

    let statusStr = task.isCompleted ? 'Completed' : (isPastDeadline ? 'Overdue / Past Deadline' : (isUrgent ? `Pending (${daysUntil} day${daysUntil !== 1 ? 's' : ''} left!)` : 'Pending'));
    const formattedDeadline = deadline ? (typeof Utils !== 'undefined' && Utils.formatDate ? Utils.formatDate(deadline) : deadline.toLocaleString()) : 'No official Time limit';

    const lines = [
      `[${typeUpper}] ${task.title || 'Untitled Task'}`,
      `Course       : ${task.course || 'No course specified'}`,
      `Status       : ${statusStr}`,
      `Deadline     : ${formattedDeadline}`
    ];

    if (task.id) {
      lines.push(`Task ID      : ${task.id}`);
    }

    const academicParts = [];
    if (task.department) academicParts.push(task.department);
    if (task.semester) academicParts.push(task.semester);
    if (task.section) academicParts.push(`Section ${task.section}`);
    if (academicParts.length > 0) {
      lines.push(`Academic Info: ${academicParts.join(' | ')}`);
    }

    if (task.addedByName || task.addedBy) {
      lines.push(`Added By     : ${task.addedByName || 'User'}${task.addedByRole ? ` (${task.addedByRole})` : ''}`);
    }

    if (task.description) {
      lines.push('');
      lines.push('Description:');
      lines.push(this.markdownToPlainText(task.description));
    }

    if (task.details) {
      lines.push('');
      lines.push('Details:');
      lines.push(this.markdownToPlainText(task.details));
    }

    const links = this.extractLinks(`${task.description || ''} ${task.details || ''}`);
    if (links && links.length > 0) {
      lines.push('');
      lines.push('Attached Links:');
      links.forEach(link => {
        lines.push(`  - Link: ${link.title}: ${link.url}`);
      });
    }

    return lines.join('\n');
  },

  /**
   * Generates Markdown (.md) export string
   * Divides tasks with "/////   /////   /////"
   */
  generateMd(tasks, meta) {
    const header = [
      `# 📋 b1t-Sched Tasks Export`,
      '',
      `> **Scope:** ${meta.scope} | **Filter:** ${meta.filterName} | **Date:** ${meta.exportDate} | **Total Tasks:** ${meta.totalCount}`,
      `> **Department:** ${meta.department} | **Semester:** ${meta.semester} | **Section:** ${meta.section}`,
      '',
      '---',
      '',
      `## 📌 ${meta.filterHeading}`,
      '',
      '---',
      ''
    ].join('\n');

    let hasAddedOldMdHeader = false;
    const taskBlocks = [];

    tasks.forEach((task, index) => {
      if (task.isOldTask && !hasAddedOldMdHeader) {
        hasAddedOldMdHeader = true;
        taskBlocks.push([
          '---',
          '',
          `<div align="center">`,
          '',
          `# 📂 OLD TASKS`,
          '',
          `</div>`,
          '',
          '---'
        ].join('\n'));
      }

      const typeUpper = (task.type || 'TASK').toUpperCase();
      let statusBadge = '⏳ **Pending**';
      if (task.status === 'Completed') {
        statusBadge = '✅ **Completed**';
      } else if (task.status === 'Overdue') {
        statusBadge = '⚠️ **Overdue**';
      } else if (task.isUrgent) {
        statusBadge = `🔥 **Urgent (${task.daysUntil} day${task.daysUntil !== 1 ? 's' : ''} left)**`;
      }

      const tagOld = task.isOldTask ? ' *(Archived/Old Task)*' : '';
      const lines = [
        `### ${index + 1}. ${task.title || 'Untitled Task'} \`${typeUpper}\`${tagOld}`,
        '',
        `- **Course:** ${task.course || 'No course specified'}`,
        `- **Status:** ${statusBadge}`,
        `- **Deadline:** ${task.formattedDeadline}`,
        `- **Department & Section:** ${task.department || meta.department} - ${task.semester || meta.semester} (${task.section || meta.section})`,
        `- **Added By:** ${task.addedByName || 'User'}${task.addedByRole ? ` *(${task.addedByRole})*` : ''}`
      ];

      if (task.description) {
        lines.push('');
        lines.push('#### Description');
        lines.push(task.description);
      }

      if (task.details) {
        lines.push('');
        lines.push('#### Additional Details');
        lines.push(task.details);
      }

      if (task.extractedLinks && task.extractedLinks.length > 0) {
        lines.push('');
        lines.push('#### 🔗 Attached Links');
        task.extractedLinks.forEach(link => {
          lines.push(`- [${link.title}](${link.url})`);
        });
      }

      taskBlocks.push(lines.join('\n'));
    });

    return header + taskBlocks.join('\n\n/////   /////   /////\n\n') + '\n\n---\n*Exported from b1t-Sched*\n';
  },

  /**
   * Prompts the browser's native print window with vector typography,
   * enabling users to "Save as PDF" with 100% selectable and copyable text,
   * full OpenType Indic/Bangla font shaping, active links, and sharp vector rendering.
   */
  async printPdf(tasks, meta, filename) {
    const htmlContent = this.buildPdfHtml(tasks, meta);
    const cleanTitle = (filename || 'b1t-Sched_Tasks_Export.pdf').replace(/\.pdf$/i, '');

    // Remove any previous print frame
    const oldFrame = document.getElementById('task-export-print-frame');
    if (oldFrame) {
      oldFrame.remove();
    }

    const printFrame = document.createElement('iframe');
    printFrame.id = 'task-export-print-frame';
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    printFrame.style.visibility = 'hidden';
    printFrame.setAttribute('aria-hidden', 'true');
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow.document;
    frameDoc.open();
    frameDoc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${this.escapeHtml(cleanTitle)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 10mm 15mm 10mm;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff !important;
      color: #000000 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', 'Vrinda', Arial, sans-serif !important;
    }
    #task-export-pdf-root {
      padding: 0 !important;
      width: 100% !important;
    }
    .task-pdf-item {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      margin-bottom: 12px !important;
    }
    .pdf-page-break-before {
      page-break-before: always !important;
      break-before: page !important;
      margin-top: 20px !important;
    }
    a {
      color: #0b5ed7 !important;
      text-decoration: underline !important;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`);
    frameDoc.close();

    // Wait for fonts to be ready before triggering print dialog
    try {
      if (frameDoc.fonts && frameDoc.fonts.ready) {
        await Promise.race([
          frameDoc.fonts.ready,
          new Promise(r => setTimeout(r, 400))
        ]);
      } else {
        await new Promise(r => setTimeout(r, 300));
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 300));
    }

    // Temporarily set top-level document.title so the browser's "Save as PDF" dialog suggests the descriptive filename
    const originalTitle = document.title;
    document.title = cleanTitle;

    let restored = false;
    const restoreTitle = () => {
      if (!restored) {
        restored = true;
        document.title = originalTitle;
        window.removeEventListener('focus', restoreTitle);
        window.removeEventListener('afterprint', restoreTitle);
      }
    };

    window.addEventListener('focus', restoreTitle);
    window.addEventListener('afterprint', restoreTitle);
    if (printFrame.contentWindow) {
      printFrame.contentWindow.addEventListener('afterprint', restoreTitle);
    }
    setTimeout(restoreTitle, 6000);

    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();

    // Cleanup print frame after print dialog interaction
    setTimeout(() => {
      if (printFrame && printFrame.parentNode) {
        printFrame.remove();
      }
    }, 60000);
  },

  /**
   * Ensures html2pdf library is available, dynamically loading it if needed
   */
  async ensureHtml2PdfLoaded() {
    if (typeof window.html2pdf !== 'undefined') {
      return window.html2pdf;
    }

    // Dynamically inject html2pdf script if not yet loaded
    await new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src*="html2pdf"]');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', (err) => reject(err));
        setTimeout(() => resolve(), 2000);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load html2pdf library from CDN.'));
      document.head.appendChild(script);
    });

    if (typeof window.html2pdf === 'undefined') {
      throw new Error('PDF generation library (html2pdf) could not be initialized.');
    }
    return window.html2pdf;
  },

  /**
   * Builds the HTML template string for PDF rendering with full Unicode / Bangla font support
   */
  buildPdfHtml(tasks, meta) {
    const completedCount = tasks.filter(t => t.isCompleted).length;
    const pendingCount = tasks.length - completedCount;

    let html = `
      <div id="task-export-pdf-root" style="background-color: #ffffff !important; color: #000000 !important; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'SolaimanLipi', 'Kalpurush', 'Vrinda', Arial, sans-serif !important; box-sizing: border-box; padding: 12px 16px 20px 16px; margin: 0; line-height: 1.45; width: 100%;">
        <!-- Header -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 4px;">
          <tr>
            <td style="text-align: left; vertical-align: top;">
              <a href="https://b1tsched.netlify.app/" target="_blank" style="font-size: 24px; font-weight: bold; color: #800000; text-decoration: none; display: inline-block;">b1t-Sched</a>
              <div style="font-size: 11.5px; color: #000000; margin-top: 2px;">Academic Task Schedule Export</div>
            </td>
            <td style="text-align: right; vertical-align: top;">
              <div style="font-size: 13px; font-weight: bold; color: #800000;">EXPORT: ${this.escapeHtml(meta.scope.toUpperCase())}</div>
              <div style="font-size: 11px; color: #000000; margin-top: 2px;">Generated: ${this.escapeHtml(meta.exportDate)}</div>
            </td>
          </tr>
        </table>

        <div style="border-bottom: 0.5px solid #c8c8c8; margin: 8px 0 6px 0;"></div>

        <table style="width: 100%; border-collapse: collapse; font-size: 11.5px; color: #000000;">
          <tr>
            <td style="text-align: left;">
              <strong style="color: #000000;">Department:</strong> ${this.escapeHtml(meta.department)} &nbsp;|&nbsp; <strong style="color: #000000;">Filter:</strong> ${this.escapeHtml(meta.filterName)}
            </td>
            <td style="text-align: right; font-weight: bold; color: #000000;">
              Total Tasks: ${meta.totalCount} &nbsp;|&nbsp; Completed: ${completedCount} &nbsp;|&nbsp; Pending: ${pendingCount}
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align: left; padding-top: 3px; color: #000000;">
              <strong style="color: #000000;">Semester / Section:</strong> ${this.escapeHtml(meta.semester)} (${this.escapeHtml(meta.section)})
            </td>
          </tr>
        </table>

        <div style="border-bottom: 1.5px solid #800000; margin: 8px 0 12px 0;"></div>

        <div style="text-align: center; margin: 8px 0 14px 0;">
          <div style="font-size: 14.5px; font-weight: bold; color: #800000; letter-spacing: 0.5px;">${this.escapeHtml(meta.filterHeading)}</div>
          <div style="width: 180px; height: 1px; background-color: #d2d7de; margin: 6px auto 0 auto;"></div>
        </div>
    `;

    let hasRenderedOldTasksHeading = false;

    tasks.forEach((task, index) => {
      if (task.isOldTask && !hasRenderedOldTasksHeading) {
        hasRenderedOldTasksHeading = true;
        const oldSub = meta.filter !== 'all' ? `Archived & Past ${this.escapeHtml(meta.filterName)}` : 'Archived & Past Task History';
        html += `
          <div class="pdf-page-break-before" style="page-break-before: always; break-before: page; text-align: center; margin: 20px 0 14px 0;">
            <div style="font-size: 16px; font-weight: bold; color: #800000; letter-spacing: 0.5px;">OLD TASKS</div>
            <div style="font-size: 11.5px; color: #000000; margin-top: 3px;">${oldSub}</div>
            <div style="border-bottom: 1.5px solid #800000; margin: 8px 0 16px 0;"></div>
          </div>
        `;
      }

      const typeUpper = (task.type || 'TASK').toUpperCase();
      const course = task.course || 'GENERAL TASK';
      const title = `${index + 1}. ${task.title || 'Untitled Task'}${task.isOldTask ? ' (Archived/Old)' : ''}`;
      const deadline = task.formattedDeadline;
      const target = `${task.department || meta.department} - ${task.semester || meta.semester} (${task.section || meta.section})`;
      const addedBy = `${task.addedByName || 'User'}${task.addedByRole ? ` (${task.addedByRole})` : ''}`;

      let statusLabel = 'Pending';
      let statusColor = '#000000';
      if (task.status === 'Completed') {
        statusLabel = 'Completed';
        statusColor = '#15803d';
      } else if (task.status === 'Overdue') {
        statusLabel = 'Overdue';
        statusColor = '#b91c1c';
      } else if (task.isUrgent) {
        statusLabel = `Due Soon - ${task.daysUntil}d left`;
        statusColor = '#b91c1c';
      }

      const isDeadAlert = task.isUrgent || task.isPastDeadline;
      const deadColor = isDeadAlert ? '#b91c1c' : '#000000';
      const deadWeight = isDeadAlert ? 'bold' : 'normal';

      html += `
        <div class="task-pdf-item" style="page-break-inside: avoid; break-inside: avoid; margin-bottom: 12px; color: #000000;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 3px;">
            <tr>
              <td style="text-align: left; vertical-align: baseline;">
                <span style="font-size: 12.5px; font-weight: bold; color: #800000; text-transform: uppercase;">${this.escapeHtml(course)}</span>
              </td>
              <td style="text-align: right; vertical-align: baseline;">
                <span style="font-size: 11px; color: ${statusColor}; font-weight: 600;">TYPE: ${this.escapeHtml(typeUpper)} &nbsp;&nbsp; [Status: ${this.escapeHtml(statusLabel)}]</span>
              </td>
            </tr>
          </table>

          <div style="font-size: 15px; font-weight: bold; color: #000000; margin-bottom: 5px; line-height: 1.35;">${this.escapeHtml(title)}</div>

          <table style="width: 100%; border-collapse: collapse; font-size: 11.5px; color: #000000; margin-bottom: 6px;">
            <tr>
              <td style="text-align: left; vertical-align: top;">
                <strong>Deadline:</strong> <span style="color: ${deadColor}; font-weight: ${deadWeight};">${this.escapeHtml(deadline)}</span>
                &nbsp;&nbsp;&nbsp;
                <strong>Target:</strong> ${this.escapeHtml(target)}
              </td>
              <td style="text-align: right; vertical-align: top; white-space: nowrap;">
                Added: ${this.escapeHtml(addedBy)}
              </td>
            </tr>
          </table>
      `;

      if (task.description) {
        html += `
          <div style="margin-top: 5px;">
            <div style="font-size: 11.5px; font-weight: bold; color: #000000; margin-bottom: 2px;">Description:</div>
            <div style="font-size: 12.5px; color: #000000; line-height: 1.45; word-break: break-word;">${this.markdownToHtmlWithLinks(task.description)}</div>
          </div>
        `;
      }

      if (task.details) {
        html += `
          <div style="margin-top: 5px;">
            <div style="font-size: 11.5px; font-weight: bold; color: #000000; margin-bottom: 2px;">Details:</div>
            <div style="font-size: 12.5px; color: #000000; line-height: 1.45; word-break: break-word;">${this.markdownToHtmlWithLinks(task.details)}</div>
          </div>
        `;
      }

      if (task.extractedLinks && task.extractedLinks.length > 0) {
        html += `
          <div style="margin-top: 5px;">
            <div style="font-size: 11.5px; font-weight: bold; color: #000000; margin-bottom: 2px;">Attached Links:</div>
            <ul style="margin: 2px 0 0 18px; padding: 0; font-size: 11.5px; color: #000000;">
        `;
        task.extractedLinks.forEach(link => {
          html += `
            <li style="margin-bottom: 2px;">
              <strong>Link:</strong> <a href="${this.escapeHtml(link.url)}" target="_blank" style="color: #0b5ed7; text-decoration: underline;">${this.escapeHtml(link.title)}</a>
            </li>
          `;
        });
        html += `</ul></div>`;
      }

      if (index < tasks.length - 1) {
        html += `<div style="border-bottom: 0.5px solid #d2d7de; margin: 12px 0;"></div>`;
      }

      html += `</div>`;
    });

    html += `</div>`;
    return html;
  },

  /**
   * Generates clean, pure-white PDF export with 120% scale, straight line dividers, clickable links,
   * and full Unicode / Bangla (Bengali) font rendering support.
   */
  async generatePdf(tasks, meta, filename) {
    const html2pdfLib = await this.ensureHtml2PdfLoaded();

    const htmlContent = this.buildPdfHtml(tasks, meta);

    const opt = {
      margin: [10, 10, 16, 10], // mm: top, right, bottom, left
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      enableLinks: true,
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        logging: false
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: {
        mode: ['css', 'legacy']
      }
    };

    await html2pdfLib()
      .set(opt)
      .from(htmlContent)
      .toPdf()
      .get('pdf')
      .then(pdf => {
        const pageCount = pdf.internal.getNumberOfPages();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const marginX = 10;
        const footerY = pageHeight - 6.5;

        for (let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8.5);
          pdf.setTextColor(110, 110, 110);
          pdf.setDrawColor(210, 215, 222);
          pdf.setLineWidth(0.3);

          // Bottom line divider
          pdf.line(marginX, pageHeight - 11, pageWidth - marginX, pageHeight - 11);

          // Brand footer with clickable link
          const footerBrandText = 'b1t-Sched • Academic Task Schedule';
          pdf.text(footerBrandText, marginX, footerY);
          const brandWidth = pdf.getTextWidth(footerBrandText);
          pdf.link(marginX, pageHeight - 10, brandWidth, 5.5, { url: 'https://b1tsched.netlify.app/' });

          // Page number
          const pageNumText = `Page ${i} of ${pageCount}`;
          pdf.text(pageNumText, pageWidth - marginX - pdf.getTextWidth(pageNumText), footerY);
        }
      })
      .save();
  },

  /**
   * Helper to trigger browser download for text/markdown blobs with UTF-8 BOM
   */
  downloadFile(filename, content, mimeType) {
    const blob = new Blob(['\uFEFF' + content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
};
