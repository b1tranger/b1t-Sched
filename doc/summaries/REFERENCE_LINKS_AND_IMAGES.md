# Reference Links and Images

This document compiles all reference links and images provided during development.

---

## External Links

### Firebase Resources
- [Firebase Console](https://console.firebase.google.com/u/0/project/b1t-sched/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Firebase Pricing](https://firebase.google.com/pricing)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

### Deployment Platforms
- [Netlify Dashboard](https://app.netlify.com/)
- [Live Site](https://b1tsched.netlify.app/)
- [Vercel Backend](https://b1t-acad-backend.vercel.app)

### File Upload Services
- [Firebase Storage](https://firebase.google.com/docs/storage)
- [Catbox.moe](https://catbox.moe/)
- [Tmpfiles.org](https://tmpfiles.org/)

### Development Resources
- [Google Classroom API](https://developers.google.com/classroom)
- [Font Awesome Icons](https://fontawesome.com/)
- [MDN Web Docs](https://developer.mozilla.org/)

---

## Project Images

### Screenshots
<!-- Add screenshots here -->

### Architecture Diagrams
<!-- Add architecture diagrams here -->

### UI Mockups
<!-- Add UI mockups here -->

### Flow Diagrams
<!-- Add flow diagrams here -->

---

## Browser Console Logs

### File Upload CORS Error (Fixed)
```
Access to fetch at 'https://file.io/' from origin 'https://b1tsched.netlify.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present 
on the requested resource.

POST https://file.io/ net::ERR_FAILED 301 (Moved Permanently)
```

### Calendar View Syntax Error (Fixed)
```
Uncaught SyntaxError: Unexpected token 'export' (at calendar-view.js:1242:1)
```

### Firebase Index Warning (Informational)
```
FirebaseError: The query requires an index. You can create it here: 
https://console.firebase.google.com/v1/r/project/b1t-sched/firestore/indexes?create_composite=...
```

---

## Code Snippets

### Firebase Configuration
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAMc_2g2zK8DYbugsaf4JEYWCYftoxIdkE",
  authDomain: "b1t-sched.firebaseapp.com",
  projectId: "b1t-sched",
  storageBucket: "b1t-sched.firebasestorage.app",
  messagingSenderId: "787498876432",
  appId: "1:787498876432:web:665f5b73e21ed0e9535495",
  measurementId: "G-H4QJ4F99RG"
};
```

### Multi-Provider Upload Flow
```javascript
// Try providers in order
1. Firebase Storage (≤10MB, authenticated)
   ↓ (if fails)
2. Catbox.moe (≤200MB, no auth)
   ↓ (if fails)
3. Tmpfiles.org (≤100MB, no auth)
   ↓
Success! Insert markdown link
```

---

## Testing URLs

### Test Files
- Small file (< 10MB): Should use Firebase Storage
- Medium file (10-200MB): Should use Catbox
- Large file (> 200MB): Should show error

### Test Scenarios
1. Upload with authenticated user → Firebase Storage
2. Upload when Firebase quota exceeded → Catbox fallback
3. Upload when both Firebase and Catbox fail → Tmpfiles fallback
4. Upload file > 200MB → Error message

---

## Notes

<!-- Add any additional notes, links, or images provided during development -->

---

*This document should be updated whenever new reference materials are provided.*
