const CACHE_NAME = 'alerta-vigia-v4'; // Versão do cache atualizada
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx', // Adicionado para cachear o script principal
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', // Adicionado para PDF offline
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js' // Adicionado para PDF offline
];

// Evento de Instalação: Cacheia os arquivos principais do app
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto e arquivos principais sendo cacheados.');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Falha ao adicionar arquivos ao cache:', err))
  );
});

// Evento de Ativação: Limpa caches antigos
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Evento de Fetch: Intercepta requisições e serve do cache se disponível, ignorando API calls.
self.addEventListener('fetch', event => {
  const supabaseUrl = 'https://hrubgwggnnxyqeomhhyc.supabase.co';

  // Ignora requisições que não são GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Para chamadas à API do Supabase, sempre use a rede para obter dados atualizados.
  if (event.request.url.startsWith(supabaseUrl)) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Para outros recursos, usa a estratégia "Cache-First"
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // Retorna a resposta do cache
          return response;
        }

        // Se não estiver no cache, busca na rede
        return fetch(event.request).then(
          networkResponse => {
            // Verifica se recebemos uma resposta válida
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Clona a resposta. Uma resposta é um stream e só pode ser consumida uma vez.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Adiciona a nova resposta ao cache
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      }).catch(error => {
        console.log('Fetch falhou; o app pode estar offline.', error);
        // Opcional: retornar uma página offline customizada
        // return caches.match('/offline.html');
      })
  );
});