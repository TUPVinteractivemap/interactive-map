
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

let serviceAccount: admin.ServiceAccount;

try {
  // Read service account credentials from the JSON file
  const serviceAccountPath = join(process.cwd(), 'firebase-admin-key.json');
  const serviceAccountJson = readFileSync(serviceAccountPath, 'utf8');
  serviceAccount = JSON.parse(serviceAccountJson);
} catch (error) {
  console.error('Error reading Firebase admin key:', error);
  throw new Error('Firebase admin key not found or invalid');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export function initAdmin() {
  return admin;
}
