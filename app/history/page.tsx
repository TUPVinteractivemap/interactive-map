'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import UserHistory from '@/components/UserHistory';

import { Button } from '@/components/ui/button';
import { ArrowLeft, History } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/map">
              <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Map
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <div className="p-2 bg-red-100 rounded-xl mr-3">
                  <History className="h-8 w-8 text-red-600" />
                </div>
                Activity History
              </h1>
              <p className="text-gray-600 mt-1">
                Track your recent routes, building searches, and room searches
              </p>
            </div>
          </div>
        </div>

        {/* History Content */}
        <div className="max-w-7xl mx-auto">
          <UserHistory />
        </div>
      </div>
    </div>
  );
}
