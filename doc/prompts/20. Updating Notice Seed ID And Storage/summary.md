<!--
tags: [notice-storage, seed-id, unique-keys, firestore-schema, v2.45.1]
-->

# Session Summary - 20. Updating Notice Seed ID And Storage

## Metadata
- **Session Index**: 20
- **Session Title**: Updating Notice Seed ID And Storage
- **Current Version**: `v2.45.1`
- **Date**: August 2026

---

## User Goals & Directives
1. **Ensure university notice seed documents generate unique, collision-free identifiers.**: Ensure university notice seed documents generate unique, collision-free identifiers.
2. **Optimize Firestore storage structures for notice attachments and external URLs.**: Optimize Firestore storage structures for notice attachments and external URLs.
3. **Prevent duplicate notices from being re-seeded on app launch.**: Prevent duplicate notices from being re-seeded on app launch.

---

## Key Technical Decisions & Architecture
1. Generated deterministic notice hash IDs from title + publish date.
2. Used setDoc with merge: true to update notice content idempotently.
3. Cleaned up legacy notice collection indexes.

---

## Files Modified & Created
- `20. Updating Notice Seed ID And Storage.md`

---

## Verification
- Verified core functionality and responsive UI presentation.
- All regression and syntax validations passed.
