"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Room } from "@/lib/rooms";
import { BuildingInfo } from "@/lib/buildings";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ImageCarousel } from "@/components/ui/image-carousel";

interface RoomFormProps {
  room?: Room;
  buildings: BuildingInfo[];
  onSubmit: (data: Partial<Room>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function RoomForm({
  room,
  buildings,
  onSubmit,
  onCancel,
  isSubmitting,
}: RoomFormProps) {
  const [showImageEditDialog, setShowImageEditDialog] = useState(false);
  const [pendingImageEdit, setPendingImageEdit] = useState<{
    index: number;
    url: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    id: room?.id || "",
    name: room?.name || "",
    description: room?.description || "",
    buildingId: room?.buildingId || "",
    floor: room?.floor || 1,
    tags: room?.tags || [],
    images: room?.images || [],
  });

  const [tagInput, setTagInput] = useState("");

  // Normalize imgur URLs
  const processImageUrl = (url: string, index: number) => {
    let processedUrl = url.trim();

    if (url.includes("imgur.com/a/")) {
      const id = url.split("/a/")[1]?.split(/[^a-zA-Z0-9]/)[0];
      if (id) processedUrl = `https://i.imgur.com/${id}.jpg`;
    } else if (url.includes("imgur.com/")) {
      const id = url.split("imgur.com/")[1]?.split(/[^a-zA-Z0-9]/)[0];
      if (id) processedUrl = `https://i.imgur.com/${id}.jpg`;
    }

    if (processedUrl === "" || processedUrl.startsWith("https://i.imgur.com/")) {
      const newImages = [...formData.images];
      newImages[index] = processedUrl;

      // Trim empty slots at the end
      while (newImages.length > 0 && !newImages[newImages.length - 1]) {
        newImages.pop();
      }

      setFormData((prev) => ({ ...prev, images: newImages }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  return (
  <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg overflow-y-auto" style={{maxHeight: '80vh'}}>
      {/* Room name */}
      <div className="space-y-2">
        <Label htmlFor="name">Room Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          required
          placeholder="e.g., Room 301, Computer Lab 1"
        />
      </div>

      {/* Building */}
      <div className="space-y-2">
        <Label htmlFor="buildingId">Building</Label>
        <select
          id="buildingId"
          value={formData.buildingId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, buildingId: e.target.value }))
          }
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

      {/* Floor */}
      <div className="space-y-2">
        <Label htmlFor="floor">Floor Number</Label>
        <Input
          id="floor"
          type="number"
          min={1}
          value={formData.floor}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              floor: parseInt(e.target.value) || 1,
            }))
          }
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Brief description of the room..."
          rows={3}
        />
      </div>

      {/* Images */}
      <div className="space-y-4">
        <Label>Room Images (Max 3)</Label>

        {formData.images.length > 0 && (
          <div className="mb-4 border rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-medium mb-2">Current Images:</h4>
            <div className="h-48 mb-4">
              <ImageCarousel images={formData.images} className="rounded-lg" />
            </div>
          </div>
        )}

        {[0, 1, 2].map((index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              value={formData.images[index] || ""}
              onChange={(e) => {
                const url = e.target.value.trim();
                if (formData.images[index]) {
                  setPendingImageEdit({ index, url });
                  setShowImageEditDialog(true);
                } else {
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
                  setPendingImageEdit({ index, url: "" });
                  setShowImageEditDialog(true);
                }}
              >
                ×
              </Button>
            )}
          </div>
        ))}

        <p className="text-xs text-gray-500">
          Paste any Imgur URL - it will be automatically converted to the correct
          format. You can add up to 3 images per room.
        </p>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tags (e.g., classroom, laboratory)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button type="button" onClick={addTag} variant="outline">
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

      {/* Action buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : room ? "Update Room" : "Add Room"}
        </Button>
      </div>

      {/* Confirm image update/remove */}
      <Dialog open={showImageEditDialog} onOpenChange={setShowImageEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingImageEdit?.url ? "Update Image" : "Remove Image"}
            </DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to{" "}
            {pendingImageEdit?.url ? "update" : "remove"} this image? This
            action cannot be undone.
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
                  processImageUrl(
                    pendingImageEdit.url,
                    pendingImageEdit.index
                  );
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
    </form>
  );
}
