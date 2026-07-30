/**
 * Migration Script: Update User Semesters (Bulk Update)
 * 
 * Usage in Browser:
 * 1. Open browser console on the app.
 * 2. Run `await updateAllUserSemesters()`
 */

async function updateAllUserSemesters() {
    console.log('[Migration] Starting bulk semester update for all users...');
    const db = firebase.firestore();
    let totalProcessed = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let errors = 0;

    const currentCycle = typeof Utils !== 'undefined' && Utils.getSemesterCycle ? Utils.getSemesterCycle() : '2026-07';

    function incSem(currentSem) {
        const SEMESTERS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
        const ALUMNI = 'alumni / special';

        if (!currentSem || currentSem === ALUMNI) return ALUMNI;

        const norm = String(currentSem).trim().toLowerCase();
        let index = SEMESTERS.findIndex(s => s.toLowerCase() === norm);

        if (index === -1) {
            const num = parseInt(norm, 10);
            if (!isNaN(num) && num >= 1 && num <= 8) {
                index = num - 1;
            }
        }

        if (index === -1) return currentSem;

        const newIndex = index + 1;
        if (newIndex >= SEMESTERS.length) {
            return ALUMNI;
        }
        return SEMESTERS[newIndex];
    }

    try {
        const usersSnapshot = await db.collection('users').get();
        console.log(`[Migration] Found ${usersSnapshot.size} user documents.`);

        const docs = usersSnapshot.docs;
        const BATCH_SIZE = 400;

        for (let i = 0; i < docs.length; i += BATCH_SIZE) {
            const chunk = docs.slice(i, i + BATCH_SIZE);
            const batch = db.batch();
            let batchCount = 0;

            for (const doc of chunk) {
                totalProcessed++;
                const userData = doc.data();
                const userId = doc.id;

                // Skip faculty or users without semester
                if (userData.role === 'Faculty' || userData.department === 'Faculty' || !userData.semester) {
                    totalSkipped++;
                    continue;
                }

                // Skip users who manually updated their profile within the last 30 days
                if (userData.lastProfileChange) {
                    const lastChange = userData.lastProfileChange.toDate ? userData.lastProfileChange.toDate() : new Date(userData.lastProfileChange);
                    if (!isNaN(lastChange.getTime())) {
                        const daysSinceChange = (new Date() - lastChange) / (1000 * 60 * 60 * 24);
                        if (daysSinceChange < 30) {
                            console.log(`[Migration] Skipping user ${userData.email || userId}: Profile updated manually ${Math.floor(daysSinceChange)} days ago (30-day cooldown active).`);
                            totalSkipped++;
                            continue;
                        }
                    }
                }

                const currentSem = userData.semester;
                const newSem = incSem(currentSem);

                if (newSem !== currentSem || userData.lastSemesterCycle !== currentCycle) {
                    const docRef = db.collection('users').doc(userId);
                    batch.update(docRef, {
                        semester: newSem,
                        lastSemesterCycle: currentCycle,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    batchCount++;
                    totalUpdated++;
                    console.log(`[Migration] User ${userData.email || userId}: ${currentSem} -> ${newSem}`);
                } else {
                    totalSkipped++;
                }
            }

            if (batchCount > 0) {
                await batch.commit();
                console.log(`[Migration] Committed batch of ${batchCount} user updates.`);
            }
        }

        console.log(`\n========================================`);
        console.log(`[Migration Complete] Summary:`);
        console.log(`  Total Processed: ${totalProcessed}`);
        console.log(`  Total Updated:   ${totalUpdated}`);
        console.log(`  Total Skipped:   ${totalSkipped}`);
        console.log(`  Errors:          ${errors}`);
        console.log(`========================================\n`);

        return { success: true, totalProcessed, totalUpdated, totalSkipped };
    } catch (error) {
        console.error('[Migration Error]:', error);
        return { success: false, error: error.message };
    }
}

if (typeof window !== 'undefined') {
    window.updateAllUserSemesters = updateAllUserSemesters;
    console.log('[Migration] Semester update script loaded. Run "await updateAllUserSemesters()" to execute.');
}
