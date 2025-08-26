'use client';

import { useState, useEffect } from 'react';
import { BuildingInfo } from '@/lib/buildings';
import { Button } from '@/components/ui/button';
import { BuildingForm } from '@/components/admin/BuildingForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { adminDb } from '@/lib/adminAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
// import { useRouter } from 'next/navigation';
// import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function MapEditor() {
  const [buildings, setBuildings] = useState<BuildingInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingInfo | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // const router = useRouter();
  // const { adminSignOut } = useAdminAuth();

  // Fetch and listen to buildings
  useEffect(() => {
    console.log('Setting up real-time buildings listener...');
    setLoading(true);

    const buildingsRef = collection(adminDb, 'buildings');
    const unsubscribe = onSnapshot(buildingsRef, 
      (snapshot) => {
        const buildingsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BuildingInfo[];
        console.log('Real-time buildings update:', buildingsList.length, 'buildings');
        setBuildings(buildingsList);
        setLoading(false);
      },
      (error) => {
        console.error('Error in buildings listener:', error);
        toast.error('Failed to load buildings');
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => {
      console.log('Cleaning up buildings listener');
      unsubscribe();
    };
  }, []);

  // Filter buildings based on search
  const filteredBuildings = buildings.filter(building =>
    building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    building.description.toLowerCase().includes(searchTerm.toLowerCase())
  );



  // Add building
  const handleAddBuilding = async (buildingData: Partial<BuildingInfo>) => {
    setIsSubmitting(true);
    try {
      // Check if ID already exists
      const buildingId = buildingData.id;
      if (!buildingId) {
        throw new Error('Building ID is required');
      }

      const buildingRef = doc(adminDb, 'buildings', buildingId);
      const existingDoc = await getDoc(buildingRef);
      
      if (existingDoc.exists()) {
        throw new Error(`Building with ID "${buildingId}" already exists`);
      }

      // Remove id from data since it's used as document ID
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...dataWithoutId } = buildingData;
      await setDoc(buildingRef, dataWithoutId);
      
      toast.success('Building added successfully');
      setShowAddDialog(false);
    } catch (error: unknown) {
      console.error('Error adding building:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add building');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update building
  const handleUpdateBuilding = async (buildingData: Partial<BuildingInfo>) => {
    if (!selectedBuilding) return;
    setIsSubmitting(true);
    try {
      const buildingRef = doc(adminDb, 'buildings', selectedBuilding.id);
      await updateDoc(buildingRef, buildingData);
      toast.success('Building updated successfully');
      setShowEditDialog(false);
    } catch (error) {
      console.error('Error updating building:', error);
      toast.error('Failed to update building');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete building
  const handleDeleteBuilding = async () => {
    if (!selectedBuilding) return;
    setIsSubmitting(true);
    try {
      console.log('Attempting to delete building:', selectedBuilding.id);
      const buildingRef = doc(adminDb, 'buildings', selectedBuilding.id);
      await deleteDoc(buildingRef);
      console.log('Building deleted successfully');
      toast.success('Building deleted successfully');
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting building:', error);
      toast.error('Failed to delete building. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Building Management</h1>
        <div className="flex gap-4">
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Building
          </Button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Search buildings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBuildings.map((building) => (
          <Card key={building.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{building.name}</span>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedBuilding(building);
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedBuilding(building);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs font-mono text-gray-500 mb-2">ID: {building.id}</p>
              <p className="text-sm text-gray-600">{building.description}</p>
              <p className="text-sm text-gray-500 mt-2">Type: {building.type}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Building Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Building</DialogTitle>
          </DialogHeader>
          <BuildingForm
            onSubmit={handleAddBuilding}
            onCancel={() => setShowAddDialog(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Building Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Building</DialogTitle>
          </DialogHeader>
          <BuildingForm
            building={selectedBuilding || undefined}
            onSubmit={handleUpdateBuilding}
            onCancel={() => setShowEditDialog(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Building</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete {selectedBuilding?.name}?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBuilding}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}