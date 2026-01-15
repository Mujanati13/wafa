// Firebase configuration for WAFA frontend
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// Using environment variables for Docker deployment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAyMy6qkzlpzn9WPt0cJy6moHOxiOBI068",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "elearning-8af75.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "elearning-8af75",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "elearning-8af75.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "769145725342",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:769145725342:web:11047163a64fc25d5bb68f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-996E4YCEWD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Analytics (optional)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;
