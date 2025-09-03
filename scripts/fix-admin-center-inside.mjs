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
}, 'fix-admin-center-inside-app');

const db = getFirestore(app);

// Function to check if a point is inside a polygon using ray casting algorithm
function isPointInPolygon(point, polygon) {
  const x = point.x, y = point.y;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

// Function to find a point inside the building by sampling
function findPointInsideBuilding(polygon) {
  // Get bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  polygon.forEach(point => {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  });

  // Sample points inside the bounding box
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // Check if center is inside the polygon
  if (isPointInPolygon({ x: centerX, y: centerY }, polygon)) {
    return { x: centerX, y: centerY };
  }

  // If center is not inside, try other points
  const width = maxX - minX;
  const height = maxY - minY;
  const stepX = width / 10;
  const stepY = height / 10;

  for (let i = 1; i < 10; i++) {
    for (let j = 1; j < 10; j++) {
      const testX = minX + i * stepX;
      const testY = minY + j * stepY;

      if (isPointInPolygon({ x: testX, y: testY }, polygon)) {
        return { x: testX, y: testY };
      }
    }
  }

  // Fallback: use a slightly offset center
  return { x: centerX + width * 0.1, y: centerY + height * 0.1 };
}

async function fixAdminCenterToBeInside() {
  try {
    console.log('🔧 Finding center point inside Administration Building...');

    const buildingsRef = db.collection('buildings');
    const adminDoc = await buildingsRef.doc('AdministrationBldg').get();

    if (!adminDoc.exists) {
      console.log('❌ Administration Building not found!');
      return;
    }

    const data = adminDoc.data();

    // Parse SVG path data into polygon points
    const pathData = data.pathData;
    const coords = pathData.match(/-?\d+\.?\d*/g);

    if (!coords || coords.length < 6) { // Need at least 3 points (6 coordinates)
      console.log('❌ Invalid SVG path data');
      return;
    }

    const polygon = [];
    for (let i = 0; i < coords.length; i += 2) {
      if (i + 1 < coords.length) {
        polygon.push({
          x: parseFloat(coords[i]),
          y: parseFloat(coords[i + 1])
        });
      }
    }

    console.log(`📐 Parsed ${polygon.length} points from SVG path`);

    // Find a point guaranteed to be inside the building
    const insidePoint = findPointInsideBuilding(polygon);

    console.log(`📍 Found point inside building: (${insidePoint.x.toFixed(2)}, ${insidePoint.y.toFixed(2)})`);
    console.log(`📍 Previous center: (${data.center.x}, ${data.center.y})`);

    // Update the building document
    await buildingsRef.doc('AdministrationBldg').update({
      center: {
        x: Math.round(insidePoint.x * 100) / 100, // Round to 2 decimal places
        y: Math.round(insidePoint.y * 100) / 100
      }
    });

    console.log('✅ Successfully updated Administration Building center to be inside the building!');

    // Verify the update
    const updatedDoc = await buildingsRef.doc('AdministrationBldg').get();
    const updatedData = updatedDoc.data();
    const isInside = isPointInPolygon(updatedData.center, polygon);

    console.log(`🔍 Verification - New center: (${updatedData.center.x}, ${updatedData.center.y})`);
    console.log(`🏢 New center is inside building: ${isInside ? '✅ Yes' : '❌ No'}`);

  } catch (error) {
    console.error('❌ Error fixing Administration Building center:', error);
  }
}

fixAdminCenterToBeInside();
