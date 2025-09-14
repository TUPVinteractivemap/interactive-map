import { Room } from '@/lib/rooms';
import { BuildingInfo } from '@/lib/buildings';
import { ImageCarousel } from '@/components/ui/image-carousel';

interface RoomInfoProps {
  room: Room;
  building: BuildingInfo;
  onClose: () => void;
}

export function RoomInfo({ room, building, onClose }: RoomInfoProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-lg max-w-sm">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{room.name}</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {room.images?.length > 0 && (
        <div className="mb-4 h-48">
          <ImageCarousel images={room.images} className="h-full" />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Located in</p>
          <p className="font-medium text-gray-900">{building.name}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Floor</p>
          <p className="font-medium text-gray-900">{room.floor}</p>
        </div>

        {room.description && (
          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="text-gray-700">{room.description}</p>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500 mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {room.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 rounded-full text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
