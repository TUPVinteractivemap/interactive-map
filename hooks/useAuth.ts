'use client';

import { LoginFormData, RegisterFormData } from '@/lib/auth';
import { userAuth, googleProvider } from '@/lib/userAuth';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
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
  const [authState, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Auto logout function for inactivity
  const autoLogout = async () => {
    try {
      await signOut(userAuth);
      if (typeof window !== 'undefined') {
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

      resetInactivityTimer();

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleUserActivity, true);
        });
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
      };
    }
  }, [authState.user, handleUserActivity, resetInactivityTimer]);

  useEffect(() => {
    console.log('Setting up user auth listener...');
    const unsubscribe = onAuthStateChanged(userAuth, async (user) => {
      console.log('User auth state changed:', user?.email);
      try {
        if (user) {
          // Update last login time
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, {
            lastLogin: serverTimestamp()
          }, { merge: true });
        }
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

  const findUserByStudentId = async (studentId: string) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('studentId', '==', studentId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Student ID not found');
      }

      return querySnapshot.docs[0].data().email;
    } catch (error) {
      console.error('Error finding user by student ID:', error);
      throw new Error('Failed to find user');
    }
  };

  const signIn = async (data: LoginFormData) => {
    try {
      console.log('Attempting user sign in:', data.email);
      setState(prev => ({ ...prev, loading: true, error: null }));

      const userCredential = await signInWithEmailAndPassword(
        userAuth,
        data.email,
        data.password
      );

      // Update last login time
      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        lastLogin: serverTimestamp()
      }, { merge: true });

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

        // Create user document in Firestore
        const userRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userRef, {
          email: data.email,
          name: data.name,
          studentId: data.studentId,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          role: 'student'
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

      // Create or update user document in Firestore
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(userRef, {
        email: result.user.email,
        name: result.user.displayName,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        role: 'student'
      }, { merge: true });
      
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
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
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

  return {
    ...authState,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
  };
};