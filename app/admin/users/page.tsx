'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, Timestamp, query } from 'firebase/firestore';
import { adminDb } from '@/lib/adminAuth';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Trash2, Mail, Calendar, UserCircle, Users, LogOut, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

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
  const router = useRouter();
  const { adminSignOut } = useAdminAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
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

  const { user } = useAdminAuth();
  
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      console.log('Deleting user:', selectedUser.id);

      if (!user) {
        throw new Error('Admin not authenticated');
      }

      // Call the API endpoint to delete the user
      const response = await fetch('/api/admin/deleteUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: selectedUser.id,
          adminUid: user.uid,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }
      
      toast.success('User deleted successfully');
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
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
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900">User Management</h2>
                    <p className="text-xs sm:text-gray-600 mt-0.5 sm:mt-1">
                      Manage user accounts, view activity, and monitor system access
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-xs sm:text-sm text-gray-600">
                    Total Users: <span className="font-semibold">{users.length}</span>
                  </div>
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
            </div>
          </div>
        </div>
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