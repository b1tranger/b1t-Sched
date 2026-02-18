/**
 * TimelineDataService Module
 * 
 * Handles fetching and aggregating activity data from Firestore.
 */

const TimelineDataService = {
    // Collection name must match ActivityLogger
    COLLECTION: 'activity_timeline',

    /**
     * Fetch activity logs with filters
     * @param {Object} filters - { department, semester, section }
     * @param {Date} startDate - Start of the range (default: 1 year ago)
     * @param {Date} endDate - End of the range (default: now)
     */
    async getActivityData(filters = {}, startDate = null, endDate = null) {
        try {
            const db = firebase.firestore();
            let query = db.collection(this.COLLECTION);

            // Date filtering
            if (!endDate) endDate = new Date();
            if (!startDate) {
                startDate = new Date();
                startDate.setFullYear(startDate.getFullYear() - 1); // Default 1 year back
            }

            // Apply date range
            query = query.where('timestamp', '>=', startDate)
                .where('timestamp', '<=', endDate);

            // Apply Context Filters (Department, Semester, Section)
            // Note: We need composite indexes for these combinations.
            // Based on rules, users can see:
            // - Admin: ALL
            // - Faculty: Their Dept
            // - CR/Student: Their Dept + Sem + Section (or maybe just Dept wide for broader context?)
            // The rules allow reading if matching user's context.
            // But for the timeline, we might want to see *relevant* activity.

            if (filters.department && filters.department !== 'All') {
                query = query.where('department', '==', filters.department);
            }
            // Semester/Section filtering might be too restrictive for a "Timeline" identifying broader activity
            // But let's support it if passed.
            if (filters.semester && filters.semester !== 'All') {
                query = query.where('semester', '==', filters.semester);
            }
            if (filters.section && filters.section !== 'All') {
                query = query.where('section', '==', filters.section);
            }

            // Order by timestamp desc
            query = query.orderBy('timestamp', 'desc');

            // Limit to avoid pulling too much data? 
            // For a heatmap of a year, 1000 docs might be enough, or maybe 2000.
            query = query.limit(2000);

            const snapshot = await query.get();
            const activities = [];

            snapshot.forEach(doc => {
                const data = doc.data();
                // Convert timestamp to JS Date
                if (data.timestamp && data.timestamp.toDate) {
                    data.timestamp = data.timestamp.toDate();
                } else if (!data.timestamp) {
                    data.timestamp = new Date(); // Fallback
                }
                activities.push({ id: doc.id, ...data });
            });

            return { success: true, data: activities };

        } catch (error) {
            console.error('[TimelineDataService] Failed to fetch data:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Aggregate data for Heatmap (Count per Day)
     * @param {Array} activities 
     * @returns {Object} { 'YYYY-MM-DD': count }
     */
    aggregateByDate(activities) {
        const counts = {};

        activities.forEach(activity => {
            const date = activity.timestamp;
            const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

            counts[dateKey] = (counts[dateKey] || 0) + 1;
        });

        return counts;
    },

    /**
     * Aggregate data for Bar Chart (Count per Activity Type)
     * @param {Array} activities 
     * @returns {Object} { 'task_added': count, 'task_completed': count, ... }
     */
    aggregateByType(activities) {
        const counts = {};

        activities.forEach(activity => {
            const type = activity.activityType;
            // Normalize readable labels if needed
            counts[type] = (counts[type] || 0) + 1;
        });

        return counts;
    }
};
