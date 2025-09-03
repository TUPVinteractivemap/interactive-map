'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  HistoryItem,
  RouteHistoryItem,
  BuildingSearchHistoryItem,
  RoomSearchHistoryItem,
  getUserHistory,
  getUserRecentRoutes,
  getUserRecentBuildingSearches,
  getUserRecentRoomSearches,
  clearUserHistory,
  deleteHistoryItem,
  getUserHistoryGroupedByDate
} from '@/lib/userHistory';
import { useAuthContext } from './AuthContext';

interface HistoryContextType {
  // Data
  history: HistoryItem[];
  routes: RouteHistoryItem[];
  buildingSearches: BuildingSearchHistoryItem[];
  roomSearches: RoomSearchHistoryItem[];
  groupedHistory: Record<string, HistoryItem[]>;

  // Loading states
  loading: boolean;
  loadingRoutes: boolean;
  loadingBuildingSearches: boolean;
  loadingRoomSearches: boolean;

  // Actions
  refreshHistory: () => Promise<void>;
  refreshRoutes: () => Promise<void>;
  refreshBuildingSearches: () => Promise<void>;
  refreshRoomSearches: () => Promise<void>;
  clearAllHistory: () => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;

  // Error
  error: string | null;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const [state, setState] = useState({
    history: [] as HistoryItem[],
    routes: [] as RouteHistoryItem[],
    buildingSearches: [] as BuildingSearchHistoryItem[],
    roomSearches: [] as RoomSearchHistoryItem[],
    groupedHistory: {} as Record<string, HistoryItem[]>,
    loading: false,
    loadingRoutes: false,
    loadingBuildingSearches: false,
    loadingRoomSearches: false,
    error: null as string | null
  });

  // Refresh all history data
  const refreshHistory = async () => {
    if (!user?.uid) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const [history, groupedHistory] = await Promise.all([
        getUserHistory(user.uid),
        getUserHistoryGroupedByDate(user.uid)
      ]);

      setState(prev => ({
        ...prev,
        history,
        groupedHistory,
        loading: false
      }));
    } catch (error: any) {
      console.error('Error refreshing history:', error);

      // Check if it's an index building error
      const isIndexBuilding = error.message.includes('requires an index') ||
                            error.message.includes('currently building') ||
                            error.code === 'failed-precondition';

      const errorMessage = isIndexBuilding
        ? 'History indexes are building. This usually takes 5-15 minutes. Please try again in a few minutes.'
        : (error.message || 'Failed to load history');

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  };

  // Refresh routes
  const refreshRoutes = async () => {
    if (!user?.uid) return;

    setState(prev => ({ ...prev, loadingRoutes: true, error: null }));
    try {
      const routes = await getUserRecentRoutes(user.uid);
      setState(prev => ({
        ...prev,
        routes,
        loadingRoutes: false
      }));
    } catch (error: any) {
      console.error('Error refreshing routes:', error);

      const isIndexBuilding = error.message.includes('requires an index') ||
                            error.message.includes('currently building') ||
                            error.code === 'failed-precondition';

      const errorMessage = isIndexBuilding
        ? 'Route history indexes are building. Please try again in a few minutes.'
        : (error.message || 'Failed to load routes');

      setState(prev => ({
        ...prev,
        loadingRoutes: false,
        error: errorMessage
      }));
    }
  };

  // Refresh building searches
  const refreshBuildingSearches = async () => {
    if (!user?.uid) return;

    setState(prev => ({ ...prev, loadingBuildingSearches: true, error: null }));
    try {
      const buildingSearches = await getUserRecentBuildingSearches(user.uid);
      setState(prev => ({
        ...prev,
        buildingSearches,
        loadingBuildingSearches: false
      }));
    } catch (error: any) {
      console.error('Error refreshing building searches:', error);

      const isIndexBuilding = error.message.includes('requires an index') ||
                            error.message.includes('currently building') ||
                            error.code === 'failed-precondition';

      const errorMessage = isIndexBuilding
        ? 'Building search history indexes are building. Please try again in a few minutes.'
        : (error.message || 'Failed to load building searches');

      setState(prev => ({
        ...prev,
        loadingBuildingSearches: false,
        error: errorMessage
      }));
    }
  };

  // Refresh room searches
  const refreshRoomSearches = async () => {
    if (!user?.uid) return;

    setState(prev => ({ ...prev, loadingRoomSearches: true, error: null }));
    try {
      const roomSearches = await getUserRecentRoomSearches(user.uid);
      setState(prev => ({
        ...prev,
        roomSearches,
        loadingRoomSearches: false
      }));
    } catch (error: any) {
      console.error('Error refreshing room searches:', error);

      const isIndexBuilding = error.message.includes('requires an index') ||
                            error.message.includes('currently building') ||
                            error.code === 'failed-precondition';

      const errorMessage = isIndexBuilding
        ? 'Room search history indexes are building. Please try again in a few minutes.'
        : (error.message || 'Failed to load room searches');

      setState(prev => ({
        ...prev,
        loadingRoomSearches: false,
        error: errorMessage
      }));
    }
  };

  // Clear all history
  const clearAllHistory = async () => {
    if (!user?.uid) return;

    try {
      await clearUserHistory(user.uid);
      // Reset all state
      setState(prev => ({
        ...prev,
        history: [],
        routes: [],
        buildingSearches: [],
        roomSearches: [],
        groupedHistory: {},
        error: null
      }));
    } catch (error: any) {
      console.error('Error clearing history:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to clear history'
      }));
    }
  };

  // Delete specific item
  const deleteItem = async (itemId: string) => {
    try {
      await deleteHistoryItem(itemId);

      // Remove from local state
      setState(prev => ({
        ...prev,
        history: prev.history.filter(item => item.id !== itemId),
        routes: prev.routes.filter(item => item.id !== itemId),
        buildingSearches: prev.buildingSearches.filter(item => item.id !== itemId),
        roomSearches: prev.roomSearches.filter(item => item.id !== itemId)
      }));

      // Update grouped history
      const updatedGroupedHistory = { ...state.groupedHistory };
      Object.keys(updatedGroupedHistory).forEach(date => {
        updatedGroupedHistory[date] = updatedGroupedHistory[date].filter(
          item => item.id !== itemId
        );
        if (updatedGroupedHistory[date].length === 0) {
          delete updatedGroupedHistory[date];
        }
      });

      setState(prev => ({
        ...prev,
        groupedHistory: updatedGroupedHistory
      }));

    } catch (error: any) {
      console.error('Error deleting history item:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to delete history item'
      }));
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user?.uid) {
      refreshHistory();
      refreshRoutes();
      refreshBuildingSearches();
      refreshRoomSearches();
    } else {
      // Clear data when user logs out
      setState({
        history: [],
        routes: [],
        buildingSearches: [],
        roomSearches: [],
        groupedHistory: {},
        loading: false,
        loadingRoutes: false,
        loadingBuildingSearches: false,
        loadingRoomSearches: false,
        error: null
      });
    }
  }, [user?.uid]);

  const contextValue: HistoryContextType = {
    ...state,
    refreshHistory,
    refreshRoutes,
    refreshBuildingSearches,
    refreshRoomSearches,
    clearAllHistory,
    deleteItem
  };

  return (
    <HistoryContext.Provider value={contextValue}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistoryContext() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistoryContext must be used within a HistoryProvider');
  }
  return context;
}
