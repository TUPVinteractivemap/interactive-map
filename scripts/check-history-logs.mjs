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
}, 'check-history-logs-app');

const db = getFirestore(app);

async function checkHistoryLogs() {
  console.log('🔍 Checking History Logs in Database...\n');

  try {
    const historyRef = db.collection('user_history');

    // Get all history documents
    const snapshot = await historyRef.get();

    console.log(`📊 Total history documents in database: ${snapshot.size}\n`);

    if (snapshot.size === 0) {
      console.log('⚠️  No history documents found. This suggests logging is not working.\n');
      console.log('🔧 Possible causes:');
      console.log('   1. History logging functions are not being called');
      console.log('   2. Authentication issues');
      console.log('   3. Firestore rules blocking writes');
      console.log('   4. JavaScript errors preventing execution\n');

      return;
    }

    // Analyze the documents
    const byType = {};
    const byUser = {};
    const recentDocs = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const timestamp = data.timestamp?.toDate?.() || new Date(data.timestamp);

      // Count by type
      byType[data.type] = (byType[data.type] || 0) + 1;

      // Count by user
      byUser[data.userId] = (byUser[data.userId] || 0) + 1;

      // Keep track of recent documents
      recentDocs.push({
        id: doc.id,
        type: data.type,
        userId: data.userId,
        timestamp,
        data
      });
    });

    // Sort by timestamp and get most recent
    recentDocs.sort((a, b) => b.timestamp - a.timestamp);

    console.log('📈 History Statistics:');
    console.log(`   Total documents: ${snapshot.size}`);
    console.log(`   Types: ${JSON.stringify(byType, null, 2)}`);
    console.log(`   Users: ${Object.keys(byUser).length} unique users\n`);

    console.log('🕐 Most Recent History Entries:');
    recentDocs.slice(0, 5).forEach((doc, index) => {
      const timeAgo = Math.round((Date.now() - doc.timestamp) / 1000 / 60); // minutes ago
      console.log(`${index + 1}. ${doc.type} - ${doc.userId} - ${timeAgo} minutes ago`);

      if (doc.type === 'building_search') {
        console.log(`   Building: ${doc.data.buildingName}`);
        if (doc.data.searchQuery) {
          console.log(`   Search: "${doc.data.searchQuery}"`);
        }
      } else if (doc.type === 'room_search') {
        console.log(`   Room: ${doc.data.roomName} (${doc.data.buildingName})`);
        if (doc.data.searchQuery) {
          console.log(`   Search: "${doc.data.searchQuery}"`);
        }
      } else if (doc.type === 'route') {
        console.log(`   Route: ${doc.data.fromBuildingName} → ${doc.data.toBuildingName}`);
      }
      console.log('');
    });

    // Check if there are any documents with missing required fields
    console.log('🔍 Data Quality Check:');
    let validDocs = 0;
    let invalidDocs = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      const hasRequiredFields = data.userId && data.type && data.timestamp;

      if (hasRequiredFields) {
        validDocs++;
      } else {
        invalidDocs++;
        console.log(`   ❌ Invalid document ${doc.id}: missing ${!data.userId ? 'userId ' : ''}${!data.type ? 'type ' : ''}${!data.timestamp ? 'timestamp' : ''}`);
      }
    });

    console.log(`   ✅ Valid documents: ${validDocs}`);
    console.log(`   ❌ Invalid documents: ${invalidDocs}`);

  } catch (error) {
    console.error('❌ Error checking history logs:', error);
    console.error('Error details:', error);
  }
}

checkHistoryLogs();
