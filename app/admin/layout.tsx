'use client';

import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-gray-100">
        {!isLoginPage && <AdminNavbar />}
        <main className={!isLoginPage ? "pt-16" : ""}>
          {children}
        </main>
      </div>
    </AdminAuthProvider>
  );
}