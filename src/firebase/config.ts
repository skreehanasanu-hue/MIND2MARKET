import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Web app Firebase configuration for Mind2Market
export const firebaseConfig = {
  apiKey: "AIzaSyDHoazDN_3wKr55gXe1t1Lu1NPHdrX0mLI",
  authDomain: "mind2market-50093.firebaseapp.com",
  projectId: "mind2market-50093",
  storageBucket: "mind2market-50093.firebasestorage.app",
  messagingSenderId: "383799357037",
  appId: "1:383799357037:web:8b3c5b13781ebf6ce71964"
};

// Initialize Firebase safely
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
