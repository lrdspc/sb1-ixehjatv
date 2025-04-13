# Brasilit - Sistema de Vistorias

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/lrdspc/sb1-ixehjatv)

## Sobre o Projeto

Sistema de vistorias técnicas para coberturas, desenvolvido com React, TypeScript, Vite e Supabase. Implementado como um Progressive Web App (PWA) com funcionalidades offline.

## Tecnologias Utilizadas

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- PWA (vite-plugin-pwa)

## Configuração do Ambiente

### Pré-requisitos

- Node.js 18 ou superior
- npm ou yarn
- Conta no Supabase
- Conta na Vercel

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

## Integração com Supabase

O projeto utiliza o Supabase como backend. A estrutura do banco de dados inclui:

- `clients`: Informações dos clientes
- `inspections`: Dados das vistorias
- `inspection_tiles`: Telhas utilizadas nas vistorias
- `nonconformities`: Não conformidades encontradas
- `inspection_photos`: Fotos das vistorias

## Deploy com Vercel e GitHub

### Configuração do GitHub Actions

O projeto inclui um workflow de CI/CD no GitHub Actions que automatiza o processo de build e deploy para a Vercel.

Para configurar:

1. Adicione os seguintes secrets no seu repositório GitHub:
   - `VITE_SUPABASE_URL`: URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase
   - `VERCEL_TOKEN`: Token de API da Vercel
   - `VERCEL_ORG_ID`: ID da organização na Vercel
   - `VERCEL_PROJECT_ID`: ID do projeto na Vercel

2. Conecte seu repositório GitHub à Vercel:
   - Acesse [vercel.com](https://vercel.com)
   - Importe o repositório GitHub
   - Configure as variáveis de ambiente
   - Defina o framework como Vite

### Deploy Manual

Para fazer deploy manual:

```bash
npm run build
vercel --prod
```

## Recursos PWA

O aplicativo inclui recursos PWA como:
- Instalação na tela inicial
- Funcionalidade offline
- Indicador de status de conexão
- Notificação de atualizações disponíveis