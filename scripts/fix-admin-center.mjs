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
}, 'fix-admin-center-app');

const db = getFirestore(app);

async function fixAdminBuildingCenter() {
  try {
    console.log('🔧 Fixing Administration Building center coordinates...');

    // Calculate correct center from building area in routing.ts
    // Admin building area: x1: 965, y1: 260, x2: 1140, y2: 490
    const correctCenterX = (965 + 1140) / 2; // 1052.5
    const correctCenterY = (260 + 490) / 2; // 375

    console.log(`📐 Correct center coordinates: (${correctCenterX}, ${correctCenterY})`);

    // Update the building document
    const buildingsRef = db.collection('buildings');
    const adminRef = buildingsRef.doc('AdminisitrationBldg');

    await adminRef.update({
      center: {
        x: correctCenterX,
        y: correctCenterY
      }
    });

    console.log('✅ Successfully updated Administration Building center coordinates!');

    // Verify the update
    const updatedDoc = await adminRef.get();
    const updatedData = updatedDoc.data();
    console.log(`🔍 Verification - New center: (${updatedData.center.x}, ${updatedData.center.y})`);

  } catch (error) {
    console.error('❌ Error fixing Administration Building center coordinates:', error);
  }
}

fixAdminBuildingCenter();
