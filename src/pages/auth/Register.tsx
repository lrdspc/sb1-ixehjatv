import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Zap } from 'lucide-react';

const Register: React.FC = () => {
  const [email, set_email] = useState('');
  const [password, set_password] = useState('');
  const [full_name, set_full_name] = useState('');
  const [loading, set_loading] = useState(false);
  const [error, set_error] = useState<string | null>(null);
  const navigate = useNavigate();

  const handle_register = async (e: React.FormEvent) => {
    e.preventDefault();
    set_loading(true);
    set_error(null);

    try {
      // Registrar usuário
      const { data: auth_data, error: auth_error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name
          }
        }
      });

      if (auth_error) throw auth_error;

      if (auth_data.user) {
        // Criar perfil do usuário
        const { error: profile_error } = await supabase
          .from('users_profiles')
          .insert({
            user_id: auth_data.user.id,
            full_name
          });

        if (profile_error) throw profile_error;

        // Registro bem sucedido, redirecionar para o login
        navigate('/login', { 
          state: { 
            message: 'Registro concluído! Por favor, verifique seu email para confirmar sua conta.'
          }
        });
      }
    } catch (err) {
      console.error('Erro no registro:', err);
      set_error(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      set_loading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Logo e Título */}
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
          Criar nova conta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sistema de Vistorias Inteligente
        </p>
      </div>

      {/* Formulário de Registro */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handle_register}>
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Nome completo
              </label>
              <div className="mt-1">
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  required
                  value={full_name}
                  onChange={(e) => set_full_name(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Seu nome completo"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => set_email(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="seu@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => set_password(e.target.value)}
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
                {loading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </div>
          </form>

          {/* Links Adicionais */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Já tem uma conta?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Fazer login
              </Link>
            </div>
          </div>

          {/* Informações de Ajuda */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Ao se registrar, você concorda com nossos{' '}
              <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                Termos de Serviço
              </Link>{' '}
              e{' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          {new Date().getFullYear()} Brasilit. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default Register;
