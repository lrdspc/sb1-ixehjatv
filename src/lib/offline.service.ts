import { enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { db } from './firebase';
import { get, set } from 'idb-keyval';

// Chaves para armazenamento local
const PENDING_CHANGES_KEY = 'pending_offline_changes';
const LAST_SYNC_KEY = 'last_sync_timestamp';

// Habilitar persistência offline do Firestore
export async function enableOfflineSupport() {
  try {
    await enableMultiTabIndexedDbPersistence(db);
    console.log('Suporte offline habilitado com sucesso');
    return true;
  } catch (error) {
    if ((error as any).code === 'failed-precondition') {
      console.warn('Múltiplas abas abertas. Persistência habilitada em apenas uma aba.');
    } else if ((error as any).code === 'unimplemented') {
      console.warn('O navegador não suporta persistência offline.');
    }
    return false;
  }
}

// Salvar mudanças pendentes
export async function savePendingChanges(changes: any[]) {
  const existing = await get(PENDING_CHANGES_KEY) || [];
  await set(PENDING_CHANGES_KEY, [...existing, ...changes]);
}

// Obter mudanças pendentes
export async function getPendingChanges() {
  return await get(PENDING_CHANGES_KEY) || [];
}

// Limpar mudanças pendentes
export async function clearPendingChanges() {
  await set(PENDING_CHANGES_KEY, []);
  await set(LAST_SYNC_KEY, new Date().toISOString());
}

// Verificar se há mudanças pendentes
export async function hasPendingChanges(): Promise<boolean> {
  const changes = await getPendingChanges();
  return changes.length > 0;
}

// Obter timestamp da última sincronização
export async function getLastSyncTimestamp(): Promise<string | null> {
  return await get(LAST_SYNC_KEY);
}
