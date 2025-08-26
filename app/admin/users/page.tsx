'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, deleteDoc, Timestamp, query } from 'firebase/firestore';
import { adminDb } from '@/lib/adminAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Trash2, Mail, Calendar, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getAuth, deleteUser } from 'firebase/auth';
import { httpsCallable, getFunctions } from 'firebase/functions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UserData {
  id: string;
  email: string;
  name: string;
  studentId?: string;
  role: string;
  createdAt: Timestamp;
  lastLogin?: Timestamp;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const syncUsersWithAuth = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Setting up real-time users listener...');

        // Set up real-time listener for Firestore users collection
        const usersRef = collection(adminDb, 'users');
        const q = query(usersRef);
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const usersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as UserData[];
          
          console.log(`Fetched ${usersData.length} users`);
          setUsers(usersData);
          setLoading(false);
        }, (error) => {
          console.error('Error in users listener:', error);
          setError('Failed to sync users data');
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error setting up users sync:', error);
        setError('Failed to initialize users sync');
        setLoading(false);
      }
    };

    syncUsersWithAuth();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      console.log('Deleting user:', selectedUser.id);

      // Delete from Firestore
      await deleteDoc(doc(adminDb, 'users', selectedUser.id));
      
      toast.success('User deleted successfully');
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="text-sm text-gray-500">
          Total Users: {users.length}
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Search users by name, email, or student ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <UserCircle className="h-5 w-5 text-gray-500" />
                  <span className="text-lg truncate">{user.name || 'No Name'}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedUser(user);
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.studentId && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">ID:</span>
                    {user.studentId}
                  </div>
                )}
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  <div className="space-y-1">
                    <div>Joined: {formatDate(user.createdAt)}</div>
                    <div>Last login: {formatDate(user.lastLogin)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete {selectedUser?.name}?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}