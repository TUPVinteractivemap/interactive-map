'use client';

import { useAuth } from '@/hooks/useAuth';
import { LoginFormData, RegisterFormData } from '@/lib/auth';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { createContext, useContext } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (data: LoginFormData) => Promise<void>;
  signUp: (data: RegisterFormData) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return <>{children}</>;
}