import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './auth-context';

// Mock do Supabase
jest.mock('./supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              user_metadata: {
                full_name: 'Test User'
              }
            }
          }
        },
        error: null
      }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com'
          },
          session: {
            access_token: 'test-token'
          }
        },
        error: null
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } }
      })
    }
  }
}));

// Componente de teste que usa o hook useAuth
const TestComponent = () => {
  const { user, is_authenticated, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="user-id">{user?.id}</div>
      <div data-testid="is-authenticated">{is_authenticated ? 'true' : 'false'}</div>
      <div data-testid="loading">{loading ? 'true' : 'false'}</div>
    </div>
  );
};

describe('AuthProvider', () => {
  it('deve fornecer o contexto de autenticação', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Aguardar o carregamento inicial
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    // Estado autenticado
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId('user-id')).toHaveTextContent('test-user-id');
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });
});