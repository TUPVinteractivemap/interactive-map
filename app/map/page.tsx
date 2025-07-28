'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import InteractiveMap from '@/components/InteractiveMap';
import { buildingCoordinates, getBuildingName } from '@/lib/routing';

export default function MapPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [zoom, setZoom] = useState(1.5);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  // Handle touch gestures for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const initialDistance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      (e.currentTarget as any).initialDistance = initialDistance;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      const initialDistance = (e.currentTarget as any).initialDistance;
      
      if (initialDistance) {
        const scale = currentDistance / initialDistance;
        const zoomDelta = (scale - 1) * 0.5;
        setZoom(prev => Math.max(0.5, Math.min(3, prev + zoomDelta)));
        (e.currentTarget as any).initialDistance = currentDistance;
      }
    }
  };

  useEffect(() => {
    // Only redirect if we're not loading and there's no user
    if (!loading && !user) {
      // Allow guest access - don't redirect
      return;
    }
  }, [user, loading, router]);

  // Show loading only while auth is loading
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin && destination && origin !== destination) {
      console.log('Searching route from', origin, 'to', destination);
      // The route will be calculated automatically by the InteractiveMap component
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
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
          <div className="flex items-center justify-between py-4 border-b mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-medium text-lg">
                  {user ? (user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()) : 'G'}
                </span>
              </div>
              <div>
                <p className="text-gray-900 font-medium">
                  Hello, {user ? (user.displayName || 'User') : 'Guest'}!
                </p>
                <p className="text-sm text-gray-500">{user ? user.email : 'Guest Session'}</p>
              </div>
            </div>
            {user ? (
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 font-medium text-sm transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/"
                className="text-gray-600 hover:text-red-600 font-medium text-sm transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
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
                <select
                  id="origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select your location</option>
                  {Object.entries(buildingCoordinates).map(([buildingId, coords]) => (
                    <option key={buildingId} value={buildingId}>
                      {getBuildingName(buildingId)}
                    </option>
                  ))}
                </select>
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
                <select
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select your destination</option>
                  {Object.entries(buildingCoordinates).map(([buildingId, coords]) => (
                    <option key={buildingId} value={buildingId}>
                      {getBuildingName(buildingId)}
                    </option>
                  ))}
                </select>
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

      {/* Map Area */}
      <div className="flex-1 bg-white relative h-[calc(100vh-4rem)] md:h-full overflow-hidden">
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Zoom In"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Zoom Out"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={() => setZoom(1)}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors text-xs font-medium text-gray-700"
            title="Reset Zoom"
          >
            100%
          </button>
        </div>

        {/* Map Container */}
        <div 
          className="absolute inset-0 flex items-center justify-center overflow-visible"
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <InteractiveMap zoom={zoom} origin={origin} destination={destination} />
        </div>
      </div>
    </main>
  );
} 