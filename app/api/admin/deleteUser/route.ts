import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { initAdmin } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { uid, adminUid } = await request.json();

    if (!uid || !adminUid) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize Firebase Admin
    initAdmin();

    // Verify admin status
    const adminDoc = await admin.firestore().collection('admins').doc(adminUid).get();
    if (!adminDoc.exists) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Delete user from Authentication
    await admin.auth().deleteUser(uid);

    // Delete user document from Firestore
    await admin.firestore().collection('users').doc(uid).delete();

    // Delete user's history
    const historySnapshot = await admin.firestore()
      .collection('user_history')
      .where('userId', '==', uid)
      .get();

    const batch = admin.firestore().batch();
    historySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}