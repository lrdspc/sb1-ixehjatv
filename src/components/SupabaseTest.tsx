import React, { useState } from 'react';
import { testSupabaseConnection } from '../lib/supabase-test';
import { listTables, checkTable, insertTestClient } from '../lib/check-tables';
import { createTestUser } from '../lib/create-test-user';

const SupabaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [tables, setTables] = useState<any[]>([]);
  const [clientCount, setClientCount] = useState<number | null>(null);
  const [testClient, setTestClient] = useState<any>(null);
  const [testUser, setTestUser] = useState<any>(null);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await testSupabaseConnection();
      setConnectionStatus(result.success ? 'Conectado com sucesso!' : `Falha na conexão: ${result.error}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listTables();
      if (result.success && result.tables) {
        setTables(result.tables);
      } else {
        setError(result.error || 'Erro ao listar tabelas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const checkClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await checkTable('clients');
      if (result.success) {
        setClientCount(result.count || 0);
      } else {
        setError(result.error || 'Erro ao verificar tabela de clientes');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const addTestClient = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await insertTestClient();
      if (result.success && result.client) {
        setTestClient(result.client);
        // Atualizar a contagem após inserir
        await checkClients();
      } else {
        setError(result.error || 'Erro ao inserir cliente de teste');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const addTestUser = async () => {
    setLoading(true);
    setError(null);
    setUserMessage(null);
    try {
      const result = await createTestUser();
      if (result.success && result.user) {
        setTestUser(result.user);
        if (result.message) {
          setUserMessage(result.message);
        }
      } else {
        setError(result.error || 'Erro ao criar usuário de teste');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Teste de Conexão Supabase</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Status da Conexão</h2>
          <button 
            onClick={testConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Testar Conexão'}
          </button>
          {connectionStatus && (
            <p className={`mt-2 ${connectionStatus.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
              {connectionStatus}
            </p>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Tabelas Disponíveis</h2>
          <button 
            onClick={fetchTables}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Buscando...' : 'Listar Tabelas'}
          </button>
          {tables.length > 0 && (
            <div className="mt-2">
              <p className="font-medium">Tabelas encontradas: {tables.length}</p>
              <ul className="list-disc pl-5 mt-1">
                {tables.map((table, index) => (
                  <li key={index}>
                    {table.tablename} <span className="text-gray-500">({table.count} registros)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Tabela de Clientes</h2>
          <div className="flex space-x-2">
            <button 
              onClick={checkClients}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Verificar Clientes'}
            </button>
            <button 
              onClick={addTestClient}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Adicionando...' : 'Adicionar Cliente Teste'}
            </button>
          </div>
          {clientCount !== null && (
            <p className="mt-2">
              Clientes cadastrados: <span className="font-medium">{clientCount}</span>
            </p>
          )}
          {testClient && (
            <div className="mt-2 p-3 bg-green-50 rounded-md">
              <p className="font-medium">Cliente de teste adicionado:</p>
              <pre className="mt-1 text-sm overflow-x-auto">
                {JSON.stringify(testClient, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Criar Usuário de Teste</h2>
          <button 
            onClick={addTestUser}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Criar Usuário de Teste'}
          </button>
          {testUser && (
            <div className="mt-2 p-3 bg-green-50 rounded-md">
              <p className="font-medium">Usuário de teste criado:</p>
              <p className="mt-1">Email: <span className="font-mono">{testUser.email}</span></p>
              <p>Senha: <span className="font-mono">{testUser.password}</span></p>
              <p>Nome: <span className="font-mono">{testUser.fullName}</span></p>
              {userMessage && (
                <p className="mt-2 text-sm text-blue-600 font-medium">
                  {userMessage}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-600">
                Use essas credenciais para fazer login no sistema.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupabaseTest;
