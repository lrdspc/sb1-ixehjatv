# Configuração do Firebase

## Pré-requisitos

1. Node.js 20.x ou superior
2. Conta no Firebase (https://firebase.google.com)
3. Firebase CLI instalado (`npm install -g firebase-tools`)

## Configuração Inicial

1. Faça login no Firebase CLI:
```bash
firebase login
```

2. Crie um novo projeto no Console do Firebase ou use um existente

3. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

4. Preencha as variáveis de ambiente no arquivo `.env` com as credenciais do seu projeto Firebase

## Desenvolvimento Local

1. Instale as dependências:
```bash
npm install
```

2. Inicie os emuladores do Firebase:
```bash
firebase emulators:start
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Implantação

1. Faça o build do projeto:
```bash
npm run build
```

2. Implante no Firebase Hosting:
```bash
firebase deploy
```

## Estrutura do Firebase

### Authentication
- Email/Password
- Google Provider (opcional)

### Firestore Collections
- users_profiles
- inspections
- clients
- inspection_tiles
- nonconformities
- inspection_photos

### Storage Buckets
- /inspections - Fotos das inspeções
- /users - Fotos de perfil dos usuários
- /clients - Documentos dos clientes

## Regras de Segurança

As regras de segurança estão definidas em:
- `firestore.rules` - Regras do Firestore
- `storage.rules` - Regras do Storage

## Emuladores

Os seguintes emuladores estão configurados:
- Authentication (porta 9099)
- Firestore (porta 8080)
- Storage (porta 9199)
- Hosting (porta 5000)

Para acessar a UI dos emuladores, visite: http://localhost:4000
