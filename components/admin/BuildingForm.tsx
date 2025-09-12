'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BuildingInfo } from '@/lib/buildings';
import { calculatePathCenter } from '@/lib/utils';

interface BuildingFormProps {
  building?: BuildingInfo;
  onSubmit: (data: Partial<BuildingInfo>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function BuildingForm({ building, onSubmit, onCancel, isSubmitting }: BuildingFormProps) {
  const [formData, setFormData] = useState({
    id: building?.id || '',
    name: building?.name || '',
    description: building?.description || '',
    type: building?.type || '',
    pathData: building?.pathData || '',
    imageUrl: building?.imageUrl || '',
    floors: building?.floors || 1, // Preserve floors field
  });

  // Convert input to valid ID format
  const formatBuildingId = (input: string) => {
    return input
      .replace(/[^a-zA-Z0-9]/g, '_') // Replace non-alphanumeric chars with underscore
      .replace(/_{2,}/g, '_')        // Replace multiple underscores with single
      .replace(/^_|_$/g, '');        // Remove leading/trailing underscores
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Calculate center coordinates from SVG path data
    const center = calculatePathCenter(formData.pathData);
    
    await onSubmit({
      ...formData,
      center,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="id">Building ID</Label>
        <Input
          id="id"
          value={formData.id}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const formattedId = formatBuildingId(e.target.value);
            setFormData(prev => ({ ...prev, id: formattedId }));
          }}
          required
          placeholder="e.g., Main_Building"
          className="font-mono"
        />
        <p className="text-xs text-gray-500">
          This ID will be used as the document identifier in the database.
          Only letters (A-Z, a-z), numbers, and underscores are allowed.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Building Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData(prev => ({ ...prev, name: e.target.value }));
            // Auto-generate ID from name if ID is empty
            if (!formData.id) {
              const formattedId = formatBuildingId(e.target.value);
              setFormData(prev => ({ ...prev, id: formattedId }));
            }
          }}
          required
          placeholder="e.g., Main Building"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
          placeholder="Brief description of the building..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Building Type</Label>
        <Input
          id="type"
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
          required
          placeholder="e.g., Academic, Administrative, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pathData">SVG Path Data</Label>
        <Textarea
          id="pathData"
          value={formData.pathData}
          onChange={(e) => setFormData(prev => ({ ...prev, pathData: e.target.value }))}
          required
          placeholder="SVG path data (d attribute)"
          className="font-mono text-sm"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Building Image URL</Label>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) => {
            let url = e.target.value.trim();
            
            // Convert regular Imgur URLs to direct image URLs
            if (url.includes('imgur.com/a/')) {
              // Extract ID from album URL
              const id = url.split('/a/')[1]?.split(/[^a-zA-Z0-9]/)[0];
              if (id) {
                url = `https://i.imgur.com/${id}.jpg`;
              }
            } else if (url.includes('imgur.com/')) {
              // Extract ID from regular Imgur URL
              const id = url.split('imgur.com/')[1]?.split(/[^a-zA-Z0-9]/)[0];
              if (id) {
                url = `https://i.imgur.com/${id}.jpg`;
              }
            }
            
            // Only accept direct Imgur URLs or empty string
            if (url === '' || url.startsWith('https://i.imgur.com/')) {
              setFormData(prev => ({ ...prev, imageUrl: url }));
            }
          }}
          placeholder="Imgur direct image URL (e.g., https://i.imgur.com/abcd123.jpg)"
          className="font-mono text-sm"
        />
        <p className="text-xs text-gray-500">
          Paste any Imgur URL - it will be automatically converted to the correct format. You can paste an album URL, image page URL, or direct image URL.
        </p>
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
          {isSubmitting ? 'Saving...' : building ? 'Update Building' : 'Add Building'}
        </Button>
      </div>
    </form>
  );
}
