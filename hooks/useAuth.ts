'use client';

import { LoginFormData, RegisterFormData } from '@/lib/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useEffect, useState } from 'react';
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

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: false,
    error: null,
  });

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
          displayName: data.name,
        });
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
