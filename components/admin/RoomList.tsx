'use client';

import { useState } from 'react';
import { Room } from '@/lib/rooms';
import { BuildingInfo } from '@/lib/buildings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2, Building2 } from 'lucide-react';
import Image from 'next/image';

interface RoomListProps {
  rooms: Room[];
  buildings: BuildingInfo[];
  onAddRoom: (buildingId: string) => void;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (room: Room) => void;
}

export function RoomList({ rooms, buildings, onAddRoom, onEditRoom, onDeleteRoom }: RoomListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');


  // Filter rooms based on search and selected building
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = searchTerm === '' || 
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesBuilding = selectedBuilding === 'all' || 
      selectedBuilding === 'unassigned' || 
      room.buildingId === selectedBuilding;

    return matchesSearch && matchesBuilding;
  });

  // Separate rooms into assigned and unassigned
  const assignedRooms = filteredRooms.filter(room => 
    room.buildingId && buildings.some(b => b.id === room.buildingId)
  );

  const unassignedRooms = filteredRooms.filter(room => 
    !room.buildingId || !buildings.some(b => b.id === room.buildingId)
  );

  // Group assigned rooms by building
  const filteredRoomsByBuilding = assignedRooms.reduce((acc, room) => {
    if (!acc[room.buildingId]) {
      acc[room.buildingId] = [];
    }
    acc[room.buildingId].push(room);
    return acc;
  }, {} as Record<string, Room[]>);

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedBuilding}
          onChange={(e) => setSelectedBuilding(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All Buildings</option>
          <option value="unassigned">Unassigned Rooms</option>
          {buildings.map((building) => (
            <option key={building.id} value={building.id}>
              {building.name}
            </option>
          ))}
        </select>
      </div>

      {/* Room List */}
      <div className="space-y-8">
        {/* Unassigned Rooms Section */}
        {(selectedBuilding === 'all' || selectedBuilding === 'unassigned') && unassignedRooms.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between bg-yellow-50">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-yellow-600" />
                Unassigned Rooms
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddRoom('')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Room
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {unassignedRooms.map((room) => (
                  <Card key={room.id}>
                    <div className="relative">
                      {room.imageUrl && (
                        <div className="relative w-full h-32 bg-gray-100">
                          <Image
                            src={room.imageUrl}
                            alt={`Photo of ${room.name}`}
                            fill
                            className="object-cover rounded-t-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="flex justify-between items-center text-base">
                          <span>{room.name}</span>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEditRoom(room)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteRoom(room)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">{room.description}</p>
                        <p className="text-sm text-gray-500 mt-2">Floor {room.floor}</p>
                        {room.tags.length > 0 && (
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
                        )}
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assigned Rooms by Building */}
        {Object.entries(filteredRoomsByBuilding).map(([buildingId, buildingRooms]) => {
          const building = buildings.find(b => b.id === buildingId);
          if (!building) return null;

          return (
            <Card key={buildingId}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-gray-500" />
                  {building.name}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddRoom(buildingId)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Room
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {buildingRooms.map((room) => (
                    <Card key={room.id}>
                      <div className="relative">
                        {room.imageUrl && (
                          <div className="relative w-full h-32 bg-gray-100">
                            <Image
                              src={room.imageUrl}
                              alt={`Photo of ${room.name}`}
                              fill
                              className="object-cover rounded-t-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="flex justify-between items-center text-base">
                            <span>{room.name}</span>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEditRoom(room)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDeleteRoom(room)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600">{room.description}</p>
                          <p className="text-sm text-gray-500 mt-2">Floor {room.floor}</p>
                          {room.tags.length > 0 && (
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
                          )}
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
