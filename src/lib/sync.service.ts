import { supabase } from './supabase';
import { 
  initDB, 
  getNextSyncItem, 
  removeSyncItem, 
  updateSyncAttempt,
  updateItem
} from './db';

// Maximum number of sync attempts
const MAX_SYNC_ATTEMPTS = 5;

// Event for sync status changes
export const syncEvents = new EventTarget();

// Check if we're online
export const isOnline = () => navigator.onLine;

// Process the sync queue
export const processSyncQueue = async (): Promise<boolean> => {
  // If we're offline, don't try to sync
  if (!isOnline()) {
    return false;
  }

  try {
    // Initialize the database
    await initDB();
    
    // Get the next item to sync
    const item = await getNextSyncItem();
    
    if (!item) {
      // Nothing to sync
      return true;
    }
    
    // If we've tried too many times, mark as error and move on
    if (item.attempts >= MAX_SYNC_ATTEMPTS) {
      console.error(`Sync item ${item.id} failed after ${MAX_SYNC_ATTEMPTS} attempts`);
      await removeSyncItem(item.id);
      
      // If this was an inspection or client, update its status to error
      if (item.table === 'inspections' || item.table === 'clients') {
        const record = await updateItem(item.table, {
          ...item.data,
          status: 'error'
        });
        
        // Dispatch event
        syncEvents.dispatchEvent(new CustomEvent('syncError', { 
          detail: { item, error: 'Too many attempts' } 
        }));
      }
      
      return false;
    }
    
    // Increment the attempt counter
    await updateSyncAttempt(item.id);
    
    // Perform the sync operation
    let result;
    
    switch (item.action) {
      case 'create':
        result = await supabase
          .from(item.table)
          .insert(item.data);
        break;
        
      case 'update':
        result = await supabase
          .from(item.table)
          .update(item.data)
          .eq('id', item.data.id);
        break;
        
      case 'delete':
        result = await supabase
          .from(item.table)
          .delete()
          .eq('id', item.data.id);
        break;
    }
    
    // Check if the operation was successful
    if (result.error) {
      console.error(`Sync error for ${item.id}:`, result.error);
      
      // Dispatch event
      syncEvents.dispatchEvent(new CustomEvent('syncError', { 
        detail: { item, error: result.error } 
      }));
      
      return false;
    }
    
    // If successful, remove from sync queue
    await removeSyncItem(item.id);
    
    // If this was an inspection or client, update its status to synced
    if (item.table === 'inspections' || item.table === 'clients') {
      await updateItem(item.table, {
        ...item.data,
        status: 'synced',
        syncedAt: new Date().toISOString()
      });
    }
    
    // Dispatch event
    syncEvents.dispatchEvent(new CustomEvent('syncSuccess', { 
      detail: { item } 
    }));
    
    return true;
  } catch (error) {
    console.error('Sync error:', error);
    
    // Dispatch event
    syncEvents.dispatchEvent(new CustomEvent('syncError', { 
      detail: { error } 
    }));
    
    return false;
  }
};

// Start the sync process
export const startSync = async () => {
  // Process all items in the queue
  let success = true;
  let hasMore = true;
  
  while (hasMore && success) {
    success = await processSyncQueue();
    
    // Check if there are more items
    const nextItem = await getNextSyncItem();
    hasMore = !!nextItem;
  }
  
  return success;
};

// Initialize sync on app start
export const initSync = () => {
  // Try to sync when we come online
  window.addEventListener('online', () => {
    console.log('Back online, starting sync...');
    startSync();
    
    // Dispatch event
    syncEvents.dispatchEvent(new CustomEvent('online'));
  });
  
  // Mark when we go offline
  window.addEventListener('offline', () => {
    console.log('Went offline, sync paused');
    
    // Dispatch event
    syncEvents.dispatchEvent(new CustomEvent('offline'));
  });
  
  // Start initial sync if online
  if (isOnline()) {
    startSync();
  }
  
  // Set up periodic sync (every 5 minutes)
  setInterval(() => {
    if (isOnline()) {
      startSync();
    }
  }, 5 * 60 * 1000);
};
