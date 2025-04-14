import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carregar variáveis de ambiente com base no modo
  const env = loadEnv(mode, process.cwd(), '');
  const isPWA = mode === 'pwa';
  
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'Brasilit - Sistema de Vistorias',
          short_name: 'Brasilit',
          description: 'Sistema de vistorias técnicas para coberturas',
          theme_color: '#2563eb',
          background_color: '#f3f4f6',
          display: 'standalone',
          orientation: 'any',
          start_url: '/?source=pwa',
          scope: '/',
          categories: ["business", "productivity", "utilities"],
          icons: [
            {
              src: '/icons/icon-72x72.png',
              sizes: '72x72',
              type: 'image/png'
            },
            {
              src: '/icons/icon-96x96.png',
              sizes: '96x96',
              type: 'image/png'
            },
            {
              src: '/icons/icon-128x128.png',
              sizes: '128x128',
              type: 'image/png'
            },
            {
              src: '/icons/icon-144x144.png',
              sizes: '144x144',
              type: 'image/png'
            },
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icons/icon-384x384.png',
              sizes: '384x384',
              type: 'image/png'
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ],
          screenshots: [
            {
              src: '/screenshots/desktop.png',
              sizes: '1280x720',
              type: 'image/png',
              form_factor: 'wide',
              label: 'Tela principal do sistema'
            },
            {
              src: '/screenshots/mobile.png',
              sizes: '750x1334', 
              type: 'image/png',
              form_factor: 'narrow',
              label: 'Versão mobile'
            }
          ],
          shortcuts: [
            {
              name: 'Nova Vistoria',
              url: '/new-inspection',
              description: 'Iniciar nova vistoria',
              icons: [
                {
                  src: '/icons/shortcut-inspection.png',
                  sizes: '96x96'
                }
              ]
            },
            {
              name: 'Relatórios',
              url: '/reports',
              description: 'Visualizar relatórios',
              icons: [
                {
                  src: '/icons/shortcut-reports.png',
                  sizes: '96x96'
                }
              ]
            },
            {
              name: 'Clientes',
              url: '/clients',
              description: 'Gerenciar clientes',
              icons: [
                {
                  src: '/icons/shortcut-clients.png',
                  sizes: '96x96'
                }
              ]
            }
          ],
          related_applications: [
            {
              platform: 'webapp',
              url: 'https://brasilit-inspection.vercel.app/manifest.json'
            }
          ],
          prefer_related_applications: false
        },
        devOptions: {
          enabled: isPWA,
          type: 'module',
          navigateFallback: 'index.html'
        },
        workbox: {
          // Configuração para caching
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,json,woff,woff2,ttf,eot}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 dias
                }
              }
            },
            {
              // Cache da API Supabase
              urlPattern: new RegExp('^' + env.VITE_SUPABASE_URL),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 // 24 horas
                },
                networkTimeoutSeconds: 10,
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // Estratégia para navegação
              urlPattern: /\/(?:new-inspection|reports|clients|settings|profile)\/?$/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'navigation-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 // 24 horas
                }
              }
            },
            {
              // Fallback para navegação offline
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'pages-cache',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 // 24 horas
                },
                networkTimeoutSeconds: 5
              }
            }
          ],
          // Configurações avançadas do Workbox
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          navigateFallback: '/offline.html',
          navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]
        }
      })
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
    },
    build: {
      // Configurações de build otimizadas
      target: 'esnext',
      outDir: 'dist',
      assetsDir: 'assets',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: !isPWA, // Manter console.logs no modo PWA para debug
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              'react', 
              'react-dom', 
              'react-router-dom'
            ],
            supabase: ['@supabase/supabase-js'],
            ui: ['lucide-react', 'framer-motion']
          }
        },
        // Excluir explicitamente qualquer código relacionado ao Clerk
        external: [
          /@clerk\/.*/, 
          /clerk.*/
        ]
      },
      // Melhorar análise de build
      reportCompressedSize: true,
      chunkSizeWarningLimit: 1000,
      // Gerar source maps em desenvolvimento e modo PWA
      sourcemap: mode === 'development' || isPWA
    },
    server: {
      port: 5173,
      strictPort: false,
      open: true,
      // Otimização para desenvolvimento
      hmr: {
        overlay: true
      }
    },
    preview: {
      port: 4173
    }
  };
});
