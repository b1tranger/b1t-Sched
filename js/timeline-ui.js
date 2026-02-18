/**
 * TimelineUI Module
 * 
 * Manages the UI for the Activity Timeline, including:
 * - Modal interactions
 * - Filtering (User Role, Department)
 * - Visualization rendering (Heatmap & Bar Chart)
 */

const TimelineUI = {
    modal: null,
    heatmapContainer: null,
    chartCanvas: null,
    chartInstance: null,
    currentView: 'heatmap', // 'heatmap' or 'bar'

    // State for navigation
    state: {
        heatmapYear: new Date().getFullYear(),
        chartDate: new Date(), // Tracks month/year for bar chart
        activities: [] // Cache full list for filtering
    },

    // Config
    colors: {
        0: '#ebedf0',
        1: '#9be9a8',
        2: '#40c463',
        3: '#30a14e',
        4: '#216e39'
    },

    init() {
        console.log('Initializing TimelineUI...');
        this.injectModal();
        this.setupEventListeners();
    },

    injectModal() {
        if (document.getElementById('timeline-modal')) return;

        // Generate Year Options (Current - 2 to Current)
        const currentYear = new Date().getFullYear();
        const yearOptions = [currentYear, currentYear - 1, currentYear - 2]
            .map(y => `<option value="${y}">${y}</option>`).join('');

        // Generate Month Options for Chart
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthOptions = months.map((m, i) => `<option value="${i}">${m}</option>`).join('');

        const modalHtml = `
        <div id="timeline-modal" class="modal" style="display: none;">
            <div class="modal-content" style="max-width: 1000px; width: 95%;">
                <div class="modal-header">
                    <h2>Activity Timeline</h2>
                    <span class="close-btn" id="close-timeline-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="timeline-controls">
                        <!-- Left Controls: View Switcher -->
                        <div class="filter-group">
                            <label><i class="fas fa-eye"></i> View:</label>
                            <select id="timeline-view-select" class="form-select">
                                <option value="heatmap">Yearly Heatmap</option>
                                <option value="bar">Monthly Breakdown</option>
                            </select>
                        </div>

                        <!-- Center Controls: Date Navigation (Heatmap) -->
                        <div id="heatmap-controls" class="filter-group">
                            <label>Year:</label>
                            <select id="heatmap-year-select" class="form-select">${yearOptions}</select>
                        </div>

                        <!-- Center Controls: Date Navigation (Chart) - UPDATED -->
                        <div id="chart-controls" class="filter-group" style="display: none;">
                            <select id="chart-month-select" class="form-select" style="margin-right: 5px;">
                                ${monthOptions}
                            </select>
                            <select id="chart-year-select" class="form-select">
                                ${yearOptions}
                            </select>
                        </div>

                        <!-- Right Controls: Refresh -->
                        <div class="filter-group" style="margin-left: auto;">
                            <button id="refresh-timeline-btn" class="btn btn-secondary btn-sm">
                                <i class="fas fa-sync-alt"></i> Refresh
                            </button>
                        </div>
                    </div>

                    <!-- Heatmap Container -->
                    <div id="timeline-heatmap-container" class="timeline-viz-container">
                        <div class="heatmap-wrapper" style="overflow-x: auto; padding: 10px 0 30px 0;height:150px;">
                            <!-- Month Labels Container -->
                            <div id="heatmap-months" class="heatmap-months" style="display: flex; margin-bottom: 5px; font-size: 10px; color: #767676; padding-left: 2px;"></div>
                            
                            <div id="heatmap-grid" class="heatmap-grid" style=""></div>
                        </div>
                        <div class="heatmap-legend" style="margin-top: 10px; display: flex; align-items: center; justify-content: flex-end; font-size: 12px; color: #586069;">
                            <span style="margin-right: 5px">Less</span>
                            <span class="legend-item" style="display:inline-block; width:10px; height:10px; background:${this.colors[0]}; margin:0 2px"></span>
                            <span class="legend-item" style="display:inline-block; width:10px; height:10px; background:${this.colors[1]}; margin:0 2px"></span>
                            <span class="legend-item" style="display:inline-block; width:10px; height:10px; background:${this.colors[2]}; margin:0 2px"></span>
                            <span class="legend-item" style="display:inline-block; width:10px; height:10px; background:${this.colors[3]}; margin:0 2px"></span>
                            <span class="legend-item" style="display:inline-block; width:10px; height:10px; background:${this.colors[4]}; margin:0 2px"></span>
                            <span style="margin-left: 5px">More</span>
                        </div>
                    </div>

                    <!-- Chart Container -->
                    <div id="timeline-chart-container" class="timeline-viz-container" style="display: none; height: 300px;">
                        <canvas id="timeline-chart"></canvas>
                    </div>

                    <!-- Stats Footer -->
                    <div class="timeline-stats" style="margin-top: 20px; display: flex; gap: 20px; border-top: 1px solid #eee; padding-top: 15px;">
                        <div class="stat-card">
                            <h4 id="total-activities">0</h4>
                            <p>Total Activities</p>
                        </div>
                        <div class="stat-card">
                            <h4 id="longest-streak">0</h4>
                            <p>Active Days</p>
                        </div>
                        <div class="stat-card">
                            <h4 id="most-active-day">-</h4>
                            <p>Most Active Day</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Details Popup Template (Hidden) -->
        <div id="timeline-details-popup" class="modal" style="display: none; z-index: 10001;">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 id="popup-date-title">Date</h3>
                    <span class="close-btn" id="close-popup-btn">&times;</span>
                </div>
                <div class="modal-body" id="popup-details-body" style="max-height: 400px; overflow-y: auto;">
                    <!-- Content injected here -->
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        this.modal = document.getElementById('timeline-modal');
        this.heatmapContainer = document.getElementById('timeline-heatmap-container');
        this.chartCanvas = document.getElementById('timeline-chart');
    },

    setupEventListeners() {
        // Open Modal Button
        const openBtn = document.getElementById('open-timeline-btn-dashboard');
        if (openBtn) {
            openBtn.addEventListener('click', () => this.open());
        }

        // Close Modal
        const closeBtn = document.getElementById('close-timeline-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // View Select
        const viewSelect = document.getElementById('timeline-view-select');
        if (viewSelect) {
            viewSelect.addEventListener('change', (e) => this.switchView(e.target.value));
        }

        // Heatmap Year Select
        const yearSelect = document.getElementById('heatmap-year-select');
        if (yearSelect) {
            yearSelect.addEventListener('change', (e) => {
                this.state.heatmapYear = parseInt(e.target.value);
                this.renderHeatmap(this.state.activities);
            });
        }

        // Chart Dropdowns
        const chartMonthSelect = document.getElementById('chart-month-select');
        const chartYearSelect = document.getElementById('chart-year-select');

        if (chartMonthSelect) {
            chartMonthSelect.addEventListener('change', (e) => {
                this.state.chartDate.setMonth(parseInt(e.target.value));
                this.renderBarChart(this.state.activities);
            });
        }

        if (chartYearSelect) {
            chartYearSelect.addEventListener('change', (e) => {
                this.state.chartDate.setFullYear(parseInt(e.target.value));
                this.renderBarChart(this.state.activities);
            });
        }

        // Refresh
        const refreshBtn = document.getElementById('refresh-timeline-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadData());
        }

        // Close Popup
        const closePopupBtn = document.getElementById('close-popup-btn');
        if (closePopupBtn) {
            closePopupBtn.addEventListener('click', () => {
                document.getElementById('timeline-details-popup').style.display = 'none';
            });
        }

        // Close on outside click (Modal & Popup)
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
            const popup = document.getElementById('timeline-details-popup');
            if (e.target === popup) popup.style.display = 'none';
        });
    },

    open() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            this.loadData();
        }
    },

    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    },

    switchView(view) {
        this.currentView = view;
        const heatmap = document.getElementById('timeline-heatmap-container');
        const chart = document.getElementById('timeline-chart-container');
        const heatmapControls = document.getElementById('heatmap-controls');
        const chartControls = document.getElementById('chart-controls');

        if (view === 'heatmap') {
            heatmap.style.display = 'block';
            chart.style.display = 'none';
            heatmapControls.style.display = 'block';
            chartControls.style.display = 'none';
            this.renderHeatmap(this.state.activities);
        } else {
            heatmap.style.display = 'none';
            chart.style.display = 'block';
            heatmapControls.style.display = 'none';
            chartControls.style.display = 'flex'; // Flex for centering
            this.renderBarChart(this.state.activities);
        }
    },

    async loadData() {
        if (!App.userProfile) return;

        const heatmapContainer = document.getElementById('timeline-heatmap-container');
        const chartContainer = document.getElementById('timeline-chart-container');

        // Show loading state
        if (heatmapContainer) heatmapContainer.style.opacity = '0.5';
        if (chartContainer) chartContainer.style.opacity = '0.5';

        try {
            // Fetch ALL activity (global view)
            const filters = {
                department: 'All', // Request global data
                semester: 'All',
                section: 'All'
            };

            const result = await TimelineDataService.getActivityData(filters);

            if (result.success) {
                this.state.activities = result.data; // Store in state
                this.updateStats(result.data);

                if (this.currentView === 'heatmap') {
                    this.renderHeatmap(this.state.activities);
                } else {
                    this.renderBarChart(this.state.activities);
                }
            } else {
                console.error('[TimelineUI] Failed to load timeline data:', result.error);
                this.showError('Failed to load activity data. Please try again later.');
            }
        } catch (err) {
            console.error('[TimelineUI] Unexpected error loading data:', err);
            this.showError('An unexpected error occurred.');
        } finally {
            if (heatmapContainer) heatmapContainer.style.opacity = '1';
            if (chartContainer) chartContainer.style.opacity = '1';
        }
    },

    renderHeatmap(activities) {
        const counts = TimelineDataService.aggregateByDate(activities);
        const grid = document.getElementById('heatmap-grid');
        const monthsContainer = document.getElementById('heatmap-months');

        if (grid) grid.innerHTML = '';
        if (monthsContainer) monthsContainer.innerHTML = '';

        // Year logic
        const year = this.state.heatmapYear;
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);

        // Adjust start date to the previous Sunday
        const dayOfWeek = startDate.getDay();
        const gridStartDate = new Date(startDate);
        gridStartDate.setDate(startDate.getDate() - dayOfWeek);

        let currentDate = new Date(gridStartDate);
        const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let lastMonth = -1;

        // We need 53-54 weeks
        for (let w = 0; w < 54; w++) {
            const weekCol = document.createElement('div');
            weekCol.className = 'heatmap-week';
            // styles handled by CSS class .heatmap-week

            // Check for month label placement
            let monthFound = -1;
            const tempD = new Date(currentDate);
            for (let i = 0; i < 7; i++) {
                if (tempD.getDate() === 1 && tempD.getFullYear() === year) {
                    monthFound = tempD.getMonth();
                    break;
                }
                tempD.setDate(tempD.getDate() + 1);
            }

            // Force Jan label for the very first week if it contains Jan days
            if (w === 0 && lastMonth === -1) {
                const d2 = new Date(currentDate);
                for (let i = 0; i < 7; i++) {
                    if (d2.getMonth() === 0 && d2.getFullYear() === year) {
                        monthFound = 0;
                        break;
                    }
                    d2.setDate(d2.getDate() + 1);
                }
            }

            if (monthFound !== -1 && monthFound !== lastMonth) {
                if (monthsContainer) {
                    const label = document.createElement('div');
                    label.textContent = monthLabels[monthFound];
                    label.style.position = 'absolute';
                    label.style.left = `${w * 15}px`;
                    monthsContainer.appendChild(label);
                }
                lastMonth = monthFound;
            }

            for (let d = 0; d < 7; d++) {
                const dateKey = currentDate.toISOString().split('T')[0];
                const count = counts[dateKey] || 0;

                const cell = document.createElement('div');
                cell.className = 'heatmap-cell';

                let level = 0;
                if (count > 0) level = 1;
                if (count > 2) level = 2;
                if (count > 5) level = 3;
                if (count > 8) level = 4;

                cell.style.width = '12px';
                cell.style.height = '12px';
                cell.style.borderRadius = '2px';
                cell.style.backgroundColor = this.colors[level];
                cell.title = `${dateKey}: ${count} activities`;
                cell.dataset.date = dateKey;
                cell.dataset.count = count;

                if (count > 0) {
                    cell.style.cursor = 'pointer';
                    cell.addEventListener('click', (e) => this.showDetailsPopup(dateKey, e));
                }

                if (currentDate.getFullYear() !== year) {
                    cell.style.opacity = '0.3';
                }

                weekCol.appendChild(cell);
                currentDate.setDate(currentDate.getDate() + 1);
            }
            grid.appendChild(weekCol);

            if (currentDate > endDate && currentDate.getDay() === 0) break;
        }

        if (monthsContainer) {
            monthsContainer.style.position = 'relative';
            monthsContainer.style.height = '15px';
        }
    },

    showError(message) {
        const grid = document.getElementById('heatmap-grid');
        if (grid) {
            grid.innerHTML = `<div class="error-message" style="grid-column: 1 / -1; color: #d73a49; padding: 20px; text-align: center;">${message}</div>`;
        }
    },

    renderEmptyState() {
        const grid = document.getElementById('heatmap-grid');
        if (grid) {
            grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1; color: #586069; padding: 20px; text-align: center;">No activity recorded for this period.</div>`;
        }
    },

    renderBarChart(activities) {
        const ctx = this.chartCanvas.getContext('2d');
        const monthDate = this.state.chartDate;

        // Update selection if needed (sync state to UI)
        const monthSelect = document.getElementById('chart-month-select');
        const yearSelect = document.getElementById('chart-year-select');
        if (monthSelect) monthSelect.value = monthDate.getMonth();
        if (yearSelect) yearSelect.value = monthDate.getFullYear();

        // Filter activities for this month
        const filtered = activities.filter(a => {
            const d = new Date(a.timestamp);
            return d.getMonth() === monthDate.getMonth() && d.getFullYear() === monthDate.getFullYear();
        });

        // Aggregate by Day (1 to 31)
        const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
        const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const data = new Array(daysInMonth).fill(0);

        filtered.forEach(a => {
            const d = new Date(a.timestamp);
            const day = d.getDate(); // 1-31
            data[day - 1]++;
        });

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        if (typeof Chart === 'undefined') {
            console.error('Chart.js library not loaded');
            return;
        }

        this.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Activities',
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    // Store filters for click event if needed
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                        title: { display: true, text: 'Task Add Count' }
                    },
                    x: {
                        title: { display: true, text: 'Day of Month' }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                const day = context[0].label;
                                return `${monthDate.toLocaleString('default', { month: 'long', year: 'numeric' })} ${day}`;
                            }
                        }
                    }
                },
                onClick: (e, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const day = index + 1;
                        // Construct date string YYYY-MM-DD
                        const y = monthDate.getFullYear();
                        const m = String(monthDate.getMonth() + 1).padStart(2, '0');
                        const d = String(day).padStart(2, '0');
                        const dateKey = `${y}-${m}-${d}`;
                        this.showDetailsPopup(dateKey);
                    }
                }
            }
        });
    },

    showDetailsPopup(dateKey, event = null) {
        // Stop propagation if triggered by event
        if (event && event.stopPropagation) event.stopPropagation();

        const popup = document.getElementById('timeline-details-popup');
        const title = document.getElementById('popup-date-title');
        const body = document.getElementById('popup-details-body');

        if (!popup || !body) return;

        title.textContent = new Date(dateKey).toDateString();

        // Filter activities for this date
        const dayActivities = this.state.activities.filter(a => {
            if (!a.timestamp) return false;
            // Compare YYYY-MM-DD
            const t = new Date(a.timestamp);
            const k = t.toISOString().split('T')[0];
            return k === dateKey;
        });

        if (dayActivities.length === 0) {
            body.innerHTML = '<p class="text-muted text-center">No details available.</p>';
            popup.style.display = 'flex';
            return;
        }

        // Group by Course (or fallback to Title if no course)
        const groups = {};
        dayActivities.forEach(a => {
            const course = a.taskCourse || a.metadata?.title || 'General'; // Use course or title
            if (!groups[course]) groups[course] = [];
            groups[course].push(a);
        });

        let html = '<div class="activity-details-list">';

        for (const [course, items] of Object.entries(groups)) {
            html += `<div class="detail-group" style="margin-bottom: 15px;">
                <h4 style="margin-bottom: 5px; border-bottom: 1px solid #eee; padding-bottom: 3px;">${course} <span class="badge" style="float:right; background:#eee; color:#333;">${items.length}</span></h4>
                <ul style="list-style: none; padding: 0;">`;

            items.forEach(item => {
                const type = item.activityType.replace('_', ' ');
                const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const context = item.department ? `${item.department} ${item.semester || ''} ${item.section || ''}` : 'Global';

                html += `<li style="padding: 5px 0; font-size: 0.9em; border-bottom: 1px dashed #f0f0f0;">
                    <div style="display:flex; justify-content:space-between;">
                        <strong>${item.taskTitle || item.metadata?.title || 'Untitled'}</strong>
                        <span class="text-muted" style="font-size:0.8em;">${time}</span>
                    </div>
                    <div style="font-size: 0.8em; color: #666;">
                        <span style="text-transform: capitalize;">${type}</span> • ${context}
                    </div>
                </li>`;
            });

            html += `</ul></div>`;
        }
        html += '</div>';

        body.innerHTML = html;
        popup.style.display = 'flex';
    },

    updateStats(activities) {
        // Total
        const total = activities.length;
        document.getElementById('total-activities').textContent = total;

        // Streak logic
        const counts = TimelineDataService.aggregateByDate(activities);
        let streak = 0;
        const d = new Date(); // Today

        // Simple streak: count backwards matching consecutive days > 0
        while (true) {
            const dateKey = d.toISOString().split('T')[0];
            if ((counts[dateKey] || 0) > 0) {
                streak++;
                d.setDate(d.getDate() - 1);
            } else {
                if (streak === 0 && d.getDate() === new Date().getDate()) {
                    d.setDate(d.getDate() - 1);
                    continue;
                }
                break;
            }
        }
        document.getElementById('longest-streak').textContent = streak;

        // Most Active Day
        let maxCount = 0;
        let maxDate = '-';
        for (const [date, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count;
                maxDate = date;
            }
        }
        if (maxCount > 0) {
            document.getElementById('most-active-day').textContent = `${new Date(maxDate).toLocaleDateString()} (${maxCount})`;
        } else {
            document.getElementById('most-active-day').textContent = '-';
        }
    }
};
