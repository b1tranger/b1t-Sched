# Repository Rules & Guidelines

## 1. Changelog & History Maintenance
- **Automatic History Updates**: Whenever adding new features, fixing bugs, refactoring components, or altering UI/styles in this codebase, always document the changes in doc/DOCUMENTATION.md (under `## Version History`), changes.json, sw.js#L5-5 (const CACHE_VERSION), and README.md (keeping version, features, and roadmap checklist synchronized with the current release state).
- **Placement & Summaries in Documentation**:
  - In `doc/DOCUMENTATION.md`, record updates exclusively under `## Version History` as concise, high-level summaries (never at the very top of the file before the Table of Contents).
  - Detailed release notes and comprehensive per-change descriptions are maintained in `changes.json` (which powers the in-app changelog modal) and companion walkthrough files in `doc/prompts/`.
- **Version Ranges**: Consolidate patch updates into active minor version ranges (e.g., `v2.53.0 to v2.53.8`) in `changes.json` instead of fragmenting each patch into a separate standalone entry.


## 2. Mandatory Prompt, Plan & Walkthrough Archiving
- **Target Location & Serial Session Folders**:
  - All conversation, prompt, plan, and walkthrough records reside inside [`doc/prompts/`](doc/prompts) in dedicated serial folders named with an incrementing major integer prefix:
    `doc/prompts/<N>. <Session Title>/` (e.g., `doc/prompts/36. Schedule Export Update/`).
  - **Determining `<N>`**: Inspect `doc/prompts/` to find the highest existing major integer prefix across both existing session folders and legacy flat `<N>. ...md` files, and assign `N = N_max + 1` for a new conversation session.
  - **Session Continuity**: Always update **the same session folder** (`doc/prompts/<N>. <Session Title>/`) on each turn or when resuming an existing conversation; do NOT create a new major folder `<N+1>` per turn.
- **Required Files Inside `doc/prompts/<N>. <Session Title>/`**:
  1. **`transcript_full.jsonl`**: An exact, unmodified UTF-8 copy of `<appDataDir>/brain/<conversation-id>/.system_generated/logs/transcript_full.jsonl`. Never truncate, edit, or reformat lines in `transcript_full.jsonl`.
  2. **`conversation.md`**: A verbatim Markdown rendering generated directly from `transcript_full.jsonl`, including every step without summarizing or omitting content: metadata (`Conversation ID`, `Session Folder`, and `Continued From` if applicable), all `USER_INPUT.content`, all `PLANNER_RESPONSE.thinking` verbatim, all `PLANNER_RESPONSE.tool_calls` and tool/system outputs (`GENERIC` / `SYSTEM_MESSAGE`), and all `PLANNER_RESPONSE.content` verbatim.
  3. **`summary.md` (Conversation Summary Markdown)**: Maintained alongside `transcript_full.jsonl` and `conversation.md` in the same folder, preserving the frontmatter tags comment block at the top and summarizing session metadata, user goals, key technical decisions, files modified, verification results, and outcomes.
  4. **Companion Plans & Walkthroughs (Fractional Suffixes Reserved for Plans & Walkthroughs Only)**: Stored in the same `doc/prompts/<N>. <Session Title>/` folder:
     - Implementation plan: `<N>.1 Implementation Plan - <Plan Title>.md` (dual-write whenever creating/updating `implementation_plan.md` before user review)
     - Walkthrough document: `<N>.2 Walkthrough - <Title>.md` (dual-write whenever creating/updating `walkthrough.md` upon completion)
     - Subsequent plans/walkthroughs in the same session: `<N>.3 Implementation Plan - ...`, `<N>.4 Walkthrough - ...`, etc.
- **Update Cadence (Keeping the Archive Current)**:
  - Because the runtime writes a turn's final `PLANNER_RESPONSE` (final `thinking` and `content`) to `transcript_full.jsonl` after the turn finishes:
    1. **At the start of each turn (or when continuing from a prior `<conversation-id>`):** Copy `<appDataDir>/brain/<conversation-id>/.system_generated/logs/transcript_full.jsonl` to `doc/prompts/<N>. <Session Title>/transcript_full.jsonl` and regenerate `conversation.md` so the previous turn's finalized `thinking` and `content` are captured verbatim (and sync the prior conversation's folder if continuing).
    2. **Before sending each new final response:** Re-copy `transcript_full.jsonl`, regenerate `conversation.md` to capture all completed steps of the current turn, append the exact final response under `## Pending Final Response (Pre-Commit)` (noting it will be replaced verbatim from `transcript_full.jsonl` on the next sync), and create or update `summary.md` in the same folder.

## 3. Code Quality & Styling Standards
- Follow the established vanilla JavaScript and CSS conventions across the repository.
- Avoid introducing unnecessary third-party runtime frameworks or heavy libraries unless explicitly requested.
- Maintain responsive design and dark/sky-blue aesthetic consistency across all interactive tools and modals.
