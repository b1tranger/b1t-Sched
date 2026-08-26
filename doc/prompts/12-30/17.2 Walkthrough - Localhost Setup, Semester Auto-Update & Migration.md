# Walkthrough - Localhost Setup, Semester Auto-Update & Migration

All three requested tasks have been implemented and verified:

1. **Localhost & Live Domain Configuration**
2. **Profile Logic for Auto-Updating Semesters (January / July Transitions & Readonly `alumni / special` Option)**
3. **Bulk User Semester Update Utility & Migration Scripts**

---

## Changes Made

### Localhost & Environment Configuration

- **[.env](file:///c:/Users/.../Documents/GitHub/%5BoU1TS%5D/b1t-Sched/.env)** & **[.env.example](file:///c:/Users/.../Documents/GitHub/%5BoU1TS%5D/b1t-Sched/.env.example)**
  Created `.env` with Firebase configuration keys and `.env.example` as a setup template.
- **[inject-env.js](file:///c:/Users/.../Documents/GitHub/%5BoU1TS%5D/b1t-Sched/inject-env.js)**
  Added `.env` file parsing so running `node inject-env.js` locally populates `js/firebase-config.js`. Executed injection to populate `js/firebase-config.js`.
- **[package.json](file:///c:/Users/.../Documents/GitHub/%5BoU1TS%5D/b1t-Sched/package.json)**
  Added `"dev"`, `"start"`, and `"update-semesters"` script commands.
- **[js/pwa-init.js](file:///c:/Users/.../Documents/GitHub/%5BoU1TS%5D/b1t-Sched/js/pwa-init.js)**
  Updated service worker host verification to allow `127.0.0.1` alongside `localhost`.

### Semester Auto-Update & Profile Logic

- **[js/utils.js](file:///c:/Users/.../Documents/GitHub/%5BoU1TS%5D/b1t-Sched/js/utils.js)**
  Added `getSemesterCycle(date)`, `getElapsedSemesterCycles(lastCycle, currentCycle)`, and `incrementSemester(currentSem, steps)`.
- **[js/db.js](file:///c:/Users/.../Documents/GitHub/%5BoU1TS%5D/b1t-Sched/js/db.js)**
  Updated `getSemesters()` to include `'alumni / special'` in the semester list, and updated `createUserProfile` to set initial `lastSemesterCycle`.
- **[js/profile.js](file:///c:/Users/.../Documents/GitHub/%5BoU1TS%5D/b1t-Sched/js/profile.js)**
  Updated profile dropdown loading to set `#profile-semester` as `disabled` / readonly if user has reached `'alumni / special'`, preventing further edits.
- **[js/app.js](file:///c:/Users/.../Documents/GitHub/%5BoU1TS%5D/b1t-Sched/js/app.js)**
  Added `checkAndUpdateUserSemester(userId, profileData)` called on profile load. When a new July (`YYYY-07`) or January (`YYYY-01`) semester cycle starts, student semesters auto-increment by elapsed cycles up to `'alumni / special'`.

### Migration Scripts

- **[js/update-user-semesters.js](file:///c:/Users/.../Documents/GitHub/%5BoU1TS%5D/b1t-Sched/js/update-user-semesters.js)**
  Created in-browser migration utility exposing `window.updateAllUserSemesters()`.
- **[scripts/update-semesters.js](file:///c:/Users/.../Documents/GitHub/%5BoU1TS%5D/b1t-Sched/scripts/update-semesters.js)**
  Created Node execution script supporting auth credentials for bulk updating all student users in Firestore.
- **[index.html](file:///c:/Users/.../Documents/GitHub/%5BoU1TS%5D/b1t-Sched/index.html)**
  Included `<script src="js/update-user-semesters.js"></script>`.

---

## Verification Results

### Automated Unit Tests
Created and ran `__tests__/semester-utils.test.js` validating all cycle parsing and semester transitions:

```text
Running Semester Utils Unit Tests...
  ✅ PASS: July date produces 2026-07 cycle
  ✅ PASS: January date produces 2026-01 cycle
  ✅ PASS: June 30 date produces 2026-01 cycle
  ✅ PASS: 2026-01 to 2026-07 is 1 cycle
  ✅ PASS: 2026-01 to 2027-01 is 2 cycles
  ✅ PASS: Same cycle is 0 elapsed
  ✅ PASS: 1st -> 2nd
  ✅ PASS: 7th -> 8th
  ✅ PASS: 8th -> alumni / special
  ✅ PASS: alumni / special stays alumni / special
  ✅ PASS: 1st + 2 steps -> 3rd
Semester Utils Unit Tests completed successfully.
```

### Environment Injection Verification
Verified `js/firebase-config.js` is populated cleanly with configuration keys.
