'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

// Homepage images array for randomization
const HOMEPAGE_IMAGES = [
  '/images/homepage/tupv1.png',
  '/images/homepage/tupv2.png',
  '/images/homepage/tupv3.png',
  '/images/homepage/tupv4.png',
  '/images/homepage/tupv5.png'
];

// Prevent prerender to avoid initializing Firebase during build on the landing page
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [backgroundImage, setBackgroundImage] = useState('/images/tupv-campus.jpg');

  useEffect(() => {
    if (user) {
      router.push('/map');
    }
  }, [user, router]);

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

  if (user) {
    return null; // Don't render anything while redirecting
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
      <div className="rounded-2xl p-8 max-w-md w-full z-10">
        {/* Content */}
        <div className="flex flex-col items-center text-white">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/images/tupv-logo.png"
              alt="TUPV Logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>

          <h1 className="text-4xl font-bold text-center mb-4">
            Explore TUPV like never before!
          </h1>

          <p className="text-gray-200 text-center mb-10 text-lg">
            The TUPV Interactive Map is designed to help students, faculty, and visitors navigate the Technological University of the Philippines Visayas (TUPV) campus with ease.
          </p>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            {/* Sign Up Button */}
            <Link
              href="/signup"
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-xl text-center font-semibold transition-all inline-block"
            >
              Create Account
            </Link>

            {/* Login Button */}
            <Link
              href="/login"
              className="w-full bg-white/10 hover:bg-white/20 text-white py-4 px-6 rounded-xl text-center font-semibold transition-all inline-block"
            >
              Sign In
            </Link>

            {/* Guest Button */}
            <Link
              href="/map"
              className="w-full bg-white/5 hover:bg-white/10 text-white py-4 px-6 rounded-xl text-center font-semibold transition-all inline-block"
            >
              Continue as Guest
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
