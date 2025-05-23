'use client';

import { useAuth } from '@/hooks/useAuth';
import { User } from 'firebase/auth';
import { createContext, useContext } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (data: any) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
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
