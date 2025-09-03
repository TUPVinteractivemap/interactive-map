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
}, 'test-history-app');

const db = getFirestore(app);

async function testHistorySystem() {
  try {
    console.log('🧪 Testing User History System...\n');

    // Get all users from the database
    const usersRef = db.collection('users');
    const usersSnapshot = await usersRef.get();

    if (usersSnapshot.empty) {
      console.log('❌ No users found in database. Please create a user first.');
      return;
    }

    const firstUser = usersSnapshot.docs[0];
    const userId = firstUser.id;
    const userData = firstUser.data();

    console.log(`👤 Testing with user: ${userData.email} (${userId})\n`);

    // Test logging different types of activities
    const historyRef = db.collection('user_history');

    // 1. Log a route navigation
    console.log('📍 Logging route navigation...');
    await historyRef.add({
      userId,
      fromBuilding: 'ModernTechnologyBldg',
      toBuilding: 'EngineeringBldg',
      fromBuildingName: 'Modern Technology Building',
      toBuildingName: 'Engineering Building',
      route: [
        { x: 1000, y: 500 },
        { x: 1050, y: 450 },
        { x: 1100, y: 400 }
      ],
      timestamp: new Date(),
      type: 'route'
    });

    // 2. Log a building search
    console.log('🏢 Logging building search...');
    await historyRef.add({
      userId,
      buildingId: 'CampusBusinessCenter',
      buildingName: 'Campus Business Center',
      searchQuery: 'business center',
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      type: 'building_search'
    });

    // 3. Log a room search
    console.log('🚪 Logging room search...');
    await historyRef.add({
      userId,
      roomId: 'MTB101',
      roomName: 'MTB Room 101',
      buildingId: 'ModernTechnologyBldg',
      buildingName: 'Modern Technology Building',
      searchQuery: 'mtb 101',
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
      type: 'room_search'
    });

    console.log('✅ Successfully logged test activities!\n');

    // Verify the data was saved
    console.log('🔍 Verifying saved data...');
    const historyQuery = historyRef
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(10);

    const historySnapshot = await historyQuery.get();

    console.log(`📊 Found ${historySnapshot.size} history items:`);

    historySnapshot.forEach((doc, index) => {
      const data = doc.data();
      const timestamp = data.timestamp.toDate();
      console.log(`${index + 1}. ${data.type}: ${timestamp.toLocaleString()}`);
    });

    console.log('\n🎉 History system test completed successfully!');
    console.log('\n💡 You can now:');
    console.log('   • View history at /history');
    console.log('   • Use the history context in your components');
    console.log('   • Log activities automatically when users interact with the map');

  } catch (error) {
    console.error('❌ Error testing history system:', error);
  }
}

testHistorySystem();
