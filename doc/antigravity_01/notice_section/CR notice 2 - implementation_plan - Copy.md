# CR Notice Enhancements

Three enhancements to the notice system: section merging, timeline integration, and documentation.

## Proposed Changes

### Task-1: Section Merging + Compact Cards + Edit CSS

---

#### Section Merging (B1+B2 → B)

`Utils.getSectionGroup()` already extracts the letter (A1→A). Two changes needed:

#### [MODIFY] [cr-notice.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/cr-notice.js)

- **`subscribeToNotices()`**: Replace `.where('section', '==', userSec)` with `.where('section', 'in', Utils.getSectionsInGroup(userSec))` so B1 users also see B2 notices
- **`submitNotice()`**: Store the **section group** (e.g., `'B'`) instead of the raw section (`'B1'`) — this way both B1 and B2 CRs produce the same target section

> [!IMPORTANT]
> Storing the group letter means the Firestore `create` rule's `request.resource.data.section == getUserSection()` will fail for CRs since their profile says `B1` but we store `B`. We need to update the rules to compare section groups.

#### [MODIFY] [firestore.rules](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/firestore.rules)

- **Read rule**: Change `resource.data.section == getUserSection()` to allow if the first letter of the user's section matches the notice's stored section group  
  - Firestore rules don't have `replace()`, but since we now store the group letter (e.g., `B`), we can check: `resource.data.section == getUserSection()[0:1]` (using string slice)
- **Create rule**: Same pattern — compare `request.resource.data.section` against `getUserSection()[0:1]`
- **Update rule**: Same section group comparison

---

#### Compact Cards + See More

#### [MODIFY] [cr-notice.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/cr-notice.js)

- Update `createNoticeCard()` to wrap description in a `cr-notice-description-wrapper` with:
  - `.cr-notice-description-text` (clamped to 2 lines)
  - "See More" toggle button
- Add `addToggleListeners()` in `addActionListeners()`

#### [MODIFY] [notice.css](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/css/notice.css)

- Add `.cr-notice-description-text` with `line-clamp: 2` + `.expanded` state
- Add `.cr-notice-description-toggle` button styles
- Improve Edit modal styling

---

### Task-2: Timeline Integration

#### [MODIFY] [activity-logger.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/activity-logger.js)

- Add `logNoticeAddition(noticeId, noticeData, userProfile)` — logs `'notice_added'`
- Add `logNoticeDeletion(noticeId, noticeData, userId, userProfile)` — logs `'notice_deleted'`

#### [MODIFY] [cr-notice.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/js/cr-notice.js)

- Call `ActivityLogger.logNoticeAddition()` after `submitNotice()` succeeds
- Call `ActivityLogger.logNoticeDeletion()` after `deleteNotice()` succeeds

---

### Task-3: Documentation  

#### [MODIFY] [DOCUMENTATION.md](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/doc/DOCUMENTATION.md)

- Role permissions table with descriptions
- Recent changes/fixes summary
- Updated Technology Stack  
- Short Guides section

## Verification Plan

### Manual Verification
- Log in as a B1 user, post a notice → verify B2 users can see it
- Test See More toggle on long descriptions
- Test Edit modal with new styling
- Check Activity Timeline for notice entries after posting
- Deploy rules: `firebase deploy --only firestore:rules`
