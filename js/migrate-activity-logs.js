/**
 * Migration Script: Backfill Activity Logs from Tasks and Events
 * 
 * Usage:
 * 1. Open browser console on the deployed app.
 * 2. Paste this entire script.
 * 3. Run `await migrateActivityLogs()`
 */

async function migrateActivityLogs() {
    console.log('[Migration] Starting activity log backfill...');
    const db = firebase.firestore();
    let totalCreated = 0;
    let totalSkipped = 0;
    let errors = 0;

    const BATCH_SIZE = 400; // Limit is 500, keep safety buffer

    // ==========================================
    // 1. Migrate TASKS
    // ==========================================
    try {
        console.log('[Migration] Fetching tasks...');
        const tasksSnapshot = await db.collection('tasks').get();
        console.log(`[Migration] Found ${tasksSnapshot.size} tasks.`);

        const taskChunks = chunkArray(tasksSnapshot.docs, BATCH_SIZE);

        for (const chunk of taskChunks) {
            const batch = db.batch();
            let batchCount = 0;

            for (const doc of chunk) {
                const task = doc.data();
                const taskId = doc.id;

                // Check if already logged? 
                // Doing a read for every item is expensive. 
                // Instead, we'll just create them. If we want idempotency, 
                // we could use a deterministic ID like `log_${taskId}` but 
                // activity_logs usually have auto-IDs. 
                // Let's use a deterministic ID to avoid duplicates on re-runs: `log_task_${taskId}`

                const logId = `log_task_${taskId}`;
                const logRef = db.collection('activity_logs').doc(logId);

                // Determine timestamp
                let timestamp = task.createdAt;
                if (!timestamp && task.deadline) {
                    // Estimate created at 1 day before deadline if missing
                    const d = new Date(task.deadline);
                    if (!isNaN(d.getTime())) {
                        d.setDate(d.getDate() - 1);
                        timestamp = firebase.firestore.Timestamp.fromDate(d);
                    }
                }
                if (!timestamp) timestamp = firebase.firestore.FieldValue.serverTimestamp();

                const activityData = {
                    activityType: 'task_added',
                    timestamp: timestamp,
                    userId: task.addedBy || 'system',
                    userName: task.addedByName || 'System',
                    userRole: 'Student', // existing tasks might not store role, default to Student
                    department: task.department || null,
                    semester: task.semester || null,
                    section: task.section || null,
                    taskId: taskId,
                    taskTitle: task.title || 'Untitled Task',
                    taskType: task.type || 'Other',
                    taskCourse: task.course || 'General',
                    taskStatus: 'added',
                    metadata: { migrated: true }
                };

                batch.set(logRef, activityData, { merge: true }); // Merge to avoid overwriting if exists? Or just set?
                batchCount++;
            }

            if (batchCount > 0) {
                await batch.commit();
                totalCreated += batchCount;
                console.log(`[Migration] Committed batch of ${batchCount} task logs.`);
            }
        }
    } catch (err) {
        console.error('[Migration] Error migrating tasks:', err);
        errors++;
    }

    // ==========================================
    // 2. Migrate EVENTS
    // ==========================================
    try {
        console.log('[Migration] Fetching events...');
        const eventsSnapshot = await db.collection('events').get();
        console.log(`[Migration] Found ${eventsSnapshot.size} events.`);

        const eventChunks = chunkArray(eventsSnapshot.docs, BATCH_SIZE);

        for (const chunk of eventChunks) {
            const batch = db.batch();
            let batchCount = 0;

            for (const doc of chunk) {
                const event = doc.data();
                const eventId = doc.id;

                const logId = `log_event_${eventId}`;
                const logRef = db.collection('activity_logs').doc(logId);

                let timestamp = event.createdAt;
                if (!timestamp && event.date) {
                    const d = new Date(event.date);
                    if (!isNaN(d.getTime())) {
                        d.setDate(d.getDate() - 1); // 1 day before event
                        timestamp = firebase.firestore.Timestamp.fromDate(d);
                    }
                }
                if (!timestamp) timestamp = firebase.firestore.FieldValue.serverTimestamp();

                const activityData = {
                    activityType: 'event_added',
                    timestamp: timestamp,
                    userId: event.createdBy || 'system',
                    userName: 'System', // Events often lack easy name ref
                    userRole: 'CR', // Events are usually created by CR/Admin
                    department: event.department || null,
                    semester: event.semester || null,
                    section: null, // Events are typically dept or semester wide
                    eventId: eventId,
                    metadata: {
                        migrated: true,
                        title: event.title,
                        date: event.date
                    }
                };

                batch.set(logRef, activityData, { merge: true });
                batchCount++;
            }

            if (batchCount > 0) {
                await batch.commit();
                totalCreated += batchCount;
                console.log(`[Migration] Committed batch of ${batchCount} event logs.`);
            }
        }

    } catch (err) {
        console.error('[Migration] Error migrating events:', err);
        errors++;
    }

    console.log(`[Migration] COMPLETE. Logs created: ${totalCreated}. Errors: ${errors}.`);
    alert(`Migration Complete!\nCreated: ${totalCreated}\nCheck console for details.`);
}

function chunkArray(myArray, chunk_size) {
    var results = [];
    while (myArray.length) {
        results.push(myArray.splice(0, chunk_size));
    }
    return results;
}

// Make globally available
window.migrateActivityLogs = migrateActivityLogs;
console.log('[Migration] Script loaded. Run "await migrateActivityLogs()" to start.');
