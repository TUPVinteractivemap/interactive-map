'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import InteractiveMap from '@/components/InteractiveMap';
import { RoomSearchPanel } from '@/components/RoomSearchPanel';
import { BuildingInfo, getAllBuildings } from '@/lib/buildings';
import type { Room } from '@/lib/rooms';
import { buildingCoordinates, getBuildingName, loadBuildingCoordinates } from '@/lib/routing';

// Disable static generation/prerendering for this page to avoid server-side
// Firebase initialization during build (Vercel static export phase)
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function MapPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [zoom, setZoom] = useState(2);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingInfo | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [activeFloor, setActiveFloor] = useState<number | undefined>(undefined);
  const [isMainSidebarCollapsed, setIsMainSidebarCollapsed] = useState(false);
  const [buildings, setBuildings] = useState<Record<string, BuildingInfo>>({});
  const [activeTab, setActiveTab] = useState<'room' | 'building' | 'route'>('route');
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  // Handle touch gestures for mobile
  const pinchInitialDistance = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const initialDistance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      pinchInitialDistance.current = initialDistance;
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
      const initialDistance = pinchInitialDistance.current;
      
      if (initialDistance) {
        const scale = currentDistance / initialDistance;
        const zoomDelta = (scale - 1) * 0.5;
        setZoom(prev => Math.max(0.5, Math.min(3, prev + zoomDelta)));
        pinchInitialDistance.current = currentDistance;
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

  // Load building coordinates and data when component mounts
  useEffect(() => {
    const loadData = async () => {
      await loadBuildingCoordinates();
      const buildingsData = await getAllBuildings();
      const buildingsMap = buildingsData.reduce((acc, building) => {
        acc[building.id] = building;
        return acc;
      }, {} as Record<string, BuildingInfo>);
      setBuildings(buildingsMap);
    };
    loadData();
  }, []);

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setActiveFloor(room.floor);
    // If we have the building info, select it as well
    if (buildings[room.buildingId]) {
      setSelectedBuilding(buildings[room.buildingId]);
    }
  };

  const handleCloseBuildingDetails = () => {
    setSelectedBuilding(null);
    setSelectedRoom(null);
    setActiveFloor(undefined);
  };

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
    <div className="flex flex-col md:flex-row h-screen relative overflow-hidden bg-white">
      {/* Mobile Toggle Button */}
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
      <div
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-all duration-300 ease-in-out fixed md:relative w-full ${
          isMainSidebarCollapsed ? 'md:w-[64px]' : 'md:w-[400px]'
        } h-screen bg-white shadow-lg z-[60] flex flex-col overflow-hidden relative border-r border-gray-200`}
      >
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
          <div>
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
              <div className="flex items-center justify-between py-4 border-b mb-6 bg-gradient-to-r from-white to-red-50/30 -mx-6 px-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center ring-2 ring-red-200 ring-offset-2">
                    <span className="text-red-600 font-semibold text-lg">
                      {user ? (user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()) : 'G'}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold">
                      Hello, {user ? (user.displayName || 'User') : 'Guest'}!
                    </p>
                    <p className="text-sm text-gray-500 font-medium">{user ? user.email : 'Guest Session'}</p>
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

              {/* Welcome Message */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Welcome to TUPV Map</h2>
                <p className="text-sm text-gray-600">Use the options below to find rooms, buildings, or get directions around campus.</p>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 p-6 pt-0">
              {/* Search Options */}
              <div className="mb-6">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('room')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'room'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Find Room
                  </button>
                  <button
                    onClick={() => setActiveTab('building')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'building'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Find Building
                  </button>
                  <button
                    onClick={() => setActiveTab('route')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'route'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Get Route
                  </button>
                </div>
              </div>

              {/* Search Forms */}
              {user ? (
                <div className="space-y-4">
                  {/* Find Room Form */}
                  {activeTab === 'room' && (
                    <div className="space-y-4">
                      <div className="relative">
                        <label htmlFor="room" className="block text-sm font-semibold text-gray-800 mb-1.5">
                          Room Number or Name
                        </label>
                        <input
                          type="text"
                          id="room"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Enter room number (e.g., 301)"
                          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-300 text-gray-700"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 mt-8">
                          <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="w-full bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 transition-colors font-semibold shadow-sm"
                      >
                        Find Room
                      </button>
                    </div>
                  )}

                  {/* Find Building Form */}
                  {activeTab === 'building' && (
                    <div className="space-y-4">
                      <div className="relative">
                        <label htmlFor="building" className="block text-sm font-semibold text-gray-800 mb-1.5">
                          Building Name
                        </label>
                        <select
                          id="building"
                          onChange={(e) => {
                            const buildingId = e.target.value;
                            const building = buildings[buildingId];
                            if (building) {
                              setSelectedBuilding(building);
                            }
                          }}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-300 text-gray-700 appearance-none cursor-pointer"
                        >
                          <option value="">Select a building</option>
                          {Object.entries(buildingCoordinates).map(([buildingId]) => (
                            <option key={buildingId} value={buildingId}>
                              {getBuildingName(buildingId)}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 mt-8">
                          <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 mt-8">
                          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="w-full bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 transition-colors font-semibold shadow-sm"
                      >
                        Find Building
                      </button>
                    </div>
                  )}

                  {/* Route Finding Form */}
                  {activeTab === 'route' && (
                    <form onSubmit={handleSearch} className="space-y-4">
                      {/* Origin Input */}
                      <div className="space-y-2">
                        <label htmlFor="origin" className="block text-sm font-semibold text-gray-800 mb-1.5">
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
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-300 text-gray-700 appearance-none cursor-pointer"
                          >
                            <option value="">Select your location</option>
                            {Object.entries(buildingCoordinates).map(([buildingId]) => (
                              <option key={buildingId} value={buildingId}>
                                {getBuildingName(buildingId)}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Destination Input */}
                      <div className="space-y-2">
                        <label htmlFor="destination" className="block text-sm font-semibold text-gray-800 mb-1.5">
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
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-300 text-gray-700 appearance-none cursor-pointer"
                          >
                            <option value="">Select your destination</option>
                            {Object.entries(buildingCoordinates).map(([buildingId]) => (
                              <option key={buildingId} value={buildingId}>
                                {getBuildingName(buildingId)}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
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
                      <div className="rounded-xl border bg-gradient-to-b from-white to-gray-50/50 p-4 text-sm flex items-start gap-3 shadow-sm">
                        <div className="mt-1">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          {isValidRoute ? (
                            <>
                              <div className="text-gray-900 mb-1">
                                <span className="font-semibold">From:</span> {originName}
                              </div>
                              <div className="text-gray-900 mb-2">
                                <span className="font-semibold">To:</span> {destinationName}
                              </div>
                              <div className="flex items-center gap-2 text-gray-500 text-xs bg-gray-50 rounded-lg p-2">
                                <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Routes follow campus footpaths only. Move the map to preview.</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-500">
                              <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span>Select both a starting location and a destination.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </form>
                  )}
                </div>
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
          </div>
        )}
      </div>

      {/* Details Sidebar (Desktop) */}
      {(selectedBuilding || selectedRoom) && (
        <div className="hidden lg:flex flex-col border-r bg-white w-[400px] relative z-50">
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header with close button */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Place details</h2>
              <button
                onClick={handleCloseBuildingDetails}
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
                {selectedRoom ? 'Room photo placeholder' : 'Building photo placeholder'}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedRoom ? selectedRoom.name : selectedBuilding?.name}
                </h2>
                {selectedRoom ? (
                  <>
                    <div className="text-sm text-gray-500 mb-4">
                      Located in {buildings[selectedRoom.buildingId]?.name}
                    </div>
                    <div className="text-sm text-gray-500 mb-4">
                      Floor {selectedRoom.floor}
                    </div>
                    <div className="h-px bg-gray-200 my-4" />
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">{selectedRoom.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoom.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                ) : selectedBuilding ? (
                  <>
                    <div className="text-sm text-gray-500 mb-4">{selectedBuilding.type}</div>
                    <div className="h-px bg-gray-200 my-4" />
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedBuilding.description}</p>
                    {selectedBuilding.floors > 1 && (
                      <div className="mt-4 text-sm text-gray-500">
                        {selectedBuilding.floors} floors
                      </div>
                    )}
                  </>
                ) : null}
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
            onSelectBuilding={(b) => {
              setSelectedBuilding(b);
              setSelectedRoom(null);
              setActiveFloor(undefined);
            }}
            activeFloor={activeFloor}
            highlightedBuilding={selectedRoom?.buildingId || selectedBuilding?.id}
            showInlineInfo={false}
          />
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {(selectedBuilding || selectedRoom) && (
        <div className="fixed inset-x-0 bottom-0 z-[70] md:hidden">
          <div className="bg-white rounded-t-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
            {/* Header with close button */}
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedRoom ? selectedRoom.name : selectedBuilding?.name}
                </h2>
                {selectedRoom ? (
                  <p className="text-sm text-gray-500">
                    {buildings[selectedRoom.buildingId]?.name} - Floor {selectedRoom.floor}
                  </p>
                ) : selectedBuilding ? (
                  <p className="text-sm text-gray-500">{selectedBuilding.type}</p>
                ) : null}
              </div>
              <button
                onClick={handleCloseBuildingDetails}
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
                {selectedRoom ? 'Room photo placeholder' : 'Building photo placeholder'}
              </div>
              {selectedRoom ? (
                <div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">{selectedRoom.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoom.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : selectedBuilding ? (
                <div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">{selectedBuilding.description}</p>
                  {selectedBuilding.floors > 1 && (
                    <p className="text-sm text-gray-500">{selectedBuilding.floors} floors</p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
