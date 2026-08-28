import React, { createContext, useContext, useState, useEffect } from 'react';

const PwaContext = createContext(null);

export const PwaProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    // 1. Detect Standalone Mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };
    checkStandalone();

    // 2. Online / Offline Network Event Listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 3. BeforeInstallPrompt Event Interceptor
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger PWA Installation Prompt
  const installApp = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsStandalone(true);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.warn('[PWA] Prompt error:', err);
      }
    } else {
      // Fallback app launcher download
      const link = document.createElement('a');
      link.href = '/BusTrack3D.webmanifest';
      link.download = 'BusTrack3D.webmanifest';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Request Push Notification Permission on Demand (Non-Intrusive)
  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') {
      return { success: false, message: 'Push Notifications not supported on this browser.' };
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        return { success: true, message: 'Notifications enabled successfully!' };
      }
      return { success: false, message: 'Notification permission denied.' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <PwaContext.Provider
      value={{
        isOnline,
        isStandalone,
        canInstall: !!deferredPrompt && !isStandalone,
        installApp,
        notificationPermission,
        requestNotificationPermission
      }}
    >
      {children}
    </PwaContext.Provider>
  );
};

export const usePwa = () => {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error('usePwa must be used within a PwaProvider');
  }
  return context;
};
