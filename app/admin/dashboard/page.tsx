'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, onSnapshot, query, where, Timestamp, Unsubscribe } from 'firebase/firestore';
import { adminDb } from '@/lib/adminAuth';
import { Users, MapPin, Clock } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalBuildings: number;
  recentLogins: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBuildings: 0,
    recentLogins: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500">Registered users</p>
          </CardContent>
        </Card>

        {/* Total Buildings Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Buildings</CardTitle>
            <MapPin className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBuildings}</div>
            <p className="text-xs text-gray-500">Mapped locations</p>
          </CardContent>
        </Card>

        {/* Recent Logins Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentLogins}</div>
            <p className="text-xs text-gray-500">Logins in last 24 hours</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}