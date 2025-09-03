// Test script to check history functionality from browser console
// Copy and paste this into the browser console when logged into the app

window.testHistorySystem = async () => {
  console.log('🧪 Testing History System from Browser...');

  try {
    // Test 1: Check if Firebase is initialized
    if (!window.firebase || !window.firebase.firestore) {
      throw new Error('Firebase not initialized');
    }
    console.log('✅ Firebase initialized');

    // Test 2: Check authentication
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }
    console.log('✅ User authenticated:', user.email);

    // Test 3: Try to access user_history collection
    const { getFirestore, collection, query, where, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const db = getFirestore();

    console.log('🔍 Testing user_history collection access...');

    const historyRef = collection(db, 'user_history');
    const q = query(
      historyRef,
      where('userId', '==', user.uid),
      limit(5)
    );

    const snapshot = await getDocs(q);
    console.log('✅ Successfully queried user_history collection');
    console.log('📊 Found', snapshot.size, 'history items');

    // Test 4: Try to create a test history item
    console.log('📝 Testing history item creation...');
    const { addDoc, Timestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    const testHistoryItem = {
      userId: user.uid,
      type: 'building_search',
      buildingId: 'test-building',
      buildingName: 'Test Building',
      searchQuery: 'test query',
      timestamp: Timestamp.now()
    };

    const docRef = await addDoc(historyRef, testHistoryItem);
    console.log('✅ Successfully created test history item:', docRef.id);

    return {
      success: true,
      user: user.email,
      historyCount: snapshot.size,
      testDocId: docRef.id
    };

  } catch (error) {
    console.error('❌ History system test failed:', error);

    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error
    };
  }
};

// Auto-run the test if this script is loaded
if (typeof window !== 'undefined') {
  console.log('💡 Run testHistorySystem() to test the history functionality');
  console.log('💡 Or use the function: await testHistorySystem()');
}
