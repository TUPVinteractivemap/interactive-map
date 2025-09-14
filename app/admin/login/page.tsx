'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import Image from 'next/image';

// Homepage images array for randomization
const HOMEPAGE_IMAGES = [
  '/images/homepage/tupv1.png',
  '/images/homepage/tupv2.png',
  '/images/homepage/tupv3.png',
  '/images/homepage/tupv4.png',
  '/images/homepage/tupv5.png'
];

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('/images/tupv-campus.jpg');
  const { adminSignIn, user, isAdmin, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    // Generate a truly random image on each page load
    const randomImage = HOMEPAGE_IMAGES[Math.floor(Math.random() * HOMEPAGE_IMAGES.length)];
    setBackgroundImage(randomImage);

    // Clear any stored image to ensure next refresh gets a new random one
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('currentRandomImage');
      sessionStorage.removeItem('randomHomepageImage');
    }
  }, []);

  useEffect(() => {
    // Handle redirection in useEffect
    if (!loading && user && isAdmin) {
      router.replace('/admin/dashboard');
    }
  }, [user, isAdmin, loading, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await adminSignIn(email, password);
      toast.success('Admin login successful');
      setShouldRedirect(true);
    } catch (error: unknown) {
      console.error('AdminLogin: Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Don't render the form if we should redirect
  if (shouldRedirect || (user && isAdmin)) {
    return null;
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt="TUPV Campus"
          fill
          className="object-cover brightness-[0.3] blur-[2px]"
          priority
        />
      </div>

      {/* Main Content Panel */}
      <div className="backdrop-blur-sm rounded-2xl p-8 max-w-md w-full z-10">
        {/* Content */}
        <div className="flex flex-col items-center text-white">
          {/* Logo */}
          <div className="mb-6">
            <Image
              src="/images/tupv-logo.png"
              alt="TUPV Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>

          <h1 className="text-3xl font-bold text-center mb-2">
            Admin Login
          </h1>
          <p className="text-gray-200 text-center mb-8 text-base">
            Sign in to access the admin dashboard
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                disabled={isLoading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in as Admin'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}