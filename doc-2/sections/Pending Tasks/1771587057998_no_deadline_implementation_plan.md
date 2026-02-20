> Original Source: plan/no_deadline_implementation_plan.md

# Fix "No Official Time Limit" Tasks Missing from Pending List

Tasks with no deadline are being moved to Old Tasks instead of staying in Pending Tasks.

## Root Cause

In `db.js`, `createTask()` (line 117) and `updateTask()` (line 427) always call:
```js
deadline: firebase.firestore.Timestamp.fromDate(new Date(data.deadline))
```
When `data.deadline` is `null`, `new Date(null)` produces **epoch time (Jan 1, 1970)**, so the task is stored with a 1970 timestamp — which is always past the 12-hour grace cutoff and gets filtered into Old Tasks.

The filtering logic in `getTasks()` and `getOldTasks()` is already correct — it checks for `null`/missing `deadline` — but the data is never `null` because it's always converted to a timestamp.

## Proposed Changes

### Database Layer

#### [MODIFY] [db.js](file:///e:/Git_WIP/2.%20Personal%20Repositories/b1t-Sched/js/db.js)

1. **`createTask()` (line 117)**: Conditionally set `deadline` — store `null` when no deadline, otherwise convert to Timestamp.

2. **`updateTask()` (line 427)**: Same fix — store `null` when `deadline` is `null`, otherwise convert.

3. **`resetOldTasks()` (line 371)**: Skip tasks with no `deadline` (currently `const deadline = data.deadline ? ... : new Date()` falls through to deleting them as "old").

## Verification Plan

### Manual Verification
Since this is a Firebase-backed web app with no automated test suite, manual testing is needed:

1. Open the app, log in, and **add a new task** with "No Official Time Limit" selected
2. Verify the task appears **in the Pending Tasks list** at the bottom (just above any completed tasks)
3. Refresh the page — the task should **remain in Pending Tasks**
4. Click **"View Old Tasks"** — the no-deadline task should **NOT** appear there
5. Test editing the task to set a future deadline — it should behave like a normal task
6. Test editing it back to "No Official Time Limit" — it should return to the bottom of Pending Tasks
