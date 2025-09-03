'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import UserHistory from '@/components/UserHistory';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
          <span className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight">TUPV Interactive Map</span>
        </div>

        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <div className="max-w-7xl mx-auto">
            <Link href="/map">
              <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50 text-xs px-2 py-1">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Map
              </Button>
            </Link>
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
