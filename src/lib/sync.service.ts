import { db } from './firebase';
import { collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import { Inspection } from '../types/inspections';

// Cache keys
const LAST_SYNC_KEY = 'last_sync_timestamp';
const OFFLINE_INSPECTIONS_KEY = 'offline_inspections';

// Função para sincronizar inspeções offline
export async function syncOfflineInspections(): Promise<void> {
  try {
    // Obter inspeções offline do IndexedDB
    const offline_inspections = await idbGet<Inspection[]>(OFFLINE_INSPECTIONS_KEY) || [];
    if (offline_inspections.length === 0) return;

    // Preparar batch de escrita para o Firestore
    const batch = writeBatch(db);
    const inspections_ref = collection(db, 'inspections');

    // Adicionar cada inspeção ao batch
    offline_inspections.forEach(inspection => {
      const doc_ref = doc(inspections_ref, inspection.id);
      batch.set(doc_ref, {
        ...inspection,
        synced_at: new Date().toISOString()
      });
    });

    // Commit do batch
    await batch.commit();

    // Limpar inspeções offline após sincronização bem-sucedida
    await idbSet(OFFLINE_INSPECTIONS_KEY, []);
    await idbSet(LAST_SYNC_KEY, Date.now());

  } catch (error) {
    console.error('Erro ao sincronizar inspeções offline:', error);
    throw error;
  }
}

// Função para salvar inspeção offline
export async function saveOfflineInspection(inspection: Inspection): Promise<void> {
  try {
    const offline_inspections = await idbGet<Inspection[]>(OFFLINE_INSPECTIONS_KEY) || [];
    offline_inspections.push(inspection);
    await idbSet(OFFLINE_INSPECTIONS_KEY, offline_inspections);
  } catch (error) {
    console.error('Erro ao salvar inspeção offline:', error);
    throw error;
  }
}

// Função para obter inspeções offline
export async function getOfflineInspections(): Promise<Inspection[]> {
  try {
    return await idbGet<Inspection[]>(OFFLINE_INSPECTIONS_KEY) || [];
  } catch (error) {
    console.error('Erro ao obter inspeções offline:', error);
    return [];
  }
}

// Função para verificar se há inspeções pendentes de sincronização
export async function hasPendingSync(): Promise<boolean> {
  try {
    const offline_inspections = await idbGet<Inspection[]>(OFFLINE_INSPECTIONS_KEY) || [];
    return offline_inspections.length > 0;
  } catch (error) {
    console.error('Erro ao verificar inspeções pendentes:', error);
    return false;
  }
}

// Função para inicializar o sistema de sincronização
export async function initSync(): Promise<void> {
  try {
    // Verificar se há inspeções pendentes e tentar sincronizar
    if (await hasPendingSync()) {
      await syncOfflineInspections();
    }

    // Atualizar timestamp da última sincronização
    await idbSet(LAST_SYNC_KEY, Date.now());
  } catch (error) {
    console.error('Erro ao inicializar sincronização:', error);
  }
}
