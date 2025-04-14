# Brasilit Inspection App

## Configuração do Ambiente

### Pré-requisitos
- Node.js 20.x
- NPM 10.x ou superior
- Firebase CLI (`npm install -g firebase-tools`)

### Variáveis de Ambiente
Crie um arquivo `.env` baseado no `.env.example`:
```bash
cp .env.example .env
```

Preencha as seguintes variáveis:
- `VITE_FIREBASE_API_KEY`: Chave de API do seu projeto Firebase
- `VITE_FIREBASE_AUTH_DOMAIN`: Domínio de autenticação do Firebase
- `VITE_FIREBASE_PROJECT_ID`: ID do seu projeto Firebase
- `VITE_FIREBASE_STORAGE_BUCKET`: Bucket do Storage
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: ID do remetente do Firebase
- `VITE_FIREBASE_APP_ID`: ID do aplicativo Firebase

### Instalação

1. Instale as dependências:
```bash
npm install
```

2. Login no Firebase (necessário apenas uma vez):
```bash
firebase login
```

3. Inicialize os emuladores do Firebase para desenvolvimento:
```bash
npm run emulators
```

4. Em outro terminal, inicie o servidor de desenvolvimento:
```bash
npm run dev:firebase
```

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run dev:firebase` - Inicia o servidor com emuladores do Firebase
- `npm run build` - Gera o build de produção
- `npm run migrate` - Executa a migração de dados do Supabase para o Firebase
- `npm run emulators` - Inicia os emuladores do Firebase
- `npm run firebase:deploy` - Faz o deploy para o Firebase

### Estrutura do Projeto

O projeto utiliza:
- React 18 com TypeScript
- Vite para build e desenvolvimento
- Firebase para autenticação e banco de dados
- PWA para funcionalidades offline
- TailwindCSS para estilização
