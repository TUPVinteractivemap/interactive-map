'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching route from', origin, 'to', destination);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <main className="flex flex-col md:flex-row h-screen relative">
      {/* Mobile Toggle Button (Only shows when sidebar is closed) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-30 bg-white p-2 rounded-lg shadow-lg"
        >
          <svg
            className="h-6 w-6 text-gray-700"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Navigation Sidebar */}
      <div className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        transition-transform duration-300
        fixed md:relative
        w-full md:w-[400px]
        h-full
        bg-white
        shadow-lg
        z-20
        flex
        flex-col
        overflow-y-auto
      `}>
        {/* Sidebar Header with Close Button */}
        <div className="sticky top-0 bg-white z-30 p-6 pb-0">
          <div className="flex items-center justify-between mb-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <Image
                src="/images/tupv-logo.png"
                alt="TUPV Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <h1 className="text-xl font-semibold text-gray-800">TUPV Interactive Map</h1>
            </div>
            
            {/* Close Button (Mobile Only) */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="h-6 w-6 text-gray-700"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Profile Section */}
          {user ? (
            <div className="flex items-center justify-between py-4 border-b mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-medium text-lg">
                    {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-gray-900 font-medium">
                    Hello, {user.displayName || 'User'}!
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 font-medium text-sm transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 py-4 border-b mb-6">
              <Link
                href="/login"
                className="text-red-500 hover:text-red-600 font-medium"
              >
                Sign in
              </Link>
              <span className="text-gray-400">or</span>
              <Link
                href="/signup"
                className="text-red-500 hover:text-red-600 font-medium"
              >
                Create account
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 p-6 pt-0">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Origin Input */}
            <div className="space-y-2">
              <label htmlFor="origin" className="block text-sm font-medium text-gray-700">
                Where are you?
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter your location"
                />
              </div>
            </div>

            {/* Destination Input */}
            <div className="space-y-2">
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
                Where to?
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter your destination"
                />
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Find Route
            </button>
          </form>

          {/* Search Results */}
          <div className="mt-6 flex-1 overflow-y-auto">
            {/* This will be populated with search results */}
            <div className="text-sm text-gray-500">
              Search results will appear here...
            </div>
          </div>
        </div>
      </div>

      {/* Map Area (Temporary) */}
      <div className="flex-1 bg-gray-100 relative h-[calc(100vh-4rem)] md:h-full">
        {/* Temporary Map Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400 text-center p-4">
            <svg
              className="h-16 md:h-24 w-16 md:w-24 mx-auto mb-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-lg md:text-xl font-medium">Map will be integrated here</p>
          </div>
        </div>
      </div>
    </main>
  );
}
