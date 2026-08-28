import React from 'react';
import { usePwa } from '../context/PwaContext';
import { WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineBanner() {
  const { isOnline } = usePwa();

  if (isOnline) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold shadow-lg flex items-center justify-between gap-3 sticky top-16 z-30 border-b border-amber-600/40"
      >
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
            <span>
              <strong>Offline Mode Active:</strong> You are currently disconnected from the internet. Viewing cached app shell.
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] bg-slate-950/10 px-2.5 py-1 rounded-full border border-slate-950/20 shrink-0">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Auto-reconnecting...</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
