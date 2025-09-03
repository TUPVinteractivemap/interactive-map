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
}, 'center-admin-center-app');

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

// Function to find the most central point inside the building
function findMostCentralPoint(polygon) {
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

  // Calculate geometric center
  const geometricCenterX = minX + width * 0.5;
  const geometricCenterY = minY + height * 0.5;

  // Check if geometric center is inside polygon
  if (isPointInPolygon({ x: geometricCenterX, y: geometricCenterY }, polygon)) {
    return { x: geometricCenterX, y: geometricCenterY };
  }

  // If geometric center is not inside, try a grid search for the most central point
  const gridSize = 20; // 20x20 grid
  let bestPoint = null;
  let bestDistance = Infinity;

  for (let i = 0; i <= gridSize; i++) {
    for (let j = 0; j <= gridSize; j++) {
      const testX = minX + (width * i) / gridSize;
      const testY = minY + (height * j) / gridSize;

      if (isPointInPolygon({ x: testX, y: testY }, polygon)) {
        // Calculate distance from geometric center
        const distance = Math.sqrt(
          Math.pow(testX - geometricCenterX, 2) +
          Math.pow(testY - geometricCenterY, 2)
        );

        if (distance < bestDistance) {
          bestDistance = distance;
          bestPoint = { x: testX, y: testY };
        }
      }
    }
  }

  return bestPoint || { x: geometricCenterX, y: geometricCenterY };
}

async function centerAdminCenter() {
  try {
    console.log('🔧 Centering Administration Building center point...');

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

    // Find the most central point
    const centralPoint = findMostCentralPoint(polygon);

    console.log(`📍 Current center: (${data.center.x}, ${data.center.y})`);
    console.log(`📍 New central point: (${centralPoint.x.toFixed(2)}, ${centralPoint.y.toFixed(2)})`);

    // Update the building document
    await buildingsRef.doc('AdministrationBldg').update({
      center: {
        x: Math.round(centralPoint.x * 100) / 100,
        y: Math.round(centralPoint.y * 100) / 100
      }
    });

    console.log('✅ Successfully centered Administration Building center point!');

    // Verify the update
    const updatedDoc = await buildingsRef.doc('AdministrationBldg').get();
    const updatedData = updatedDoc.data();
    const isInside = isPointInPolygon(updatedData.center, polygon);

    console.log(`🔍 Verification - New center: (${updatedData.center.x}, ${updatedData.center.y})`);
    console.log(`🏢 New center is inside building: ${isInside ? '✅ Yes' : '❌ No'}`);

    // Calculate distance from geometric center
    const minX = Math.min(...polygon.map(p => p.x));
    const maxX = Math.max(...polygon.map(p => p.x));
    const minY = Math.min(...polygon.map(p => p.y));
    const maxY = Math.max(...polygon.map(p => p.y));

    const geometricCenterX = minX + (maxX - minX) * 0.5;
    const geometricCenterY = minY + (maxY - minY) * 0.5;

    const distanceFromCenter = Math.sqrt(
      Math.pow(updatedData.center.x - geometricCenterX, 2) +
      Math.pow(updatedData.center.y - geometricCenterY, 2)
    );

    console.log(`📏 Distance from geometric center: ${distanceFromCenter.toFixed(2)} pixels`);

  } catch (error) {
    console.error('❌ Error centering Administration Building center:', error);
  }
}

centerAdminCenter();
