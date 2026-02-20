# Walkthrough: Fix "No Official Time Limit" Tasks

## Problem
Tasks with no deadline were stored with a **1970 epoch timestamp** instead of `null`, causing them to always appear in Old Tasks instead of Pending Tasks.

## Root Cause
`new Date(null)` → `Thu Jan 01 1970` → always past the 12-hour grace cutoff → filtered into Old Tasks.

## Changes Made

All changes in [db.js](file:///e:/Git_WIP/2.%20Personal%20Repositories/b1t-Sched/js/db.js):

render_diffs(file:///e:/Git_WIP/2.%20Personal%20Repositories/b1t-Sched/js/db.js)

| Method | Line | Fix |
|--------|------|-----|
| `createTask()` | 117 | Store `null` instead of `Timestamp(epoch)` when no deadline |
| `resetOldTasks()` | 371-372 | Skip no-deadline tasks to prevent accidental deletion |
| `updateTask()` | 429 | Store `null` instead of `Timestamp(epoch)` when no deadline |

## Manual Verification Needed
1. Add a task with "No Official Time Limit" → should appear at bottom of Pending Tasks
2. Refresh page → task should remain in Pending Tasks
3. Open Old Tasks → no-deadline task should **not** appear
4. Admin "Reset Old Tasks" → no-deadline tasks should **not** be deleted
