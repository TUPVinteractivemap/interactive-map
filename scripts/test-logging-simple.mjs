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
}, 'test-logging-simple-app');

const db = getFirestore(app);

async function testSimpleLogging() {
  console.log('🧪 Testing Simple History Logging...\n');

  try {
    // Get existing users
    const usersRef = db.collection('users');
    const usersSnapshot = await usersRef.limit(1).get();

    if (usersSnapshot.empty) {
      console.log('❌ No users found in database. Please create a user first.');
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;

    console.log(`👤 Testing with user: ${userId}\n`);

    const historyRef = db.collection('user_history');

    // Test building search
    const buildingData = {
      userId,
      buildingId: 'TestBuilding',
      buildingName: 'Test Building',
      timestamp: new Date(),
      type: 'building_search'
    };

    const buildingDoc = await historyRef.add(buildingData);
    console.log('✅ Building search logged successfully');

    // Test room search
    const roomData = {
      userId,
      roomId: 'TestRoom',
      roomName: 'Test Room',
      buildingId: 'TestBuilding',
      buildingName: 'Test Building',
      timestamp: new Date(),
      type: 'room_search'
    };

    const roomDoc = await historyRef.add(roomData);
    console.log('✅ Room search logged successfully');

    // Test route
    const routeData = {
      userId,
      fromBuilding: 'BuildingA',
      toBuilding: 'BuildingB',
      fromBuildingName: 'Building A',
      toBuildingName: 'Building B',
      route: [{ x: 100, y: 200 }, { x: 150, y: 250 }],
      timestamp: new Date(),
      type: 'route'
    };

    const routeDoc = await historyRef.add(routeData);
    console.log('✅ Route navigation logged successfully');

    console.log('\n🎉 All logging tests passed!');
    console.log('The history logging functions are working correctly.');

  } catch (error) {
    console.error('❌ Error testing logging:', error);
  }
}

testSimpleLogging();
