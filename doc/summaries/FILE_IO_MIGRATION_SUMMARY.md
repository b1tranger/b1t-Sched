# File Upload Service Migration: tmpfiles.org → file.io

## Summary

Migrated the note-taking file upload feature from tmpfiles.org to file.io API for improved reliability and longer file retention.

## Changes Made

### 1. JavaScript (js/notes.js)
- **Renamed method**: `uploadToTmpFiles()` → `uploadToFileIO()`
- **Updated API endpoint**: `https://tmpfiles.org/api/v1/upload` → `https://file.io/`
- **Updated API response handling**:
  - Old: `{status: "success", data: {url: "..."}}`
  - New: `{success: true, link: "..."}`
- **Removed URL conversion**: file.io provides direct download links (no need to convert `/` to `/dl/`)
- **Updated success message**: Now shows "File uploaded successfully! (Available for 14 days)"

### 2. Utilities (js/utils.js)
- **Updated download link detection**: Changed from `tmpfiles.org/dl/` to `file.io/`
- Links from file.io automatically get the `download` attribute for direct downloads

### 3. HTML (index.html)
- **Updated upload instructions**: Changed from "Upload files to tmpfiles.org" to "Upload files to file.io"
- **Updated retention info**: Changed from "Files are temporary" to "Files are available for 14 days"
- **Removed alternative services note**: Simplified instructions since file.io is now the primary service

### 4. Documentation (doc/DOCUMENTATION.md)
- Updated all references from tmpfiles.org to file.io
- Updated API documentation section with file.io endpoint and response format
- Updated method name in NoteManager API table
- Updated Key Features description
- Updated version history (added v2.27.0)
- Updated footer version number

## Benefits of file.io

| Feature | tmpfiles.org | file.io |
|---------|--------------|---------|
| **File Retention** | 1 hour | 14 days |
| **Max File Size** | 100MB | 100MB |
| **Direct Downloads** | Requires URL conversion | Native support |
| **API Simplicity** | Nested response structure | Flat response structure |
| **Reliability** | Moderate | High |
| **Documentation** | Limited | Comprehensive |

## API Comparison

### tmpfiles.org (Old)
```javascript
// Request
POST https://tmpfiles.org/api/v1/upload
FormData: { file: <File> }

// Response
{
  "status": "success",
  "data": {
    "url": "https://tmpfiles.org/12345/file.jpg"
  }
}

// URL Conversion Required
"https://tmpfiles.org/12345/file.jpg" → "https://tmpfiles.org/dl/12345/file.jpg"
```

### file.io (New)
```javascript
// Request
POST https://file.io/
FormData: { file: <File> }

// Response
{
  "success": true,
  "link": "https://file.io/abc123",
  "key": "abc123",
  "expiry": "14 days"
}

// No URL Conversion Needed
Direct download link provided
```

## Testing Checklist

- [x] File upload functionality works
- [x] Markdown links are inserted correctly
- [x] Download attribute is applied to file.io links
- [x] Success message shows correct retention period
- [x] Error handling works for failed uploads
- [x] File size validation (100MB limit) works
- [x] Auto-save triggers after file upload
- [x] Preview pane shows uploaded file links correctly

## Files Modified

1. `js/notes.js` - Updated upload method and API integration
2. `js/utils.js` - Updated download link detection
3. `index.html` - Updated upload instructions
4. `doc/DOCUMENTATION.md` - Updated all documentation references

## Version

- **Previous Version**: 2.26.0
- **New Version**: 2.27.0
- **Date**: February 18, 2026

## References

- file.io API Documentation: https://www.file.io/developers
- file.io Features: 14-day retention, 100MB max file size, direct download links
