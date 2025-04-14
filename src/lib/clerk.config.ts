import { ClerkProvider } from '@clerk/clerk-react';

// Obtenha a chave pública do Clerk do ambiente
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Falta a chave pública do Clerk (VITE_CLERK_PUBLISHABLE_KEY)");
}

// Configuração do JWT template para o Supabase
const clerkJwtTemplate = {
  supabase: {
    issuer: 'clerk',
    template: `{
      "aud": "authenticated",
      "role": "authenticated",
      "sub": "{{user.id}}",
      "email": "{{user.primary_email_address}}",
      "user_id": "{{user.id}}",
      "user_email": "{{user.primary_email_address}}",
      "user_name": "{{user.first_name}} {{user.last_name}}",
      "exp": {{jwt.exp}}
    }`
  }
};

const clerkConfig = {
  publishableKey: clerkPubKey,
  signInUrl: '/login',
  signUpUrl: '/register',
  afterSignInUrl: '/',
  afterSignUpUrl: '/',
  appearance: {
    variables: {
      colorPrimary: '#2563eb',
      colorBackground: '#f9fafb',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    elements: {
      formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
      card: 'shadow-md rounded-lg',
      formField: 'rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }
  },
  jwtTemplate: clerkJwtTemplate
};

export { ClerkProvider, clerkConfig };
