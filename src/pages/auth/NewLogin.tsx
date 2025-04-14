import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';
import { Zap, CheckCircle } from 'lucide-react';

const NewLogin: React.FC = () => {
  const navigate = useNavigate();

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
          Bem-vindo de volta!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sistema de Vistorias Inteligente
        </p>
      </div>

      {/* Formulário de Login */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-100">
          <SignIn
            path="/login"
            routing="path"
            signUpUrl="/register"
            redirectUrl="/dashboard"
            appearance={{
              elements: {
                formButtonPrimary: 
                  'bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-white w-full py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                footerActionLink: 
                  'text-blue-600 hover:text-blue-700 font-medium',
                card: 
                  'bg-transparent shadow-none p-0',
                headerTitle: 
                  'text-xl font-semibold text-gray-900',
                headerSubtitle: 
                  'text-gray-600',
                socialButtonsBlockButton: 
                  'border border-gray-300 hover:bg-gray-50 transition-colors duration-200',
                socialButtonsBlockButtonText: 
                  'text-gray-700 font-medium',
                dividerLine: 
                  'bg-gray-200',
                dividerText: 
                  'text-gray-500',
                formFieldLabel: 
                  'text-sm font-medium text-gray-700',
                formFieldInput: 
                  'appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                alert: 
                  'rounded-md bg-red-50 p-4 border border-red-200',
                alertText: 
                  'text-sm text-red-700',
                formResendCodeLink: 
                  'text-blue-600 hover:text-blue-500 font-medium'
              },
              layout: {
                socialButtonsPlacement: "bottom"
              }
            }}
          />

          {/* Links Adicionais */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Novo por aqui?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Criar Nova Conta
              </Link>
            </div>
          </div>

          {/* Informações de Ajuda */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Precisa de ajuda?{' '}
              <Link to="/help" className="text-blue-600 hover:text-blue-500">
                Entre em contato
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Brasilit. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default NewLogin;
