import React from 'react';
import { motion } from 'framer-motion';

export default function CartoonBus({ size = 'md', className = '', isDriving = true }) {
  const dimensions = {
    sm: 'w-10 h-8',
    md: 'w-20 h-14',
    lg: 'w-36 h-24',
    xl: 'w-56 h-36'
  }[size] || 'w-20 h-14';

  return (
    <div className={`relative inline-block ${dimensions} ${className}`}>
      <motion.svg
        viewBox="0 0 200 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={isDriving ? { y: [0, -3, 0] } : {}}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
        className="w-full h-full drop-shadow-lg"
      >
        {/* Exhaust Smoke Clouds if Driving */}
        {isDriving && (
          <g>
            <motion.circle
              cx="10"
              cy="95"
              r="6"
              fill="#cbd5e1"
              opacity="0.8"
              animate={{ cx: [-5, -25], cy: [95, 90], r: [6, 12], opacity: [0.8, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            />
            <motion.circle
              cx="15"
              cy="92"
              r="4"
              fill="#e2e8f0"
              opacity="0.6"
              animate={{ cx: [-2, -20], cy: [92, 85], r: [4, 9], opacity: [0.6, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
            />
          </g>
        )}

        {/* Bus Shadow */}
        <ellipse cx="105" cy="115" rx="80" ry="8" fill="#0f172a" opacity="0.3" />

        {/* Main Cartoon Bus Body (Yellow/Amber) */}
        <rect x="25" y="25" width="150" height="75" rx="20" fill="#f59e0b" stroke="#0f172a" strokeWidth="4" />
        
        {/* Roof White Cap */}
        <rect x="30" y="20" width="140" height="12" rx="6" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />

        {/* Top Destination Sign ("COLLEGE EXPRESS") */}
        <rect x="65" y="10" width="70" height="15" rx="5" fill="#0f172a" />
        <text x="100" y="21" fill="#fef08a" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
          COLLEGE BUS
        </text>

        {/* Front Hood Curve Nose */}
        <path d="M175 60 C185 60 190 75 190 85 L190 95 L175 95 Z" fill="#d97706" stroke="#0f172a" strokeWidth="4" />

        {/* Black Side Racing Stripe */}
        <rect x="25" y="68" width="155" height="10" fill="#0f172a" />

        {/* Windows Frame */}
        <rect x="35" y="38" width="130" height="26" rx="6" fill="#0f172a" />

        {/* Glass Windows (Sky Blue) & Passengers */}
        <rect x="39" y="42" width="26" height="18" rx="4" fill="#38bdf8" />
        <circle cx="52" cy="51" r="4" fill="#0284c7" /> {/* Passenger 1 */}

        <rect x="70" y="42" width="26" height="18" rx="4" fill="#38bdf8" />
        <circle cx="83" cy="51" r="4" fill="#0284c7" /> {/* Passenger 2 */}

        <rect x="101" y="42" width="26" height="18" rx="4" fill="#38bdf8" />
        <circle cx="114" cy="51" r="4" fill="#0284c7" /> {/* Passenger 3 */}

        {/* Front Windshield */}
        <path d="M132 42 L160 42 C164 42 167 46 166 50 L163 60 L132 60 Z" fill="#7dd3fc" />

        {/* Glowing Headlight */}
        <circle cx="184" cy="85" r="7" fill="#fef08a" stroke="#0f172a" strokeWidth="3" />
        <circle cx="184" cy="85" r="4" fill="#ffffff" />
        
        {/* Headlight Beam Cone */}
        {isDriving && (
          <polygon points="188,80 215,70 215,100 188,90" fill="#fef08a" opacity="0.35" />
        )}

        {/* Front Bumper & License Plate */}
        <rect x="175" y="93" width="18" height="8" rx="2" fill="#475569" stroke="#0f172a" strokeWidth="2" />
        <rect x="180" y="95" width="8" height="4" fill="#ffffff" />

        {/* Left Wheel */}
        <g>
          <circle cx="60" cy="100" r="16" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
          <motion.circle
            cx="60"
            cy="100"
            r="8"
            fill="#94a3b8"
            stroke="#0f172a"
            strokeWidth="3"
            strokeDasharray="4 4"
            animate={isDriving ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{ transformOrigin: '60px 100px' }}
          />
        </g>

        {/* Right Wheel */}
        <g>
          <circle cx="140" cy="100" r="16" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
          <motion.circle
            cx="140"
            cy="100"
            r="8"
            fill="#94a3b8"
            stroke="#0f172a"
            strokeWidth="3"
            strokeDasharray="4 4"
            animate={isDriving ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{ transformOrigin: '140px 100px' }}
          />
        </g>
      </motion.svg>
    </div>
  );
}
