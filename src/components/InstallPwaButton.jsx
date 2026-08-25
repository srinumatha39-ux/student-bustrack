import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Check if app is already running in PWA standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowBanner(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      // Fallback instruction for iOS / Safari / Unsupported desktop prompt
      alert('📲 To install this PWA App:\n1. Tap the Share/Menu button in your browser.\n2. Tap "Add to Home Screen" or "Install App".');
    }
  };

  if (isInstalled || !showBanner) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-5 right-5 z-50 max-w-xs sm:max-w-sm"
      >
        <div className="relative group bg-slate-900/95 backdrop-blur-2xl p-4 rounded-3xl border-2 border-amber-400 shadow-2xl shadow-amber-500/30 text-white flex items-center gap-3.5">
          
          {/* Close button */}
          <button
            onClick={() => setShowBanner(false)}
            className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white border border-slate-700 shadow-md transition-colors"
            title="Dismiss Install Prompt"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Animated App Icon */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30 animate-pulse">
            <Smartphone className="w-6 h-6 stroke-[2.5]" />
          </div>

          {/* Text Info & Action Button */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-white tracking-tight">
                Install BusTrack 3D
              </span>
              <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                PWA
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-tight">
              Add to Home Screen for fast offline tracking & full-screen mode!
            </p>

            <button
              onClick={handleInstallClick}
              className="mt-2 w-full py-2 px-3 rounded-xl text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/30 transition-all flex items-center justify-center gap-1.5 group-hover:scale-105"
            >
              <Download className="w-3.5 h-3.5 animate-bounce" />
              <span>INSTALL APP NOW</span>
            </button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
