# Brasilit Inspection App

Aplicativo de inspeção para os produtos da Brasilit, permitindo profissionais conduzirem vistorias em campo com ou sem conexão à internet.

## Tecnologias

- **Frontend:** React, TypeScript, Vite, TailwindCSS
- **Backend:** Supabase (PostgreSQL, API REST, Storage)
- **Autenticação:** Supabase Auth
- **Hosting:** Vercel (frontend), Supabase (backend)
- **Repositório:** GitHub

## Arquitetura

O projeto utiliza uma arquitetura moderna com foco em desempenho e experiência do usuário:

### Frontend

- **React com TypeScript**: Para uma codificação tipada e segura
- **Vite**: Build tool de alta performance 
- **TailwindCSS**: Framework CSS para UI responsiva
- **PWA (Progressive Web App)**: Suporte para instalação e uso offline
- **IndexedDB**: Banco de dados no navegador para persistência offline

### Backend (Supabase)

- **PostgreSQL**: Banco de dados relacional robusto
- **RLS (Row Level Security)**: Segurança em nível de linha
- **Supabase Storage**: Armazenamento de imagens e arquivos
- **API RESTful**: Para comunicação entre o cliente e o servidor

## Estrutura do Banco de Dados

### Principais tabelas:

- **users_profiles**: Perfis de usuários
- **clients**: Cadastro de clientes
- **inspections**: Vistorias realizadas
- **inspection_tiles**: Telhas vistoriadas
- **nonconformities**: Não conformidades encontradas
- **inspection_photos**: Registros fotográficos

## Funcionalidades Principais

1. **Gestão de Clientes**:
   - Cadastro de clientes
   - Visualização de histórico de vistorias por cliente

2. **Vistorias**:
   - Criação de novas vistorias
   - Registro de informações básicas da obra
   - Seleção de tipos de telhas
   - Documentação de não conformidades
   - Captura de fotos
   - Finalização e envio de relatórios

3. **Funcionamento Offline**:
   - Sincronização automática quando online
   - Armazenamento local de dados e imagens
   - Fila de sincronização para garantir a integridade dos dados

4. **Relatórios**:
   - Visualização de vistorias realizadas
   - Exportação de relatórios

## Como Executar o Projeto

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Conta no Supabase

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/brasilit-inspection-app.git
   cd brasilit-inspection-app
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env.local`
   - Preencha com suas credenciais do Supabase

4. Execute em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

### Estrutura de Diretórios

```
/
├── public/              # Arquivos públicos e ícones
├── src/                 # Código fonte
│   ├── assets/          # Recursos estáticos (imagens, etc)
│   ├── components/      # Componentes React reutilizáveis
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Bibliotecas e utilitários
│   ├── pages/           # Páginas da aplicação
│   └── main.tsx         # Ponto de entrada da aplicação
├── supabase/            # Migrações e configurações do Supabase
│   └── migrations/      # Migrações SQL
├── .env.example         # Exemplo de variáveis de ambiente
└── README.md            # Este arquivo
```

## Sincronização Offline

O aplicativo implementa um sistema robusto de sincronização para garantir que os dados coletados offline sejam enviados ao servidor quando o dispositivo estiver online novamente:

1. Os dados são armazenados localmente no IndexedDB
2. Uma fila de sincronização gerencia as operações pendentes
3. Quando a conexão é restaurada, os dados são enviados automaticamente
4. Múltiplas tentativas são feitas para garantir a entrega dos dados

## Testes

O projeto inclui testes para garantir a qualidade do código:

```bash
# Executar testes
npm test

# Executar testes com cobertura
npm run test:coverage
```

## Deployment

### Frontend (Vercel)

O frontend é hospedado no Vercel e se beneficia de:
- Integração contínua com o GitHub
- Preview deployments para pull requests
- Analytics integrado

### Backend (Supabase)

O backend é gerenciado pelo Supabase e inclui:
- Banco de dados PostgreSQL
- Storage para arquivos e imagens
- Políticas de segurança RLS

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Integration Guide (English)

This project integrates:
- Frontend: Vercel
- Backend: Supabase 
- Authentication: Clerk
- Version Control: GitHub
- Development: VSCode

### Environment Variables
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Required variables:
- `VITE_SUPABASE_URL`: URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do seu projeto Supabase

### Key Integration Points
1. **Frontend (Vercel) ↔ Supabase API**
   - Uses Supabase JavaScript client
   - Environment variables configured in Vercel

2. **Clerk Auth ↔ Supabase JWT**
   - JWT template configured in `src/lib/clerk.config.ts`
   - Token passed to Supabase via `ClerkSupabaseIntegration` component

3. **GitHub ↔ Vercel CI/CD**
   - Automatic deployments on push
   - Preview deployments for pull requests

### Development Workflow
1. Code in VSCode
2. Push to GitHub
3. Automatic deployment to Vercel
4. Database changes via Supabase migrations
