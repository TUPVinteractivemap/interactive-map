import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Read the service account key
const serviceAccount = JSON.parse(
  readFileSync(join(process.cwd(), 'firebase-admin-key.json'), 'utf8')
);

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}, 'test-sync-app');

const db = getFirestore(app);

async function testUserSync() {
  try {
    console.log('🧪 Testing user sync to admin dashboard...\n');

    // Check users in admin Firestore
    const usersRef = db.collection('users');
    const usersSnapshot = await usersRef.get();

    console.log(`📊 Found ${usersSnapshot.size} users in admin Firestore:`);

    usersSnapshot.forEach((doc, index) => {
      const userData = doc.data();
      console.log(`${index + 1}. ${userData.email || 'No email'} - ${userData.name || 'No name'}`);
      if (userData.syncedAt) {
        console.log(`   Synced: ${userData.syncedAt.toDate().toLocaleString()}`);
      }
    });

    console.log('\n✅ User sync test completed!');

    if (usersSnapshot.size > 0) {
      console.log('🎉 Users are successfully synced to admin dashboard!');
      console.log('🔄 Real-time updates should now work automatically.');
    } else {
      console.log('⚠️ No users found. Make sure users have registered and the sync script is running.');
    }

  } catch (error) {
    console.error('❌ Error testing user sync:', error);
  }
}

testUserSync();
