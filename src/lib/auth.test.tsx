import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './auth.context';
import { ClerkProvider } from '@clerk/clerk-react';

// Mock do Clerk
jest.mock('@clerk/clerk-react', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useUser: () => ({
    user: {
      id: 'test-user-id',
      fullName: 'Test User',
      imageUrl: 'https://example.com/avatar.jpg',
      primaryEmailAddress: { emailAddress: 'test@example.com' }
    },
    isSignedIn: true
  }),
  useClerk: () => ({
    signOut: jest.fn().mockResolvedValue(undefined),
    client: {
      signIn: {
        create: jest.fn().mockResolvedValue({ status: 'complete' })
      }
    }
  }),
  useAuth: () => ({
    getToken: jest.fn().mockResolvedValue('mock-jwt-token')
  })
}));

// Mock do Supabase
jest.mock('./supabase', () => ({
  supabase: {
    auth: {
      setSession: jest.fn().mockResolvedValue({ error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null })
    }
  }
}));

// Componente de teste que usa o hook useAuth
const TestComponent = () => {
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  
  return (
    <div>
      <div data-testid="user-id">{user?.id}</div>
      <div data-testid="is-authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <button 
        data-testid="sign-in" 
        onClick={() => signIn('test@example.com', 'password')}
      >
        Sign In
      </button>
      <button 
        data-testid="sign-out" 
        onClick={() => signOut()}
      >
        Sign Out
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  test('provides authentication context', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Verificar se o contexto está funcionando
    expect(screen.getByTestId('user-id')).toHaveTextContent('test-user-id');
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    
    // Testar sign in
    await act(async () => {
      screen.getByTestId('sign-in').click();
    });
    
    // Testar sign out
    await act(async () => {
      screen.getByTestId('sign-out').click();
    });
  });
}); 