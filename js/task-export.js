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
   * Helper to format markdown text into plain text for TXT export
   */
  markdownToPlainText(text) {
    if (!text) return '';
    return text
      // Replace [title](url) with "title (url)"
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, '$1 ($2)')
      // Remove bold/italic asterisks
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
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

    // First replace markdown links with styled anchor tags
    let html = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, '<a href="$2" target="_blank" class="pdf-embedded-link">$1</a>');

    // Linkify remaining raw URLs that are not inside href=""
    const rawUrlRegex = /(?<!href="|">)(https?:\/\/[^\s<>"'\)\]]+)/g;
    html = html.replace(rawUrlRegex, '<a href="$1" target="_blank" class="pdf-embedded-link">$1</a>');

    // Bold formatting
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic formatting
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

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
        this.showStatus('Generating PDF document (embedding links)...', 'loading');
        await this.generatePdf(tasks, meta, `b1t-Sched_${safeDept}_${safeScope}${safeFilter}_${fileTimestamp}.pdf`);
        this.showStatus('PDF export generated and downloaded successfully!', 'success');
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
   * Resolve jsPDF constructor from global namespace
   */
  getJsPdfConstructor() {
    if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
      return window.jspdf.jsPDF;
    }
    if (typeof window.jsPDF !== 'undefined') {
      return window.jsPDF;
    }
    if (typeof window.html2pdf !== 'undefined' && typeof window.html2pdf.jsPDF !== 'undefined') {
      return window.html2pdf.jsPDF;
    }
    return null;
  },

  /**
   * Ensures jsPDF library is available, dynamically loading it if needed
   */
  async ensureJsPdfLoaded() {
    let JsPdfClass = this.getJsPdfConstructor();
    if (JsPdfClass) return JsPdfClass;

    // Dynamically inject script if not yet loaded
    await new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src*="jspdf"]');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', (err) => reject(err));
        setTimeout(() => resolve(), 2000);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load jsPDF library from CDN.'));
      document.head.appendChild(script);
    });

    JsPdfClass = this.getJsPdfConstructor();
    if (!JsPdfClass) {
      throw new Error('PDF generation library (jsPDF) could not be initialized.');
    }
    return JsPdfClass;
  },

  /**
   * Parses text into plain text chunks and clickable link tokens
   */
  parseRichTokens(text) {
    if (!text) return [];

    // Match markdown links [title](url) or raw URLs
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)|(https?:\/\/[^\s<>"'\)\]]+)/gi;
    const tokens = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({
          type: 'text',
          text: text.substring(lastIndex, match.index)
        });
      }

      if (match[1] && match[2]) {
        tokens.push({
          type: 'link',
          text: match[1].trim(),
          url: match[2].trim()
        });
      } else if (match[3]) {
        const rawUrl = match[3].trim();
        tokens.push({
          type: 'link',
          text: rawUrl,
          url: rawUrl
        });
      }

      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      tokens.push({
        type: 'text',
        text: text.substring(lastIndex)
      });
    }

    return tokens;
  },

  /**
   * Measures total height needed to render wrapped rich text
   */
  measureRichTextHeight(doc, text, maxWidth, lineHeight, fontSize) {
    if (!text) return 0;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);

    const paragraphs = text.split('\n');
    let lineCount = 0;

    paragraphs.forEach((para) => {
      const trimmed = para.trim();
      if (!trimmed) {
        lineCount += 0.5;
        return;
      }

      const tokens = this.parseRichTokens(trimmed);
      let curX = 0;
      lineCount += 1;

      tokens.forEach(token => {
        if (token.type === 'text') {
          const words = token.text.split(/(\s+)/);
          words.forEach(word => {
            if (!word) return;
            const wordWidth = doc.getTextWidth(word);
            if (curX + wordWidth > maxWidth && curX > 0) {
              lineCount += 1;
              curX = 0;
              if (/^\s+$/.test(word)) return;
            }
            curX += wordWidth;
          });
        } else if (token.type === 'link') {
          const linkWidth = doc.getTextWidth(token.text);
          if (curX + linkWidth > maxWidth && curX > 0) {
            lineCount += 1;
            curX = 0;
          }
          if (linkWidth > maxWidth) {
            const chunks = doc.splitTextToSize(token.text, maxWidth);
            lineCount += Math.max(0, chunks.length - 1);
            curX = doc.getTextWidth(chunks[chunks.length - 1]);
          } else {
            curX += linkWidth;
          }
        }
      });
    });

    return lineCount * lineHeight;
  },

  /**
   * Renders rich text with word wrapping and embedded clickable links in jsPDF
   */
  renderRichTextWithLinks(doc, text, startX, startY, maxWidth, lineHeight, fontSize) {
    if (!text) return startY;

    const paragraphs = text.split('\n');
    let curY = startY;

    paragraphs.forEach((para, pIdx) => {
      if (pIdx > 0) {
        curY += lineHeight * 0.4;
      }
      const trimmed = para.trim();
      if (!trimmed) {
        curY += lineHeight * 0.5;
        return;
      }

      const tokens = this.parseRichTokens(trimmed);
      let curX = startX;

      tokens.forEach(token => {
        if (token.type === 'text') {
          const words = token.text.split(/(\s+)/);
          words.forEach(word => {
            if (!word) return;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(fontSize);
            doc.setTextColor(0, 0, 0); // Black font

            const wordWidth = doc.getTextWidth(word);

            if (curX + wordWidth > startX + maxWidth && curX > startX) {
              curY += lineHeight;
              curX = startX;
              if (/^\s+$/.test(word)) return;
            }

            if (!/^\s+$/.test(word)) {
              doc.text(word, curX, curY);
            }
            curX += wordWidth;
          });
        } else if (token.type === 'link') {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(fontSize);
          doc.setTextColor(11, 94, 215); // Blue link

          const linkText = token.text;
          const linkWidth = doc.getTextWidth(linkText);

          if (curX + linkWidth > startX + maxWidth && curX > startX) {
            curY += lineHeight;
            curX = startX;
          }

          if (linkWidth > maxWidth) {
            const chunks = doc.splitTextToSize(linkText, maxWidth);
            chunks.forEach((chunk, cIdx) => {
              if (cIdx > 0) {
                curY += lineHeight;
                curX = startX;
              }
              const chunkW = doc.getTextWidth(chunk);
              doc.text(chunk, curX, curY);
              doc.setDrawColor(11, 94, 215);
              doc.setLineWidth(0.2);
              doc.line(curX, curY + 0.5, curX + chunkW, curY + 0.5);
              doc.link(curX, curY - (lineHeight * 0.75), chunkW, lineHeight, { url: token.url });
              curX += chunkW;
            });
          } else {
            doc.text(linkText, curX, curY);
            doc.setDrawColor(11, 94, 215);
            doc.setLineWidth(0.2);
            doc.line(curX, curY + 0.5, curX + linkWidth, curY + 0.5);
            doc.link(curX, curY - (lineHeight * 0.75), linkWidth, lineHeight, { url: token.url });
            curX += linkWidth;
          }
        }
      });

      curY += lineHeight;
    });

    return curY;
  },

  /**
   * Generates clean, pure-white PDF export with 120% scale, straight line dividers, and clickable links
   */
  async generatePdf(tasks, meta, filename) {
    const JsPDF = await this.ensureJsPdfLoaded();

    const doc = new JsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2); // 182mm
    const pageBottomLimit = pageHeight - 16;

    // 120% Scaled Typography and Spacing Tokens
    const scale = 1.2;
    const fontTitle = 13.5;
    const fontHeaderBrand = 22;
    const fontCourse = 10.5;
    const fontBody = 10.5;
    const fontMeta = 9.8;
    const fontSmall = 9.0;
    const lineHeightBody = 5.2;

    let y = margin + 2;

    const drawPageHeader = () => {
      // Brand Title (Clickable link to website)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fontHeaderBrand);
      doc.setTextColor(128, 0, 0); // Maroon
      const brandTitle = 'b1t-Sched';
      doc.text(brandTitle, margin, y);
      const brandWidth = doc.getTextWidth(brandTitle);
      doc.link(margin, y - 6, brandWidth, 8, { url: 'https://b1tsched.netlify.app/' });

      // Subtitle
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fontMeta);
      doc.setTextColor(0, 0, 0); // Black font
      doc.text('Academic Task Schedule Export', margin, y + 5.2);

      // Scope on the right
      const scopeText = `EXPORT: ${meta.scope.toUpperCase()}`;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fontCourse);
      doc.setTextColor(128, 0, 0);
      doc.text(scopeText, pageWidth - margin - doc.getTextWidth(scopeText), y);

      // Export Date
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fontSmall);
      doc.setTextColor(0, 0, 0); // Black font
      const dateText = `Generated: ${meta.exportDate}`;
      doc.text(dateText, pageWidth - margin - doc.getTextWidth(dateText), y + 5.2);

      y += 9.5;

      // Summary straight line divider
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.35);
      doc.line(margin, y, pageWidth - margin, y);
      y += 4.8;

      // Summary Info Line (No background box)
      doc.setFontSize(fontMeta);
      doc.setTextColor(0, 0, 0); // Black font
      doc.setFont('helvetica', 'bold');
      doc.text('Department:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(` ${meta.department}   |   Filter: ${meta.filterName}`, margin + doc.getTextWidth('Department:'), y);

      const completedCount = tasks.filter(t => t.isCompleted).length;
      const pendingCount = tasks.length - completedCount;

      const totalText = `Total Tasks: ${meta.totalCount}  |  Completed: ${completedCount}  |  Pending: ${pendingCount}`;
      doc.setFont('helvetica', 'bold');
      doc.text(totalText, pageWidth - margin - doc.getTextWidth(totalText), y);

      y += 4.5;
      doc.setFont('helvetica', 'bold');
      doc.text('Semester / Section:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(` ${meta.semester} (${meta.section})`, margin + doc.getTextWidth('Semester / Section:'), y);

      y += 4.5;
      // Header closing straight line divider
      doc.setDrawColor(128, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
    };

    // Draw header on first page
    drawPageHeader();

    // Central Heading stating the type of the tasks that have been exported
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13.5);
    doc.setTextColor(128, 0, 0); // Maroon central heading
    const centralHeading = meta.filterHeading; // e.g. "EXAM TASKS" or "ALL ACADEMIC TASKS"
    const headingW = doc.getTextWidth(centralHeading);
    doc.text(centralHeading, (pageWidth - headingW) / 2, y);
    y += 4.5;

    doc.setDrawColor(210, 215, 222);
    doc.setLineWidth(0.35);
    doc.line((pageWidth - headingW) / 2 - 10, y, (pageWidth + headingW) / 2 + 10, y);
    y += 7.5;

    let hasRenderedOldTasksHeading = false;

    // Iterate through all tasks
    tasks.forEach((task, index) => {
      // When reaching old tasks in "Export All Tasks", insert page break and Old Tasks heading
      if (task.isOldTask && !hasRenderedOldTasksHeading) {
        hasRenderedOldTasksHeading = true;
        doc.addPage();
        y = margin + 2;

        // Old Tasks Central Heading
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.setTextColor(128, 0, 0); // Maroon
        const oldHeading = 'OLD TASKS';
        const oldHeadingW = doc.getTextWidth(oldHeading);
        doc.text(oldHeading, (pageWidth - oldHeadingW) / 2, y);
        y += 4.5;

        // Subtitle under Old Tasks
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fontMeta);
        doc.setTextColor(0, 0, 0);
        const oldSub = meta.filter !== 'all' ? `Archived & Past ${meta.filterName}` : 'Archived & Past Task History';
        const oldSubW = doc.getTextWidth(oldSub);
        doc.text(oldSub, (pageWidth - oldSubW) / 2, y);
        y += 4.5;

        // Straight line divider
        doc.setDrawColor(128, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
      }

      const typeUpper = (task.type || 'TASK').toUpperCase();
      const course = task.course || 'GENERAL TASK';
      const title = `${index + 1}. ${task.title || 'Untitled Task'}${task.isOldTask ? ' (Archived/Old)' : ''}`;
      const deadline = task.formattedDeadline;
      const target = `${task.department || meta.department} - ${task.semester || meta.semester} (${task.section || meta.section})`;
      const addedBy = `${task.addedByName || 'User'}${task.addedByRole ? ` (${task.addedByRole})` : ''}`;

      const desc = task.description || '';
      const details = task.details || '';
      const links = task.extractedLinks || [];

      // Calculate heights required for this task
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fontTitle);
      const titleLines = doc.splitTextToSize(title, contentWidth);

      const descHeight = desc ? this.measureRichTextHeight(doc, desc, contentWidth, lineHeightBody, fontBody) : 0;
      const detailsHeight = details ? this.measureRichTextHeight(doc, details, contentWidth, lineHeightBody, fontBody) : 0;
      const linksHeight = links.length > 0 ? (5 + (links.length * 5.2)) : 0;

      const taskTotalHeight = 6 + (titleLines.length * 5.5) + 6 + descHeight + detailsHeight + linksHeight + 10;

      // Page break check
      if (y + taskTotalHeight > pageBottomLimit) {
        doc.addPage();
        y = margin;
      }

      // 1. Task Top Line: Course Code | Type | Status
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fontCourse);
      doc.setTextColor(128, 0, 0); // Maroon Course
      doc.text(course.toUpperCase(), margin, y);

      let statusLabel = '[Status: Pending]';
      if (task.status === 'Completed') {
        statusLabel = '[Status: Completed]';
      } else if (task.status === 'Overdue') {
        statusLabel = '[Status: Overdue]';
      } else if (task.isUrgent) {
        statusLabel = `[Status: Due Soon - ${task.daysUntil}d left]`;
      }

      const metaHeaderRight = `TYPE: ${typeUpper}   ${statusLabel}`;
      doc.setFontSize(fontMeta);
      doc.setTextColor(0, 0, 0);
      if (task.status === 'Overdue') {
        doc.setTextColor(185, 28, 28);
      } else if (task.status === 'Completed') {
        doc.setTextColor(21, 128, 61);
      }
      doc.text(metaHeaderRight, pageWidth - margin - doc.getTextWidth(metaHeaderRight), y);

      y += 5.5;

      // 2. Task Title (Bold Black Font - 120% Scaled)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fontTitle);
      doc.setTextColor(0, 0, 0); // Pure black
      titleLines.forEach(tLine => {
        doc.text(tLine, margin, y);
        y += 5.5;
      });

      // 3. Metadata Line: Deadline | Target | Added By
      doc.setFontSize(fontMeta);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Deadline:', margin, y);
      const deadX = margin + doc.getTextWidth('Deadline:') + 1.5;
      doc.setFont('helvetica', 'normal');
      if (task.isUrgent || task.isPastDeadline) {
        doc.setTextColor(185, 28, 28);
        doc.setFont('helvetica', 'bold');
      }
      doc.text(deadline, deadX, y);

      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      const targetLabelX = deadX + doc.getTextWidth(deadline) + 6;
      if (targetLabelX < contentWidth - 45) {
        doc.text('Target:', targetLabelX, y);
        doc.setFont('helvetica', 'normal');
        doc.text(` ${target}`, targetLabelX + doc.getTextWidth('Target:'), y);
      }

      const addedByText = `Added: ${addedBy}`;
      doc.setFont('helvetica', 'normal');
      doc.text(addedByText, pageWidth - margin - doc.getTextWidth(addedByText), y);

      y += 5.5;

      // 4. Description with embedded clickable links
      if (desc) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(fontMeta);
        doc.setTextColor(0, 0, 0);
        doc.text('Description:', margin, y);
        y += 4.8;

        y = this.renderRichTextWithLinks(doc, desc, margin, y, contentWidth, lineHeightBody, fontBody);
        y += 2;
      }

      // 5. Details with embedded clickable links
      if (details) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(fontMeta);
        doc.setTextColor(0, 0, 0);
        doc.text('Details:', margin, y);
        y += 4.8;

        y = this.renderRichTextWithLinks(doc, details, margin, y, contentWidth, lineHeightBody, fontBody);
        y += 2;
      }

      // 6. Attached Links (Clean, tight character spacing, no emojis)
      if (links.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(fontMeta);
        doc.setTextColor(0, 0, 0);
        doc.text('Attached Links:', margin, y);
        y += 4.6;

        links.forEach(link => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(fontSmall);
          doc.setTextColor(0, 0, 0);
          doc.text('Link: ', margin + 2, y);

          const linkPrefixW = doc.getTextWidth('Link: ');
          const linkX = margin + 2 + linkPrefixW;

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(11, 94, 215); // Blue link
          doc.text(link.title, linkX, y);

          const titleW = doc.getTextWidth(link.title);
          doc.setDrawColor(11, 94, 215);
          doc.setLineWidth(0.2);
          doc.line(linkX, y + 0.4, linkX + titleW, y + 0.4);

          // Clickable link annotation
          doc.link(linkX, y - (lineHeightBody * 0.75), titleW, lineHeightBody, { url: link.url });

          y += 4.8;
        });
      }

      y += 4;

      // 7. Straight Line Divider between each task
      if (index < tasks.length - 1) {
        doc.setDrawColor(210, 215, 222);
        doc.setLineWidth(0.4);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
      }
    });

    // Page numbering and footer on every page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fontSmall);
      doc.setTextColor(0, 0, 0); // Black font
      doc.setDrawColor(210, 215, 222);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);

      const footerBrandText = 'b1t-Sched • Academic Task Schedule';
      doc.text(footerBrandText, margin, pageHeight - 6.5);
      const footerBrandWidth = doc.getTextWidth(footerBrandText);
      doc.link(margin, pageHeight - 10, footerBrandWidth, 6, { url: 'https://b1tsched.netlify.app/' });

      const pageNumText = `Page ${i} of ${pageCount}`;
      doc.text(pageNumText, pageWidth - margin - doc.getTextWidth(pageNumText), pageHeight - 6.5);
    }

    // Save/Download the PDF document
    doc.save(filename);
  },

  /**
   * Helper to trigger browser download for text/markdown blobs
   */
  downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
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
