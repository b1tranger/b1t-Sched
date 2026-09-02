# Repository Rules & Guidelines

## 1. Changelog & History Maintenance
- **Automatic History Updates**: Whenever adding new features, fixing bugs, refactoring components, or altering UI/styles in this codebase, always document the changes in doc/DOCUMENTATION.md , changes.json, sw.js#L5-5 (const CACHE_VERSION).
- **Date Format**: Group entries under the current date using the format `# DD.MM.YY` (e.g., `# 02.09.26`) placed chronologically at the top of the file directly beneath the frontmatter tags comment block.
- **Entry Structure**:
  - Title the main change in bold with a clear feature/fix description.
  - Detail specific modifications with bullet points mentioning affected file paths, selectors/IDs, and technical/design decisions.
  - Preserve existing frontmatter tag comments at the top of the file.

## 2. Prompt, Plan & Walkthrough Archiving
- **Target Location**: When archiving chat sessions, implementation plans, or walkthroughs, locate the [`doc/prompts`](doc/prompts) directory.
- **Prefix Sequencing Strategy**:
  - Inspect existing files in `doc/prompts/` to identify the current major sequence integer (e.g. `98.`, `99.`, etc.).
  - Group all conversations, implementation plans, and walkthroughs of the same session or day under the **same major prefix integer** (e.g. `99.`).
  - Use minor/fractional numbers for related files within the session:
    - Primary chat session: `99. <Feature / Fix Title>.md`
    - Implementation plan: `99.1 Implementation Plan - <Plan Title>.md`
    - Walkthrough / verification document: `99.2 Walkthrough - <Title>.md`
    - Subsequent/follow-up chat sessions on that day: `99.3 <Next Task / Chat Title>.md`
    - Associated plans/walkthroughs of that next chat: `99.4 ...`, `99.5 ...`, and so on.
- **Chat Archive Fidelity**:
  - Reproduce the conversation exactly as the source (user request blocks verbatim).
  - Include the model's internal thinking/reasoning parts (`### Thinking`) alongside the final response (`### AI Response`).
  - Preserve the frontmatter tags comment block at the top of each archive file.

## 3. Code Quality & Styling Standards
- Follow the established vanilla JavaScript and CSS conventions across the repository.
- Avoid introducing unnecessary third-party runtime frameworks or heavy libraries unless explicitly requested.
- Maintain responsive design and dark/sky-blue aesthetic consistency across all interactive tools and modals.
