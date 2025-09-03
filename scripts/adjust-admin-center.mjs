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
}, 'adjust-admin-center-app');

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

// Function to find a better center point - more central within the building
function findBetterCenterPoint(polygon) {
  // Get bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  polygon.forEach(point => {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  });

  const width = maxX - minX;
  const height = maxY - minY;

  // For an administrative building, try to find a more central location
  // Try different positions within the building
  const candidates = [
    // Slightly right and down from geometric center
    { x: minX + width * 0.6, y: minY + height * 0.5 },
    // More towards the middle
    { x: minX + width * 0.55, y: minY + height * 0.45 },
    // Another central position
    { x: minX + width * 0.65, y: minY + height * 0.4 },
    // Geometric center as fallback
    { x: minX + width * 0.5, y: minY + height * 0.5 }
  ];

  // Find the first candidate that's inside the polygon
  for (const candidate of candidates) {
    if (isPointInPolygon(candidate, polygon)) {
      return candidate;
    }
  }

  // If none of the candidates work, return geometric center
  return { x: minX + width * 0.5, y: minY + height * 0.5 };
}

async function adjustAdminCenter() {
  try {
    console.log('🔧 Adjusting Administration Building center to a better position...');

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

    if (!coords || coords.length < 6) {
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

    // Find a better center point
    const betterCenter = findBetterCenterPoint(polygon);

    console.log(`📍 Current center: (${data.center.x}, ${data.center.y})`);
    console.log(`📍 New center: (${betterCenter.x.toFixed(2)}, ${betterCenter.y.toFixed(2)})`);

    // Update the building document
    await buildingsRef.doc('AdministrationBldg').update({
      center: {
        x: Math.round(betterCenter.x * 100) / 100,
        y: Math.round(betterCenter.y * 100) / 100
      }
    });

    console.log('✅ Successfully adjusted Administration Building center!');

    // Verify the update
    const updatedDoc = await buildingsRef.doc('AdministrationBldg').get();
    const updatedData = updatedDoc.data();
    const isInside = isPointInPolygon(updatedData.center, polygon);

    console.log(`🔍 Verification - New center: (${updatedData.center.x}, ${updatedData.center.y})`);
    console.log(`🏢 New center is inside building: ${isInside ? '✅ Yes' : '❌ No'}`);

  } catch (error) {
    console.error('❌ Error adjusting Administration Building center:', error);
  }
}

adjustAdminCenter();
