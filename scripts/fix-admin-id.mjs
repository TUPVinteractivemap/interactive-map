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
    console.log('🔧 Reverting Administration Building ID back to original (misspelled)...');

    const buildingsRef = db.collection('buildings');

    // Get the current document with correct spelling
    const correctDoc = await buildingsRef.doc('AdministrationBldg').get();

    if (!correctDoc.exists) {
      console.log('❌ Correct document not found!');
      return;
    }

    const data = correctDoc.data();
    console.log('📋 Current data:', data);

    // Create new document with original misspelled ID
    const newDocRef = await buildingsRef.doc('AdminisitrationBldg').set(data);
    console.log('✅ Created new document with original ID: AdminisitrationBldg');

    // Delete correct document
    await buildingsRef.doc('AdministrationBldg').delete();
    console.log('🗑️  Deleted correct document');

    // Verify the fix
    const verifyDoc = await buildingsRef.doc('AdminisitrationBldg').get();
    if (verifyDoc.exists) {
      console.log('✅ ID revert verified successfully!');
      console.log('📍 New document ID: AdminisitrationBldg');
    }

  } catch (error) {
    console.error('❌ Error reverting Administration Building ID:', error);
  }
}

fixAdminBuildingId();
