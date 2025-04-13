import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Zap, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../lib/auth.context';
import { supabase } from '../../lib/supabase';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updatePassword, loading, error } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [hashPresent, setHashPresent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [processingToken, setProcessingToken] = useState(false);

  // Verificar se há um hash na URL ou se foi redirecionado de um link de recuperação
  useEffect(() => {
    const processAuthParams = async () => {
      try {
        setProcessingToken(true);
        
        // Verificar se há um hash na URL
        let hash = location.hash;
        
        // Se não houver hash na URL, verificar se foi passado como parâmetro (caso de redirecionamento)
        if (!hash && location.search) {
          const params = new URLSearchParams(location.search);
          const passedHash = params.get('hash');
          if (passedHash) {
            hash = `#${passedHash}`;
            // Limpar o URL para não mostrar o hash
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
        
        if (hash && hash.includes('type=recovery')) {
          setHashPresent(true);
          
          // Extrair os parâmetros do hash
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          
          if (!accessToken) {
            setResetError('Link de recuperação inválido. Parâmetros ausentes.');
            return;
          }
          
          // Verificar se o usuário já está autenticado com o token de recuperação
          const { data, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !data.session) {
            console.log('Tentando definir a sessão com o token do hash...');
            
            // Tentar definir a sessão com o token do hash
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get('refresh_token') || '',
            });
            
            if (setSessionError) {
              console.error('Erro ao definir sessão:', setSessionError);
              setResetError('Link de recuperação inválido ou expirado. Por favor, solicite um novo link.');
              return;
            }
          }
          
          console.log('Sessão de recuperação estabelecida com sucesso');
        } else {
          setResetError('Link de recuperação inválido. Por favor, solicite um novo link.');
        }
      } catch (err) {
        console.error('Erro ao processar token de recuperação:', err);
        setResetError('Ocorreu um erro ao processar o link de recuperação. Por favor, tente novamente.');
      } finally {
        setProcessingToken(false);
      }
    };
    
    processAuthParams();
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setResetError(null);
    
    // Validação básica do formulário
    if (!password || !confirmPassword) {
      setResetError('Todos os campos são obrigatórios');
      return;
    }
    
    // Validar senha
    if (password !== confirmPassword) {
      setResetError('As senhas não coincidem');
      return;
    }
    
    // Validar força da senha
    if (password.length < 6) {
      setResetError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    try {
      const result = await updatePassword(password);
      
      if (result.success) {
        setResetSuccess(true);
        // Redirecionar para o login após 3 segundos
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Senha alterada com sucesso! Faça login com sua nova senha.' }
          });
        }, 3000);
      } else {
        setResetError(result.error || 'Erro ao alterar senha');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado ao redefinir senha';
      setResetError(errorMessage);
      console.error('Erro na redefinição de senha:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">Brasi<span className="text-blue-600">lit</span></span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Redefinir Senha
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {processingToken && (
            <div className="flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Processando link de recuperação...</span>
            </div>
          )}
          
          {!processingToken && resetSuccess ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Senha alterada com sucesso!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Redirecionando para a página de login...
              </p>
            </div>
          ) : !processingToken && (
            <>
              {(error || resetError) && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center" role="alert">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="block sm:inline">{error || resetError}</span>
                </div>
              )}

              {hashPresent ? (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Nova Senha
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`block w-full pl-10 pr-10 py-2 border ${
                          formSubmitted && (!password || password.length < 6) ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none sm:text-sm`}
                        placeholder="••••••••"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          {showPassword ? (
                            <span className="text-xs">Ocultar</span>
                          ) : (
                            <span className="text-xs">Mostrar</span>
                          )}
                        </button>
                      </div>
                    </div>
                    {formSubmitted && !password && (
                      <div className="text-red-500 text-xs mt-1">Senha é obrigatória</div>
                    )}
                    {formSubmitted && password && password.length < 6 && (
                      <div className="text-red-500 text-xs mt-1">A senha deve ter pelo menos 6 caracteres</div>
                    )}
                    {!formSubmitted && (
                      <p className="mt-1 text-xs text-gray-500">A senha deve ter pelo menos 6 caracteres</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirmar Nova Senha
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`block w-full pl-10 pr-3 py-2 border ${
                          formSubmitted && (!confirmPassword || confirmPassword !== password) ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none sm:text-sm`}
                        placeholder="••••••••"
                      />
                    </div>
                    {formSubmitted && !confirmPassword && (
                      <div className="text-red-500 text-xs mt-1">Confirmação de senha é obrigatória</div>
                    )}
                    {formSubmitted && confirmPassword && confirmPassword !== password && (
                      <div className="text-red-500 text-xs mt-1">As senhas não coincidem</div>
                    )}
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out`}
                    >
                      {loading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        'Redefinir Senha'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-4">
                    Para redefinir sua senha, solicite um link de recuperação na página de recuperação de senha.
                  </p>
                  <Link
                    to="/forgot-password"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                  >
                    Ir para Recuperação de Senha
                  </Link>
                </div>
              )}

              <div className="text-center mt-4">
                <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500">
                  Voltar para o login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
