const CACHE_NAME = 'maple-util-v1.0.0';
const STATIC_CACHE_NAME = 'maple-util-static-v1.0.0';
const API_CACHE_NAME = 'maple-util-api-v1.0.0';

// 캐시할 정적 파일들
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// 캐시할 API 패턴들
const API_PATTERNS = [
  /^https:\/\/maplestory\.io\/api\/KMS\/\d+\/(item|npc|mob|job|skill)\/\d+\/(icon|render)/,
  /^\/api\/(data|items|npcs|mobs|jobs|skills)/
];

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static files:', error);
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== API_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청 처리
  if (isAPIRequest(request.url)) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // 정적 파일 요청 처리
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
});

// API 요청 여부 확인
function isAPIRequest(url) {
  return API_PATTERNS.some(pattern => pattern.test(url));
}

// API 요청 처리 (Cache First + Network Fallback)
async function handleAPIRequest(request) {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Service Worker: Serving API from cache:', request.url);
      
      // 백그라운드에서 업데이트 시도
      fetch(request)
        .then(response => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
        })
        .catch(() => {
          // 네트워크 오류는 무시
        });
      
      return cachedResponse;
    }

    // 캐시에 없으면 네트워크에서 가져오기
    console.log('Service Worker: Fetching API from network:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      // 성공적인 응답만 캐시
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('Service Worker: API request failed:', error);
    
    // 오프라인 상태에서 기본 응답 반환
    return new Response(
      JSON.stringify({
        error: '오프라인 상태입니다. 인터넷 연결을 확인해주세요.',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
}

// 정적 파일 요청 처리 (Cache First)
async function handleStaticRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Service Worker: Serving static from cache:', request.url);
      return cachedResponse;
    }

    console.log('Service Worker: Fetching static from network:', request.url);
    const response = await fetch(request);
    
    if (response.ok && request.url.startsWith(self.location.origin)) {
      // 같은 오리진의 성공적인 응답만 캐시
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('Service Worker: Static request failed:', error);
    
    // 오프라인 페이지 반환 (있는 경우)
    const cache = await caches.open(STATIC_CACHE_NAME);
    const offlinePage = await cache.match('/');
    
    if (offlinePage) {
      return offlinePage;
    }
    
    // 기본 오프라인 응답
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>메이플스토리 데이터 뷰어</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #f0f2f5;
              color: #333;
            }
            .container {
              text-align: center;
              padding: 40px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .icon {
              font-size: 64px;
              margin-bottom: 16px;
            }
            h1 {
              color: #1890ff;
              margin-bottom: 16px;
            }
            button {
              background: #1890ff;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 16px;
              margin-top: 20px;
            }
            button:hover {
              background: #096dd9;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">📱</div>
            <h1>오프라인 상태</h1>
            <p>인터넷 연결을 확인한 후 다시 시도해주세요.</p>
            <p>일부 캐시된 데이터는 계속 사용할 수 있습니다.</p>
            <button onclick="window.location.reload()">다시 시도</button>
          </div>
        </body>
      </html>
      `,
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
}

// 메시지 이벤트 처리
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION',
      version: CACHE_NAME
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      event.ports[0].postMessage({
        type: 'CACHE_CLEARED'
      });
    });
  }
});

// 푸시 알림 처리 (미래 확장용)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || '새로운 업데이트가 있습니다!',
      icon: '/icon-192x192.png',
      badge: '/icon-96x96.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || '메이플스토리 데이터 뷰어',
        options
      )
    );
  }
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

console.log('Service Worker: Loaded');