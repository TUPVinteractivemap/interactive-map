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
}, 'test-building-search-app');

const db = getFirestore(app);

async function testBuildingSearchLogging() {
  console.log('🧪 Testing Building Search Logging...\n');

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

    // Test 1: Building search with searchQuery
    console.log('1. Testing building search with searchQuery...');
    const testData1 = {
      userId,
      buildingId: 'ModernTechnologyBldg',
      buildingName: 'Modern Technology Building',
      searchQuery: 'modern tech',
      timestamp: new Date(),
      type: 'building_search'
    };

    const docRef1 = await historyRef.add(testData1);
    console.log('✅ Successfully added building search with searchQuery:', docRef1.id);

    // Test 2: Building search without searchQuery (simulating dropdown selection)
    console.log('2. Testing building search without searchQuery...');
    const testData2 = {
      userId,
      buildingId: 'EngineeringBldg',
      buildingName: 'Engineering Building',
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      type: 'building_search'
    };

    const docRef2 = await historyRef.add(testData2);
    console.log('✅ Successfully added building search without searchQuery:', docRef2.id);

    // Test 3: Room search with searchQuery
    console.log('3. Testing room search with searchQuery...');
    const testData3 = {
      userId,
      roomId: 'MTB101',
      roomName: 'MTB Room 101',
      buildingId: 'ModernTechnologyBldg',
      buildingName: 'Modern Technology Building',
      searchQuery: 'mtb 101',
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
      type: 'room_search'
    };

    const docRef3 = await historyRef.add(testData3);
    console.log('✅ Successfully added room search with searchQuery:', docRef3.id);

    // Test 4: Room search without searchQuery (simulating direct selection)
    console.log('4. Testing room search without searchQuery...');
    const testData4 = {
      userId,
      roomId: 'ENG201',
      roomName: 'Engineering Room 201',
      buildingId: 'EngineeringBldg',
      buildingName: 'Engineering Building',
      timestamp: new Date(Date.now() - 180000), // 3 minutes ago
      type: 'room_search'
    };

    const docRef4 = await historyRef.add(testData4);
    console.log('✅ Successfully added room search without searchQuery:', docRef4.id);

    console.log('\n🎉 All building and room search logging tests passed!');
    console.log('\n📊 Verification: Checking stored data...');

    // Verify the data was stored correctly
    const verifyQuery = await historyRef.where('userId', '==', userId).orderBy('timestamp', 'desc').limit(10).get();

    console.log(`Found ${verifyQuery.size} history items for user`);
    verifyQuery.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.type}: ${data.buildingName || data.roomName} (${data.searchQuery || 'no search query'})`);
    });

  } catch (error) {
    console.error('❌ Error testing building search logging:', error);
    console.error('Error details:', error);
  }
}

testBuildingSearchLogging();
