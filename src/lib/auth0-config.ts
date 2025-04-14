// Configuração do Auth0
export const auth0Config = {
  domain: 'SEU_DOMINIO_AUTH0.auth0.com', // Substitua pelo seu domínio Auth0
  clientId: 'SEU_CLIENT_ID_AUTH0', // Substitua pelo seu Client ID Auth0
  redirectUri: window.location.origin,
  audience: 'https://SEU_DOMINIO_AUTH0.auth0.com/api/v2/', // Opcional - para APIs
  scope: 'openid profile email' // Escopos padrão
};
