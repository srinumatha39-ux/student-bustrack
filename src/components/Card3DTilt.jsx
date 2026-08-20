import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Card3DTilt({ children, className = '', depth = 20, onClick }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rx = ((y - centerY) / centerY) * -12; // Rotate X axis
    const ry = ((x - centerX) / centerX) * 12;  // Rotate Y axis

    setRotateX(rx);
    setRotateY(ry);

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlarePos({ x: glareX, y: glareY, opacity: 0.25 });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <motion.div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX,
        rotateY,
        transformPerspective: 1000
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{
        transformStyle: 'preserve-3d'
      }}
      className={`relative overflow-hidden transition-shadow duration-300 ${className}`}
    >
      {/* 3D Content Container */}
      <div style={{ transform: `translateZ(${depth}px)` }}>
        {children}
      </div>

      {/* Dynamic 3D Glare Light Reflection */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 rounded-3xl"
        style={{
          opacity: glarePos.opacity,
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)`
        }}
      />
    </motion.div>
  );
}
