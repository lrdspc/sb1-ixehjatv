import { useState, useEffect, useCallback } from 'react';
import { 
  addItem, 
  getItem, 
  getAllItems, 
  updateItem, 
  deleteItem,
  addToSyncQueue,
  syncEvents,
  isOnline
} from '../lib';

// Generic hook for offline data management
export function useOfflineData<T>(
  storeName: 'inspections' | 'clients' | 'syncQueue',
  initialQuery?: () => Promise<T[]>
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [online, setOnline] = useState(isOnline());

  // Load data from IndexedDB and optionally from the server
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // First load from local DB
      const localData = await getAllItems(storeName);
      setData(localData as unknown as T[]);
      
      // If we're online and have an initial query, fetch from server too
      if (isOnline() && initialQuery) {
        try {
          const serverData = await initialQuery();
          
          // Merge with local data, preferring local versions of items that exist in both
          const localIds = new Set(localData.map((item: any) => item.id));
          const newServerData = serverData.filter(item => !localIds.has((item as any).id));
          
          // Add new server data to local DB
          for (const item of newServerData) {
            await addItem(storeName, {
              ...(item as any),
              status: 'synced',
              syncedAt: new Date().toISOString()
            });
          }
          
          // Update the state with all data
          setData([...localData, ...newServerData] as unknown as T[]);
        } catch (err) {
          console.error('Failed to fetch server data:', err);
          // Still have local data, so don't set error
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [storeName, initialQuery]);

  // Add a new item
  const addData = useCallback(async (item: T) => {
    try {
      // Add timestamp
      const itemWithTimestamp = {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: isOnline() ? 'syncing' : 'local'
      };
      
      // Add to local DB
      await addItem(storeName, itemWithTimestamp);
      
      // Add to sync queue if we're offline
      if (!isOnline()) {
        await addToSyncQueue(storeName, 'create', itemWithTimestamp);
      }
      
      // Update state
      setData(prev => [...prev, itemWithTimestamp as unknown as T]);
      
      return itemWithTimestamp;
    } catch (err) {
      console.error('Error adding item:', err);
      throw err;
    }
  }, [storeName]);

  // Update an existing item
  const updateData = useCallback(async (item: T) => {
    try {
      // Add timestamp
      const itemWithTimestamp = {
        ...item,
        updatedAt: new Date().toISOString(),
        status: isOnline() ? 'syncing' : 'local'
      };
      
      // Update in local DB
      await updateItem(storeName, itemWithTimestamp);
      
      // Add to sync queue if we're offline
      if (!isOnline()) {
        await addToSyncQueue(storeName, 'update', itemWithTimestamp);
      }
      
      // Update state
      setData(prev => prev.map(i => (i as any).id === (itemWithTimestamp as any).id ? itemWithTimestamp as unknown as T : i));
      
      return itemWithTimestamp;
    } catch (err) {
      console.error('Error updating item:', err);
      throw err;
    }
  }, [storeName]);

  // Delete an item
  const deleteData = useCallback(async (id: string) => {
    try {
      // Get the item first
      const item = await getItem(storeName, id);
      
      // Delete from local DB
      await deleteItem(storeName, id);
      
      // Add to sync queue if we're offline and the item exists
      if (!isOnline() && item) {
        await addToSyncQueue(storeName, 'delete', item);
      }
      
      // Update state
      setData(prev => prev.filter(i => (i as any).id !== id));
      
      return true;
    } catch (err) {
      console.error('Error deleting item:', err);
      throw err;
    }
  }, [storeName]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      loadData(); // Reload data when we come back online
    };
    
    const handleOffline = () => {
      setOnline(false);
    };
    
    // Listen for sync events
    const handleSyncSuccess = (event: Event) => {
      const { item } = (event as CustomEvent).detail;
      if (item.table === storeName) {
        loadData(); // Reload data when sync succeeds
      }
    };
    
    syncEvents.addEventListener('online', handleOnline);
    syncEvents.addEventListener('offline', handleOffline);
    syncEvents.addEventListener('syncSuccess', handleSyncSuccess);
    
    return () => {
      syncEvents.removeEventListener('online', handleOnline);
      syncEvents.removeEventListener('offline', handleOffline);
      syncEvents.removeEventListener('syncSuccess', handleSyncSuccess);
    };
  }, [storeName, loadData]);

  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    online,
    refresh: loadData,
    add: addData,
    update: updateData,
    remove: deleteData
  };
}
