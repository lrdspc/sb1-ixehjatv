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
  // Configuração para usar códigos de verificação por email em vez de links mágicos
  signIn: {
    emailAddressVerification: {
      strategy: 'email_code'
    }
  },
  signUp: {
    emailAddressVerification: {
      strategy: 'email_code'
    }
  },
  // Permitir verificação entre dispositivos diferentes
  allowedRedirectOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'https://nfgcxxfrhitgvidqoybk.supabase.co',
    window.location.origin
  ],
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
    },
    layout: {
      socialButtonsVariant: 'iconButton',
      socialButtonsPlacement: 'bottom',
      termsPageUrl: 'https://clerk.com/terms',
      privacyPageUrl: 'https://clerk.com/privacy',
      showOptionalFields: false,
      logoPlacement: 'inside',
      logoImageUrl: 'https://brasilit.com.br/wp-content/themes/brasilit/images/logo.png',
      shimmer: true
    },
    i18n: {
      locale: 'pt-BR',
      signIn: {
        start: {
          title: 'Entrar na sua conta',
          subtitle: 'para continuar na Brasilit',
          actionText: 'Não tem uma conta?',
          actionLink: 'Criar conta'
        },
        emailCode: {
          title: 'Verificar seu email',
          subtitle: 'para continuar na Brasilit',
          formTitle: 'Código de verificação',
          formSubtitle: 'Digite o código enviado para seu email',
          resendButton: 'Reenviar código'
        }
      },
      signUp: {
        start: {
          title: 'Criar sua conta',
          subtitle: 'para começar a usar a Brasilit',
          actionText: 'Já tem uma conta?',
          actionLink: 'Entrar'
        },
        emailCode: {
          title: 'Verificar seu email',
          subtitle: 'para continuar na Brasilit',
          formTitle: 'Código de verificação',
          formSubtitle: 'Digite o código enviado para seu email',
          resendButton: 'Reenviar código'
        }
      }
    }
  },
  jwtTemplate: clerkJwtTemplate
};

export { ClerkProvider, clerkConfig };
