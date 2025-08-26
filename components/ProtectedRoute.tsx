'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuthContext();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      console.log('ProtectedRoute: Checking auth state:', { user: user?.email });
      if (!user) {
        console.log('ProtectedRoute: Not authenticated, redirecting to login');
        router.replace('/login');
      }
      setIsChecking(false);
    }
  }, [user, loading, router]);

  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
