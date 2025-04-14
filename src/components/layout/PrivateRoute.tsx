import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth.context';

type PrivateRouteProps = {
  children: React.ReactNode;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Verificar se o usuário está autenticado
  if (!isAuthenticated) {
    // Redirecionar para a página de login, armazenando a localização atual
    // para redirecionar de volta após o login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Criar um perfil de usuário no primeiro login
  useEffect(() => {
    if (isAuthenticated && user) {
      // Aqui poderíamos criar/atualizar o perfil do usuário no Supabase
      // Isso pode ser implementado posteriormente se necessário
    }
  }, [isAuthenticated, user]);

  return <>{children}</>;
};

export default PrivateRoute;