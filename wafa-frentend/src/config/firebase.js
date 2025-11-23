// Firebase configuration for WAFA frontend
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAyMy6qkzlpzn9WPt0cJy6moHOxiOBI068",
  authDomain: "elearning-8af75.firebaseapp.com",
  projectId: "elearning-8af75",
  storageBucket: "elearning-8af75.firebasestorage.app",
  messagingSenderId: "769145725342",
  appId: "1:769145725342:web:11047163a64fc25d5bb68f",
  measurementId: "G-996E4YCEWD"
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
