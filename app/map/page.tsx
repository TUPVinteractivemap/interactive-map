'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import InteractiveMap, { BuildingInfo } from '@/components/InteractiveMap';
import { buildingCoordinates, getBuildingName } from '@/lib/routing';

export default function MapPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [zoom, setZoom] = useState(2);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingInfo | null>(null);
  const [isMainSidebarCollapsed, setIsMainSidebarCollapsed] = useState(false);
  const [isDetailsSidebarCollapsed, setIsDetailsSidebarCollapsed] = useState(false);
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);
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

  // Open mobile details when a building is selected
  useEffect(() => {
    if (selectedBuilding) {
      setIsMobileDetailsOpen(true);
    }
  }, [selectedBuilding]);

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

  // Derived labels for UX
  const originName = origin ? getBuildingName(origin) : '';
  const destinationName = destination ? getBuildingName(destination) : '';
  const isValidRoute = !!origin && !!destination && origin !== destination;

  return (
    <main className="flex flex-col md:flex-row h-screen relative overflow-hidden bg-white">
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
        w-full ${isMainSidebarCollapsed ? 'md:w-[64px]' : 'md:w-[400px]'}
        h-screen
        bg-white
        shadow-lg
        z-[60]
        flex
        flex-col
        overflow-hidden
        relative
      `}>
        {/* Collapse toggle button */}
        <button
          onClick={() => setIsMainSidebarCollapsed(v => !v)}
          className="absolute -right-3 top-24 z-30 hidden md:flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md border"
          title={isMainSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className={`h-4 w-4 text-gray-700 transition-transform ${isMainSidebarCollapsed ? '' : 'rotate-180'}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 15.707a1 1 0 010-1.414L15.586 11H4a1 1 0 110-2h11.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        {isMainSidebarCollapsed ? (
          // Collapsed state - show minimal content
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b">
              <Image src="/images/tupv-logo.png" alt="TUPV Logo" width={32} height={32} className="rounded" />
            </div>
            
            {/* Location Icon */}
            <div className="p-4 border-b">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-medium text-sm">
                    {user ? (user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()) : 'G'}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Icons */}
            <div className="flex flex-col items-center gap-2 p-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg" title="Search Location">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg" title="Search Route">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <>
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
              {user ? (
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
                    className="w-full bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 transition-colors font-semibold shadow-sm"
                  >
                    Find Route
                  </button>

                  {/* Route Summary */}
                  <div className="rounded-lg border bg-white/60 p-3 text-sm flex items-start gap-3">
                    <div className="mt-1">
                      <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      {isValidRoute ? (
                        <>
                          <div className="text-gray-800">
                            <span className="font-medium">From</span>: {originName}
                          </div>
                          <div className="text-gray-800">
                            <span className="font-medium">To</span>: {destinationName}
                          </div>
                          <div className="mt-2 text-gray-500 text-xs">Routes follow campus footpaths only. Move the map to preview.</div>
                        </>
                      ) : (
                        <div className="text-gray-500">Select both a starting location and a destination.</div>
                      )}
                    </div>
                  </div>
                </form>
              ) : (
                // Guest message
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-medium">Route Finding Restricted</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Sign in to access the route finding feature and get directions between buildings.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Sign in now
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Building Details Sidebar (Desktop) */}
      {selectedBuilding && (
        <div className="hidden lg:flex flex-col border-r bg-white w-[400px] relative z-50">
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header with close button */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Place details</h2>
              <button
                onClick={() => setSelectedBuilding(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Close details"
              >
                <svg className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 flex flex-col">
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                Building photo placeholder
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-900">{selectedBuilding.name}</h2>
                <div className="text-sm text-gray-500 mb-4">{selectedBuilding.type}</div>
                <div className="h-px bg-gray-200 my-4" />
                <p className="text-sm text-gray-700 leading-relaxed">{selectedBuilding.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Area */}
      <div className="fixed inset-0 md:static md:flex-1 bg-white overflow-hidden">
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.5, 5))}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Zoom In"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.5, 1))}
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
          className="absolute inset-0 flex items-center justify-center"
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <InteractiveMap
            zoom={zoom}
            origin={origin}
            destination={destination}
            onSelectBuilding={(b) => setSelectedBuilding(b)}
            showInlineInfo={false}
          />
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {selectedBuilding && (
        <div className="fixed inset-x-0 bottom-0 z-[70] md:hidden">
          <div className="bg-white rounded-t-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
            {/* Header with close button */}
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedBuilding.name}</h2>
                <p className="text-sm text-gray-500">{selectedBuilding.type}</p>
              </div>
              <button
                onClick={() => setSelectedBuilding(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-500">
                Building photo placeholder
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{selectedBuilding.description}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}