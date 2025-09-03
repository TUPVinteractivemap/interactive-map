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
}, 'check-admin-center-app');

const db = getFirestore(app);

async function checkAdminBuildingCenter() {
  try {
    console.log('Checking Administration Building center coordinates...');
    const buildingsRef = db.collection('buildings');
    const adminDoc = await buildingsRef.doc('AdministrationBldg').get();

    if (!adminDoc.exists) {
      console.log('❌ Administration Building not found!');
      return;
    }

    const data = adminDoc.data();
    console.log('\n📍 Administration Building Data:');
    console.log(`ID: ${adminDoc.id}`);
    console.log(`Name: ${data.name}`);
    console.log(`Type: ${data.type}`);
    console.log(`Center coordinates: (${data.center.x}, ${data.center.y})`);
    console.log(`PathData: ${data.pathData}`);

    // Calculate expected center from building areas in routing.ts
    // Admin building area: x1: 965, y1: 260, x2: 1140, y2: 490
    const expectedCenterX = (965 + 1140) / 2; // 1052.5
    const expectedCenterY = (260 + 490) / 2; // 375

    console.log('\n📐 Expected center (from routing.ts building areas):');
    console.log(`Expected center: (${expectedCenterX}, ${expectedCenterY})`);

    console.log('\n🔍 Comparison:');
    console.log(`X difference: ${Math.abs(data.center.x - expectedCenterX)}`);
    console.log(`Y difference: ${Math.abs(data.center.y - expectedCenterY)}`);

    if (Math.abs(data.center.x - expectedCenterX) > 1 || Math.abs(data.center.y - expectedCenterY) > 1) {
      console.log('\n⚠️  WARNING: Center coordinates mismatch! This might cause routing issues.');
    } else {
      console.log('\n✅ Center coordinates match!');
    }

    // Calculate actual center from SVG path data
    console.log('\n📐 Calculating center from SVG path data...');

    // Parse SVG path data to get actual center
    const pathData = data.pathData;
    const coords = pathData.match(/-?\d+\.?\d*/g);
    if (coords && coords.length >= 4) { // Need at least 2 points (4 coordinates)
      const points = [];
      for (let i = 0; i < coords.length; i += 2) {
        if (i + 1 < coords.length) {
          points.push({
            x: parseFloat(coords[i]),
            y: parseFloat(coords[i + 1])
          });
        }
      }

      if (points.length > 0) {
        // Calculate centroid (average of all points)
        const centroidX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
        const centroidY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

        console.log(`📍 Centroid from SVG path: (${centroidX.toFixed(2)}, ${centroidY.toFixed(2)})`);
        console.log(`📍 Current center: (${data.center.x}, ${data.center.y})`);
        console.log(`📍 Expected center (bounding box): (${expectedCenterX}, ${expectedCenterY})`);

        // Check if current center is inside the building area
        const isInsideArea = data.center.x >= 965 && data.center.x <= 1140 &&
                           data.center.y >= 260 && data.center.y <= 490;
        console.log(`🏢 Current center inside building area: ${isInsideArea ? '✅ Yes' : '❌ No'}`);

        const isCentroidInsideArea = centroidX >= 965 && centroidX <= 1140 &&
                                   centroidY >= 260 && centroidY <= 490;
        console.log(`🏢 Centroid inside building area: ${isCentroidInsideArea ? '✅ Yes' : '❌ No'}`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking Administration Building:', error);
  }
}

checkAdminBuildingCenter();
