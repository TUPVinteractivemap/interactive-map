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
}, 'check-buildings-app');

const db = getFirestore(app);

async function checkBuildings() {
  try {
    console.log('Checking buildings in Firestore...');
    const buildingsRef = db.collection('buildings');
    const snapshot = await buildingsRef.get();
    
    console.log(`Total buildings found: ${snapshot.docs.length}`);
    
    if (snapshot.docs.length === 0) {
      console.log('No buildings found in the database!');
      return;
    }
    
    // Check first few buildings to verify data structure
    snapshot.docs.slice(0, 5).forEach((doc, index) => {
      const data = doc.data();
      console.log(`\nBuilding ${index + 1}:`);
      console.log(`ID: ${doc.id}`);
      console.log(`Name: ${data.name}`);
      console.log(`Type: ${data.type}`);
      console.log(`Has pathData: ${!!data.pathData}`);
      console.log(`Has center: ${!!data.center}`);
      console.log(`PathData length: ${data.pathData?.length || 0} characters`);
    });
    
    // Check for any buildings with missing required fields
    const problemBuildings = [];
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!data.pathData || !data.name || !data.type || !data.center) {
        problemBuildings.push({
          id: doc.id,
          missing: {
            pathData: !data.pathData,
            name: !data.name,
            type: !data.type,
            center: !data.center
          }
        });
      }
    });
    
    if (problemBuildings.length > 0) {
      console.log(`\nFound ${problemBuildings.length} buildings with missing data:`);
      problemBuildings.forEach(building => {
        console.log(`${building.id}: missing ${Object.keys(building.missing).filter(key => building.missing[key]).join(', ')}`);
      });
    } else {
      console.log('\nAll buildings have required fields! ✅');
    }
    
  } catch (error) {
    console.error('Error checking buildings:', error);
  }
}

checkBuildings();
