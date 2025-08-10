'use client';

import { useAuth } from '@/hooks/useAuth';
import InactivityWarning from './InactivityWarning';

interface InactivityProviderProps {
  children: React.ReactNode;
}

export default function InactivityProvider({ children }: InactivityProviderProps) {
  const { user, logout } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <InactivityWarning 
        timeout={10 * 60 * 1000} // 10 minutes
        onLogout={logout}
      />
    </>
  );
}
