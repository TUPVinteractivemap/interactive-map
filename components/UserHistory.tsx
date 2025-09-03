'use client';

import { useState } from 'react';
import { useHistoryContext } from '@/contexts/HistoryContext';
import { HistoryItem, RouteHistoryItem, BuildingSearchHistoryItem, RoomSearchHistoryItem } from '@/lib/userHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trash2,
  Building2,
  Clock,
  History,
  Trash,
  RefreshCw,
  Navigation,
  MapPin as PinIcon
} from 'lucide-react';
// import { formatDistanceToNow } from 'date-fns';

interface HistoryItemCardProps {
  item: HistoryItem;
  onDelete: (id: string) => void;
}

function HistoryItemCard({ item, onDelete }: HistoryItemCardProps) {
  const getIcon = () => {
    switch (item.type) {
      case 'route':
        return <Navigation className="h-5 w-5 text-red-500" />;
      case 'building_search':
        return <Building2 className="h-5 w-5 text-green-600" />;
      case 'room_search':
        return <PinIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTitle = () => {
    switch (item.type) {
      case 'route':
        const routeItem = item as RouteHistoryItem;
        return `${routeItem.fromBuildingName} → ${routeItem.toBuildingName}`;
      case 'building_search':
        const buildingItem = item as BuildingSearchHistoryItem;
        return buildingItem.buildingName;
      case 'room_search':
        const roomItem = item as RoomSearchHistoryItem;
        return `${roomItem.roomName}`;
      default:
        return 'Unknown Activity';
    }
  };

  const getSubtitle = () => {
    switch (item.type) {
      case 'route':
        return 'Route navigation';
      case 'building_search':
        const buildingItem = item as BuildingSearchHistoryItem;
        return buildingItem.searchQuery ? `"${buildingItem.searchQuery}"` : 'Building viewed';
      case 'room_search':
        const roomItem = item as RoomSearchHistoryItem;
        return roomItem.searchQuery ? `"${roomItem.searchQuery}"` : roomItem.buildingName;
      default:
        return '';
    }
  };

  const getTypeBadge = () => {
    switch (item.type) {
      case 'route':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
            <Navigation className="h-3 w-3 mr-1" />
            Route
          </Badge>
        );
      case 'building_search':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
            <Building2 className="h-3 w-3 mr-1" />
            Building
          </Badge>
        );
      case 'room_search':
        return (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">
            <PinIcon className="h-3 w-3 mr-1" />
            Room
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200">
            <Clock className="h-3 w-3 mr-1" />
            Unknown
          </Badge>
        );
    }
  };

  const formatTime = (timestamp: { toDate: () => Date }) => {
    const date = timestamp.toDate();
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="mb-3 hover:shadow-md transition-all duration-200 border-gray-100 hover:border-gray-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="flex-shrink-0 mt-1 p-2 bg-gray-50 rounded-lg">
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate mb-1">
                    {getTitle()}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2">
                    {getSubtitle()}
                  </p>
                </div>
                {getTypeBadge()}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(item.timestamp)}
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item.id!)}
            className="flex-shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50 ml-3"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface HistoryListProps {
  items: HistoryItem[];
  loading: boolean;
  title: string;
  emptyMessage: string;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

function HistoryList({ items, loading, title, emptyMessage, onDelete, onRefresh, error }: HistoryListProps & { error?: string | null }) {
  const hasIndexBuildingError = error && (
    error.includes('indexes are building') ||
    error.includes('requires an index') ||
    error.includes('currently building')
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {hasIndexBuildingError ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-amber-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600 mx-auto mb-3"></div>
              <h4 className="text-sm font-semibold mb-2">Indexes Building</h4>
              <p className="text-xs text-amber-700">
                History indexes are being created. This usually takes 5-15 minutes.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse border-gray-100">
              <CardContent className="p-5">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg w-12 h-12"></div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-16 ml-4"></div>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-gray-400">
            <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Clock className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Activities Yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">{emptyMessage}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <HistoryItemCard
              key={item.id}
              item={item}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function UserHistory() {
  const {
    history,
    routes,
    buildingSearches,
    roomSearches,
    loading,
    loadingRoutes,
    loadingBuildingSearches,
    loadingRoomSearches,
    refreshHistory,
    refreshRoutes,
    refreshBuildingSearches,
    refreshRoomSearches,
    clearAllHistory,
    deleteItem,
    error
  } = useHistoryContext();

  const [activeTab, setActiveTab] = useState('all');

  if (error) {
    const isIndexBuilding = error.includes('indexes are building') ||
                           error.includes('requires an index') ||
                           error.includes('currently building');

    return (
      <div className="bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-100 p-8 text-center">
        <div className={isIndexBuilding ? "text-amber-600" : "text-red-600"}>
          {isIndexBuilding ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-3">Building History Indexes</h3>
              <p className="mb-4 text-gray-600">{error}</p>
              <p className="text-sm text-gray-500 mb-6">
                This usually takes 5-15 minutes. The history system will work automatically once the indexes are ready.
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold mb-3">Error Loading History</h3>
              <p className="mb-4 text-gray-600">{error}</p>
            </>
          )}
          <Button
            onClick={refreshHistory}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-white to-red-50 rounded-xl p-6 border border-red-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <History className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Activity History</h2>
              <p className="text-gray-600 mt-1">
                Track your recent routes, building searches, and room searches
              </p>
            </div>
          </div>
          {history.length > 0 && (
            <Button
              onClick={clearAllHistory}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash className="h-4 w-4 mr-2" />
              Clear All History
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{history.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Navigation className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Routes</p>
              <p className="text-2xl font-bold text-gray-900">{routes.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Buildings</p>
              <p className="text-2xl font-bold text-gray-900">{buildingSearches.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PinIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{roomSearches.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <TabsList className="bg-white border border-gray-200">
              <TabsTrigger
                value="all"
                className="flex items-center space-x-2 px-6 py-2 data-[state=active]:bg-red-500 data-[state=active]:text-white"
              >
                <History className="h-4 w-4" />
                <span>All Activities</span>
                <span className="ml-2 bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {history.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="routes"
                className="flex items-center space-x-2 px-6 py-2 data-[state=active]:bg-red-500 data-[state=active]:text-white"
              >
                <Navigation className="h-4 w-4" />
                <span>Routes</span>
                <span className="ml-2 bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {routes.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="buildings"
                className="flex items-center space-x-2 px-6 py-2 data-[state=active]:bg-red-500 data-[state=active]:text-white"
              >
                <Building2 className="h-4 w-4" />
                <span>Buildings</span>
                <span className="ml-2 bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {buildingSearches.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="rooms"
                className="flex items-center space-x-2 px-6 py-2 data-[state=active]:bg-red-500 data-[state=active]:text-white"
              >
                <PinIcon className="h-4 w-4" />
                <span>Rooms</span>
                <span className="ml-2 bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {roomSearches.length}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="all" className="space-y-4 mt-0">
              <HistoryList
                items={history}
                loading={loading}
                title="All Activity"
                emptyMessage="No activity history yet. Start exploring the campus!"
                onDelete={deleteItem}
                onRefresh={refreshHistory}
                error={error}
              />
            </TabsContent>

            <TabsContent value="routes" className="space-y-4 mt-0">
              <HistoryList
                items={routes}
                loading={loadingRoutes}
                title="Navigation Routes"
                emptyMessage="No route history yet. Navigate between buildings to see your routes here."
                onDelete={deleteItem}
                onRefresh={refreshRoutes}
                error={error}
              />
            </TabsContent>

            <TabsContent value="buildings" className="space-y-4 mt-0">
              <HistoryList
                items={buildingSearches}
                loading={loadingBuildingSearches}
                title="Building Searches"
                emptyMessage="No building searches yet. Search for buildings to see them here."
                onDelete={deleteItem}
                onRefresh={refreshBuildingSearches}
                error={error}
              />
            </TabsContent>

            <TabsContent value="rooms" className="space-y-4 mt-0">
              <HistoryList
                items={roomSearches}
                loading={loadingRoomSearches}
                title="Room Searches"
                emptyMessage="No room searches yet. Search for rooms to see them here."
                onDelete={deleteItem}
                onRefresh={refreshRoomSearches}
                error={error}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
