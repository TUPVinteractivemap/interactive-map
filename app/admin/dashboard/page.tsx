'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { adminDb } from '@/lib/adminAuth';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Users, MapPin, Clock, LogOut, Map, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalBuildings: number;
  recentLogins: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { adminSignOut } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBuildings: 0,
    recentLogins: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    try {
      setLoading(true);
      setError(null);
      console.log('Setting up real-time dashboard stats...');

      // Set up listeners for each collection
      const unsubscribes: Unsubscribe[] = [];

      // Users listener
      const usersRef = collection(adminDb, 'users');
      const usersUnsubscribe = onSnapshot(usersRef, (snapshot) => {
        const totalUsers = snapshot.size;
        
        // Calculate recent logins
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const recentLogins = snapshot.docs.filter(doc => {
          const lastLogin = doc.data().lastLogin?.toDate();
          return lastLogin && lastLogin > oneDayAgo;
        }).length;

        setStats(prev => ({
          ...prev,
          totalUsers,
          recentLogins
        }));
      },
      (error) => {
        console.error('Error in users listener:', error);
        setError('Failed to sync users data');
      });
      unsubscribes.push(usersUnsubscribe);

      // Buildings listener
      const buildingsRef = collection(adminDb, 'buildings');
      const buildingsUnsubscribe = onSnapshot(buildingsRef, (snapshot) => {
        setStats(prev => ({
          ...prev,
          totalBuildings: snapshot.size
        }));
      },
      (error) => {
        console.error('Error in buildings listener:', error);
        setError('Failed to sync buildings data');
      });
      unsubscribes.push(buildingsUnsubscribe);

      setLoading(false);

      // Cleanup function
      return () => {
        console.log('Cleaning up dashboard listeners');
        unsubscribes.forEach(unsubscribe => unsubscribe());
      };
    } catch (error) {
      console.error('Error setting up dashboard stats:', error);
      setError('Failed to load dashboard statistics');
      setLoading(false);
    }
  }, []);

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
            <Link href="/admin/map-editor">
              <Button variant="outline" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Map Editor
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Users
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

        {/* Main Dashboard Content */}
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Overview Card */}
          <div className="bg-gradient-to-r from-white to-red-50 rounded-xl p-3 sm:p-6 mb-4 sm:mb-6 border border-red-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-red-100 rounded-xl">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                  <p className="text-xs sm:text-gray-600 mt-0.5 sm:mt-1">
                    Monitor user activity, system statistics, and recent updates
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
            {/* Total Users Card */}
            <div className="bg-white rounded-lg p-2 sm:p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-1 sm:p-2 bg-blue-100 rounded-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Registered users</p>
            </div>

            {/* Total Buildings Card */}
            <div className="bg-white rounded-lg p-2 sm:p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-1 sm:p-2 bg-green-100 rounded-lg">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Buildings</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalBuildings}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Mapped locations</p>
            </div>

            {/* Recent Logins Card */}
            <div className="bg-white rounded-lg p-2 sm:p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-1 sm:p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Recent Activity</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.recentLogins}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Logins in last 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}