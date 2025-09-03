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
}, 'create-sample-history-app');

const db = getFirestore(app);

async function createSampleHistory() {
  console.log('🎯 Creating Sample History Data...\n');

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
    const userData = userDoc.data();

    console.log(`👤 Creating sample history for user: ${userData.email} (${userId})\n`);

    const historyRef = db.collection('user_history');

    // Create sample history items
    const sampleHistory = [
      {
        userId,
        type: 'route',
        fromBuilding: 'ModernTechnologyBldg',
        toBuilding: 'EngineeringBldg',
        fromBuildingName: 'Modern Technology Building',
        toBuildingName: 'Engineering Building',
        route: [
          { x: 1000, y: 500 },
          { x: 1050, y: 450 },
          { x: 1100, y: 400 }
        ],
        timestamp: new Date(Date.now() - 300000) // 5 minutes ago
      },
      {
        userId,
        type: 'building_search',
        buildingId: 'CampusBusinessCenter',
        buildingName: 'Campus Business Center',
        searchQuery: 'business center',
        timestamp: new Date(Date.now() - 240000) // 4 minutes ago
      },
      {
        userId,
        type: 'room_search',
        roomId: 'MTB101',
        roomName: 'MTB Room 101',
        buildingId: 'ModernTechnologyBldg',
        buildingName: 'Modern Technology Building',
        searchQuery: 'mtb 101',
        timestamp: new Date(Date.now() - 180000) // 3 minutes ago
      },
      {
        userId,
        type: 'building_search',
        buildingId: 'EngineeringBldg',
        buildingName: 'Engineering Building',
        timestamp: new Date(Date.now() - 120000) // 2 minutes ago
      },
      {
        userId,
        type: 'route',
        fromBuilding: 'EngineeringBldg',
        toBuilding: 'TechnologyBldg',
        fromBuildingName: 'Engineering Building',
        toBuildingName: 'Technology Building',
        route: [
          { x: 1100, y: 400 },
          { x: 1150, y: 350 },
          { x: 1200, y: 300 }
        ],
        timestamp: new Date(Date.now() - 60000) // 1 minute ago
      }
    ];

    console.log('📝 Adding sample history items...');

    for (const [index, item] of sampleHistory.entries()) {
      const docRef = await historyRef.add({
        ...item,
        timestamp: item.timestamp
      });
      console.log(`✅ Added ${item.type} history item ${index + 1}: ${docRef.id}`);
    }

    console.log('\n🎉 Sample history data created successfully!');
    console.log('\n💡 You can now:');
    console.log('   • Visit /history to view the sample data');
    console.log('   • Test the history functionality');
    console.log('   • Delete items and clear history');
    console.log('   • Create real history by interacting with the map');

    // Verify the data was created
    const verifyQuery = await historyRef.where('userId', '==', userId).get();
    console.log(`\n📊 Verification: ${verifyQuery.size} history items found for user`);

  } catch (error) {
    console.error('❌ Error creating sample history:', error);
  }
}

createSampleHistory();
