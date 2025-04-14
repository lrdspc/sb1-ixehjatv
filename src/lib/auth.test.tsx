import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './firebase-auth-context';
import { User } from 'firebase/auth';

// Mock do Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback({
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User'
    });
    return jest.fn(); // unsubscribe function
  }),
  signInWithEmailAndPassword: jest.fn().mockResolvedValue({
    user: {
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User'
    }
  }),
  createUserWithEmailAndPassword: jest.fn().mockResolvedValue({
    user: {
      uid: 'test-user-id',
      email: 'test@example.com'
    }
  }),
  signOut: jest.fn().mockResolvedValue(undefined)
}));

// Componente de teste que usa o hook useAuth
const TestComponent = () => {
  const { user, is_authenticated, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="user-id">{user?.uid}</div>
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