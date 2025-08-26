'use client';

import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, isAdmin } = useAdminAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      console.log('AdminRoute: Checking auth state:', { user: user?.email, isAdmin });
      if (!user || !isAdmin) {
        console.log('AdminRoute: Not authorized, redirecting to login');
        router.replace('/admin/login');
      }
      setIsChecking(false);
    }
  }, [user, isAdmin, loading, router]);

  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}