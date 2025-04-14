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
      return false;
    }
    
    // Increment the attempt counter
    await updateSyncAttempt(item.id);
    
    // Perform the sync operation
    // (This part can be adapted to your new backend if needed)
    
    return true;
  } catch (error) {
    console.error('Sync error:', error);
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
  });
  
  // Mark when we go offline
  window.addEventListener('offline', () => {
    console.log('Went offline, sync paused');
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
