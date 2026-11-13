<!--
tags: [firebase-api-key, auth-expired, permissions-error, firestore-rules, v2.44.1]
-->

# Session Summary - 18. Firebase API Key Expiration and Live Permissions Error

## Metadata
- **Session Index**: 18
- **Session Title**: Firebase API Key Expiration and Live Permissions Error
- **Current Version**: `v2.44.1`
- **Date**: August 2026

---

## User Goals & Directives
1. **Resolve Firebase auth/api-key-expired runtime exceptions on live deployment.**: Resolve Firebase auth/api-key-expired runtime exceptions on live deployment.
2. **Replace expired Firebase configuration keys with active project credentials.**: Replace expired Firebase configuration keys with active project credentials.
3. **Audit and correct Firestore read/write permissions for authenticated students and faculty.**: Audit and correct Firestore read/write permissions for authenticated students and faculty.

---

## Key Technical Decisions & Architecture
1. Updated firebaseConfig credentials across index.html and service worker.
2. Patched firestore.rules to permit read operations on public notices and tasks.
3. Added fallback error notifications when network or auth credentials fail.

---

## Files Modified & Created
- `18.1 Fix Plan Resolving Firebase auth_api-key-expired Error.md`
- `18.2 Fixing Firebase API Key Expiration.md`
- `18.3 Fixing Live Firebase Permissions Error.md`

---

## Verification
- Verified core functionality and responsive UI presentation.
- All regression and syntax validations passed.
