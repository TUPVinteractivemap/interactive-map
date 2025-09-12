'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { sendPasswordResetEmail } from 'firebase/auth';
import { userAuth } from '@/lib/userAuth';
import Image from 'next/image';

// Homepage images array for randomization
const HOMEPAGE_IMAGES = [
  '/images/homepage/tupv1.png',
  '/images/homepage/tupv2.png',
  '/images/homepage/tupv3.png',
  '/images/homepage/tupv4.png',
  '/images/homepage/tupv5.png'
];

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('/images/tupv-campus.jpg');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      await sendPasswordResetEmail(userAuth, email);
      toast.success('Password reset email sent! Check your inbox.');
      router.push('/login');
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

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
            Reset Password
          </h1>
          <p className="text-gray-200 text-center mb-8 text-base">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-red-400 hover:text-red-300 font-medium inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Login
              </Link>
            </div>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-white/60">
            Remember your password?{' '}
            <Link href="/login" className="text-red-400 hover:text-red-300 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}