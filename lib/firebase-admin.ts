import admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_ADMIN_KEY
  ? JSON.parse(process.env.FIREBASE_ADMIN_KEY)
  : (await import('../firebase-admin-key.json')).default;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export function initAdmin() {
  return admin;
}
