// Lista de tabelas conhecidas no sistema
export const knownTables = [
  'users_profiles',
  'clients', 
  'inspections',
  'inspection_tiles',
  'nonconformities',
  'inspection_photos'
];

// Função simplificada para listar tabelas
export async function listTables() {
  return { 
    success: true, 
    tables: knownTables.map(tablename => ({
      tablename,
      exists: true,
      count: 0
    })) 
  };
}

// Função simplificada para verificar tabela
export async function checkTable(tableName: string) {
  return {
    success: knownTables.includes(tableName),
    count: 0
  };
}
