// lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { app, db };