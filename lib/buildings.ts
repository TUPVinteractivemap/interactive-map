import { db } from './firebase';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

export interface BuildingInfo {
  id: string;
  name: string;
  description: string;
  type: string;
  pathData: string; // SVG path data for the building
  center: {
    x: number;
    y: number;
  };
  floors: number; // Number of floors in the building
  imageUrl?: string; // Optional Imgur URL for building image
}

const BUILDINGS_COLLECTION = 'buildings';

export async function getAllBuildings(): Promise<BuildingInfo[]> {
  try {
    console.log('Fetching all buildings...');
    const buildingsRef = collection(db, BUILDINGS_COLLECTION);
    const snapshot = await getDocs(buildingsRef);
    console.log(`Found ${snapshot.docs.length} buildings`);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BuildingInfo));
  } catch (error) {
    console.error('Error fetching buildings:', error);
    throw new Error('Failed to fetch buildings. Please try again later.');
  }
}

export async function addBuilding(building: Omit<BuildingInfo, 'id'>): Promise<string> {
  try {
    const buildingsRef = collection(db, BUILDINGS_COLLECTION);
    const docRef = await addDoc(buildingsRef, building);
    return docRef.id;
  } catch (error) {
    console.error('Error adding building:', error);
    throw new Error('Failed to add building. Please try again later.');
  }
}

export async function updateBuilding(id: string, building: Partial<BuildingInfo>): Promise<void> {
  try {
    const buildingRef = doc(db, BUILDINGS_COLLECTION, id);
    await updateDoc(buildingRef, building);
  } catch (error) {
    console.error('Error updating building:', error);
    throw new Error('Failed to update building. Please try again later.');
  }
}

export async function deleteBuilding(id: string): Promise<void> {
  try {
    const buildingRef = doc(db, BUILDINGS_COLLECTION, id);
    await deleteDoc(buildingRef);
  } catch (error) {
    console.error('Error deleting building:', error);
    throw new Error('Failed to delete building. Please try again later.');
  }
}

export async function searchBuildings(searchTerm: string): Promise<BuildingInfo[]> {
  try {
    const buildingsRef = collection(db, BUILDINGS_COLLECTION);
    const snapshot = await getDocs(buildingsRef);
    const buildings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BuildingInfo));

    // Search in building names, descriptions, and types
    return buildings.filter(building => {
      const searchString = searchTerm.toLowerCase();
      return (
        building.name.toLowerCase().includes(searchString) ||
        building.description?.toLowerCase().includes(searchString) ||
        building.type.toLowerCase().includes(searchString)
      );
    });
  } catch (error) {
    console.error('Error searching buildings:', error);
    throw new Error('Failed to search buildings. Please try again later.');
  }
}

export async function getBuildingsByType(type: string): Promise<BuildingInfo[]> {
  try {
    const buildingsRef = collection(db, BUILDINGS_COLLECTION);
    const q = query(buildingsRef, where('type', '==', type));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BuildingInfo));
  } catch (error) {
    console.error('Error fetching buildings by type:', error);
    throw new Error('Failed to fetch buildings. Please try again later.');
  }
}