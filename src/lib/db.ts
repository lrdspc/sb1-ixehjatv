import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface BrasilitDB extends DBSchema {
  inspections: {
    key: string;
    value: {
      id: string;
      clientId: string;
      date: string;
      status: 'draft' | 'completed' | 'syncing' | 'error';
      syncedAt?: string;
      data: any;
      createdAt: string;
      updatedAt: string;
    };
    indexes: { 'by-status': string; 'by-date': string };
  };
  clients: {
    key: string;
    value: {
      id: string;
      name: string;
      address: string;
      phone: string;
      email: string;
      syncedAt?: string;
      status: 'synced' | 'local' | 'syncing' | 'error';
    };
    indexes: { 'by-name': string };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      type: string;
      table: string;
      action: 'create' | 'update' | 'delete';
      data: any;
      attempts: number;
      createdAt: string;
      timestamp?: string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<BrasilitDB>> | null = null;

export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<BrasilitDB>('brasilit-db', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          // Inspections store
          const inspectionsStore = db.createObjectStore('inspections', { keyPath: 'id' });
          inspectionsStore.createIndex('by-status', 'status');
          inspectionsStore.createIndex('by-date', 'date');

          // Clients store
          const clientsStore = db.createObjectStore('clients', { keyPath: 'id' });
          clientsStore.createIndex('by-name', 'name');

          // Sync queue store
          db.createObjectStore('syncQueue', { keyPath: 'id' });
        }
        
        if (oldVersion < 2) {
          // Adicionar o campo type para as entradas existentes na syncQueue
          const tx = db.transaction('syncQueue', 'readwrite');
          tx.store.openCursor().then(function updateEntries(cursor) {
            if (!cursor) return;
            const value = cursor.value;
            if (!value.type) {
              value.type = value.table; // Use table como valor padrão para type
            }
            cursor.update(value);
            return cursor.continue().then(updateEntries);
          });
        }
      },
    });
  }
  return dbPromise;
};

// Generic CRUD operations
export const addItem = async <T extends keyof BrasilitDB>(
  storeName: T,
  item: BrasilitDB[T]['value']
) => {
  const db = await initDB();
  return db.add(storeName, item);
};

export const getItem = async <T extends keyof BrasilitDB>(
  storeName: T,
  id: string
): Promise<BrasilitDB[T]['value'] | undefined> => {
  const db = await initDB();
  return db.get(storeName, id);
};

export const getAllItems = async <T extends keyof BrasilitDB>(
  storeName: T
): Promise<BrasilitDB[T]['value'][]> => {
  const db = await initDB();
  return db.getAll(storeName);
};

export const updateItem = async <T extends keyof BrasilitDB>(
  storeName: T,
  item: BrasilitDB[T]['value']
) => {
  const db = await initDB();
  return db.put(storeName, item);
};

export const deleteItem = async <T extends keyof BrasilitDB>(
  storeName: T,
  id: string
) => {
  const db = await initDB();
  return db.delete(storeName, id);
};

// Specific operations for inspections
export const getInspectionsByStatus = async (status: string) => {
  const db = await initDB();
  const index = db.transaction('inspections').store.index('by-status');
  return index.getAll(status);
};

export const getInspectionsByDate = async (date: string) => {
  const db = await initDB();
  const index = db.transaction('inspections').store.index('by-date');
  return index.getAll(date);
};

// Specific operations for clients
export const getClientsByName = async (name: string) => {
  const db = await initDB();
  const index = db.transaction('clients').store.index('by-name');
  return index.getAll(name);
};

// Sync queue operations
export const addToSyncQueue = async (
  table: string,
  action: 'create' | 'update' | 'delete',
  data: any,
  type?: string
) => {
  const db = await initDB();
  const id = `${table}-${data.id}-${Date.now()}`;
  return db.add('syncQueue', {
    id,
    type: type || table,
    table,
    action,
    data,
    attempts: 0,
    createdAt: new Date().toISOString(),
  });
};

export const addSyncItem = async (item: {
  type: string;
  data: any;
  timestamp: string;
  attempts: number;
}) => {
  const db = await initDB();
  const id = `${item.type}-${item.data.id || Date.now()}-${Date.now()}`;
  return db.add('syncQueue', {
    id,
    type: item.type,
    table: item.type,
    action: 'update',
    data: item.data,
    attempts: item.attempts,
    createdAt: new Date().toISOString(),
    timestamp: item.timestamp
  });
};

export const getSyncItemsByType = async (type: string) => {
  const db = await initDB();
  const allItems = await db.getAll('syncQueue');
  return allItems.filter(item => item.type === type);
};

export const getNextSyncItem = async () => {
  const db = await initDB();
  const allItems = await db.getAll('syncQueue');
  return allItems.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )[0];
};

export const removeSyncItem = async (id: string) => {
  const db = await initDB();
  return db.delete('syncQueue', id);
};

export const updateSyncAttempt = async (id: string) => {
  const db = await initDB();
  const item = await db.get('syncQueue', id);
  if (item) {
    item.attempts += 1;
    return db.put('syncQueue', item);
  }
};
