import React from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { auth0Config } from './auth0-config';

interface AuthContextProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthContextProps) {
  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: auth0Config.redirectUri,
        audience: auth0Config.audience,
        scope: auth0Config.scope
      }}
    >
      <AuthStateProvider>{children}</AuthStateProvider>
    </Auth0Provider>
  );
}

function AuthStateProvider({ children }: AuthContextProps) {
  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently
  } = useAuth0();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return children;
}

export function useAuth() {
  const {
    isAuthenticated,
    isLoading: loading,
    user,
    loginWithRedirect: signIn,
    logout,
    getAccessTokenSilently
  } = useAuth0();

  const signOut = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return {
    user,
    is_authenticated: isAuthenticated,
    loading,
    sign_in: signIn,
    sign_out: signOut,
    getAccessToken: getAccessTokenSilently
  };
}
