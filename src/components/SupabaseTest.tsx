import React, { useEffect, useState } from 'react';
import { testSupabaseConnection } from '../lib/supabase-test';

const SupabaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<{success: boolean, error?: string, data?: any} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTest = async () => {
      try {
        const result = await testSupabaseConnection();
        setTestResult(result);
      } catch (err) {
        setTestResult({
          success: false,
          error: err instanceof Error ? err.message : 'Erro desconhecido no teste'
        });
      } finally {
        setLoading(false);
      }
    };

    runTest();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Teste de Conexão com Supabase</h2>
      
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Testando conexão...</span>
        </div>
      ) : testResult ? (
        <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <p className="font-medium">
            {testResult.success ? 'Conexão estabelecida com sucesso!' : 'Erro na conexão:'}
          </p>
          {!testResult.success && testResult.error && (
            <p className="mt-2 text-sm">{testResult.error}</p>
          )}
          {testResult.data && (
            <pre className="mt-2 text-sm bg-white bg-opacity-50 p-2 rounded">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default SupabaseTest;
