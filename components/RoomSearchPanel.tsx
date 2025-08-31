'use client';

import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { searchRooms } from '@/lib/rooms';
import type { Room } from '@/lib/rooms';
import { Dialog } from './ui/dialog';
import { Label } from './ui/label';
import { getAllBuildings, type BuildingInfo } from '@/lib/buildings';

interface RoomSearchPanelProps {
  onRoomSelect: (room: Room) => void;
}

export function RoomSearchPanel({ onRoomSelect }: RoomSearchPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [buildings, setBuildings] = useState<Record<string, BuildingInfo>>({});

  useEffect(() => {
    const loadBuildings = async () => {
      try {
        const buildingsData = await getAllBuildings();
        const buildingsMap = buildingsData.reduce((acc, building) => {
          acc[building.id] = building;
          return acc;
        }, {} as Record<string, BuildingInfo>);
        setBuildings(buildingsMap);
      } catch (error) {
        console.error('Error loading buildings:', error);
      }
    };
    loadBuildings();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      const foundRooms = await searchRooms(searchTerm);
      setResults(foundRooms);
    } catch (error) {
      console.error('Error searching rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="room-search">Search for a Room</Label>
        <div className="flex gap-2">
          <Input
            id="room-search"
            type="text"
            placeholder="Room name, number, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch} 
            disabled={isLoading}
            className="min-w-[80px]"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-2 mt-4">
          <Label>Results</Label>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {results.map((room) => (
              <div
                key={room.id}
                onClick={() => onRoomSelect(room)}
                className="p-3 bg-white border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-medium text-gray-900">{room.name}</h3>
                <p className="text-sm text-gray-500">
                  Located in {buildings[room.buildingId]?.name || 'Loading...'}
                </p>
                <p className="text-sm text-gray-500">Floor {room.floor}</p>
                {room.description && (
                  <p className="text-sm text-gray-600 mt-1">{room.description}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {room.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchTerm && results.length === 0 && !isLoading && (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No rooms found matching your search.</p>
        </div>
      )}
    </div>
  );
}
