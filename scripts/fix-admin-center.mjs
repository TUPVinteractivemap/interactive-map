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
}, 'fix-building-center-app');

const db = getFirestore(app);

function polygonCentroid(points) {
  let twiceArea = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [x0, y0] = points[j];
    const [x1, y1] = points[i];
    const cross = (x0 * y1) - (x1 * y0);
    twiceArea += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  return { x: cx / (3 * twiceArea), y: cy / (3 * twiceArea) };
}

function pointInPolygon(ptX, ptY, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    const intersect = ((yi > ptY) !== (yj > ptY)) &&
      (ptX < ((xj - xi) * (ptY - yi)) / (yj - yi + 0.0000001) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

async function setCenterInsidePolygon(buildingId, points, nudgeX = 0, nudgeY = 0) {
  // Compute centroid
  const c = polygonCentroid(points);
  let cx = c.x;
  let cy = c.y;
  console.log(`📍 ${buildingId} centroid: (${cx}, ${cy})`);

  // Spiral search for inside point if needed
  if (!pointInPolygon(cx, cy, points)) {
    console.log('  ↪ centroid outside polygon, searching...');
    const maxRadius = 40;
    const step = 1;
    let found = false;
    for (let r = 1; r <= maxRadius && !found; r += step) {
      for (let dx = -r; dx <= r && !found; dx += step) {
        const candidates = [
          [c.x + dx, c.y - r],
          [c.x + dx, c.y + r],
        ];
        for (const [tx, ty] of candidates) {
          if (pointInPolygon(tx, ty, points)) { cx = tx; cy = ty; found = true; break; }
        }
      }
      for (let dy = -r; dy <= r && !found; dy += step) {
        const candidates = [
          [c.x - r, c.y + dy],
          [c.x + r, c.y + dy],
        ];
        for (const [tx, ty] of candidates) {
          if (pointInPolygon(tx, ty, points)) { cx = tx; cy = ty; found = true; break; }
        }
      }
    }
    if (!found) console.warn('  ⚠️ could not find inside point near centroid');
    else console.log(`  ✅ inside point: (${cx}, ${cy})`);
  }

  const finalX = cx + nudgeX;
  const finalY = cy + nudgeY;
  console.log(`  🎯 final (nudged): (${finalX}, ${finalY})`);

  const buildingsRef = db.collection('buildings');
  const ref = buildingsRef.doc(buildingId);
  await ref.update({ center: { x: finalX, y: finalY } });
  console.log(`  ✅ updated ${buildingId} center.`);
}

async function main() {
  // Administration Building (already adjusted earlier) - keep last inside solution with small nudge
  await setCenterInsidePolygon('AdminisitrationBldg', [
    [997, 273],
    [1123, 345.746],
    [1049.53, 473],
    [1027.5, 460.281],
    [1080.49, 368.5],
    [1074.39, 345.746],
    [984.5, 293.846],
  ], 4, -4);

  // Modern Technology Building
  await setCenterInsidePolygon('ModernTechnologyBldg', [
    [607, 632.5],
    [730.5, 704],
    [742, 683],
    [619.5, 612],
    [607, 632.5],
  ], 2, -2); // small nudge right/up
}

main().catch(err => console.error(err));
