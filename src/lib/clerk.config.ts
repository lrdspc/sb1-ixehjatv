import { ClerkProvider } from '@clerk/clerk-react';

// Obtenha a chave pública do Clerk do ambiente
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Publishable Key");
}

const clerkConfig = {
  publishableKey: clerkPubKey,
  signInUrl: '/login',
  signUpUrl: '/register',
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/dashboard',
  appearance: {
    variables: {
      colorPrimary: '#2563eb', // Azul similar ao atual
    }
  }
};

export { ClerkProvider, clerkConfig };
