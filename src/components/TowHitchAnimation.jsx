import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Bus3DRealGraphic from './Bus3DRealGraphic';
import { SkipForward, ArrowLeft } from 'lucide-react';

export default function TowHitchAnimation({ type, onBack, children }) {
  const prefersReducedMotion = useReducedMotion();
  const [isSkipped, setIsSkipped] = useState(false);
  const [animationStep, setAnimationStep] = useState('driving'); // 'driving' | 'settled'

  useEffect(() => {
    if (prefersReducedMotion) {
      setAnimationStep('settled');
    }
  }, [prefersReducedMotion]);

  const handleSkip = () => {
    setIsSkipped(true);
    setAnimationStep('settled');
  };

  const handleDriveComplete = () => {
    setAnimationStep('settled');
  };

  if (isSkipped || prefersReducedMotion) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md mx-auto relative z-30"
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
      
      {/* Top Header Bar for Clean Overlay */}
      <div className="sticky top-2 sm:top-4 left-0 right-0 w-full max-w-4xl mx-auto z-50 flex items-center justify-between pointer-events-auto px-2 mb-4 shrink-0">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portals</span>
        </button>

        <button
          onClick={handleSkip}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-colors shadow-lg"
        >
          <span>Skip Animation</span>
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {animationStep === 'driving' ? (
        /* Driving Animation Phase */
        <div className="my-auto w-full flex items-center justify-center">
          <motion.div
            initial={{ x: '-100vw' }}
            animate={{ x: '0vw' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={handleDriveComplete}
            className="relative flex items-center gap-0 z-30 pointer-events-auto"
          >
            {/* Hitched Login Card */}
            <div className="w-full max-w-md shrink-0 opacity-95 scale-95 shadow-2xl pointer-events-none z-10">
              {children}
            </div>

            {/* Tow Cable Visual */}
            <div className="relative -ml-4 -mr-4 flex items-center z-20">
              <div className="w-16 sm:w-24 h-2.5 bg-gradient-to-r from-slate-400 via-amber-400 to-slate-400 rounded-full border border-slate-950 shadow-lg animate-pulse" />
              <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-slate-950 shadow-xl -ml-2" />
            </div>

            {/* 3D College Bus */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-64 sm:w-80 shrink-0 z-30"
            >
              <Bus3DRealGraphic isMoving={true} wheelsSpinning={true} />
            </motion.div>
          </motion.div>
        </div>
      ) : (
        /* Settled Phase: Clean Centered Login Card with smooth vertical scrolling */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md mx-auto my-auto z-40 pointer-events-auto max-h-[85vh] overflow-y-auto pr-1"
        >
          {children}
        </motion.div>
      )}

    </div>
  );
}
