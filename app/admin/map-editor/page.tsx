'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Edit, Trash2, LogOut, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';

export default function MapEditor() {
  const router = useRouter();
  const { adminSignOut } = useAdminAuth();
  const [buildings, setBuildings] = useState<BuildingInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingInfo | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleLogout = async () => {
    try {
      console.log('Admin logging out...');
      await adminSignOut();
      console.log('Admin logged out successfully');
      toast.success('Logged out successfully');
      router.push('/admin/login');
    } catch (error) {
      console.error('Admin logout error:', error);
      toast.error('Failed to logout');
    }
  };

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
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
        {/* Logo and Title */}
        <div className="flex flex-col items-center justify-center gap-2 mb-4 sm:mb-8">
          <Image
            src="/images/tupv-logo.png"
            alt="TUPV Logo"
            width={48}
            height={48}
            className="sm:w-12 sm:h-12 w-10 h-10 rounded-md shadow"
            style={{ background: 'white' }}
            priority
          />
          <span className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight">TUPV Admin Dashboard</span>
        </div>

        {/* Navigation and Logout */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Link href="/admin/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Header */}
          <div className="mb-4 sm:mb-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-gradient-to-r from-white to-red-50 rounded-xl p-3 sm:p-6 border border-red-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="p-2 sm:p-3 bg-red-100 rounded-xl">
                      <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Building Management</h2>
                      <p className="text-xs sm:text-gray-600 mt-0.5 sm:mt-1">
                        Add, edit, and manage campus buildings and locations
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button onClick={() => setShowAddDialog(true)} className="bg-red-500 hover:bg-red-600">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Building
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-3 sm:p-6">
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
              </div>
            </div>
          </div>
        </div>
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
    </>
  );
}