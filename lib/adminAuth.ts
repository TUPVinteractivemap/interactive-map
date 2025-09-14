import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize a separate Firebase app instance for admin
const adminApp = initializeApp(firebaseConfig, 'admin');

// Get Auth instance for admin
export const adminAuth = getAuth(adminApp);

// Get Firestore instance
export const adminDb = getFirestore(adminApp);

// Get Functions instance
export const functions = getFunctions(adminApp);

// Function to check if a user is an admin
export async function checkAdminStatus(uid: string): Promise<boolean> {
  try {
    const adminDoc = await getDoc(doc(adminDb, 'admins', uid));
    return adminDoc.exists();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}