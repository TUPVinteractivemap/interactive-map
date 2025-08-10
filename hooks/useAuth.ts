'use client';

import { LoginFormData, RegisterFormData } from '@/lib/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User,
  updateProfile,
  signOut,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Auto logout function for inactivity
  const autoLogout = async () => {
    try {
      await signOut(auth);
      // Show toast notification for auto logout
      if (typeof window !== 'undefined') {
        // Import toast dynamically to avoid SSR issues
        const { toast } = await import('sonner');
        toast.info('You have been logged out due to inactivity');
      }
    } catch (error: any) {
      console.error('Auto logout error:', error);
    }
  };

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    if (authState.user) {
      inactivityTimerRef.current = setTimeout(() => {
        autoLogout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [authState.user]);

  // Handle user activity
  const handleUserActivity = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Set up activity listeners
  useEffect(() => {
    if (authState.user) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      events.forEach(event => {
        document.addEventListener(event, handleUserActivity, true);
      });

      // Start inactivity timer
      resetInactivityTimer();

      // Handle page visibility change (tab close/minimize)
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // User switched tabs or minimized window
          resetInactivityTimer();
        }
      };

      // Handle beforeunload (browser close/refresh)
      const handleBeforeUnload = () => {
        logout();
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleUserActivity, true);
        });
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
      };
    }
  }, [authState.user, handleUserActivity, resetInactivityTimer]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setAuthState({
        user,
        loading: false,
        error: null,
      });
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (data: LoginFormData) => {
    try {
      setAuthState(prev => ({
        ...prev,
        loading: true,
        error: null,
      }));

      // For now, we'll use email/password authentication
      // In a real implementation, you might want to validate student ID against a database
      await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      throw new Error(error.message);
    }
  };

  const signUp = async (data: RegisterFormData) => {
    try {
      setAuthState(prev => ({
        ...prev,
        loading: true,
        error: null,
      }));

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );

      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: `${data.name} (${data.studentId})`,
        });
        
        // In a real implementation, you would store the student ID in Firestore or another database
        // For now, we'll include it in the display name
      }
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      throw new Error(error.message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setAuthState(prev => ({
        ...prev,
        loading: true,
        error: null,
      }));

      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      await signOut(auth);
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      throw new Error(error.message);
    }
  };



  return {
    ...authState,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
  };
};
