import React, { useEffect, useState } from 'react';
import { testSupabaseConnection } from '../lib/supabase-test';
import { createTestUser } from '../lib/create-test-user';

const SupabaseTest: React.FC = () => {
  const [connectionResult, setConnectionResult] = useState<{success: boolean, error?: string, data?: any} | null>(null);
  const [testUser, setTestUser] = useState<{email: string, password: string, fullName: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [userMessage, setUserMessage] = useState<string | null>(null);

  useEffect(() => {
    const runTests = async () => {
      try {
        // Teste de conexão
        console.log('Testando conexão com Supabase...');
        const connResult = await testSupabaseConnection();
        setConnectionResult(connResult);

        if (connResult.success) {
          // Criar usuário de teste
          console.log('Criando usuário de teste...');
          const userResult = await createTestUser();
          if (userResult.success && userResult.user) {
            setTestUser(userResult.user);
            setUserMessage(userResult.message);
          } else {
            setUserMessage(userResult.error || 'Erro ao criar usuário de teste');
          }
        }
      } catch (err) {
        console.error('Erro nos testes:', err);
      } finally {
        setLoading(false);
      }
    };

    runTests();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold mb-4">Diagnóstico do Supabase</h2>
      
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Executando testes...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Resultado da conexão */}
          <div className={`p-4 rounded-lg ${connectionResult?.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <p className="font-medium">
              {connectionResult?.success ? 'Conexão com Supabase: OK' : 'Erro na conexão com Supabase:'}
            </p>
            {!connectionResult?.success && connectionResult?.error && (
              <p className="mt-2 text-sm">{connectionResult.error}</p>
            )}
          </div>

          {/* Informações do usuário de teste */}
          {testUser && (
            <div className="p-4 bg-blue-50 text-blue-700 rounded-lg">
              <p className="font-medium">Usuário de teste disponível:</p>
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
      )}
    </div>
  );
};

export default SupabaseTest;
