// ============================================
// FIREBASE CONFIGURATION
// ============================================
// Replace these values with your own Firebase project configuration
// Get this from: Firebase Console > Project Settings > Your apps > Web app

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Enable Firestore offline persistence for PWA offline support
db.enablePersistence({ synchronizeTabs: true })
  .then(() => {
    console.log('[Firestore] Offline persistence enabled');
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('[Firestore] Persistence failed: multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('[Firestore] Persistence not available in this browser');
    }
  });

console.log("Firebase initialized successfully");
