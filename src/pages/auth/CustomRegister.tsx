import React, { useState } from 'react';
import { useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';

const CustomRegister: React.FC = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'verification'>('form');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  
  const clerk = useClerk();
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Iniciar o processo de registro
      const signUpAttempt = await clerk.client.signUps.create({
        emailAddress: email,
        firstName,
        lastName,
        password,
      });
      
      // Preparar a verificação por email
      const emailVerification = await signUpAttempt.prepareVerification({
        strategy: 'email_code',
      });
      
      // Armazenar o ID da tentativa de registro para uso posterior
      setVerificationId(signUpAttempt.id);
      
      // Avançar para a etapa de verificação
      setStep('verification');
    } catch (err: any) {
      console.error('Erro ao iniciar registro:', err);
      setError(err.message || 'Ocorreu um erro ao tentar criar sua conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationId) {
      setError('Sessão de verificação inválida. Tente novamente.');
      setStep('form');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Obter a tentativa de registro atual
      const signUpAttempt = await clerk.client.signUps.get(verificationId);
      
      // Verificar o código enviado por email
      await signUpAttempt.attemptVerification({
        strategy: 'email_code',
        code: verificationCode,
      });
      
      // Criar sessão após verificação bem-sucedida
      const signInAttempt = await clerk.client.signIn.create({
        identifier: email,
        password,
      });
      
      await clerk.setActive({
        session: signInAttempt.createdSessionId
      });
      
      // Redirecionar para a página principal
      navigate('/');
    } catch (err: any) {
      console.error('Erro ao verificar código:', err);
      setError(err.message || 'Código inválido. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!verificationId) {
      setError('Sessão de verificação inválida. Tente novamente.');
      setStep('form');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Obter a tentativa de registro atual
      const signUpAttempt = await clerk.client.signUps.get(verificationId);
      
      // Reenviar o código de verificação
      await signUpAttempt.prepareVerification({
        strategy: 'email_code',
      });
      
      // Mostrar mensagem de sucesso
      setError('Código reenviado com sucesso!');
      setTimeout(() => setError(null), 3000);
    } catch (err: any) {
      console.error('Erro ao reenviar código:', err);
      setError(err.message || 'Não foi possível reenviar o código. Tente novamente.');
    } finally {
      setIsLoading(false);
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
          {step === 'form' ? 'Criar sua conta' : 'Verificar seu email'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 'form' 
            ? 'Preencha os dados abaixo para criar sua conta' 
            : 'Digite o código que enviamos para seu email'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {step === 'form' ? (
            <form className="space-y-6" onSubmit={handleRegisterSubmit}>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <div className="mt-1">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Sobrenome
                </label>
                <div className="mt-1">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={isLoading}
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
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="seu@email.com"
                    disabled={isLoading}
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
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Criando conta...' : 'Criar conta'}
                </button>
              </div>
              
              <div className="text-sm text-center">
                <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Já tem uma conta? Fazer login
                </a>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleVerificationSubmit}>
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                  Código de verificação
                </label>
                <div className="mt-1">
                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="123456"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Verificando...' : 'Verificar'}
                </button>
              </div>
              
              <div className="text-sm text-center">
                <button 
                  type="button" 
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Não recebeu o código? Reenviar
                </button>
              </div>
              
              <div className="text-sm text-center">
                <button 
                  type="button" 
                  onClick={() => setStep('form')}
                  className="font-medium text-gray-600 hover:text-gray-500"
                >
                  Voltar para a tela anterior
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomRegister;
