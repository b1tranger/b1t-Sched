// ============================================
// NOTE MANAGER MODULE
// ============================================

const NoteManager = {
  autoSaveTimer: null,
  currentUserId: null,
  isEditing: false,
  UPLOAD_TIMEOUT: 20000, // 20 seconds per provider

  // Initialize note functionality
  init() {
    console.log('Initializing NoteManager...');

    // Setup authentication state listener
    Auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUserId = user.uid;
        this.enableNoteFeature();
        this.loadNote(user.uid);
      } else {
        this.currentUserId = null;
        this.disableNoteFeature();
      }
    });

    // Setup event listeners
    this.setupEventListeners();
  },

  // Setup all event listeners
  setupEventListeners() {
    // Mobile note toggle button
    const noteToggle = document.getElementById('note-toggle');
    if (noteToggle) {
      noteToggle.addEventListener('click', () => this.openModal());
    }

    // Desktop note button
    const noteButtonDesktop = document.getElementById('note-button-desktop');
    if (noteButtonDesktop) {
      noteButtonDesktop.addEventListener('click', () => this.openModal());
    }

    // Close modal button
    const closeModalBtn = document.getElementById('close-note-modal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => this.closeModal());
    }

    // Save button
    const saveBtn = document.getElementById('save-note-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.handleSave());
    }

    // Clear button
    const clearBtn = document.getElementById('clear-note-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.handleClear());
    }

    // Shorten button
    const shortenBtn = document.getElementById('shorten-note-btn');
    if (shortenBtn) {
      shortenBtn.addEventListener('click', () => this.handleShortenNote());
    }

    // Export PDF button
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener('click', () => this.handleExportPdf());
    }

    // Upload files button - trigger file input
    const uploadBtn = document.getElementById('upload-files-btn');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => this.triggerFileUpload());
    }

    // File input change handler
    const fileInput = document.getElementById('note-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    // Textarea input for preview updates and auto-save
    const textarea = document.getElementById('note-textarea');
    if (textarea) {
      textarea.addEventListener('input', (e) => {
        this.updatePreview(e.target.value);
        this.setupAutoSave(e.target.value);
      });

      // When user clicks outside textarea or it loses focus, switch to preview
      textarea.addEventListener('blur', () => {
        // Small delay to allow button clicks to register first
        setTimeout(() => {
          this.switchToPreview();
        }, 200);
      });
    }

    // Click on preview to switch to editor
    const previewContent = document.getElementById('note-preview-content');
    if (previewContent) {
      previewContent.addEventListener('click', (e) => {
        // Don't switch to edit if user clicked a link
        if (e.target.tagName === 'A') {
          this.handleNoteLinkClick(e);
          return;
        }
        this.switchToEditor();
      });

      // Also support keyboard activation
      previewContent.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.switchToEditor();
        }
      });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('note-modal');
        if (modal && modal.style.display === 'flex') {
          this.closeModal();
        }
      }
    });

    // Close modal when clicking outside
    const modal = document.getElementById('note-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }
  },

  // ──────────────────────────────────────────────
  // PREVIEW / EDITOR MODE SWITCHING
  // ──────────────────────────────────────────────

  switchToEditor() {
    const previewWrapper = document.getElementById('note-preview-wrapper');
    const editorWrapper = document.getElementById('note-editor-wrapper');
    const textarea = document.getElementById('note-textarea');

    if (previewWrapper) previewWrapper.style.display = 'none';
    if (editorWrapper) editorWrapper.style.display = 'block';
    if (textarea) {
      textarea.focus();
      // Move cursor to end
      textarea.selectionStart = textarea.value.length;
      textarea.selectionEnd = textarea.value.length;
    }
    this.isEditing = true;
  },

  switchToPreview() {
    const previewWrapper = document.getElementById('note-preview-wrapper');
    const editorWrapper = document.getElementById('note-editor-wrapper');
    const textarea = document.getElementById('note-textarea');

    if (previewWrapper) previewWrapper.style.display = 'block';
    if (editorWrapper) editorWrapper.style.display = 'none';

    // Update preview with current textarea content
    if (textarea) {
      this.updatePreview(textarea.value);
    }
    this.isEditing = false;
  },

  // Handle link clicks inside the preview to trigger downloads
  handleNoteLinkClick(e) {
    e.preventDefault();
    const link = e.target;
    const url = link.href;

    if (!url || url === '#') return;

    // Try to trigger direct download
    const downloadHelper = document.getElementById('note-download-helper');
    const fallbackLink = document.getElementById('note-download-fallback-link');

    // Create a temporary anchor to force download
    const tempLink = document.createElement('a');
    tempLink.href = url;
    tempLink.target = '_blank';
    tempLink.rel = 'noopener noreferrer';
    // Try setting download attribute (works for same-origin)
    const filename = url.split('/').pop() || 'download';
    tempLink.download = filename;
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);

    // Show the download helper with fallback link
    if (downloadHelper && fallbackLink) {
      fallbackLink.href = url;
      downloadHelper.style.display = 'flex';

      // Auto-hide after 8 seconds
      setTimeout(() => {
        downloadHelper.style.display = 'none';
      }, 8000);
    }
  },

  // Enable note feature (delegates visibility to UI controller)
  enableNoteFeature() {
    console.log('Note feature enabled');
    // Re-evaluate visibility based on current route and now-active auth
    if (window.UI && window.Router) {
      UI.updateSectionVisibility(Router.getCurrentRoute(), true);
    }
  },

  // Disable note feature
  disableNoteFeature() {
    console.log('Note feature disabled');
    // Re-evaluate visibility (will hide buttons since no auth)
    if (window.UI && window.Router) {
      UI.updateSectionVisibility(Router.getCurrentRoute(), false);
    }

    // Close modal if open
    this.closeModal();
  },

  // Open note modal
  openModal() {
    const modal = document.getElementById('note-modal');
    const noteToggle = document.getElementById('note-toggle');
    const noteButtonDesktop = document.getElementById('note-button-desktop');

    if (modal) {
      modal.style.display = 'flex';
      modal.setAttribute('aria-modal', 'true');

      // Update button aria-expanded
      if (noteToggle) noteToggle.setAttribute('aria-expanded', 'true');
      if (noteButtonDesktop) noteButtonDesktop.setAttribute('aria-expanded', 'true');

      // Always start in preview mode when opening
      this.switchToPreview();

      // Hide file.io fallback on modal open
      const fallback = document.getElementById('note-fileio-fallback');
      if (fallback) fallback.style.display = 'none';

      // Load note if user is authenticated
      if (this.currentUserId) {
        this.loadNote(this.currentUserId);
      }
    }
  },

  // Close note modal
  closeModal() {
    const modal = document.getElementById('note-modal');
    const noteToggle = document.getElementById('note-toggle');
    const noteButtonDesktop = document.getElementById('note-button-desktop');

    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-modal', 'false');

      // Update button aria-expanded
      if (noteToggle) noteToggle.setAttribute('aria-expanded', 'false');
      if (noteButtonDesktop) noteButtonDesktop.setAttribute('aria-expanded', 'false');
    }

    // If we were editing, save before closing
    if (this.isEditing) {
      const textarea = document.getElementById('note-textarea');
      if (textarea && this.currentUserId) {
        this.saveNote(this.currentUserId, textarea.value);
      }
      this.isEditing = false;
    }
  },

  // Trigger file input click
  triggerFileUpload() {
    const fileInput = document.getElementById('note-file-input');
    if (fileInput) {
      fileInput.click();
    }
  },

  // Handle file selection
  async handleFileSelect(event) {
    let file = event.target.files[0];
    if (!file) return;

    // Validate file size (max 200MB for Catbox, 10MB for Firebase)
    const maxSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxSize) {
      this.showMessage('File is too large. Maximum size is 200MB.', 'error');
      return;
    }

    // Check if JSZip is needed for unsupported extensions
    const safeExtensions = ['.pdf', '.doc', '.docx', '.txt', '.zip', '.rar', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp4', '.mp3', '.csv', '.xlsx', '.pptx'];
    const fileName = file.name.toLowerCase();
    const isSafe = safeExtensions.some(ext => fileName.endsWith(ext));

    if (!isSafe && typeof JSZip !== 'undefined') {
      try {
        this.showMessage('Compressing unsupported file type...', 'info');
        const zip = new JSZip();
        zip.file(file.name, file);
        const zipBlob = await zip.generateAsync({ type: 'blob' });

        // Create a new File object from the blob
        const newFileName = file.name.split('.').slice(0, -1).join('.') + '.zip';
        file = new File([zipBlob], newFileName, { type: 'application/zip' });
      } catch (err) {
        console.error('JSZip compression failed:', err);
        this.showMessage('Failed to compress file before upload.', 'error');
        return;
      }
    }

    // Hide file.io fallback at start of new upload
    const fallback = document.getElementById('note-fileio-fallback');
    if (fallback) fallback.style.display = 'none';

    // Show upload status
    const uploadBtn = document.getElementById('upload-files-btn');
    const originalText = uploadBtn ? uploadBtn.innerHTML : '';
    if (uploadBtn) {
      uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
      uploadBtn.disabled = true;
    }

    try {
      // Try multi-provider upload with fallback
      const result = await this.uploadWithFallback(file);

      // Switch to editor to insert the link
      this.switchToEditor();

      // Insert markdown link into textarea at cursor position
      this.insertLinkIntoNote(file.name, result.url);

      // Show success message with provider info
      let message = `File uploaded successfully via ${result.provider}!`;
      if (result.expiresIn) {
        message += ` (Expires in ${result.expiresIn})`;
      }
      this.showMessage(message, 'success');
    } catch (error) {
      console.error('Upload error:', error);
      this.showMessage('Failed to upload file: ' + error.message, 'error');

      // Show file.io fallback suggestion
      if (fallback) fallback.style.display = 'flex';
    } finally {
      // Reset button
      if (uploadBtn) {
        uploadBtn.innerHTML = originalText;
        uploadBtn.disabled = false;
      }

      // Clear file input
      event.target.value = '';
    }
  },

  // Upload with fallback to multiple providers (with per-provider timeout)
  async uploadWithFallback(file) {
    const providers = [
      // { name: 'Firebase Storage', method: () => this.uploadToFirebaseStorage(file), maxSize: 10 * 1024 * 1024 }, // Disabled
      { name: 'File.io', method: () => this.uploadToFileIO(file), maxSize: 100 * 1024 * 1024 },
      { name: 'Tmpfiles', method: () => this.uploadToTmpfiles(file), maxSize: 100 * 1024 * 1024 },
      { name: 'Catbox', method: () => this.uploadToCatbox(file), maxSize: 200 * 1024 * 1024 }
    ];

    let lastError = null;

    for (const provider of providers) {
      // Skip if file is too large for this provider
      if (file.size > provider.maxSize) {
        console.log(`Skipping ${provider.name}: file too large (${file.size} > ${provider.maxSize})`);
        continue;
      }

      try {
        console.log(`Attempting upload to ${provider.name}...`);

        // Race the upload against a timeout
        const url = await Promise.race([
          provider.method(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`${provider.name} upload timed out after ${this.UPLOAD_TIMEOUT / 1000}s`)), this.UPLOAD_TIMEOUT)
          )
        ]);

        // Determine expiration info
        let expiresIn = null;
        if (provider.name === 'Tmpfiles') {
          expiresIn = '1 year';
        }

        return {
          url: url,
          provider: provider.name,
          expiresIn: expiresIn
        };
      } catch (error) {
        console.warn(`${provider.name} upload failed:`, error.message);
        lastError = error;
        // Continue to next provider
      }
    }

    // All providers failed
    throw new Error(lastError?.message || 'All upload providers failed');
  },

  // Upload file to Cloudinary (Unsigned)
  async uploadToCloudinary(file) {
    const cloudName = 'djsa2kkyu';
    const uploadPreset = 'b1t_sched_unsigned';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      return data.secure_url; // Return the HTTPS URL
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(error.message || 'Failed to upload to Cloudinary');
    }
  },

  // Upload file to Firebase Storage
  async uploadToFirebaseStorage(file) {
    if (!this.currentUserId) {
      throw new Error('User not authenticated');
    }

    // Check if storage is available
    if (typeof storage === 'undefined') {
      throw new Error('Firebase Storage not initialized');
    }

    // Create a unique filename with timestamp to avoid collisions
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${sanitizedFilename}`;

    // Create storage reference: note-attachments/{userId}/{filename}
    const storageRef = storage.ref(`note-attachments/${this.currentUserId}/${filename}`);

    try {
      // Upload file
      const snapshot = await storageRef.put(file);

      // Get download URL
      const downloadURL = await snapshot.ref.getDownloadURL();

      return downloadURL;
    } catch (error) {
      console.error('Firebase Storage upload error:', error);
      throw new Error(error.message || 'Failed to upload to Firebase Storage');
    }
  },

  // Upload file to file.io (temporary, CORS-friendly)
  async uploadToFileIO(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://file.io', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'File.io upload failed');
      }

      return data.link;
    } catch (error) {
      throw new Error(error.message || 'Network error during File.io upload');
    }
  },

  // Upload file to Catbox.moe (permanent, CORS-friendly)
  async uploadToCatbox(file) {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', file);

    try {
      const response = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const url = await response.text();

      // Catbox returns the direct URL as plain text
      if (!url || !url.startsWith('https://files.catbox.moe/')) {
        throw new Error('Invalid response from Catbox');
      }

      return url.trim();
    } catch (error) {
      throw new Error(error.message || 'Network error during Catbox upload');
    }
  },

  // Upload file to Tmpfiles.org (temporary, CORS-friendly)
  async uploadToTmpfiles(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const data = await response.json();

      // Check if upload was successful
      if (data.status !== 'success' || !data.data || !data.data.url) {
        throw new Error(data.message || 'Invalid response from Tmpfiles');
      }

      // Tmpfiles returns a URL like https://tmpfiles.org/12345
      // Convert to direct download URL: https://tmpfiles.org/dl/12345
      const url = data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');

      return url;
    } catch (error) {
      throw new Error(error.message || 'Network error during Tmpfiles upload');
    }
  },

  // Insert markdown link into textarea at cursor position
  insertLinkIntoNote(filename, url) {
    const textarea = document.getElementById('note-textarea');
    if (!textarea) return;

    const markdownLink = `[${filename}](${url})`;

    // Get cursor position
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const textBefore = textarea.value.substring(0, startPos);
    const textAfter = textarea.value.substring(endPos);

    // Insert link at cursor position
    const newValue = textBefore + markdownLink + textAfter;
    textarea.value = newValue;

    // Set cursor position after inserted link
    const newCursorPos = startPos + markdownLink.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);

    // Focus textarea
    textarea.focus();

    // Update preview and trigger auto-save
    this.updatePreview(newValue);
    this.setupAutoSave(newValue);
  },

  // Update preview with formatted content
  updatePreview(content) {
    const preview = document.getElementById('note-preview-content');
    if (!preview) return;

    if (!content || content.trim() === '') {
      preview.innerHTML = '<p class="note-empty-message">Tap here to start writing your notes... Supports markdown formatting!</p>';
    } else {
      // Use existing utility from utils.js
      preview.innerHTML = Utils.escapeAndLinkify(content);
    }
  },

  // Setup auto-save with debouncing
  setupAutoSave(content) {
    if (!this.currentUserId) return;

    // Clear existing timer
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    // Set new timer (500ms debounce)
    this.autoSaveTimer = setTimeout(() => {
      this.saveNote(this.currentUserId, content);
    }, 500);
  },

  // Load note from Firestore
  async loadNote(userId) {
    if (!userId) {
      console.error('No user ID provided for loading note');
      return;
    }

    try {
      const userDoc = await db.collection('users').doc(userId).get();
      const textarea = document.getElementById('note-textarea');

      if (userDoc.exists) {
        const data = userDoc.data();
        const noteContent = data.noteContent || '';

        if (textarea) {
          textarea.value = noteContent;
        }

        // Update preview
        this.updatePreview(noteContent);
      } else {
        // New user, no note yet
        if (textarea) {
          textarea.value = '';
        }
        this.updatePreview('');
      }
    } catch (error) {
      console.error('Error loading note:', error);
      this.showMessage('Failed to load note. Please try again.', 'error');
    }
  },

  // Save note to Firestore
  async saveNote(userId, content) {
    if (!userId) {
      console.error('No user ID provided for saving note');
      return;
    }

    // Validate content size (max 1MB)
    if (!this.validateNoteContent(content)) {
      return;
    }

    try {
      await db.collection('users').doc(userId).update({
        noteContent: content,
        noteUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      console.log('Note saved successfully');
      // Optional: Show brief success indicator
    } catch (error) {
      console.error('Error saving note:', error);

      // User-friendly error messages
      let errorMessage = 'Failed to save note. ';
      if (error.code === 'permission-denied') {
        errorMessage += 'You do not have permission to save notes.';
      } else if (error.code === 'unavailable') {
        errorMessage += 'Network connection issue. Please try again.';
      } else {
        errorMessage += 'Please try again later.';
      }

      this.showMessage(errorMessage, 'error');
    }
  },

  // Handle manual save button click
  async handleSave() {
    if (!this.currentUserId) {
      this.showMessage('You must be logged in to save notes.', 'error');
      return;
    }

    const textarea = document.getElementById('note-textarea');
    if (textarea) {
      await this.saveNote(this.currentUserId, textarea.value);
      this.showMessage('Note saved successfully!', 'success');
      // Switch to preview after saving
      this.switchToPreview();
    }
  },

  // Handle clear button click
  async handleClear() {
    if (!this.currentUserId) {
      this.showMessage('You must be logged in to clear notes.', 'error');
      return;
    }

    // Show confirmation dialog
    const confirmed = confirm('Are you sure you want to clear all note content? This action cannot be undone.');

    if (confirmed) {
      await this.clearNote(this.currentUserId);
    }
  },

  // Clear note from Firestore
  async clearNote(userId) {
    if (!userId) {
      console.error('No user ID provided for clearing note');
      return;
    }

    try {
      await db.collection('users').doc(userId).update({
        noteContent: '',
        noteUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Clear UI
      const textarea = document.getElementById('note-textarea');
      if (textarea) {
        textarea.value = '';
      }

      this.updatePreview('');
      this.switchToPreview();
      this.showMessage('Note cleared successfully!', 'success');
    } catch (error) {
      console.error('Error clearing note:', error);
      this.showMessage('Failed to clear note. Please try again.', 'error');
    }
  },

  // ──────────────────────────────────────────────
  // EXPORT TO PDF
  // ──────────────────────────────────────────────

  async handleExportPdf() {
    // If we're in edit mode, switch to preview so we can target the HTML Content
    if (this.isEditing) {
      this.switchToPreview();
    }

    const previewContent = document.getElementById('note-preview-content');
    if (!previewContent) {
      this.showMessage('Nothing to export!', 'error');
      return;
    }

    // Check if it's just the empty placeholder
    const textContext = previewContent.innerText.trim();
    if (textContext.startsWith('Tap here to start writing') || !textContext) {
      this.showMessage('Write some notes first to export as PDF.', 'error');
      return;
    }

    try {
      this.showMessage('Generating PDF...', 'info');
      // Configuration for html2pdf
      const opt = {
        margin: 0.5,
        filename: `My_Notes_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      // Ensure html2pdf is loaded
      if (typeof window.html2pdf !== 'undefined') {
        // Temporarily apply a class to handle dark-mode text visibility if needed
        // but backgroundColor: '#ffffff' in html2canvas often fixes the blank issue
        // because it forces a non-transparent background. 
        // We também ensure text is dark for the export.
        const originalColor = previewContent.style.color;
        previewContent.style.color = '#000000'; // Force black text for PDF

        window.html2pdf().set(opt).from(previewContent).save()
          .then(() => {
            previewContent.style.color = originalColor; // Restore
            this.showMessage('PDF Exported Successfully!', 'success');
          })
          .catch(err => {
            previewContent.style.color = originalColor; // Restore
            console.error('PDF Export Error:', err);
            this.showMessage('Failed to generate PDF.', 'error');
          });
      } else {
        this.showMessage('PDF library is not loaded. Please try again.', 'error');
      }
    } catch (error) {
      console.error('PDF Export Setup Error:', error);
      this.showMessage('Failed to start PDF generation.', 'error');
    }
  },

  // ──────────────────────────────────────────────
  // SHORTEN NOTE AUTOMATION
  // ──────────────────────────────────────────────

  async handleShortenNote() {
    if (!this.currentUserId) {
      this.showMessage('You must be logged in to shorten notes.', 'error');
      return;
    }

    const textarea = document.getElementById('note-textarea');
    if (!textarea || !textarea.value.trim()) {
      this.showMessage('Nothing to shorten. Write some notes first!', 'error');
      return;
    }

    const confirmed = confirm(
      'This will convert all your note text into a downloadable .md file link. ' +
      'Your current note content will be replaced with the download link. Continue?'
    );
    if (!confirmed) return;

    const noteContent = textarea.value;

    // Hide file.io fallback at start
    const fallback = document.getElementById('note-fileio-fallback');
    if (fallback) fallback.style.display = 'none';

    // Create a Blob from the note content as a .md file
    const blob = new Blob([noteContent], { type: 'text/markdown' });
    const filename = `note_${Date.now()}.md`;
    const file = new File([blob], filename, { type: 'text/markdown' });

    // Show progress on the shorten button
    const shortenBtn = document.getElementById('shorten-note-btn');
    const originalText = shortenBtn ? shortenBtn.innerHTML : '';
    if (shortenBtn) {
      shortenBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Shortening...';
      shortenBtn.disabled = true;
    }

    try {
      const result = await this.uploadWithFallback(file);

      // Replace note content with the download link
      const shortenedContent = `[📄 ${filename}](${result.url})`;
      textarea.value = shortenedContent;

      // Update preview and save
      this.updatePreview(shortenedContent);
      await this.saveNote(this.currentUserId, shortenedContent);

      let message = `Note shortened to a download link via ${result.provider}!`;
      if (result.expiresIn) {
        message += ` (Link expires in ${result.expiresIn})`;
      }
      this.showMessage(message, 'success');
      this.switchToPreview();
    } catch (error) {
      console.error('Shorten upload failed, falling back to local download:', error);

      // Fallback: Local download of the .md file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showMessage('Upload failed (CORS/Network error). Your note has been downloaded locally as a .md file instead.', 'warning');

      // Show file.io fallback suggestion as well
      if (fallback) fallback.style.display = 'flex';
    } finally {
      if (shortenBtn) {
        shortenBtn.innerHTML = originalText;
        shortenBtn.disabled = false;
      }
    }
  },

  // Validate note content size
  validateNoteContent(content) {
    const MAX_SIZE = 1000000; // 1MB in bytes
    const sizeInBytes = new Blob([content]).size;

    if (sizeInBytes > MAX_SIZE) {
      this.showMessage('Note is too large. Please reduce content size.', 'error');
      return false;
    }

    return true;
  },

  // Show message to user
  showMessage(message, type = 'info') {
    // Use existing UI message system if available
    if (typeof UI !== 'undefined' && UI.showMessage) {
      UI.showMessage('note-message', message, type);
    } else {
      // Fallback to alert
      alert(message);
    }
  }
};
