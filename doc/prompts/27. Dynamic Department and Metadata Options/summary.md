<!--
tags: [metadata, dynamic-departments, semester-config, schema-flexibility, v2.49.1]
-->

# Session Summary - 27. Dynamic Department and Metadata Options

## Metadata
- **Session Index**: 27
- **Session Title**: Dynamic Department and Metadata Options
- **Current Version**: `v2.49.1`
- **Date**: August 2026

---

## User Goals & Directives
1. **Make departments, semesters, and sections dynamic from Firestore metadata/options document instead of hardcoded arrays.**: Make departments, semesters, and sections dynamic from Firestore metadata/options document instead of hardcoded arrays.
2. **Allow platform Administrators to add new academic departments and section codes without code redeployments.**: Allow platform Administrators to add new academic departments and section codes without code redeployments.
3. **Update onboarding dropdowns to reflect dynamic metadata.**: Update onboarding dropdowns to reflect dynamic metadata.

---

## Key Technical Decisions & Architecture
1. Created metadata/departments and metadata/sections Firestore collection references.
2. Added Utils.getDepartments() and Utils.getSections() with local fallback defaults.
3. Dynamically populated all <select> elements across onboarding, profile, and task creation.

---

## Files Modified & Created
- `27. Dynamic Department and Metadata Options.md`

---

## Verification
- Verified core functionality and responsive UI presentation.
- All regression and syntax validations passed.
