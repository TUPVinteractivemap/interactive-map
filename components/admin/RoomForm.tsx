'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Room } from '@/lib/rooms';
import { BuildingInfo } from '@/lib/buildings';

interface RoomFormProps {
  room?: Room;
  buildings: BuildingInfo[];
  onSubmit: (data: Partial<Room>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function RoomForm({ room, buildings, onSubmit, onCancel, isSubmitting }: RoomFormProps) {
  const [formData, setFormData] = useState({
    id: room?.id || '',
    name: room?.name || '',
    description: room?.description || '',
    buildingId: room?.buildingId || '',
    floor: room?.floor || 1,
    tags: room?.tags || [],
    imageUrl: room?.imageUrl || '',
  });

  // Convert regular Imgur URLs to direct image URLs
  const handleImageUrlChange = (url: string) => {
    let processedUrl = url.trim();
    
    // Convert regular Imgur URLs to direct image URLs
    if (url.includes('imgur.com/a/')) {
      // Extract ID from album URL
      const id = url.split('/a/')[1]?.split(/[^a-zA-Z0-9]/)[0];
      if (id) {
        processedUrl = `https://i.imgur.com/${id}.jpg`;
      }
    } else if (url.includes('imgur.com/')) {
      // Extract ID from regular Imgur URL
      const id = url.split('imgur.com/')[1]?.split(/[^a-zA-Z0-9]/)[0];
      if (id) {
        processedUrl = `https://i.imgur.com/${id}.jpg`;
      }
    }
    
    // Only accept direct Imgur URLs or empty string
    if (processedUrl === '' || processedUrl.startsWith('https://i.imgur.com/')) {
      setFormData(prev => ({ ...prev, imageUrl: processedUrl }));
    }
  };

  // State for tag input
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Room Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
          placeholder="e.g., Room 301, Computer Lab 1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="buildingId">Building</Label>
        <select
          id="buildingId"
          value={formData.buildingId}
          onChange={(e) => setFormData(prev => ({ ...prev, buildingId: e.target.value }))}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Select a building</option>
          {buildings.map((building) => (
            <option key={building.id} value={building.id}>
              {building.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="floor">Floor Number</Label>
        <Input
          id="floor"
          type="number"
          min={1}
          value={formData.floor}
          onChange={(e) => setFormData(prev => ({ ...prev, floor: parseInt(e.target.value) || 1 }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of the room..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Room Image URL</Label>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) => handleImageUrlChange(e.target.value)}
          placeholder="Imgur image URL (e.g., https://i.imgur.com/abcd123.jpg)"
          className="font-mono text-sm"
        />
        <p className="text-xs text-gray-500">
          Paste any Imgur URL - it will be automatically converted to the correct format. You can paste an album URL, image page URL, or direct image URL.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tags (e.g., classroom, laboratory)"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button
            type="button"
            onClick={addTag}
            variant="outline"
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-gray-500 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : room ? 'Update Room' : 'Add Room'}
        </Button>
      </div>
    </form>
  );
}
