# Progressive Web App (PWA) - Brasilit Inspection App

Este documento descreve as funcionalidades PWA implementadas no Sistema de Vistorias Brasilit e como utilizá-las.

## Recursos PWA Implementados

- **Instalação como aplicativo**: Permite instalar o aplicativo na tela inicial de dispositivos móveis e desktops
- **Funcionamento offline**: Acesso ao aplicativo mesmo sem conexão com a internet
- **Sincronização em segundo plano**: Dados criados offline são sincronizados automaticamente quando a conexão é restabelecida
- **Atualizações automáticas**: Notificação quando novas versões estão disponíveis
- **Atalhos rápidos**: Acesso direto às principais funcionalidades através de atalhos
- **Splash screen**: Tela de carregamento personalizada
- **Notificações push**: Suporte para envio de notificações (requer implementação do backend)

## Como usar o modo PWA

### Desenvolvimento

Para executar o aplicativo em modo de desenvolvimento com recursos PWA ativados:

```bash
npm run pwa:dev
```

Este comando inicia o servidor de desenvolvimento com o plugin PWA ativado, permitindo testar recursos como instalação, service worker e cache.

### Build de produção

Para gerar uma build de produção otimizada para PWA:

```bash
npm run pwa:build
```

Este comando:
1. Gera todos os ícones necessários
2. Cria screenshots para o manifesto
3. Compila o aplicativo com configurações otimizadas para PWA
4. Configura o service worker para caching e funcionamento offline

### Análise de desempenho

Para analisar o tamanho dos bundles e otimizar o desempenho:

```bash
npm run analyze
```

Este comando gera um relatório visual do tamanho dos bundles em `dist/stats.html`.

## Estrutura de arquivos PWA

- `public/manifest.json`: Configuração do manifesto do PWA
- `public/sw.js`: Service worker personalizado
- `public/offline.html`: Página exibida quando offline
- `public/icons/`: Ícones em vários tamanhos
- `public/screenshots/`: Screenshots para o manifesto
- `public/splash/`: Splash screens para iOS
- `src/components/PWALifecycle.tsx`: Gerenciamento do ciclo de vida do PWA
- `src/components/UpdatePrompt.tsx`: Notificação de atualização disponível
- `src/components/ui/InstallPWA.tsx`: Prompt de instalação do aplicativo
- `src/components/ui/OfflineIndicator.tsx`: Indicador de status offline
- `scripts/convert-icons.js`: Script para gerar ícones
- `scripts/convert-screenshots.js`: Script para gerar screenshots

## Boas práticas implementadas

1. **Estratégias de cache otimizadas**:
   - Cache-first para recursos estáticos
   - Network-first para APIs e páginas de navegação
   - Stale-while-revalidate para outros recursos

2. **Experiência offline robusta**:
   - Detecção de status online/offline
   - Armazenamento local de dados
   - Sincronização automática quando online

3. **Desempenho otimizado**:
   - Code splitting para reduzir o tamanho inicial
   - Pré-carregamento de recursos críticos
   - Compressão e minificação de assets

4. **Instalação e atualizações**:
   - Prompt de instalação personalizado
   - Notificação de atualização disponível
   - Atualização automática do service worker

5. **Adaptação por plataforma**:
   - Instruções específicas para iOS/Android/Desktop
   - Splash screens para iOS
   - Ícones adaptáveis para Android

## Testes e validação

Para validar a implementação do PWA, utilize as seguintes ferramentas:

1. **Lighthouse**: Ferramenta do Chrome DevTools para avaliar PWAs
   - Abra o DevTools (F12)
   - Vá para a aba "Lighthouse"
   - Selecione "Progressive Web App" e execute o teste

2. **PWA Builder**: https://www.pwabuilder.com/
   - Cole a URL do seu aplicativo para analisar e receber recomendações

3. **Chrome DevTools**:
   - Aba "Application" > "Service Workers" para gerenciar o service worker
   - "Application" > "Manifest" para verificar o manifesto
   - "Application" > "Cache Storage" para inspecionar o cache

## Solução de problemas

### Service Worker não atualiza

1. Abra o DevTools (F12)
2. Vá para Application > Service Workers
3. Marque "Update on reload" e recarregue a página

### Problemas de cache

Para limpar o cache e forçar uma nova instalação:

1. DevTools > Application > Cache Storage
2. Clique com o botão direito em cada cache e selecione "Delete"
3. Application > Service Workers > Unregister
4. Recarregue a página

### Problemas de instalação

Se o prompt de instalação não aparecer:
1. Verifique se o manifesto está correto
2. Certifique-se de que o site está sendo servido via HTTPS
3. Verifique se o aplicativo já não está instalado
