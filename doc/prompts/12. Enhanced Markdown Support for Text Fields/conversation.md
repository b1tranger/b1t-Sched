I need to add more markdown support in all the text fields.

#issue:

- when I am writing mathematical formula with multiple `*` symbols, the letters get formatted. I cannot even replace `*` with $\times$ because it appears as is (like "$\times$")

#fix:

- I need the markdown support for the html symbols, so when I write "\*" it appears as "\*". And it should be possible everywhere there is a text preview in the website (Pending Tasks, Events, Notice, Notes).
- I should be able to render codes with ```and` symbols. And most importantly, I would like to user <pre></pre> tags so I won't have to anything I mentioned so far, not working.

---

> User

I need to add more markdown support in all the text fields.

#issue:

- when I am writing mathematical formula with multiple `*` symbols, the letters get formatted. I cannot even replace `*` with $\times$ because it appears as is (like "$\times$")

#fix:

- I need the markdown support for the html symbols, so when I write "\*" it appears as "\*". And it should be possible everywhere there is a text preview in the website (Pending Tasks, Events, Notice, Notes).
- I should be able to render codes with ```and` symbols. And most importantly, I would like to user <pre></pre> tags so I won't have to anything I mentioned so far, not working.

> AI

The documentation has been updated to reflect the new markdown and code block support. Specifically, I've modified

doc/DOCUMENTATION.md
to:

Update Feature Descriptions: Added details about enhanced markdown support (bold, italic, fenced code blocks, inline code, links), HTML entity rendering (e.g., \*, &times;), and <pre> tag support in Tasks, Events, and Notes.
Update API Reference: Refined the description of Utils.escapeAndLinkify to highlight its new robust rendering pipeline.
Add Version History: Included entries for version 2.40.0 (PWA and offline fixes) and 2.41.0 (Enhanced Markdown Support).
Fix Stale Information: Corrected the file upload description for notes (Catbox/Tmpfiles/file.io) and updated the "last updated" date and version footer.
The core logic changes in

js/utils.js
and styling updates in

css/components.css
and

css/note.css
are now fully documented and ready for use.
