import React from 'react';
import { motion } from 'framer-motion';

export default function Bus3DRealGraphic({ className = '', isMoving = true, wheelsSpinning = true }) {
  return (
    <div className={`relative inline-block ${className}`}>
      <motion.svg
        viewBox="0 0 320 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={isMoving ? { y: [0, -4, 0] } : {}}
        transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
        className="w-full h-full drop-shadow-[0_20px_25px_rgba(0,0,0,0.3)]"
      >
        {/* Soft Ground Shadow */}
        <ellipse cx="160" cy="165" rx="130" ry="12" fill="#020617" opacity="0.4" />

        {/* Glossy Yellow Cartoon 3D Chassis */}
        <path
          d="M 40 50 C 40 35, 60 30, 90 30 L 250 30 C 270 30, 285 45, 290 65 L 295 125 C 295 138, 285 145, 270 145 L 50 145 C 40 145, 40 135, 40 125 Z"
          fill="url(#busBodyGradient)"
          stroke="#0f172a"
          strokeWidth="4"
        />

        {/* White "COLLEGE BUS" Top Signboard */}
        <rect x="100" y="16" width="110" height="20" rx="6" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
        <rect x="104" y="20" width="102" height="12" rx="3" fill="#0f172a" />
        <text x="155" y="29" fill="#fef08a" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing="1">
          COLLEGE BUS
        </text>

        {/* Black Lower Bumper & Trim */}
        <path d="M 40 125 L 295 125 C 295 138, 285 145, 270 145 L 50 145 C 40 145, 40 135, 40 125 Z" fill="#1e293b" />
        <rect x="35" y="132" width="265" height="14" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="2" />

        {/* Front Hood Rounded Nose */}
        <path d="M 270 75 C 290 75, 305 90, 305 110 L 305 132 L 270 132 Z" fill="url(#hoodGradient)" stroke="#0f172a" strokeWidth="4" />

        {/* Front Chrome Grille */}
        <rect x="290" y="102" width="16" height="24" rx="3" fill="#334155" stroke="#0f172a" strokeWidth="2" />
        <line x1="293" y1="107" x2="303" y2="107" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="293" y1="114" x2="303" y2="114" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="293" y1="121" x2="303" y2="121" stroke="#cbd5e1" strokeWidth="2" />

        {/* Black Side Stripe */}
        <rect x="40" y="92" width="240" height="12" fill="#0f172a" />

        {/* Glass Tinted Windows Row */}
        <rect x="55" y="48" width="200" height="36" rx="8" fill="#0f172a" />

        {/* Window Panes with Sky Reflections & Passengers */}
        <rect x="60" y="52" width="38" height="28" rx="5" fill="url(#windowGlass)" />
        <circle cx="79" cy="66" r="6" fill="#0284c7" /> {/* Passenger Silhouette */}

        <rect x="104" y="52" width="38" height="28" rx="5" fill="url(#windowGlass)" />
        <circle cx="123" cy="66" r="6" fill="#0284c7" />

        <rect x="148" y="52" width="38" height="28" rx="5" fill="url(#windowGlass)" />
        <circle cx="167" cy="66" r="6" fill="#0284c7" />

        {/* Front Slanted Windshield */}
        <path d="M 192 52 L 245 52 C 255 52, 262 60, 260 70 L 255 80 L 192 80 Z" fill="url(#windshieldGlass)" />

        {/* Side Rear-View Mirror */}
        <path d="M 252 65 L 268 62 L 268 76 L 252 70 Z" fill="#0f172a" />
        <rect x="266" y="60" width="6" height="20" rx="2" fill="#475569" />

        {/* Round Chrome LED Headlights */}
        <circle cx="295" cy="112" r="10" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
        <circle cx="295" cy="112" r="6" fill="#fef08a" />
        
        {/* Headlight Beam Cone */}
        {isMoving && (
          <polygon points="300,105 340,90 340,135 300,120" fill="#fef08a" opacity="0.35" />
        )}

        {/* Rear Bumper Tow Hitch Anchor Ring */}
        <circle cx="35" cy="138" r="6" fill="#94a3b8" stroke="#0f172a" strokeWidth="2" />
        <circle cx="35" cy="138" r="3" fill="#0f172a" />

        {/* 3D Wheel 1 (Rear Wheel) */}
        <g>
          <circle cx="95" cy="142" r="22" fill="#0f172a" stroke="#ffffff" strokeWidth="3" />
          <motion.circle
            cx="95"
            cy="142"
            r="12"
            fill="url(#rimGradient)"
            stroke="#0f172a"
            strokeWidth="3"
            strokeDasharray="6 6"
            animate={wheelsSpinning ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
            style={{ transformOrigin: '95px 142px' }}
          />
        </g>

        {/* 3D Wheel 2 (Front Wheel) */}
        <g>
          <circle cx="225" cy="142" r="22" fill="#0f172a" stroke="#ffffff" strokeWidth="3" />
          <motion.circle
            cx="225"
            cy="142"
            r="12"
            fill="url(#rimGradient)"
            stroke="#0f172a"
            strokeWidth="3"
            strokeDasharray="6 6"
            animate={wheelsSpinning ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
            style={{ transformOrigin: '225px 142px' }}
          />
        </g>

        {/* SVG Gradients for 3D Glossy Finish */}
        <defs>
          <linearGradient id="busBodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <linearGradient id="hoodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          <linearGradient id="windowGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <linearGradient id="windshieldGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          <linearGradient id="rimGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
        </defs>
      </motion.svg>
    </div>
  );
}
