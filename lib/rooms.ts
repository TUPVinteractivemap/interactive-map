import { db } from './firebase';
import { collection, getDocs, query, where, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { BuildingInfo } from './buildings';

export interface Room {
  id: string;
  name: string;
  buildingId: string;
  buildingName?: string;
  floor: number;
  description?: string;
  tags: string[];
  imageUrl?: string; // Optional Imgur URL for room image
}

const ROOMS_COLLECTION = 'rooms';
const BUILDINGS_COLLECTION = 'buildings';

export async function searchRooms(searchTerm: string): Promise<Room[]> {
  try {
    const roomsRef = collection(db, ROOMS_COLLECTION);
    const snapshot = await getDocs(roomsRef);
    const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));

    // Get unique building IDs
    const buildingIds = [...new Set(rooms.map(room => room.buildingId))];

    // Fetch building names
    const buildingsRef = collection(db, BUILDINGS_COLLECTION);
    const buildingPromises = buildingIds.map(async (buildingId) => {
      try {
        const buildingDoc = await getDoc(doc(buildingsRef, buildingId));
        if (buildingDoc.exists()) {
          const buildingData = buildingDoc.data() as BuildingInfo;
          return { id: buildingId, name: buildingData.name };
        }
        return { id: buildingId, name: 'Unknown Building' };
      } catch {
        return { id: buildingId, name: 'Unknown Building' };
      }
    });

    const buildings = await Promise.all(buildingPromises);
    const buildingMap = new Map(buildings.map(b => [b.id, b.name]));

    // Add building names to rooms
    const roomsWithBuildingNames = rooms.map(room => ({
      ...room,
      buildingName: buildingMap.get(room.buildingId) || 'Unknown Building'
    }));

    // Search in room names, descriptions, and tags
    return roomsWithBuildingNames.filter(room => {
      const searchString = searchTerm.toLowerCase();
      return (
        room.name.toLowerCase().includes(searchString) ||
        (room.description?.toLowerCase().includes(searchString)) ||
        room.tags.some(tag => tag.toLowerCase().includes(searchString))
      );
    });
  } catch (error) {
    console.error('Error searching rooms:', error);
    throw new Error('Failed to search rooms. Please try again later.');
  }
}

export async function getRoomsByBuilding(buildingId: string): Promise<Room[]> {
  try {
    const roomsRef = collection(db, ROOMS_COLLECTION);
    const q = query(roomsRef, where('buildingId', '==', buildingId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw new Error('Failed to fetch rooms. Please try again later.');
  }
}

export async function getRoomsByFloor(buildingId: string, floor: number): Promise<Room[]> {
  try {
    const roomsRef = collection(db, ROOMS_COLLECTION);
    const q = query(
      roomsRef,
      where('buildingId', '==', buildingId),
      where('floor', '==', floor)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw new Error('Failed to fetch rooms. Please try again later.');
  }
}

// Get a specific room by ID
export async function getRoomById(roomId: string): Promise<Room | null> {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      return null;
    }

    return { id: roomDoc.id, ...roomDoc.data() } as Room;
  } catch (error) {
    console.error('Error fetching room:', error);
    throw new Error('Failed to fetch room. Please try again later.');
  }
}

// Get building details for a room
export async function getBuildingForRoom(roomId: string): Promise<BuildingInfo | null> {
  try {
    const room = await getRoomById(roomId);
    if (!room) return null;

    const buildingRef = doc(db, BUILDINGS_COLLECTION, room.buildingId);
    const buildingDoc = await getDoc(buildingRef);
    
    if (!buildingDoc.exists()) {
      return null;
    }

    return { id: buildingDoc.id, ...buildingDoc.data() } as BuildingInfo;
  } catch (error) {
    console.error('Error fetching building for room:', error);
    throw new Error('Failed to fetch building. Please try again later.');
  }
}

// Add a new room
export async function addRoom(room: Omit<Room, 'id'>): Promise<string> {
  try {
    const roomsRef = collection(db, ROOMS_COLLECTION);
    const docRef = await addDoc(roomsRef, {
      ...room,
      tags: room.tags || [], // Ensure tags array exists
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding room:', error);
    throw new Error('Failed to add room. Please try again later.');
  }
}

// Update an existing room
export async function updateRoom(id: string, room: Partial<Room>): Promise<void> {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, id);
    await updateDoc(roomRef, room);
  } catch (error) {
    console.error('Error updating room:', error);
    throw new Error('Failed to update room. Please try again later.');
  }
}

// Delete a room
export async function deleteRoom(id: string): Promise<void> {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, id);
    await deleteDoc(roomRef);
  } catch (error) {
    console.error('Error deleting room:', error);
    throw new Error('Failed to delete room. Please try again later.');
  }
}

// Get all rooms
export async function getAllRooms(): Promise<Room[]> {
  try {
    const roomsRef = collection(db, ROOMS_COLLECTION);
    const snapshot = await getDocs(roomsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
  } catch (error) {
    console.error('Error fetching all rooms:', error);
    throw new Error('Failed to fetch rooms. Please try again later.');
  }
}
