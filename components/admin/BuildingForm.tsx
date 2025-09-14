'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BuildingInfo } from '@/lib/buildings';
import { calculatePathCenter } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ImageCarousel } from '@/components/ui/image-carousel';

interface BuildingFormProps {
  building?: BuildingInfo;
  onSubmit: (data: Partial<BuildingInfo>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function BuildingForm({ building, onSubmit, onCancel, isSubmitting }: BuildingFormProps) {
  const [showImageEditDialog, setShowImageEditDialog] = useState(false);
  const [pendingImageEdit, setPendingImageEdit] = useState<{ index: number; url: string } | null>(null);
  const [formData, setFormData] = useState({
    id: building?.id || '',
    name: building?.name || '',
    description: building?.description || '',
    type: building?.type || '',
    pathData: building?.pathData || '',
    images: building?.images || [],
    floors: building?.floors || 1, // Preserve floors field
  });

  // Convert input to valid ID format
  const formatBuildingId = (input: string) => {
    return input
      .replace(/[^a-zA-Z0-9]/g, '_') // Replace non-alphanumeric chars with underscore
      .replace(/_{2,}/g, '_')        // Replace multiple underscores with single
      .replace(/^_|_$/g, '');        // Remove leading/trailing underscores
  };

  // Function to process and validate image URLs
  const processImageUrl = (url: string, index: number) => {
    let processedUrl = url.trim();
    
    // Convert regular Imgur URLs to direct image URLs
    if (url.includes('imgur.com/a/')) {
      const id = url.split('/a/')[1]?.split(/[^a-zA-Z0-9]/)[0];
      if (id) {
        processedUrl = `https://i.imgur.com/${id}.jpg`;
      }
    } else if (url.includes('imgur.com/')) {
      const id = url.split('imgur.com/')[1]?.split(/[^a-zA-Z0-9]/)[0];
      if (id) {
        processedUrl = `https://i.imgur.com/${id}.jpg`;
      }
    }
    
    // Only accept direct Imgur URLs or empty string
    if (processedUrl === '' || processedUrl.startsWith('https://i.imgur.com/')) {
      const newImages = [...formData.images];
      newImages[index] = processedUrl;
      // Remove empty values from end of array
      while (newImages.length > 0 && !newImages[newImages.length - 1]) {
        newImages.pop();
      }
      setFormData(prev => ({ ...prev, images: newImages }));
    }
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
  <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg overflow-y-auto" style={{maxHeight: '80vh'}}>
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

      <div className="space-y-4">
        <Label>Building Images (Max 3)</Label>
        
        {/* Display existing images if any */}
        {formData.images.length > 0 && (
          <div className="mb-4 border rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-medium mb-2">Current Images:</h4>
            <div className="h-48 mb-4">
              <ImageCarousel images={formData.images} className="rounded-lg" />
            </div>
          </div>
        )}

        {/* Image input fields */}
        {[0, 1, 2].map((index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              value={formData.images[index] || ''}
              onChange={(e) => {
                const url = e.target.value.trim();
                if (formData.images[index]) {
                  // If there's an existing image, show confirmation dialog
                  setPendingImageEdit({ index, url });
                  setShowImageEditDialog(true);
                } else {
                  // If no existing image, process the URL directly
                  processImageUrl(url, index);
                }
              }}
              placeholder={`Image ${index + 1} URL (Imgur)`}
              className="font-mono text-sm"
            />
            {formData.images[index] && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700"
                onClick={() => {
                  setPendingImageEdit({ index, url: '' });
                  setShowImageEditDialog(true);
                }}
              >
                ×
              </Button>
            )}
          </div>
        ))}
        <p className="text-xs text-gray-500">
          Paste any Imgur URL - it will be automatically converted to the correct format.
          You can add up to 3 images per building.
        </p>
      </div>

      {/* Image Edit Confirmation Dialog */}
      <Dialog open={showImageEditDialog} onOpenChange={setShowImageEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingImageEdit?.url ? 'Update Image' : 'Remove Image'}
            </DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to {pendingImageEdit?.url ? 'update' : 'remove'} this image?
            This action cannot be undone.
          </p>
          <DialogFooter className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowImageEditDialog(false);
                setPendingImageEdit(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (pendingImageEdit) {
                  processImageUrl(pendingImageEdit.url, pendingImageEdit.index);
                }
                setShowImageEditDialog(false);
                setPendingImageEdit(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
