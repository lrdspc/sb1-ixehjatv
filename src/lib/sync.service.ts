import { 
  initDB, 
  getNextSyncItem, 
  removeSyncItem, 
  updateSyncAttempt,
  updateItem,
  addSyncItem,
  getSyncItemsByType
} from './db';
import { supabase } from './supabase';

// Maximum number of sync attempts
const MAX_SYNC_ATTEMPTS = 5;

// Event for sync status changes
export const syncEvents = new EventTarget();

// Custom events
export const SYNC_EVENTS = {
  SYNC_STARTED: 'sync_started',
  SYNC_COMPLETED: 'sync_completed',
  SYNC_FAILED: 'sync_failed',
  SYNC_ITEM_PROCESSED: 'sync_item_processed'
};

// Check if we're online
export const isOnline = () => navigator.onLine;

// Emitir eventos de sincronização
const emitSyncEvent = (eventName: string, detail: any = {}) => {
  syncEvents.dispatchEvent(new CustomEvent(eventName, { detail }));
};

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
      emitSyncEvent(SYNC_EVENTS.SYNC_FAILED, { item });
      return false;
    }
    
    // Increment the attempt counter
    await updateSyncAttempt(item.id);
    
    // Perform the sync operation based on item type
    try {
      // Usar o campo type para determinar o tipo de item
      const itemType = item.type || item.table;
      
      switch (itemType) {
        case 'inspection':
          await syncInspection(item.data);
          break;
        case 'client':
          await syncClient(item.data);
          break;
        case 'photo':
          await syncPhoto(item.data);
          break;
        default:
          console.warn(`Unknown sync item type: ${itemType}`);
      }
      
      // If we got here, sync was successful
      await removeSyncItem(item.id);
      emitSyncEvent(SYNC_EVENTS.SYNC_ITEM_PROCESSED, { item, success: true });
      
    } catch (error: any) {
      console.error(`Error syncing item ${item.id}:`, error);
      emitSyncEvent(SYNC_EVENTS.SYNC_ITEM_PROCESSED, { item, success: false, error });
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error('Sync error:', error);
    emitSyncEvent(SYNC_EVENTS.SYNC_FAILED, { error });
    return false;
  }
};

// Sincronizar uma inspeção com o Supabase
async function syncInspection(data: any) {
  const { error } = await supabase
    .from('inspections')
    .upsert(data, { onConflict: 'id' });
  
  if (error) throw error;
}

// Sincronizar um cliente com o Supabase
async function syncClient(data: any) {
  const { error } = await supabase
    .from('clients')
    .upsert(data, { onConflict: 'id' });
  
  if (error) throw error;
}

// Sincronizar uma foto com o Supabase
async function syncPhoto(data: any) {
  // Primeiro enviar a imagem para o storage
  if (data.base64Image) {
    const base64 = data.base64Image.split(',')[1];
    const { data: fileData, error: uploadError } = await supabase.storage
      .from('inspection-photos')
      .upload(`${data.id}.jpg`, Buffer.from(base64, 'base64'), {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (uploadError) throw uploadError;
    
    // Atualizar URL da foto
    data.photo_url = fileData.path;
    delete data.base64Image;
  }
  
  // Depois salvar o registro
  const { error } = await supabase
    .from('inspection_photos')
    .upsert(data, { onConflict: 'id' });
  
  if (error) throw error;
}

// Start the sync process
export const startSync = async () => {
  emitSyncEvent(SYNC_EVENTS.SYNC_STARTED);
  
  // Process all items in the queue
  let success = true;
  let hasMore = true;
  
  while (hasMore && success) {
    success = await processSyncQueue();
    const nextItem = await getNextSyncItem();
    hasMore = !!nextItem;
  }
  
  emitSyncEvent(SYNC_EVENTS.SYNC_COMPLETED, { success });
  return success;
};

// Adicionar um item à fila de sincronização
export const queueForSync = async (type: string, data: any) => {
  return await addSyncItem({
    type,
    data,
    timestamp: new Date().toISOString(),
    attempts: 0
  });
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
  
  // Se a API Periodic Background Sync estiver disponível, registre-a
  if ('serviceWorker' in navigator && 'periodicSync' in navigator.serviceWorker) {
    navigator.serviceWorker.ready.then((registration) => {
      // @ts-ignore - A API ainda é experimental
      registration.periodicSync.register('sync-data', {
        minInterval: 24 * 60 * 60 * 1000 // 24 horas
      }).catch((error: Error) => {
        console.error('Periodic Sync could not be registered:', error);
      });
    });
  }
};
