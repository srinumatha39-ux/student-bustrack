import React from 'react';
import { motion } from 'framer-motion';
import { Bus, MapPin, Navigation } from 'lucide-react';

export default function BusAnimation({ type, onComplete }) {
  if (type === 'driver') {
    return (
      <div className="relative w-full max-w-lg mx-auto py-8 overflow-hidden">
        {/* Animated Road Track */}
        <div className="w-full h-12 bg-slate-800 rounded-2xl relative flex items-center overflow-hidden border-2 border-slate-700 shadow-inner">
          <div className="w-full h-0.5 border-b-2 border-dashed border-amber-400 opacity-80" />
          
          {/* Moving College Bus */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '180px' }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            onAnimationComplete={onComplete}
            className="absolute left-0 top-1.5 flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 px-3 py-1 rounded-xl shadow-lg font-bold text-xs"
          >
            <Bus className="w-5 h-5 text-slate-900 animate-bounce" />
            <span>COLLEGE BUS #101</span>
          </motion.div>
        </div>

        {/* Revealing Effect Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs font-semibold text-brand-600 mt-3 flex items-center justify-center gap-1.5"
        >
          <Navigation className="w-3.5 h-3.5 animate-spin" />
          Bus arriving at terminal... Driver panel revealing!
        </motion.div>
      </div>
    );
  }

  if (type === 'student') {
    return (
      <div className="relative w-full max-w-lg mx-auto py-8">
        {/* Animated Route Container */}
        <div className="relative w-full h-24 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-4 flex items-center justify-between shadow-inner">
          
          {/* Start Terminal */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
              A
            </div>
            <span className="text-[10px] font-semibold text-slate-600">Start Stop</span>
          </div>

          {/* Curved SVG Route Path */}
          <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 h-8">
            <svg className="w-full h-full overflow-visible">
              <path
                d="M 0 15 Q 120 -10 240 15"
                fill="transparent"
                stroke="#cbd5e1"
                strokeWidth="4"
                strokeDasharray="6 6"
              />
            </svg>
          </div>

          {/* Animated Bus traversing the path */}
          <motion.div
            initial={{ left: '10%', top: '50%' }}
            animate={{ left: '80%', top: '50%' }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
            onAnimationComplete={onComplete}
            className="absolute -translate-x-1/2 -translate-y-1/2 bg-amber-400 text-slate-900 p-2 rounded-xl shadow-lg border-2 border-amber-300 z-20"
          >
            <Bus className="w-5 h-5" />
          </motion.div>

          {/* GPS Destination Marker */}
          <div className="flex flex-col items-center gap-1 z-10">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [1, 1.2, 1], opacity: 1 }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30"
            >
              <MapPin className="w-5 h-5 fill-current" />
            </motion.div>
            <span className="text-[10px] font-bold text-rose-600">College Gate</span>
          </div>
        </div>

        {/* Revealing Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs font-semibold text-indigo-600 mt-3 flex items-center justify-center gap-1.5"
        >
          <MapPin className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
          Bus locked at GPS marker! Loading Student Portal...
        </motion.div>
      </div>
    );
  }

  return null;
}
