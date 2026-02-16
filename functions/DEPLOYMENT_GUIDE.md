# Firebase Functions Deployment Guide

## Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. Logged in to Firebase: `firebase login`
3. Project initialized: `firebase use <your-project-id>`

## Deployment Steps

### 1. Deploy Functions

```bash
firebase deploy --only functions
```

This will deploy both functions:
- `sendPasswordReset`
- `deleteUser`

### 2. Get Function URLs

After deployment, you'll see URLs like:
```
https://us-central1-<project-id>.cloudfunctions.net/sendPasswordReset
https://us-central1-<project-id>.cloudfunctions.net/deleteUser
```

### 3. Update Frontend Configuration

Update the `baseURL` in `js/admin-api.js` with your project ID:
```javascript
this.baseURL = 'https://us-central1-<your-project-id>.cloudfunctions.net';
```

## Testing with curl

### Test Password Reset (requires admin token)

```bash
curl -X POST \
  https://us-central1-<project-id>.cloudfunctions.net/sendPasswordReset \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-id-token>" \
  -d '{"userId": "<target-user-id>"}'
```

### Test User Deletion (requires admin token)

```bash
curl -X POST \
  https://us-central1-<project-id>.cloudfunctions.net/deleteUser \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-id-token>" \
  -d '{"userId": "<target-user-id>"}'
```

## Getting an Admin ID Token

In your browser console while logged in as admin:
```javascript
firebase.auth().currentUser.getIdToken().then(token => console.log(token));
```

## Verify Deployment

1. Check Firebase Console > Functions to see deployed functions
2. Check Firebase Console > Firestore > adminLogs to verify logging works
3. Test both endpoints with valid and invalid inputs
4. Verify admin authentication is enforced

## Troubleshooting

- **401 Unauthorized**: Check that Authorization header is present and valid
- **403 Forbidden**: Verify the user has `isAdmin: true` in Firestore
- **404 Not Found**: User ID doesn't exist in Firebase Auth
- **500 Internal Server Error**: Check function logs: `firebase functions:log`
