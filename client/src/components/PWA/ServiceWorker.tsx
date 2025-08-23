import { useEffect, useState } from 'react';

// Use the built-in ServiceWorkerRegistration type

interface PWAState {
  isInstalled: boolean;
  isOnline: boolean;
  hasUpdate: boolean;
  isSupported: boolean;
}

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstalled: false,
    isOnline: navigator.onLine,
    hasUpdate: false,
    isSupported: 'serviceWorker' in navigator,
  });

  useEffect(() => {
    if (!pwaState.isSupported) return;

    let registration: ServiceWorkerRegistration | undefined = undefined;

    const registerServiceWorker = async () => {
      try {
        registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');

        // Check if app is installed
        if ('getInstalledRelatedApps' in navigator) {
          const relatedApps = await (navigator as any).getInstalledRelatedApps();
          setPwaState(prev => ({ ...prev, isInstalled: relatedApps.length > 0 }));
        }

        // Listen for updates
        if (registration) {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setPwaState(prev => ({ ...prev, hasUpdate: true }));
                }
              });
            }
          });
        }

        // Handle controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          setPwaState(prev => ({ ...prev, hasUpdate: false }));
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    // Handle online/offline status
    const handleOnline = () => setPwaState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setPwaState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    registerServiceWorker();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pwaState.isSupported]);

  const updateApp = async () => {
    if (pwaState.hasUpdate && 'serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }
  };

  const installApp = async () => {
    if ('beforeinstallprompt' in window) {
      const promptEvent = (window as any).deferredPrompt;
      if (promptEvent) {
        promptEvent.prompt();
        const result = await promptEvent.userChoice;
        if (result.outcome === 'accepted') {
          setPwaState(prev => ({ ...prev, isInstalled: true }));
        }
        (window as any).deferredPrompt = null;
      }
    }
  };

  return {
    ...pwaState,
    updateApp,
    installApp,
  };
};

// Component for PWA install prompt
export const PWAInstallPrompt: React.FC = () => {
  const { isInstalled, isSupported, installApp } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if ('beforeinstallprompt' in window) {
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        (window as any).deferredPrompt = e;
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  if (!isSupported || isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Install Wedding Replit</h3>
          <p className="text-sm opacity-90">Get quick access to your wedding planning tools</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowPrompt(false)}
            className="px-3 py-1 text-sm bg-blue-700 rounded hover:bg-blue-800 transition-colors"
          >
            Not now
          </button>
          <button
            onClick={() => {
              installApp();
              setShowPrompt(false);
            }}
            className="px-3 py-1 text-sm bg-white text-blue-600 rounded hover:bg-gray-100 transition-colors"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
};

// Component for update notification
export const PWAUpdatePrompt: React.FC = () => {
  const { hasUpdate, updateApp } = usePWA();

  if (!hasUpdate) return null;

  return (
    <div className="fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <div className="flex items-start space-x-3">
        <div className="flex-1">
          <h3 className="font-semibold">Update Available</h3>
          <p className="text-sm opacity-90">A new version is ready to install</p>
        </div>
        <button
          onClick={updateApp}
          className="px-3 py-1 text-sm bg-green-700 rounded hover:bg-green-800 transition-colors"
        >
          Update
        </button>
      </div>
    </div>
  );
};

// Offline indicator
export const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-2 text-center z-50">
      <p className="text-sm">You're currently offline. Some features may be limited.</p>
    </div>
  );
};
