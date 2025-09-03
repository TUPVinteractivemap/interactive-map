import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

export interface RouteHistoryItem {
  id?: string;
  userId: string;
  fromBuilding: string;
  toBuilding: string;
  fromBuildingName: string;
  toBuildingName: string;
  route: Array<{ x: number; y: number }>;
  timestamp: Timestamp;
  type: 'route';
}

export interface BuildingSearchHistoryItem {
  id?: string;
  userId: string;
  buildingId: string;
  buildingName: string;
  searchQuery?: string;
  timestamp: Timestamp;
  type: 'building_search';
}

export interface RoomSearchHistoryItem {
  id?: string;
  userId: string;
  roomId: string;
  roomName: string;
  buildingId: string;
  buildingName: string;
  searchQuery?: string;
  timestamp: Timestamp;
  type: 'room_search';
}

export type HistoryItem = RouteHistoryItem | BuildingSearchHistoryItem | RoomSearchHistoryItem;

type HistoryDocumentData = {
  userId: string;
  buildingId?: string;
  buildingName?: string;
  roomId?: string;
  roomName?: string;
  fromBuilding?: string;
  toBuilding?: string;
  fromBuildingName?: string;
  toBuildingName?: string;
  route?: Array<{ x: number; y: number }>;
  searchQuery?: string;
  timestamp: Timestamp;
  type: 'route' | 'building_search' | 'room_search';
};

const HISTORY_COLLECTION = 'user_history';

// Log a route navigation
export async function logRouteNavigation(
  userId: string,
  fromBuilding: string,
  toBuilding: string,
  fromBuildingName: string,
  toBuildingName: string,
  route: Array<{ x: number; y: number }>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, HISTORY_COLLECTION), {
      userId,
      fromBuilding,
      toBuilding,
      fromBuildingName,
      toBuildingName,
      route,
      timestamp: Timestamp.now(),
      type: 'route'
    } as RouteHistoryItem);

    console.log('✅ Route logged:', `${fromBuildingName} → ${toBuildingName}`);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error logging route navigation:', error);
    throw new Error('Failed to log route navigation');
  }
}

// Log a building search
export async function logBuildingSearch(
  userId: string,
  buildingId: string,
  buildingName: string,
  searchQuery?: string
): Promise<string> {
  try {
    // Create the document data, omitting undefined fields
    const docData: Partial<HistoryDocumentData> = {
      userId,
      buildingId,
      buildingName,
      timestamp: Timestamp.now(),
      type: 'building_search'
    };

    // Only add searchQuery if it's defined
    if (searchQuery !== undefined) {
      docData.searchQuery = searchQuery;
    }

    const docRef = await addDoc(collection(db, HISTORY_COLLECTION), docData);

    console.log('✅ Building search logged:', buildingName);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error logging building search:', error);
    throw new Error('Failed to log building search');
  }
}

// Log a room search
export async function logRoomSearch(
  userId: string,
  roomId: string,
  roomName: string,
  buildingId: string,
  buildingName: string,
  searchQuery?: string
): Promise<string> {
  try {
    // Create the document data, omitting undefined fields
    const docData: Partial<HistoryDocumentData> = {
      userId,
      roomId,
      roomName,
      buildingId,
      buildingName,
      timestamp: Timestamp.now(),
      type: 'room_search'
    };

    // Only add searchQuery if it's defined
    if (searchQuery !== undefined) {
      docData.searchQuery = searchQuery;
    }

    const docRef = await addDoc(collection(db, HISTORY_COLLECTION), docData);

    console.log('✅ Room logged:', roomName);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error logging room search:', error);
    throw new Error('Failed to log room search');
  }
}

// Get user's recent history
export async function getUserHistory(
  userId: string,
  limitCount: number = 50
): Promise<HistoryItem[]> {
  try {
    // Try the composite index query first
    try {
      const q = query(
        collection(db, HISTORY_COLLECTION),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as HistoryItem));
    } catch (indexError: unknown) {
      // If index is building, fall back to simpler query
      const error = indexError as { code?: string; message?: string };
      if (error.code === 'failed-precondition' ||
          (error.message && error.message.includes('requires an index'))) {

        console.log('Index building, using fallback query...');

        // Fallback: Get all user documents and sort in memory
        const q = query(
          collection(db, HISTORY_COLLECTION),
          where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as HistoryItem));

        // Sort by timestamp in memory and limit
        return items
          .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
          .slice(0, limitCount);
      } else {
        throw indexError;
      }
    }
  } catch (error) {
    console.error('Error fetching user history:', error);
    throw new Error('Failed to fetch user history');
  }
}

// Get user's recent routes
export async function getUserRecentRoutes(
  userId: string,
  limitCount: number = 20
): Promise<RouteHistoryItem[]> {
  try {
    // Try the composite index query first
    try {
      const q = query(
        collection(db, HISTORY_COLLECTION),
        where('userId', '==', userId),
        where('type', '==', 'route'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RouteHistoryItem));
    } catch (indexError: unknown) {
      // If index is building, fall back to simpler query
      const error = indexError as { code?: string; message?: string };
      if (error.code === 'failed-precondition' ||
          (error.message && error.message.includes('requires an index'))) {

        console.log('Route index building, using fallback query...');

        // Fallback: Get all user documents and filter/sort in memory
        const q = query(
          collection(db, HISTORY_COLLECTION),
          where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);
        const routes = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as HistoryItem))
          .filter(item => item.type === 'route')
          .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
          .slice(0, limitCount);

        return routes as RouteHistoryItem[];
      } else {
        throw indexError;
      }
    }
  } catch (error) {
    console.error('Error fetching user routes:', error);
    throw new Error('Failed to fetch user routes');
  }
}

// Get user's recent building searches
export async function getUserRecentBuildingSearches(
  userId: string,
  limitCount: number = 20
): Promise<BuildingSearchHistoryItem[]> {
  try {
    // Try the composite index query first
    try {
      const q = query(
        collection(db, HISTORY_COLLECTION),
        where('userId', '==', userId),
        where('type', '==', 'building_search'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BuildingSearchHistoryItem));
    } catch (indexError: unknown) {
      // If index is building, fall back to simpler query
      const error = indexError as { code?: string; message?: string };
      if (error.code === 'failed-precondition' ||
          (error.message && error.message.includes('requires an index'))) {

        console.log('Building search index building, using fallback query...');

        // Fallback: Get all user documents and filter/sort in memory
        const q = query(
          collection(db, HISTORY_COLLECTION),
          where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);
        const buildingSearches = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as HistoryItem))
          .filter(item => item.type === 'building_search')
          .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
          .slice(0, limitCount);

        return buildingSearches as BuildingSearchHistoryItem[];
      } else {
        throw indexError;
      }
    }
  } catch (error) {
    console.error('Error fetching user building searches:', error);
    throw new Error('Failed to fetch user building searches');
  }
}

// Get user's recent room searches
export async function getUserRecentRoomSearches(
  userId: string,
  limitCount: number = 20
): Promise<RoomSearchHistoryItem[]> {
  try {
    // Try the composite index query first
    try {
      const q = query(
        collection(db, HISTORY_COLLECTION),
        where('userId', '==', userId),
        where('type', '==', 'room_search'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RoomSearchHistoryItem));
    } catch (indexError: unknown) {
      // If index is building, fall back to simpler query
      const error = indexError as { code?: string; message?: string };
      if (error.code === 'failed-precondition' ||
          (error.message && error.message.includes('requires an index'))) {

        console.log('Room search index building, using fallback query...');

        // Fallback: Get all user documents and filter/sort in memory
        const q = query(
          collection(db, HISTORY_COLLECTION),
          where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);
        const roomSearches = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as HistoryItem))
          .filter(item => item.type === 'room_search')
          .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
          .slice(0, limitCount);

        return roomSearches as RoomSearchHistoryItem[];
      } else {
        throw indexError;
      }
    }
  } catch (error) {
    console.error('Error fetching user room searches:', error);
    throw new Error('Failed to fetch user room searches');
  }
}

// Clear user's history
export async function clearUserHistory(userId: string): Promise<void> {
  try {
    const q = query(
      collection(db, HISTORY_COLLECTION),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error clearing user history:', error);
    throw new Error('Failed to clear user history');
  }
}

// Delete specific history item
export async function deleteHistoryItem(itemId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, HISTORY_COLLECTION, itemId));
  } catch (error) {
    console.error('Error deleting history item:', error);
    throw new Error('Failed to delete history item');
  }
}

// Get user's history grouped by date
export async function getUserHistoryGroupedByDate(
  userId: string,
  limitCount: number = 100
): Promise<Record<string, HistoryItem[]>> {
  try {
    // getUserHistory already has fallback handling for index building
    const history = await getUserHistory(userId, limitCount);
    const grouped: Record<string, HistoryItem[]> = {};

    history.forEach(item => {
      const date = item.timestamp.toDate().toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });

    return grouped;
  } catch (error) {
    console.error('Error grouping user history:', error);
    throw new Error('Failed to group user history');
  }
}
