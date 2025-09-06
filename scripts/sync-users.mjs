import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth, listUsers } from 'firebase-admin/auth';
import { getFirestore, doc, setDoc, collection, onSnapshot } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Read the service account key
const serviceAccount = JSON.parse(
  readFileSync(join(process.cwd(), 'firebase-admin-key.json'), 'utf8')
);

// Initialize Firebase Admin for user management
const adminApp = initializeApp({
  credential: cert(serviceAccount),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}, 'sync-app');

const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

// Initialize separate app for user Firestore
const userApp = initializeApp({
  credential: cert(serviceAccount),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}, 'user-sync-app');

const userDb = getFirestore(userApp);

async function syncUsersToAdmin() {
  console.log('🚀 Starting user sync from Firebase Auth to Admin Firestore...\n');

  try {
    // Set up real-time listener for user Firestore changes
    const userCollectionRef = collection(userDb, 'users');

    const unsubscribe = onSnapshot(userCollectionRef, async (snapshot) => {
      console.log(`📡 Detected ${snapshot.docChanges().length} user changes`);

      for (const change of snapshot.docChanges()) {
        const userData = change.doc.data();
        const userId = change.doc.id;

        try {
          if (change.type === 'added' || change.type === 'modified') {
            // Sync user to admin Firestore
            const adminUserRef = doc(adminDb, 'users', userId);
            await setDoc(adminUserRef, {
              ...userData,
              syncedAt: new Date()
            }, { merge: true });

            console.log(`✅ Synced user: ${userData.email || userData.name || userId}`);
          } else if (change.type === 'removed') {
            // Remove user from admin Firestore if deleted from user Firestore
            const adminUserRef = doc(adminDb, 'users', userId);
            await setDoc(adminUserRef, {
              deleted: true,
              deletedAt: new Date()
            }, { merge: true });

            console.log(`🗑️ Marked user as deleted: ${userId}`);
          }
        } catch (error) {
          console.error(`❌ Error syncing user ${userId}:`, error);
        }
      }
    });

    console.log('✅ User sync listener established');
    console.log('🔄 Monitoring for real-time user changes...\n');

    // Keep the process running
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down user sync...');
      unsubscribe();
      process.exit(0);
    });

    // Initial sync - get all existing users
    console.log('🔄 Performing initial user sync...');
    const userSnapshot = await userCollectionRef.get();

    let syncedCount = 0;
    for (const doc of userSnapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;

      try {
        const adminUserRef = doc(adminDb, 'users', userId);
        await setDoc(adminUserRef, {
          ...userData,
          syncedAt: new Date()
        }, { merge: true });
        syncedCount++;
      } catch (error) {
        console.error(`❌ Error syncing user ${userId}:`, error);
      }
    }

    console.log(`✅ Initial sync completed: ${syncedCount} users synced`);
    console.log('🎯 Admin dashboard should now show real-time user updates!\n');

  } catch (error) {
    console.error('❌ Error setting up user sync:', error);
    process.exit(1);
  }
}

// Run the sync
syncUsersToAdmin();
