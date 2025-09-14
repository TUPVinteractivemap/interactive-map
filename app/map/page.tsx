'use client';


import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ImageCarousel } from '@/components/ui/image-carousel';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import InteractiveMap from '@/components/InteractiveMap';
import { BuildingInfo, getAllBuildings, searchBuildings } from '@/lib/buildings';
import type { Room } from '@/lib/rooms';
import { searchRooms } from '@/lib/rooms';
import { buildingCoordinates, getBuildingName, loadBuildingCoordinates } from '@/lib/routing';
import { logBuildingSearch, logRoomSearch } from '@/lib/userHistory';
import { History } from 'lucide-react';
import { useHistoryContext } from '@/contexts/HistoryContext';

// Disable static generation/prerendering for this page to avoid server-side
// Firebase initialization during build (Vercel static export phase)
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function MapPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [zoom, setZoom] = useState(() => window.innerWidth < 768 ? 2.5 : 2);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingInfo | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [activeFloor, setActiveFloor] = useState<number | undefined>(undefined);
  const [isMainSidebarCollapsed, setIsMainSidebarCollapsed] = useState(false);
  const [buildings, setBuildings] = useState<Record<string, BuildingInfo>>({});
  const [activeTab, setActiveTab] = useState<'room' | 'building' | 'route'>('route');
  const [searchQuery, setSearchQuery] = useState('');
  const [buildingSearchQuery, setBuildingSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Room[]>([]);
  const [buildingSearchResults, setBuildingSearchResults] = useState<BuildingInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isBuildingSearching, setIsBuildingSearching] = useState(false);
  const [selectedFloorLevel, setSelectedFloorLevel] = useState<number | 'all'>('all');
  const [showFloorFilter, setShowFloorFilter] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { refreshRoomSearches, refreshBuildingSearches } = useHistoryContext();

  // Handle click outside for logout confirmation
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.logout-confirm-dialog')) {
        setShowLogoutConfirm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(1, Math.min(3, prev + delta)));
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
        setZoom(prev => Math.max(1, Math.min(3, prev + zoomDelta)));
        pinchInitialDistance.current = currentDistance;
      }
    }
  };

  useEffect(() => {
    // Guest access is allowed - no redirection needed
  }, []);

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

  // Handle responsive zoom and keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle sidebar with Escape key (desktop only)
      if (event.key === 'Escape' && window.innerWidth >= 768) {
        setIsDesktopSidebarOpen(prev => !prev);
      }
      // Toggle sidebar with 'S' key (desktop only)
      if (event.key === 's' || event.key === 'S') {
        if (window.innerWidth >= 768) {
          setIsDesktopSidebarOpen(prev => !prev);
        }
      }
    };

    const handleResize = () => {
      // Adjust zoom based on screen size
      const isMobile = window.innerWidth < 768;
      setZoom(isMobile ? 2.5 : 2);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Debounced room search effect
  useEffect(() => {
    const searchDebounceTimer = setTimeout(async () => {
      if (searchQuery.trim() && activeTab === 'room') {
        setIsSearching(true);
        try {
          const results = await searchRooms(searchQuery.trim());
          setSearchResults(results);
        } catch (error) {
          console.error('Room search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(searchDebounceTimer);
  }, [searchQuery, activeTab]);

  // Debounced building search effect
  useEffect(() => {
    const buildingSearchDebounceTimer = setTimeout(async () => {
      if (buildingSearchQuery.trim() && activeTab === 'building') {
        setIsBuildingSearching(true);
        try {
          const results = await searchBuildings(buildingSearchQuery.trim());
          setBuildingSearchResults(results);
        } catch (error) {
          console.error('Building search error:', error);
          setBuildingSearchResults([]);
        } finally {
          setIsBuildingSearching(false);
        }
      } else {
        setBuildingSearchResults([]);
        setIsBuildingSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(buildingSearchDebounceTimer);
  }, [buildingSearchQuery, activeTab]);

  // Clear search when switching tabs
  const handleTabChange = (tab: 'room' | 'building' | 'route') => {
    setActiveTab(tab);
    
    // Reset all search states and selections when switching tabs
    if (tab !== 'room') {
      setSearchQuery('');
      setSearchResults([]);
    }
    if (tab !== 'building') {
      setBuildingSearchQuery('');
      setBuildingSearchResults([]);
    }
    
    // Clear route selections when not on route tab
    if (tab !== 'route') {
      setOrigin('');
      setDestination('');
    }
    
    // Always clear selected building, room, and floor when switching tabs
    setSelectedBuilding(null);
    setSelectedRoom(null);
    setActiveFloor(undefined);
  };

  const handleRoomSelect = async (room: Room) => {
    setSelectedRoom(room);
    setActiveFloor(room.floor);
    // If we have the building info, select it as well
    if (buildings[room.buildingId]) {
      setSelectedBuilding(buildings[room.buildingId]);
    }
    
    // Clear route selections when selecting a room
    setOrigin('');
    setDestination('');

    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    // Log room search to user history
    if (user?.uid) {
      const buildingName = buildings[room.buildingId]?.name || 'Unknown Building';
      try {
        await logRoomSearch(
          user.uid,
          room.id,
          room.name,
          room.buildingId,
          buildingName,
          searchQuery.trim() || undefined
        );
        // Refresh room searches in history context
        await refreshRoomSearches();
      } catch (error) {
        console.error('❌ Failed to log room selection:', error);
      }
    }
  };

  const handleBuildingSelect = async (building: BuildingInfo) => {
    setSelectedBuilding(building);
    setSelectedRoom(null);
    setActiveFloor(undefined);
    
    // Clear route selections when selecting a building
    setOrigin('');
    setDestination('');

    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    // Log building search to user history
    if (user?.uid) {
      try {
        await logBuildingSearch(
          user.uid,
          building.id,
          building.name,
          buildingSearchQuery.trim() || undefined
        );
        // Refresh building searches to update the UI
        await refreshBuildingSearches();
      } catch (error) {
        console.error('❌ Failed to log building selection:', error);
      }
    }
  };

  const handleCloseBuildingDetails = () => {
    setSelectedBuilding(null);
    setSelectedRoom(null);
    setActiveFloor(undefined);
    
    // Also clear any search results to fully reset the UI
    setSearchQuery('');
    setSearchResults([]);
    setBuildingSearchQuery('');
    setBuildingSearchResults([]);
  };

  // Show loading only while auth is loading
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading&hellip;</p>
        </div>
      </div>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin && destination && origin !== destination) {
      console.log('Searching route from', origin, 'to', destination);
      // Clear any previous building/room selections when starting route search
      setSelectedBuilding(null);
      setSelectedRoom(null);
      setActiveFloor(undefined);
      // Close sidebar on mobile
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
      // The route will be calculated automatically by the InteractiveMap component
    }
  };

  const handleClearRoute = () => {
    setOrigin('');
    setDestination('');
  };

  const handleLogout = async () => {
    try {
      setShowLogoutConfirm(false);
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  // Get available floor levels from buildings data
  const getAvailableFloorLevels = () => {
    const floorLevels = new Set<number>();
    Object.values(buildings).forEach(building => {
      for (let i = 1; i <= building.floors; i++) {
        floorLevels.add(i);
      }
    });
    return Array.from(floorLevels).sort((a, b) => a - b);
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

      {/* Desktop Toggle Button - when sidebar is closed */}
      {!isDesktopSidebarOpen && (
        <button
          onClick={() => setIsDesktopSidebarOpen(true)}
          className="hidden md:flex fixed top-4 left-4 z-30 bg-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 items-center justify-center group"
          title="Open Sidebar"
        >
          <svg
            className="h-6 w-6 text-gray-700 group-hover:text-red-600 transition-colors"
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
        } ${
          isDesktopSidebarOpen ? 'md:translate-x-0' : 'md:-translate-x-full'
        } transition-all duration-300 ease-in-out fixed md:relative w-full ${
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
                
                {/* Close Buttons */}
                <div className="flex items-center gap-2">
                  {/* Desktop Close Button */}
                  <button
                    onClick={() => setIsDesktopSidebarOpen(false)}
                    className="hidden md:flex p-2 hover:bg-gray-100 rounded-lg transition-colors items-center justify-center group"
                    title="Close Sidebar (Full Map View)"
                  >
                    <svg
                      className="h-5 w-5 text-gray-700 group-hover:text-red-600 transition-colors"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  {/* Mobile Close Button */}
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
                  <div className="relative">
                    <button
                      onClick={() => setShowLogoutConfirm(true)}
                      className="text-gray-600 hover:text-red-600 font-medium text-sm transition-colors"
                    >
                      Logout
                    </button>
                    {/* Logout Confirmation Dialog */}
                    {showLogoutConfirm && (
                      <div className="absolute right-0 top-8 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 logout-confirm-dialog">
                        <p className="text-sm text-gray-700 mb-4">Are you sure you want to logout?</p>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setShowLogoutConfirm(false)}
                            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleLogout}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
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
                <div className="mt-3 hidden md:block">
                  <p className="text-xs text-gray-500">
                    💡 <strong>Tip:</strong> Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">S</kbd> or <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">Esc</kbd> for full map view
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 p-6 pt-0">
              {/* Search Options */}
              <div className="mb-6">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTabChange('room')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'room'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Find Room
                  </button>
                  <button
                    onClick={() => handleTabChange('building')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'building'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Find Building
                  </button>
                  <button
                    onClick={() => handleTabChange('route')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'route'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Get Route
                  </button>
                </div>

                {/* History Link */}
                {user && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <Link
                      href="/history"
                      className="flex items-center justify-center w-full py-3 px-4 text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                    >
                      <History className="w-4 h-4 mr-2" />
                      View History
                    </Link>
                  </div>
                )}
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
                          placeholder="Enter room number (e.g., 301) or name&hellip;"
                          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-300 text-gray-700"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 mt-8">
                          {isSearching ? (
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Search Results */}
                      {searchQuery.trim() && (
                        <div className="space-y-2">
                          {searchResults.length > 0 ? (
                            <>
                              <p className="text-sm text-gray-600 font-medium">
                                Found {searchResults.length} room{searchResults.length !== 1 ? 's' : ''}:
                              </p>
                              <div className="max-h-64 overflow-y-auto space-y-2">
                                {searchResults.map((room) => (
                                  <button
                                    key={room.id}
                                    onClick={() => handleRoomSelect(room)}
                                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-red-300 transition-colors"
                                  >
                                    <div className="font-medium text-gray-900">{room.name}</div>
                                    <div className="text-sm text-gray-500">
                                      {buildings[room.buildingId]?.name} - Floor {room.floor}
                                    </div>
                                    {room.description && (
                                      <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                                        {room.description}
                                      </div>
                                    )}
                                    {room.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {room.tags.slice(0, 3).map((tag) => (
                                          <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                            {tag}
                                          </span>
                                        ))}
                                        {room.tags.length > 3 && (
                                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                            +{room.tags.length - 3} more
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </>
                          ) : !isSearching ? (
                            <div className="text-center py-8 text-gray-500">
                              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="text-sm">No rooms found for &quot;{searchQuery}&quot;</p>
                              <p className="text-xs text-gray-400 mt-1">Try searching by room number, name, or keywords</p>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <div className="w-8 h-8 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
                              <p className="text-sm">Searching&hellip;</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Search Tips */}
                      {!searchQuery.trim() && (
                        <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-2 text-blue-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="font-medium text-sm">Search Tips</p>
                          </div>
                          <div className="text-xs text-blue-600 space-y-1">
                            <p>• Type room numbers: &quot;301&quot;, &quot;A201&quot;, &quot;Lab 1&quot;</p>
                            <p>• Search by type: &quot;classroom&quot;, &quot;laboratory&quot;, &quot;office&quot;</p>
                            <p>• Use partial names: &quot;comp&quot; for &quot;Computer Lab&quot;</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Find Building Form */}
                  {activeTab === 'building' && (
                    <div className="space-y-4">
                      <div className="relative">
                        <label htmlFor="building" className="block text-sm font-semibold text-gray-800 mb-1.5">
                          Building Name or Type
                        </label>
                        <input
                          type="text"
                          id="building"
                          value={buildingSearchQuery}
                          onChange={(e) => setBuildingSearchQuery(e.target.value)}
                          placeholder="Enter building name or type&hellip;"
                          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-300 text-gray-700"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 mt-8">
                          {isBuildingSearching ? (
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Building Search Results */}
                      {buildingSearchQuery.trim() && (
                        <div className="space-y-2">
                          {buildingSearchResults.length > 0 ? (
                            <>
                              <p className="text-sm text-gray-600 font-medium">
                                Found {buildingSearchResults.length} building{buildingSearchResults.length !== 1 ? 's' : ''}:
                              </p>
                              <div className="max-h-64 overflow-y-auto space-y-2">
                                {buildingSearchResults.map((building) => (
                                  <button
                                    key={building.id}
                                    onClick={() => handleBuildingSelect(building)}
                                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-red-300 transition-colors"
                                  >
                                    <div className="font-medium text-gray-900">{building.name}</div>
                                    <div className="text-sm text-gray-500">
                                      {building.type} • {building.floors} floor{building.floors !== 1 ? 's' : ''}
                                    </div>
                                    {building.description && (
                                      <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                                        {building.description}
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </>
                          ) : !isBuildingSearching ? (
                            <div className="text-center py-8 text-gray-500">
                              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <p className="text-sm">No buildings found for &quot;{buildingSearchQuery}&quot;</p>
                              <p className="text-xs text-gray-400 mt-1">Try searching by building name or type</p>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <div className="w-8 h-8 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
                              <p className="text-sm">Searching&hellip;</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Building Search Tips */}
                      {!buildingSearchQuery.trim() && (
                        <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-2 text-blue-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="font-medium text-sm">Search Tips</p>
                          </div>
                          <div className="text-xs text-blue-600 space-y-1">
                            <p>• Type building names: &quot;Engineering&quot;, &quot;Technology&quot;, &quot;Library&quot;</p>
                            <p>• Search by type: &quot;Academic&quot;, &quot;Administrative&quot;, &quot;Recreational&quot;</p>
                            <p>• Use partial names: &quot;Tech&quot; for &quot;Technology Building&quot;</p>
                          </div>
                        </div>
                      )}
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
                            <option value="">&nbsp;Select your location</option>
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
                            <option value="">&nbsp;Select your destination</option>
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
        <div className={`hidden lg:flex flex-col border-r bg-white w-[400px] relative z-50 h-screen ${
          !isDesktopSidebarOpen ? 'md:absolute md:left-0' : ''
        }`}>
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
              <div className="w-full h-48 bg-gray-200 relative overflow-hidden">
                {selectedRoom && (selectedRoom.imageUrl || selectedRoom.images?.length > 0) ? (
                  <ImageCarousel images={[...(selectedRoom.imageUrl ? [selectedRoom.imageUrl] : []), ...(selectedRoom.images || [])]} className="w-full h-full" />
                ) : selectedBuilding && (selectedBuilding.imageUrl || selectedBuilding.images?.length > 0) ? (
                  <ImageCarousel images={[...(selectedBuilding.imageUrl ? [selectedBuilding.imageUrl] : []), ...(selectedBuilding.images || [])]} className="w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">No images available</div>
                )}
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
        {/* Unified Map Controls */}
        <div className="absolute top-6 right-6 md:top-4 md:right-4 z-10 flex flex-col gap-2">
          {/* Full Map View Toggle (Desktop Only) */}
          {isDesktopSidebarOpen && (
            <button
              onClick={() => setIsDesktopSidebarOpen(false)}
              className="hidden md:flex w-auto px-3 py-2 bg-white rounded-lg shadow-lg items-center justify-center hover:bg-gray-50 transition-colors gap-2 group"
              title="Full Map View"
            >
              <svg className="w-4 h-4 text-gray-700 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span className="text-xs font-medium text-gray-700 group-hover:text-red-600 transition-colors">Full View</span>
            </button>
          )}

          {/* Zoom Controls */}
          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.5, window.innerWidth < 768 ? 5 : 3.5))}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Zoom In"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.5, window.innerWidth < 768 ? 1.5 : 1))}
            className={`w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center transition-colors ${
              zoom <= (window.innerWidth < 768 ? 1.5 : 1)
                ? 'opacity-50 cursor-not-allowed text-gray-400'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
            title="Zoom Out"
            disabled={zoom <= (window.innerWidth < 768 ? 1.5 : 1)}
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={() => setZoom(window.innerWidth < 768 ? 2.5 : 1)}
            className={`w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center transition-colors text-xs font-medium ${
              zoom === (window.innerWidth < 768 ? 2.5 : 1)
                ? 'opacity-50 cursor-not-allowed text-gray-400'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
            title="Reset Zoom"
            disabled={zoom === (window.innerWidth < 768 ? 2.5 : 1)}
          >
            100%
          </button>

          {/* Labels Toggle */}
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors ${
              showLabels ? 'text-blue-600' : 'text-gray-400'
            }`}
            title={showLabels ? "Hide Building Labels" : "Show Building Labels"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </button>

          {/* Floor Filter Button */}
          <button
            onClick={() => setShowFloorFilter(!showFloorFilter)}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Floor Level Filter"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </button>

          {/* Clear Route Button - Only shown when route is active */}
          {origin && destination && origin !== destination && (
            <button
              onClick={handleClearRoute}
              className="w-10 h-10 bg-red-500 text-white rounded-lg shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors"
              title="Clear Route"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Floor Level Filter Dropdown - Now positioned relative to the button */}
        {showFloorFilter && (
          <div className="absolute top-32 right-2 md:top-52 md:right-4 z-40">
            <div className="bg-white rounded-lg shadow-lg p-3 min-w-[220px]">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Floor Level Filter
                </label>
                <button
                  onClick={() => setShowFloorFilter(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <select
                id="floor-level-filter"
                value={selectedFloorLevel}
                onChange={(e) => setSelectedFloorLevel(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">All Floors</option>
                {getAvailableFloorLevels().map(level => (
                  <option key={level} value={level}>
                    Floor {level}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Buildings with {selectedFloorLevel === 'all' ? 'any floor level' : `at least ${selectedFloorLevel} floor${selectedFloorLevel === 1 ? '' : 's'}`} will be highlighted
              </p>
            </div>
          </div>
        )}

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
            highlightedBuilding={selectedBuilding?.id || selectedRoom?.buildingId}
            showInlineInfo={false}
            selectedFloorLevel={selectedFloorLevel}
            showLabels={showLabels}
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
              <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 relative overflow-hidden">
                {selectedRoom && (selectedRoom.imageUrl || selectedRoom.images?.length > 0) ? (
                  <ImageCarousel images={[...(selectedRoom.imageUrl ? [selectedRoom.imageUrl] : []), ...(selectedRoom.images || [])]} className="w-full h-full" />
                ) : selectedBuilding && (selectedBuilding.imageUrl || selectedBuilding.images?.length > 0) ? (
                  <ImageCarousel images={[...(selectedBuilding.imageUrl ? [selectedBuilding.imageUrl] : []), ...(selectedBuilding.images || [])]} className="w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">No images available</div>
                )}
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
