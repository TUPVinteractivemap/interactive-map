import { useState, useCallback } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { searchRooms } from '@/lib/rooms';
import type { Room } from '@/lib/rooms';

interface RoomSearchProps {
  onRoomSelect: (room: Room) => void;
}

export function RoomSearch({ onRoomSelect }: RoomSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Room[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const rooms = await searchRooms(searchTerm);
      setResults(rooms);
    } catch (error) {
      console.error('Error searching rooms:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search for a room..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((room) => (
            <Card
              key={room.id}
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => onRoomSelect(room)}
            >
              <h3 className="font-medium">{room.name}</h3>
              <p className="text-sm text-gray-600">Floor {room.floor}</p>
              {room.description && (
                <p className="text-sm text-gray-500">{room.description}</p>
              )}
              <div className="flex flex-wrap gap-1 mt-2">
                {room.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-gray-100 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
