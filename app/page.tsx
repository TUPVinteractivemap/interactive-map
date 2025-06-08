'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function LandingPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching route from', origin, 'to', destination);
  };

  return (
    <main className="flex h-screen">
      {/* Navigation Sidebar */}
      <div className="w-[400px] h-full bg-white shadow-lg z-10 p-6 flex flex-col">
        {/* Logo and Title */}
        <div className="flex items-center gap-3 mb-8">
          <Image
            src="/images/tupv-logo.png"
            alt="TUPV Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <h1 className="text-xl font-semibold text-gray-800">TUPV Interactive Map</h1>
        </div>

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

        {/* User Profile / Settings */}
        <div className="mt-auto pt-4 border-t">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
            <svg
              className="h-5 w-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* Map Area (Temporary) */}
      <div className="flex-1 bg-gray-100 relative">
        {/* Temporary Map Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <svg
              className="h-24 w-24 mx-auto mb-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-xl font-medium">Map will be integrated here</p>
          </div>
        </div>
      </div>
    </main>
  );
}
