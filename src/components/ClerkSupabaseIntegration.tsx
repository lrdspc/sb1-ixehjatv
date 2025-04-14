import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setSupabaseToken } from '../lib';

/**
 * Componente para integrar Clerk com Supabase
 * Este componente não renderiza nada visualmente, apenas gerencia a integração
 */
export function ClerkSupabaseIntegration() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    // Função para obter o token JWT e configurar no Supabase
    const setupSupabaseAuth = async () => {
      if (isSignedIn) {
        try {
          // Obter token JWT do Clerk com template para Supabase
          const token = await getToken({ template: 'supabase' });
          
          if (token) {
            // Configurar o token no cliente Supabase
            await setSupabaseToken(token);
            console.log('Token Clerk configurado no Supabase');
          }
        } catch (error) {
          console.error('Erro ao configurar token Clerk no Supabase:', error);
        }
      }
    };

    // Configurar token quando o usuário estiver autenticado
    setupSupabaseAuth();

    // Configurar um intervalo para atualizar o token periodicamente (a cada 55 minutos)
    const intervalId = setInterval(setupSupabaseAuth, 55 * 60 * 1000);

    // Limpar o intervalo quando o componente for desmontado
    return () => clearInterval(intervalId);
  }, [isSignedIn, getToken]);

  // Este componente não renderiza nada visualmente
  return null;
}

export default ClerkSupabaseIntegration;
