import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Inspection } from '../types/inspections';
import { Client } from '../types/clients';

interface BrasilitDB extends DBSchema {
  inspections: {
    key: string;
    value: Inspection;
    indexes: { 'by-client': string; 'by-status': string; 'by-date': string };
  };
  clients: {
    key: string;
    value: Client;
    indexes: { 'by-name': string };
  };
}

let db: IDBPDatabase<BrasilitDB>;

export async function initDB(): Promise<void> {
  try {
    db = await openDB<BrasilitDB>('brasilit-db', 1, {
      upgrade(db) {
        // Criar store de inspeções
        const inspectionsStore = db.createObjectStore('inspections', {
          keyPath: 'id'
        });
        inspectionsStore.createIndex('by-client', 'client_id');
        inspectionsStore.createIndex('by-status', 'status');
        inspectionsStore.createIndex('by-date', 'created_at');

        // Criar store de clientes
        const clientsStore = db.createObjectStore('clients', {
          keyPath: 'id'
        });
        clientsStore.createIndex('by-name', 'name');
      }
    });

    console.log('Banco de dados IndexedDB inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados IndexedDB:', error);
    throw error;
  }
}

// Funções para Inspeções
export async function saveInspection(inspection: Inspection): Promise<void> {
  await db.put('inspections', inspection);
}

export async function getInspection(id: string): Promise<Inspection | undefined> {
  return await db.get('inspections', id);
}

export async function getAllInspections(): Promise<Inspection[]> {
  return await db.getAll('inspections');
}

export async function getInspectionsByClient(clientId: string): Promise<Inspection[]> {
  const index = db.transaction('inspections').store.index('by-client');
  return await index.getAll(clientId);
}

export async function deleteInspection(id: string): Promise<void> {
  await db.delete('inspections', id);
}

// Funções para Clientes
export async function saveClient(client: Client): Promise<void> {
  await db.put('clients', client);
}

export async function getClient(id: string): Promise<Client | undefined> {
  return await db.get('clients', id);
}

export async function getAllClients(): Promise<Client[]> {
  return await db.getAll('clients');
}

export async function deleteClient(id: string): Promise<void> {
  await db.delete('clients', id);
}

// Função para limpar o banco de dados
export async function clearDatabase(): Promise<void> {
  const tx = db.transaction(['inspections', 'clients'], 'readwrite');
  await Promise.all([
    tx.objectStore('inspections').clear(),
    tx.objectStore('clients').clear()
  ]);
  await tx.done;
}

// Função para verificar o estado do banco de dados
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await getAllClients();
    await getAllInspections();
    return true;
  } catch (error) {
    console.error('Erro ao verificar saúde do banco de dados:', error);
    return false;
  }
}
