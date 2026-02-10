// ============================================
// FIREBASE CONFIGURATION
// ============================================
// Replace these values with your own Firebase project configuration
// Get this from: Firebase Console > Project Settings > Your apps > Web app

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAMc_2g2zK8DYbugsaf4JEYWCYftoxIdkE",
  authDomain: "b1t-sched.firebaseapp.com",
  projectId: "b1t-sched",
  storageBucket: "b1t-sched.firebasestorage.app",
  messagingSenderId: "787498876432",
  appId: "1:787498876432:web:665f5b73e21ed0e9535495",
  measurementId: "G-H4QJ4F99RG"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

console.log("Firebase initialized successfully");
