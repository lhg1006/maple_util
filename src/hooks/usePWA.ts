import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  canInstall: boolean;
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    isUpdateAvailable: false,
    canInstall: false,
  });

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Service Worker 등록 (임시 비활성화)
  useEffect(() => {
    console.log('Service Worker registration disabled for debugging');
    
    // 기존 서비스 워커 제거
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) {
          console.log('Unregistering service worker:', registration);
          registration.unregister();
        }
      });
    }
    
    // 브라우저 캐시 지우기
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      });
    }
  }, []);

  // PWA 설치 가능 여부 감지
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      setState(prev => ({ 
        ...prev, 
        isInstallable: true,
        canInstall: true 
      }));
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setState(prev => ({ 
        ...prev, 
        isInstalled: true,
        isInstallable: false,
        canInstall: false 
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 온라인/오프라인 상태 감지
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // PWA 설치 모드 감지
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (navigator as any).standalone ||
                        document.referrer.includes('android-app://');
    
    setState(prev => ({ ...prev, isInstalled: isStandalone }));
  }, []);

  // PWA 설치 실행
  const install = async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        setState(prev => ({ 
          ...prev, 
          isInstalled: true,
          isInstallable: false,
          canInstall: false 
        }));
        setInstallPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  };

  // Service Worker 업데이트
  const updateServiceWorker = () => {
    if (registration) {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  // 캐시 지우기
  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
      
      if (registration) {
        registration.update();
      }
      
      window.location.reload();
    }
  };

  // 오프라인 상태에서 사용 가능한 기능 확인
  const getOfflineCapabilities = () => {
    return {
      favorites: true, // localStorage 기반
      searchHistory: true, // localStorage 기반
      cachedData: state.isOnline || 'caches' in window,
      newData: state.isOnline,
    };
  };

  return {
    ...state,
    install,
    updateServiceWorker,
    clearCache,
    getOfflineCapabilities,
    registration,
  };
}