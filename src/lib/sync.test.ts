import { 
  processSyncQueue, 
  startSync, 
  isOnline, 
  queueForSync,
  SYNC_EVENTS,
  syncEvents 
} from './sync.service';
import * as dbModule from './db';

// Mock para IndexedDB (idb)
jest.mock('./db', () => ({
  initDB: jest.fn().mockResolvedValue({}),
  getNextSyncItem: jest.fn(),
  removeSyncItem: jest.fn().mockResolvedValue(undefined),
  updateSyncAttempt: jest.fn().mockResolvedValue(undefined),
  addSyncItem: jest.fn().mockResolvedValue('test-id')
}));

// Mock para Supabase
jest.mock('./supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockResolvedValue({ error: null }),
    storage: {
      from: jest.fn().mockReturnThis(),
      upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null })
    }
  }
}));

// Importar os mocks diretamente para poder modificar seu comportamento
const { getNextSyncItem, removeSyncItem, addSyncItem } = dbModule as jest.Mocked<typeof dbModule>;

describe('Sync Service', () => {
  // Salvar o navigator.onLine original
  const originalOnLine = Object.getOwnPropertyDescriptor(navigator, 'onLine');
  
  // Mock para controlar o estado online
  beforeEach(() => {
    // Simular que estamos online por padrão
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
      writable: true
    });
    
    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
  });
  
  // Restaurar o navigator.onLine original após os testes
  afterAll(() => {
    if (originalOnLine) {
      Object.defineProperty(navigator, 'onLine', originalOnLine);
    }
  });

  test('isOnline deve retornar o estado correto da conexão', () => {
    // Teste quando online
    expect(isOnline()).toBe(true);
    
    // Teste quando offline
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true
    });
    expect(isOnline()).toBe(false);
  });

  test('processSyncQueue deve pular sincronização quando offline', async () => {
    // Simular offline
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true
    });
    
    const result = await processSyncQueue();
    expect(result).toBe(false);
  });

  test('processSyncQueue deve retornar true quando não há items para sincronizar', async () => {
    // Mock retornando null (nenhum item para sincronizar)
    (getNextSyncItem as jest.Mock).mockResolvedValueOnce(null);
    
    const result = await processSyncQueue();
    expect(result).toBe(true);
  });

  test('processSyncQueue deve processar um item de inspeção', async () => {
    // Mock um item do tipo inspection
    (getNextSyncItem as jest.Mock).mockResolvedValueOnce({
      id: 'test-sync-id',
      type: 'inspection',
      table: 'inspections',
      data: { id: 'test-inspection-id', name: 'Test Inspection' },
      attempts: 0
    });
    
    const result = await processSyncQueue();
    
    expect(result).toBe(true);
    expect(removeSyncItem).toHaveBeenCalledWith('test-sync-id');
  });

  test('queueForSync deve adicionar um item à fila de sincronização', async () => {
    const testData = { id: 'test-id', name: 'Test Data' };
    
    await queueForSync('test-type', testData);
    
    expect(addSyncItem).toHaveBeenCalledWith({
      type: 'test-type',
      data: testData,
      timestamp: expect.any(String),
      attempts: 0
    });
  });

  test('startSync deve emitir eventos', async () => {
    // Espionar eventos
    const startedSpy = jest.fn();
    const completedSpy = jest.fn();
    
    syncEvents.addEventListener(SYNC_EVENTS.SYNC_STARTED, startedSpy);
    syncEvents.addEventListener(SYNC_EVENTS.SYNC_COMPLETED, completedSpy);
    
    // Sem itens para sincronizar
    (getNextSyncItem as jest.Mock).mockResolvedValue(null);
    
    await startSync();
    
    expect(startedSpy).toHaveBeenCalled();
    expect(completedSpy).toHaveBeenCalled();
    
    // Limpar event listeners
    syncEvents.removeEventListener(SYNC_EVENTS.SYNC_STARTED, startedSpy);
    syncEvents.removeEventListener(SYNC_EVENTS.SYNC_COMPLETED, completedSpy);
  });
}); 