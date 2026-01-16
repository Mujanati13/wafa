import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
let firebaseApp = null;

try {
  // Check if Firebase is already initialized
  if (!admin.apps.length) {
    // Try to load service account from file
    const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');
    
    let serviceAccount;
    try {
      const fileContent = readFileSync(serviceAccountPath, 'utf8');
      serviceAccount = JSON.parse(fileContent);
      
      console.log('📝 Firebase service account loaded from file');
      console.log('📋 Project ID:', serviceAccount.project_id);
      console.log('📧 Client Email:', serviceAccount.client_email);
      console.log('🔑 Private Key ID:', serviceAccount.private_key_id);
      
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      
      console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (fileError) {
      console.error('❌ Error loading Firebase service account file:', fileError.message);
      // If file doesn't exist, try environment variables
      if (process.env.FIREBASE_PROJECT_ID && 
          process.env.FIREBASE_PRIVATE_KEY && 
          process.env.FIREBASE_CLIENT_EMAIL) {
        
        serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        };
        
        console.log('📝 Firebase service account loaded from environment variables');
        
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        
        console.log('✅ Firebase Admin SDK initialized from environment variables');
      } else {
        console.log('⚠️  Firebase Admin SDK not configured. Set up service account file or environment variables.');
      }
    }
  } else {
    firebaseApp = admin.app();
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error.message);
}

/**
 * Verify Firebase ID token
 * @param {string} idToken - Firebase ID token from client
 * @returns {Promise<Object>} Decoded token with user info
 */
export const verifyFirebaseToken = async (idToken) => {
  if (!firebaseApp) {
    throw new Error('Firebase Admin SDK is not initialized');
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

/**
 * Generate Firebase password reset link
 * @param {string} email - User's email address
 * @returns {Promise<string>} Password reset link
 */
export const generatePasswordResetLink = async (email) => {
  if (!firebaseApp) {
    throw new Error('Firebase Admin SDK is not initialized');
  }
  
  try {
    const link = await admin.auth().generatePasswordResetLink(email);
    return link;
  } catch (error) {
    throw new Error(`Failed to generate password reset link: ${error.message}`);
  }
};

/**
 * Get Firebase user by email
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Firebase user record
 */
export const getFirebaseUserByEmail = async (email) => {
  if (!firebaseApp) {
    throw new Error('Firebase Admin SDK is not initialized');
  }
  
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw new Error(`Failed to get Firebase user: ${error.message}`);
  }
};

/**
 * Check if Firebase is initialized
 * @returns {boolean}
 */
export const isFirebaseInitialized = () => {
  return firebaseApp !== null;
};

export default admin;
