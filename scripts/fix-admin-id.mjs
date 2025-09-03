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
}, 'fix-admin-id-app');

const db = getFirestore(app);

async function fixAdminBuildingId() {
  try {
    console.log('🔧 Fixing Administration Building ID typo...');

    const buildingsRef = db.collection('buildings');

    // Get the current document with the typo
    const oldDoc = await buildingsRef.doc('AdminisitrationBldg').get();

    if (!oldDoc.exists) {
      console.log('❌ Old document not found!');
      return;
    }

    const data = oldDoc.data();
    console.log('📋 Current data:', data);

    // Create new document with correct ID
    const newDocRef = await buildingsRef.doc('AdministrationBldg').set(data);
    console.log('✅ Created new document with correct ID: AdministrationBldg');

    // Delete old document
    await buildingsRef.doc('AdminisitrationBldg').delete();
    console.log('🗑️  Deleted old document with typo');

    // Verify the fix
    const verifyDoc = await buildingsRef.doc('AdministrationBldg').get();
    if (verifyDoc.exists) {
      console.log('✅ ID fix verified successfully!');
      console.log('📍 New document ID: AdministrationBldg');
    }

  } catch (error) {
    console.error('❌ Error fixing Administration Building ID:', error);
  }
}

fixAdminBuildingId();
