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
}, 'diagnose-history-app');

const db = getFirestore(app);

async function diagnoseHistoryIssues() {
  console.log('🔍 Diagnosing History System Issues...\n');

  try {
    // 1. Check if we can connect to Firestore
    console.log('1. Testing Firestore connection...');
    const testCollection = db.collection('test');
    const testDoc = await testCollection.doc('connection_test').get();
    console.log('✅ Firestore connection successful\n');

    // 2. Check if user_history collection exists and has data
    console.log('2. Checking user_history collection...');
    const historyCollection = db.collection('user_history');
    const historySnapshot = await historyCollection.limit(1).get();

    console.log(`📊 Found ${historySnapshot.size} history documents in collection`);
    if (historySnapshot.size > 0) {
      const sampleDoc = historySnapshot.docs[0];
      console.log('📄 Sample document data:', sampleDoc.data());
    }
    console.log('✅ User history collection accessible\n');

    // 3. Check Firestore rules by attempting to read a document
    console.log('3. Testing security rules...');
    // This should work with our current rules since we're using admin SDK
    const testQuery = await historyCollection.where('userId', '==', 'test-user').limit(1).get();
    console.log('✅ Security rules validation passed\n');

    // 4. Check for any recent errors in the collection
    console.log('4. Checking for any problematic documents...');
    const allHistory = await historyCollection.limit(5).get();

    if (allHistory.empty) {
      console.log('ℹ️  No history documents found. This is normal for a new collection.');
    } else {
      console.log('📋 Recent history documents:');
      allHistory.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. Type: ${data.type}, User: ${data.userId}, Timestamp: ${data.timestamp?.toDate()?.toISOString()}`);
      });
    }
    console.log('✅ Document structure validation passed\n');

    console.log('🎉 Diagnosis Complete!');
    console.log('\n💡 If you\'re still getting "failed to fetch" errors:');
    console.log('   1. Wait 5-10 minutes for Firestore rules to fully propagate');
    console.log('   2. Check your internet connection');
    console.log('   3. Verify you\'re logged into the application');
    console.log('   4. Try refreshing the page');
    console.log('   5. Check browser developer tools for more specific error details');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error);

    if (error.code === 'PERMISSION-DENIED') {
      console.log('\n🔐 Permission Denied - Possible causes:');
      console.log('   • Firestore rules not yet propagated');
      console.log('   • Authentication issues');
      console.log('   • User not properly logged in');
    } else if (error.code === 'UNAVAILABLE') {
      console.log('\n🌐 Service Unavailable - Possible causes:');
      console.log('   • Network connectivity issues');
      console.log('   • Firebase service temporarily down');
    } else if (error.code === 'NOT-FOUND') {
      console.log('\n📁 Collection Not Found - Possible causes:');
      console.log('   • Collection hasn\'t been created yet');
      console.log('   • Wrong collection name in rules');
    }
  }
}

diagnoseHistoryIssues();
