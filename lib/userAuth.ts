import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize a separate Firebase app instance for users
const userApp = initializeApp(firebaseConfig, 'user');

// Get Auth instance for users
export const userAuth = getAuth(userApp);

// Get Firestore instance for users
export const userDb = getFirestore(userApp);

// Export Google provider for user authentication
import { GoogleAuthProvider } from 'firebase/auth';
export const googleProvider = new GoogleAuthProvider();