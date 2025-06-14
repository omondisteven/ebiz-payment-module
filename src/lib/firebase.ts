// lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA0NPtX2ZOi9nlAfLIcRg1C4VcnjgfGezw",
  authDomain: "ebiz-v2.firebaseapp.com",
  projectId: "ebiz-v2",
  storageBucket: "ebiz-v2.firebasestorage.app",
  messagingSenderId: "617164733312",
  appId: "1:617164733312:web:d0d98d671c753a2c96df65",
  measurementId: "G-4TZC0LJK9X"
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

export { app, db };