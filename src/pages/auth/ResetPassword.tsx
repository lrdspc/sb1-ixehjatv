import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Zap } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [password, set_password] = useState('');
  const [confirm_password, set_confirm_password] = useState('');
  const [loading, set_loading] = useState(false);
  const [error, set_error] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se temos um hash válido na URL
    const hash = window.location.hash;
    if (!hash || !hash.includes('type=recovery')) {
      navigate('/login');
    }
  }, [navigate]);

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    set_loading(true);
    set_error(null);

    if (password !== confirm_password) {
      set_error('As senhas não coincidem');
      set_loading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      // Senha atualizada com sucesso, redirecionar para o login
      navigate('/login', { 
        state: { 
          message: 'Senha atualizada com sucesso! Faça login com sua nova senha.'
        }
      });
    } catch (err) {
      set_error(err instanceof Error ? err.message : 'Erro ao atualizar senha');
    } finally {
      set_loading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">
              Brasi<span className="text-blue-600">lit</span>
            </span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Criar nova senha
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Digite sua nova senha
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handle_submit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Nova senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => set_password(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                Confirmar nova senha
              </label>
              <div className="mt-1">
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  required
                  value={confirm_password}
                  onChange={(e) => set_confirm_password(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Atualizando...' : 'Atualizar senha'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Brasilit. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
