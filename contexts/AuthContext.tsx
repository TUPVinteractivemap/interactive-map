'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { userAuth, googleProvider } from '@/lib/userAuth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { LoginFormData, RegisterFormData } from '@/lib/auth';

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
  const [state, setState] = useState({
    user: null as User | null,
    loading: true,
    error: null as string | null
  });

  useEffect(() => {
    console.log('Setting up user auth listener...');
    const unsubscribe = onAuthStateChanged(userAuth, async (user) => {
      console.log('User auth state changed:', user?.email);
      try {
        setState({
          user,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error in user auth state change:', error);
        setState({
          user: null,
          loading: false,
          error: 'Authentication error'
        });
      }
    });

    return () => {
      console.log('Cleaning up user auth listener');
      unsubscribe();
    };
  }, []);

  const signIn = async (data: LoginFormData) => {
    try {
      console.log('Attempting user sign in:', data.email);
      setState(prev => ({ ...prev, loading: true, error: null }));

      const userCredential = await signInWithEmailAndPassword(
        userAuth,
        data.email,
        data.password
      );
      console.log('User sign in successful:', userCredential.user.email);

      setState({
        user: userCredential.user,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('User sign in error:', error);
      setState({
        user: null,
        loading: false,
        error: error.message
      });
      throw error;
    }
  };

  const signUp = async (data: RegisterFormData) => {
    try {
      console.log('Attempting user registration:', data.email);
      setState(prev => ({ ...prev, loading: true, error: null }));

      const userCredential = await createUserWithEmailAndPassword(
        userAuth,
        data.email,
        data.password
      );

      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: `${data.name} (${data.studentId})`
        });
        console.log('User registration successful:', userCredential.user.email);
      }

      setState({
        user: userCredential.user,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('User registration error:', error);
      setState({
        user: null,
        loading: false,
        error: error.message
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Attempting Google sign in...');
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await signInWithPopup(userAuth, googleProvider);
      console.log('Google sign in successful:', result.user.email);
      
      setState({
        user: result.user,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setState({
        user: null,
        loading: false,
        error: error.message
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('User logging out...');
      await signOut(userAuth);
      setState({
        user: null,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      setState(prev => ({
        ...prev,
        error: error.message
      }));
      throw error;
    }
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signInWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}