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

    // Config
    colors: {
        0: '#ebedf0',
        1: '#9be9a8',
        2: '#40c463',
        3: '#30a14e',
        4: '#216e39'
    },

    init() {
        // Will be called by App.init()
        console.log('Initializing TimelineUI...');
        this.injectModal();
        this.setupEventListeners();
    },

    injectModal() {
        // Inject modal HTML if not present
        if (document.getElementById('timeline-modal')) return;

        const modalHtml = `
        <div id="timeline-modal" class="modal" style="display: none;">
            <div class="modal-content" style="max-width: 900px; width: 95%;">
                <div class="modal-header">
                    <h2>Activity Timeline</h2>
                    <span class="close-btn" id="close-timeline-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="timeline-controls">
                        <div class="filter-group">
                            <label>View:</label>
                            <select id="timeline-view-select" class="form-select" style="width: auto;">
                                <option value="heatmap">Activity Heatmap</option>
                                <option value="bar">Activity Breakdown</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <button id="refresh-timeline-btn" class="btn btn-secondary btn-sm">
                                <i class="fas fa-sync-alt"></i> Refresh
                            </button>
                        </div>
                    </div>

                    <div id="timeline-heatmap-container" class="timeline-viz-container">
                        <!-- Heatmap rendered here -->
                        <div class="heatmap-scroll">
                            <div id="heatmap-grid" class="heatmap-grid"></div>
                        </div>
                        <div class="heatmap-legend">
                            <span>Less</span>
                            <span class="legend-item" style="background:${this.colors[0]}"></span>
                            <span class="legend-item" style="background:${this.colors[1]}"></span>
                            <span class="legend-item" style="background:${this.colors[2]}"></span>
                            <span class="legend-item" style="background:${this.colors[3]}"></span>
                            <span class="legend-item" style="background:${this.colors[4]}"></span>
                            <span>More</span>
                        </div>
                    </div>

                    <div id="timeline-chart-container" class="timeline-viz-container" style="display: none;">
                        <canvas id="timeline-chart"></canvas>
                    </div>

                    <div class="timeline-stats">
                        <div class="stat-card">
                            <h4 id="total-activities">0</h4>
                            <p>Total Activities (Last Year)</p>
                        </div>
                        <div class="stat-card">
                            <h4 id="longest-streak">0</h4>
                            <p>Current Streak (Days)</p>
                        </div>
                    </div>
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
        // Open Modal Button (to be added in index.html)
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

        // Refresh
        const refreshBtn = document.getElementById('refresh-timeline-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadData());
        }

        // Close on outside click
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
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

        if (view === 'heatmap') {
            heatmap.style.display = 'block';
            chart.style.display = 'none';
        } else {
            heatmap.style.display = 'none';
            chart.style.display = 'block';
            this.renderBarChart(this.cachedActivities || []);
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
            // Fetch data using the service
            // For now, fetch ALL recent activity for the user's context
            const filters = {
                department: App.userProfile.department,
                semester: null, // Fetch broad context? Or specific? Let's start broad (Dept)
                section: null
            };

            // console.log('[TimelineUI] Fetching data with filters:', filters);
            const result = await TimelineDataService.getActivityData(filters);

            if (result.success) {
                this.cachedActivities = result.data;
                this.updateStats(result.data);

                if (result.data.length === 0) {
                    // Handle empty state
                    this.renderEmptyState();
                } else {
                    if (this.currentView === 'heatmap') {
                        this.renderHeatmap(result.data);
                    } else {
                        this.renderBarChart(result.data);
                    }
                }
            } else {
                console.error('[TimelineUI] Failed to load timeline data:', result.error);
                this.showError('Failed to load activity data. Please try again later.');
            }
        } catch (err) {
            console.error('[TimelineUI] Unexpected error loading data:', err);
            this.showError('An unexpected error occurred.');
        } finally {
            // Remove loading state
            if (heatmapContainer) heatmapContainer.style.opacity = '1';
            if (chartContainer) chartContainer.style.opacity = '1';
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

    renderHeatmap(activities) {
        const counts = TimelineDataService.aggregateByDate(activities);
        const grid = document.getElementById('heatmap-grid');
        grid.innerHTML = '';

        // Generate dates for last year
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        // Loop every day
        for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
            const dateKey = d.toISOString().split('T')[0];
            const count = counts[dateKey] || 0;

            // Determine color level
            let level = 0;
            if (count > 0) level = 1;
            if (count > 2) level = 2;
            if (count > 5) level = 3;
            if (count > 8) level = 4;

            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            cell.style.backgroundColor = this.colors[level];
            cell.title = `${dateKey}: ${count} activities`; // Tooltip

            // Layout logic: Github uses columns (weeks). CSS Grid can handle auto-flow column?
            // Yes, grid-auto-flow: column; grid-template-rows: repeat(7, 1fr);

            grid.appendChild(cell);
        }
    },

    renderBarChart(activities) {
        const counts = TimelineDataService.aggregateByType(activities);
        const ctx = this.chartCanvas.getContext('2d');

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        if (typeof Chart === 'undefined') {
            console.error('Chart.js library not loaded');
            return;
        }

        const labels = Object.keys(counts).map(k => k.replace('_', ' ').toUpperCase());
        const data = Object.values(counts);

        this.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Activity Count',
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    },

    updateStats(activities) {
        // Total
        const total = activities.length;
        document.getElementById('total-activities').textContent = total;

        // Streak logic
        // ... (Simplified: just count consecutive days backwards from today)
        const counts = TimelineDataService.aggregateByDate(activities);
        let streak = 0;
        const d = new Date();
        while (true) {
            const dateKey = d.toISOString().split('T')[0];
            if (counts[dateKey] > 0) {
                streak++;
                d.setDate(d.getDate() - 1);
            } else {
                // Check if today has 0, but yesterday has > 0? 
                // If today is 0, streak might be valid from yesterday.
                // Simplified: strict streak including today or yesterday.
                if (streak === 0 && d.getDate() === new Date().getDate()) { // If checking today
                    d.setDate(d.getDate() - 1); // Check yesterday
                    continue;
                }
                break;
            }
        }
        document.getElementById('longest-streak').textContent = streak;
    }
};
