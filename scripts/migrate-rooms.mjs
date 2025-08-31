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
}, 'rooms-app');

const db = getFirestore(app);

// Room data with tags
const roomData = {
  // Modern Technology Building
  'MTB-Auditorium': {
    name: 'Auditorium',
    buildingId: 'ModernTechnologyBldg',
    floor: 1,
    description: 'Main auditorium for events and gatherings',
    tags: ['auditorium', 'events', 'ground floor', 'gathering']
  },
  'MTB-DirectorsOffice': {
    name: 'Office of the Campus Director',
    buildingId: 'ModernTechnologyBldg',
    floor: 1,
    description: 'Office of the Campus Director',
    tags: ['office', 'admin', 'director', 'ground floor']
  },
  'MTB-ConferenceRoom': {
    name: 'Conference Room',
    buildingId: 'ModernTechnologyBldg',
    floor: 1,
    description: 'Meeting and conference room for faculty and staff',
    tags: ['conference', 'meeting', 'ground floor']
  },
  'MTB-Room1': {
    name: 'MTB Room 1',
    buildingId: 'ModernTechnologyBldg',
    floor: 2,
    description: 'Lecture Room',
    tags: ['classroom', 'lecture', 'second floor']
  },
  'MTB-Room2': {
    name: 'MTB Room 2',
    buildingId: 'ModernTechnologyBldg',
    floor: 2,
    description: 'Lecture Room',
    tags: ['classroom', 'lecture', 'second floor']
  },
  'MTB-Room3': {
    name: 'MTB Room 3',
    buildingId: 'ModernTechnologyBldg',
    floor: 2,
    description: 'Lecture Room',
    tags: ['classroom', 'lecture', 'second floor']
  },
  'MTB-Room4': {
    name: 'MTB Room 4',
    buildingId: 'ModernTechnologyBldg',
    floor: 2,
    description: 'Lecture Room',
    tags: ['classroom', 'lecture', 'second floor']
  },
  'MTB-PhysicsLab': {
    name: 'Physics Laboratory',
    buildingId: 'ModernTechnologyBldg',
    floor: 2,
    description: 'Physics Laboratory with Preparation Room',
    tags: ['laboratory', 'physics', 'science', 'second floor']
  },
  'MTB-Room5': {
    name: 'MTB Room 5',
    buildingId: 'ModernTechnologyBldg',
    floor: 3,
    description: 'Lecture Room',
    tags: ['classroom', 'lecture', 'third floor']
  },
  'MTB-CTLR1': {
    name: 'MTB Room 6 (CTLR 1)',
    buildingId: 'ModernTechnologyBldg',
    floor: 3,
    description: 'ChemTech Lecture Room 1',
    tags: ['classroom', 'lecture', 'chemtech', 'third floor']
  },
  'MTB-CTLR2': {
    name: 'MTB Room 7 (CTLR 2)',
    buildingId: 'ModernTechnologyBldg',
    floor: 3,
    description: 'ChemTech Lecture Room 2',
    tags: ['classroom', 'lecture', 'chemtech', 'third floor']
  },
  'MTB-Room8': {
    name: 'MTB Room 8',
    buildingId: 'ModernTechnologyBldg',
    floor: 3,
    description: 'Lecture Room',
    tags: ['classroom', 'lecture', 'third floor']
  },
  'MTB-Room9': {
    name: 'MTB Room 9',
    buildingId: 'ModernTechnologyBldg',
    floor: 3,
    description: 'MXT Room 2',
    tags: ['classroom', 'lecture', 'third floor']
  },
  'MTB-Room10': {
    name: 'MTB Room 10',
    buildingId: 'ModernTechnologyBldg',
    floor: 3,
    description: 'Lecture Room',
    tags: ['classroom', 'lecture', 'third floor']
  },

  // Engineering Building
  'EB-SMTC': {
    name: 'Surface Mount Technology Center',
    buildingId: 'EngineeringBldg',
    floor: 1,
    description: 'Surface Mount Technology Center (SMTC)',
    tags: ['laboratory', 'technology', 'ground floor', 'electronics']
  },
  'EB-COE': {
    name: 'College of Engineering Office',
    buildingId: 'EngineeringBldg',
    floor: 1,
    description: 'College of Engineering (COE) Office',
    tags: ['office', 'admin', 'engineering', 'ground floor']
  },
  'EB-Registrar': {
    name: 'Registrar Office',
    buildingId: 'EngineeringBldg',
    floor: 1,
    description: 'Registrar Office for academic records and transactions',
    tags: ['office', 'admin', 'registrar', 'ground floor']
  },
  'EB-Room31': {
    name: 'Room 31',
    buildingId: 'EngineeringBldg',
    floor: 2,
    description: 'Lecture Room',
    tags: ['classroom', 'lecture', 'first floor']
  },
  'EB-Room32': {
    name: 'Room 32',
    buildingId: 'EngineeringBldg',
    floor: 2,
    description: 'Lecture Room',
    tags: ['classroom', 'lecture', 'first floor']
  },
  'EB-Room33': {
    name: 'Room 33',
    buildingId: 'EngineeringBldg',
    floor: 2,
    description: 'Lecture Room',
    tags: ['classroom', 'lecture', 'first floor']
  },
  'EB-Room34': {
    name: 'Room 34',
    buildingId: 'EngineeringBldg',
    floor: 2,
    description: 'Lecture Room',
    tags: ['classroom', 'lecture', 'first floor']
  },

  // Technology Building
  'TB-Records': {
    name: 'Records Office',
    buildingId: 'TechnologyBldg',
    floor: 1,
    description: 'Records management office',
    tags: ['office', 'admin', 'records', 'ground floor']
  },
  'TB-TechResearch': {
    name: 'Technical Research and Development Center',
    buildingId: 'TechnologyBldg',
    floor: 1,
    description: 'Research and development facility',
    tags: ['research', 'development', 'ground floor']
  },
  'TB-MachineShop': {
    name: 'Machine Shop Area',
    buildingId: 'TechnologyBldg',
    floor: 1,
    description: 'Machine shop for practical training',
    tags: ['workshop', 'machines', 'ground floor']
  },
  'TB-ADAA': {
    name: 'Assistant Director for Academic Affairs Office',
    buildingId: 'TechnologyBldg',
    floor: 1,
    description: 'ADAA Office',
    tags: ['office', 'admin', 'academic affairs', 'ground floor']
  },
  'TB-Room37A': {
    name: 'Room 37A',
    buildingId: 'TechnologyBldg',
    floor: 2,
    description: 'Lecture Room',
    tags: ['classroom', 'lecture', 'first floor']
  },
  'TB-Room38': {
    name: 'Room 38',
    buildingId: 'TechnologyBldg',
    floor: 2,
    description: 'Lecture Room',
    tags: ['classroom', 'lecture', 'first floor']
  },
  'TB-Room39': {
    name: 'Room 39',
    buildingId: 'TechnologyBldg',
    floor: 2,
    description: 'Electromechanical Engineering Technology Room',
    tags: ['classroom', 'lecture', 'electromechanical', 'first floor']
  }
};

async function migrateRooms() {
  const batch = db.batch();
  const roomsRef = db.collection('rooms');

  Object.entries(roomData).forEach(([id, room]) => {
    const docRef = roomsRef.doc(id);
    batch.set(docRef, { id, ...room });
  });

  try {
    await batch.commit();
    console.log('Successfully migrated room data to Firestore');
  } catch (error) {
    console.error('Error migrating room data:', error);
  }
}

// Run migration
migrateRooms();
