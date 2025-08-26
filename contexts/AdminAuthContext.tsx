'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { adminAuth } from '@/lib/adminAuth';
import { doc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { adminDb } from '@/lib/adminAuth';
import { useRouter, usePathname } from 'next/navigation';

interface AdminAuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  adminSignIn: (email: string, password: string) => Promise<void>;
  adminSignOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({
    user: null as User | null,
    loading: true,
    error: null as string | null,
    isAdmin: false
  });

  const router = useRouter();
  const pathname = usePathname();

  const checkAdminStatus = async (user: User | null) => {
    if (!user) return false;
    try {
      console.log('Checking admin status for:', user.email);
      const adminDoc = await getDoc(doc(adminDb, 'admins', user.uid));
      const isAdmin = adminDoc.exists();
      console.log('Admin status:', isAdmin);
      return isAdmin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  useEffect(() => {
    console.log('Setting up admin auth listener...');
    const unsubscribe = onAuthStateChanged(adminAuth, async (user) => {
      console.log('Admin auth state changed:', user?.email);
      try {
        if (user) {
          const isAdmin = await checkAdminStatus(user);
          console.log('Is admin?', isAdmin);
          
          if (!isAdmin) {
            console.log('Not an admin, signing out...');
            await signOut(adminAuth);
            setState({
              user: null,
              loading: false,
              error: 'Not authorized as admin',
              isAdmin: false
            });
            
            if (pathname !== '/admin/login') {
              router.replace('/admin/login');
            }
            return;
          }

          setState({
            user,
            loading: false,
            error: null,
            isAdmin: true
          });
        } else {
          setState({
            user: null,
            loading: false,
            error: null,
            isAdmin: false
          });

          if (pathname !== '/admin/login') {
            router.replace('/admin/login');
          }
        }
      } catch (error) {
        console.error('Error in admin auth state change:', error);
        setState({
          user: null,
          loading: false,
          error: 'Authentication error',
          isAdmin: false
        });
        
        if (pathname !== '/admin/login') {
          router.replace('/admin/login');
        }
      }
    });

    return () => {
      console.log('Cleaning up admin auth listener');
      unsubscribe();
    };
  }, [router, pathname]);

  const adminSignIn = async (email: string, password: string) => {
    try {
      console.log('Starting admin sign in...');
      setState(prev => ({ ...prev, loading: true, error: null }));

      const userCredential = await signInWithEmailAndPassword(adminAuth, email, password);
      console.log('User signed in, checking admin status...');
      
      const isAdmin = await checkAdminStatus(userCredential.user);
      console.log('Admin status:', isAdmin);
      
      if (!isAdmin) {
        console.log('Not an admin, signing out...');
        await signOut(adminAuth);
        setState({
          user: null,
          loading: false,
          error: 'Not authorized as admin',
          isAdmin: false
        });
        throw new Error('Not authorized as admin');
      }

      setState({
        user: userCredential.user,
        loading: false,
        error: null,
        isAdmin: true
      });
      
      console.log('Admin sign in successful');
    } catch (error: any) {
      console.error('Admin sign in error:', error);
      setState({
        user: null,
        loading: false,
        error: error.message,
        isAdmin: false
      });
      throw error;
    }
  };

  const adminSignOut = async () => {
    try {
      console.log('Starting admin sign out...');
      await signOut(adminAuth);
      console.log('Admin signed out from Firebase');
      
      // Clear all admin state
      setState({
        user: null,
        loading: false,
        error: null,
        isAdmin: false
      });
      
      // Force redirect to login
      router.replace('/admin/login');
      
      console.log('Admin state cleared and redirected');
    } catch (error: any) {
      console.error('Admin sign out error:', error);
      setState(prev => ({
        ...prev,
        error: error.message
      }));
      throw error;
    }
  };

  return (
    <AdminAuthContext.Provider 
      value={{
        ...state,
        adminSignIn,
        adminSignOut
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}