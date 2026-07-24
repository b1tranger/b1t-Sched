import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      value = value.trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'b1t-sched';
const API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyAMc_2g2zK8DYbugsaf4JEYWCYftoxIdkE';
const CURRENT_CYCLE = '2026-07';

const adminEmail = process.argv[2] || process.env.ADMIN_EMAIL || '';
const adminPassword = process.argv[3] || process.env.ADMIN_PASSWORD || '';

const SEMESTERS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
const ALUMNI = 'alumni / special';

function incrementSemester(currentSem) {
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

async function getAuthToken() {
  if (!adminEmail || !adminPassword) {
    console.log('[Migration Script] No admin credentials provided in CLI arguments or .env (ADMIN_EMAIL, ADMIN_PASSWORD).');
    console.log('[Migration Script] Attempting unauthenticated request...');
    return null;
  }

  console.log(`[Migration Script] Authenticating as ${adminEmail}...`);
  const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
  const res = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword,
      returnSecureToken: true
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[Migration Script] Authentication failed:`, errText);
    return null;
  }

  const data = await res.json();
  console.log('[Migration Script] Authenticated successfully!');
  return data.idToken;
}

async function runBulkSemesterUpdate() {
  const idToken = await getAuthToken();

  console.log(`[Migration Script] Starting bulk semester update for project: ${PROJECT_ID}...`);
  let pageToken = '';
  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;

  const headers = { 'Content-Type': 'application/json' };
  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  do {
    let url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users?pageSize=300&key=${API_KEY}`;
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Migration Script] Error fetching users from Firestore:`, errText);
      console.log(`\nTip: Run "node scripts/update-semesters.js <admin-email> <admin-password>" or open browser console while logged in as admin and run "await updateAllUserSemesters()".\n`);
      break;
    }

    const data = await res.json();
    const docs = data.documents || [];
    pageToken = data.nextPageToken || '';

    console.log(`[Migration Script] Fetched batch of ${docs.length} users.`);

    for (const doc of docs) {
      totalProcessed++;
      const docName = doc.name; // e.g. projects/b1t-sched/databases/(default)/documents/users/UID
      const userId = docName.split('/').pop();
      const fields = doc.fields || {};

      const role = fields.role ? fields.role.stringValue : '';
      const department = fields.department ? fields.department.stringValue : '';
      const semester = fields.semester ? fields.semester.stringValue : '';

      // Skip Faculty users or users without a semester
      if (role === 'Faculty' || department === 'Faculty' || !semester) {
        totalSkipped++;
        continue;
      }

      const newSemester = incrementSemester(semester);

      // Perform update via Firestore REST API
      const patchUrl = `https://firestore.googleapis.com/v1/${docName}?updateMask.fieldPaths=semester&updateMask.fieldPaths=lastSemesterCycle&key=${API_KEY}`;
      
      const patchBody = {
        fields: {
          ...fields,
          semester: { stringValue: newSemester },
          lastSemesterCycle: { stringValue: CURRENT_CYCLE }
        }
      };

      const patchRes = await fetch(patchUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(patchBody)
      });

      if (patchRes.ok) {
        totalUpdated++;
        console.log(`  ✅ Updated ${fields.email ? fields.email.stringValue : userId}: ${semester} -> ${newSemester}`);
      } else {
        const patchErr = await patchRes.text();
        console.error(`  ❌ Failed updating ${userId}:`, patchErr);
      }
    }
  } while (pageToken);

  console.log(`\n========================================`);
  console.log(`[Migration Script] Summary:`);
  console.log(`  Total Processed: ${totalProcessed}`);
  console.log(`  Total Updated:   ${totalUpdated}`);
  console.log(`  Total Skipped:   ${totalSkipped}`);
  console.log(`========================================\n`);
}

runBulkSemesterUpdate().catch(err => {
  console.error('Migration script failed:', err);
  process.exit(1);
});
