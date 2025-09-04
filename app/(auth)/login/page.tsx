'use client';

import Image from 'next/image';
import LoginForm from '@/components/LoginForm';
import { useState, useEffect } from 'react';
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// Homepage images array for randomization
const HOMEPAGE_IMAGES = [
  '/images/homepage/tupv1.png',
  '/images/homepage/tupv2.png',
  '/images/homepage/tupv3.png',
  '/images/homepage/tupv4.png',
  '/images/homepage/tupv5.png'
];

export default function LoginPage() {
  const [backgroundImage, setBackgroundImage] = useState('/images/tupv-campus.jpg');

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

          <LoginForm />
        </div>
      </div>
    </main>
  );
} 