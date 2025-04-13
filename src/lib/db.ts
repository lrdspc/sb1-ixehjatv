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
      table: string;
      action: 'create' | 'update' | 'delete';
      data: any;
      attempts: number;
      createdAt: string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<BrasilitDB>> | null = null;

export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<BrasilitDB>('brasilit-db', 1, {
      upgrade(db) {
        // Inspections store
        const inspectionsStore = db.createObjectStore('inspections', { keyPath: 'id' });
        inspectionsStore.createIndex('by-status', 'status');
        inspectionsStore.createIndex('by-date', 'date');

        // Clients store
        const clientsStore = db.createObjectStore('clients', { keyPath: 'id' });
        clientsStore.createIndex('by-name', 'name');

        // Sync queue store
        db.createObjectStore('syncQueue', { keyPath: 'id' });
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
  data: any
) => {
  const db = await initDB();
  const id = `${table}-${data.id}-${Date.now()}`;
  return db.add('syncQueue', {
    id,
    table,
    action,
    data,
    attempts: 0,
    createdAt: new Date().toISOString(),
  });
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
